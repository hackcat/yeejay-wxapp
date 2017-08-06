// editreadinfo.js
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log(options);
        let that = this;
        // 获取用户信息
        that.setData({
            userInfo: getApp().globalData.userInfo
        });

        getApp().getBookInfo({ bookId: options.bookId, needPages: 0 }, function(res) {
            console.log(res);
            that.setData({
                bookInfo: res.payload.bookInfo,
                bookInfoData: res.payload.bookInfo
            });

            // 获取了bookInfo 后请求其他数据
            wx.setNavigationBarTitle({
                title: that.data.bookInfo.title
            });
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {},

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

    // 编辑朗读书信息
    setReadBook: function(e) {
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
            getApp().setMyReadingInfo({ bookId: that.data.bookInfo.bookId, title: e.detail.value.title, author: e.detail.value.author, intro: e.detail.value.intro }, function(data) {
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

    // 上传图片
    uploadImg: function(event) {
        let that = this;
        let bookId = event.currentTarget.dataset.bookid;
        console.log(bookId);
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function(res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                that.data.bookInfoData = that.data.bookInfo;
                that.data.bookInfoData.readingCoverUrl = res.tempFilePaths[0];

                that.setData({
                    bookInfo: that.data.bookInfoData
                });
                // 调用上传图片函数
                getApp().uploadReadingCover({ bookId: bookId, url: that.data.bookInfoData.readingCoverUrl }, function(data) {
                    console.log(data);
                });
            }
        })
    }

})