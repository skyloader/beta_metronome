export default interface Logger {
    error(...data: any[]): void;
    info(...data: any[]): void;
    warn(...data: any[]): void;
}
export declare enum LogLevel {
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
export declare class TastytradeLogger implements Logger {
    logLevel: LogLevel;
    logger: Logger | null;
    constructor(logger?: Logger, logLevel?: LogLevel);
    updateConfig(config: Partial<{
        logger: Logger;
        logLevel: LogLevel;
    }>): void;
    error(...data: any[]): void;
    info(...data: any[]): void;
    warn(...data: any[]): void;
    private shouldLog;
}
//# sourceMappingURL=logger.d.ts.map