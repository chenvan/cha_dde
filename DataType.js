const { fetchDDE, fetchInt } = require("./fetchDDE")
const { speakTwice } = require('./speak')
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
    try {
      
      let temp = await fetchInt(this.serverName, this.itemName)
      this.lastValue = this.currentValue
      this.currentValue = temp

      if (this.currentValue !== this.lastValue) {
        console.log(`trigger: ${this.currentValue} ${this.lastValue}`)
        eventEmitter.emit(this.eventName, this.currentValue, this.monKey)
      }
    } catch (err) {
      console.log(err)
    }
  }
}


// 判断柜的重量与秤累计量的差值是否小于某个数据
class CabinetOutputData {
  constructor(location, cabinetOutputNr, serverName, weighAccItemName, weighBatchIdItemName, 
              cabinetTotalItemName,inModeItemName, highFreqSettingItemName, lowFreqSettingItemName, 
              cabinetBatchIdItemName, diff) {

    this.location = location
    this.cabinetOutputNr = cabinetOutputNr
    this.serverName = serverName
    this.weighAccItemName = weighAccItemName
    this.weighBatchIdItemName =weighBatchIdItemName
    this.cabinetTotalItemName = cabinetTotalItemName
    this.cabinetBatchIdItemName = cabinetBatchIdItemName
    this.diff = diff
    
    this.alreadyEmit = false
    this.alreadyInitCabinet = false
    this.isBatchTheSame = false
    
    this.checkOutputFreq(inModeItemName,highFreqSettingItemName, lowFreqSettingItemName)
  }

  async update() {
    try {
      
      if (!this.alreadyInitCabinet) {
        [this.cabinetTotal, this.cabinetBatchId] = await Promise.all([
          fetchInt(this.serverName, this.cabinetTotalItemName),
          fetchDDE(this.serverName, this.cabinetBatchIdItemName)
        ])
        this.alreadyInitCabinet = true
      }

      if (!this.isBatchTheSame) 
      {
        let weightBatchId = await fetchDDE(this.serverName, this.weighBatchIdItemName)
        
        if (weightBatchId != this.cabinetBatchId) return

        this.isBatchTheSame = true
      }

      let weightAcc = await fetchInt(this.serverName, this.weighAccItemName)

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
