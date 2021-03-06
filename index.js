const AddFlavour = require('./class/AddFlavour')
const AddWater = require('./class/AddWater')
const blessed = require('blessed')
const contrib = require('blessed-contrib')

const screen = blessed.screen({fullUnicode: true})
const grid = new contrib.grid({rows: 3, cols: 2, screen: screen})

let setting = {
  "回潮": ["六四回潮"],
  "加料": ["六四加料"]
}

let boxes = Object.values(setting).reduce((boxes, lineList, i) => {
  
  lineList.forEach((line, j) => {
    boxes[line] = grid.set(i, j, 1, 1, blessed.box, {label: line, tags: true})
  })

  return boxes
}, {})


screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
})


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

  screen.render()
  
  setInterval(() => {
    monList.forEach(mon => mon.update())
  }, 1000 * 10)
}


main()
