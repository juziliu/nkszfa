// index.js
// 获取应用实例
const app = getApp()

Page({
  data: {
    nickName: '',
    avatarUrl: '',
    realName: '',
    score: 0,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') // 如需尝试获取用户信息可改为false
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad() {
    this.initUserInfo();
  },
  initUserInfo() {
    const { nickName, avatarUrl, realName } = app.globalData;
    this.setData({
      nickName,
      avatarUrl,
      realName,
    });
  },
  getUserProfile(e) {
    wx.getUserProfile({
      desc: '请先登录再进行预测',
      success: (res) => {
        console.log(res);
        const { nickName, avatarUrl } = res.userInfo;
        this.setData({
          nickName,
          avatarUrl,
        });
        app.updateUserInfo(res.userInfo);
      }
    })
  },
  gotoRankPage() {
    const { realName } = app.globalData;
    if (!realName) {
      wx.showModal({
        title: '校友会活动，为方便排行，请登录实名',
        content: '',
        editable: true,
        success: (res) => {
          const { confirm, content } = res;
          if (confirm) {
            if (content) {
              app.updateRealName(res.content);
            } else {
              wx.showToast({ icon: 'error', title: '姓名校验不合法'});
            }
          }
        }
      })
    } else {
      wx.showToast({ icon: 'none', title: '即将上线' });
    }
  },
  gotoQuizHistoryPage() {
    wx.showToast({ icon: 'none', title: '即将上线' });
  }
})
