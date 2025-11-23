import { describe, it, beforeEach, afterEach, expect } from "vitest";
import { loadConfig, resetConfig, getDefaultConfig } from "../src/config.js";

const baseEnv = { ...process.env };

describe("config loading", () => {
  beforeEach(() => {
    process.env = { ...baseEnv };
    resetConfig();
  });

  afterEach(() => {
    process.env = { ...baseEnv };
    resetConfig();
  });

  it("returns default values when no overrides are provided", () => {
    const defaults = getDefaultConfig();
    const config = loadConfig();

    expect(config.semanticDrift.defaultTemperature).toBe(
      defaults.semanticDrift.defaultTemperature,
    );
    expect(config.logging.enabled).toBe(defaults.logging.enabled);
  });

  it("applies environment overrides for semantic drift", () => {
    process.env.DRIFT_TEMPERATURE = "0.9";
    process.env.DRIFT_MAX_ITERATIONS = "5";

    const config = loadConfig();

    expect(config.semanticDrift.defaultTemperature).toBe(0.9);
    expect(config.semanticDrift.maxDriftIterations).toBe(5);
  });

  it("respects DISABLE_DREAM_LOGGING flag", () => {
    process.env.DISABLE_DREAM_LOGGING = "true";

    const config = loadConfig();

    expect(config.logging.enabled).toBe(false);
  });
});
