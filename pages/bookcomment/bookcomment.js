// common utils.js
let utils = require('../../utils/util.js');
// bookcomment.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bookInfo: {}, // 书本信息
    bookInfoData: {}, // 书本信息不更新到页面
    commentPageNum: 1, // 评论页码
    comments: [], //评论数量
    isComment: 1, // 是否有评论，0 有， 1 无
    showComment: false // 输入评论
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      bookInfo: options,
      bookInfoData: options,
      likeCnt: options.likeCnt
    });
    // reader 0 书本  1 朗读 
    getApp().getCommentList(that.data.bookInfo.bookid, that.data.bookInfo.reader, that.data.commentPageNum, function (res) {
      if (res.payload.comments.length !== 0) {
        res.payload.comments.forEach(function(element, index) {
          res.payload.comments[index].ts = utils.formatTime( new Date(element.ts * 1000) );
        }, this);
        that.setData({
          comments: res.payload.comments,
          isComment: 0
        });
      }
    })
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

  // like动作
  likeIt: function(event) {
    let that = this;
    if(that.data.bookInfoData.hasLiked == 1){
      that.data.bookInfoData.hasLiked = 0;
      that.data.bookInfoData.likeCnt = that.data.bookInfoData.likeCnt - 1;
      that.setData({
        bookInfo: that.data.bookInfoData
      });
      getApp().likeAct(that.data.bookInfo.bookId, that.data.bookInfo.reader, 0, function(res){
        console.log('取消点赞');
      });
    } else {
      that.data.bookInfoData.hasLiked = 1;
      that.data.bookInfoData.likeCnt = (that.data.bookInfoData.likeCnt - 0) + 1;
      that.setData({
        bookInfo: that.data.bookInfoData
      });
      getApp().likeAct(that.data.bookInfo.bookId, that.data.bookInfo.reader, 1, function(res){
        console.log('点赞成功');
      });
    }
  },

  palyComment: function () {
    let that = this;
    if (that.data.showComment) {
      that.setData({
        showComment: false
      });
    } else {
      that.setData({
        showComment: true
      });
    }
  },

  //提交评论
  submitComment: function (event) {
    let that = this;
    console.log(event.detail.value.comment);
    if (event.detail.value.comment) {
      getApp().addComment(that.data.bookInfo.bookid, that.data.bookInfo.reader, event.detail.value.comment, function (res) {
        if (res.code == 0) {
          res.payload.comment.ts = utils.formatTime( new Date(res.payload.comment.ts * 1000) );
          let data = that.data.comments.concat(res.payload.comment);
          wx.showToast({
            title: '评论成功',
            icon: 'success',
            duration: 1000
          });
          that.setData({
            comments: data,
            showComment: false,
            isComment: 0
          });
        }
      });
    } else {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'loading',
        duration: 1000
      })
    }
  }
})