Page({
  data: {
    step: 1,
    sessionObj: {
      'single_choice': '单选题',
      'multiple_choice': '多选题',
      'true_false': '判断题'
    }
  },
  switchType(e) {
    const { type } = e.currentTarget.dataset;

    this.setData({
      step: 2,
      type,
    })
  },
  navigateToDetail(e) {
    const { type } = e.currentTarget.dataset;

    wx.navigateTo({
      url: `/pages/my/detail/index?type=${this.data.type}&subType=${type}`
    });
  },
});