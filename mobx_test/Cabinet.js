'use strict'

const { makeAutoObservable, action, reaction, override, autorun, runInAction } = require("mobx")
const { setAdvise, fetchDDE } = require("../util/fetchDDE")
const { logger } = require("../util/loggerHelper")

/*
Cabinet 监控柜的半柜电眼是否正常
state: 获取信息 -> 监控 -> 完成
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
        if(this.cabinetConfig.hasOwnProperty(this.outputNr)) {
          if (this.state === "监控") {
            logger.info(`监控状态下, 出柜号发生更换`)
          }

          this.state = "获取信息"
        }
      }
    )

    // autorun(() => {
    //   console.log("cabinet 出柜")
    //   console.log(this.state, this.total, this.outputNr)
    //   console.log("===========================")
    // })
  }

  async init(serverName) {
    await setAdvise(serverName, this.cabinetConfig["outputNr"].itemName, action(state => {
      // logger.info(`cabinet output Nr change to ${state.data}.`)
      this.outputNr = parseInt(state.data, 10)
    }))
  }

  async reConnect(serverName) {
    await this.init(serverName)
  }

  async updateCabinetInfo(serverName) {
    if (this.state === "获取信息") {
      // console.log(this.outputNr, serverName, this.cabinetConfig[this.outputNr]["total"].itemName, this.cabinetConfig[this.outputNr]["total"].valueType)
      let total = await fetchDDE(
        serverName,
        this.cabinetConfig[this.outputNr]["total"].itemName,
        this.cabinetConfig[this.outputNr]["total"].valueType
      )
      
      runInAction(() => {
        this.total = total
        this.state = "监控"
      })
      
      // 检查出柜频率
      await this.checkOutputFreqSetting()
    } 
  }

  async checkOutputFreqSetting() {
    // 
  }

  async checkHalfEyeState(serverName, weightBellAccu) {
    if(this.state === "监控" && this.total - weightBellAccu < this.cabinetConfig[this.outputNr].reference.diff) {
      
      let halfEyeState = await fetchDDE(
        serverName, 
        this.cabinetConfig[this.outputNr]["halfEye"].itemName,
        this.cabinetConfig[this.outputNr]["halfEye"].valueType,
      )
      
      logger.info(`halfEyeState: ${halfEyeState}`)

      if(halfEyeState === 1) {
        logger.info(`${this.line} 加料出柜未转高速`)
      }

      runInAction(() => this.state = "完成")
    }
  }
}

module.exports = Cabinet