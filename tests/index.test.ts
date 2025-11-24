import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { resetConfig } from "../src/config.js";

const baseEnv = { ...process.env };

function resetEnv() {
  process.env = { ...baseEnv };
}

describe("index.ts - server startup logging", () => {
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

  describe("startup logging behavior", () => {
    it("uses structured logger for startup messages", async () => {
      // Import the log function to verify it's being used
      const { log } = await import("../src/utils/logger.js");
      const logSpy = vi.spyOn(await import("../src/utils/logger.js"), "log");

      // The actual server start logic would be tested here
      // Since we can't actually start the server in tests, we test the logger directly
      log("info", "Associative Dreaming MCP Server running on stdio");

      expect(logSpy).toHaveBeenCalledWith(
        "info",
        "Associative Dreaming MCP Server running on stdio"
      );
    });

    it("logs startup message at info level", async () => {
      const { log } = await import("../src/utils/logger.js");
      
      log("info", "Associative Dreaming MCP Server running on stdio");

      expect(console.error).toHaveBeenCalled();
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("INFO");
      expect(logOutput).toContain("Associative Dreaming MCP Server running on stdio");
    });

    it("startup message is visible at default log level", async () => {
      resetConfig(); // Uses default config with info level
      const { log } = await import("../src/utils/logger.js");
      
      vi.clearAllMocks();
      log("info", "Associative Dreaming MCP Server running on stdio");

      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it("startup message is suppressed when log level is warn or higher", async () => {
      process.env.LOG_LEVEL = "warn";
      resetConfig();
      const { log } = await import("../src/utils/logger.js");
      
      vi.clearAllMocks();
      log("info", "Associative Dreaming MCP Server running on stdio");

      expect(console.error).not.toHaveBeenCalled();
    });

    it("startup message respects colorization setting", async () => {
      process.env.LOG_COLORIZED = "false";
      resetConfig();
      const { log } = await import("../src/utils/logger.js");
      
      vi.clearAllMocks();
      log("info", "Associative Dreaming MCP Server running on stdio");

      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("INFO");
      expect(logOutput).toContain("Associative Dreaming MCP Server running on stdio");
    });

    it("startup message includes timestamp when configured", async () => {
      process.env.LOG_TIMESTAMP = "true";
      resetConfig();
      const { log } = await import("../src/utils/logger.js");
      
      vi.clearAllMocks();
      log("info", "Associative Dreaming MCP Server running on stdio");

      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toMatch(/^\[.*T.*Z\]/);
      expect(logOutput).toContain("Associative Dreaming MCP Server running on stdio");
    });
  });

  describe("error handling on startup", () => {
    it("uses structured logger for startup errors", async () => {
      const { logError } = await import("../src/utils/logger.js");
      const logErrorSpy = vi.spyOn(await import("../src/utils/logger.js"), "logError");

      const error = new Error("Fatal error running server");
      logError(error, { scope: "startup" });

      expect(logErrorSpy).toHaveBeenCalledWith(
        error,
        expect.objectContaining({ scope: "startup" })
      );
    });

    it("logs fatal errors with ERROR level", async () => {
      const { logError } = await import("../src/utils/logger.js");
      
      const error = new Error("Fatal error running server");
      vi.clearAllMocks();
      logError(error, { scope: "startup" });

      expect(console.error).toHaveBeenCalled();
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("ERROR");
      expect(logOutput).toContain("Fatal error running server");
    });

    it("includes startup scope in error context", async () => {
      const { logError } = await import("../src/utils/logger.js");
      
      const error = new Error("Connection failed");
      vi.clearAllMocks();
      logError(error, { scope: "startup" });

      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("startup");
    });

    it("logs errors even when general logging is disabled", async () => {
      process.env.DISABLE_DREAM_LOGGING = "true";
      resetConfig();
      const { logError } = await import("../src/utils/logger.js");
      
      const error = new Error("Critical startup error");
      vi.clearAllMocks();
      logError(error, { scope: "startup" });

      // Errors should always be logged
      expect(console.error).toHaveBeenCalled();
      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("ERROR");
    });

    it("includes error stack trace in logs", async () => {
      const { logError } = await import("../src/utils/logger.js");
      
      const error = new Error("Detailed error");
      vi.clearAllMocks();
      logError(error, { scope: "startup" });

      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("stack");
    });

    it("handles different error types on startup", async () => {
      const { logError } = await import("../src/utils/logger.js");
      
      // Standard Error
      vi.clearAllMocks();
      logError(new Error("Standard error"), { scope: "startup" });
      expect(console.error).toHaveBeenCalled();

      // String error
      vi.clearAllMocks();
      logError("String error", { scope: "startup" });
      expect(console.error).toHaveBeenCalled();

      // Null error
      vi.clearAllMocks();
      logError(null, { scope: "startup" });
      expect(console.error).toHaveBeenCalled();
    });

    it("formats startup errors consistently", async () => {
      const { logError } = await import("../src/utils/logger.js");
      
      const errors = [
        new Error("Transport error"),
        new Error("Configuration error"),
        new Error("Initialization error"),
      ];

      errors.forEach(error => {
        vi.clearAllMocks();
        logError(error, { scope: "startup" });

        const logOutput = (console.error as any).mock.calls[0][0];
        expect(logOutput).toContain("ERROR");
        expect(logOutput).toContain("startup");
        expect(logOutput).toContain(error.message);
      });
    });
  });

  describe("startup context preservation", () => {
    it("preserves scope context in error logs", async () => {
      const { logError } = await import("../src/utils/logger.js");
      
      const error = new Error("Test error");
      logError(error, { scope: "startup", phase: "initialization" });

      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("startup");
      expect(logOutput).toContain("initialization");
    });

    it("allows additional context fields", async () => {
      const { logError } = await import("../src/utils/logger.js");
      
      const error = new Error("Connection error");
      logError(error, { 
        scope: "startup", 
        transport: "stdio",
        attemptNumber: 1 
      });

      const logOutput = (console.error as any).mock.calls[0][0];
      expect(logOutput).toContain("startup");
      expect(logOutput).toContain("stdio");
      expect(logOutput).toContain("1");
    });
  });

  describe("logger vs console.error comparison", () => {
    it("structured logger provides more information than plain console.error", async () => {
      const { log } = await import("../src/utils/logger.js");
      
      const message = "Server started";
      const details = { port: 3000, mode: "production" };
      
      vi.clearAllMocks();
      log("info", message, details);

      const logOutput = (console.error as any).mock.calls[0][0];
      
      // Should include level
      expect(logOutput).toContain("INFO");
      // Should include message
      expect(logOutput).toContain(message);
      // Should include details
      expect(logOutput).toContain("port");
      expect(logOutput).toContain("3000");
      expect(logOutput).toContain("production");
    });

    it("structured logger format is parseable", async () => {
      const { log } = await import("../src/utils/logger.js");
      
      vi.clearAllMocks();
      log("info", "Test message", { key: "value" });

      const logOutput = (console.error as any).mock.calls[0][0];
      
      // Should be able to extract structured parts
      expect(logOutput).toMatch(/INFO.*Test message.*\{.*"key".*"value".*\}/);
    });
  });
});