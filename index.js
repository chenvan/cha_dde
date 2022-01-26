const AddFlavour = require('./mobx_test/AddFlavour')

async function main () {
  let addFlavourMon = new AddFlavour("六四加料")

  await addFlavourMon.init()

  setInterval(() => addFlavourMon.update(), 1000 * 10)
}


main()
