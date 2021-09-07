const addFlavourConfig = require('./config/AddFlavourConfig.json')
const AddWaterConfig = require('./config/AddWaterConfig.json')
const { AddFlavourMon } = require('./class/AddFlavourMon')
const { AddWaterMon } = require('./class/AddWaterMon')

let addFlavourMonList = Object.keys(addFlavourConfig).map(location => {
  return new AddFlavourMon(location)
})

let addWaterMonList = Object.keys(AddWaterConfig).map(location => {
  return new AddWaterMon(location)
})

let monList = addFlavourMonList.concat(addWaterMonList)

setInterval(() => {
  for (let mon of monList) {
    mon.updateAll()
  }
}, 10 * 1000)