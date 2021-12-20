const { speakTwice } = require('../util/speak')

const voiceConfig = require('../config/voiceTips.json')

function loadVoiceTips(location, key, brandName){
  let voiceTipsList = voiceConfig[location][key]

  return voiceTipsList.map(voiceTip => {
      return setTimeout(speakTwice, voiceTip.offsetInterval * 1000, voiceTip.content)
  })
}

module.exports = {
  loadVoiceTips
}