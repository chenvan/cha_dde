const AddFlavour = require('./mobx_test/AddFlavour')
const AddWater = require('./mobx_test/AddWater')
const UI = require('./mobx_test/UI')

let setting = {
  "加料": ["六四加料"],
  "回潮": ["六四回潮"]
}

async function main () {
  let monDict = {}
  let monList = []

  for (const [key, lineList] of Object.entries(setting)) {
    if (key === "加料") {
      monDict[key] = lineList.map(line => new AddFlavour(line))
    } else if (key === "回潮") {
      monDict[key] = lineList.map(line => new AddWater(line))
    }
  }

  for (const vList of Object.values(monDict)) {
    monList = monList.concat(vList)
  }

  await Promise.all(monList.map(mon => mon.init()))

  if(process.env.NODE_ENV !== "dev") {
    UI.init(monDict)
  }

  setInterval(() => {
    monList.forEach(mon => mon.update())

    if(process.env.NODE_ENV !== "dev") {
      UI.render()
    }

  }, 1000 * 10)
}


main()
