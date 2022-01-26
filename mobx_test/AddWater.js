const config = require("../mobx_test_config/AddWater.json")
const { makeAutoObservable, action, reaction, autorun, runInAction } = require("mobx")
const { setAdvise, fetchDDE } = require("../util/fetchDDE")
const { logger } = require("../util/loggerHelper")
const WeightBell = require("./WeightBell")


/*
回潮

两个电子秤, 一个主电子秤, 一个薄片秤
切片前一个电眼, 检测切片来料
切片后一个电眼, 检测切片出口
一个回潮筒批次号

*/

class AddWater {
  line
  serverName
  state
  updateCount
  id
  deviceList = []
  mainWeightBell
  flakeWeightBell
  

  constructor(line) {
    makeAutoObservable(this, {
      line: false,
      serverName: false,
      updateCount: false
    })
  
    this.line = line
    this.serverName = config[line]["serverName"]
    this.updateCount = 0
    
    this.state = "停止"
    this.mainWeightBell = new WeightBell(this.line, "主秤", config[line]["weightBell"]["主秤"])
    this.flakeWeightBell = new WeightBell(this.line, "薄片秤", config[line]["weightBell"]["薄片秤"])

  }

  async init() {
    // init advise
    await Promise.all([
      this.initAdviseData(config[this.line]["advise"]),
      this.mainWeighBell.init(this.serverName),
      this.flakeWeightBell.init(this.serverName)
    ])
  }

  async reConnect() {

  }

  // 弄一个公共函数
  async initAdviseData(adviseConfigMap) {
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

  async reConnectAdviseData() {

  }

  async update() {

    this.refreshUpdateCount()

    if(this.state === "准备") {
      await this.mainWeighBell.fetchSetting(this.serverName)
      await this.flakeWeightBell.fetchSetting(this.serverName)

    }else if(this.state === "准备完成" || this.state === "停止") {

      await this.mainWeighBell.update(this.serverName)

      runInAction(() => {
        if(this.mainWeighBell.state === "运行正常") {
          this.state = "监控"
        }
      })
      
    }else if(this.state === "监控") {
      // 检查 device 状态持续时间是否符合要求
      this.checkDeviceState()

      await this.mainWeighBell.update(this.serverName)

      if(this.flakeWeightBell.state !== "不运行") {
        await this.flakeWeightBell.update(this.serverName)
      }

      runInAction(() => {
        if(this.mainWeighBell.state === "运行停止") {
          this.state = "停止"
        }
      })
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