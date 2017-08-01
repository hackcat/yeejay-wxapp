// common utils.js
let utils = require('../../utils/util.js');

// 计时器
function timeMeter(that) {
  console.log(that.data.timer);
  console.log(
    utils.durationFormat(that.data.timer)
  );
  // 渲染倒计时时钟
  that.setData({
    iTimer: utils.durationFormat(that.data.timer)
  });
  if (that.data.isSpeaking == false) {
    that.data.timer = 0;
    that.setData({
      iTimer: utils.durationFormat(that.data.timer)
    });
    return;
  }
  setTimeout(function () {
    that.data.timer += 500;
    timeMeter(that, true)
  }, 500)
}

// pages/book/book.js
Page({

  data: {
    userInfo: {},
    bookInfo: {},  //书本信息
    bookInfoData: {},

    pages: {}, // 书本内容信息
    VicesPages: {}, // 书本内容缓存，不更新到页面

    saveVices: [], // local 缓存音频数组，不更新到页面
    isSpeaking: false,// 是否正在说话
    recordingId: '', // 正在录音ID

    isPlayingIndex: -1, // 正在播放页面index
    isPlayingTime: {}, // 正在播放页面index

    // 计时
    iTimer: 0,
    timer: 0,  // 不更新到页面

    idx: 0 //标记页面数据，不同步到页面
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.bookId);
    let that = this;
    getApp().getAudio({ bookId: options.bookId, reader: options.reader, needPages: 1}, function (data) {
      if (data.code == 0) {
        let pagesData = data.payload.bookReadingInfo.pages;
        pagesData.forEach(function (val, index) {
          // 计算播放长度 毫秒
          pagesData[index].time = val.duration;
          pagesData[index].duration = utils.durationFormat(val.duration);
          // 每个页面是否播放 isPlaying  状态
          pagesData[index].isPlaying = false;
        }, this);
        that.setData({
          bookInfo: data.payload.bookReadingInfo,
          pages: pagesData,
          VicesPages: pagesData
        });
      } else {
        console.log("error_code:" + data.msg);
      }
    });

    that.setData({
      userInfo: getApp().globalData.userInfo
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

  // 录音
  recordAudio: function (event) {
    /**
     * 记录录音状态
     * 录音ID
     * 如果切换录音ID，结束上ID录音，并上传，开始新录音
     */
    let that = this;
    // 设置录音状态
    that.setData({
      isSpeaking: true
    });

    let pageId = event.currentTarget.dataset.pageid;
    let pageIndex = pageId - 1;
    // 有正在录音，且是同一个
    if (!that.data.recordingId) {
      // 记录正在录音ID
      that.data.recordingId = pageId;
      //开始录音
      let startTime = new Date();
      timeMeter(that, true);

      wx.startRecord({
        success: function (res) {
          // 计算录音时间
          let stopTime = new Date();
          timeMeter(that, false);
          // 保存到毫秒
          let recordingTime = Math.ceil((stopTime.getTime() - startTime.getTime()));
          //临时路径,下次进入小程序时无法正常使用  
          let tempFilePath = res.tempFilePath;
          console.log("tempFilePath: " + tempFilePath);
          //持久保存  
          wx.saveFile({
            tempFilePath: tempFilePath,
            success: function (res) {
              //持久路径  
              //本地文件存储的大小限制为 100M  
              let savedFilePath = res.savedFilePath;
              // 把录音信息保存到saveVices本地
              that.data.saveVices[pageId] = { pageId: pageId, FilePath: savedFilePath, time: recordingTime };
              // 更新页面vices 信息
              that.data.VicesPages[pageIndex].audioUrl = savedFilePath;
              that.data.VicesPages[pageIndex].time = recordingTime;
              that.data.VicesPages[pageIndex].duration = utils.durationFormat(recordingTime);
              console.log("savedFilePath: " + savedFilePath);

              that.setData({
                pages: that.data.VicesPages
              });

              // 马上播放录音
              wx.playVoice({
                filePath: that.data.saveVices[pageId].FilePath,
                success: function () {
                  console.log('回放录音');
                }
              });
            }
          })

        },
        fail: function (res) {
          //录音失败  
          wx.showModal({
            title: '提示',
            content: '录音失败!',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
                return
              }
            }
          })
        }
      });
    } else if (that.data.recordingId == pageId) {
      // 点击了本页的录音按钮
      // 暂停录音，并清空
      wx.stopRecord();
      this.setData({
        isSpeaking: false,
        recordingId: ''
      });
    } else {
      // 点击了不同页面的录音按钮
      console.log('点击了另一页的录音');
    }

  },

  //点击播放录音  
  gotoPlay: function (event) {
    let that = this;
    // pages 中的index
    let pagesIndex = event.currentTarget.dataset.pageindex;
    // 判断播放页面是否同一页，改变播放状态，并设置settimeout，不同页码，清除settimeout
    if (that.data.isPlayingIndex == -1) {
      console.log('第一次播放');
      // 修改当前Index
      that.data.isPlayingIndex = pagesIndex;
      that.data.VicesPages[pagesIndex].isPlaying = true;
      // 修改播放状态
      that.setData({
        pages: that.data.VicesPages
      });
      // 设置自动回复停播状态
      that.data.isPlayingTime = setTimeout(function () {
        that.data.VicesPages[pagesIndex].isPlaying = false;
        // 修改播放状态
        that.setData({
          pages: that.data.VicesPages
        });
      }, that.data.VicesPages[pagesIndex].time);
    } else if (that.data.isPlayingIndex == pagesIndex) {
      console.log('播放同一页');
      that.data.VicesPages[pagesIndex].isPlaying = false;
      // 修改播放状态
      that.setData({
        pages: that.data.VicesPages
      });
    } else {
      console.log('播放另一页');
      that.data.VicesPages[pagesIndex].isPlaying = true;
      that.data.VicesPages[that.data.isPlayingIndex].isPlaying = false;
      // 修改播放状态
      that.setData({
        pages: that.data.VicesPages
      });
      // 修改当前Index
      that.data.isPlayingIndex = pagesIndex;
      // 清除 setTimeout
      clearTimeout(that.data.isPlayingTime);
      // 设置自动回复停播状态
      that.data.isPlayingTime = setTimeout(function () {
        that.data.VicesPages[pagesIndex].isPlaying = false;
        // 修改播放状态
        that.setData({
          pages: that.data.VicesPages
        });
      }, that.data.VicesPages[pagesIndex].time);
    }
    // 页码数
    let pageId = that.data.VicesPages[pagesIndex].pageId;

    // 判断是否有本地缓存
    if (typeof that.data.saveVices[pageId] !== 'undefined') {
      console.log(that.data.saveVices);
      wx.playVoice({
        filePath: that.data.saveVices[pageId].FilePath,
        success: function () {
          that.setData({
            isPlaying: false
          });
        },
        fail: function () {
          console.log('不能正确播放');
        },
        complate: function () {

        }
      })
    } else {
      wx.downloadFile({
        url: that.data.pages[pagesIndex].audioUrl,
        success: function (res) {
          wx.playVoice({
            filePath: res.tempFilePath,
            success: function (res) {
              console.log('voice start');
              console.log(res);

              that.setData({
                isPlaying: true
              });
            },
            fail: function () {
              console.log('不能正确播放');
            },
            complate: function () {
            }
          })
        }
      });
    }
  },

  // 上传图片
  uploadImg: function (event) {
    let that = this;
    let bookId = event.currentTarget.dataset.bookid;
    console.log(bookId);
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.data.bookInfoData = that.data.bookInfo;
        that.data.bookInfoData.readingCoverUrl = res.tempFilePaths[0];

        that.setData({
          bookInfo: that.data.bookInfoData
        });
        // 调用上传图片函数
        getApp().uploadReadingCover({bookId: bookId, url: that.data.bookInfoData.readingCoverUrl}, function (data) {
          console.log(data);
        });
      }
    })
  },

  // 编辑朗读书信息
  setReadBook: function (e) {
    let that = this;
    console.log(e);
    if (e.detail.value.title.length == 0 || e.detail.value.author.length == 0) {
      wx.showToast({
        title: '请输入朗读者与朗读书籍信息',
        icon: 'loading',
        duration: 2000
      });
    } else {
      // 上传更新数据
      getApp().setMyReadingInfo({bookId: that.data.bookInfo.bookId, title: e.detail.value.title, author: e.detail.value.author}, function (data) {
        console.log(data);
        wx.showToast({
          title: '完成',
          icon: 'success',
          duration: 2000,
        });
        wx.reLaunch({
          url: '../profile/profile?actType=2',
        });
      });

    }
  },

  // 上传录音信息
  uploadVoices: function (e) {
    // 1. 每次切换页面检查录音上传一次，并记录已经上传个数
    // swiper  e.detail.current 切换到的页面序号，从0开始 ,页面pageId对应从 1 开始
    let that = this;

    // 判断页码在往前走 用到data 下面的idx
    console.log(e.detail.current);
    if (e.detail.current > that.data.idx) {
      console.log("oldIndex:" + that.data.idx);
      that.data.idx = e.detail.current;
      console.log("newIndex:" + that.data.idx);
      // 判断有没有录音数据
      if (that.data.saveVices[that.data.idx]) {
        getApp().uploadRecording(that.data.bookInfo.bookId, that.data.saveVices[that.data.idx], function (data) {
          console.log(data);
          if (data.code == 0) {
            console.log("上传成功");
          }
        });
      }
    }


  }

})  
