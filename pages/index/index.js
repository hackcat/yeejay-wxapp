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
    
    getApp().getBookList({listType: listType, pageNum: pageNum}, function (data) {
      if (data.code == 0) {
        that.setData({
          recommendBook: data.payload.bookList,
        });
      } else {
        console.log("error_code:" + data.msg);
      }
    });

    // 童话
    getApp().getBookList({listType: 2, pageNum: pageNum}, function (data) {
      if (data.code == 0) {
        that.setData({
          talesBookList: data.payload.bookList,
        });
      } else {
        console.log("error_code:" + data.msg);
      }
    });

    // 科学
    getApp().getBookList({listType: 5, pageNum: pageNum}, function (data) {
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

  // 书城列表 listType
  bookListPage: function (event) {
    let listType = event.currentTarget.dataset.type;
    wx.navigateTo({
      url: '../../pages/booklist/booklist?type=' + listType
    })
  },

  // goSetting
  goSetting: function(event){
    wx.navigateTo({
      url: '../../pages/setting/setting'
    })
  }



})