const app = getApp();

Page({
  data: {
    roomName: '',
    tableFee: 0,
    isCreating: false,
    isOfflineMode: false,
    showQRCode: false,
    qrCodeUrl: '',
    roomId: '',
    players: [
      { position: 0, openId: '', nickName: '等待加入...', avatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132' },
      { position: 1, openId: '', nickName: '等待加入...', avatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132' },
      { position: 2, openId: '', nickName: '等待加入...', avatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132' },
      { position: 3, openId: '', nickName: '等待加入...', avatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132' }
    ]
  },

  onLoad() {
    this.generateRoomName();
    this.checkNetworkStatus();
  },

  async checkNetworkStatus() {
    try {
      const res = await wx.cloud.callFunction({ name: 'getOpenId' });
      this.setData({ isOfflineMode: false });
    } catch (error) {
      console.error('云函数连接失败，启用离线模式:', error);
      this.setData({ isOfflineMode: true });
    }
  },

  generateRoomName() {
    const date = new Date();
    const timeStr = `${date.getMonth() + 1}月${date.getDate()}日`;
    const randomNum = Math.floor(Math.random() * 1000);
    const roomName = `${timeStr}麻将室${randomNum}`;
    this.setData({ roomName });
  },

  onRoomNameInput(e) {
    this.setData({ roomName: e.detail.value });
  },

  onTableFeeInput(e) {
    const value = e.detail.value;
    if (value < 0) return;
    this.setData({ tableFee: Number(value) || 0 });
  },

  async createRoom() {
    if (this.data.isCreating) return;

    if (!this.data.roomName.trim()) {
      wx.showToast({
        title: '请输入房间名称',
        icon: 'none'
      });
      return;
    }

    this.setData({ isCreating: true });

    try {
      // 获取用户信息
      const userInfo = await app.getUserProfile();
      if (!userInfo) {
        wx.showToast({
          title: '需要获取用户信息',
          icon: 'none'
        });
        this.setData({ isCreating: false });
        return;
      }

      // 更新玩家列表，将创建者设为第一个玩家
      const players = this.data.players.map((player, index) => {
        if (index === 0) {
          return {
            position: 0,
            openId: userInfo.openid,
            nickName: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl
          };
        }
        return player;
      });

      const room = {
        name: this.data.roomName,
        tableFee: this.data.tableFee,
        players,
        totalScores: [0, 0, 0, 0], // 初始化每个位置的总分
        games: [],
        isOffline: this.data.isOfflineMode,
        isEnded: false,
        createTime: new Date()
      };

      let roomId;
      if (!this.data.isOfflineMode) {
        try {
          const res = await wx.cloud.callFunction({
            name: 'createRoom',
            data: { room }
          });

          if (!res.result.success) {
            wx.showToast({
              title: res.result.error || '创建房间失败',
              icon: 'none',
              duration: 2000
            });
            this.setData({ isCreating: false });
            return;
          }
          
          roomId = res.result.roomId;
          room._id = roomId; // 保存云数据库的_id
        } catch (error) {
          console.error('云函数创建房间失败，切换到离线模式:', error);
          this.setData({ isOfflineMode: true });
          roomId = this.generateRoomId();
          room.id = roomId;
        }
      } else {
        roomId = this.generateRoomId();
        room.id = roomId;
      }

      const rooms = wx.getStorageSync('mahjong_rooms') || [];
      rooms.unshift(room);
      wx.setStorageSync('mahjong_rooms', rooms);

      this.setData({ roomId });

      if (!this.data.isOfflineMode) {
        this.generateQRCode(roomId);
      } else {
        wx.showToast({
          title: '离线模式下不支持生成二维码',
          icon: 'none'
        });
        wx.redirectTo({
          url: `/pages/mahjong/room/detail?roomId=${roomId}`
        });
      }
    } catch (error) {
      console.error('创建房间失败:', error);
      wx.showToast({
        title: error.message || '创建房间失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ isCreating: false });
    }
  },

  generateRoomId() {
    return 'R' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  },

  generateQRCode(roomId) {
    if (this.data.isOfflineMode) {
      wx.showToast({
        title: '离线模式下不支持生成二维码',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '生成邀请码中' });
    
    wx.cloud.callFunction({
      name: 'generateRoomQRCode',
      data: { roomId },
      success: (res) => {
        if (res.result && res.result.success && res.result.fileID) {
          this.setData({ 
            qrCodeUrl: res.result.fileID,
            showQRCode: true 
          });
          wx.hideLoading();
        } else {
          console.error('生成二维码失败:', res.result.error || '未知错误');
          this.handleQRCodeError();
        }
      },
      fail: (error) => {
        console.error('调用生成二维码云函数失败:', error);
        this.handleQRCodeError();
      }
    });
  },

  handleQRCodeError() {
    wx.hideLoading();
    wx.showToast({
      title: '生成邀请码失败',
      icon: 'none',
      duration: 2000
    });
    // 延迟跳转到房间详情页
    setTimeout(() => {
      wx.redirectTo({
        url: `/pages/mahjong/room/detail?roomId=${this.data.roomId}`
      });
    }, 2000);
  },

  onShareAppMessage() {
    if (this.data.isOfflineMode || !this.data.roomId) {
      return {
        title: '离线模式下不支持分享',
        path: '/pages/index/index'
      };
    }

    return {
      title: `邀请你加入${this.data.roomName}`,
      path: `/pages/mahjong/room/invite?roomId=${this.data.roomId}`,
      imageUrl: this.data.qrCodeUrl || ''
    };
  },

  enterRoom() {
    wx.redirectTo({
      url: `/pages/mahjong/room/detail?roomId=${this.data.roomId}`
    });
  }
});