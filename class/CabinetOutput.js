const { fetchDDE } = require('../fetchDDE.js')
const { speakTwice } = require('../speak')
const cabinetConfig = require('../config/CabinetConfig.json')

class CabinetInfo {
  constructor(serverName) {
    this.serverName = serverName
  }

  async init(config) {
    // 获得所出柜的信息. 总量, 低频设定, 进柜方式, diff
    this.diff = config.diff
    this.halfEyeItemName = config["halfEyeItemName"]
    this.isTrigger = false
 
    let lFreqSet, inMode; 
    [this.total, lFreqSet, inMode] = await Promise.all([
      fetchDDE(this.serverName, config['cabinetTotalItemName'], 'int'),
      // fetchDDE(this.serverName, config['highFreqSettingItemName'], 'int'),
      fetchDDE(this.serverName, config['lowFreqSettingItemName'], 'int'),
      fetchDDE(this.serverName, config['inModeItemName'], 'int'),
    ]) 
    
    console.log(`出柜低频设置 -> ${lFreqSet}, 入柜方式 -> ${inMode}`)

    // 检查出柜底带频率
    if(inMode) {
      // this.inMode 在出料尾段会变成 0
      const { refLFreq, refTotal } = config['referSetting']
      
      let adjustTotal = (100 / inMode) * this.total
      // 计算公式, 应该要和加料的秤流量关联
       return Math.abs(lFreqSet - refTotal * refLFreq / adjustTotal) < 3 
    }

    return true
  }
}

class CabinetOutput {
  constructor(location, serverName) {
    this.location = location
    this.serverName = serverName
    this.cabinetInfo = new CabinetInfo(serverName)
    this.weightAccuItemName = cabinetConfig[location]["weightAccuItemName"]
    this.isMon = false
    this.isInitSuccess = false
  }

  static isExistOutpurNr(location, outpurNr) {
    return cabinetConfig[location].hasOwnProperty(outpurNr)
  }
  
  async init (outputNr) {
    // console.log("in cabinetoutput init")
    // this.cabinetInfo = new CabinetInfo(this.serverName, cabinetConfig[this.location][outputNr])
    this.outpurNr = outputNr
    this.hmiOutputNr = outputNr % 100
    
    let isLFreqSettingCorrect = await this.cabinetInfo.init(cabinetConfig[this.location][outputNr])

    if(!isLFreqSettingCorrect) {
      speakTwice(`${this.location} ${this.hmiOutputNr}号柜底带频率建议调整`)
    }

    this.isInitSuccess = true
  }

  async update() {
  
    if(!this.isMon) return
    if(!this.isInitSuccess) this.init(this.outpurNr)

    let weightAccu = await fetchDDE(this.serverName, this.weightAccuItemName, "int")
    
    console.log(`${this.cabinetInfo.total} - ${weightAccu} => ${this.cabinetInfo.diff}; isTrigger: ${this.cabinetInfo.isTrigger}`)
    
    // 当 柜的存量 - 下游秤累计量 小于 下限值, 检查半柜电眼是否被遮挡 
    if (this.cabinetInfo.total - weightAccu < this.cabinetInfo.diff && !this.cabinetInfo.isTrigger) {

      let halfEye = await fetchDDE(this.serverName, this.cabinetInfo.halfEyeItemName, "int")

      console.log(`${this.cabinetInfo.total} - ${weightAccu} < ${this.cabinetInfo.diff}; halfEye: ${halfEye}`)

      if (halfEye === 1) {
        speakTwice(`${this.location} ${this.hmiOutputNr}号柜没有转高速`)
      }

      this.cabinetInfo.isTrigger = true
      this.isMon = false
    }
    
  }

}

module.exports = {
  CabinetOutput
}