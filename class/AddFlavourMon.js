const { TraceData } = require('./BaseDataType')
const { CabinetOutput } = require('./CabinetOutput')

const AddFlavourConfig = require('../config/AddFlavourConfig.json')
const { fetchDDE } = require('../fetchDDE')

class AddFlavourMon {
  constructor(location) {

    this.location = location
    this.updateCount = 0
    this.serverName = AddFlavourConfig[location]['serverName']
    this.cabinetOutput = new CabinetOutput(this.location, this.serverName)

    this.serviceList = [
      this.cabinetOutput
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
          if(key === '出柜号' && 
              CabinetOutput.isExistOutpurNr(this.location, this.traceDataCol[key].currentValue)) {
            // 出柜号变更
            // 有一种情况：当柜号从 undefined 转成 0（无出柜号）的时候，cabinetOutput.init 没有完成， 同时柜号也不会出现在 cabinetOutput里面
            // 更新或创建新的 CabinetOutput 类, 并检查出柜频率
            this.cabinetOutput.isInitSuccess = false
            await this.cabinetOutput.init(this.traceDataCol[key].currentValue)

          } else if(key === "批次" && this.traceDataCol[key].currentValue.trim() !== "") {
            // 批次变更
            // 1.监控出料情况, 就是 秤累计量 与 柜的总量开始进行计算
            // 2.检查参数
            this.cabinetOutput.isMon = true

            let brandName = await fetchDDE(this.serverName, 'Galaxy:ZY2_YPSpice_JK.ProductUnit.BrandName_Now', 'string')
            console.log(`批次值 after trim: ${this.traceDataCol[key].currentValue.trim()}.`)
            console.log(`牌号 -> ${brandName}.`)
          
          } else if(key === '筒状态') {
            // 筒状态转为生产时 
            // 1.触发语音
            // 2.监控后舱低料位
          }
        }
      } catch (err) {
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
