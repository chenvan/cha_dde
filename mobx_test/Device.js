'use strict'

const { makeObservable, action, reaction, override, autorun, runInAction, observable } = require("mobx")
const { setAdvise } = require("../util/fetchDDE")
const { logger } = require("../util/loggerHelper")
const { speakTwice } = require("../util/speak")

class Device {
  line
  deviceName
  maxDuration
  itemName
  deviceState
  lastUpdateMoment
  isTrigger

  constructor(line, deviceName, maxDuration, itemName) {
    makeObservable(this, {
      deviceName: false,
      maxDuration: false,
      itemName: false,
      isTrigger: false,
      line: false,
      deviceState: observable,
      lastUpdateMoment: false,
      checkState:false,
      init: false,
      reConnect: false
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
      this.deviceState = parseInt(state.data, 10)
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
      logger.info(`${this.deviceName} 状态长时间不变.`)
      speakTwice(`${this.deviceName} 状态长时间不变.`)
      this.isTrigger = true
    } else if(duration <= this.maxDuration) {
      this.isTrigger = false
    }
  }
}

class DeviceWithSpecifyState extends Device {
  specifyState

  constructor(line, deviceName, maxDuration, itemName, specifyState) {
    super(line, deviceName, maxDuration, itemName)
    
    makeObservable(this, {
      specifyState: false,
      checkState: false
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