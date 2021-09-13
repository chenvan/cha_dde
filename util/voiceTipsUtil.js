const { speakTwice } = require('./speak.js')

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
    const voiceTipsConfig =  require(`../mobx_test_config/VoiceTips/${fileName}.json`)
    return voiceTipsConfig[line]
}

function setRunningVoiceTips(runningVoiceTips, brandName, setting, accu) {
    let passSeconds = accu / setting * 3600
    
    return runningVoiceTips.filter(voiceTips => {
        if(voiceTips.offset >= passSeconds) {
            if(!voiceTips.hasOwnProperty(filter)) return true
            if(voiceTips.filter.includes(brandName)) return true
        }
        return false
    }).map(voiceTips => {
        return setTimeout(() => speakTwice(voiceTips.content), voiceTips.offset - passSeconds)
    })
}

function setReadyVoiceTips(voiceTips) {

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