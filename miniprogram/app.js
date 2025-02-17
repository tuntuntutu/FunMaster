// app.js
App({
    onLaunch() {
        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力')
        } else {
            wx.cloud.init({
                env: 'fun-master-online-0ew9sy9ce532b9', // 替换为你的环境ID
                traceUser: true
            })
        }

        // 获取openid
        this.getOpenId();
    },
    globalData: {
        userInfo: null,
        openid: null
    },

    // 获取openid
    async getOpenId() {
        try {
            const { result } = await wx.cloud.callFunction({
                name: 'getOpenId'
            });
            if (result.success) {
                this.globalData.openid = result.openid;
            }
        } catch (error) {
            console.error('获取openid失败:', error);
        }
    },

    // 获取用户信息
    async getUserProfile() {
        if (this.globalData.userInfo) {
            return this.globalData.userInfo;
        }

        try {
            const { userInfo } = await wx.getUserProfile({
                desc: '用于完善用户资料'
            });
            
            this.globalData.userInfo = {
                ...userInfo,
                openid: this.globalData.openid
            };
            
            return this.globalData.userInfo;
        } catch (error) {
            console.error('获取用户信息失败:', error);
            return null;
        }
    }
})