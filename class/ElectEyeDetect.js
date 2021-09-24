const { setAdvise } = require('../util/fetchDDE')
const electEyeConfig = require('../config/ElectEyeConfig.json')
const { speakTwice } = require('../util/speak')

class ElectEye {
  constructor(serverName, itemName, maxTime) {
    this.serverName = serverName
    this.itemName = itemName
    this.maxTime = maxTime
    this.isTrigger = false
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
    
    console.log(`${notChangeTime}, ${this.maxTime}, ${this.isTrigger}, ${this.currentState}`)

    if(notChangeTime > this.maxTime && !this.isTrigger) {
      this.isTrigger = true
      return true
    } else if (notChangeTime <= this.maxTime && this.isTrigger) {
      this.isTrigger = false
    }

    return false
  }
}

class ElectEyeDetect {
  constructor(location, serverName) {
    this.location = location
    this.serverName = serverName

    this.electEyeCol = Object.keys(electEyeConfig[this.location])
      .reduce((col, electEyeName) => {
        col[electEyeName] = new ElectEye(
          this.serverName, 
          electEyeConfig[this.location][electEyeName].itemName,
          electEyeConfig[this.location][electEyeName].maxTime
        )
        
        return col
      }, {})

    this.isMon = false
    this.isInit = false
    this.updateFreq = 2
  }

  async init() {
    // init elect eye
    await Promise.all(
      Object.values(this.electEyeCol).map(
        electEye => electEye.init()
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

    for (let [name, electEye] of Object.entries(this.electEyeCol)) {
      // console.log(`${name}: ${electEye.currentState} 持续时间：${(Date.now() - electEye.lastSwitchTime) / 1000}`)
      process.stdout.write(`${name}: `)
      
      if(electEye.isStateNotChange()) {
        console.log(`${this.location} ${name} 电眼状态长时间不变, 请注意`)
        speakTwice(`${this.location} ${name} 电眼状态长时间不变, 请注意`)
      }
    }
  }
}

module.exports = {
  ElectEyeDetect
}