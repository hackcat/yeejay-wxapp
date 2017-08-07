// addcomment.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        bookId: '',
        reader: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log(options);
        this.setData({
            bookId: options.bookId,
            reader: options.reader
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

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

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },

    //提交评论
    submitComment: function(event) {
        let that = this;
        console.log(event.detail.value.comment);
        if (event.detail.value.comment) {
            getApp().addComment({ bookId: that.data.bookId, reader: that.data.reader, content: event.detail.value.comment }, function(res) {
                if (res.code == 0) {
                    // res.payload.comment.ts = utils.formatTime(new Date(res.payload.comment.ts * 1000));
                    // let comment = [res.payload.comment];
                    // let data = comment.concat(that.data.comments);
                    wx.showToast({
                        title: '评论成功',
                        icon: 'success',
                        duration: 1000
                    });
                    if (that.data.reader) {
                        wx.navigateTo({
                            url: '../../pages/previewlistenbook/previewlistenbook?bookId=' + that.data.bookId + '&reader=' + that.data.reader
                        });
                    } else {
                        wx.navigateTo({
                            url: '../../pages/previewreadbook/previewreadbook?bookId=' + that.data.bookId
                        });
                    }
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