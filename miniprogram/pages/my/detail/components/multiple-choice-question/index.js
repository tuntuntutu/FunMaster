// components/multiple-choice-question/index.js
Component({
    properties: {
        question: Object // 接收父组件传递的题目数据
    },

    data: {
        selected: [], // 用户选择的答案（数组，支持多选）
        computedItems: []
    },

    observers: {
        // 当 items 或 selectedIds 变化时，自动调用该函数
        'question, selected': function(question, selected) {
            const computedItems = question.options.map((item, index) => {
                return {
                    item: item,
                    isSelected: selected.indexOf(index) !== -1
                };
            });
            this.setData({ computedItems });
        }
    },

    methods: {
        // 处理选项选择
        handleSelect(e) {
            const index = e.currentTarget.dataset.index;
            const selected = this.data.selected;

            // 判断是否已经选择
            const selectedIndex = selected.indexOf(index);
            if (selectedIndex !== -1) {
                // 如果已经选择，则取消选择
                selected.splice(selectedIndex, 1);
            } else {
                // 如果未选择，则添加选择
                selected.push(index);
            }

            this.setData({ selected });
        },

        // 提交答案
        submitAnswer() {
            if (this.data.selected.length === 0) {
                wx.showToast({ title: '请选择答案', icon: 'none' });
                return;
            }

            const answerMap = {
                0: 'A',
                1: 'B',
                2: 'C',
                3: 'D'
            };

            // 将用户选择的索引转换为答案（如 [0, 2] -> ['A', 'C']）
            const userAnswer = this.data.selected.map(index => answerMap[index]).sort().join('');

            // 触发事件，将答案传递给父组件
            this.triggerEvent('submit', {
                id: this.properties.question.id,
                userAnswer,
                correctAnswer: this.properties.question.answer,
                isCorrect: this.properties.question.answer === userAnswer
            });
        }
    }
});