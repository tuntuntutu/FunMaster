Page({
  data: {},
  
  navigateToDice() {
    wx.navigateTo({
      url: '/pages/dice/dice'
    })
  },

  navigateToWheel() {
    wx.navigateTo({
      url: '/pages/wheel/wheel'
    })
  }
})