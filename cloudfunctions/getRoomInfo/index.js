const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const rooms = db.collection('rooms')

// 格式化时间
function formatTime(date) {
  if (!date) return '';
  let d;
  try {
    // 如果是字符串，先转换为Date对象
    d = typeof date === 'string' ? new Date(date) : date;
    // 检查是否为有效日期
    if (isNaN(d.getTime())) {
      return '';
    }
    
    // 转换为东八区时间
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const beijingTime = new Date(utc + (3600000 * 8));
    
    const month = (beijingTime.getMonth() + 1).toString().padStart(2, '0');
    const day = beijingTime.getDate().toString().padStart(2, '0');
    const hour = beijingTime.getHours().toString().padStart(2, '0');
    const minute = beijingTime.getMinutes().toString().padStart(2, '0');
    return `${month}-${day} ${hour}:${minute}`;
  } catch (error) {
    console.error('日期格式化错误:', error);
    return '';
  }
}

exports.main = async (event, context) => {
  try {
    const { roomId } = event
    
    // 先尝试使用_id查询
    let room = await rooms.doc(roomId).get()
      .catch(async () => {
        // 如果_id查询失败，尝试使用id字段查询
        const result = await rooms.where({
          id: roomId
        }).get()
        
        if (result.data.length === 0) {
          throw new Error('房间不存在')
        }
        return { data: result.data[0] }
      })

    // 格式化时间
    const formattedRoom = {
      ...room.data,
      roomId: room.data._id,
      createTime: formatTime(room.data.createTime),
      games: room.data.games
          .sort((a, b) => b.createTime - a.createTime)
          .map(game => ({
        ...game,
        createTime: formatTime(game.createTime)
      }))
    }

    return {
      success: true,
      room: formattedRoom
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: err
    }
  }
} 
