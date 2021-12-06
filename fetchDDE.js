const { NetDDEClient, Constants } = require('netdde')

const serverNameList = ["VMGZZSHMI3", "VMGZZSHMI6"]

var connectingServers = {}

async function fetchDDE (serverName, itemName, returnType) {
    if(!connectingServers.hasOwnProperty(serverName)) {
        await connectServer(serverName)
    }

    let temp = await connectingServers[serverName].request('tagname', itemName)

    if(returnType == 'int') {
        let intTemp = parseInt(temp, 10)

        if (Number.isNaN(intTemp)) throw Error(`${temp} from ${serverName}:${itemName} is not a number`)

        return intTemp
    }

    return temp
}

// async function fetchDDE (serverName, itemName) {

//     if(!connectingServers.hasOwnProperty(serverName)) {
//         await connectServer(serverName)
//     }

//     return await connectingServers[serverName].request('tagname', itemName)
// }

// async function advise (serverName, itemName) {
//     try {
//         if(!connectingServers.hasOwnProperty(serverName)) {
//             await connectServer(serverName)
//         }

//         connectingServers[serverName].advise('tagname', itemName, Constants.dataType.CF_TEXT)

//         return connectingServers[serverName]

//     } catch (err) {
//         console.log(err)
//         return null
//     }
// }

async function fetchInt(serverName, itemName) {
    let temp = parseInt(await fetchDDE(serverName, itemName), 10)

    if (Number.isNaN(temp)) {
        throw Error(`${temp} from ${serverName}:${itemName} is not a number`)
    }

    return temp
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
    fetchDDE,
    fetchInt,
    disconnectAllClients
}