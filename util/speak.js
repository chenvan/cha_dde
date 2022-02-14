require('winax')

const voiceObj = new ActiveXObject("Sapi.SpVoice")

function speakTwice(msg) {
  voiceObj.speak(msg, 1)
  voiceObj.speak(msg, 1)
}

module.exports = {
  speakTwice
}