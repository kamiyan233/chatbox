var log4js = require("log4js");

log4js.configure({

    appenders: {
        log: { type: "file", filename: "log.log" },
        console: {
            type: 'console'
        },
    },
    categories:
    {
        info: { appenders: ['console',"log"], level: "info" },
        default: { appenders: ['console',"log"], level: "trace" },
        debug: { appenders: ['console',"log"], level: "debug" },
        warn: { appenders: ['console', 'log'], level: 'warn' },
        err: { appenders: ['console', 'log'], level: 'error' },
        fatal: { appenders: ['console', 'log'], level: 'fatal' }
    }
})

var logger = log4js.getLogger('log');
// logger.level = "debug";
// logger.debug("Some debug messages");

module.exports = logger