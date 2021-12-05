require('winax')

const voiceObj = new ActiveXObject("Sapi.SpVoice")

function speakTwice(msg) {
  voiceObj.speak(msg)
  voiceObj.speak(msg)
}

module.exports = {
  speakTwice
}