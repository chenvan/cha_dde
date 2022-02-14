'use strict'

const { now } = require('mobx-utils')

function genWeigthBellState(name, weightBell) {

  return genNameAndState(name, weightBell.state, "运行正常", "运行停止") + 
    ` 设定流量 / 实际流量 / 累计量: ${weightBell.setting} / ${weightBell.real} / ${weightBell.accu}\n` + 
    genDeviceState(weightBell.electEye)
}

function genCabinetState(cabinet) {
  return genNameAndState("出柜", cabinet.state, "监控") + ` : ${cabinet.outputNr % 100}\n`
}

function genDeviceState(device) {

  let output = `${device.deviceName}`
  let interval = (now() - device.lastUpdateMoment) / 1000
  let symbol = device.maxDuration >= interval ? ">=" : "<"
  let isRed = symbol === "<" && ( device.specifyState === undefined || (device.specifyState !== undefined && device.specifyState === device.deviceState))

  if(device.specifyState !== undefined) {
    output += `(${device.specifyState} ${device.deviceState}) `
    output += device.specifyState === device.deviceState ? `${device.maxDuration} ${symbol} ${interval}\n` : `\n`
  } else {
    output += `(${device.deviceState}) ${device.maxDuration} ${symbol} ${interval}\n` 
  }

  return isRed? "{red-fg}" + output + "{/}" : output
}

function genNameAndState(name, state, greenState, redState) {
  let content = `${name}`
  if (state === greenState) {
    content += "{green-fg}" + `(${state})` + "{/}"
  } else if (state === redState) {
    content += "{red-fg}" + `(${state})` + "{/}"
  } else {
    content += `(${state})`
  }
  return content
}

function updateAddFlavourState(addFlavour) {
  let label = genNameAndState(addFlavour.line, addFlavour.state, "监控", "出错")
  let content = `牌号: ${addFlavour.brandName}\n批号: ${addFlavour.id}\n` +
    genCabinetState(addFlavour.cabinet) +
    `${addFlavour.cabinet.total} - ${addFlavour.mainWeightBell.accu} = ${addFlavour.cabinet.total - addFlavour.mainWeightBell.accu}\n` +
    genWeigthBellState("主秤", addFlavour.mainWeightBell) + 
    addFlavour.deviceList.map(device => genDeviceState(device)).join('')

  addFlavour.container.setLabel(label)
  addFlavour.container.setContent(content)
}

function updateAddWaterState(addWater) {
  let label = genNameAndState(addWater.line, addWater.state, "监控", "出错")
  let content = `牌号: ${addWater.brandName}\n回潮批号: ${addWater.idMap['回潮批号']} 除杂批号: ${addWater.idMap['除杂批号']}\n` +
    genWeigthBellState("主秤", addWater.mainWeightBell) + 
    genWeigthBellState("薄片秤", addWater.flakeWeightBell) +
    addWater.deviceList.map(device => genDeviceState(device)).join('')

  addWater.container.setLabel(label)
  addWater.container.setContent(content)
}


module.exports = {
  updateAddFlavourState,
  updateAddWaterState,
}
