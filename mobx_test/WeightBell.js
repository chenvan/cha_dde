const { makeAutoObservable, action, reaction, override, autorun, runInAction } = require("mobx")
const { fetchDDE } = require("../util/fetchDDE")
const { logger } = require("../util/loggerHelper")
const { Device, DeviceWithSpecifyState} = require('./Device')

/*
电子秤的状态: 
不运行: 设定流量为0
运行正常: 设定流量不为0, 实际流量与设定流量接近
运行波动: 设定流量不为0, 实际流量与设定流量不接近
运行停止: 设定流量不为0, 实际流量接近0
*/

class WeightBell {
  line
  name
  electEye
  setting = 0
  accu
  real
  isTrigger

  constructor(line, name, weightBellConfig) {
    makeAutoObservable(this, {
      weightBellConfig: false,
      line: false,
      name: false,
      isTrigger: false
    })

    this.line = line
    this.name = name
    this.weightBellConfig = weightBellConfig
    this.isTrigger = false

    autorun(() => {
      console.log("weight bell 电子秤")
      console.log(this.state, this.setting, this.real, this.accu)
      console.log("=============================")
    })
  }

  async init(serverName) {
    if(this.weightBellConfig.hasOwnProperty("electEye")) {

      this.electEye = this.weightBellConfig.electEye.hasOwnProperty('detectState') ?
        new DeviceWithSpecifyState(
          this.line,
          this.weightBellConfig.electEye.name, 
          this.weightBellConfig.electEye.maxTime, 
          this.weightBellConfig.electEye.itemName,
          this.weightBellConfig.electEye.detectState
        ) :
        new Device(
          this.line,
          this.weightBellConfig.electEye.name, 
          this.weightBellConfig.electEye.maxTime, 
          this.weightBellConfig.electEye.itemName
        )
      await this.electEye.init(serverName)
    }
  }

  async reConnect(serverName) {
    await this.electEye.reConnect(serverName)
  }

  async fetchSetting(serverName) {
    let setting = await fetchDDE(
      serverName, 
      this.weightBellConfig.setting.itemName, 
      this.weightBellConfig.setting.valueType
    )

    runInAction(() => this.setting = setting)
  }

  async fetchAccu(serverName) {
    let accu = await fetchDDE(
      serverName, 
      this.weightBellConfig.accu.itemName, 
      this.weightBellConfig.accu.valueType
    )

    runInAction(() => this.accu = accu)
  }

  async fetchReal(serverName) {
    let real = await fetchDDE(
      serverName, 
      this.weightBellConfig.real.itemName, 
      this.weightBellConfig.real.valueType
    )

    runInAction(() => this.real = real)
  }

  get state() {
    if(this.setting === 0) {
      return "不运行"
    } else {
      if(this.real < 10  ) {
        return "运行停止"
      } else {
        return Math.abs(this.setting - this.real) < 100 ? "运行正常" : "运行波动"
      }
    }
  }

  async update(serverName) {
    await this.fetchReal(serverName)
    await this.fetchAccu(serverName)

    if (this.state === "运行正常" || this.state === "运行波动") {
      this.isTrigger = false
      this.electEye.checkState(Date.now())
    } else if(this.state === "运行停止" && !this.isTrigger) {
      this.isTrigger = true
      logger.info(`${this.line} ${this.name} 运行停止`)
    } 
  }
}

module.exports = WeightBell