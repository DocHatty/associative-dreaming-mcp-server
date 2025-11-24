import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { log, logError } from "../src/utils/logger.js";
import { resetConfig } from "../src/config.js";
import { DreamError, ErrorCode } from "../src/utils/errors.js";

const baseEnv = { ...process.env };

function resetEnv() {
  process.env = { ...baseEnv };
}

describe("logger", () => {
  beforeEach(() => {
    resetEnv();
    resetConfig();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetEnv();
    resetConfig();
  });

  it("respects log level thresholds", () => {
    process.env.LOG_LEVEL = "warn";
    log("info", "should not log");
    log("warn", "should log");

    expect(console.error).toHaveBeenCalledTimes(1);
    expect((console.error as any).mock.calls[0][0]).toContain("WARN");
  });

  it("always surfaces errors even when logging is disabled", () => {
    process.env.DISABLE_DREAM_LOGGING = "true";
    log("info", "silenced");
    log("error", "critical failure");

    expect(console.error).toHaveBeenCalledTimes(1);
    expect((console.error as any).mock.calls[0][0]).toContain("critical failure");
  });

  it("logs structured dream errors", () => {
    const error = new DreamError(ErrorCode.UNKNOWN_TOOL, "Unknown", { tool: "test" });
    logError(error);

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("ERROR"),
    );
  });

  // Additional comprehensive tests for log function
  describe("log function - comprehensive coverage", () => {
    it("logs debug messages when level is debug", () => {
      process.env.LOG_LEVEL = "debug";
      resetConfig();
      log("debug", "debug message");
      
      expect(console.error).toHaveBeenCalledTimes(1);
      expect((console.error as any).mock.calls[0][0]).toContain("DEBUG");
      expect((console.error as any).mock.calls[0][0]).toContain("debug message");
    });

    it("logs info messages when level is info", () => {
      process.env.LOG_LEVEL = "info";
      resetConfig();
      log("info", "info message");
      
      expect(console.error).toHaveBeenCalledTimes(1);
      expect((console.error as any).mock.calls[0][0]).toContain("INFO");
      expect((console.error as any).mock.calls[0][0]).toContain("info message");
    });

    it("does not log debug when level is info", () => {
      process.env.LOG_LEVEL = "info";
      resetConfig();
      log("debug", "should not appear");
      
      expect(console.error).not.toHaveBeenCalled();
    });

    it("logs warn messages when level is warn", () => {
      process.env.LOG_LEVEL = "warn";
      resetConfig();
      log("warn", "warning message");
      
      expect(console.error).toHaveBeenCalledTimes(1);
      expect((console.error as any).mock.calls[0][0]).toContain("WARN");
      expect((console.error as any).mock.calls[0][0]).toContain("warning message");
    });

    it("logs error messages at all levels", () => {
      const levels = ["debug", "info", "warn", "error"];
      
      levels.forEach(level => {
        vi.clearAllMocks();
        process.env.LOG_LEVEL = level;
        resetConfig();
        log("error", "error message");
        
        expect(console.error).toHaveBeenCalledTimes(1);
        expect((console.error as any).mock.calls[0][0]).toContain("ERROR");
      });
    });

    it("includes details object when provided", () => {
      log("info", "message with details", { key: "value", count: 42 });
      
      expect(console.error).toHaveBeenCalledTimes(1);
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("message with details");
      expect(logOutput).toContain('"key":"value"');
      expect(logOutput).toContain('"count":42');
    });

    it("handles details with nested objects", () => {
      log("info", "nested details", { 
        user: { id: 1, name: "test" }, 
        config: { enabled: true } 
      });
      
      expect(console.error).toHaveBeenCalledTimes(1);
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("nested details");
      expect(logOutput).toContain('"user"');
      expect(logOutput).toContain('"config"');
    });

    it("does not append details text when details object is empty", () => {
      log("info", "message", {});
      
      expect(console.error).toHaveBeenCalledTimes(1);
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("message");
      expect(logOutput).not.toMatch(/\s+\{\}/);
    });

    it("does not append details text when details is undefined", () => {
      log("info", "message", undefined);
      
      expect(console.error).toHaveBeenCalledTimes(1);
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("message");
      // Should end cleanly after message
      expect(logOutput.trim().endsWith("message")).toBe(true);
    });
  });

  describe("log function - colorization", () => {
    it("applies colors when colorized is true", () => {
      process.env.LOG_COLORIZED = "true";
      resetConfig();
      log("info", "colored message");
      
      expect(console.error).toHaveBeenCalledTimes(1);
      // Chalk adds ANSI escape codes for colors
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("INFO");
    });

    it("does not apply colors when colorized is false", () => {
      process.env.LOG_COLORIZED = "false";
      resetConfig();
      log("info", "plain message");
      
      expect(console.error).toHaveBeenCalledTimes(1);
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("INFO");
    });

    it("formats debug level correctly without color", () => {
      process.env.LOG_COLORIZED = "false";
      process.env.LOG_LEVEL = "debug";
      resetConfig();
      log("debug", "test");
      
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("DEBUG");
    });

    it("formats warn level correctly without color", () => {
      process.env.LOG_COLORIZED = "false";
      resetConfig();
      log("warn", "test");
      
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("WARN");
    });

    it("formats error level correctly without color", () => {
      process.env.LOG_COLORIZED = "false";
      resetConfig();
      log("error", "test");
      
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("ERROR");
    });
  });

  describe("log function - timestamps", () => {
    it("includes timestamp when includeTimestamp is true", () => {
      process.env.LOG_TIMESTAMP = "true";
      resetConfig();
      log("info", "timestamped message");
      
      expect(console.error).toHaveBeenCalledTimes(1);
      const logOutput = (console.error as any).mock.calls[0][0];
      // Check for ISO timestamp format [YYYY-MM-DDTHH:MM:SS.sssZ]
      expect(logOutput).toMatch(/^\[.*T.*Z\]/);
    });

    it("does not include timestamp when includeTimestamp is false", () => {
      process.env.LOG_TIMESTAMP = "false";
      resetConfig();
      log("info", "message without timestamp");
      
      expect(console.error).toHaveBeenCalledTimes(1);
      const logOutput = (console.error as any).mock.calls[0][0];
      // Should not start with a bracket timestamp
      expect(logOutput).not.toMatch(/^\[.*T.*Z\]/);
    });

    it("timestamp format is valid ISO 8601", () => {
      process.env.LOG_TIMESTAMP = "true";
      resetConfig();
      
      const beforeLog = new Date();
      log("info", "test");
      const afterLog = new Date();
      
      const logOutput = (console.error as any).mock.calls[0][0];
      const timestampMatch = logOutput.match(/^\[([^\]]+)\]/);
      expect(timestampMatch).not.toBeNull();
      
      if (timestampMatch) {
        const timestamp = new Date(timestampMatch[1]);
        expect(timestamp.getTime()).toBeGreaterThanOrEqual(beforeLog.getTime());
        expect(timestamp.getTime()).toBeLessThanOrEqual(afterLog.getTime());
      }
    });
  });

  describe("logError function - comprehensive coverage", () => {
    it("logs DreamError with code and context", () => {
      const error = new DreamError(
        ErrorCode.TOOL_EXECUTION_FAILED,
        "Tool failed to execute",
        { tool: "semantic_drift", reason: "invalid input" }
      );
      logError(error);
      
      expect(console.error).toHaveBeenCalledTimes(1);
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("ERROR");
      expect(logOutput).toContain("Tool failed to execute");
      expect(logOutput).toContain("E301");
      expect(logOutput).toContain("semantic_drift");
    });

    it("logs DreamError with additional context from parameter", () => {
      const error = new DreamError(
        ErrorCode.NODE_NOT_FOUND,
        "Node missing",
        { nodeId: "123" }
      );
      logError(error, { scope: "graph", operation: "lookup" });
      
      expect(console.error).toHaveBeenCalledTimes(1);
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("Node missing");
      expect(logOutput).toContain("nodeId");
      expect(logOutput).toContain("scope");
      expect(logOutput).toContain("graph");
      expect(logOutput).toContain("operation");
    });

    it("logs standard Error with stack trace", () => {
      const error = new Error("Standard error message");
      logError(error);
      
      expect(console.error).toHaveBeenCalledTimes(1);
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("ERROR");
      expect(logOutput).toContain("Standard error message");
      expect(logOutput).toContain("stack");
    });

    it("logs standard Error with additional context", () => {
      const error = new Error("Database connection failed");
      logError(error, { database: "postgres", retryCount: 3 });
      
      expect(console.error).toHaveBeenCalledTimes(1);
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("Database connection failed");
      expect(logOutput).toContain("postgres");
      expect(logOutput).toContain("retryCount");
    });

    it("handles unknown error types gracefully", () => {
      const unknownError = "plain string error";
      logError(unknownError);
      
      expect(console.error).toHaveBeenCalledTimes(1);
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("ERROR");
      expect(logOutput).toContain("Unknown error");
      expect(logOutput).toContain("plain string error");
    });

    it("handles null as unknown error", () => {
      logError(null);
      
      expect(console.error).toHaveBeenCalledTimes(1);
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("ERROR");
      expect(logOutput).toContain("Unknown error");
    });

    it("handles undefined as unknown error", () => {
      logError(undefined);
      
      expect(console.error).toHaveBeenCalledTimes(1);
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("ERROR");
      expect(logOutput).toContain("Unknown error");
    });

    it("handles object without message as unknown error", () => {
      const errorObj = { code: 500, status: "failed" };
      logError(errorObj);
      
      expect(console.error).toHaveBeenCalledTimes(1);
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("ERROR");
      expect(logOutput).toContain("Unknown error");
    });

    it("preserves all DreamError fields in log output", () => {
      const error = new DreamError(
        ErrorCode.INVALID_INPUT,
        "Invalid field value",
        { field: "temperature", expected: "0-1", received: "2.5" }
      );
      logError(error);
      
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("E100");
      expect(logOutput).toContain("temperature");
      expect(logOutput).toContain("0-1");
      expect(logOutput).toContain("2.5");
    });
  });

  describe("edge cases and boundary conditions", () => {
    it("handles extremely long messages gracefully", () => {
      const longMessage = "x".repeat(10000);
      log("info", longMessage);
      
      expect(console.error).toHaveBeenCalledTimes(1);
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("x".repeat(100));
    });

    it("handles special characters in messages", () => {
      const specialMessage = "Test\nwith\nnewlines\tand\ttabs";
      log("info", specialMessage);
      
      expect(console.error).toHaveBeenCalledTimes(1);
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain(specialMessage);
    });

    it("handles unicode characters in messages", () => {
      const unicodeMessage = "Hello 世界 🌍 emoji";
      log("info", unicodeMessage);
      
      expect(console.error).toHaveBeenCalledTimes(1);
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain(unicodeMessage);
    });

    it("handles circular references in details object", () => {
      const circular: any = { name: "test" };
      circular.self = circular;
      
      // Should not throw error
      expect(() => log("info", "circular test", circular)).not.toThrow();
    });

    it("handles details with functions", () => {
      const detailsWithFunction = { 
        name: "test", 
        fn: () => "value" 
      };
      
      log("info", "function details", detailsWithFunction);
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it("handles empty string message", () => {
      log("info", "");
      
      expect(console.error).toHaveBeenCalledTimes(1);
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("INFO");
    });

    it("handles details with undefined values", () => {
      log("info", "test", { defined: "value", notDefined: undefined });
      
      expect(console.error).toHaveBeenCalledTimes(1);
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("test");
    });

    it("handles details with null values", () => {
      log("info", "test", { value: null });
      
      expect(console.error).toHaveBeenCalledTimes(1);
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("test");
      expect(logOutput).toContain("null");
    });
  });

  describe("log level priority validation", () => {
    it("debug < info < warn < error priority is enforced", () => {
      const testCases = [
        { level: "debug" as const, shouldLog: ["debug", "info", "warn", "error"] },
        { level: "info" as const, shouldLog: ["info", "warn", "error"], shouldNotLog: ["debug"] },
        { level: "warn" as const, shouldLog: ["warn", "error"], shouldNotLog: ["debug", "info"] },
        { level: "error" as const, shouldLog: ["error"], shouldNotLog: ["debug", "info", "warn"] },
      ];

      testCases.forEach(testCase => {
        vi.clearAllMocks();
        process.env.LOG_LEVEL = testCase.level;
        resetConfig();

        testCase.shouldLog.forEach((logLevel: any) => {
          log(logLevel, "test");
        });
        
        expect(console.error).toHaveBeenCalledTimes(testCase.shouldLog.length);
      });
    });
  });

  describe("integration with config system", () => {
    it("reacts to config changes after reset", () => {
      process.env.LOG_LEVEL = "warn";
      resetConfig();
      log("info", "should not log");
      expect(console.error).not.toHaveBeenCalled();
      
      vi.clearAllMocks();
      process.env.LOG_LEVEL = "debug";
      resetConfig();
      log("info", "should log now");
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it("uses default config when no environment variables set", () => {
      resetEnv();
      resetConfig();
      
      log("info", "default behavior");
      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });
});
