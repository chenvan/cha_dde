const { fetchDDE } = require('../fetchDDE.js')
const cabinetConfig = require('../config/CabinetConfig.json')

class CabinetInfo {
  constructor(serverName, config) {
    this.serverName = serverName
    this.config = config
    this.diff = config.diff
  }

  async init() {
    // 如何 catch error
    // 获得所出柜的信息. 总量, 高频设定, 低频设定, 进柜方式, diff
    [this.total, this.hFreqSet, this.lowFreqSet, this.inMode] = await Promse.All([
      fetchDDE(this.serverName, this.config['cabinetTotalItemName'], 'int'),
      fetchDDE(this.serverName, this.config['highFreqSettingItemName'], 'int'),
      fetchDDE(this.serverName, this.config['lowFreqSettingItemName'], 'int'),
      fetchDDE(this.serverName, this.config['inModeItemName'], 'int'),
    ]) 
  }
}

class CabinetOutput {
  constructor(location, serverName, outputNr) {
    this.location = location
    this.cabinetInfo = new CabinetInfo(serverName, cabinetConfig[location][outputNr])
  }

  static isExistOutpurNr(location, outpurNr) {
    return cabinetConfig[location].hasOwnProperty(outpurNr)
  }
  
  async init () {
    await this.cabinetInfo.init()
  }


}

module.exports = {
  CabinetOutput
}