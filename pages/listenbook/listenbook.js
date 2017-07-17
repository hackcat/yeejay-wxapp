// common utils.js
let utils = require('../../utils/util.js');

// 进度计算器  传入that 和页码index
function timeMeter(that, index) {
  that.data.pagesData[index].playProgress = (that.data.pagesData[index].playTime / that.data.pagesData[index].time) * 100;
  that.data.pagesData[index].playTimeFt = utils.durationFormat(that.data.pagesData[index].playTime);
  // 渲染
  that.setData({
    pages: that.data.pagesData
  });
  if (that.data.pagesData[index].playProgress >= 100) {
    that.setData({
      pages: that.data.pagesData
    });
    return;
  }
  setTimeout(function () {
    that.data.pagesData[index].playTime += 100;
    timeMeter(that, index)
  }, 100)
}

// pages/book/book.js
Page({

  data: {
    bookInfo: {},  //书本信息
    bookInfoData: {}, // 书本信息不更新到页面

    pages: [],//音频数组，更新到页面
    pagesData: [], // 音频数组，不更新到页面
    pageIndex: -1, // 正在播放的页码
    isPlayingTime: {}, // settimeout

    swiperTime: 5000, // 轮播图切换时间

    bookId: {}, // 书本ID
    bookReader: {}, // 书本类型 
    // 评论
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
    that.data.bookId = options.bookId;
    that.data.bookReader = options.reader;

    getApp().getAudio(that.data.bookId, function (data) {
      if (data.code == 0) {
        console.log(data);
        that.data.pagesData = data.payload.bookReadingInfo.pages;
        that.data.pagesData.forEach(function (val, index) {
          that.data.pagesData[index].time = val.duration;
          that.data.pagesData[index].isPlaying = false;
          that.data.pagesData[index].duration = utils.durationFormat(val.duration);
          that.data.pagesData[index].playProgress = 0;
          if (that.data.pagesData[index].time == 0) {
            that.data.pagesData[index].swiperTime = 1000;
          } else {
            that.data.pagesData[index].swiperTime = val.duration - 0 + 1000;
          }
          that.data.pagesData[index].playTime = 1;
          that.data.pagesData[index].playTimeFt = '00:00';
        }, this);
        that.setData({
          bookInfo: data.payload.bookReadingInfo,
          bookInfoData: data.payload.bookReadingInfo,
          pages: that.data.pagesData
        });
        wx.setNavigationBarTitle({
          title: that.data.bookInfo.title
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
    getApp().getCommentList(that.data.bookId, that.data.bookReader, that.data.commentPageNum, function (res) {

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

  //点击播放录音  
  onVicesTap: function (event) {
    let that = this;
    console.log(event.currentTarget.dataset.index);
    timeMeter(that, event.currentTarget.dataset.index);
    // 判断播放的页码是否同一
    if (that.data.pageIndex == event.currentTarget.dataset.index) {
      // 同一页面 暂停UI
      that.data.pagesData[event.currentTarget.dataset.index].isPlaying = false;
      that.setData({
        pages: that.data.pagesData
      });
    } else {
      // 不是同一页面 上一个页面关闭，这个页面开启
      if (that.data.pageIndex >= 0) {
        that.data.pagesData[that.data.pageIndex].isPlaying = false;
      }
      that.data.pagesData[event.currentTarget.dataset.index].isPlaying = true;
      that.setData({
        pages: that.data.pagesData
      });

      // 更新播放页面pageIndex
      that.data.pageIndex = event.currentTarget.dataset.index;

      // 清除 setTimeout
      clearTimeout(that.data.isPlayingTime);
      // 设置自动回复停播状态
      that.data.isPlayingTime = setTimeout(function () {
        that.data.pagesData[that.data.pageIndex].isPlaying = false;
        // 修改播放状态
        that.setData({
          pages: that.data.pagesData,
          pageIndex: -1
        });
      }, that.data.pagesData[that.data.pageIndex].time);
    }

    // 下载缓存到本地 并且播放
    wx.downloadFile({
      url: that.data.pagesData[that.data.pageIndex].audioUrl, //仅为示例，并非真实的资源
      success: function (res) {
        console.log(res.tempFilePath);
        that.setData({
          swiperTime: that.data.pagesData[index].swiperTime
        });
        wx.playVoice({
          filePath: res.tempFilePath,
          success: function (res) {
            console.log(res)
          }
        })
      }
    });
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
      getApp().likeAct(that.data.bookInfo.bookId, that.data.bookInfo.reader, 0, function (res) {
        console.log('取消点赞');
      });
    } else {
      that.data.bookInfoData.hasLiked = 1;
      that.data.bookInfoData.likeCnt = (that.data.bookInfoData.likeCnt - 0) + 1;
      that.setData({
        bookInfo: that.data.bookInfoData
      });
      getApp().likeAct(that.data.bookInfo.bookId, that.data.bookInfo.reader, 1, function (res) {
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
      getApp().addComment(that.data.bookId, that.data.bookReader, event.detail.value.comment, function (res) {
        if (res.code == 0) {
          res.payload.comment.ts = utils.formatTime(new Date(res.payload.comment.ts * 1000));
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
