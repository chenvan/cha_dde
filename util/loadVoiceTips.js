const { speakTwice } = require('../util/speak')

const voiceConfig = require('../config/voiceTips.json')
/*
加载语音:
整个监控系统的启动时机并不确定, 所以需要先算出"开始时间点"
"开始时间点"可通过秤累计量和秤流量计算
那么为什么不直接用秤累计量做为触发语音的条件呢?

如果使用秤累计量做语音触发
加载语音为array
间隙获得秤累计量, 比较触发时机

或者通过 lastValue, 查看启动时机

*/

function loadVoiceTips(location, key, brandName){
  if(!voiceConfig.hasOwnProperty[location] || !voiceConfig[location].hasOwnProperty(key)) {
    console.log(`${location} ${key} voice tips does not exist`)

    return []
  }
  
  let voiceTipsList = voiceConfig[location][key]

  return voiceTipsList.map(voiceTip => {
      return setTimeout(speakTwice, voiceTip.offsetInterval * 1000, voiceTip.content)
  })
}

module.exports = {
  loadVoiceTips
}