const term = require("terminal-kit").terminal

/*
monDict:
  {
    "加料": [],
    "回潮": []
  }
*/

let _monDict

function renderAddFlavour(addFlavour) {
  term(`${addFlavour.state}\n`)
  term(`${addFlavour.mainWeightBell.setting}\n`)
}

function renderAddWater(addWater) {
  term(`${addWater.state}\n`)
  term(`${addWater.mainWeightBell.setting}\n`)
}

function init(monDict) {
  _monDict = monDict
  term.clear()
}

function render() {
  // term.moveTo(1, 1)
  term.clear()
  for (const [key, monList] of Object.entries(_monDict)) {
    if (key === "回潮") {
      monList.forEach(mon => renderAddWater(mon))
    } else if (key === "加料") {
      monList.forEach(mon => renderAddFlavour(mon))
    }
  }
}



module.exports = {
  render,
  init
}