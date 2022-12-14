const app = getApp();
const { CONTURY_MAP } = require('../../const.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    isEnd: true,
    round: -1,
    hasSubmit: false,
    gameList: [],
    quizMap: {},
    conturyMap: CONTURY_MAP,
  },

  onLoad() {
    this.initCloudDb();
  },

  onShow() {
    this.initGameList();
    this.checkQuizIsEnd();
  },
  
  onShareAppMessage() {
    return {
      title: '一起来预测',
      path: '/pages/dailyQuiz/index',
      imageUrl: '/images/world_cup.jpg',
    };
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
          hasSubmit: false,
          isLoading: false,
        });
      }
    });
  },

  checkIsLogin() { 
    const { nickName } = app.globalData;
    return Boolean(nickName);
  },

  checkQuizIsEnd() {
    return this.db.collection('const').where({ _id: 'isEnd' }).get().then(res => {
      const { value: isEnd } = res.data[0];
      this.setData({
        isEnd,
      });
      return isEnd;
    });
  },

  checkAndQuiz() {
    this.checkQuizIsEnd().then((res) => {
      if (!res) {
        this.setAndSaveQuizMap();
      } else {
        wx.showToast({ icon: 'error', title: '已到截止时间' });
      }
    });
  },

  newQuizResult() {
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
  },

  updateQuizResult() {
    const { openid } = app.globalData;
    this.db.collection('quiz').where({
      userId: openid,
      round: this.round,
    }).update({
      data: {
        userId: openid,
        round: this.round,
        quizMap: JSON.stringify(this.data.quizMap),
      }
    }).then(res => {
      console.log('quiz success', res);
      wx.showToast({
        title: '修改成功',
      });
      this.setData({
        hasSubmit: true,
        quizMap: this.data.quizMap,
      });
    });
  },

  setAndSaveQuizMap() {
    if (this.checkIsLogin() && !this.data.isEnd) {
      const { openid } = app.globalData;
      this.db.collection('quiz').where({
        userId: openid,
        round: this.round,
      }).get().then(res => {
        if (res.data[0]) {
          this.updateQuizResult();
        } else {
          this.newQuizResult();
        }
      });
    } else {
      wx.getUserProfile({
        desc: '请先登录再进行预测',
        success: (res) => {
          app.updateUserInfo(res.userInfo, this.setAndSaveQuizMap.bind(this));
        },
        fail: () => {
          wx.showToast({ title: '请先授权', icon: 'error' });
        }
      });
    }
  },

  initGameList() {
    this.db.collection('const').where({ _id: 'quizRound' }).get().then(res => {
      const { value: round } = res.data[0];
      this.round = round;
      this.db.collection('game').where({ round }).get().then(res => {
        const gameList = JSON.parse(res.data[0].gameList);
        this.setData({
          gameList,
        });
        if (!app.globalData.openid) {
          app.getOpenidCallback = () => { this.initQuizList(round, gameList) };
        } else {
          this.initQuizList(round, gameList);
        }
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
      this.setData({ quizMap });
      return {
        value: goal,
      }
    }
  }
});
