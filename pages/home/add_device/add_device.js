// pages/home/add_device/add_device.js
let second = 7 //扫描设备所需时间
Page({

  /**
   * 页面的初始数据
   */
  data: {
    discovering: false,
    animationData: {},
    list:[]
  },
  /**
   * 扫描设备
   */
  scan(){
    console.log(this.data.discovering)
    this.isscan = true
    if (!this.data.discovering){
      var that = this
      this.setAnimationInterval()
      this.setData({
        list: []
      })
      //开始搜寻附近的蓝牙外围设备
      wx.startBluetoothDevicesDiscovery({
        //services: ['cd21'],
        success: function (res) {
          console.log(res)
          that.setData({
            discovering: true,
          })
          if (res.errMsg = "startBluetoothDevicesDiscovery:ok") {
            //监听寻找到新设备的事件
            wx.onBluetoothDeviceFound(function (devices) {
              //console.dir(devices)
              var list = that.data.list
              var deviceList = wx.getStorageSync('deviceList') || []
              if (devices.name.search(/CDM21/) == 0) {
                console.log(devices.name + ':' + devices.deviceId)
                var isnotexist = true
                for (var i = 0; i < deviceList.length; i++) {
                  if (devices.deviceId == deviceList[i].deviceId) {
                    isnotexist = false
                    break;
                  }
                }
                if (isnotexist)
                  list.push(devices)
              }
              that.setData({
                list: list
              })
            })
          }
        }
      })
      setTimeout(function () {
        if (this.isscan = true){
          wx.stopBluetoothDevicesDiscovery({
            success: function (res) {
              console.log(res)
              that.resetAnimationInterval()
              that.setData({
                discovering: false,
              })
            }
          })
        }
      }.bind(this), second * 1000)
    } 
  },

  /**
   * 进入匹配该设备页面
   */
  addDevice(e){
    console.log(e)
    var that = this
    var devices = e.currentTarget.dataset.devices
    wx.navigateTo({
      url: 'step_1/step_1?name=' + devices.name + '&deviceId=' + devices.deviceId,
      success: function(res){
        wx.stopBluetoothDevicesDiscovery({
          success: function (res) {
            console.log(res)
            that.resetAnimationInterval()
            that.isscan = false
            that.setData({
              discovering: false,
            })
          }
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    if (wx.openBluetoothAdapter) {
      //初始化蓝牙适配器
      wx.openBluetoothAdapter({
        fail: function (res){
          console.log(res)
          wx.showModal({
            title: '提示',
            content: '请打开手机蓝牙！',
            success: function (res) {
              wx.navigateBack()
            }
          })
        },
        success: function (res) {
          //console.log(res)
          //监听蓝牙适配器状态变化事件
          wx.onBluetoothAdapterStateChange(function (res) {
            console.log(`adapterState changed, now is`, res)
            that.setData({
              discovering: res.discovering,
            })
            if(!res.discovering){
              that.resetAnimationInterval()
            }
          })
          that.scan()
          setTimeout(function () {
            wx.stopBluetoothDevicesDiscovery({
              success: function (res) {
                console.log(res)
                that.resetAnimationInterval()
                that.isscan = false
                that.setData({
                  discovering: false,
                })
              }
            })
          }.bind(that),  2000)
        }
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
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
    var animation = wx.createAnimation({
      delay: 0
    })
    this.animation = animation
  },

  /**
   * 设置点击扫描设备按钮动画
   */
  setAnimationInterval(){
    var that = this
    that.animation.rotate(second * 360).step({ duration: second * 1000 })
    that.animation.rotate(0, 0).step({ duration: 0 })
    that.setData({
      animationData: that.animation.export()
    })
  },

  /**
   * 重置扫描设备按钮动画
   */
  resetAnimationInterval: function () {
    this.animation.rotate(0, 0)
      .scale(1)
      .translate(0, 0)
      .skew(0, 0)
      .step({ duration: 0 })
    this.setData({ animationData: this.animation.export() })
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