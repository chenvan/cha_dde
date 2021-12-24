const { speakTwice } = require('../util/speak')

const voiceConfig = require('../config/voiceTips.json')

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