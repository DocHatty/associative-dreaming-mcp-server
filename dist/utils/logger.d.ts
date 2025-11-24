export type LogLevel = "debug" | "info" | "warn" | "error";
export declare function log(level: LogLevel, message: string, details?: Record<string, unknown>): void;
export declare function logError(error: unknown, context?: Record<string, unknown>): void;
