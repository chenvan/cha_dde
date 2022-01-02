const addWaterConfig = require('./config/AddWaterConfig.json')
const { AddWaterMon } = require('./class/AddWaterMon')

let monList = Object.keys(addWaterConfig).map(location => {
  return new AddWaterMon(location)
})

setInterval(() => {
  for (let mon of monList) {
    mon.updateAll()
  }
}, 10 * 1000)