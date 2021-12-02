class CabinetInfo {

}


class CabinetOutputMonitor {
  constructor(serverItemName, weightAccItemName, cabinetOutputNrItemName) {
    this.itemName = {
      serverName: serverItemName,
      weightAcc: weightAccItemName,
      cabinetOutputNr: cabinetOutputNrItemName
    }
  }

  start() {
    // advise Output Number
    // 改写一下 netdde advise 的接收方式
    // call backfunction listen 
  }

  stop() {

  }
}