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
  let chosenOne = cabinetInfo[monKey]

  if(chosenOne.hasOwnProperty(outputNr)) {
    monDataDict[monKey] = new CabinetOutputData(
      monKey, outputNr, chosenOne['serverName'], chosenOne['weightAccItemName'], 
      chosenOne[outputNr]['cabinetTotalItemName'], chosenOne[outputNr]['inModeItemName'],
      chosenOne[outputNr]['highFreqSettingItemName'], chosenOne[outputNr]['lowFreqSettingItemName'],
      chosenOne[outputNr]['diff']
    )
  }
})

main()

// process.on("SIGINT", async () => {
//   // console.log("before exit")
//   await disconnectAllClients()
//   process.exit()
// })
