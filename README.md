# cdm21智能家居
> 微信小程序可以使用蓝牙进行通讯啦~
> 在这里记录下使用微信小程序开发我司的小程序<!--more-->

# 体验
基于微信小程序--蓝牙通讯的小程序->cdm21智能家居已发布，可扫一扫下面小程序码进行体验
![cdm21智能家居](98/1.jpg)

# 源码
点击[这里](https://github.com/smk17/cdm21Smart)查看源码

#  硬件设备
该小程序使用的蓝牙模块是[汇承HC-08蓝牙模块4.0](https://item.taobao.com/item.htm?spm=1002.81.5.1.MQqNI0&id=36426439097&item_id=36426439097),配置里除了改了名字其它不变。



#  搜索蓝牙设备

根据[微信小程序官方API](https://mp.weixin.qq.com/debug/wxadoc/dev/api/bluetooth.html)编程，搜索蓝牙设备选择并连接对应设备：（该代码段位于add_device.js的scan函数）

~~~ js
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
~~~

# 连接设备并通讯

PS: 在小程序端接受到蓝牙设备的数据类型为ArrayBuffer类型，在小程序IDE打印显示为ArrayBuffer，显示不出具体数据，需要使用以下函数转成字符串(当初还一直以为没有接受到数据呢~~)

~~~ js
/**
* 把ArrayBuffer类型的数据转换成字符串
*/
function buf2string (buffer) { // buffer is an ArrayBuffer
  var arr = Array.prototype.map.call(new Uint8Array(buffer), x => x);
  var str = '';
  for (var i = 0; i < arr.length; i++) {
    str += String.fromCharCode(arr[i]);
  };
  return str;
};

function getNowTime(){
  var now = new Date();
  var hour = now.getHours();
  var minute = now.getMinutes();
  var second = now.getSeconds();
  var time = hour + ':' + minute + ':' + second;
  return time;
};
~~~

蓝牙设备接受数据只需知道通讯特征值并启用通知，然后调用wx.onBLECharacteristicValueChange函数启用低功耗蓝牙设备特征值变化时的 notify 功能，当接受到蓝牙设备发送过来的数据就会调用该函数了。

~~~ js
/**
 * 连接对应的蓝牙设备并获取所有service服务和characteristic特征值
 */
function initConnection(deviceId, failcb = null) {
  wx.createBLEConnection({
    deviceId: deviceId,
    fail: function (res) {
      console.log('连接蓝牙sb', res);
      typeof failcb == 'function' && failcb(res)
    },
    success: function (res) {
      console.log('连接蓝牙', res);
      wx.getBLEDeviceServices({
        deviceId: deviceId,
        success: function (service) {
          console.log('获取蓝牙所有service服务', service);
          var services = service.services;
          services.forEach(function (value, index, array) {
            wx.getBLEDeviceCharacteristics({
              deviceId: deviceId,
              serviceId: value.uuid,
              success: function (characteristics) {
                console.log(index + '-获取蓝牙characteristic特征值', characteristics);
                array[index].characteristics = characteristics.characteristics;
                services = services;
                if (index == (array.length - 1)) {
                  select_characteristics(deviceId, services);
                };
              },
            });
          });
        },
      });
    },
  });
};

/**
 * 寻找需要的通讯特征值并启用通知
 */
function select_characteristics(deviceId, services) {
  services.forEach(function (value, index, array) {
    array[index].characteristics.forEach(function (values, indexs, arrays) {
      if (values.uuid == characteristicId) {
        console.log('找到通讯特征值', values);
        wx.notifyBLECharacteristicValueChange({
          deviceId: deviceId,
          serviceId: value.uuid,
          characteristicId: values.uuid,
          state: true,
          success: function (res) {
            console.log('启用notify', res);
          },
        });
      };
    });
  });
};
~~~

#  总结

微信小程序的蓝牙通讯基本过程就如此了。。。
