// pages/home/device_charts/device_charts.js
var wxCharts = require('../../../utils/wxcharts-min.js');
var utils = require('../../../utils/utils.js');
var app = getApp();
var windowWidth = 320;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    list: [],
    index: 1,
    chartList: [],
    SimulationDataList: [],
    animationData: '',
    showModalStatus: false
  },

  onTabs(e){
    console.log(e)
    var id = parseInt(e.currentTarget.id)
    this.setData({
      index: id,
    })
  },

  rename: function () {
    if (this.data.showModalStatus) {
      this.hideModal();
    } else {
      this.showModal();
    }
  },

  onDeleteDevice(){
    var that = this
    wx.showModal({
      title: '',
      content: '删除设备吗？',
      success: function (res) {
        if (res.confirm) {
          var dList = wx.getStorageSync('deviceList') || []
          for (var i = 0; i < dList.length; i++) {
            if (dList[i].id == that.device.id) {
              dList.splice(i,1)
            }
          }
          wx.setStorage({
            key: "deviceList",
            data: dList
          })
          wx.closeBluetoothAdapter({
            success: function (res) {
              console.log(res)
            }
          })
          wx.switchTab({
            url: '/pages/home/home'
          })
        }
      }
    })
  },

  touchHandler: function (e) {
    console.log(e)
    var target = parseInt(e.target.target)
    var id = parseInt(e.target.id)
    var list = this.data.list
    var chartList = this.data.chartList
    for (var i = 0; i < list.length; i++) {
      var item = list[i]
      if (item.id == id || item.id == target){
        var lineChart = chartList[i]
        console.log(lineChart.getCurrentDataIndex(e));
        lineChart.showToolTip(e);
      }
    }
  },

  onTestModel(){
    var that = this
    var list = this.data.list
    var chartList = this.data.chartList
    var SimulationDataList = this.data.SimulationDataList
    setTimeout(function () {
      var updateDataInterval = setInterval(function () {
        var chartDataList = []
        for (var i = 0; i < list.length; i++) {
          var item = list[i]
          var lineChart = chartList[i]
          var simulationData = that.updateData(lineChart, item.name, item.unit, SimulationDataList[i], item.valMin)
          chartDataList.push(simulationData)
        }
        that.setData({
          SimulationDataList: chartDataList
        })
      }.bind(this), 2000)
      that.updateDataInterval = updateDataInterval
    }.bind(this), 2000)
  },

  createSimulationData: function (e=10) {
    var categories = [];
    var data = [];
    var nowTime = new Date().getTime() - (10 * 1000)
    for (var i = 0; i < 10; i++) {
      var now = new Date(parseInt(nowTime + (i * 1000)))
      var hour = now.getHours();
      var minute = now.getMinutes();
      var second = now.getSeconds(); 
      categories.push(hour + ':' + minute + ':' + second);
      data.push(Math.random() * (20 - 10) + e);
    }
    // data[4] = null;
    return {
      categories: categories,
      data: data
    }
  },

  updateData: function (chart, name, unit, simulationData, e=10) {
    var now = new Date()
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds(); 
    simulationData.categories.shift()
    simulationData.categories.push(hour + ':' + minute + ':' + second);
    simulationData.data.shift()
    simulationData.data.push(Math.random() * (20 - 10) + e);
    var series = [{
      name: name,
      data: simulationData.data,
      format: function (val, name) {
        return val.toFixed(1) + unit;
      }
    }];
    
    chart.updateData({
      categories: simulationData.categories,
      series: series,
    });
    chart.stopAnimation()
    return simulationData
  },

  /**
   * 更新图表
   */
  updateChart(str) {
    var chartList = this.data.chartList
    var list = wx.getStorageSync('deviceList') || []
    for (var i = 0; i < list.length; i++) {
      if (list[i].deviceId == this.device.deviceId) {
        var arr = str.split(',')
        if (arr.length > 0) {
          var dData = utils.updateData(arr, list[i].ztype, list[i].data_list)
          list[i].value = dData.value
          list[i].data_list = dData.data_list
          wx.setStorage({
            key: "deviceList",
            data: list
          })
          for (var j = 0; j < this.zlist.length; j++) {
            var item = this.zlist[j]
            var lineChart = chartList[j]
            this.updateLineChart(lineChart, dData.data_list[j], item.name,item.unit)
          }
        }
      }
    }
  },

  updateLineChart(lineChart, simulationData, name, unit){
    var series = [{
      name: name,
      data: simulationData.data,
      format: function (val, name) {
        console.log('format', unit)
        return val.toFixed(1) + unit;
      }
    }];
    lineChart.updateData({
      categories: simulationData.categories,
      series: series,
    });
    lineChart.stopAnimation()
  },

  initChart(canvasId, name, unit, title, simulationData){
    //initChart('tempChart','温度','℃','温度 (℃)',simulationData)
    //var simulationData = this.createSimulationData();
    var chart = new wxCharts({
      canvasId: canvasId,
      type: 'line',
      categories: simulationData.categories,
      animation: true,
      background: '#f5f5f5',
      series: [{
        name: name,
        data: simulationData.data,
        format: function (val, name) {
          return val.toFixed(1) + unit;
        }
      }],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        title: title,
        format: function (val) {
          return val.toFixed(1);
        },
        //min: 0
      },
      width: windowWidth,
      height: 200,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });
    return chart
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    wx.setNavigationBarTitle({
      title: options.name
    })
    this.inputinfo = options.name
    this.setData({
      name: options.name,
    })
    var that = this
    var dList = utils.initTestModel()
    this.device = null
    this.updateDataInterval = null
    for (var i = 0; i < dList.length; i++){
      if (dList[i].id == parseInt(options.id)){
        this.device = dList[i]
      }
    }
    if (this.device == null)
      return
    var list = utils.getTypeList(this.device.ztype)
    this.zlist = list
    var chartList = []
    var SimulationDataList = []
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    if (!this.device.dmode){
      console.log('dmode', this.device.dmode)
      wx.onBLECharacteristicValueChange(function(res){
        if (that.data.index == 1){
          var str = utils.buf2string(res.value)
          console.log(`charts-deviceId ${res.deviceId} is ${str}`)
          that.updateChart(str)
        }
      })
    }
    for (var i = 0; i < list.length; i++){
      var item = list[i]
      var simulationData = {}
      if (this.device.dmode){
        simulationData = this.createSimulationData(item.valMin);
      }else{
        simulationData = this.device.data_list[i]
      }
      SimulationDataList.push(simulationData)
      var lineChart = this.initChart(item.canvasId, item.name, item.unit, item.title, simulationData)
      chartList.push(lineChart)
    }
    this.setData({
      list: list,
      chartList: chartList,
      SimulationDataList: SimulationDataList
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
    var developerMode = wx.getStorageSync('developerMode') || false
    if (developerMode) {
      if (this.device.dmode){
        this.onTestModel()
      } 
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    var developerMode = wx.getStorageSync('developerMode') || false
    if (developerMode) {
      if (this.updateDataInterval != null){
        clearInterval(this.updateDataInterval)
        this.updateDataInterval = null
      }
    }
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
  
  },
  showModal: function () {
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
  },
  
  hideModal: function () {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  },
  click_cancel: function () {
    this.hideModal();
  },
  click_ok: function () {
    console.log("点击了确定===，输入的信息为为==", this.inputinfo);
    this.device.name = this.inputinfo
    var dList = wx.getStorageSync('deviceList') || []
    for (var i = 0; i < dList.length; i++) {
      if (dList[i].id == this.device.id) {
        dList[i] = this.device
      }
    }
    wx.setStorage({
      key: "deviceList",
      data: dList
    })
    this.setData({
      name: this.inputinfo
    })
    wx.setNavigationBarTitle({
      title: this.inputinfo
    })
    this.hideModal();
  },
  input_content: function (e) {
    console.log(e);
    this.inputinfo = e.detail.value;
  }
})