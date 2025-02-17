const cloud = require('wx-server-sdk')
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const rooms = db.collection('my-test')
const _ = db.command


exports.main = async (event, context) => {
    try {
        const {page, pageSize, type, subType = 'single_choice'} = event

        // 获取用户创建或参与的房间列表
        const res = await rooms
            .where(_.or([
                {
                    type,
                }
            ]))
            .get()

        if (res.data.length === 0) {
            return {success: true, list: [], total: 0}; // 没有找到数据
        }

        // 获取 `questions` 数组
        const allQuestions = res.data[0].questions[subType] || [];
        const total = allQuestions.length; // 总数
        console.log(allQuestions)
        const paginatedQuestions = allQuestions.slice(pageSize * (page - 1), page * pageSize); // 分页

        return {success: true, list: paginatedQuestions, total};

    } catch (err) {
        console.error(err)
        return {
            success: false,
            error: err
        }
    }
}