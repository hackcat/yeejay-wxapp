// addbook.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bookId: '', //书本ID
    bookCover: '', // 书本封面
    book: {}, // 书本信息
    bookInfo: {}, // 书本信息，不更新到页面
    pages: [], // 页面信息
    pagesData: [], //页面信息，不更新到页面
    idx: 0, // 页面编号 用于添加页面使用
    showCoverStyleList: false, // 显示样式也聊
    coverStyle: 0 // 选择样式
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 如果传入bookId
    console.log(options.bookid);
    let that = this;
    if (options.bookid) {
      getApp().getBookInfo(options.bookid, function (data) {
        console.log(data.payload.bookInfo);
        if (data.code == 0) {
          let _Pages = data.payload.bookInfo.pages;
          _Pages.forEach(function (element, index) {
            element.idx = index + 1;
            console.log(index);
          }, this);
          let maxIdx = _Pages.length;
          // 页面数组前插入
          _Pages.unshift(Array());
          that.setData({
            bookId: data.payload.bookInfo.bookId, //书本ID
            bookCover: data.payload.bookInfo.coverUrl, // 书本封面
            book: data.payload.bookInfo,
            bookInfo: data.payload.bookInfo,
            pages: data.payload.bookInfo.pages,
            pagesData: data.payload.bookInfo.pages,
            idx: maxIdx
          });
        }
      });
    }
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

  // 预览
  previewBook: function (event) {
    let bookid = event.currentTarget.dataset.bookid;
    if (bookid) {
      wx.navigateTo({
        url: '../previeweditbook/previeweditbook?bookId=' + bookid
      })
    } else {
      wx.showToast({
        title: '请先创建电子书',
        icon: 'loading',
        duration: 1000
      });
    }

  },

  finishBook: function () {
    wx.switchTab({
      url: '../profile/profile'
    });
  },

  // 添加页面
  addPage: function (event) {
    let that = this;
    let index = that.data.idx + 1;
    let type = event.currentTarget.dataset.type;
    if (that.data.bookId) {
      // 判断上一页内容是否为空
      if (that.data.idx == 0) {
        let page = {
          bookId: that.data.bookId,
          idx: index,
          text: '',
          type: type,
          imgUrl: ''
        }
        that.data.pagesData[index] = page;
        that.setData({
          pages: that.data.pagesData,
          idx: index
        });
        wx.showToast({
          title: '添加成功',
          icon: 'success',
          duration: 1000
        });
      } else if (that.data.pagesData[that.data.idx].imgUrl == "" && that.data.pagesData[that.data.idx].text == "") {
        wx.showToast({
          title: '请完成上一页内容',
          icon: 'success',
          duration: 1000
        });
      } else {
        let page = {
          bookId: that.data.bookId,
          idx: index,
          text: '',
          type: type,
          imgUrl: ''
        }
        that.data.pagesData[index] = page;
        that.setData({
          pages: that.data.pagesData,
          idx: index
        });
        wx.showToast({
          title: '添加成功',
          icon: 'success',
          duration: 1000
        });
      }
    } else {
      wx.showToast({
        title: '请先创建电子书',
        icon: 'loading',
        duration: 1000
      });
    }

  },

  // 创建电子书 检查封面图片是否选择
  addBook: function (event) {
    console.log(event);
    let that = this;
    let value = event.detail.value;
    let name = event.currentTarget.dataset.name;
    // event.currentTarget.dataset.name
    if (value !== '') {
      console.log(event.detail.value);
      // 判断是否生成bookId 如果有则更新数据
      if (!that.data.bookId) {
        // 判断title author
        if (name == 'title') {
          getApp().addBook({title: value}, function (data) {
            console.log(data);
            if (data.code == 0) {
              console.log('创建书成功，并保存书名');
              that.setData({
                bookId: data.payload.book.bookId,
                book: data.payload.book,
                bookInfo: data.payload.book
              });
              if (that.data.bookCover) {
                getApp().uploadImage({bookId: that.data.bookId, idx: 0, imageUrl: that.data.bookCover}, function (data) {
                  console.log(data);
                });
              }
            }
          });
        } else if (name == 'author') {
          getApp().addBook({author: value}, function (data) {
            console.log(data);
            if (data.code == 0) {
              console.log('创建书成功,并保存作者');
              that.setData({
                bookId: data.payload.book.bookId,
                book: data.payload.book,
                bookInfo: data.payload.book
              });
            }
          });
        }
        // 有bookId 更新bookInfo
      } else {
        // 判断title author
        if (name == 'title') {
          // 判断值是否发生过变化
          if (value !== that.data.bookInfo.title) {
            getApp().updateBook({bookId: that.data.bookId, title: value}, function (data) {
              console.log(data);
              if (data.code == 0) {
                console.log('更新title成功');
                that.data.bookInfo.title = value;
                that.setData({
                  book: that.data.bookInfo
                });
              }
            });
          } else {
            console.log('内容没有变化');
          }

        } else if (name == 'author') {
          if (value !== that.data.bookInfo.author) {
            getApp().updateBook({bookId: that.data.bookId, author: value}, function (data) {
              console.log(data);
              if (data.code == 0) {
                console.log('更新author成功');
                that.data.bookInfo.author = value;
                that.setData({
                  book: that.data.bookInfo
                });
              }
            });
          } else {
            console.log('内容没有变化');
          }
        }
      }

    } else {
      console.log('没有输入内容');
    }
  },

  // 选择封面
  uploadCover: function () {
    let that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        // var tempFilePaths = res.tempFilePaths;
        // 设置精选去一张，所以 0 取得当前的路径地址  res.tempFilePaths[0];
        that.setData({
          bookCover: res.tempFilePaths[0]
        });
        // 如果有了bookId，直接上传图片
        if (that.data.bookId) {
          getApp().uploadImage({bookId: that.data.bookId, idx: 0, imageUrl: that.data.bookCover}, function (data) {
            console.log(data);
          });
        }
      }
    })
  },

  // 显示样式列表
  showCoverStyleList: function () {
    let that = this;
    if (that.data.showCoverStyleList) {
      that.setData({
        showCoverStyleList: false
      });
      if (that.data.bookId) {
        // 更新封面样式
        getApp().updateCoverStyle({bookId: that.data.bookId, coverStyle: that.data.coverStyle}, function (res) {
          console.log(res);
        });
      }
    } else {
      that.setData({
        showCoverStyleList: true
      });
    }
  },

  //  更改样式
  changeCover: function (event) {
    let that = this;
    that.setData({
      coverStyle: event.currentTarget.dataset.style
    });
  },

  // 选择并上传内容图片
  uploadBookImg: function (event) {
    let that = this;
    let index = event.currentTarget.dataset.pageidx;
    console.log(index);
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        // var tempFilePaths = res.tempFilePaths;
        // 设置精选去一张，所以 0 取得当前的路径地址  res.tempFilePaths[0];
        // 如果有了bookId，直接上传图片
        getApp().uploadImage({bookId: that.data.bookId, idx: index, imageUrl: res.tempFilePaths[0]}, function (data) {
          let resData = JSON.parse(data);
          that.data.pagesData[index].imgUrl = resData.payload.url;
          that.setData({
            pages: that.data.pagesData
          });
        });
      }
    })
  },

  // 更多操作
  moreAct: function (event) {
    let that = this;
    // 当前页码
    console.log(event.currentTarget.dataset.index);
    let index = event.currentTarget.dataset.index;
    wx.showActionSheet({
      itemList: ['切换版式', '删除'],
      success: function (res) {
        console.log(res.tapIndex);
        // 切换版式 
        if (res.tapIndex == 0) {
          if (that.data.pagesData[index].type == 1) {
            that.data.pagesData[index].type = 2;
          } else if (that.data.pagesData[index].type == 2) {
            that.data.pagesData[index].type = 1;
          }
          that.setData({
            pages: that.data.pagesData
          });
        } else if (res.tapIndex == 1) {
          // 删除此页 bookId index
          getApp().delPage({bookId: that.data.bookId, index: index}, function (data) {
            delete that.data.pagesData[index];
            that.setData({
              pages: that.data.pagesData
            });
          });
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },

  // 上传表单form text内容
  pagesTextPost: function (event) {
    console.log(event.detail.value);
  },

  // confirmText 确认文本内容 传入text.value pages.index
  confirmText: function (event) {
    let that = this;
    console.log(event.detail.value);
    console.log(event.currentTarget.dataset.pageindex);
    let index = event.currentTarget.dataset.pageindex;
    that.data.pagesData[index].text = event.detail.value;
    if (event.detail.value.length == 0) {
      console.log("请输入内容");
    } else {
      // 发送页面内容 bookId, idx, text, type 
      getApp().setPage({
        bookId: that.data.pagesData[index].bookId, 
        idx: that.data.pagesData[index].idx, 
        text: that.data.pagesData[index].text, 
        type: that.data.pagesData[index].type
      }, function (data) {
        console.log(data);
        that.setData({
          pages: that.data.pagesData
        });
      });
    }
  }
})