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

  async update() {
    let temp = this.currentValue
    try {
      let fetchData = await fetchDDE(this.serverName, this.itemName)
      this.currentValue = parseInt(fetchData, 10)
      this.lastValue = temp
      if (this.currentValue !== this.lastValue) {
        console.log(`trigger: ${fetchData} -> ${this.currentValue} ${this.lastValue}`)
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
    this.initCabinetTotal = false
    this.cabinetTotalItemName = cabinetTotalItemName
    
    this.checkOutputFreq(inModeItemName,highFreqSettingItemName, lowFreqSettingItemName)
  }

  async update() {
    try {
      
      if (!this.initCabinetTotal) {
        this.cabinetTotal = parseInt(await fetchDDE(this.serverName, this.cabinetTotalItemName), 10)
        this.initCabinetTotal = true
      }

      let weightAcc = parseInt(await fetchDDE(this.serverName, this.weighAccItemName), 10)

      // console.log(`${this.cabinetTotal} - ${weightAcc} = ${this.cabinetTotal - weightAcc}`)

      if (this.cabinetTotal - weightAcc < this.diff && !this.alreadyEmit) {
        // eventEmitter.emit('CabinetHalfEye', this.lineName, this.cabinetOutputNr)
        console.log(`${this.location} ${this.cabinetOutputNr}: ${this.cabinetTotal} - ${weightAcc} < ${this.diff}`)
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

    console.log(`${this.location} ${this.cabinetOutputNr}: `, inMode, highFreqSetting, lowFreqSetting)
  }

}

module.exports = {
  SwitchData,
  CabinetOutputData,
  eventEmitter
}
