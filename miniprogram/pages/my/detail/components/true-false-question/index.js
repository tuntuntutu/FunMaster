// components/true-false-question/index.js
Component({
    properties: {
        question: Object // 接收父组件传递的题目数据
    },

    data: {
        selected: null // 用户选择的答案（true/false）
    },

    methods: {
        // 处理选项选择
        handleSelect(e) {
            const value = e.currentTarget.dataset.value === true;
            this.setData({ selected: value });
        },

        // 提交答案
        submitAnswer() {
            if (this.data.selected === null) {
                wx.showToast({ title: '请选择答案', icon: 'none' });
                return;
            }

            // 将用户选择的布尔值转换为字符串（如 true -> '正确'）
            const userAnswer = this.data.selected ? '正确' : '错误';

            // 触发事件，将答案传递给父组件
            this.triggerEvent('submit', {
                id: this.properties.question.id,
                userAnswer,
                correctAnswer: this.properties.question.answer,
                isCorrect: this.data.selected === this.properties.question.answer
            });
        }
    }
});