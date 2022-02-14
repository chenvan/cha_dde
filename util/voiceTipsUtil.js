const { speakTwice } = require('./speak.js')
const { logger } = require('./loggerHelper')

/* 
VoiceTips 包含 准备段 和 运行段
准备段是设备未开始工作时的提醒
运行段是设备开始工作后的提醒

VoiceTips的结构
{
    line: {
        "准备段": [
            {
                offset: time(seconds),
                content: string,
                filter(option): array
            }
        ],
        "运行段" [

        ]
    }
}
*/


function loadVoiceTips(line, fileName) {
    const voiceTipsConfig =  require(`../config/VoiceTips/${fileName}.json`)
    return voiceTipsConfig[line]
}

function setRunningVoiceTips(runningVoiceTips, brandName, setting, accu) {
    let passSeconds = accu / setting * 3600
    
    return runningVoiceTips.filter(voiceTip => {
        if(voiceTip.offset >= passSeconds) {
            if(!voiceTip.hasOwnProperty("filter")) return true
            if(voiceTip.filter.includes(brandName)) return true
        }
        return false
    }).map(voiceTip => {
        return setTimeout(() => {
            speakTwice(voiceTip.content)
            logger.info(`运行语音: ${voiceTip.content}`)
        }, (voiceTip.offset - passSeconds) * 1000)
    })
}

function setReadyVoiceTips(readyVoiceTips, brandName) {
    return readyVoiceTips.filter(voiceTip => {
        if(!voiceTip.hasOwnProperty("filter")) return true
        if(voiceTip.filter.includes(brandName)) return true
        return false
    }).map(voiceTip => {
        return setTimeout(() => {
            speakTwice(voiceTip.content)
            logger.info(`准备语音: ${voiceTip.content}`)
        }, voiceTip.offset * 1000)
    })
}

function clearVoiceTips(timeoutList) {
    timeoutList.forEach(timeout => clearTimeout(timeout))
}

module.exports = {
    setRunningVoiceTips,
    setReadyVoiceTips,
    clearVoiceTips,
    loadVoiceTips
}