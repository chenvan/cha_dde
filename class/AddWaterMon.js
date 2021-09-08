"use strict"

const { DeviceStateDetect } = require('./DeviceStateDetect')

const { fetchDDE } = require('../util/fetchDDE')
const { initTraceData } = require('../util/initTraceData')
// const { checkMoistureMeter } = require('../util/checkPara')
const { loadVoiceTips } = require('../util/loadVoiceTips')
const { logger } = require('../util/loggerHelper')

const AddWaterConfig = require('../config/AddWaterConfig.json')

class AddWaterMon {
  constructor(location) {

    this.location = location
    this.updateCount = 0
    this.serverName = AddWaterConfig[location]['serverName']
    this.deviceStateDetect = new DeviceStateDetect(this.location, this.serverName, 2)

    this.serviceList = [
      this.deviceStateDetect
    ]

    let traceDataConfig = AddWaterConfig[location]["traceData"]

    this.traceDataCol = initTraceData(this.serverName, traceDataConfig)

    this.isWaterBatchChange = false
    this.isCleanUpBatchChange = false

    this.voiceTipsTimeId = []
    
  }

  // 主程序间隔时间连续调用该程序
  async updateTraceData() {
    if(this.updateCount % 6 !== 0) return 
    
    for (let key in this.traceDataCol) {

      try {

        let isChange = await this.traceDataCol[key].update()

        if(isChange) {

          logger.info(`Trace ${key}, current value : ${this.traceDataCol[key].currentValue}.`)

          if(key === "回潮筒批次" && this.traceDataCol[key].currentValue.slice(0, -3) !== "") {
            // 回潮筒批次变更
            
            logger.info(`回潮筒批次变更:${this.traceDataCol[key].currentValue.slice(0, -3)}.`)

            this.isWaterBatchChange = true

          } else if(key === "除杂批次" && this.traceDataCol[key].currentValue.slice(0, -3) !== "") {
            // 除杂段批次变更

            logger.info(`除杂批次变更:${this.traceDataCol[key].currentValue.slice(0, -3)}.`)

            this.isCleanUpBatchChange = true

          } else if(key === "电子秤状态") {
            // 筒状态转为生产时 
            // 1.触发语音
            // 2.监控设备状态

            // 筒是生产状态的时候(或者秤有流量的时候), 电眼检查开启
            // 当筒是其他状态(或者秤没有流量时), 电眼检查是否可以停掉
            // 因为假设电眼检测到暂存仓提升带电眼因为有遮挡长时间亮, 而秤的流量已经掉到0关闭了检测, 那么可能会miss掉这次检测
            // 或者我们都用 settimeout的方式, 延长10s设置 isMon
            
            logger.info("电子秤状态变更")

            if(this.traceDataCol[key].currentValue === 2) {
              
              if(!this.deviceStateDetect.isInit) await this.deviceStateDetect.init()

              this.deviceStateDetect.isMon = true

              if(this.traceDataCol[key].lastValue !== undefined) {
                this.voiceTipsTimeId = loadVoiceTips(this.location, key, this.currentBrandName)
              }

            } else if(this.traceDataCol[key].currentValue === 0) {
              
              this.deviceStateDetect.isMon = false

              if(this.traceDataCol[key].lastValue !== undefined) {
                this.voiceTipsTimeId.forEach(timeId => clearTimeout(timeId))
              }

            }
          }
        }
      } catch (err) {
        
        logger.error(key, err)

        if (err.message === "Not connected") {
          await this.deviceStateDetect.reset()

          logger.info('reset deviceStateDetect')
        }
      }
    }

    if(this.isWaterBatchChange && this.isCleanUpBatchChange) {
      logger.info('批次')

      if(this.traceDataCol['回潮筒批次'].currentValue === this.traceDataCol['除杂批次'].currentValue) {
        
        let brandNameTemp =  await fetchDDE(this.serverName, 'Galaxy:rHN_Z6.HN6.Z6_ZCBC_CurrRecName', 'string')
        this.currentBrandName = brandNameTemp.slice(0, -3)
      
        if(this.traceDataCol['回潮筒批次'].lastValue !== undefined && this.traceDataCol['除杂批次'].lastValue !== undefined) {
          loadVoiceTips(this.location, "批次", this.currentBrandName)
        }

      } else {
        logger.error(`${this.location}, 回潮筒批次与除杂批次不一致`)
      }

      this.isWaterBatchChange = false
      this.isCleanUpBatchChange = false
    }
  }

  async updateService() {
    for(let service of this.serviceList) {
      try {
        await service.update(this.updateCount)    
      } catch(err) {
        logger.error(err)
      }
    }
  }


  async updateAll() {
    this.recordUpdateCount()
    await this.updateTraceData()
    await this.updateService()
  }

  recordUpdateCount() {
    this.updateCount += 1
    if (this.updateCount > 60) this.updateCount -= 60
  }

  async checkPara(paraConfig) {
    
  //   let resultList = await Promise.all([
  //     checkMoistureMeter(this.location, this.serverName, paraConfig['MoistureMeter'])
  //   ])

  //   let finalResult = resultList.reduce((prev, curr) => prev && curr, true)
    
  //   if(finalResult) {
  //     logger.info(`${this.location} 参数检查完毕, 没有发现错误`)
  //   }
  }
}

module.exports = {
  AddWaterMon
}
