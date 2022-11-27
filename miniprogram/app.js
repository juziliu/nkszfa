// app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        traceUser: true,
      });

      wx.cloud.callFunction({
        name: 'getOpenId',
        complete: res => {
          const { openid } = res.result;
          this.globalData.openid = openid;
          wx.cloud.database().collection('user').where({ openid }).get().then(res => {
            if (res.data.length !== 0) {
              const { nickName, avatarUrl, realName, role } = res.data[0];
              this.globalData.nickName = nickName;
              this.globalData.avatarUrl = avatarUrl;
              this.globalData.realName = realName;
              this.globalData.role = role;
            }
          })
        }
      })
    }

    this.globalData = {
      openid: '',
      nickName: '',
      avatarUrl: '',
      realName: '',
      role: '',
    };
  },

  updateUserInfo(userInfo, cb) {
    const { nickName, avatarUrl } = userInfo;
    this.globalData.nickName = nickName;
    this.globalData.avatarUrl = avatarUrl;
    wx.cloud.database().collection('user').add({
      data: {
        nickName,
        avatarUrl,
        role: 'user',
        openid: this.globalData.openid,
      }
    }).then(res => {
      console.log('success', res);
      if (cb) {
        cb();
      }
    });
  },

  updateRealName(realName) {
    if (realName) {
      this.globalData.realName = realName;
      wx.cloud.database().collection('user').where({
        openid: this.globalData.openid,
      }).update({
        data: {
          realName,
        }
      }).then(res => {
        console.log('realName setSuccess', res);
        wx.showToast({
          title: '提交成功',
        });
      });
    }
  }

});
