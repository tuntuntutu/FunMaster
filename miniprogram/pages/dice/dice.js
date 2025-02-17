import { generateRandomPosition, calculateFinalRotation } from './utils/dice-utils';

Page({
  data: {
    diceCount: 1,
    isShaking: false,
    isRolling: false,
    diceList: [1],
    dicePositions: [''],
    diceData: [{
      value: 1,
      style: '',
      faces: [
        [0,0,0,0,1,0,0,0,0],
        [1,0,0,0,0,0,0,0,1],
        [1,0,0,0,1,0,0,0,1],
        [1,0,1,0,0,0,1,0,1],
        [1,0,1,0,1,0,1,0,1],
        [1,0,1,1,0,1,1,0,1]
      ]
    }]
  },

  onDiceCountChange(e) {
    const count = parseInt(e.detail.value);
    this.setData({
      diceCount: count,
      diceList: Array(count).fill(1),
      dicePositions: Array(count).fill(''),
      diceData: Array(count).fill(this.data.diceData[0])
    });
  },

  onShow() {
    wx.startAccelerometer({
      interval: 'game'
    });
    
    wx.onAccelerometerChange((res) => {
      const threshold = 1.5;
      if (Math.abs(res.x) > threshold || 
          Math.abs(res.y) > threshold || 
          Math.abs(res.z) > threshold) {
        this.throwDice();
      }
    });
  },

  onHide() {
    wx.stopAccelerometer();
  },

  throwDice() {
    if (this.data.isRolling) return;
    
    this.setData({ 
      isShaking: true,
      isRolling: true 
    });

    // 生成随机位置和旋转
    const diceResults = Array(this.data.diceCount).fill(0).map(() => ({
      value: Math.floor(Math.random() * 6) + 1,
      position: generateRandomPosition(),
      rotation: calculateFinalRotation()
    }));

    // 先展示摇晃动画
    setTimeout(() => {
      this.setData({
        isShaking: false,
        dicePositions: diceResults.map(result => 
          `transform: translate3d(${result.position.x}px, ${result.position.y}px, 0)`
        ),
        diceData: diceResults.map(result => ({
          ...this.data.diceData[0],
          value: result.value,
          style: `--finalX: ${result.rotation.x}deg; --finalY: ${result.rotation.y}deg; --finalZ: ${result.rotation.z}deg;`
        }))
      });

      // 动画结束后重置状态
      setTimeout(() => {
        this.setData({ isRolling: false });
      }, 1200);
    }, 1000);
  }
});