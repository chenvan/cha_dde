const term = require("terminal-kit").terminal

/*
monDict:
  {
    "加料": [],
    "回潮": []
  }
*/

let _monDict

function renderAddFlavour(addFlavour) {
  term(`${addFlavour.line}状态: ${padLeft(10, addFlavour.state)}\n`)
  renderWeigthBell("主秤", addFlavour.mainWeightBell)
  renderCabinet(addFlavour.cabinet)

  for (device of addFlavour.deviceList) {
    renderDeviceState(device)
  }
}

function renderAddWater(addWater) {
  term(`${addWater.line}状态: ${padLeft(10, addWater.state)}\n`)
  renderWeigthBell("主秤", addWater.mainWeightBell)
  renderWeigthBell("薄片秤", addWater.flakeWeightBell)

  for (device of addWater.deviceList) {
    renderDeviceState(device)
  }
}

function renderWeigthBell(name, weightBell) {
  term(`${name}状态: ${padLeft(10,weightBell.state)}\n`)
  term(`设定流量 / 实际流量 / 累计量: ${padLeft(20, addSlash([weightBell.setting, weightBell.real, weightBell.accu]))}\n`)
  renderDeviceState(weightBell.electEye)
}

function renderCabinet(cabinet) {
  term(`出柜状态: ${padLeft(10, cabinet.state)}\n`)
  term(`出柜号: ${padLeft(10, cabinet.outputNr % 100)}\n`)
}

function renderDeviceState(device) {
  let string
  
  if(device.specifyState !== undefined) {
    string = `监控状态 / 运行状态 / 最大持续时间 / 持续时间: ${padLeft(30, addSlash([device.specifyState, device.deviceState, device.maxDuration, (Date.now() - device.lastUpdateMoment) / 1000 ]))}\n`
  } else {
    string = `运行状态 / 最大持续时间 / 持续时间: ${padLeft(25, addSlash([device.deviceState, device.maxDuration, (Date.now() - device.lastUpdateMoment) / 1000 ]))}\n`
  }

  term(device.deviceName + ": " + string)
}

function init(monDict) {
  _monDict = monDict
  term.clear()
}

function render() {
  // term.moveTo(1, 1)
  term.clear()
  for (const [key, monList] of Object.entries(_monDict)) {
    if (key === "回潮") {
      monList.forEach(mon => renderAddWater(mon))
    } else if (key === "加料") {
      monList.forEach(mon => renderAddFlavour(mon))
    }
  }
}


// pad, padLeft, padRight
function pad(pad, str, padLeft) {
  if (typeof str === 'undefined') 
    return pad;
  if (padLeft) {
    return (pad + str).slice(-pad.length);
  } else {
    return (str + pad).substring(0, pad.length);
  }
}

function padLeft(padNum, str) {
  return pad(Array(padNum).join(" "), str, true)
}

function padRigth(padNum, str){
  return pad(Array(padNum).join(" "), str, false)
}

function addSlash(strList) {
  let newStrList = strList.map(str => {
    if (str === undefined) {
      return padLeft(2, str)
    } else {
      return str
    }
  })

  return newStrList.join(' / ')
}

module.exports = {
  render,
  init
}