/*
 *
 * const winston = require('winston')
winston.emitErrs = false

const logLevel = (process.env.NODE_ENV === 'production') ? 'info' : 'debug'
console.log('node env: ', process.env.NODE_ENV, logLevel, winston)

let loggerTransports = []

// Spewing logs while running tests is annoying
if (process.env.NODE_ENV !== 'test') {
  loggerTransports.push(new winston.transports.Console({
    level: logLevel,
    handleExceptions: true,
    json: false,
    colorize: true,
    formatter: (options) => {
      let outputObject = {
        level: options.level.toUpperCase(),
        message: options.message,
        timestamp: new Date().toISOString()
      }

      let ret = JSON.stringify(Object.assign(outputObject, options.meta))
      // console.log('logging ', ret)
      return ret
    }
  }))
}

const logger = new winston.Logger({
  transports: loggerTransports,
  exitOnError: false
})
module.exports = logger

// TODO something about interaction btw sam and winston is causing logger.info to swallow logs
// so let's fake winston for now:
*/

let logLevel = 'debug'
if (process.env.NODE_ENV === 'production') logLevel = 'info'
if (process.env.NODE_ENV === 'test') logLevel = 'error'

const LEVELS = ['error', 'info', 'debug']

// General purpose logging function:
let _log = (level, message, meta) => {
  meta = meta || {}
  let obj = Object.assign({}, { level, message, timestamp: new Date().toISOString() }, meta)
  let logger = level === 'ERROR' ? console.error : console.log
  logger(JSON.stringify(obj))
}

// By default, nothing logs anything
let logger = {
  debug: () => null,
  info: () => null,
  error: () => null
}

// Overwrite no-op logging functions above based on `logLevel`
; LEVELS.forEach((level) => {
  if (LEVELS.indexOf(logLevel) >= LEVELS.indexOf(level)) {
    logger[level] = (message, meta) => _log(level.toUpperCase(), message, meta)
  }
})

module.exports = logger
