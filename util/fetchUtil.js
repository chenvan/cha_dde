const { fetchDDE } = require("./fetchDDE")


async function fetchBrandName(serverName, itemName, valueType) {
    let data =  await fetchDDE(serverName, itemName, valueType)
    return data.slice(0, -3)
}

async function testServerConnect(serverName) {
    // 通过获取秒数来测试 Server 是否通
    let seconds = await fetchDDE(serverName, "$Second", "int")
}

module.exports = {
    fetchBrandName,
    testServerConnect
}