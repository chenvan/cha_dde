const { NetDDEClient, Constants } = require('netdde')

const serverNameList = ["VMGZZSHMI3", "VMGZZSHMI6"]

var connectingServers = {}

async function fetchDDE (serverName, itemName) {

    try {
        if(!connectingServers.hasOwnProperty(serverName)) {
            await connectServer(serverName)
        }
    
        return await connectingServers[serverName].request('tagname', itemName)

    } catch (err) {
        //Error: Process interrupted
        //Error: connect ECONNREFUSED 192.168.12.55:8888
        console.log(err) // 一开始无法连接的 error 出现在这
        return null
    }
}

async function advise (serverName, itemName) {
    try {
        if(!connectingServers.hasOwnProperty(serverName)) {
            await connectServer(serverName)
        }

        connectingServers[serverName].advise('tagname', itemName, Constants.dataType.CF_TEXT)

        return connectingServers[serverName]

    } catch (err) {
        console.log(err)
        return null
    }
}

async function connectServer(serverName) {
    if (!serverNameList.includes(serverName)) {
        throw new Error(`server ${serverName} does not exist`)
    }

    let tempClient = new NetDDEClient("view", {host: serverName})
            
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

async function disconnectAllClients( ) {
    for (let serverName in connectingServers)
       await connectingServers[serverName].disconnect()
}

module.exports = {
    advise,
    fetchDDE,
    disconnectAllClients
}