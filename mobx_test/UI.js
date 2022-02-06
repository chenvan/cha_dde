function genWeigthBellState(name, weightBell) {
  return `${name} ` + 
    `状态: ${weightBell.state} 设定流量 / 实际流量 / 累计量: ${weightBell.setting} / ${weightBell.real} / ${weightBell.accu}\n` + 
    genDeviceState(weightBell.electEye)
}

function genCabinetState(cabinet) {
  return `出柜号: ${cabinet.outputNr % 100} 出柜状态: ${cabinet.state}\n`
}

function genDeviceState(device) {
  let output = `运行状态 / 临界持续时间 / 持续时间: ${device.deviceState} / ${device.maxDuration} / ${(Date.now() - device.lastUpdateMoment) / 1000 }\n`
  
  if(device.specifyState !== undefined) {
    output = `监控状态 / 运行状态 / 临界持续时间 / 持续时间: ${device.specifyState} / ${device.deviceState} / ${device.maxDuration} / ${(Date.now() - device.lastUpdateMoment) / 1000 }\n`
  }

  return `${device.deviceName} ` + output
}

function genAddFlavourState(addFlavour) {
  return  `批号: ${addFlavour.id} 状态: ${addFlavour.state}\n` +
    genCabinetState(addFlavour.cabinet) +
    genWeigthBellState("主秤", addFlavour.mainWeightBell) + 
    addFlavour.deviceList.map(device => genDeviceState(device)).join('')
}

function genAddWaterState(addWater) {
  return  `回潮批号: ${addWater.idMap['回潮批号']} 除杂批号: ${addWater.idMap['除杂批号']} 状态: ${addWater.state}\n` +
    genWeigthBellState("主秤", addWater.mainWeightBell) + 
    genWeigthBellState("薄片秤", addWater.flakeWeightBell) +
    addWater.deviceList.map(device => genDeviceState(device)).join('')
}


module.exports = {
  genAddFlavourState,
  genAddWaterState,
}
