Page({
  data: {
    room: null,
    qrCodeUrl: ''
  },

  onLoad(options) {
    const { id, qr } = options;
    const rooms = wx.getStorageSync('mahjong_rooms') || {};
    const room = rooms[id];
    
    this.setData({
      room,
      qrCodeUrl: qr
    });
  },

  copyRoomId() {
    wx.setClipboardData({
      data: this.data.room.id,
      success: () => {
        wx.showToast({
          title: '房间号已复制',
          icon: 'success'
        });
      }
    });
  },

  enterRoom() {
    wx.redirectTo({
      url: `/pages/mahjong/room/detail?id=${this.data.room.id}`
    });
  }
});