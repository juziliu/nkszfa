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
      desc: '展示用户信息',
      success: (res) => {
        const { nickName, avatarUrl } = res.userInfo;
        this.setData({
          nickName,
          avatarUrl,
        });
        app.updateUserInfo(res.userInfo);
      }
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
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
