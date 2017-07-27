// common utils.js
let utils = require('../../utils/util.js');
// mybook.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bookInfo: {}, // 书本信息
    bookInfoData: {}, // 书本信息不更新到页面
    bookReading: {}, // 书本相关朗读
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
      bookInfoData: options
    });

    getApp().getBookReading({bookId: that.data.bookInfo.bookId, pageNum: 1}, function(res){
      that.setData({
        bookReading: res.payload.works
      });
    });

    // reader 0 书本  1 朗读 
    getApp().getCommentList({bookId: that.data.bookInfo.bookId, reader: that.data.bookInfo.reader, pageNum: that.data.commentPageNum}, function (res) {
      if (res.payload.comments.length !== 0) {
        res.payload.comments.forEach(function (element, index) {
          res.payload.comments[index].ts = utils.formatTime(new Date(element.ts * 1000));
        }, this);
        that.setData({
          comments: res.payload.comments,
          isComment: 0
        });
      }
    })

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

  // 去听书 (朗读)
  previewListenBook: function(event){
    let that = this;
    let bookInfo = event.currentTarget.dataset.bookinfo;
    let isAuthor = 1; //1 false 0  true

    wx.navigateTo({
      url: '../previewlistenbook/previewlistenbook?bookId=' + bookInfo.bookId +
      '&title=' + bookInfo.title + 
      '&author=' + bookInfo.author + 
      '&coverUrl=' + bookInfo.coverUrl +
      '&isAuthor=' + isAuthor +
      '&intro=' + bookInfo.intro +
      '&reader=' + bookInfo.reader +
      '&hasLiked=' + bookInfo.hasLiked +
      '&pvCnt=' + bookInfo.pvCnt +
      '&likeCnt=' + bookInfo.likeCnt +
      '&commentCnt=' + bookInfo.commentCnt
    })
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
      getApp().addComment({bookId: that.data.bookInfo.bookId, reader: that.data.bookInfo.reader, content: event.detail.value.comment}, function (res) {
        if (res.code == 0) {
          res.payload.comment.ts = utils.formatTime(new Date(res.payload.comment.ts * 1000));
          let comment = [res.payload.comment];
          let data = comment.concat(that.data.comments);
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

  // 更多操作
  moreAct: function (event) {
    let that = this;
    let bookId = event.target.dataset.bookid;
    console.log(event);
    wx.showActionSheet({
      itemList: ['投稿', '编辑', '删除'],
      success: function (res) {
        if (res.tapIndex == 0) {
          wx.navigateTo({
            url: '../agreement/agreement?bookId=' + that.data.bookInfo.bookId +
            '&title=' + that.data.bookInfo.title +
            '&author=' + that.data.bookInfo.author +
            '&coverUrl=' + that.data.bookInfo.coverUrl +
            '&actType=' + that.data.bookInfo.actType
          })
        } else if (res.tapIndex == 1) {
          // 编辑
          wx.navigateTo({
            url: '../editbook/editbook?bookId=' + bookId
          })
        } else if (res.tapIndex == 2) {
          wx.showModal({
            title: '提示',
            content: '确认删除?',
            success: function (res) {
              if (res.confirm) {
                getApp().delBook(bookId, function (data) {
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
        }
      },
      fail: function (res) {
        console.log(res.errMsg);
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
        if (res.tapIndex >= 0) {
          console.log('res');
          getApp().report({bookId: bookId, reason: reportList[res.tapIndex]}, function (data) {
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
      getApp().likeAct({bookId: that.data.bookInfo.bookId, reader: that.data.bookInfo.reader, act: 0}, function (res) {
        console.log('取消点赞');
      });
    } else {
      that.data.bookInfoData.hasLiked = 1;
      that.data.bookInfoData.likeCnt = (that.data.bookInfoData.likeCnt - 0) + 1;
      that.setData({
        bookInfo: that.data.bookInfoData
      });
      getApp().likeAct({bookId: that.data.bookInfo.bookId, reader: that.data.bookInfo.reader, act: 1}, function (res) {
        console.log('点赞成功');
      });
    }
  }

})