// common utils.js
let utils = require('../../utils/util.js');

// 进度计算器  传入that 和页码index 是否执行参数
function timeMeter(that, index) {
    that.data.interval[index] = setInterval(function () {
        that.data.pagesData[index].playProgress = (that.data.pagesData[index].playTime / that.data.pagesData[index].time) * 100;
        that.data.pagesData[index].playTimeFt = utils.durationFormat(that.data.pagesData[index].playTime);
        // 渲染
        that.setData({
            pages: that.data.pagesData
        });

        // 时间增加
        that.data.pagesData[index].playTime += 100;
        console.log(that.data.pagesData[index]);
    }, 100);
}

// pages/book/book.js
Page({

    data: {
        bookInfo: {}, //书本信息
        bookInfoData: {}, // 书本信息不更新到页面

        pages: [], //音频数组，更新到页面
        pagesData: [], // 音频数组，不更新到页面
        pageIndex: -1, // 正在播放的页码
        isPlayingTime: {}, // settimeout
        autoPlay: [], // 自动播放
        initTime: {}, // 定时函数
        interval: [], // 计时函数

        // 自动切换轮播图设置
        swiperTime: 2000, // 轮播图切换时间
        isAutoSwiper: true, // 自动轮播

        bookId: {}, // 书本ID
        bookReader: {}, // 书本类型 
        // 评论
        commentPageNum: 1, // 评论页码
        comments: [], //评论数量
        isComment: 1, // 是否有评论，0 有， 1 无
        showComment: false // 输入评论
    },

    // 切换swiper
    swiperItem: function (event) {
        let that = this;
        let pageId = event.detail.current - 1;
        console.log(that.data.pages.length);
        if (pageId == that.data.pages.length) {
            console.log('我是最后一页了');
            that.setData({
                isAutoSwiper: false
            });
        } else if (that.data.isAutoSwiper == false) {
            that.setData({
                isAutoSwiper: true
            });
        }

        if (typeof that.data.pagesData[pageId].swiperTime == 'undefined') {
            that.setData({
                swiperTime: 2000
            });
        } else {
            that.setData({
                swiperTime: that.data.pagesData[pageId].swiperTime
            });
            // 清除Interval
            if (that.data.interval.length) {
                that.data.interval.forEach(function (vla, index) {
                    clearInterval(vla);
                })
            }
            that.autoPlayVices(pageId);
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;
        that.data.bookId = options.bookId;
        that.data.bookReader = options.reader;

        getApp().getAudio({ bookId: options.bookId, reader: options.reader, needPages: 1 }, function (data) {
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
                        that.data.pagesData[index].swiperTime = that.data.pagesData[index].time + 200;
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

                // 循环下载文件到本地
                that.data.autoPlay = that.data.pagesData;
                that.data.pagesData.forEach(function (val, index) {
                    if (val.audioUrl) {
                        // 下载缓存到本地 并且播放
                        wx.downloadFile({
                            url: val.audioUrl,
                            success: function (res) {
                                // 保存到本地 替换原来远程地址
                                that.data.autoPlay[index].audioUrl = res.tempFilePath;
                            }
                        });
                    }
                });
                // 自动播放
                console.log(that.data.autoPlay);
                // autoPlay(that.data.autoPlay, 0);
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
        getApp().getCommentList({ bookId: that.data.bookId, reader: that.data.bookReader, pageNum: that.data.commentPageNum }, function (res) {
            console.log(that.data.autoPlay);
            if (res.payload.comments.length !== 0) {
                res.payload.comments.forEach(function (element, index) {
                    res.payload.comments[index].ts = utils.formatTime(new Date(element.ts * 1000));
                }, this);
                that.setData({
                    comments: res.payload.comments,
                    isComment: 0
                });
            }
        });

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () { },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        // 退出页面关闭声音播放
        // wx.navigateBack({
        //     delta: 2
        // });

        wx.stopVoice();
        this.setData({
            isAutoSwiper: false
        });
        // 清除Interval
        if (that.data.interval.length) {
            that.data.interval.forEach(function (vla, index) {
                clearInterval(vla);
            })
        }
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () { },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () { },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () { },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () { },

    //点击播放录音  
    onVicesTap: function (event) {
        let that = this;
        let playingIndex = event.currentTarget.dataset.index;
        console.log(event.currentTarget.dataset.index);

        // 清除Interval
        if (that.data.interval.length) {
            that.data.interval.forEach(function (vla, index) {
                clearInterval(vla);
            })
        }

        that.setData({
            isAutoSwiper: false
        });

        // 判断播放的页码是否同一
        if (that.data.pageIndex == playingIndex) {
            console.log('同一页面');
            // 同一页面 暂停UI 停止播放
            wx.stopVoice();

            // 恢复 暂停 状态
            that.data.pagesData[playingIndex].isPlaying = false;
            that.data.pagesData[playingIndex].playTime = 1;
            that.data.pagesData[playingIndex].playProgress = (that.data.pagesData[playingIndex].playTime / that.data.pagesData[playingIndex].time) * 100;
            that.data.pagesData[playingIndex].playTimeFt = utils.durationFormat(that.data.pagesData[playingIndex].playTime);

            that.setData({
                pages: that.data.pagesData,
                pageIndex: -1
            });
        } else {
            console.log('不同一页面');
            // 不是同一页面 上一个页面关闭，这个页面开启
            if (that.data.pageIndex >= 0) {
                that.data.pagesData[that.data.pageIndex].isPlaying = false;
                that.data.pagesData[that.data.pageIndex].playTime = 1;
                that.data.pagesData[that.data.pageIndex].playProgress = (that.data.pagesData[that.data.pageIndex].playTime / that.data.pagesData[that.data.pageIndex].time) * 100;
                that.data.pagesData[that.data.pageIndex].playTimeFt = utils.durationFormat(that.data.pagesData[that.data.pageIndex].playTime);
            }

            that.data.pagesData[playingIndex].isPlaying = true;
            that.setData({
                pages: that.data.pagesData
            });

            // 更新播放页面pageIndex
            that.data.pageIndex = playingIndex;

            // 清除 setTimeout
            clearTimeout(that.data.isPlayingTime);
            // 设置自动回复停播状态
            that.data.isPlayingTime = setTimeout(function () {
                that.data.pagesData[that.data.pageIndex].isPlaying = false;
                that.data.pagesData[that.data.pageIndex].playTime = 1;
                that.data.pagesData[that.data.pageIndex].playProgress = (that.data.pagesData[that.data.pageIndex].playTime / that.data.pagesData[that.data.pageIndex].time) * 100;
                that.data.pagesData[that.data.pageIndex].playTimeFt = utils.durationFormat(that.data.pagesData[that.data.pageIndex].playTime);
                // 修改播放状态
                that.setData({
                    pages: that.data.pagesData,
                    pageIndex: -1
                });

                // 清除Interval
                if (that.data.interval.length) {
                    that.data.interval.forEach(function (vla, index) {
                        clearInterval(vla);
                    })
                }

            }, that.data.pagesData[that.data.pageIndex].time);

            // 是否有音频地址
            if (that.data.pagesData[that.data.pageIndex].audioUrl) {
                // 进度条
                timeMeter(that, playingIndex);
            }
            // 下载缓存到本地 并且播放 pagesData
            wx.playVoice({
                filePath: that.data.pagesData[that.data.pageIndex].audioUrl,
                success: function (res) {
                    console.log(res);
                }
            });

        }

    },

    //自动播放录音  
    autoPlayVices: function (pageId) {
        let that = this;
        console.log(pageId);
        let playingIndex = pageId;

        // 清理原来进度条
        that.data.pagesData[playingIndex].playTime = 1;

        // 判断播放的页码是否同一
        if (that.data.pageIndex == playingIndex) {
            console.log('同一页面');
            // 同一页面 暂停UI 停止播放
            wx.stopVoice();

            // 恢复 暂停 状态
            that.data.pagesData[playingIndex].isPlaying = false;
            that.data.pagesData[playingIndex].playTime = 1;
            that.data.pagesData[playingIndex].playProgress = (that.data.pagesData[playingIndex].playTime / that.data.pagesData[playingIndex].time) * 100;
            that.data.pagesData[playingIndex].playTimeFt = utils.durationFormat(that.data.pagesData[playingIndex].playTime);

            that.setData({
                pages: that.data.pagesData,
                pageIndex: -1
            });
        } else {
            console.log('不同一页面');
            // 不是同一页面 上一个页面关闭，这个页面开启
            if (that.data.pageIndex >= 0) {
                that.data.pagesData[that.data.pageIndex].isPlaying = false;
                that.data.pagesData[that.data.pageIndex].playTime = 1;
                that.data.pagesData[that.data.pageIndex].playProgress = (that.data.pagesData[that.data.pageIndex].playTime / that.data.pagesData[that.data.pageIndex].time) * 100;
                that.data.pagesData[that.data.pageIndex].playTimeFt = utils.durationFormat(that.data.pagesData[that.data.pageIndex].playTime);
            }

            that.data.pagesData[playingIndex].isPlaying = true;
            that.setData({
                pages: that.data.pagesData
            });

            // 更新播放页面pageIndex
            that.data.pageIndex = playingIndex;

            // 清除 setTimeout
            clearTimeout(that.data.isPlayingTime);
            // 设置自动回复停播状态
            that.data.isPlayingTime = setTimeout(function () {
                that.data.pagesData[that.data.pageIndex].isPlaying = false;
                that.data.pagesData[that.data.pageIndex].playTime = 1;
                that.data.pagesData[that.data.pageIndex].playProgress = (that.data.pagesData[that.data.pageIndex].playTime / that.data.pagesData[that.data.pageIndex].time) * 100;
                that.data.pagesData[that.data.pageIndex].playTimeFt = utils.durationFormat(that.data.pagesData[that.data.pageIndex].playTime);
                // 修改播放状态
                that.setData({
                    pages: that.data.pagesData,
                    pageIndex: -1
                });

                // 清除Interval
                if (that.data.interval.length) {
                    that.data.interval.forEach(function (vla, index) {
                        clearInterval(vla);
                    })
                }

            }, that.data.pagesData[that.data.pageIndex].time);

            // 是否有音频地址
            if (that.data.pagesData[that.data.pageIndex].audioUrl) {
                // 进度条
                timeMeter(that, playingIndex);
            }
            // 下载缓存到本地 并且播放 pagesData
            wx.playVoice({
                filePath: that.data.pagesData[that.data.pageIndex].audioUrl,
                success: function (res) {
                    console.log(res);
                }
            });
        }
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
            getApp().likeAct({ bookId: that.data.bookInfo.bookId, reader: that.data.bookInfo.reader, act: 0 }, function (res) {
                console.log('取消点赞');
            });
        } else {
            that.data.bookInfoData.hasLiked = 1;
            that.data.bookInfoData.likeCnt = (that.data.bookInfoData.likeCnt - 0) + 1;
            that.setData({
                bookInfo: that.data.bookInfoData
            });
            getApp().likeAct({ bookId: that.data.bookInfo.bookId, reader: that.data.bookInfo.reader, act: 1 }, function (res) {
                console.log('点赞成功');
            });
        }
    },

    // 跳转评论页面
    goAddComment: function(event) {
        let that = this;
        console.log(event);
        wx.navigateTo({
            url: '../addcomment/addcomment?bookId=' + that.data.bookInfo.bookId +
                '&reader=' + that.data.bookInfo.reader
        })
    },

    //提交评论
    submitComment: function (event) {
        let that = this;
        console.log(event.detail.value.comment);
        if (event.detail.value.comment) {
            getApp().addComment({ bookId: that.data.bookId, reader: that.data.bookReader, content: event.detail.value.comment }, function (res) {
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