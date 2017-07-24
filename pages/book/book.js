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
    bookInfoData: {}, // 书本信息不更新到页面
    pages:{},
    // 评论
    bookReader: '', //书本类型reader
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
        bookId: options.bookId,
        bookReader: options.reader,
        isAuthor: options.isAuthor
      });
    getApp().getBookInfo(that.data.bookId, function (data) {
      if (data.code == 0) {
        that.setData({
          bookInfo: data.payload.bookInfo,
          bookInfoData: data.payload.bookInfo,
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
  onReady: function () {
    let that = this;
    // reader 0 书本  1 朗读 
    getApp().getCommentList({bookId: that.data.bookId, reader: that.data.bookReader, pageNum: that.data.commentPageNum}, function (res) {
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
  
  // 举报内容
  tipOff: function(){
    wx.showActionSheet({
      itemList: ['广告或垃圾信息', '抄袭或未授权转载', '其他'],
      success: function(res) {
        console.log(res.tapIndex)
      },
      fail: function(res) {
        console.log(res.errMsg)
      }
    })
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
      getApp().likeAct({bookId: that.data.bookInfo.bookId, reader: that.data.bookInfo.reader, act: 0}, function(res){
        console.log('取消点赞');
      });
    } else {
      that.data.bookInfoData.hasLiked = 1;
      that.data.bookInfoData.likeCnt = (that.data.bookInfoData.likeCnt - 0) + 1;
      that.setData({
        bookInfo: that.data.bookInfoData
      });
      getApp().likeAct({bookId: that.data.bookInfo.bookId, reader: that.data.bookInfo.reader, act: 1}, function(res){
        console.log('点赞成功');
      });
    }
  },

  // 评论
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
      getApp().addComment({bookId: that.data.bookInfo.bookId, reader: that.data.bookInfo.reader, content: event.detail.value.comment}, function (res) {
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
  },

  // 投稿
  goToSubmitBook: function(event){
    let that = this;
    let bookInfo = event.currentTarget.dataset.bookinfo;
    // 书本actType  0 绘本 1 朗读
    // reader 0 绘本  1 朗读 
    wx.navigateTo({
      url: '../agreement/agreement?bookId=' + bookInfo.bookId +
      '&title=' + bookInfo.title + 
      '&author=' + bookInfo.author + 
      '&coverUrl=' + bookInfo.coverUrl +
      '&actType=' + that.data.bookReader
    })
  }

})