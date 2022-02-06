const AddFlavour = require('./mobx_test/AddFlavour')
const AddWater = require('./mobx_test/AddWater')

const blessed = require('blessed')
const contrib = require('blessed-contrib')

const screen = blessed.screen({fullUnicode: true})
var grid = new contrib.grid({rows: 2, cols: 2, screen: screen})

// generate container
let setting = {
  "回潮": ["六四回潮"],
  "加料": ["六四加料"]
}

let boxes = {}

let i = 0
for (const lineList of Object.values(setting)) {
  let j = 0
  for(const line of lineList) {
    boxes[line] = grid.set(i, j, 1, 1, blessed.box, {label: line, tags: true})
    j++
  }
  i++
}


screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

screen.render()

async function main () {
  let monList = []

  for (const [key, lineList] of Object.entries(setting)) {
    if (key === "加料") {
      monList = monList.concat(lineList.map(line => new AddFlavour(line, boxes[line])))
    } else if (key === "回潮") {
      monList = monList.concat(lineList.map(line => new AddWater(line, boxes[line])))
    }
  }

  await Promise.all(monList.map(mon => mon.init()))

  setInterval(() => {
    monList.forEach(mon => mon.update())
  }, 1000 * 10)
}


main()
