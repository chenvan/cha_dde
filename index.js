require('winax')
var voiceObj = new ActiveXObject("Sapi.SpVoice")

const process = require('process')
// const { fetchDDE, disconnectAllClients } = require('./fetchDDE')


async function main() {
  console.log('HMI3: ', await fetchDDE('VMGZZSHMI3', '$second'))
  console.log('HMI6: ', await fetchDDE('VMGZZSHMI6', '$second'))
}


function hookCabinetOutputService() {
  // read json file to know how many cabinet output
  
  // advice the key data item, which is output cabinet NO. and call back function for data item change

  // you could set many advice, but you only have one client one callback function

}

setInterval(main, 1500)

process.on("SIGINT", async () => {
  // console.log("before exit")
  await disconnectAllClients()
  process.exit()
})


//   // 使用DDE Query 可以知道CF_TEXT传送的编码是GBK, 但是接收到的编码却不是
//   // 因此修改了 NetDDE 少部分代码







