const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const rooms = db.collection('rooms')
const _ = db.command

exports.main = async (event, context) => {
  try {
    const { roomId, player } = event
    const wxContext = cloud.getWXContext()

    // 检查房间是否存在
    const room = await rooms.doc(roomId).get()
    if (!room.data) {
      return {
        success: false,
        error: '房间不存在'
      }
    }

    // 检查玩家是否已经在房间中
    const players = room.data.players || []
    if (players.some(p => p.openId === wxContext.OPENID)) {
      return {
        success: false,
        error: '你已经在房间中'
      }
    }

    // 检查房间是否已满
    if (players.length >= 4) {
      return {
        success: false,
        error: '房间已满'
      }
    }

    // 检查选择的位置是否已被占用
    if (players.some(p => p.position === player.position)) {
      return {
        success: false,
        error: '该位置已被占用'
      }
    }

    // 添加玩家到房间
    const result = await rooms.doc(roomId).update({
      data: {
        players: _.push([{
          ...player,
          openId: wxContext.OPENID,
          joinTime: db.serverDate()
        }])
      }
    })

    return {
      success: true,
      updated: result.stats.updated,
      room: room.data
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: err
    }
  }
} 
