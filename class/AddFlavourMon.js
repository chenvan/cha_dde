const { TraceData } = require('./BaseDataType')
const { CabinetOutput } = require('./CabinetOutput')

const AddFlavourConfig = require('../config/AddFlavourConfig.json')

class AddFlavourMon {
  constructor(location) {
    this.location = location
    this.serverName = AddFlavourConfig[location]['serverName']
    
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

  updateTraceData() {
    for (let key in this.traceDataCol) {
      try {
        let isChange = await this.traceDataCol[key].update()

        if(isChange) {
          if(key === '出柜号' && 
              CabinetOutput.isExistOutpurNr(this.location, this.traceDataCol['key'].currentValue)) {
            // 需要用静态方法检测出柜号
            this.cabinetOutput = new CabinetOutput(
              this.location, 
              this.serverName, 
              this.traceDataCol['key'].currentValue
            )
          }
        }
      } catch (err) {
        console.log(err)
      }
    }
  }
}
