const { TraceData } = require('./BaseDataType')
const { CabinetOutput } = require('./CabinetOutput')

const AddFlavourConfig = require('../config/AddFlavourConfig.json')

class AddFlavourMon {
  constructor(location) {

    this.location = location
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
    for (let key in this.traceDataCol) {

      try {

        let isChange = await this.traceDataCol[key].update()

        if(isChange) {
          // 用静态方法检测出柜号是否存在 config 中
          if(key === '出柜号' && 
              CabinetOutput.isExistOutpurNr(this.location, this.traceDataCol[key].currentValue)) {
            
            // 出柜号变更 -> 更新或创建新的 CabinetOutput 类, 并检查出柜频率
            await this.cabinetOutput.init(this.traceDataCol[key].currentValue)

          } else if(key === "批次" && this.traceDataCol[key].currentValue !== "") {
            // 批次变更 -> 监控出料情况, 就是 秤累计量 与 柜的总量开始进行计算
            this.cabinetOutput.isMon = true
          }
        }
      } catch (err) {
        console.log(err)
      }
    }
  }

  async updateService() {
    for(let service of this.serviceList) {
      if (service.isMon) {
        await service.update()
      }
    }
  }

  async updateAll() {
    await this.updateTraceData()
    await this.updateService()
  }
}

module.exports = {
  AddFlavourMon
}
