Page({
  data: {
    userAnswers: {},
    pageNo: 1,
    questionsPerPage: 10,
    showErrorModal: false,
    currentWQuestion: null,
    showQuestionModal: false,
    questions: [] // 初始化 questions 数据
  },

  handlePageChange(newPageNo) {
    Taro.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
    this.setData({
      pageNo: newPageNo
    });
  },

  handleAnswerSubmit(id, userAnswer, correctAnswer) {
    if (!userAnswer) {
      Toast.show('请选择答案', {
        type: 'fail',
      });
      return;
    }
    let updatedUserAnswers = {...this.data.userAnswers, [id]: userAnswer};
    this.setData({
      userAnswers: updatedUserAnswers
    });

    const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
    if (!isCorrect) {
      Toast.show('答题错误，正确答案是' + correctAnswer, {
        type: 'fail',
      });
    } else {
      Toast.show('恭喜你回答正确', {
        type: 'success'
      });
    }
    let updatedQuestions = this.data.questions.map(item => {
      if (item.id === id) {
        return {
          ...item,
          userAnswer: userAnswer,
          hasSubmit: true,
          isCorrect: isCorrect
        };
      }
      return item;
    });
    this.setData({
      questions: updatedQuestions
    });
  },

  closeQuestionModal() {
    this.setData({
      showQuestionModal: false
    });
  },

  closeErrorModal() {
    this.setData({
      showErrorModal: false
    });
  },

  showErrorQuestion(e) {
    const item = e.currentTarget.dataset.item;
    this.setData({
      currentWQuestion: item,
      showQuestionModal: true
    });
  },

  reset() {
    this.setData({
      pageNo: 1,
      userAnswers: {},
      questions: this.data.questions.map(item => ({
        ...item,
        hasSubmit: false,
        userAnswer: null,
        isCorrect: null
      }))
    });
  }
});
