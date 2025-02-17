const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const rooms = db.collection('rooms')
const _ = db.command

exports.main = async (event, context) => {
  try {
    const { roomId, scores } = event
    // const wxContext = cloud.getWXContext()

    // 验证分数
    if (!scores || scores.length !== 4 || scores.reduce((a, b) => a + b, 0) !== 0) {
      return {
        success: false,
        error: '分数无效'
      }
    }

    // 获取当前房间数据
    const room = await rooms.doc(roomId).get()
    const { totalScores } = room.data

    // 创建新一局记录
    const newGame = {
      scores,
      createTime: db.serverDate()
    }

    // 计算新的总分
    const newTotalScores = totalScores.map((score, index) => score + scores[index])

    // 更新房间数据
    const result = await rooms.doc(roomId).update({
      data: {
        games: _.push([newGame]),
        totalScores: newTotalScores
      }
    })

    return {
      success: true,
      totalScores: newTotalScores
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: err
    }
  }
} 
