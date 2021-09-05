const { setAdvise } = require('../util/fetchDDE')
const deviceConfig = require('../config/deviceConfig.json')
const { speakTwice } = require('../util/speak')

class DeviceState {
  constructor(serverName, itemName, maxTime, detectState) {
    this.serverName = serverName
    this.itemName = itemName
    this.maxTime = maxTime
    this.isTrigger = false
    this.detectState = detectState
  }

  async init() {

    this.lastSwitchTime = Date.now()

    await setAdvise(this.serverName, this.itemName, eyeState => {
      // eyeState 有没有空字符串的可能
      this.lastSwitchTime = Date.now()
      // console.log(`eye state: ${eyeState.item}: ${eyeState.data}`)
      this.currentState = parseInt(eyeState.data, 10)
    })
  }

  isStateNotChange() {
    let notChangeTime = (Date.now() - this.lastSwitchTime) / 1000 
    
    console.log(`${notChangeTime}, ${this.maxTime}, ${this.isTrigger}, ${this.currentState}, ${this.detectState}`)

    /*
      有3个考虑的变量 1.状态不变的时间 2.是否已经发出了警告 3.是否有设定的状态
    */
    
    if(notChangeTime > this.maxTime && !this.isTrigger && 
            (this.detectState === undefined || (this.detectState !== undefined && this.detectState === this.currentState))) {
  
      this.isTrigger = true
      return true
      
    } else if (notChangeTime <= this.maxTime && this.isTrigger) {
      this.isTrigger = false
    }

    return false
  }
}

class DeviceStateDetect {
  constructor(location, serverName, updateFreq) {
    this.location = location
    this.serverName = serverName

    this.deviceCol = Object.keys(deviceConfig[this.location])
      .reduce((col, deviceName) => {
        col[deviceName] = new DeviceState(
          this.serverName, 
          deviceConfig[this.location][deviceName].itemName,
          deviceConfig[this.location][deviceName].maxTime,
          deviceConfig[this.location][deviceName].detectState
        )
        
        return col
      }, {})

    this.isMon = false
    this.isInit = false
    this.updateFreq = updateFreq
  }

  async init() {
    // init device
    await Promise.all(
      Object.values(this.deviceCol).map(
        device => device.init()
      )
    )

    this.isInit = true
  }

  async reset() {
    await this.init()
  }

  async update(updateCount) {
    if(updateCount % this.updateFreq !== 0) return
    
    if(!this.isMon) return

    for (let [name, device] of Object.entries(this.deviceCol)) {
      // console.log(`${name}: ${device.currentState} 持续时间：${(Date.now() - device.lastSwitchTime) / 1000}`)
      process.stdout.write(`${name}: `)
      
      if(device.isStateNotChange()) {
        console.log(`${this.location} ${name} 状态长时间不变, 请注意`)
        speakTwice(`${this.location} ${name} 状态长时间不变, 请注意`)
      }
    }
  }
}

module.exports = {
  DeviceStateDetect
}