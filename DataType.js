const { fetchDDE } = require("./fetchDDE")
const EventEmitter = require('events')

const eventEmitter = new EventEmitter()

class SwitchData {
  constructor(lineName, serverName, itemName) {
    this.lineName = lineName
    this.serverName = serverName
    this.itemName = itemName
  }

  update() {
    let temp = this.currentValue
    try {
      this.currentValue = fetchDDE(this.serverName, this.itemName)
      this.lastValue = temp
      if (this.currentValue !== this.lastValue) {
        eventEmitter.emit(this.itemName, this.lineName, this.currentValue)
      }
    } catch (err) {
      console.log(err)
    }
  }
}


// 判断柜的重量与秤累计量的差值是否小于某个数据
class CabinetHalfEyeConditionData {
  constructor(lineName, serverName, weighAccItemName, cabinetOutputNr, diff) {
    this.lineName = lineName
    this.serverName = serverName
    this.weighAccItemName = weighAccItemName
    this.cabinetOutputNr = cabinetOutputNr
    this.diff = diff
    this.cabinetTotal = getCabinetTotal(cabinetOutputNr)
    this.alreadyEmit = false
  }

  update() {
    try {
      let weightAcc = fetchDDE(this.serverName, this.weighAccItemName)
      if (this.cabinetTotal - weightAcc < diff && !this.alreadyEmit) {
        eventEmitter.emit('CabinetHalfEye', this.lineName, this.cabinetOutputNr)
        this.alreadyEmit = true
      }
    } catch (err) {
      console.log(err)
    }
  }

  getCabinetTotal(outputNr) {
    return 0
  }
}

module.exports = {
  SwitchData,
  eventEmitter
}
