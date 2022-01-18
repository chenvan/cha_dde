'use strict'
/*
使用mobx进行state管理
之后做界面时可以比较方便?
*/

/*
加料需要管理的数据有:

出柜号
出柜信息(进柜方式, 进柜量, 出柜高低频率, 半柜电眼)
进暂存柜控制电眼
提升带控制电眼
电子秤流量
电子秤流量设定
批号
*/

/*
  observable data
    advise data 
      出柜批次
      加料批次
      暂存柜进柜电眼
      提升带电眼

    fetch once data
      牌号
      出柜号
      出柜信息
      入口水分仪
      出口水分仪

    fetch interval data
      秤累计量
      秤实际流量

    other data
      生产状态
      serverName
*/

/*
  store 需要有自身的方法? 更新store里的数据?

  store 需要一直往下传递, 然后在接受 store 的 class 调用自己需要的方法
*/
const config = require("../mobx_test_config/AddFlavour.json")
const { makeAutoObservable, action, reaction, override } = require("mobx")
const { setAdvise, fetchDDE } = require("../util/fetchDDE")
const { logger } = require("../util/loggerHelper")
const { speakTwice } = require("../util/speak")


class AddFlavour {
  
  line
  serverName
  state
  updateCount
  idMap = {}
  deviceMap = []
  mainWeighBell = {}
  cabinetInfo = {}


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

    // reaction
    reaction(
      () => this.idMap["出柜批号"],
      id => {
        if(id) {
          this.fetchCabinetInfo(config[this.line]["fetch"]["cabinet"])
        }
      }
    )

    reaction(
      () => this.idMap["加料批号"],
      id => {
        if(this.state === "停止" && id) {
          this.state = "准备"
          this.fetchSetting()
        } else if (this.state === "生产" && !id) {
          this.state = "停止"
        }
      }
    )

    reaction(
      () => this.isMainWightBellRunning,
      () => {
        if(this.state ==="准备" && this.isMainWightBellRunning) {
          this.state = "生产"
          
        }
      }
    )
  }

  get isMainWightBellRunning() {
    return !this.mainWeighBell["setting"] && 
              Math.abs(this.mainWeighBell["setting"] - this.mainWeighBell["real"]) < 100
  }

  *init() {
    // init advise
    yield initAdviseData(config[this.line])
  }

  *initAdviseData(adviseConfigMap) {
    for(const[key, value] of Object.entries(adviseConfigMap)) {
      logger.info(`init advise -> ${key}: ${value}`)

      if(value.type === "device" ) {
        if(value.hasOwnProperty("detectState")) {
          
        } else {
         
        }
      } else if(value.type === "id") {
        yield setAdvise(this.serverName, value.itemName, action(state => {
          logger.info(`${key} value change to ${state.data}.`)
          this.idMap[key] = state.data.slice(0, -3)
        }))
      }
    }
  }

  *update() {
    // trigger action

    // 获得电子秤流量

    // 获得电子秤累积量

    // 检查 device 状态持续时间
  }

  *fetchWeightBellRealVolume (mainWeighBellConfig) {
    this.mainWeighBell["real"] = yield fetchDDE(
      this.serverName, 
      mainWeighBellConfig["real"]["itemName"], 
      mainWeighBellConfig["real"]["valueType"]
    )
  }

  *fetchWeightBellAccuVolume (mainWeighBellConfig) {
    this.mainWeighBell["accu"] = yield fetchDDE(
      this.serverName, 
      mainWeighBellConfig["accu"]["itemName"], 
      mainWeighBellConfig["accu"]["valueType"]
    )
  }

  *fetchSetting (mainWeighBellConfig) {
    // 获取设定参数
    this.mainWeighBell["setting"] = yield fetchDDE(
      this.serverName, 
      mainWeighBellConfig["setting"]["itemName"],
      mainWeighBellConfig["setting"]["valueType"]
    )
  }

  *fetchCabinetInfo (cabinetConig) {
    // 获得出柜号
    this.cabinetInfo["outputNr"] = yield fetchDDE(this.serverName, cabinetConig["outputNr"]["itemName"],  cabinetConig["outputNr"]["valueType"])
    
    // 获得出柜信息
    if (cabinetConig.hasOwnProperty(this.cabinetInfo["outputNr"])) {
      for(const [key, value] of Object.entries(cabinetConig[this.cabinetInfo["outputNr"]])) {
        this.cabinetInfo[key] = yield fetchDDE(this.serverName, value.itemName, value.valueType)
      }
    }

    // 检查出柜频率是否合适
  }

  *checkDeviceState() {

  }

  refreshUpdateCount() {
    this.updateCount += 1
    if(this.updateCount > 60) this.updateCount = 1
  }
}

class Device {
  deviceName
  maxDuration
  deviceState
  lastUpdateMoment
  isTrigger

  constructor(deviceName, maxDuration) {
    makeAutoObservable(this, {
      deviceName: false,
      maxDuration: false,
      isTrigger: false
    })

    this.deviceName = deviceName
    this.maxDuration = maxDuration
    this.isTrigger = false
  }

  *init(serverName, itemName) {
    logger.info(`${this.deviceName}初始化`)
    yield setAdvise(serverName, itemName, action(state => {
      logger.info(`${this.deviceName} state change to ${state.data}.`)
      this.deviceState = state.data
      this.lastUpdateMoment = Date.now()
    }))
  }

  *reConnect(serverName, itemName) {
    logger.info(`${this.deviceName}重启`)
    yield this.init(serverName, itemName)
  }

  checkState(now) {
    let duration = (now - this.lastUpdateMoment) / 1000
    if(duration > this.maxDuration && !this.isTrigger) {
      logger.info(`${this.deviceName}. 状态${this.state}. 持续时间${duration}. 大于设定最大时间 ${this.maxDuration}.`)
      this.isTrigger = true
    } else if(duration <= this.maxDuration) {
      this.isTrigger = false
    }
  }
}

class DeviceWithSpecifyState extends Device {
  specifyState

  constructor(deviceName, maxDuration, specifyState) {
    super(deviceName, maxDuration)
    
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

function *test() {
  let addFlavourMon = new AddFlavour("六四加料")

  yield addFlavourMon.init()

  setInterval(addFlavourMon.update, 1000 * 10)
}

test()
