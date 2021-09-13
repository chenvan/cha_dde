const { fetchDDE } = require("./fetchDDE")


async function fetchBrandName(serverName, itemName, valueType) {
    let data =  await fetchDDE(serverName, itemName, valueType)
    return data.slice(0, -3)
}

module.exports = {
    fetchBrandName
}