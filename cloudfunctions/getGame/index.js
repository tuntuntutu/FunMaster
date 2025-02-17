const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const games = db.collection('games')

exports.main = async (event, context) => {
  try {
    const { gameId } = event
    const game = await games.doc(gameId).get()
    
    return {
      success: true,
      game: game.data
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: err
    }
  }
} 