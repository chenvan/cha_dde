const { fetchDDE, setAdvise } = require('../fetchDDE')

// 改状态只是变更 lastUpdateTime
class ElectEyeDetect {
  constructor(electEyeName, serverName, itemName, maxSeconds) {
    this.electEyeName = electEyeName
    this.serverName = serverName
    this.itemName = itemName
    this.maxSeconds = maxSeconds
    this.isMon = false
  }

  async init() {
    await setAdvise(this.serverName, this.itemName, eyeState => {
      // eyeState 有没有空字符串的可能?  
      this.lastSwitchTime = Date.now()
      this.currentState = parseInt(eyeState, 10)
    })

    this.currentState = await fetchDDE(this.serverName, this.itemName, 'int')
    this.lastSwitchTime = Date.now()
  }

  async update() {
    if(!this.isMon) return

    if((Date.now() - this.lastSwitchTime) / 1000 > this.maxSeconds) {
      console.log(`${this.electEyeName} 长时间处于同一状态`)
    }
  }
}