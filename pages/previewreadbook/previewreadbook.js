// mybook.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bookInfo: {}, // 书本信息
    bookInfoData: {} // 书本信息不更新到页面
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      bookInfo: options,
      bookInfoData: options
    });
    wx.setNavigationBarTitle({
      title: that.data.bookInfo.title
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
  onShareAppMessage: function () {

  },

  // 去听书
  readBook: function (event) {
    let bookId = event.currentTarget.dataset.bookid;
    console.log(bookId);
    wx.navigateTo({
      url: '../readbook/readbook?bookId=' + bookId
    })
  },

  goToComment: function (event) {
    console.log(event.currentTarget.dataset.bookinfo);
    let bookInfo = event.currentTarget.dataset.bookinfo;
    let isAuthor = 1; //1 false 0  true
    wx.navigateTo({
      url: '../bookcomment/bookcomment?bookid=' + bookInfo.bookId +
      '&title=' + bookInfo.title +
      '&author=' + bookInfo.author +
      '&coverUrl=' + bookInfo.coverUrl +
      '&isAuthor=' + isAuthor +
      '&reader= ' + bookInfo.reader +
      '&hasLiked= ' + bookInfo.hasLiked +
      '&pvCnt=' + bookInfo.pvCnt +
      '&likeCnt=' + bookInfo.likeCnt +
      '&commentCnt=' + bookInfo.commentCnt
    })
  },

  // 删除一本书
  delBook: function (event) {
    let bookid = event.currentTarget.dataset.bookid;
    wx.showModal({
      title: '提示',
      content: '确认删除?',
      success: function (res) {
        if (res.confirm) {
          getApp().delBook(bookid, function (data) {
            console.log(data);
            wx.reLaunch({
              url: '../profile/profile'
            });
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  // 举报内容
  tipOff: function (event) {
    let that = this;
    let bookId = event.currentTarget.dataset.bookid;
    let reportList = ['广告或垃圾信息', '抄袭或未授权转载', '其他'];
    wx.showActionSheet({
      itemList: ['广告或垃圾信息', '抄袭或未授权转载', '其他'],
      success: function (res) {
        console.log(res);
        if (res.tapIndex) {
          getApp().report(bookId, reportList[res.tapIndex], function (data) {
            console.log(data);
            wx.showToast({
              title: '举报成功',
              icon: 'success',
              duration: 1000
            });
          });
        }

      },
      fail: function (res) {
        console.log(res.errMsg);
      }
    })
  },

  // like动作
  likeIt: function (event) {
    let that = this;
    if (that.data.bookInfoData.hasLiked == 1) {
      that.data.bookInfoData.hasLiked = 0;
      that.data.bookInfoData.likeCnt = that.data.bookInfoData.likeCnt - 1;
      that.setData({
        bookInfo: that.data.bookInfoData
      });
      getApp().likeAct(that.data.bookInfo.bookId, that.data.bookInfo.reader, 0, function (res) {
        console.log('取消点赞');
      });
    } else {
      that.data.bookInfoData.hasLiked = 1;
      that.data.bookInfoData.likeCnt = (that.data.bookInfoData.likeCnt - 0) + 1;
      that.setData({
        bookInfo: that.data.bookInfoData
      });
      getApp().likeAct(that.data.bookInfo.bookId, that.data.bookInfo.reader, 1, function (res) {
        console.log('点赞成功');
      });
    }
  }

})