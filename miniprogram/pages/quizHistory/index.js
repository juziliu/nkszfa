const app = getApp();
const { CONTURY_MAP } = require('../../const.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    isPlaying: false,
    hasSubmit: false,
    selectedRound: 1,
    allGameList: [],
    currentGameList: [],
    currentGameResultList: [],
    quizMap: {},
    conturyMap: CONTURY_MAP,
  },

  onLoad() {
    this.initCloudDb();
  },

  onShow() {
    this.initAllGameList();
    this.checkQuizIsEnd();
  },
  
  initCloudDb() {
    this.db = wx.cloud.database();
  },

  initAllGameList() {
    this.db.collection('game').get().then(res => {
      console.log(res);
      const roundList = [];
      const allGameList = [];
      res.data.forEach(item => {
        roundList.push(item.round);
        allGameList.push(JSON.parse(item.gameList));
      });

      this.setData({
        roundList,
        allGameList,
        currentGameList: allGameList[0],
      });

      this.loadQuizList(1, allGameList[0]);
      this.loadResult(1);
    });
  },

  loadQuizList(round, gameList) {
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

  loadResult(round) {
    this.db.collection('gameResult').where({ round }).get().then(res => {
      if (res.data[0]) {
        const currentGameResultList = JSON.parse(res.data[0].result);
        this.setData({
          currentGameResultList,
          isPlaying: false,
        });
      } else {
        this.setData({
          isPlaying: true,
        });
      }
    });
  },

  onTapRoundLabel(e) {
    const { round } = e.currentTarget.dataset;
    const currentGameList = this.data.allGameList[round - 1]
    this.setData({
      currentGameList,
      selectedRound: round,
    })
    this.loadQuizList(round, currentGameList);
    this.loadResult(round);
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

  setAndSaveQuizMap() {
    if (this.checkIsLogin() && !this.data.isEnd) {
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
        success: (res) => {
          app.updateUserInfo(res.userInfo, this.setAndSaveQuizMap.bind(this));
        },
        fail: () => {
          wx.showToast({ title: '请先授权', icon: 'error' });
        }
      });
    }
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
