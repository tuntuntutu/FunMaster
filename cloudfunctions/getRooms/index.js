const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const rooms = db.collection('rooms')
const _ = db.command

// 格式化时间
function formatTime(date) {
  const d = new Date(date)
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const hour = d.getHours().toString().padStart(2, '0')
  const minute = d.getMinutes().toString().padStart(2, '0')
  return `${month}-${day} ${hour}:${minute}`
}

exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext()
    
    // 获取用户创建或参与的房间列表
    const result = await rooms
      .where(_.or([
        {
          _openid: wxContext.OPENID // 用户创建的房间
        },
        {
          'players.openId': wxContext.OPENID // 用户参与的房间
        }
      ]))
      .orderBy('createTime', 'desc')
      .get()

    // 格式化时间
    const formattedRooms = result.data.map(room => ({
      ...room,
      createTime: formatTime(room.createTime),
      games: room.games.map(game => ({
        ...game,
        createTime: formatTime(game.createTime)
      }))
    }))

    return {
      success: true,
      rooms: formattedRooms
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: err
    }
  }
} 