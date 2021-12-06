const { fetchDDE } = require("../fetchDDE")

class TraceData {
  constructor(serverName, itemName, valueType) {
    this.serverName = serverName
    this.itemName = itemName
    this.valueType = valueType
  }

  async update() {
    let temp = await fetchDDE(this.serverName, this.itemName, this.valueType)
    
    if (temp !== this.lastValue) {
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