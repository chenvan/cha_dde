const { fetchDDE } = require("../fetchDDE")

class TraceData {
  constructor(serverName, itemName, valueType) {
    this.serverName = serverName
    this.itemName = itemName
    this.valueType = valueType
  }

  async update() {
    console.log(this.serverName, this.itemName, this.valueType)
    let temp = await fetchDDE(this.serverName, this.itemName, this.valueType)
    
    console.log(`TraceData update: ${this.currentValue} -> ${temp}`)

    if (temp !== this.currentValue) {
      this.lastValue = this.currentValue
      this.currentValue = temp
      return true
    }

    return false
  }
}


module.exports = {
  TraceData
}