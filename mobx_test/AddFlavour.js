'use strict'

const config = require("../mobx_test_config/AddFlavour.json")
const { makeAutoObservable, action, reaction, override, autorun, runInAction } = require("mobx")
const { setAdvise } = require("../util/fetchDDE")
const { fetchBrandName, testServerConnect } = require("../util/fetchUtil")
const { logger } = require("../util/loggerHelper")
const { speakTwice } = require("../util/speak")
const Cabinet = require('./Cabinet')
const WeightBell = require('./WeightBell')
const { Device } = require('./Device')
const { genAddFlavourState } = require('./UI')
const { checkPara } = require('../util/checkParaUtil')
const { loadVoiceTips, clearVoiceTips, setRunningVoiceTips, setReadyVoiceTips } = require('../util/voiceTipsUtil')

/*
加料监控状态

准备: 加料批次发生转换
参数检查完成: 
监控 :电子秤进入运行状态
停止: 秤状态为停止是

一个电子秤, 
一个出柜, 
暂存柜两个电眼, 
加料批号
*/

class AddFlavour {
  
  line
  serverName
  state
  updateCount
  id
  deviceList = []
  mainWeightBell
  cabinet
  brandName
  isSetRunningVoiceTips
  runningTimeoutList
  isSetReadyVoiceTips
  readyTimeoutList
  voiceTipsConfig


  constructor(line, container) {
    makeAutoObservable(this, {
      line: false,
      container: false,
      serverName: false,
      updateCount: false,
      voiceTipsConfig: false,
      isSetRunningVoiceTips: false,
      isSetReadyVoiceTips: false,
      runningTimeoutList: false,
      readyTimeoutList: false
    })
  
    this.line = line
    this.container = container
    this.serverName = config[line]["serverName"]
    this.updateCount = 0
    
    this.state = "停止"
    this.mainWeightBell = new WeightBell(this.line, "主秤", config[line]["mainWeightBell"])
    this.cabinet = new Cabinet(this.line, config[line]["cabinet"])

    this.voiceTipsConfig = loadVoiceTips(this.line, "加料")
    this.isSetRunningVoiceTips = false
    this.runningTimeoutList = []
    this.isSetReadyVoiceTips = false
    this.readyTimeoutList = []

    reaction(
      () => this.id,
      id => {
        if(id) {
          this.state = "准备"
          // this.isSetRunningVoiceTips = false
        }
      }
    )

    autorun(() => {
      this.container.setLabel(`${this.line}(${this.state})`)
      this.container.setContent(genAddFlavourState(this))
      this.container.parent.render()
    })
  }

  async init() {
    // init advise
    await Promise.all([
      this.initAdviseData(config[this.line]["advise"]),
      this.mainWeightBell.init(this.serverName),
      this.cabinet.init(this.serverName)
    ])
  }

  async reConnect() {
    await this.init()
  }

  async initAdviseData(adviseConfigMap) {
    this.deviceList = []

    for(const[key, value] of Object.entries(adviseConfigMap)) {
      logger.info(`init advise -> ${key}: ${value}`)
      
      if(value.type === "device" ) {
        let device

        if(value.hasOwnProperty("detectState")) {
          device = new DeviceWithSpecifyState(this.line, key, value.maxTime, value.itemName, value.detectState)
        } else {
          device = new Device(this.line, key, value.maxTime, value.itemName)
        }

        await device.init(this.serverName)
        
        runInAction(() => {
          this.deviceList = this.deviceList.concat([device])
        })

      } else if(value.type === "id") {
        await setAdvise(this.serverName, value.itemName, action(state => {
          logger.info(`${key} value change to ${state.data}.`)
          this.id = state.data.slice(0, -3)
        }))
      }
    }
  }

  async update() {
    try {

      this.refreshUpdateCount()

      if(this.state === "准备") {

        await Promise.all([
          this.cabinet.updateCabinetInfo(this.serverName),
          this.mainWeightBell.fetchSetting(this.serverName),
          // 检查参数
          checkPara(this.line, this.serverName, config[this.line]["para"])
        ])
        // await this.cabinet.updateCabinetInfo(this.serverName)
        // await this.mainWeightBell.fetchSetting(this.serverName)

        // 检查参数
        // await checkPara(this.line, this.serverName, config[this.line]["para"])

        this.brandName = await fetchBrandName(this.serverName, config[this.line]["brandName"]["itemName"], config[this.line]["brandName"]["valueType"])

        

        runInAction(() => {
          if (this.cabinet.state === "监控") {
            this.state = "准备完成"
          }
        })
        
      } else if(this.state === "准备完成") {

        await this.mainWeightBell.update(this.serverName)

        if(!this.isSetReadyVoiceTips && this.mainWeightBell.accu === 0) {
          this.readyTimeoutList = setReadyVoiceTips(this.voiceTipsConfig["ready"], this.brandName)
          this.isSetReadyVoiceTips = true
        }

        runInAction(() => {
          if(this.mainWeightBell.state === "运行正常") {
            this.state = "监控"
          }
        })
        
      } else if(this.state === "监控") {
        // 检查 device 状态持续时间是否符合要求
        this.checkDeviceState()

        // 先更新电子秤, 再检查半柜状态
        await this.mainWeightBell.update(this.serverName)

        await this.cabinet.checkHalfEyeState(this.serverName, this.mainWeightBell.accu)

        // 加载语音
        if(!this.isSetRunningVoiceTips) {
          this.runningTimeoutList = setRunningVoiceTips(this.voiceTipsConfig["running"], this.brandName, this.mainWeightBell.setting, this.mainWeightBell.accu)
          this.isSetRunningVoiceTips = true
        }

        runInAction(() => {
          if(this.mainWeightBell.state === "运行停止") {
            this.state = "停止"
          }
        })

      } else if(this.state === "停止") {
        await this.mainWeightBell.update(this.serverName)

        if(this.isSetRunningVoiceTips) {
          clearVoiceTips(this.runningTimeoutList)
          this.isSetRunningVoiceTips = false
        }

        if(this.isSetReadyVoiceTips) {
          clearVoiceTips(this.readyTimeoutList)
          this.isSetReadyVoiceTips = false
        }
        
        runInAction(() => {
          if(this.mainWeightBell.state === "运行正常") {
            this.state = "监控"
          }
        })
      } else if(this.state === "出错") {
        await testServerConnect(this.serverName)
        await this.reConnect()
        runInAction(() => this.state = "准备")
      }
    } catch(err) {
      logger.error(err)
      runInAction(() => this.state = "出错")
    } 
  }

  checkDeviceState() {
    // 检查 device state 是否维持长时间不变
    this.deviceList.forEach(device => device.checkState(Date.now()))
  }

  refreshUpdateCount() {
    this.updateCount += 1
    if(this.updateCount > 60) this.updateCount = 1
  }
}

module.exports = AddFlavour