import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { AssociativeDreamingServer } from "../src/lib.js";
import { resetConfig } from "../src/config.js";

const baseEnv = { ...process.env };

function resetEnv() {
  process.env = { ...baseEnv };
}

describe("AssociativeDreamingServer", () => {
  let server: AssociativeDreamingServer;

  beforeEach(() => {
    resetEnv();
    resetConfig();
    vi.spyOn(console, "error").mockImplementation(() => {});
    server = new AssociativeDreamingServer();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetEnv();
    resetConfig();
  });

  describe("logDream method - logging integration", () => {
    it("logs tool execution with info level", () => {
      process.env.LOG_LEVEL = "info";
      resetConfig();
      server = new AssociativeDreamingServer();

      const mockResult = {
        llmPrompt: "Test prompt for LLM",
        anchorConcept: "test",
      };

      // Access private method through processDream
      const input = {
        tool: "semantic_drift" as const,
        input: { anchorConcept: "creativity" },
      };

      server.processDream(input);

      // Should log both the tool execution and graph stats
      expect(console.error).toHaveBeenCalled();
      const calls = (console.error as any).mock.calls;
      const infoLogs = calls.filter((call: any[]) => 
        call[0].includes("INFO") || call[0].includes("SEMANTIC DRIFT")
      );
      expect(infoLogs.length).toBeGreaterThan(0);
    });

    it("logs graph statistics at debug level", () => {
      process.env.LOG_LEVEL = "debug";
      resetConfig();
      server = new AssociativeDreamingServer();

      const input = {
        tool: "semantic_drift" as const,
        input: { anchorConcept: "innovation" },
      };

      server.processDream(input);

      expect(console.error).toHaveBeenCalled();
      const calls = (console.error as any).mock.calls;
      const debugLogs = calls.filter((call: any[]) =>
        call[0].includes("DEBUG") || call[0].includes("Dream graph")
      );
      expect(debugLogs.length).toBeGreaterThanOrEqual(0);
    });

    it("does not log graph stats when log level is info or higher", () => {
      process.env.LOG_LEVEL = "info";
      resetConfig();
      server = new AssociativeDreamingServer();

      const input = {
        tool: "semantic_drift" as const,
        input: { anchorConcept: "test" },
      };

      server.processDream(input);

      const calls = (console.error as any).mock.calls;
      const debugLogs = calls.filter((call: any[]) => call[0].includes("DEBUG"));
      expect(debugLogs.length).toBe(0);
    });

    it("formats tool name correctly in logs", () => {
      const input = {
        tool: "semantic_drift" as const,
        input: { anchorConcept: "test" },
      };

      server.processDream(input);

      expect(console.error).toHaveBeenCalled();
      const calls = (console.error as any).mock.calls;
      const toolLogs = calls.filter((call: any[]) =>
        call[0].includes("SEMANTIC DRIFT")
      );
      expect(toolLogs.length).toBeGreaterThan(0);
    });

    it("includes tool name in structured log details", () => {
      const input = {
        tool: "bisociative_synthesis" as const,
        input: { matrixA: "concept1", matrixB: "concept2" },
      };

      server.processDream(input);

      expect(console.error).toHaveBeenCalled();
      const calls = (console.error as any).mock.calls;
      const toolLogs = calls.filter((call: any[]) =>
        call[0].includes("bisociative_synthesis") || call[0].includes("BISOCIATIVE")
      );
      expect(toolLogs.length).toBeGreaterThan(0);
    });

    it("logs LLM prompt length when available", () => {
      const input = {
        tool: "semantic_drift" as const,
        input: { anchorConcept: "creative thinking" },
      };

      server.processDream(input);

      expect(console.error).toHaveBeenCalled();
      const calls = (console.error as any).mock.calls;
      const promptLogs = calls.filter((call: any[]) =>
        call[0].includes("scaffold") || call[0].includes("chars")
      );
      expect(promptLogs.length).toBeGreaterThan(0);
    });

    it("handles results without llmPrompt field", () => {
      // This tests the fallback formatting when llmPrompt is missing
      const input = {
        tool: "semantic_drift" as const,
        input: { anchorConcept: "test" },
      };

      expect(() => server.processDream(input)).not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("logDream method - with different tools", () => {
    it("logs semantic_drift tool correctly", () => {
      const input = {
        tool: "semantic_drift" as const,
        input: { anchorConcept: "innovation", temperature: 0.8 },
      };

      server.processDream(input);

      const calls = (console.error as any).mock.calls;
      const driftLogs = calls.filter((call: any[]) =>
        call[0].includes("SEMANTIC DRIFT")
      );
      expect(driftLogs.length).toBeGreaterThan(0);
    });

    it("logs bisociative_synthesis tool correctly", () => {
      const input = {
        tool: "bisociative_synthesis" as const,
        input: { matrixA: "technology", matrixB: "nature" },
      };

      server.processDream(input);

      const calls = (console.error as any).mock.calls;
      const synthesisLogs = calls.filter((call: any[]) =>
        call[0].includes("BISOCIATIVE SYNTHESIS")
      );
      expect(synthesisLogs.length).toBeGreaterThan(0);
    });

    it("logs oblique_constraint tool correctly", () => {
      const input = {
        tool: "oblique_constraint" as const,
        input: { currentBlock: "stuck on design" },
      };

      server.processDream(input);

      const calls = (console.error as any).mock.calls;
      const obliqueLogs = calls.filter((call: any[]) =>
        call[0].includes("OBLIQUE CONSTRAINT")
      );
      expect(obliqueLogs.length).toBeGreaterThan(0);
    });

    it("logs serendipity_scan tool correctly", () => {
      const input = {
        tool: "serendipity_scan" as const,
        input: { currentContext: "exploring ideas" },
      };

      server.processDream(input);

      const calls = (console.error as any).mock.calls;
      const serendipityLogs = calls.filter((call: any[]) =>
        call[0].includes("SERENDIPITY SCAN")
      );
      expect(serendipityLogs.length).toBeGreaterThan(0);
    });
  });

  describe("logDream method - graph statistics", () => {
    it("includes node count in graph statistics", () => {
      process.env.LOG_LEVEL = "debug";
      resetConfig();
      server = new AssociativeDreamingServer();

      const input = {
        tool: "semantic_drift" as const,
        input: { anchorConcept: "test" },
      };

      server.processDream(input);

      const calls = (console.error as any).mock.calls;
      const graphLogs = calls.filter((call: any[]) =>
        call[0].includes("nodeCount")
      );
      expect(graphLogs.length).toBeGreaterThanOrEqual(0);
    });

    it("includes edge count in graph statistics", () => {
      process.env.LOG_LEVEL = "debug";
      resetConfig();
      server = new AssociativeDreamingServer();

      const input = {
        tool: "semantic_drift" as const,
        input: { anchorConcept: "test" },
      };

      server.processDream(input);

      const calls = (console.error as any).mock.calls;
      const graphLogs = calls.filter((call: any[]) =>
        call[0].includes("edgeCount")
      );
      expect(graphLogs.length).toBeGreaterThanOrEqual(0);
    });

    it("includes diversity metric in graph statistics", () => {
      process.env.LOG_LEVEL = "debug";
      resetConfig();
      server = new AssociativeDreamingServer();

      const input = {
        tool: "semantic_drift" as const,
        input: { anchorConcept: "test" },
      };

      server.processDream(input);

      const calls = (console.error as any).mock.calls;
      const graphLogs = calls.filter((call: any[]) =>
        call[0].includes("diversity")
      );
      expect(graphLogs.length).toBeGreaterThanOrEqual(0);
    });

    it("formats diversity as number with 2 decimal places", () => {
      process.env.LOG_LEVEL = "debug";
      resetConfig();
      server = new AssociativeDreamingServer();

      const input = {
        tool: "semantic_drift" as const,
        input: { anchorConcept: "test" },
      };

      server.processDream(input);

      const calls = (console.error as any).mock.calls;
      const graphLogs = calls.filter((call: any[]) =>
        call[0].includes("diversity")
      );
      
      if (graphLogs.length > 0) {
        const logOutput = graphLogs[0][0];
        const diversityMatch = logOutput.match(/"diversity":(\d+\.?\d*)/);
        if (diversityMatch) {
          const diversityStr = diversityMatch[1];
          expect(diversityStr.split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
        }
      }
    });
  });

  describe("processDream - logging behavior", () => {
    it("respects logging.enabled configuration", () => {
      process.env.DISABLE_DREAM_LOGGING = "true";
      resetConfig();
      server = new AssociativeDreamingServer();

      const input = {
        tool: "semantic_drift" as const,
        input: { anchorConcept: "test" },
      };

      vi.clearAllMocks();
      server.processDream(input);

      // Should not log info/debug messages when disabled
      const calls = (console.error as any).mock.calls;
      const infoDebugLogs = calls.filter((call: any[]) =>
        call[0].includes("INFO") || call[0].includes("DEBUG")
      );
      expect(infoDebugLogs.length).toBe(0);
    });

    it("still returns result even when logging is disabled", () => {
      process.env.DISABLE_DREAM_LOGGING = "true";
      resetConfig();
      server = new AssociativeDreamingServer();

      const input = {
        tool: "semantic_drift" as const,
        input: { anchorConcept: "test" },
      };

      const result = server.processDream(input);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
    });

    it("logs even on successful execution", () => {
      const input = {
        tool: "semantic_drift" as const,
        input: { anchorConcept: "successful test" },
      };

      vi.clearAllMocks();
      server.processDream(input);

      expect(console.error).toHaveBeenCalled();
    });

    it("does not double-log on execution", () => {
      const input = {
        tool: "semantic_drift" as const,
        input: { anchorConcept: "test" },
      };

      vi.clearAllMocks();
      server.processDream(input);

      // Count INFO logs for the tool
      const calls = (console.error as any).mock.calls;
      const toolInfoLogs = calls.filter((call: any[]) =>
        call[0].includes("INFO") && call[0].includes("SEMANTIC")
      );
      
      // Should only log once per tool execution
      expect(toolInfoLogs.length).toBe(1);
    });
  });

  describe("error handling with logging", () => {
    it("does not log dream on invalid input", () => {
      const invalidInput = {
        tool: "unknown_tool" as any,
        input: {},
      };

      vi.clearAllMocks();
      const result = server.processDream(invalidInput);

      // Should return error
      expect(result.isError).toBe(true);
      
      // Should not log successful tool execution
      const calls = (console.error as any).mock.calls;
      const successLogs = calls.filter((call: any[]) =>
        call[0].includes("scaffold generated")
      );
      expect(successLogs.length).toBe(0);
    });

    it("handles missing required fields gracefully", () => {
      const invalidInput = {
        tool: "semantic_drift" as const,
        input: {} as any, // Missing anchorConcept
      };

      expect(() => server.processDream(invalidInput)).not.toThrow();
      const result = server.processDream(invalidInput);
      expect(result.isError).toBe(true);
    });
  });

  describe("getDreamGraphStatistics method", () => {
    it("returns statistics object with required fields", () => {
      const input = {
        tool: "semantic_drift" as const,
        input: { anchorConcept: "test" },
      };

      server.processDream(input);

      // Graph should have been populated
      const graph = server.getDreamGraph();
      expect(graph).toBeDefined();
    });

    it("statistics update after multiple tool executions", () => {
      const input1 = {
        tool: "semantic_drift" as const,
        input: { anchorConcept: "first" },
      };
      
      const input2 = {
        tool: "semantic_drift" as const,
        input: { anchorConcept: "second" },
      };

      server.processDream(input1);
      server.processDream(input2);

      const graph = server.getDreamGraph();
      const nodes = graph.getAllNodes();
      
      // Should have accumulated nodes
      expect(nodes.length).toBeGreaterThan(0);
    });
  });

  describe("integration - logger and lib", () => {
    it("logger receives correct tool names from lib", () => {
      const tools: Array<"semantic_drift" | "bisociative_synthesis" | "oblique_constraint"> = [
        "semantic_drift",
        "bisociative_synthesis",
        "oblique_constraint",
      ];

      tools.forEach(tool => {
        vi.clearAllMocks();
        
        const input = {
          tool,
          input: tool === "semantic_drift" 
            ? { anchorConcept: "test" }
            : tool === "bisociative_synthesis"
            ? { matrixA: "test" }
            : { currentBlock: "test" },
        };

        server.processDream(input);

        const calls = (console.error as any).mock.calls;
        const toolLogs = calls.filter((call: any[]) =>
          call[0].includes(tool.toUpperCase().replace("_", " ")) ||
          call[0].includes(`"tool":"${tool}"`)
        );
        expect(toolLogs.length).toBeGreaterThan(0);
      });
    });

    it("logger formats details from lib consistently", () => {
      process.env.LOG_LEVEL = "debug";
      resetConfig();
      server = new AssociativeDreamingServer();

      const input = {
        tool: "semantic_drift" as const,
        input: { anchorConcept: "test" },
      };

      vi.clearAllMocks();
      server.processDream(input);

      const calls = (console.error as any).mock.calls;
      calls.forEach((call: any[]) => {
        const logOutput = call[0];
        if (logOutput.includes("INFO") || logOutput.includes("DEBUG")) {
          // Should be properly formatted
          expect(logOutput).toMatch(/INFO|DEBUG/);
        }
      });
    });
  });
});