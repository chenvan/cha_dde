// require('winax')
// var voiceObj = new ActiveXObject("Sapi.SpVoice")

const process = require('process')
const { SwitchData, CabinetOutputData ,eventEmitter } = require('./DataType')
const monCofigDict = require('./config/monitorData.json')

let monDataDict = {}

function main() {

  monDataDict = Object.keys(monCofigDict).reduce((dataDict, key) => {
      let temp = monCofigDict[key]
      if(temp.dataType == "SwitchData") {
        dataDict[key] = new SwitchData(temp.serverName, temp.itemName, temp.eventName, temp.monKey)
      }
      return dataDict
  }, {})

  setInterval(update, 50 * 1000)
}

function update() {
  Object.keys(monDataDict).forEach(key => {
    monDataDict[key].update()
  })
}

eventEmitter.on('换柜', async (outputNr, monKey) => {
  // use monKey to get serverName and itemName we want
  let cabinetInfo = require('./config/cabinetInfo.json')
  let chosen = cabinetInfo[monKey]

  if(chosen.hasOwnProperty(outputNr)) {
    monDataDict[monKey] = new CabinetOutputData(
      monKey, outputNr, chosen['serverName'], chosen['weightAccItemName'], chosen['weightBatchIdItemName'],
      chosen[outputNr]['cabinetTotalItemName'], chosen[outputNr]['inModeItemName'],chosen[outputNr]['highFreqSettingItemName'], 
      chosen[outputNr]['lowFreqSettingItemName'], chosen[outputNr]['cabinetBatchIdItemName'], chosen[outputNr]['diff']
    )
  }
})

main()

// process.on("SIGINT", async () => {
//   // console.log("before exit")
//   await disconnectAllClients()
//   process.exit()
// })
