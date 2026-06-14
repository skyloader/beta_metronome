import _ from 'lodash';
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (LogLevel = {}));
export class TastytradeLogger {
    constructor(logger, logLevel) {
        this.logger = null;
        this.logger = logger ?? null;
        this.logLevel = logLevel ?? LogLevel.ERROR;
    }
    updateConfig(config) {
        const loggerConfig = _.pick(config, ['logger', 'logLevel']);
        Object.assign(this, loggerConfig);
    }
    error(...data) {
        if (this.shouldLog(LogLevel.ERROR)) {
            this.logger.error(...data);
        }
    }
    info(...data) {
        if (this.shouldLog(LogLevel.INFO)) {
            this.logger.info(...data);
        }
    }
    warn(...data) {
        if (this.shouldLog(LogLevel.WARN)) {
            this.logger.warn(...data);
        }
    }
    shouldLog(level) {
        if (_.isNil(this.logger)) {
            return false;
        }
        return LogLevel[level] >= LogLevel[this.logLevel];
    }
}
//# sourceMappingURL=logger.js.map