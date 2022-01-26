const { makeAutoObservable, action, reaction, override, autorun, runInAction } = require("mobx")
const { setAdvise } = require("../util/fetchDDE")
const { logger } = require("../util/loggerHelper")

export class Device {
  line
  deviceName
  maxDuration
  itemName
  deviceState
  lastUpdateMoment
  isTrigger

  constructor(line, deviceName, maxDuration, itemName) {
    makeAutoObservable(this, {
      deviceName: false,
      maxDuration: false,
      itemName: false,
      isTrigger: false,
      line: false
    })

    this.line = line
    this.deviceName = deviceName
    this.maxDuration = maxDuration
    this.itemName = itemName
    this.isTrigger = false

  }

  async init(serverName) {
    logger.info(`${this.deviceName}初始化`)
    await setAdvise(serverName, this.itemName, action(state => {
      // logger.info(`${this.deviceName} state change to ${state.data}.`)
      this.deviceState = state.data
      this.lastUpdateMoment = Date.now()
    }))
  }

  async reConnect(serverName) {
    logger.info(`${this.deviceName}重启`)
    await this.init(serverName)
  }

  checkState(now) {
    let duration = (now - this.lastUpdateMoment) / 1000
    logger.info(`${this.line} ${this.deviceName}. 状态${this.deviceState}. 持续时间${duration}`)
    if(duration > this.maxDuration && !this.isTrigger) {
      logger.info(`大于设定最大时间 ${this.maxDuration}.`)
      this.isTrigger = true
    } else if(duration <= this.maxDuration) {
      this.isTrigger = false
    }
  }
}

export class DeviceWithSpecifyState extends Device {
  specifyState

  constructor(line, deviceName, maxDuration, itemName, specifyState) {
    super(line, deviceName, maxDuration, itemName)
    
    makeObservable(this, {
      specifyState: false,
      checkState: override
    })

    this.specifyState = specifyState
  }

  checkState(now) {
    if(this.specifyState === this.deviceState) {
      super.checkState(now)
    }
  }
}

module.exports = {
  Device,
  DeviceWithSpecifyState
}