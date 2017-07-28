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
      isAuthor: options.isAuthor
    });

    // 获取用户ID
    let userId = getApp().getUserId();
    if (userId) {
      that.setData({
        userId: userId
      });
    }

    getApp().getAudio({bookId: options.bookId, reader: options.reader}, function (res) {
      console.log(res);
      that.setData({
        bookInfo: res.payload.bookReadingInfo,
        bookInfoData: res.payload.bookReadingInfo
      });

      // 获取了bookInfo 后请求其他数据
      wx.setNavigationBarTitle({
        title: that.data.bookInfo.title
      });

      // reader 0 书本  1 朗读 
      getApp().getCommentList({ bookId: options.bookId, reader: options.reader, pageNum: that.data.commentPageNum }, function (res) {
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
    return {
      title: this.data.bookInfo.title,
      path: '/pages/previewlistenbook/previewlistenbook?isAuthor=1&bookId=' + this.data.bookInfo.bookId,
      success: function (res) {
        // 转发成功
        console.log(res);
      },
      fail: function (res) {
        // 转发失败
        console.log(res);
      }
    }
  },

  // 编辑 删除 操作
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
      getApp().addComment({ bookId: that.data.bookInfo.bookId, reader: that.data.bookInfo.reader, content: event.detail.value.comment }, function (res) {
        if (res.code == 0) {
          res.payload.comment.ts = utils.formatTime(new Date(res.payload.comment.ts * 1000));
          let comment = [res.payload.comment];
          let data = comment.concat(that.data.comments);
          wx.showToast({
            title: '评论成功',
            icon: 'success',
            duration: 1000
          });

          // 评论数 + 1
          that.data.bookInfoData.commentCnt = (that.data.bookInfoData.commentCnt - 0) + 1;

          that.setData({
            bookInfo: that.data.bookInfoData,
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

  // 删除评论
  delComent: function(event){
    let that = this;
    let commentIndex = event.currentTarget.dataset.index;
    let delComment = that.data.comments[event.currentTarget.dataset.index];
    wx.showModal({
      title: '提示',
      content: '确定删除该条评论？',
      success: function (res) {
        if (res.confirm) {
          getApp().delComment({ bookId: delComment.bookId, CommentId: delComment.CommentId }, function (data) {
            // 评论数 - 1
            that.data.bookInfoData.commentCnt = that.data.bookInfoData.commentCnt - 1;
            let newComment = that.data.comments;
            newComment.splice(commentIndex, 1);
            that.setData({
              bookInfo: that.data.bookInfoData,
              comments: newComment
            });
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    });
  },

  // 更多操作
  moreAct: function (event) {
    let that = this;
    let bookId = event.target.dataset.bookid;
    console.log(event);
    wx.showActionSheet({
      itemList: ['投稿', '删除'],
      success: function (res) {
        if (res.tapIndex == 0) {
          wx.navigateTo({
            url: '../agreement/agreement?bookId=' + that.data.bookInfo.bookId +
            '&title=' + that.data.bookInfo.title +
            '&author=' + that.data.bookInfo.author +
            '&coverUrl=' + that.data.bookInfo.coverUrl +
            '&actType=2'
          })
        } else if (res.tapIndex == 1) {
          // 删除
          let bookId = event.currentTarget.dataset.bookid;
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

  // 删除一本书
  delBook: function (event) {
    let bookId = event.currentTarget.dataset.bookid;
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
          getApp().report({ bookId: bookId, reason: reportList[res.tapIndex] }, function (data) {
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
      if ((that.data.bookInfoData.likeCnt - 1) >= 0) {
        that.data.bookInfoData.likeCnt = that.data.bookInfoData.likeCnt - 1;
      }

      that.setData({
        bookInfo: that.data.bookInfoData
      });
      getApp().likeAct({ bookId: that.data.bookInfo.bookId, reader: that.data.bookInfo.reader, act: 0 }, function (res) {
        console.log('取消点赞');
      });
    } else {
      that.data.bookInfoData.hasLiked = 1;
      that.data.bookInfoData.likeCnt = (that.data.bookInfoData.likeCnt - 0) + 1;
      that.setData({
        bookInfo: that.data.bookInfoData
      });
      getApp().likeAct({ bookId: that.data.bookInfo.bookId, reader: that.data.bookInfo.reader, act: 0 }, function (res) {
        console.log('点赞成功');
      });
    }
  }

})