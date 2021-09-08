const { createLogger, format, transports } = require("winston")
const path = require('path')

/*
    不同的运行环境，logger不一样
*/

let rootPath = path.join("D:","cha_dde","logs")

let infix = process.env.NODE_ENV === "test" ? ".test." : ".prod."

let errFileName = ''.concat('error', infix, 'log')
let infoFileName = ''.concat('combined', infix, 'log')

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({stack: true}),
        format.splat(),
        format.json(),
        // format.colorize(),
        format.simple()
    ),
    transports: [
        new transports.File({filename: path.join(rootPath, errFileName), level: 'error', maxsize: 100000}),
        new transports.File({filename: path.join(rootPath, infoFileName), level: 'info', maxsize: 100000}),
        new transports.Console({format: format.combine(format.colorize())})
    ],
})

module.exports = {
    logger
}