Page({

  /**
   * 页面的初始数据
   */
  data: {
    round: -1,
    gameList: [],
    quizList: [],
  },

  onLoad() {
    this.initCloudDb();
    this.initGameList();
  },

  initCloudDb() {
    this.db = wx.cloud.database();
  },

  initGameList() {
    this.db.collection('const').where({ _id: 'quizRound' }).get().then(res => {
      console.log(res);
      const { value: round } = res.data[0];
      this.db.collection('game').where({ round }).get().then(res => {
        const gameList = JSON.parse(res.data[0].gameList);
        console.log(gameList);
        this.setData({
          gameList,
        });
      });
    })
   
  }


});
