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
  duration

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
      reConnect: false,
      duration: false
    })

    this.line = line
    this.deviceName = deviceName
    this.maxDuration = maxDuration
    this.itemName = itemName
    this.isTrigger = false
    this.duration = 0
  }

  async init(serverName) {
    // logger.info(`${this.deviceName}初始化`)
    await setAdvise(serverName, this.itemName, action(state => {
      // logger.info(`${this.deviceName} state change to ${state.data}.`)
      this.deviceState = parseInt(state.data, 10)
      this.lastUpdateMoment = Date.now()
    }))
  }

  // async reConnect(serverName) {
  //   logger.info(`${this.deviceName}重启`)
  //   await this.init(serverName)
  // }

  checkState(now) {
    this.duration = (now - this.lastUpdateMoment) / 1000
    if(this.duration > this.maxDuration && !this.isTrigger) {
      logger.error(`${this.line} ${this.deviceName} 状态长时间不变.`)
      speakTwice(`${this.line} ${this.deviceName} 状态长时间不变.`)
      this.isTrigger = true
    } else if(this.duration <= this.maxDuration) {
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