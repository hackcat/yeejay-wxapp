var util = require('../../utils/util.js')
// booklist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bookId:'',
    bookReading:{},
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
    console.log(options);
    that.data.bookId =  options.bookId;
    wx.setNavigationBarTitle({
      title: options.title
    });
    getApp().getBookReading({bookId: that.data.bookId, pageNum: that.data.pageNum}, function (data) {
      if (data.code == 0) {
        that.setData({
          bookReading: data.payload.works,
        });
        if( data.payload.works.length >= getApp().globalData.pageSize ) {
          that.setData({
            listLoading: true,
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
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    wx.showNavigationBarLoading(); //在标题栏中显示加载

    if (that.data.listLoading && !that.data.listLoadingComplete) {
      if(that.data.isListLoading){
        console.log(that.data.isListLoading);
        console.log("loading...");
      } else {
        that.setData({
          pageNum: that.data.pageNum + 1,  //每次触发上拉事件，把PageNum+1
          isListLoading: true, //正在请求数据
          isFromSearch: false  //触发到上拉事件，把isFromSearch设为为false
        });
        
        that.fetchBookList();
      }
    }
    // 隐藏加载信息
    wx.hideNavigationBarLoading();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
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

  // 请求数据添加在页面
  fetchBookList: function () {
    let that = this;
    //访问网络
    getApp().getBookReading({bookId: that.data.bookId, pageNum: that.data.pageNum}, function (data) {
      if (data.code == 0) {
        console.log(data);

        if(data.payload.bookList.length > 0){
          let newBookList = [];
          //如果isFromSearch是true从data中取出数据，否则先从原来的数据继续添加 
          newBookList = that.data.bookReading.concat(data.payload.works);
          that.setData({
            bookReading: newBookList, // 更新书数据
            isListLoading: false //请求状态
          });
        }

        // 判断是否最后一页，设置searchLoadingComplete
        if( data.payload.works.length >= getApp().globalData.pageSize ) {
          that.setData({
            listLoading: true, 
          });
        } else {
          that.setData({
            //没有数据了，把“没有数据”显示，把“上拉加载”隐藏 
          searchLoadingComplete: true, //把“没有数据”设为true，显示 
          searchLoading: false  //把"上拉加载"的变量设为false，隐藏 
          });
        }
      } else {
        console.log("error_code:" + data.msg);
      }
    });

  },

  // 去听书 (朗读)
  previewListenBook: function(event){
    let that = this;
    let bookInfo = event.currentTarget.dataset.bookinfo;
    // reader 0 书本  1  朗读
    let isAuthor = 1; //1 false 0  true

    wx.navigateTo({
      url: '../previewlistenbook/previewlistenbook?bookId=' + bookInfo.bookId +
      '&title=' + bookInfo.title + 
      '&author=' + bookInfo.author + 
      '&coverUrl=' + bookInfo.coverUrl +
      '&isAuthor=' + isAuthor +
      '&intro=' + bookInfo.intro +
      '&reader= ' + bookInfo.reader +
      '&hasLiked= ' + bookInfo.hasLiked +
      '&pvCnt=' + bookInfo.pvCnt +
      '&likeCnt=' + bookInfo.likeCnt +
      '&commentCnt=' + bookInfo.commentCnt
    })
  }

})