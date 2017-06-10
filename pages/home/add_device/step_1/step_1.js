// pages/home/add_device/step_1/step_1.js
var characteristicId = "0000ffe1-0000-1000-8000-00805f9b34fb"
var utils = require('../../../../utils/utils.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    progress: 0,
    success: true,
    icon_type: 'success',
    title: '设备连接中,请稍后',
    subtitle: '连接过程中请勿断开蓝牙,并将手机和设备尽量靠近',
    btntitle: '取消'
  },

  /**
   * 获取数据并处理，符合则表示成功连接到蓝牙设备
   */
  readData(str){
    var deviceList = wx.getStorageSync('deviceList') || []
    var device = {}
    var arr = str.split(',')
    if (arr.length > 0){
      utils.readDateInStorage(arr, this.deviceId, this.deviceName)
    }else{
      return
    }
    this.leave()
    setTimeout(function () {
      wx.switchTab({
        url: '/pages/home/home'
      })
    }.bind(this), 1000)
  },

  /**
   * 离开该页面所要做的操作
   */
  leave(success=true){
    if (this.progressInterval != null) {
      var icon_type = 'success', title = '连接成功', subtitle = '', btntitle = '完成'
      if (!success){
        icon_type = 'cancel'
        title = '连接失败'
        subtitle = '连接失败了,请检查设备并取消返回去再重新操作'
        btntitle = '取消'
      }
      clearInterval(this.progressInterval)
      this.progressInterval = null
      this.setData({
        progress: 100,
        success: false,
        icon_type: icon_type,
        title: title,
        subtitle: subtitle,
        btntitle: btntitle
      })
    }
    if (this.deviceId != null){
      var deviceId = this.deviceId
      this.deviceId = null
      wx.closeBLEConnection({
        deviceId: deviceId,
        success: function (res) {
          console.log(res)
        }
      })
    }
  },

  cencel(){
    this.leave()
    wx.switchTab({
      url: '/pages/home/home'
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var name = options.name
    var deviceId = options.deviceId
    this.deviceId = deviceId
    this.deviceName = name
    this.services = []
    utils.initConnection(deviceId)
    wx.onBLECharacteristicValueChange(function (res) {
      var str = utils.buf2string(res.value)
      console.log(`devices ${res.deviceId} has changed, now is ${str}`)
      if (res.deviceId == deviceId){
        if (that.isAddData){
          that.readData(str)
          that.isAddData = false
        }
      }
        
    })
    wx.onBLEConnectionStateChange(function (res) {
      console.log('监听蓝牙连接', res)
      if (!res.connected){
        utils.initConnection(deviceId)
      }
    })
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
    var that = this
    that.isAddData = true
    var progressInterval = setInterval(function(){
      if (that.data.progress < 100) {
        that.setData({
          progress: that.data.progress + 1
        })
      } else {
        that.leave(false)
      }
    }.bind(this),100)
    this.progressInterval = progressInterval
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    if (this.progressInterval != null) {
      clearInterval(this.progressInterval)
      this.progressInterval = null
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.cencel()
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