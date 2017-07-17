// myworks.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: '', // 用户U=uin
    bookList:{}, // 原创 1 列表
    readList: {}, // 朗读 2 列表
    totalBookCnt: '', // 绘本总数
    totalReadingCnt: '', // 朗读书总数
    actType: 1, // 活动TAB  actType 1 原创  2 朗读
    emptyBook: false, // 是否没书
    pageNum: 1,
    listLoading: false, //"上拉加载"的变量，默认false，隐藏 
    listLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏 
    isListLoading: false // 正在加载数据，停止请求
      
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    // 获取用户ID
    let userId = getApp().getUserId();
    if ( userId ){
      that.setData({
        userId: userId
      });
    }

    // 获取用户作品
    getApp().getMyWorks(that.data.actType, that.data.pageNum, function (data) {
      console.log(data);
      if (data.code == 0) {
        if (that.data.actType == 1){
          that.setData({
            bookList: data.payload.works,
            totalBookCnt: data.payload.totalBookCnt,
            totalReadingCnt: data.payload.totalReadingCnt,
          });
        } else if (that.data.actType == 2){
          that.setData({
            readList: data.payload.works,
            totalBookCnt: data.payload.totalBookCnt,
            totalReadingCnt: data.payload.totalReadingCnt,
          });
        }

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
  onPullDownRefresh: function (e) {
    let that = this;
    wx.showNavigationBarLoading(); //在标题栏中显示加载
    getApp().getMyWorks(that.data.actType, 1, function (data) {
      wx.stopPullDownRefresh();
      wx.hideNavigationBarLoading();
      console.log(data);
      if (data.code == 0) {
        if (that.data.actType == 1) {
          that.setData({
            bookList: data.payload.works,
            totalBookCnt: data.payload.totalBookCnt,
            totalReadingCnt: data.payload.totalReadingCnt,
          });
        } else if (that.data.actType == 2) {
          that.setData({
            readList: data.payload.works,
            totalBookCnt: data.payload.totalBookCnt,
            totalReadingCnt: data.payload.totalReadingCnt,
          });
        }

      } else {
        console.log("error_code:" + data.msg);
      }
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    wx.showNavigationBarLoading(); //在标题栏中显示加载
    let that = this;
    that.fetchBookList();
    // 隐藏加载信息
    wx.hideNavigationBarLoading();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  // 切换TAB
  changeTab: function(event){
    console.log(event.currentTarget.dataset.tabid);
    let that = this;
    if (event.currentTarget.dataset.tabid == 1 && !that.data.bookList){
      that.fetchBookList();
    } else if (event.currentTarget.dataset.tabid == 2 && !that.data.readList) {
      that.fetchBookList();
    }
    that.setData({
      actType: event.currentTarget.dataset.tabid
    });
  },

  // 请求数据添加在页面
  fetchBookList: function () {
    let that = this;

    //访问网络
    getApp().getMyWorks(that.data.actType, that.data.pageNum, function (data) {
      if (data.code == 0) {
        console.log(data);

        if(data.payload.bookList.length > 0){
          let newBookList = [];
          //从原来的数据继续添加
          if (that.data.actType == 1) {
            newBookList = that.data.bookList.concat(data.payload.bookList);
            that.setData({
              bookList: data.payload.works,
              totalBookCnt: data.payload.totalBookCnt,
              totalReadingCnt: data.payload.totalReadingCnt,
            });
          } else if (that.data.actType == 2) {
            newBookList = that.data.readList.concat(data.payload.bookList);
            that.setData({
              readList: data.payload.works,
              totalBookCnt: data.payload.totalBookCnt,
              totalReadingCnt: data.payload.totalReadingCnt,
            });
          }
        }
      } else {
        console.log("error_code:" + data.msg);
      }
    });
  },

  // 跳转浏览（绘本）
  // reader 0 书本  1 朗读  
  previewReadBook: function(event){
    let that = this;
    let bookInfo = event.currentTarget.dataset.bookinfo;
    let reader = 0; // reader 0 书本  1  朗读
    let isAuthor = 0; //1 false 0  true

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

  // 去听书 (朗读)
  previewListenBook: function(event){
    let that = this;
    let bookInfo = event.currentTarget.dataset.bookinfo;
    let reader = 1; // reader 0 书本  1  朗读
    let isAuthor = 0; //1 false 0  true

    wx.navigateTo({
      url: '../previewlistenbook/previewlistenbook?bookId=' + bookInfo.bookId +
      '&title=' + bookInfo.title + 
      '&author=' + bookInfo.author + 
      '&coverUrl=' + bookInfo.coverUrl +
      '&isAuthor=' + isAuthor +
      '&intro=' + bookInfo.intro +
      '&reader= ' + reader +
      '&hasLiked= ' + bookInfo.hasLiked +
      '&pvCnt=' + bookInfo.pvCnt +
      '&likeCnt=' + bookInfo.likeCnt +
      '&commentCnt=' + bookInfo.commentCnt
    })
  }

})