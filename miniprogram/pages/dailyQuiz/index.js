const app = getApp();
const { CONTURY_MAP } = require('../../const.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    round: -1,
    isSubmit: false,
    gameList: [],
    quizMap: {},
    conturyMap: CONTURY_MAP,
  },

  onLoad() {
    this.initCloudDb();
    this.initGameList();
  },

  initCloudDb() {
    this.db = wx.cloud.database();
  },

  initQuizList(round, gameList) {
    const { openid } = app.globalData;
    this.db.collection('quiz').where({
      round,
      userId: openid,
    }).get().then(res => {
      console.log('quize', res);
      if (res.data.length > 0) {
        const quizMap = JSON.parse(res.data[0].quizMap);
        this.setData({
          quizMap,
          hasSubmit: true,
          isLoading: false,
        });
      } else {
        const quizMap = {};
        gameList.forEach(item => {
          quizMap[`${item.gameId}teamA`] = 0;
          quizMap[`${item.gameId}teamB`] = 0;
        });
        this.setData({
          quizMap,
          isSubmit: false,
          isLoading: false,
        });
      }
    });
  },

  checkIsLogin() { 
    const { nickName } = app.globalData;
    return Boolean(nickName);
  },

  setAndSaveQuizMap() {
    if (this.checkIsLogin()) {
      const { openid } = app.globalData;
      this.db.collection('quiz').add({
        data: {
          userId: openid,
          round: this.round,
          quizMap: JSON.stringify(this.data.quizMap),
        }
      }).then(res => {
        console.log('quiz success', res);
        wx.showToast({
          title: '提交成功',
        });
        this.setData({
          hasSubmit: true,
          quizMap: this.data.quizMap,
        });
      });
    } else {
      wx.getUserProfile({
        desc: '请先登录再进行预测',
        success: function (res) {
          app.updateUserInfo(res.userInfo);
        }
      })
    }
  },

  initGameList() {
    this.db.collection('const').where({ _id: 'quizRound' }).get().then(res => {
      console.log(res);
      const { value: round } = res.data[0];
      this.round = round;
      this.db.collection('game').where({ round }).get().then(res => {
        const gameList = JSON.parse(res.data[0].gameList);
        this.setData({
          gameList,
        });
        this.initQuizList(round, gameList);
      });
    });
  },

  inputGoal(e) {
    const { target, detail } = e;
    const { id } = target;
    const { value } = detail; 
    const { quizMap } = this.data;
    const goal = parseInt(value, 10);

    if (!goal || goal < 0) {
      quizMap[id] = 0;
      this.setData({ quizMap });
      return {
        value: "0",
      };
    } else {
      quizMap[id] = goal;
      return {
        value: goal,
      }
    }
  }
});
