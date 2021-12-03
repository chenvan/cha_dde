// require('winax')
// var voiceObj = new ActiveXObject("Sapi.SpVoice")

const process = require('process')
const { SwitchData, eventEmitter } = require('./DataType')
const monCofigList = require('./config/monitorData.json')

let monDataList = []

function main() {
  // console.log('HMI3: ', await fetchDDE('VMGZZSHMI3', '$second'))
  // console.log('HMI6: ', await fetchDDE('VMGZZSHMI6', '$second'))
  
  monDataList = monCofigList.map(monCofig => {
    if(monCofig.dataType == "SwitchData") {
      return new SwitchData(monCofig.lineName, monCofig.serverName, monCofig.itemName)
    } else {
      return null
    }
  })


  setInterval(update, 60 * 1000)
}

function update() {
  monDataList.forEach(monData => {
    if(monData !== null) {
      monData.update()
    }
  })
}

eventEmitter.on('', () => {

})

main()

process.on("SIGINT", async () => {
  // console.log("before exit")
  await disconnectAllClients()
  process.exit()
})
