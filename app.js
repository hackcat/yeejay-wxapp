App({
  appApi: {
    // 单一参数直接传入，多参数以data传入， 例如： {actType: that.data.actType, pageNum: that.data.pageNum}
    // 用户登录接口
    userLoginAPI: 'https://wxshare.vivacampus.com/wx3ea7eb96e7e657ca/0/account/login',
    uploadUserInfoAPI: 'https://wxshare.vivacampus.com/wx3ea7eb96e7e657ca/0/account/verify',
    getUserSettingAPI: 'https://wxshare.vivacampus.com/wx3ea7eb96e7e657ca/0/api/user/getusersettings', // 获取用户设置
    updateUserSettingAPI: 'https://wxshare.vivacampus.com/wx3ea7eb96e7e657ca/0/api/user/updateusersettings', // 用户孩子设置
    // 获取书接口
    getListAPI: 'https://wxshare.vivacampus.com/wx3ea7eb96e7e657ca/0/api/book/getlist', //获取书城列表
    getBookAPI: 'https://wxshare.vivacampus.com/wx3ea7eb96e7e657ca/0/api/book/getbook', // 获取书本信息
    getAudioAPI: 'https://wxshare.vivacampus.com/wx3ea7eb96e7e657ca/0/api/user/getreadinginfo',  // 获取朗读信息
    getMyWorksAPI: 'https://wxshare.vivacampus.com/wx3ea7eb96e7e657ca/0/api/user/getmyworks',  //获取我的作品
    // 录音作品接口
    getBookReadingAPI: 'https://wxshare.vivacampus.com/wx3ea7eb96e7e657ca/0/api/user/getreadingsofbook', // 获取某本书的朗读作品
    uploadReadingCoverAPI: 'https://wxshare.vivacampus.com/wx3ea7eb96e7e657ca/0/upload/readingcover',  // 上传封面
    setMyReadingInfoAPI: 'https://wxshare.vivacampus.com/wx3ea7eb96e7e657ca/0/api/user/setreadinginfo',  //设置录音信息
    uploadRecordingAPI: 'https://wxshare.vivacampus.com/wx3ea7eb96e7e657ca/0/upload/readingaudio', //上传录音文件
    // 原创绘本接口
    addBookAPI: 'https://wxshare.vivacampus.com/wx3ea7eb96e7e657ca/0/api/book/addbook', // 创建电子书
    delBookAPI: 'https://wxshare.vivacampus.com/wx3ea7eb96e7e657ca/0/api/book/delbook', //删除电子书
    updateBookAPI: 'https://wxshare.vivacampus.com/wx3ea7eb96e7e657ca/0/api/book/updatebook', // 更新电子书
    setPageAPI: 'https://wxshare.vivacampus.com/wx3ea7eb96e7e657ca/0/api/book/setpage', // 更新某一页
    delPageAPI: 'https://wxshare.vivacampus.com/wx3ea7eb96e7e657ca/0/api/book/delpage', // 删除某一页
    uploadImageAPI: 'https://wxshare.vivacampus.com/wx3ea7eb96e7e657ca/0/upload/image', // 上传图片接口
    // 评论接口
    getCommentListAPI: 'https://wxshare.vivacampus.com/wx3ea7eb96e7e657ca/0/api/comment/getcommentlist', // 获取评论接口
    addCommentAPI: 'https://wxshare.vivacampus.com/wx3ea7eb96e7e657ca/0/api/comment/addcomment', // 添加评论
    addReplyAPI: 'https://wxshare.vivacampus.com/wx3ea7eb96e7e657ca/0/api/comment/addreply', // 添加回复
    delCommentAPI: 'https://wxshare.vivacampus.com/wx3ea7eb96e7e657ca/0/api/comment/delcomment', // 删除评论
    // 点赞
    likeActAPI: 'https://wxshare.vivacampus.com/wx3ea7eb96e7e657ca/0/api/like/act',
    submitWorkAPI: 'https://wxshare.vivacampus.com/wx3ea7eb96e7e657ca/0/api/user/submitwork',
    // 举报
    reportAPI: 'https://wxshare.vivacampus.com/wx3ea7eb96e7e657ca/0/api/book/report'
  },

  globalData: {
    userInfo: {}, // 用户信息
    uin: '',
    token: '',
    ver: '',
    pageSize: 20
  },

  // 用户登录
  onLaunch: function () {
    let that = this;
    that.userLogin();

    wx.getUserInfo({
      success: function (res) {
        wx.setStorageSync('userInfo', res.userInfo);
        that.globalData.userInfo = wx.getStorageSync('userInfo');
      }
    });
  },

  // 用户登录
  userLogin: function () {
    let that = this;
    wx.login({
      success: function (res) {
        if (res.code) {
          //发起网络请求
          wx.request({
            url: getApp().appApi.userLoginAPI,
            data: {
              code: res.code
            },
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              // 设置Storage
              try {
                wx.setStorageSync('uin', res.data.payload.uin);
                wx.setStorageSync('token', res.data.payload.token);
                wx.setStorageSync('ver', res.data.payload.ver);
                that.globalData.uin = wx.getStorageSync('uin');
                that.globalData.token = wx.getStorageSync('token');
                that.globalData.ver = wx.getStorageSync('ver');
              } catch (e) {
                console.log(e);
              }

              // 是否第一次登陆
              if (res.data.payload.isNewUser == 1) {
                wx.authorize({
                  scope: 'scope.userInfo',
                  success() {
                    // 用户已经同意，后续调用，接口不会弹窗询问
                    console.log('用户同意授权，用户信息');
                    that.uploadUserInfo();
                  },
                  fail() {
                    console.log('用户不同意授权');
                    // wx.redirectTo({
                    //   url: '../login/login'
                    // })
                  }
                })
              }
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });
  },

  // 获取用户uin
  getUserId: function () {
    return wx.getStorageSync('uin');
  },

  // 检查用户登录
  checkUserLogin: function () {
    let that = this;
    wx.checkSession({
      success: function () {
        //session 未过期，并且在本生命周期一直有效
        if (wx.getStorageSync('token')) {
          that.globalData.uin = wx.getStorageSync('uin');
          that.globalData.token = wx.getStorageSync('token');
          that.globalData.ver = wx.getStorageSync('ver');
        }
      },
      fail: function () {
        //登录态过期 重新登录
        that.userLogin();
      }
    });
  },

  // 上传用户信息 wx.getUserInfo
  uploadUserInfo: function () {
    let that = this;
    that.checkUserLogin();
    wx.getSetting({
      success(res) {
        console.log("获取用户授权设置");
        // 检查用户是否授权，用户信息
        if (!res['scope.userInfo']) {
          wx.getUserInfo({
            success: function (res) {
              console.log('获取用户信息成功');
              console.log(res);
              wx.request({
                url: that.appApi.uploadUserInfoAPI,
                data: {
                  uin: that.globalData.uin,
                  token: that.globalData.token,
                  ver: that.globalData.ver,
                  encryptData: res.encryptedData,
                  iv: res.iv
                },
                success: function (res) {
                  console.log(res);
                  console.log("上传用户信息成功");
                }
              });
            }
          });
        }
      }
    })
  },

  // 获取用户设置
  getUserSetting: function (callback) {
    let that = this;
    let userData = {
      uin: that.globalData.uin,
      token: that.globalData.token,
      ver: that.globalData.ver,
    }
    wx.request({
      url: getApp().appApi.getUserSettingAPI,
      data: userData,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        callback(res.data);
      },
      fail: function (error) {
        console.log(error);
      }
    })
  },

  // 用户孩子信息设置 uin=11&token=2&ver=3&childInterest
  updateUserSetting: function (data, callback) {
    let that = this;
    let userData = {
      uin: that.globalData.uin,
      token: that.globalData.token,
      ver: that.globalData.ver,
    }
    let parameter = Object.assign(userData, data);
    wx.request({
      url: getApp().appApi.updateUserSettingAPI,
      data: parameter,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        callback(res.data);
      },
      fail: function (error) {
        console.log(error);
      }
    })
  },

  //  封装函数，获取图书列表：type: 类型 1 今日推荐2 童话3 诗歌4 历史5 科技，pageNum: 页数; callback: 请求成功success回调函数
  //  各个页面调用方法：getApp().getBookList
  getBookList: function (data, callback) {
    let that = this;
    let userData = {
      uin: that.globalData.uin,
      token: that.globalData.token,
      ver: that.globalData.ver,
    }
    let parameter = Object.assign(userData, data);
    wx.request({
      url: getApp().appApi.getListAPI,
      data: parameter,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        callback(res.data);
      },
      fail: function (error) {
        console.log(error);
      }
    })
  },

  // 获取相关书本朗读
  getBookReading: function (data, callback) {
    let that = this;
    let userData = {
      uin: that.globalData.uin,
      token: that.globalData.token,
      ver: that.globalData.ver,
    }
    let parameter = Object.assign(userData, data);
    wx.request({
      url: getApp().appApi.getBookReadingAPI,
      data: parameter,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        callback(res.data);
      },
      fail: function (error) {
        console.log(error);
      }
    })
  },

  // 获取书本信息 传入 bookId
  getBookInfo: function (bookId, callback) {
    let that = this;
    wx.request({
      url: getApp().appApi.getBookAPI,
      data: {
        uin: that.globalData.uin,
        token: that.globalData.token,
        ver: that.globalData.ver,
        bookId: bookId
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        callback(res.data);
      },
      fail: function (error) {
        console.log(error);
      }
    })
  },

  // 获取朗读信息  传入 bookId
  getAudio: function (bookId, callback) {
    let that = this;
    wx.request({
      url: getApp().appApi.getAudioAPI,
      data: {
        uin: that.globalData.uin,
        token: that.globalData.token,
        ver: that.globalData.ver,
        bookId: bookId
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        callback(res.data);
      },
      fail: function (error) {
        console.log(error);
      }
    })
  },

  // 获取个人作品信息  传入页面 pageNum
  getMyWorks: function (data, callback) {
    let that = this;
    let userData = {
      uin: that.globalData.uin,
      token: that.globalData.token,
      ver: that.globalData.ver,
    }
    let parameter = Object.assign(userData, data);
    wx.request({
      url: getApp().appApi.getMyWorksAPI,
      data: parameter,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        callback(res.data);
      },
      fail: function (error) {
        console.log(error);
      }
    })
  },

  // 设置朗读信息 formData{bookId, title, author,}
  setMyReadingInfo: function (data, callback) {
    let that = this;
    let userData = {
      uin: that.globalData.uin,
      token: that.globalData.token,
      ver: that.globalData.ver,
    }
    let parameter = Object.assign(userData, data);
    wx.request({
      url: getApp().appApi.setMyReadingInfoAPI,
      data: parameter,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        callback(res.data);
      },
      fail: function (error) {
        console.log(error);
      }
    })
  },

  // 上传图片
  uploadReadingCover: function (data, callback) {
    let that = this;
    wx.uploadFile({
      url: getApp().appApi.uploadReadingCoverAPI,
      filePath: data.url,
      name: 'file',
      formData: {
        uin: that.globalData.uin,
        token: that.globalData.token,
        ver: that.globalData.ver,
        bookId: data.bookId
      },
      success: function (res) {
        callback(res.data);
      }
    })
  },

  // 上传录音文件 pageFile(文件对象)包含文件路径，录音时长
  uploadRecording: function (bookId, pageFile, callback) {
    let that = this;
    wx.uploadFile({
      url: getApp().appApi.uploadRecordingAPI,
      filePath: pageFile.FilePath,
      name: 'file',
      formData: {
        uin: that.globalData.uin,
        token: that.globalData.token,
        ver: that.globalData.ver,
        bookId: bookId,
        pageId: pageFile.pageId,
        duration: pageFile.time
      },
      success: function (res) {
        callback(res.data);
      }
    })
  },

  // 创建电子书
  addBook: function (data, callback) {
    let that = this;
    let userData = {
      uin: that.globalData.uin,
      token: that.globalData.token,
      ver: that.globalData.ver,
    }
    let parameter = Object.assign(userData, data);
    wx.request({
      url: getApp().appApi.addBookAPI,
      data: parameter,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        callback(res.data);
      },
      fail: function (error) {
        console.log(error);
      }
    })
  },

  // 创建电子书 
  updateBook: function (data, callback) {
    let that = this;
    let userData = {
      uin: that.globalData.uin,
      token: that.globalData.token,
      ver: that.globalData.ver,
    }
    let parameter = Object.assign(userData, data);
    wx.request({
      url: getApp().appApi.updateBookAPI,
      data: parameter,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        callback(res.data);
      },
      fail: function (error) {
        console.log(error);
      }
    })
  },

  // 更新书封面样式
  updateCoverStyle: function (data, callback) {
    let that = this;
    let userData = {
      uin: that.globalData.uin,
      token: that.globalData.token,
      ver: that.globalData.ver,
    }
    let parameter = Object.assign(userData, data);
    wx.request({
      url: getApp().appApi.updateBookAPI,
      data: parameter,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        callback(res.data);
      },
      fail: function (error) {
        console.log(error);
      }
    });
  },

  // 上传书本图片
  uploadImage: function (data, callback) {
    let that = this;
    wx.uploadFile({
      url: getApp().appApi.uploadImageAPI,
      filePath: data.imageUrl,
      name: 'file',
      formData: {
        uin: that.globalData.uin,
        token: that.globalData.token,
        ver: that.globalData.ver,
        bookId: data.bookId,
        idx: data.idx
      },
      success: function (res) {
        callback(res.data);
      }
    })
  },

  // 上传书本页面内容  /api/book/setpage, uin, token, bookId, idx, text, type 
  setPage: function (data, callback) {
    let that = this;
    let userData = {
      uin: that.globalData.uin,
      token: that.globalData.token,
      ver: that.globalData.ver,
    }
    let parameter = Object.assign(userData, data);
    console.log(parameter);
    wx.request({
      url: getApp().appApi.setPageAPI,
      data: parameter,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        callback(res.data);
      },
      fail: function (error) {
        console.log(error);
      }
    })
  },

  // 删除一本书
  delBook: function (bookId, callback) {
    let that = this;
    wx.request({
      url: getApp().appApi.delBookAPI,
      data: {
        uin: that.globalData.uin,
        token: that.globalData.token,
        ver: that.globalData.ver,
        bookId: bookId
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        callback(res.data);
      },
      fail: function (error) {
        console.log(error);
      }
    })
  },

  // 删除某一页
  delPage: function (data, callback) {
    let that = this;
    let userData = {
      uin: that.globalData.uin,
      token: that.globalData.token,
      ver: that.globalData.ver,
    }
    let parameter = Object.assign(userData, data);
    wx.request({
      url: getApp().appApi.delPageAPI,
      data: parameter,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        callback(res.data);
      },
      fail: function (error) {
        console.log(error);
      }
    })
  },

  // 获取评论 getCommentListAPI   uin token ver bookId pageNum pageSize
  // reader 0 书本  1 朗读 
  getCommentList: function (data, callback) {
    let that = this;
    let userData = {
      uin: that.globalData.uin,
      token: that.globalData.token,
      ver: that.globalData.ver,
      pageSize: that.globalData.pageSize
    }
    let parameter = Object.assign(userData, data);
    wx.request({
      url: getApp().appApi.getCommentListAPI,
      data: parameter,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        callback(res.data);
      },
      fail: function (error) {
        console.log(error);
      }
    })
  },

  // 添加评论/api/comment/addcomment 
  addComment: function (data, callback) {
    let that = this;
    let userData = {
      uin: that.globalData.uin,
      token: that.globalData.token,
      ver: that.globalData.ver
    }
    let parameter = Object.assign(userData, data);
    wx.request({
      url: getApp().appApi.addCommentAPI,
      data: parameter,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        callback(res.data);
      },
      fail: function (error) {
        console.log(error);
      }
    })
  },

  // like ACT 点赞
  // reader  =  // 0 表示对书的评论，不为0表示针对reader朗读这边书的的评论
  // act  =   // 1 表示点赞， 0表示取消点赞'
  likeAct: function (data, callback) {
    let that = this;
    let userData = {
      uin: that.globalData.uin,
      token: that.globalData.token,
      ver: that.globalData.ver
    }
    let parameter = Object.assign(userData, data);
    wx.request({
      url: getApp().appApi.likeActAPI,
      data: parameter,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        callback(res.data);
      },
      fail: function (error) {
        console.log(error);
      }
    })
  },

  // 投稿
  submitWork: function (data, callback) {
    let that = this;
    let userData = {
      uin: that.globalData.uin,
      token: that.globalData.token,
      ver: that.globalData.ver
    }
    let parameter = Object.assign(userData, data);
    wx.request({
      url: getApp().appApi.submitWorkAPI,
      data: parameter,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        callback(res.data);
      },
      fail: function (error) {
        console.log(error);
      }
    })
  },

  // 举报
  report: function (data, callback) {
    let that = this;
    let userData = {
      uin: that.globalData.uin,
      token: that.globalData.token,
      ver: that.globalData.ver
    }
    let parameter = Object.assign(userData, data);
    wx.request({
      url: getApp().appApi.reportAPI,
      data: parameter,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        callback(res.data);
      },
      fail: function (error) {
        console.log(error);
      }
    })
  }

})
