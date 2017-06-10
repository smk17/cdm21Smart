// pages/home/home.js
var characteristicId = "0000ffe1-0000-1000-8000-00805f9b34fb"
var utils = require('../../utils/utils.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    device_list:[]
  },

  onLongTap(e){
    var device = e.currentTarget.dataset.device
    var that = this
    wx.showActionSheet({
      itemList: ['删除设备'],
      success: function (res) {
        if (res.tapIndex == 0){
          var dList = wx.getStorageSync('deviceList') || []
          for (var i = 0; i < dList.length; i++) {
            if (dList[i].id == device.id) {
              dList.splice(i, 1)
            }
          }
          wx.setStorage({
            key: "deviceList",
            data: dList
          })
          that.setData({
            device_list: dList
          })
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },

  onDeviceChart(e){
    var device = e.currentTarget.dataset.device
    if (device.value == ''){
      wx.showLoading({
        title: '重新连接中',
        mask: true
      })
      if (device.dmode){
        setTimeout(function () {
          wx.showModal({
            title: '连接失败',
            content: '设备连接设备,请查看帮助正确设置设备！',
            confirmText: '帮助',
            success: function (res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/help/help?ztype=' + 1,
                })
              }
              wx.hideLoading()
            }
          })
        }, 2000)
      }else{
        utils.initConnection(device.deviceId, function (res) {
          wx.showModal({
            title: '连接失败',
            content: '设备连接设备,请查看帮助正确设置设备！',
            confirmText: '帮助',
            success: function (res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/help/help?ztype=' + ztype,
                })
              }
              wx.hideLoading()
            }
          })
        }, device.ztype)
      }
      
    }else{
      var parameter = 'id=' + device.id + '&name=' + device.name
      wx.navigateTo({
        url: 'device_detail/device_detail?' + parameter,
      })
    }
  },

  initDeviceList(){
    var that = this
    var deviceList = wx.getStorageSync('deviceList') || []
    var developerMode = wx.getStorageSync('developerMode') || false
    if (developerMode) {
      deviceList = utils.initTestModel()
    }
    if (deviceList.length > 0){
      this.setData({
        device_list: deviceList
      })
      wx.openBluetoothAdapter({
        success: function (res) {
          console.log(res)
          for (var i = 0; i < deviceList.length; i++) {
            var device = deviceList[i]
            console.log(device.deviceName + ':' + device.deviceId)
            that.onSignOut(device.deviceId)
            utils.initConnection(device.deviceId)
          }
          wx.onBLECharacteristicValueChange(function (res) {
            var str = utils.buf2string(res.value)
            console.log(`home-deviceId ${res.deviceId} is ${str}`)
            var list = wx.getStorageSync('deviceList') || []
            for (var i = 0; i < list.length; i++) {
              if (list[i].deviceId == res.deviceId) {
                wx.hideLoading()
                var arr = str.split(',')
                //list[i].ztype
                if (arr.length > 0){
                  var dData = utils.updateData(arr, list[i].ztype, list[i].data_list)
                  list[i].value = dData.value
                  list[i].data_list = dData.data_list
                  wx.setStorage({
                    key: "deviceList",
                    data: list
                  })
                  if (!developerMode) {
                    that.setData({
                      device_list: list
                    })
                  }
                }
              }
            }
          })
          wx.onBLEConnectionStateChange(function (res) {
            // 该方法回调中可以用于处理连接意外断开等异常情况
            console.log(`device ${res.deviceId} ,connected: ${res.connected}`)
            if (res.connected){
              that.onSignOut(res.deviceId)
            }
          })
        }
      })
      
    }
    
  },

  onSignOut(deviceId){
    var list = wx.getStorageSync('deviceList') || []
    var developerMode = wx.getStorageSync('developerMode') || false
    for (var i = 0; i < list.length; i++) {
      if (list[i].deviceId == deviceId) {
        list[i].value = ''
        wx.setStorage({
          key: "deviceList",
          data: list
        })
        if (!developerMode) {
          this.setData({
            device_list: list
          })
        }
      }
    }
  },

  onTestModel(){
    var that = this
    var testInterval = setInterval(function () {
      that.setData({
        device_list: utils.initTestModel()
      })
    }.bind(this), 2000)
    this.testInterval = testInterval
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    this.setData({
      device_list: []
    })
    var developerMode = wx.getStorageSync('developerMode') || false
    if (developerMode) {
      this.setData({
        device_list: utils.initTestModel()
      })
      this.onTestModel()
    }
    this.initDeviceList()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    var developerMode = wx.getStorageSync('developerMode') || false
    if (developerMode) {
      clearInterval(this.testInterval)
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    var developerMode = wx.getStorageSync('developerMode') || false
    if (developerMode) {
      clearInterval(this.testInterval)
    }
    wx.closeBluetoothAdapter({
      success: function (res) {
        console.log(res)
      }
    })
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