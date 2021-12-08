const addFlavourConfig = require('./config/AddFlavourConfig.json')
const { AddFlavourMon } = require('./class/AddFlavourMon')

let monList = Object.keys(addFlavourConfig).map(location => {
  return new AddFlavourMon(location)
})

setInterval(() => {
  for (let mon of monList) {
    mon.updateAll()
  }
}, 20 * 1000)