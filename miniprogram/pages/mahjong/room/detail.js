const app = getApp();

Page({
  data: {
    roomId: '',
    room: null,
    isOfflineMode: false,
    isLoading: true,
    currentScores: ['', '', '', ''],
    canSubmit: false,
    showScoreInput: false,
    selectedGameIndex: -1,
    canManagePlayers: false
  },

  async onLoad(options) {
    const { roomId } = options;
    if (!roomId) {
      wx.showToast({
        title: '房间ID无效',
        icon: 'none'
      });
      wx.navigateBack();
      return;
    }

    await this.loadRoomData(roomId);
    this.checkManagePermission();
  },

  async loadRoomData(roomId) {
    this.setData({ isLoading: true });
    try {
      const res = await wx.cloud.callFunction({
        name: 'getRoomInfo',
        data: { roomId },
        timeout: 2000
      });
      
      if (res.result.success) {
        this.setData({
          roomId: res.result.room.roomId,
          room: res.result.room,
          isOfflineMode: false
        });
      } else {
        throw new Error('获取房间数据失败');
      }
    } catch (error) {
      console.error('获取房间数据失败，使用本地数据:', error);
      const rooms = wx.getStorageSync('mahjong_rooms') || [];
      const room = rooms.find(r => r.id === roomId);
      
      if (room) {
        this.setData({
          room,
          isOfflineMode: true
        });
      } else {
        wx.showToast({
          title: '房间不存在',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    } finally {
      this.setData({ isLoading: false });
    }
  },

  createNewGame() {
    if (this.data.room.isEnded) {
      wx.showToast({
        title: '房间已结束计分',
        icon: 'none'
      });
      return;
    }

    if (!this.data.room.players || this.data.room.players.filter(item=> item.openId).length !== 4) {
      wx.showToast({
        title: '需要4个玩家才能开始游戏',
        icon: 'none'
      });
      return;
    }

    const games = this.data.room.games || [];
    const newGame = {
      scores: [0, 0, 0, 0]
    };

    games.push(newGame);
    this.setData({
      selectedGameIndex: games.length - 1,
      showScoreInput: true,
      currentScores: ['', '', '', ''],
      canSubmit: false
    });
  },
  closeModal(){
    this.setData({
      showScoreInput: false,
    });
  },

  onScoreInput(e) {
    const { index } = e.currentTarget.dataset;
    const value = e.detail.value;
    const currentScores = [...this.data.currentScores];
    currentScores[index] = value;

    // 检查是否已经输入了三个分数
    const filledScores = currentScores.filter(score => score !== '');
    if (filledScores.length === 3) {
      // 找到未填写的位置
      const emptyIndex = currentScores.findIndex(score => score === '');
      if (emptyIndex !== -1) {
        // 计算第四个位置的分数（总和应该为0）
        const sum = currentScores.reduce((acc, score) => 
          acc + (score === '' ? 0 : Number(score)), 0);
        currentScores[emptyIndex] = (-sum).toString();
      }
    }

    // 检查是否所有分数都已填写且有效
    const validation = this.validateScores(currentScores);
    this.setData({ 
      currentScores,
      canSubmit: validation.isValid
    });

    if (!validation.isValid && currentScores.every(score => score !== '')) {
      wx.showToast({
        title: validation.message,
        icon: 'none'
      });
    }
  },

  validateScores(scores) {
    if (scores.some(score => score === '')) {
      return { isValid: false, message: '请填写所有玩家的分数' };
    }
    
    const numbers = scores.map(Number);
    if (numbers.some(isNaN)) {
      return { isValid: false, message: '请输入有效的数字' };
    }
    
    const sum = numbers.reduce((a, b) => a + b, 0);
    if (Math.abs(sum) >= 0.01) {
      return { isValid: false, message: '所有玩家分数之和必须为0' };
    }

    return { isValid: true };
  },

  async submitScores() {
    if (!this.data.canSubmit) return;
    const scores = this.data.currentScores.map(Number);

    if (!this.data.isOfflineMode) {
      try {
        await wx.cloud.callFunction({
          name: 'createGame',
          data: {
            roomId: this.data.room.roomId,
            scores: scores
          },
          timeout: 2000
        });
      } catch (error) {
        console.error('更新房间失败，切换到离线模式:', error);
        this.setData({ isOfflineMode: true });
      }
    }

    this.loadRoomData( this.data.room.roomId);

    this.closeModal();
  },

  async updateRoom(updates) {
    const room = { ...this.data.room, ...updates };

    if (!this.data.isOfflineMode) {
      try {
        await wx.cloud.callFunction({
          name: 'updateRoom',
          data: { 
            roomId: this.data.room.roomId,
            updates
          },
          timeout: 2000
        });
      } catch (error) {
        console.error('更新房间失败，切换到离线模式:', error);
        this.setData({ isOfflineMode: true });
      }
    }

    // 更新本地存储
    const rooms = wx.getStorageSync('mahjong_rooms') || [];
    const index = rooms.findIndex(r => r.id === this.data.roomId);
    if (index > -1) {
      rooms[index] = room;
    }
    wx.setStorageSync('mahjong_rooms', rooms);

    this.setData({ room });
  },

  onPullDownRefresh() {
    this.loadRoomData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  checkManagePermission() {
    const { room } = this.data;
    if (!room) return;

    const openid = app.globalData.openid;
    const canManage = room && openid && room.players.findIndex(item=> item.openId === openid) > -1;
    this.setData({ canManagePlayers: canManage });
  },

  async addPlayer(e) {
    if (this.data.room.isEnded) {
      wx.showToast({
        title: '房间已结束计分',
        icon: 'none'
      });
      return;
    }
    const { position } = e.currentTarget.dataset;
    const { room } = this.data;

    try {
      const userInfo = await app.getUserProfile();
      if (!userInfo) {
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        });
        return;
      }
      const resIndex =  room.players.findIndex(item=> item.openId === userInfo.openid);
      if(resIndex > -1){
        if(resIndex !== Number(position)){
          room.players[resIndex] = {
            position,
            openId: '',
            nickName: '等待加入...',
            avatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132'
          };
        }
      }

      room.players[position] = {
        position,
        openId: userInfo.openid,
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl
      };
      await this.updateRoom({players: room.players});

      wx.showToast({
        title: '添加成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('添加玩家失败:', error);
      if (error.errMsg !== 'getUserProfile:fail auth deny') {
        wx.showToast({
          title: '添加失败，请重试',
          icon: 'none'
        });
      }
    }
  },

  async removePlayer(e) {
    if (this.data.room.isEnded) {
      wx.showToast({
        title: '房间已结束计分',
        icon: 'none'
      });
      return;
    }
    const { position } = e.currentTarget.dataset;
    const { room } = this.data;

    if(room.totalScores[position] !== 0){
      wx.showToast({
        title: '游戏已开始，不能删除',
        icon: 'none'
      });
      return
    }

    // 重置该位置的玩家信息
    room.players[position] = {
      position,
      openId: '',
      nickName: '等待加入...',
      avatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132'
    };

    this.updateRoom(room);
    wx.showToast({
      title: '移除成功',
      icon: 'success'
    });
  },

  async endRoom() {
    const that = this;
    wx.showModal({
      title: '确认结束',
      content: '结束后将无法继续记分，是否确认结束？',
      success: async (res) => {
        if (res.confirm) {
          await that.updateRoom({
            isEnded: true
          });
          wx.showToast({
            title: '已结束计分',
            icon: 'success'
          });
        }
      }
    });
  }
});