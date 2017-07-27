// myworks.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: '', // 用户U=uin
    bookList: {}, // 原创 1 列表
    readList: {}, // 朗读 2 列表
    totalBookCnt: '', // 绘本总数
    totalReadingCnt: '', // 朗读书总数
    fixedTop: false, // 固定在顶部
    actType: 1, // 活动TAB  actType 1 原创  2 朗读
    emptyBook: false, // 是否没书
    pageNum: [1,1,1],
    listLoading: false, //"上拉加载"的变量，默认false，隐藏 
    listLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏 
    isListLoading: false // 正在加载数据，停止请求

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    if(options.actType){
      that.setData({
        actType: options.actType
      });
    }
    // 获取用户ID
    let userId = getApp().getUserId();
    if (userId) {
      that.setData({
        userId: userId
      });
    }

    // 获取用户作品
    getApp().getMyWorks({actType: that.data.actType, pageNum: that.data.pageNum[that.data.actType]}, function (data) {
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

        that.data.pageNum[that.data.actType] = that.data.pageNum[that.data.actType] + 1;

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
    getApp().getMyWorks({actType: that.data.actType, pageNum: 1}, function (data) {
      wx.stopPullDownRefresh();
      wx.hideNavigationBarLoading();
      console.log(data);
      if (data.code == 0) {
        if (that.data.actType == 1) {
          that.setData({
            bookList: data.payload.works,
            totalBookCnt: data.payload.totalBookCnt,
            totalReadingCnt: data.payload.totalReadingCnt,
            pageNum: [1,1,1]
          });
        } else if (that.data.actType == 2) {
          that.setData({
            readList: data.payload.works,
            totalBookCnt: data.payload.totalBookCnt,
            totalReadingCnt: data.payload.totalReadingCnt,
            pageNum: [1,1,1]
          });
        }

        that.data.pageNum[that.data.actType] = that.data.pageNum[that.data.actType] + 1;

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

  // 监听页面滚动
  onPageScroll: function(event){
    console.log(event.scrollTop);
    if(event.scrollTop > 150){
      if(this.data.fixedTop == false){
        this.setData({
          fixedTop: true
        });
      }
    } else {
      this.setData({
        fixedTop: false
      });
    }
  },

  // 切换TAB
  changeTab: function (event) {
    console.log(event.currentTarget.dataset.tabid);
    let that = this;
    that.setData({
      actType: event.currentTarget.dataset.tabid
    });
    that.fetchBookList();
  },

  // 请求数据添加在页面
  fetchBookList: function () {
    let that = this;

    //访问网络
    getApp().getMyWorks({actType: that.data.actType, pageNum: that.data.pageNum[that.data.actType]}, function (data) {
      if (data.code == 0) {
        if (data.payload.works.length !== 0) {
          // console.log(data);
          let newBookList = [];
          //从原来的数据继续添加
          if (that.data.actType == 1) {
            // newBookList = Object.assign(that.data.bookList, data.payload.works);
            if (that.data.bookList.length) {
              newBookList = that.data.bookList.concat(data.payload.works);
            } else {
              newBookList = data.payload.works;
            }
            that.setData({
              bookList: newBookList,
              totalBookCnt: data.payload.totalBookCnt,
              totalReadingCnt: data.payload.totalReadingCnt,
            });
          } else if (that.data.actType == 2) {
            if (that.data.readList.length) {
              newBookList = that.data.readList.concat(data.payload.works);
            } else {
              newBookList = data.payload.works;
            }
            that.setData({
              readList: newBookList,
              totalBookCnt: data.payload.totalBookCnt,
              totalReadingCnt: data.payload.totalReadingCnt,
            });
          }

          that.data.pageNum[that.data.actType] = that.data.pageNum[that.data.actType] + 1;

        }
      } else {
        console.log("error_code:" + data.msg);
      }
    });
  }

})