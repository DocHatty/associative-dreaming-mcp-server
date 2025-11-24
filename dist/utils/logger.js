import chalk from "chalk";
import { getConfig } from "../config.js";
import { isDreamError } from "./errors.js";
const levelPriority = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};
function shouldLog(level) {
    const config = getConfig();
    if (!config.logging.enabled) {
        return level === "error"; // Always surface errors even when logging is disabled
    }
    return levelPriority[level] >= levelPriority[config.logging.level];
}
function formatLevel(level, colorized) {
    if (!colorized)
        return level.toUpperCase();
    switch (level) {
        case "debug":
            return chalk.gray("DEBUG");
        case "info":
            return chalk.blue("INFO");
        case "warn":
            return chalk.yellow("WARN");
        case "error":
            return chalk.red("ERROR");
    }
}
export function log(level, message, details) {
    if (!shouldLog(level))
        return;
    const config = getConfig();
    const timestamp = config.logging.includeTimestamp
        ? `[${new Date().toISOString()}] `
        : "";
    const levelLabel = formatLevel(level, config.logging.colorized);
    const detailsText = details && Object.keys(details).length > 0
        ? ` ${JSON.stringify(details)}`
        : "";
    console.error(`${timestamp}${levelLabel}: ${message}${detailsText}`);
}
export function logError(error, context = {}) {
    if (isDreamError(error)) {
        log("error", error.message, { code: error.code, ...error.context, ...context });
        return;
    }
    if (error instanceof Error) {
        log("error", error.message, { stack: error.stack, ...context });
        return;
    }
    log("error", "Unknown error", { error, ...context });
}
