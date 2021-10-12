const { fetchDDE } = require('./fetchDDE')
const {speakTwice } = require('./speak')
const { logger } = require("../util/loggerHelper")

async function checkMoistureMeter(line, serverName, config) {
  for(let name in config) {
    let [temp1, temp2] = await Promise.all([
      fetchDDE(serverName, config[name]['itemName'][0], 'string'),
      fetchDDE(serverName, config[name]['itemName'][1], 'string'),
    ])

    if (temp1 !== temp2) {
      logger.info(`${line}, ${name} 状态异常`)
      speakTwice(`${line}, ${name} 状态异常`)
    }
  }
}

async function checkPara(line, serverName, paraConfig) {
    if(paraConfig.hasOwnProperty("MoistureMeter")) {
        await checkMoistureMeter(line, serverName, paraConfig['MoistureMeter'])
    }
}


module.exports = {
  checkPara
}