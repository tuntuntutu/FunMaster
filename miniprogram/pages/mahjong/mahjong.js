const app = getApp()

Page({
  data: {
    rooms: [],
    isLoading: true,
    isOfflineMode: false,
    showQRCode: false,
    qrCodeUrl: ''
  },

  onLoad() {
    this.loadRooms();
  },

  onShow() {
    this.loadRooms();
  },

  onPullDownRefresh() {
    this.loadRooms().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 计算实际玩家数量
  processRoomData(room) {
    const actualPlayers = room.players.filter(p => p.openId && p.openId !== '').length;
    return {
      ...room,
      actualPlayerCount: actualPlayers
    };
  },

  async loadRooms() {
    this.setData({ isLoading: true });
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getRooms',
        timeout: 2000
      });
      
      if (result.success) {
        // 处理每个房间的数据
        const processedRooms = result.rooms.map(room => this.processRoomData(room));
        this.setData({
          rooms: processedRooms,
          isOfflineMode: false
        });
      } else {
        throw new Error('获取房间列表失败');
      }
    } catch (error) {
      console.error('获取房间列表失败，使用本地数据:', error);
      const rooms = wx.getStorageSync('mahjong_rooms') || [];
      // 同样处理本地数据
      const processedRooms = rooms.map(room => this.processRoomData(room));
      this.setData({
        rooms: processedRooms,
        isOfflineMode: true
      });
    } finally {
      this.setData({ isLoading: false });
    }
  },

  goToRoomDetail(e) {
    const { roomId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/mahjong/room/detail?roomId=${roomId}`
    });
  },

  onShareAppMessage() {
    return {
      title: '麻将计分器',
      path: '/pages/mahjong/mahjong'
    };
  },

  navigateToRoom(e) {
    const { roomId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/mahjong/room/detail?roomId=${roomId}`,
    });
  },

  createRoom() {
    wx.navigateTo({
      url: '/pages/mahjong/room/create'
    });
  }
});