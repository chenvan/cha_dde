const { fetchDDE } = require('../fetchDDE.js')
const { speakTwice } = require('../speak')
const cabinetConfig = require('../config/CabinetConfig.json')

class CabinetInfo {
  constructor(serverName, config) {
    this.serverName = serverName
    this.config = config
    this.diff = config.diff
    this.halfEyeItemName = config["halfEyeItemName"]
    this.isTrigger = false
  }

  async init(hmiOutputNr) {
    // 获得所出柜的信息. 总量, 高频设定, 低频设定, 进柜方式, diff
    [this.total, this.hFreqSet, this.lFreqSet, this.inMode] = await Promise.all([
      fetchDDE(this.serverName, this.config['cabinetTotalItemName'], 'int'),
      fetchDDE(this.serverName, this.config['highFreqSettingItemName'], 'int'),
      fetchDDE(this.serverName, this.config['lowFreqSettingItemName'], 'int'),
      fetchDDE(this.serverName, this.config['inModeItemName'], 'int'),
    ]) 
    // this.inMode 有可能是零
    console.log(this.hFreqSet, this.lFreqSet, this.inMode)
    
    // 检查出柜底带频率
  }
}

class CabinetOutput {
  constructor(location, serverName) {
    this.location = location
    this.serverName = serverName
    this.weightAccuItemName = cabinetConfig[this.location]["weightAccuItemName"]
    this.isMon = false
  }

  static isExistOutpurNr(location, outpurNr) {
    return cabinetConfig[location].hasOwnProperty(outpurNr)
  }
  
  async init (outputNr) {
    // console.log("in cabinetoutput init")
    this.cabinetInfo = new CabinetInfo(this.serverName, cabinetConfig[this.location][outputNr])
    this.hmiOutputNr = outputNr % 100
    await this.cabinetInfo.init(this.hmiOutputNr)
  }

  async update() {
    if (!this.isMon) return
    let weightAccu = await fetchDDE(this.serverName, this.weightAccuItemName, "int")
    
    console.log(weightAccu)
    
    // 当 柜的存量 - 下游秤累计量 小于 下限值, 检查半柜电眼是否被遮挡 
    if (this.cabinetInfo.total - weightAccu < this.diff && !this.cabinetInfo.isTrigger) {
      this.cabinetInfo.isTrigger = true
      this.isMon = false

      let halfEye = await fetchDDE(this.serverName, this.halfEyeItemName, "int")

      if (halfEye === 1) {
        speakTwice(`${this.location} ${this.hmiOutputNr}号柜没有转高速`)
      }
    }
  }

}

module.exports = {
  CabinetOutput
}