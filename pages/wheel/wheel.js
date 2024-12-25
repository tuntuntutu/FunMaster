Page({
  data: {
    options: ['选项1', '选项2', '选项3', '选项4', '选项5', '选项6'],
    optionsText: '选项1\n选项2\n选项3\n选项4\n选项5\n选项6',
    rotation: 0,
    isSpinning: false
  },

  onOptionsChange(e) {
    const text = e.detail.value;
    const options = text.split('\n').filter(option => option.trim());
    this.setData({
      optionsText: text,
      options: options
    });
  },

  spinWheel() {
    if (this.data.isSpinning) return;

    this.setData({ isSpinning: true });
    
    // 随机旋转5-10圈，加上随机角度
    const spins = 5 + Math.floor(Math.random() * 5);
    const extraDegrees = Math.floor(Math.random() * 360);
    const totalRotation = spins * 360 + extraDegrees;

    this.setData({
      rotation: totalRotation
    });

    // 等待动画完成
    setTimeout(() => {
      this.setData({ isSpinning: false });
      
      // 计算结果
      const normalizedRotation = totalRotation % 360;
      const segmentSize = 360 / this.data.options.length;
      const selectedIndex = Math.floor(normalizedRotation / segmentSize);
      const result = this.data.options[selectedIndex];
      
      wx.showToast({
        title: `结果：${result}`,
        icon: 'none',
        duration: 2000
      });
    }, 3000);
  }
})