// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    recommendBook: [] // 推荐绘本列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    let that = this;
    let listType = 1;
    let pageNum = 1;
    
    getApp().getBookList(listType, pageNum, function (data) {
      if (data.code == 0) {
        that.setData({
          recommendBook: data.payload.bookList,
        });
      } else {
        console.log("error_code:" + data.msg);
      }
    });

    // 童话
    getApp().getBookList(2, pageNum, function (data) {
      if (data.code == 0) {
        that.setData({
          talesBookList: data.payload.bookList,
        });
      } else {
        console.log("error_code:" + data.msg);
      }
    });

    // 科学
    getApp().getBookList(5, pageNum, function (data) {
      if (data.code == 0) {
        that.setData({
          tachBookList: data.payload.bookList,
        });
      } else {
        console.log("error_code:" + data.msg);
      }
    });

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    return {
      title: '选书朗读',
      path: '/pages/index/index',
      success: function(res) {
        console.log('分享成功');
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },

  // 跳转浏览
  previewReadBook: function(event){
    let that = this;
    console.log(event);
    let bookInfo = event.currentTarget.dataset.bookinfo;
    // 拉去评论书本类型 reader 0 书本  1 朗读  书城默认全部设置为 0
    let reader = 0; // reader 0 书本  1  朗读
    let isAuthor = 1; //1 false 0  true

    wx.navigateTo({
      url: '../previewreadbook/previewreadbook?bookId=' + bookInfo.bookId +
      '&title=' + bookInfo.title + 
      '&author=' + bookInfo.author + 
      '&coverUrl=' + bookInfo.coverUrl +
      '&isAuthor=' + isAuthor +
      '&reader= ' + reader +
      '&hasLiked= ' + bookInfo.hasLiked +
      '&pvCnt=' + bookInfo.pvCnt +
      '&likeCnt=' + bookInfo.likeCnt +
      '&commentCnt=' + bookInfo.commentCnt
    })
  },

  // 书城列表 listType
  bookListPage: function (event) {
    let listType = event.currentTarget.dataset.type;
    wx.navigateTo({
      url: '../../pages/booklist/booklist?type=' + listType
    })
  }

})