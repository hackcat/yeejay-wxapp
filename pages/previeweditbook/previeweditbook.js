// common utils.js
let utils = require('../../utils/util.js');
// pages/book/book.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        bookId: {},
        bookInfo: {}, // 书本信息
        pages: {},

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let that = this;
        that.data.bookId = options.bookId;
        console.log(options);
        getApp().getBookInfo({bookId: options.bookId, needPages: 1}, function(data) {
            if (data.code == 0) {
                that.setData({
                    bookInfo: data.payload.bookInfo,
                    pages: data.payload.bookInfo.pages
                });
            } else {
                console.log("error_code:" + data.msg);
            }
        });

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },

    //  返回编辑
    goBackEdit: function(event) {
      let that = this;
        if (event.detail.current == (that.data.pages.length + 1) ){
          wx.showToast({
            title: '最后一页了',
            icon: 'success',
            duration: 2000
          });
          setTimeout(function(){
            wx.navigateBack({
              delta: 1
            })
          }, 2000);
        }
    }

})