const { fetchDDE } = require('./fetchDDE')
const {speakTwice } = require('./speak')

async function checkMoistureMeter(location, serverName, config) {
  let result = true
  for(let name in config) {
    let [temp1, temp2] = await Promise.all([
      fetchDDE(serverName, config[name]['itemName'][0], 'string'),
      fetchDDE(serverName, config[name]['itemName'][1], 'string'),
    ])

    if (temp1 !== temp2) {
      console.log(`${location}, ${name} 状态异常`)
      speakTwice(`${location}, ${name} 状态异常`)

      result = result && false
    }
  }
  
  return result
}


module.exports = {
  checkMoistureMeter
}