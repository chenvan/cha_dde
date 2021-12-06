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
              cabinetBatchIdItemName, diff, halfEyeItemName) {

    this.location = location
    this.cabinetOutputNr = cabinetOutputNr
    this.serverName = serverName
    this.weighAccItemName = weighAccItemName
    this.weighBatchIdItemName =weighBatchIdItemName
    this.cabinetTotalItemName = cabinetTotalItemName
    this.cabinetBatchIdItemName = cabinetBatchIdItemName
    this.diff = diff
    this.halfEyeItemName = halfEyeItemName
    
    this.hmiOutputNr = cabinetOutputNr - Math.floor(cabinetOutputNr / 100) * 100
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
        
        let halfEye = await fetchInt(this.serverName, this.halfEyeItemName)
        
        if (halfEye == 1) {
          speakTwice(`${this.location}, ${this.hmiOutputNr}号柜没有转高速`)
        }
        
        this.alreadyEmit = true
      }
    } catch (err) {
      console.log(err)
    }
  }

  async checkOutputFreq(inModeItemName,highFreqSettingItemName, lowFreqSettingItemName) {
    let [inMode, highFreqSetting, lowFreqSetting] = await Promise.all([
      fetchInt(this.serverName, inModeItemName),
      fetchInt(this.serverName, highFreqSettingItemName),
      fetchInt(this.serverName, lowFreqSettingItemName)
    ])

    let temp = (this.cabinetOutputNr / 100) * 100 
    
    console.log(`${this.location} ${this.hmiOutputNr}: `, inMode, highFreqSetting, lowFreqSetting)
    // speakTwice(`${this.location}, ${this.hmiOutputNr}号柜，高速频率：${highFreqSetting}, 低速频率：${lowFreqSetting}`)
  }

}

module.exports = {
  SwitchData,
  CabinetOutputData,
  eventEmitter
}
