const { fetchDDE } = require("./fetchDDE")
const EventEmitter = require('events')

const eventEmitter = new EventEmitter()

class SwitchData {
  constructor(serverName, itemName, eventName, monKey) {
    this.serverName = serverName
    this.itemName = itemName
    this.eventName = eventName
    this.monKey = monKey
  }

  update() {
    let temp = this.currentValue
    try {
      this.currentValue = fetchDDE(this.serverName, this.itemName)
      this.lastValue = temp
      if (this.currentValue !== this.lastValue) {
        eventEmitter.emit(this.eventName, this.currentValue, this.monKey)
      }
    } catch (err) {
      console.log(err)
    }
  }
}


// 判断柜的重量与秤累计量的差值是否小于某个数据
class CabinetOutputData {
  constructor(location, cabinetOutputNr, serverName, weighAccItemName, cabinetTotalItemName,
              inModeItemName, highFreqSettingItemName, lowFreqSettingItemName, diff) {
    this.location = location
    this.serverName = serverName
    this.weighAccItemName = weighAccItemName
    this.cabinetOutputNr = cabinetOutputNr
    this.diff = diff
    this.alreadyEmit = false
    this.cabinetTotal = await fetchDDE(serverName, cabinetTotalItemName)

    checkOutputFreq(inModeItemName,highFreqSettingItemName, lowFreqSettingItemName)
  }

  update() {
    try {
      let weightAcc = fetchDDE(this.serverName, this.weighAccItemName)
      if (this.cabinetTotal - weightAcc < this.diff && !this.alreadyEmit) {
        // eventEmitter.emit('CabinetHalfEye', this.lineName, this.cabinetOutputNr)
        console.log(`${this.location} ${this.cabinetOutputNr} total less than ${this.diff}`)
        this.alreadyEmit = true
      }
    } catch (err) {
      console.log(err)
    }
  }

  async checkOutputFreq(inModeItemName,highFreqSettingItemName, lowFreqSettingItemName) {
    let [inMode, highFreqSetting, lowFreqSetting] = await Promise.all([
      fetchDDE(this.serverName, inModeItemName),
      fetchDDE(this.serverName, highFreqSettingItemName),
      fetchDDE(this.serverName, lowFreqSettingItemName)
    ])

    console.log(inMode, highFreqSetting, lowFreqSetting)
  }
}

module.exports = {
  SwitchData,
  CabinetOutputData,
  eventEmitter
}
