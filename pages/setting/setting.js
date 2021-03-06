// setting.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    data: '年/月/日',
    interest: [
      {
        name: '现代文学',
        isCheck: false
      },
      {
        name: '童话寓言',
        isCheck: false
      },
      {
        name: '生活常识',
        isCheck: false
      },
      {
        name: '旅游地理',
        isCheck: false
      },
      {
        name: '自然科学',
        isCheck: false
      },
      {
        name: '品格修养',
        isCheck: false
      },
      {
        name: '体育',
        isCheck: false
      },
      {
        name: '艺术',
        isCheck: false
      },
      {
        name: '科技',
        isCheck: false
      },
      {
        name: '古文诗词',
        isCheck: false
      },
      {
        name: '国学经典',
        isCheck: false
      }
    ] //兴趣爱好
  },

  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    getApp().getUserSetting(function (res) {
      let intCheck = that.data.interest;
      if (res.payload.data.childInterest.length !== 0) {
        for (let i = 0; i < that.data.interest.length; i++) {
          for (let j = 0; j < res.payload.data.childInterest.length; j++) {
            if (that.data.interest[i].name == res.payload.data.childInterest[j]) {
              intCheck[i].isCheck = true;
            }
          }
        }
      }
      that.setData({
        userSetting: res.payload.data,
        interest: intCheck,
        date: res.payload.data.childBirthDay,
        childGender: res.payload.data.childGender,
        childInterest: res.payload.data.childInterest
      });
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

  // 更新设置
  updateUserSetting: function (event) {
    let that = this;
    let userSetting = {
      childBirthDay: event.detail.value.childBirthDay,
      childGender: event.detail.value.childGender,
      childInterest: event.detail.value.childInterest.join(":")
    }
    getApp().updateUserSetting(userSetting, function (res) {
      wx.showToast({
        title: '设置成功',
        icon: 'success',
        duration: 1500,
      });
      setTimeout(function(){
        wx.switchTab({
          url: '/pages/index/index',
        });
      }, 1500)
    });
  }
})