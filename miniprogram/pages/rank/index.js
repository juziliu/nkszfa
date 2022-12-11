const app = getApp();
const { CONTURY_MAP } = require('../../const.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    rankList: [],
  },

  onLoad() {
    this.initCloudDb();
  },

  onShow() {
    this.initRankList();
  },

  onShareAppMessage() {
    return {
      title: '世界杯预测积分榜',
      path: '/pages/rank/index',
      imageUrl: '/images/world_cup.jpg',
    };
  },

  initCloudDb() {
    this.db = wx.cloud.database();
  },

  initRound() {
    return this.db.collection('const').where({ _id: 'quizRound' }).get().then(res => {
      const { value: round } = res.data[0];
      this.round = round;
    });
  },

  initRankList() {
    this.initRound().then(() => {
      this.db.collection('userScore').where({ round: this.round - 1 }).get().then(res => {
        const { rankList } = res.data[0];
        this.setData({
          rankList: JSON.parse(rankList),
        });
      });
    })
  },
});
