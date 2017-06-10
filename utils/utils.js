var characteristicId = "0000ffe1-0000-1000-8000-00805f9b34fb";

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

/**
 * 发送数据给蓝牙设备
 */
function writeData(str, deviceId, serviceId, characteristicId){
  if (str.length <= 0 || str.length > 0 || this.terminal_data == null){
    return;
  };
  let buffer = new ArrayBuffer(str.length);
  let dataView = new DataView(buffer);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    dataView.setUint8(i, str.charCodeAt(i));
  };
  wx.writeBLECharacteristicValue({
    deviceId: deviceId,
    serviceId: serviceId,
    characteristicId: characteristicId,
    value: buffer,
    success: function (res) {
      console.log('写入数据', res);
    },
  });
};

function readDateToName(ztype){
  var name = '模组';
  switch (ztype) {
    case 1:
      name = '温湿度模块';
      break;
    case 2:
      name = 'CO模块';
      break;
    case 3:
      name = 'PM2.5模块';
      break;
    case 4:
      name = 'VOL模块';
      break;
    case 5:
      name = '厨房模组';
      break;
    case 6:
      name = '客厅模组';
      break;
    default:
      break;
  }
  return name;
}

function readDateInStorage(arr, deviceId, deviceName){
  var deviceList = wx.getStorageSync('deviceList') || [];
  var id = deviceList.length + 1;
  var name = '未知模组';
  var time = getNowTime();
  var data_list = [];
  switch (deviceName){
    case 'CDM21-TH':
      name = '温湿度' + '-' + id;
      id = parseInt('1' + id);
      break;
    case 'CDM21-CO':
      name = 'CO' + '-' + id;
      id = parseInt('2' + id);
      break;
    case 'CDM21-PM25':
      name = 'PM2.5' + '-' + id;
      id = parseInt('3' + id);
      break;
    case 'CDM21-VOL':
      name = 'VOL' + '-' + id;
      id = parseInt('4' + id);
      break;
    case 'CDM21-CF':
      name = '厨房模组' + '-' + id;
      id = parseInt('5' + id);
      break;
    case 'CDM21-KT':
      name = '客厅模组' + '-' + id;
      id = parseInt('6' + id);
      break;
    default:
      break;
  }
  for (var i = 0; i < arr.length; i++){
    var data = Number(arr[i]);
    data_list.push({
      categories: [time],
      data: [data]
    });
  };
  var device = {
    id: id,
    name: name,
    deviceName: deviceName,
    ztype: 1,
    value: '',
    deviceId: deviceId,
    data_list: data_list,
    dmode: false
  };
  deviceList.push(device);
  wx.setStorage({
    key: "deviceList",
    data: deviceList
  });
};

function initTestModel(){
  var temp = Math.random() * (20 - 10) + 20;
  var humi = Math.random() * (20 - 10) + 70;
  var pm25 = Math.random() * (20 - 10) + 120;
  var thval = 'T:' + temp.toFixed(1) + '℃\nH:' + humi.toFixed(1) + '%RH';
  var pm25val = pm25.toFixed(1) + 'μg/m³';
  var deviceList = wx.getStorageSync('deviceList') || [];
  var list =
    [{ id: 1, name: '温湿度-BETA', ztype: 1, value: thval, dmode: true },
      { id: 2, name: 'PM2.5-BETA', ztype: 2, value: pm25val, dmode: true },
      { id: 3, name: 'CO-BETA', ztype: 3, value: '0μg/m³', dmode: true },
      { id: 4, name: 'Vol-BETA', ztype: 4, value: '', dmode: true }];
  deviceList.push(list[0]);
  deviceList.push(list[1]);
  deviceList.push(list[2]);
  deviceList.push(list[3]);
  return deviceList;
};

function getTypeList(ztype){
  var list = [];
  switch (ztype) {
    case 1: //温湿度
      list = [{ id: '1', shortName: 'T', name: '温度', canvasId: 'tempChart', unit: '℃', title: '温度 (℃)', valMin: 15 },
      { id: '2', shortName: 'H', name: '湿度', canvasId: 'humiChart', unit: '%RH', title: '湿度 (%RH)', valMin: 50 }];
      break;
    case 2: //PM2.5
      list = [{ id: '1', shortName: 'PM25', name: 'PM2.5', canvasId: 'pm25Chart', unit: 'μg/m³', title: 'PM2.5 (μg/m³)', valMin: 70 }];
      break;
    case 3: //CO
      list = [{ id: '1', shortName: 'CO', name: 'CO', canvasId: 'coChart', unit: 'μg/m³', title: 'CO (μg/m³)', valMin: 0 }];
      break;
    case 4: //Vol
      list = [{ id: '1', shortName: 'Vol', name: 'VOL', canvasId: 'VolChart', unit: 'μg/m³', title: 'VOL (μg/m³)', valMin: 2 }];
      break;
    default:
      break;
  };
  return list;
}

function updateData(arr, ztype, data_list){
  var zlist = getTypeList(ztype);
  var time = getNowTime();
  var value = '';
  for (var j = 0; j < zlist.length; j++) {
    var val = Number(arr[j]);
    var unit = zlist[j].unit;
    value += j == 0 ? '' : '\n';
    value += zlist.length == 0 ? '' : zlist[j].shortName + ':';
    value += val + unit;

    if (data_list[j].data.length > 10) {
      data_list[j].categories.shift();
      data_list[j].data.shift();
    };
    data_list[j].data.push(val);
    data_list[j].categories.push(time);
  };
  return {
    value: value,
    data_list: data_list
  };
};

module.exports = {
  buf2string: buf2string,
  initTestModel: initTestModel,
  initConnection: initConnection,
  readDateInStorage: readDateInStorage,
  readDateToName: readDateToName,
  getTypeList: getTypeList,
  updateData: updateData
};