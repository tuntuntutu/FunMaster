const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const rooms = db.collection('rooms')
const _ = db.command

exports.main = async (event, context) => {
  try {
    const { roomId, updates } = event

    const result = await rooms.doc(roomId).update({
      data: {
        ...updates,
        updateTime: db.serverDate()
      }
    })

    return {
      success: true,
      updated: result.stats.updated
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: err
    }
  }
} 
