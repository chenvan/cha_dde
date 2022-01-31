const { NetDDEClient, Constants } = require('netdde')
const fakeDataConfig = require("../mobx_test_config/test.json")

const serverNameList = ["VMGZZSHMI3", "VMGZZSHMI6"]

var connectingServers = {}

async function fetchDDE (serverName, itemName, returnType) {
    if(!connectingServers.hasOwnProperty(serverName)) {
        await connectServer(serverName)
    }

    let temp = await request(serverName, itemName)

    if(returnType == 'int') {
        let intTemp = parseInt(temp, 10)

        if (Number.isNaN(intTemp)) throw Error(`${serverName}:${itemName} -> get ${temp} is not a number`)

        return intTemp
    }

    return temp
}

async function request(serverName, itemName) {
    try {
        let temp

        for (let i = 0; i < 4; i++) {
            temp = await connectingServers[serverName].request('tagname', itemName)
            if (temp !== "") break
        }
        
        return temp
    } catch(err) {

        if (err.message === "Not connected") {
            delete connectingServers[serverName]
        }

        throw err
    }
}


async function setAdvise(serverName, itemName, callback){
    if(!connectingServers.hasOwnProperty(serverName)) {
        await connectServer(serverName)
    }

    // 程序本来只使用 "advise" 这个事件名去触发数据, 我们需要改成用 itemName 作为事件名去触发数据  
    connectingServers[serverName].on(itemName, d => callback(d))

    await connectingServers[serverName].advise('tagname', itemName, Constants.dataType.CF_TEXT)
}

async function cancelAdvise(serverName, itemName) {
    if(!connectingServers.hasOwnProperty(serverName)) {
        await connectServer(serverName)
    }

    await connectingServers[serverName].stopAdvise('tagname', itemName, Constants.dataType.CF_TEXT)
}

async function connectServer(serverName) {
    if (!serverNameList.includes(serverName)) {
        throw new Error(`server ${serverName} does not exist`)
    }

    let tempClient = new NetDDEClient("view", {host: serverName, timeout: 30000})
            
    tempClient.on("error", err => {
        //Error: read ECONNRESET
        console.log('listen error')
        console.log(serverName)
        console.log(err)
        
        delete connectingServers[serverName]
    }) // 通信中断的 error 出现在这？
    
    await tempClient.connect().then(() => {
        connectingServers[serverName] = tempClient
    })
}

async function disconnectAllClients() {
    for (let serverName in connectingServers)
       await connectingServers[serverName].disconnect()
}

async function fetchDDETest(serverName, itemName, returnType) {
    if(fakeDataConfig.hasOwnProperty(itemName)) {
        return fakeDataConfig[itemName]
    } else {
        if(returnType === "int"){
            return 1000
        } else {
            return "test"
        }
    }
}

async function setAdviseTest(serverName, itemName, callback) {
    if(fakeDataConfig.hasOwnProperty(itemName)) {
        callback({data: fakeDataConfig[itemName]})
    } else {
        callback({data: "0"})
    }
}

async function disconnectAllClientsTest() {
    
}

if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === "dev") {
    module.exports = {
        fetchDDE: fetchDDETest,
        setAdvise: setAdviseTest,
        disconnectAllClients: disconnectAllClientsTest
    }
} else {
    module.exports = {
        fetchDDE,
        setAdvise,
        disconnectAllClients
    }
}
