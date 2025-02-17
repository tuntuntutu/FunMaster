Component({
    properties: {
        question: Object
    },

    data: {
        selected: null
    },

    methods: {
        handleSelect(e) {
            const index = e.currentTarget.dataset.index;
            this.setData({ selected: index });
        },

        submitAnswer() {
            if (this.data.selected === null) {
                wx.showToast({ title: '请选择答案', icon: 'none' });
                return;
            }

            const answerMap = {
                0: 'A',
                1: 'B',
                2: 'C',
                3: 'D'
            };

            this.triggerEvent('submit', {
                id: this.properties.question.id,
                userAnswer: answerMap[this.data.selected],
                correctAnswer: this.properties.question.answer,
                isCorrect: this.properties.question.answer === answerMap[this.data.selected]
            });
        }
    }
})