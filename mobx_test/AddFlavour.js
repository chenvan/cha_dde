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
const { makeAutoObservable, action, reaction } = require("mobx")
const { setAdvise, fetchDDE } = require("../util/fetchDDE")
const { logger } = require("../util/loggerHelper")


class AddFlavour {
  
  line
  serverName
  state
  idMap = {}
  deviceMap = {}
  mainWeighBell = {}


  constructor(line) {
    makeAutoObservable(this, {
      line: false,
      serverName: false
    })
  
    this.line = line
    this.serverName = config[line]["serverName"]
    
    this.state = "停止"

    // reaction
    reaction(
      () => this.idMap["出柜批号"],
      () => {
        // 出柜
      }
    )

    reaction(
      () => this.idMap["加料批号"],
      (id) => {
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

  *fetchWeightBellRealVolume () {
    this.mainWeighBell["real"] = yield fetchDDE(
      this.serverName, 
      config[this.line]["fetch"]["mainWeightBell"]["real"]["itemName"], 
      config[this.line]["fetch"]["mainWeightBell"]["real"]["valueType"]
    )
  }

  *fetchWeightBellAccuVolume () {
    this.mainWeighBell["accu"] = yield fetchDDE(
      this.serverName, 
      config[this.line]["fetch"]["mainWeightBell"]["accu"]["itemName"], 
      config[this.line]["fetch"]["mainWeightBell"]["accu"]["valueType"]
    )
  }

  *fetchSetting () {
    // 获取设定参数
    this.mainWeighBell["setting"] = yield fetchDDE(
      this.serverName, 
      config[this.line]["fetch"]["mainWeightBell"]["setting"]["itemName"],
      config[this.line]["fetch"]["mainWeightBell"]["setting"]["valueType"]
    )
  }

  *fetchCabinetInfo () {
    
  }
}



function *test() {
  let addFlavourMon = new AddFlavour("六四加料")

  yield addFlavourMon.init()

  setInterval(addFlavourMon.update, 1000 * 20)
}

test()
