import chalk from "chalk";
import { getConfig } from "../config.js";
import { isDreamError } from "./errors.js";

export type LogLevel = "debug" | "info" | "warn" | "error";

const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Determines whether a message at the given log level should be emitted based on current configuration.
 *
 * When global logging is disabled, only `"error"` level messages are permitted; otherwise the decision
 * is made by comparing the requested level's priority against the configured minimum logging level.
 *
 * @param level - The log level to check
 * @returns `true` if messages at `level` should be logged under the current configuration, `false` otherwise
 */
function shouldLog(level: LogLevel): boolean {
  const config = getConfig();

  if (!config.logging.enabled) {
    return level === "error"; // Always surface errors even when logging is disabled
  }

  return levelPriority[level] >= levelPriority[config.logging.level];
}

/**
 * Format a log level label, optionally applying ANSI color styling.
 *
 * @param colorized - If true, return the label wrapped with color formatting; otherwise return plain uppercase text.
 * @returns The uppercase label for `level`. When `colorized` is true, the label includes ANSI color styling. 
 */
function formatLevel(level: LogLevel, colorized: boolean): string {
  if (!colorized) return level.toUpperCase();

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

/**
 * Emits a formatted log message to stderr.
 *
 * Respects runtime logging configuration for enabled levels, minimum level threshold, timestamp inclusion, and colorization. When `details` is provided and non-empty, its JSON representation is appended to the log line.
 *
 * @param level - The severity level of the log entry.
 * @param message - The primary log message text.
 * @param details - Optional metadata to include with the log; serialized to JSON when non-empty.
 */
export function log(
  level: LogLevel,
  message: string,
  details?: Record<string, unknown>,
): void {
  if (!shouldLog(level)) return;

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

/**
 * Normalize various error shapes and emit a structured "error" log.
 *
 * If `error` is a DreamError, logs its message with `code` and the error's own context merged with `context`.
 * If `error` is a native `Error`, logs its message with the `stack` and `context`.
 * Otherwise logs "Unknown error" with the raw `error` value and `context`.
 *
 * @param error - The error to normalize and log
 * @param context - Additional contextual key/value pairs to include with the logged error
 */
export function logError(
  error: unknown,
  context: Record<string, unknown> = {},
): void {
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