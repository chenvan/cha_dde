const { fetchDDE, setAdvise } = require('../fetchDDE')
const electEyeConfig = require('../config/ElectEyeConfig.json')

class ElectEye {
  constructor(serverName, itemName) {
    this.serverName = serverName
    this.itemName = itemName
    this.isTrigger = false
  }

  async init() {

    this.lastSwitchTime = Date.now()

    await setAdvise(this.serverName, this.itemName, eyeState => {
      // eyeState 有没有空字符串的可能?  
      this.lastSwitchTime = Date.now()
      this.currentState = parseInt(eyeState, 10)
      // 用 isTrigger 的方法应该不行
    })
  }

  isStateNotChange(maxTime) {
      return (Date.now() - this.lastSwitchTime) / 1000 > maxTime
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
    this.updateFreq = 1
  }

  async init() {
    // init elect eye
    
    // Object.values(this.electEyeCol).forEach(electEye => {
    //   await electEye.init()
    // })

    await Promise.all(
      Object.values(this.electEyeCol).map(
        electEye => electEye.init()
      )
    )
  }

  async update(updateCount) {
    if(updateCount % this.updateFreq !== 0) return
    
    if(!this.isMon) return

    for (let [name, electEye] of Object.entries(this.electEyeCol)) {
      if(electEye.isStateNotChange(10)) {
        console.log(`${this.location} ${name} 电眼状态长时间不变, 请注意`)
      }
    }
  }
}

module.exports = {
  ElectEyeDetect
}