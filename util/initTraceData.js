const { TraceData, TraceSettingData } = require('../class/BaseDataType')

function initTraceData(serverName, traceDataConfig) {
  return Object.keys(traceDataConfig).reduce((col, key) => {

    if(traceDataConfig[key]['classType'] === "switch") {
      col[key] = new TraceData(
        serverName, 
        traceDataConfig[key]['itemName'],
        traceDataConfig[key]['valueType']
      )
    } else if(traceDataConfig[key]['classType'] === "setting") {
      col[key] = new TraceSettingData(
        serverName, 
        traceDataConfig[key]['itemName']['setting'],
        traceDataConfig[key]['itemName']['real'],
        traceDataConfig[key]['valueType'],
        traceDataConfig[key]['precise']
      )
    }

    return col
  }, {})
}

module.exports = {
  initTraceData
}