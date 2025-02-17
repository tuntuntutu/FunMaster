const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const rooms = db.collection('rooms')
const _ = db.command

exports.main = async (event, context) => {
  try {
    const { room } = event
    const wxContext = cloud.getWXContext()

    // 检查用户是否有进行中的房间
    const activeRooms = await rooms
      .where({
        _openid: wxContext.OPENID,
        isEnded: _.neq(true)
      })
      .get()

    if (activeRooms.data.length > 0) {
      return {
        success: false,
        error: '您已有一个进行中的房间，请先结束当前房间再创建新的'
      }
    }

    // 创建房间
    const result = await rooms.add({
      data: {
        ...room,
        _openid: wxContext.OPENID,
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
        isEnded: false
      }
    })

    return {
      success: true,
      roomId: result._id
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: err
    }
  }
} 