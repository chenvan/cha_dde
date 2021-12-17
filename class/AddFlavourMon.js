const { TraceData } = require('./BaseDataType')
const { CabinetOutput } = require('./CabinetOutput')
const { ElectEyeDetect } = require('./ElectEyeDetect')

const AddFlavourConfig = require('../config/AddFlavourConfig.json')
const { fetchDDE } = require('../fetchDDE')

class AddFlavourMon {
  constructor(location) {

    this.location = location
    this.updateCount = 0
    this.serverName = AddFlavourConfig[location]['serverName']
    this.cabinetOutput = new CabinetOutput(this.location, this.serverName)
    this.electEyeDetect = new ElectEyeDetect(this.location, this.serverName)

    this.serviceList = [
      this.cabinetOutput,
      this.electEyeDetect
    ]

    let traceDataConfig = AddFlavourConfig[location]["traceData"]

    this.traceDataCol = Object.keys(traceDataConfig).reduce((col, key) => {
      
      col[key] = new TraceData(
        this.serverName, 
        traceDataConfig[key]['itemName'],
        traceDataConfig[key]['valueType']
      )

      return col
    }, {})
  }

  // 主程序间隔时间连续调用该程序
  async updateTraceData() {
    if(this.updateCount % 6 !== 0) return 
    
    for (let key in this.traceDataCol) {

      try {

        let isChange = await this.traceDataCol[key].update()

        if(isChange) {

          console.log(`Trace ${key}, current value : ${this.traceDataCol[key].currentValue}.`)
          
          // 用静态方法检测出柜号是否存在 config 中
          // if(key === '出柜号' && 
          //     CabinetOutput.isExistOutpurNr(this.location, this.traceDataCol[key].currentValue)) {
          //   // 出柜号变更
          //   // 更新或创建新的 CabinetOutput 类, 并检查出柜频率
          //   await this.cabinetOutput.init(this.traceDataCol[key].currentValue)

          // } else 

          if(key === "批次" && this.traceDataCol[key].currentValue.slice(0, -3) !== "") {
            // 批次变更
            // 1.监控出料情况, 就是 秤累计量 与 柜的总量开始进行计算
            // 2.检查参数
            this.cabinetOutput.isMon = true

            let brandNameTemp = await fetchDDE(this.serverName, 'Galaxy:ZY2_YPSpice_JK.ProductUnit.BrandName_Now', 'string')
            let brandName = brandNameTemp.slice(0, -3)
            console.log(`牌号 -> ${brandName}.`)

            // check parameter
          
          } 
          // else if(key === '筒生产状态') {
          //   // 筒状态转为生产时 
          //   // 1.触发语音
          //   // 2.监控后舱低料位

          //   // 筒是生产状态的时候(或者秤有流量的时候), 电眼检查开启
          //   // 当筒是其他状态(或者秤没有流量时), 电眼检查是否可以停掉
          //   // 因为假设电眼检测到暂存仓提升带电眼因为有遮挡长时间亮, 而秤的流量已经掉到0关闭了检测, 那么可能会miss掉这次检测
          //   // 或者我们都用 settimeout的方式, 延长10s设置 isMon

          //   // 是否改用电子秤流量?
          //   // this.electEyeDetect.isMon = true
          //   console.log("%s.", this.traceDataCol[key].currentValue)

          // }
        }
      } catch (err) {
        console.log(key)
        console.log(err)
      }
    }
  }

  async updateService() {
    for(let service of this.serviceList) {
      try {
          await service.update(this.updateCount)    
      } catch(err) {
        console.log(err)
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
}

module.exports = {
  AddFlavourMon
}
