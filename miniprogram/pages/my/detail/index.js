// pages/questions/index.js
Page({
  data: {
    userAnswers: {},
    pageNo: 1,
    questionsPerPage: 10,
    showErrorModal: false,
    showQuestionModal: false,
    questions: [],
    currentQuestions: [],
    wrongQuestions: [],
    total: 0,
    showAllAnswers: true
  },

  observers: {
    'questions': function(questions) {
      const wrongQuestions = questions.filter(item => item.hasSubmit && !item.isCorrect);
      const correctCount = questions.filter(item => item.hasSubmit && item.isCorrect).length;
      this.setData({ wrongQuestions, correctCount });
    },
  },

   onLoad(options) {
    const { type, subType } = options;
    this.setData({
      type,
      subType
    })
     this.queryQuestion();
  },

  async queryQuestion(){
    if (this.data.isLoading) return;

    this.setData({ isLoading: true });

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getMYSession',
        data: {
          type: this.data.type,
          subType: this.data.subType,
          page: this.data.pageNo,
          pageSize: this.data.questionsPerPage
        },
        timeout: 2000
      });

      if (result.success) {
        this.setData({
          questions: result.list,
          total: result.total,
        });
      } else {
        throw new Error('获取列表失败');
      }
    } catch (error) {
      console.error('获取失败', error);
    } finally {
      this.setData({ isLoading: false });
    }
  },


  handlePageChange(newPageNo) {
    this.setData({ pageNo: newPageNo });
    wx.pageScrollTo({ scrollTop: 0, duration: 300 });
  },

  handlePrevPage() {
    this.setData({
      pageNo: this.data.pageNo - 1,
    })
    this.queryQuestion();
  },

  handleNextPage() {
    this.setData({
      pageNo: this.data.pageNo + 1,
    })
    this.queryQuestion();
  },

  handleAnswerSubmit(e) {
    const { id, userAnswer, correctAnswer } = e.detail;
    if (!userAnswer) {
      wx.showToast({ title: '请选择答案', icon: 'none' });
      return;
    }

    const questions = this.data.questions.map(item => {
      if (item.id === id) {
        const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
        return { ...item, userAnswer, hasSubmit: true, isCorrect };
      }
      return item;
    });

    this.setData({ questions });
    console.log(e.detail)

    if (e.detail.isCorrect) {
      wx.showToast({ title: '恭喜你回答正确', icon: 'success' });
    } else {
      wx.showToast({ title: `答题错误，正确答案是${correctAnswer}`, icon: 'none' });
    }
  },

  // 处理页码输入
  handlePageInput(e) {
    this.setData({ jumpPageNo: e.detail.value });
  },

  // 跳转到指定页码
  jumpToPage() {
    const pageNo = parseInt(this.data.jumpPageNo, 10);
    if (isNaN(pageNo) || pageNo < 1 || pageNo > this.data.totalPage) {
      wx.showToast({ title: '请输入有效页码', icon: 'none' });
      return;
    }

    // 更新当前页码
    this.setData({ pageNo });
    this.queryQuestion()

    // 滚动到页面顶部
    wx.pageScrollTo({ scrollTop: 0, duration: 300 });
  },

  // 处理开关状态变化
  handleSwitchChange(e) {
    this.setData({ showAllAnswers: e.detail.value });
  },

  reset() {
    this.setData({
      pageNo: 1,
      userAnswers: {},
    });
    this.queryQuestion();
  }
});