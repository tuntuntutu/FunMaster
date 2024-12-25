Page({
  data: {
    diceCount: 1,
    diceResults: [1],
    isRolling: false
  },

  onDiceCountChange(e) {
    const count = parseInt(e.detail.value);
    this.setData({
      diceCount: count,
      diceResults: Array(count).fill(1)
    });
  },

  rollDice() {
    this.setData({ isRolling: true });
    
    // 模拟骰子转动效果
    const rollInterval = setInterval(() => {
      const results = Array(this.data.diceCount).fill(0).map(() => 
        Math.floor(Math.random() * 6) + 1
      );
      this.setData({ diceResults: results });
    }, 100);

    // 1.5秒后停止
    setTimeout(() => {
      clearInterval(rollInterval);
      const finalResults = Array(this.data.diceCount).fill(0).map(() => 
        Math.floor(Math.random() * 6) + 1
      );
      this.setData({
        diceResults: finalResults,
        isRolling: false
      });
    }, 1500);
  }
})