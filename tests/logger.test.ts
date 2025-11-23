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
});
