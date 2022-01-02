/*
是否应该不包括主秤, 

主秤与换批是对各单元监控以及触发语音, 这里只作辅助秤

*/

class WeightBellMon {
  constructor(serverName, config) {
    // config must have
    // weight bell real volumn itemName

    // config might have
    // two electEye itemName for control input output
    // one electEye itemName for monitor weight bell is real running
    // ? might have weight bell setting volumn itemName
    this.serverName = serverName
    this.isMon = false



  }
}

module.exports = {
  WeightBellMon
}