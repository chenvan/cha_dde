const { fetchDDE, setAdvise } = require('../fetchDDE')
const electEyeConfig = require('../config/ElectEyeConfig.json')
const { speakTwice } = require('../speak')

class ElectEye {
  constructor(serverName, itemName) {
    this.serverName = serverName
    this.itemName = itemName
    this.isTrigger = false
  }

  async init() {

    this.lastSwitchTime = Date.now()

    await setAdvise(this.serverName, this.itemName, eyeState => {
      // eyeState 有没有空字符串的可能
      this.lastSwitchTime = Date.now()
      // console.log(`eye state: ${eyeState.item}: ${eyeState.data}`)
      this.currentState = parseInt(eyeState.data, 12)
    })
  }

  isStateNotChange(maxTime) {
    let notChangeTime = (Date.now() - this.lastSwitchTime) / 1000 

    if(notChangeTime > maxTime && !this.isTrigger) {
      this.isTrigger = true
      return true
    } else if (notChangeTime <= maxTime && this.isTrigger) {
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
          electEyeConfig[this.location][electEyeName].itemName
        )
        
        return col
      }, {})

    this.isMon = false
    this.isInit = false
    this.updateFreq = 1
  }

  async init() {
    // init elect eye
    
    // Object.values(this.electEyeCol).forEach(electEye => {
    //   await electEye.init()
    // })
    // console.log(Object.values(this.electEyeCol))

    await Promise.all(
      Object.values(this.electEyeCol).map(
        electEye => electEye.init()
      )
    )

    this.isInit = true
  }

  async update(updateCount) {
    if(updateCount % this.updateFreq !== 0) return
    
    if(!this.isMon) return

    if(!this.isInit) await this.init()

    for (let [name, electEye] of Object.entries(this.electEyeCol)) {
      console.log(`${name}: ${electEye.currentState} 持续时间：${(Date.now() - electEye.lastSwitchTime) / 1000}`)
      
      if(electEye.isStateNotChange(10)) {
        console.log(`${this.location} ${name} 电眼状态长时间不变, 请注意`)
        // speakTwice(`${this.location} ${name} 电眼状态长时间不变, 请注意`)
      }
    }
  }
}

module.exports = {
  ElectEyeDetect
}