const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  try {
    const { roomId } = event
    if (!roomId) {
      throw new Error('roomId is required')
    }

    console.log('Generating QR code for room:', roomId)

    const result = await cloud.openapi.wxacode.getUnlimited({
      scene: roomId,
      page: 'pages/mahjong/room/invite',
      checkPath: false,
      envVersion: 'release',
      width: 280
    })

    if (!result.buffer) {
      throw new Error('Failed to generate QR code: no buffer returned')
    }

    console.log('QR code generated, uploading to cloud storage...')

    const upload = await cloud.uploadFile({
      cloudPath: `qrcode/room_${roomId}_${Date.now()}.jpg`,
      fileContent: result.buffer
    })

    if (!upload.fileID) {
      throw new Error('Failed to upload QR code: no fileID returned')
    }

    console.log('QR code uploaded successfully:', upload.fileID)

    return {
      success: true,
      fileID: upload.fileID
    }
  } catch (err) {
    console.error('Error in generateRoomQRCode:', err)
    return {
      success: false,
      error: err.message || err
    }
  }
} 