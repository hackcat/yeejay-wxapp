var util = require('../../utils/util.js')
// booklist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userBookList: '',
    pageNum: 1,
    listType: '', // 列表类型
    listCategory: ['', '推荐', '童话', '诗词', '艺术', '科技'],
    listLoading: false, //"上拉加载"的变量，默认false，隐藏 
    listLoadingComplete: false  //“没有数据”的变量，默认false，隐藏 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.data.listType = options.type;
    wx.setNavigationBarTitle({
      title: that.data.listCategory[that.data.listType]
    });

    getApp().getBookList({ listType: that.data.listType, pageNum: that.data.pageNum }, function (data) {
      if (data.code == 0) {
        that.setData({
          userBookList: data.payload.bookList,
        });
        if (data.payload.bookList.length >= getApp().globalData.pageSize) {
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
    console.log(that.data.listLoading);
    console.log(that.data.listLoading && !that.data.listLoadingComplete);
    if (!that.data.listLoading || !that.data.listLoadingComplete) {
      console.log("111");
      that.setData({
        pageNum: that.data.pageNum + 1,  //每次触发上拉事件，把PageNum+1
        listLoading: true //正在请求数据
      });
      that.fetchBookList();
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
      success: function (res) {
        console.log('分享成功');
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  // 请求数据添加在页面
  fetchBookList: function () {
    let that = this;
    //访问网络
    getApp().getBookList({ listType: that.data.listType, pageNum: that.data.pageNum }, function (data) {
      if (data.code == 0) {
        console.log(data);

        if (data.payload.bookList.length > 0) {
          let newBookList = [];
          newBookList = that.data.userBookList.concat(data.payload.bookList);
          that.setData({
            userBookList: newBookList, // 更新书数据
            listLoading: false //请求状态
          });
        }

        // 判断是否最后一页，设置searchLoadingComplete
        if (data.payload.bookList.length >= getApp().globalData.pageSize) {
          that.setData({
            listLoading: true,
          });
        } else {
          that.setData({
            //没有数据了，把“没有数据”显示，把“上拉加载”隐藏 
            listLoadingComplete: true, //把“没有数据”设为true，显示 
            listLoading: false  //把"上拉加载"的变量设为false，隐藏 
          });
        }
      } else {
        console.log("error_code:" + data.msg);
      }
    });

  }

})