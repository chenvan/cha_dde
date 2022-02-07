const { now } = require('mobx-utils')

function genWeigthBellState(name, weightBell) {

  return `${name}(${weightBell.state}) ` + 
    `设定流量 / 实际流量 / 累计量: ${weightBell.setting} / ${weightBell.real} / ${weightBell.accu}\n` + 
    genDeviceState(weightBell.electEye)
}

function genCabinetState(cabinet) {
  return `出柜(${cabinet.state}): ${cabinet.outputNr % 100}\n`
}

function genDeviceState(device) {

  let output = `${device.deviceName}`
  let interval = (now() - device.lastUpdateMoment) / 1000
  let symbol = device.maxDuration >= interval ? ">=" : "<"
  let isRed = symbol === "<" && ( device.specifyState === undefined || (device.specifyState !== undefined && device.specifyState === device.deviceState))

  if(device.specifyState !== undefined) {
    output += `(${device.specifyState} ${device.deviceState}) `
    output += device.specifyState === device.deviceState ? `${device.maxDuration} ${symbol} ${interval}\n` : "\n"
  } else {
    output += `(${device.deviceState}) ${device.maxDuration} ${symbol} ${interval}\n` 
  }

  return isRed? "{red-fg}" + output + "{/}" : output
}

function genAddFlavourState(addFlavour) {
  return  `批号: ${addFlavour.id}\n` +
    genCabinetState(addFlavour.cabinet) +
    genWeigthBellState("主秤", addFlavour.mainWeightBell) + 
    addFlavour.deviceList.map(device => genDeviceState(device)).join('')
}

function genAddWaterState(addWater) {
  return  `回潮批号: ${addWater.idMap['回潮批号']} 除杂批号: ${addWater.idMap['除杂批号']}\n` +
    genWeigthBellState("主秤", addWater.mainWeightBell) + 
    genWeigthBellState("薄片秤", addWater.flakeWeightBell) +
    addWater.deviceList.map(device => genDeviceState(device)).join('')
}


module.exports = {
  genAddFlavourState,
  genAddWaterState,
}
