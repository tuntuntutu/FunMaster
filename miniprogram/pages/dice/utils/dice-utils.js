export const generateRandomPosition = () => {
  const containerSize = 300;
  const diceSize = 60;
  const margin = 20;
  
  const maxX = containerSize - diceSize - margin;
  const maxY = containerSize - diceSize - margin;
  
  return {
    x: margin + Math.random() * maxX,
    y: margin + Math.random() * maxY
  };
};

export const calculateFinalRotation = () => {
  // 根据骰子点数计算最终旋转角度
  const rotations = [
    { x: 0, y: 0, z: 0 },      // 1
    { x: -90, y: 0, z: 0 },    // 2
    { x: 0, y: -90, z: 0 },    // 3
    { x: 0, y: 90, z: 0 },     // 4
    { x: 90, y: 0, z: 0 },     // 5
    { x: 180, y: 0, z: 0 }     // 6
  ];
  
  const randomIndex = Math.floor(Math.random() * rotations.length);
  return rotations[randomIndex];
};