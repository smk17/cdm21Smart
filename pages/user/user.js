// pages/user/user.js
//获取应用实例
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      avatarUrl: '/image/account_circle.png',
      nickName: '用户名'
    },
  },

  openSetting(){
    var that = this
    wx.openSetting({
      success: (res) => {
        console.log(res)
        // res.authSetting = {
        //   "scope.userInfo": true,
        //   "scope.userLocation": true
        // }
        app.getUserInfo(function (userInfo) {
          that.setData({
            userInfo: userInfo
          })
        })
      }
    })
  },

  userViewTap(){
    this.nowTapTime = new Date().getTime()
    if (this.nowTapTime - this.prevTapTime<=2000){
      this.userTap++
    }else{
      this.userTap = 0
    }
    var developerMode = wx.getStorageSync('developerMode') || false
    var titleList = []
    if (developerMode){
      titleList.push('再点击两次关闭DEMO模式')
      titleList.push('再点击一次关闭DEMO模式')
      titleList.push('已关闭DEMO模式')
    }else{
      titleList.push('再点击两次进入DEMO模式')
      titleList.push('再点击一次进入DEMO模式')
      titleList.push('已进入DEMO模式')
    }
    switch (this.userTap){
      case 0:case 1:case 2:case 3:
        break
      case 4: 
        wx.showToast({
          title: titleList[0],
          //image: '/image/transparent.png',
          duration: 1000
        })
        break
      case 5:
        wx.showToast({
          title: titleList[1],
          //image: '/image/transparent.png',
          duration: 1000
        })
        break
      case 6:
        wx.showToast({
          title: titleList[2],
          duration: 1000
        })
        wx.setStorage({
          key: "developerMode",
          data: !developerMode
        })
        break
      default:
        break
    }
    this.prevTapTime = this.nowTapTime
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('onLoad')
    var that = this
    this.userTap = 0
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
    var now = new Date().getTime()
    this.prevTapTime = now
    this.nowTapTime = now
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

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  }
})