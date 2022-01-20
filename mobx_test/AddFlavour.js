'use strict'

const config = require("../mobx_test_config/AddFlavour.json")
const { makeAutoObservable, action, reaction, override, autorun } = require("mobx")
const { setAdvise, fetchDDE } = require("../util/fetchDDE")
const { logger } = require("../util/loggerHelper")
const { speakTwice } = require("../util/speak")

/*
state: 
*/
class AddFlavour {
  
  line
  serverName
  state
  updateCount
  id
  deviceList = []
  mainWeighBell
  cabinet


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
    this.mainWeighBell = new WeightBell(this.line, config[line]["mainWeightBell"])
    this.cabinet = new Cabinet(this.line, config[line]["cabinet"])

    // reaction(
    //   () => this.id,
    //   id => {
    //     if(this.state === "停止" && id) {
    //       this.state = "准备"
    //       this.mainWeighBell.fetchSetting(this.serverName, config[this.line]["mainWeightBell"]["setting"])
    //     } else if (this.state === "生产" && !id) {
    //       this.state = "停止"
    //     }
    //   }
    // )

    // reaction(
    //   () => this.mainWeighBell.state,
    //   mainWeightBellState => {
    //     if(this.state ==="准备" && mainWeightBellState ==="运行") {
    //       this.state = "生产"
    //     }
    //   }
    // )
  }

  *init() {
    // init advise
    yield initAdviseData(config[this.line]["advise"])
    yield this.mainWeighBell.init(this.serverName)
    yield this.cabinet.init(this.serverName)
  }

  *reConnect() {

  }

  *initAdviseData(adviseConfigMap) {
    for(const[key, value] of Object.entries(adviseConfigMap)) {
      logger.info(`init advise -> ${key}: ${value}`)
      
      if(value.type === "device" ) {
        let device

        if(value.hasOwnProperty("detectState")) {
          device = new DeviceWithSpecifyState(this.line, key, value.maxTime, value.itemName, value.detectState)
        } else {
          device = new Device(this.line, key, value.maxTime, value.itemName)
        }

        yield device.init(this.serverName)

        deviceList.push(device)

      } else if(value.type === "id") {
        yield setAdvise(this.serverName, value.itemName, action(state => {
          logger.info(`${key} value change to ${state.data}.`)
          this.id = state.data.slice(0, -3)
        }))
      }
    }
  }

  *reConnectAdviseData() {

  }

  *update() {

    this.refreshUpdateCount()


    // 检查 device 状态持续时间
    this.checkDeviceState()

    
    

    // 更新电子秤
    yield this.mainWeighBell.update(this.serverName)

    // 更新出柜 
    yield this.cabinet.update(this.serverName, this.mainWeighBell.accu)
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

class Device {
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

  *init(serverName) {
    logger.info(`${this.deviceName}初始化`)
    yield setAdvise(serverName, this.itemName, action(state => {
      logger.info(`${this.deviceName} state change to ${state.data}.`)
      this.deviceState = state.data
      this.lastUpdateMoment = Date.now()
    }))
  }

  *reConnect(serverName) {
    logger.info(`${this.deviceName}重启`)
    yield this.init(serverName)
  }

  checkState(now) {
    let duration = (now - this.lastUpdateMoment) / 1000
    if(duration > this.maxDuration && !this.isTrigger) {
      logger.info(`${this.line} ${this.deviceName}. 状态${this.state}. 持续时间${duration}. 大于设定最大时间 ${this.maxDuration}.`)
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

class WeightBell {
  line
  electEye
  setting = 0
  accu
  real

  constructor(line, weightBellConfig) {
    makeAutoObservable(this, {
      weightBellConfig: false,
      line: false
    })

    this.line = line
    this.weightBellConfig = weightBellConfig
  }

  *init(serverName) {
    if(this.weightBellConfig.hasOwnProperty("electEye")) {
      this.electEye = new Device(
        this.line,
        this.weightBellConfig.electEye.name, 
        this.weightBellConfig.electEye.maxTime, 
        this.weightBellConfig.electEye.itemName
      )
      yield this.electEye.init(serverName)
    }
  }

  *reConnect(serverName) {
    yield this.electEye.reConnect(serverName)
  }

  *fetchSetting(serverName) {
    this.setting = yield fetchDDE(
      serverName, 
      this.weightBellConfig.setting.itemName, 
      this.weightBellConfig.setting.valueType
    )
  }

  *fetchAccu(serverName) {
    this.accu = yield fetchDDE(
      serverName, 
      this.weightBellConfig.accu.itemName, 
      this.weightBellConfig.accu.valueType
    )
  }

  *fetchReal(serverName) {
    this.real = yield fetchDDE(
      serverName, 
      this.weightBellConfig.real.itemName, 
      this.weightBellConfig.real.valueType
    )
  }

  get state() {
    if(this.setting === 0) {
      return "不运行"
    } else {
      if(this.real < 10  ) {
        return "停止"
      } else if (Math.abs(this.setting - this.real) < 100) {
        return "运行"
      }
    }
  }

  *update(serverName) {
    yield this.fetchReal(serverName)
    yield this.fetchAccu(serverName)

    if (this.state === "运行") {
      this.electEye.checkState(Date.now())
    } 
  }
}
/*
Cabinet 监控柜的半柜电眼是否正常
state: 初始化 -> 监控 -> 完成
*/
class Cabinet {
  line
  outputNr
  state
  total

  constructor(line, cabinetConfig) {
    makeAutoObservable(this, {
      cabinetConfig: false,
      line: false
    })

    this.cabinetConfig = cabinetConfig
    this.line = line

    reaction(
      () => this.outputNr,
      () => {
        if(this.cabinetConig.hasOwnProperty(this.outputNr)) {
          if (this.state === "监控") {
            logger.info(`出柜号出现异常`)
          }

          this.state = "初始化"
        }
      }
    )
  }

  *init(serverName) {
    yield setAdvise(serverName, this.cabinetConig["outputNr"].itemName, state => {
      logger.info(`cabinet output Nr change to ${state.data}.`)
      this.outputNr = state.data
    })
  }

  *reConnect(serverName) {
    yield this.init(serverName)
  }

  *update(serverName, weightBellAccu) {
    //使用state来描述cabinet进行到哪一步, 下一步的动作是什么
    if (this.state === "初始化") {
      this.total = yield fetchDDE(
        serverName,
        this.config[this.outputNr]["total"].itemName,
        this.config[this.outputNr]["total"].valueType
      )
      
      this.state = "监控"

      // 检查出柜频率
      yield this.checkOutputFreqSetting()
      
      
    } else if (this.state === "监控") {
      if(this.total - weightBellAccu < this.cabinetConig[this.outputNr].reference.diff) {
        let halfEyeState = yield this.getHalfEyeState(this.serverName)
        
        if(halfEyeState === 1) {
          logger.info(`${this.line} 加料出柜未转高速`)
        }

        this.state = "完成"
      }
    }
  }

  *checkOutputFreqSetting() {
    // 
  }

  *getHalfEyeState(serverName) {
    return yield fetchDDE(
      serverName, 
      this.config[this.outputNr]["halfEye"].itemName,
      this.config[this.outputNr]["halfEye"].valueType,
    )
  }
}

function *test() {
  let addFlavourMon = new AddFlavour("六四加料")

  yield addFlavourMon.init()

  setInterval(addFlavourMon.update, 1000 * 10)
}

test()
