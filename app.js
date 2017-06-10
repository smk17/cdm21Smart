//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    //var developerMode = wx.getStorageSync('developerMode') || false
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      var failInfo = {
        avatarUrl: '/image/account_circle.png',
        nickName: '用户名'
      }
      //调用登录接口
      wx.login({
        fail: function (res) {
          typeof cb == "function" && cb(failInfo)
        },
        success: function () {
          wx.getUserInfo({
            fail: function (res) {
              typeof cb == "function" && cb(failInfo)
            },
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData:{
    userInfo:null
  }
})