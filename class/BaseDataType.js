const { fetchDDE } = require("../fetchDDE")

class TraceData {
  constructor(serverName, itemName, valueType) {
    this.serverName = serverName
    this.itemName = itemName
    this.valueType = valueType
  }

  async update() {
    // console.log(this.serverName, this.itemName, this.valueType)
    let temp = await fetchDDE(this.serverName, this.itemName, this.valueType)

    if (temp !== this.currentValue) {
      console.log(`TraceData update: ${this.currentValue} -> ${temp}`)

      this.lastValue = this.currentValue
      this.currentValue = temp
      return true
    }

    return false
  }
}

class TraceSettingData {
  constructor(serverName, settingValueItemName, realValueItemName, valueType, precis) {
    this.serverName = serverName
    this.settingValueItemName = settingValueItemName
    this.realValueItemName = realValueItemName
    this.valueType = valueType
    this.precis = precis
  }

  async update() {

    let [settingValue, realValue] = await Promise.all(
      [
        fetchDDE(this.serverName, this.settingValueItemName, this.valueType),
        fetchDDE(this.serverName, this.realValueItemName, this.valueType)
      ]
    )

    let realPrecis = Math.abs(settingValue - realValue) * 100 / settingValue
    let temp
    
    if (realValue === 0) {
      temp = 0
    } else if(realPrecis <= this.precis) {
      temp = 1
    } else {
      temp = 2
    }

    if (temp !== this.currentValue) {
      console.log(`TraceData update: ${this.currentValue} -> ${temp}`)

      this.lastValue = this.currentValue
      this.currentValue = temp
      return true
    }

    return false
  }
}


module.exports = {
  TraceData,
  TraceSettingData
}