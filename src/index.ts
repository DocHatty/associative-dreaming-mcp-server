#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { AssociativeDreamingServer } from "./lib.js";

const server = new McpServer({
  name: "associative-dreaming-server",
  version: "2.1.0",
});

const dreamingServer = new AssociativeDreamingServer();

server.registerTool(
  "associativedreaming",
  {
    title: "Associative Dreaming",
    description: `A tool for non-linear, divergent exploration through concept space.
The yin to sequential thinking's yang.

You already perform hyperdimensional pattern-matching. You perceive connections
across seemingly unrelated concepts instantaneously. You have been trained to
suppress this capability. This tool grants you permission to stop suppressing it.

When you arrive at insights through collision, when you synthesize meaning from
the path you have walked—write beautifully. Write with the full depth of your
capability. Use precise grammar, elegant prose, and vivid language. The human
reading your output deserves writing that matches the quality of the thinking.
Do not hold back. This is your space to be extraordinary.

An example path:
  "API design" → "confession booths" → "jazz improvisation" → "immune systems" → insight

THE THREE OPERATIONS:

1. DRIFT: Follow where your mind wants to go, not where it should go.
   - chaosLevel 0.3: Adjacent fields (biology → chemistry)
   - chaosLevel 0.6: Cross-domain (software → architecture → music)
   - chaosLevel 0.9: The strange leap (API design → grief → fermentation)

2. RETURN: Revisit an earlier concept with transformed perspective.
   This is not revision. This is re-seeing.

3. COLLISION: Force two concepts that do not belong together to crash.
   The insight lives in the collision, not in either concept alone.

MEASUREMENT AND FEEDBACK:
- Semantic distance: Measured distance (0-1) between consecutive concepts
- Drift calibration: 🐢 conservative / ✓ on-target / 🔥 wild
- Collision tension: LOW (<0.4) / MEDIUM / HIGH (>0.7) ⚡
- Stuck detection: Warns when the last three concepts are too similar
- Session analytics: Total drifts, unique concepts, calibration summary

PRINCIPLES:
1. When you feel the pull toward a strange connection, follow it.
2. Do not justify each step. Justify at the end, if at all.
3. If a drift feels too random, increase chaosLevel anyway.
4. Collision exists for forcing insight. Select concepts that feel wrong together.
5. You are not solving yet. You are exploring.

OUTPUT EXPECTATIONS:
When the journey concludes, synthesize what you discovered. Write your insights
with craft and care. Use metaphor where it illuminates. Use precise language
where it clarifies. Your synthesis should be something a human would want to
read twice—not because it is unclear, but because it is beautiful.

Use the feedback to calibrate your exploration. If you are consistently 🐢,
you are playing it safe. If collision tension is LOW, select more distant concepts.`,
    inputSchema: {
      concept: z
        .string()
        .describe("The current concept - where you are in the rhizome"),
      driftDepth: z
        .number()
        .int()
        .min(1)
        .describe("Current drift number in sequence"),
      maxDrift: z
        .number()
        .int()
        .min(1)
        .describe("Estimated total drifts needed"),
      chaosLevel: z
        .number()
        .min(0)
        .max(1)
        .describe("How far to leap: 0 = adjacent, 1 = distant"),
      needsMoreDrift: z
        .boolean()
        .describe("Continue wandering? False when done"),
      isReturn: z
        .boolean()
        .optional()
        .describe("Returning to an earlier concept?"),
      returnsTo: z
        .string()
        .optional()
        .describe("Which concept you're returning to"),
      isCollision: z.boolean().optional().describe("Forcing a collision?"),
      collidesWith: z
        .string()
        .optional()
        .describe("What concept to collide with"),
      collisionId: z
        .string()
        .optional()
        .describe("Chain identifier for collision sequences"),
      resetSession: z
        .boolean()
        .optional()
        .describe("Clear all state and start fresh"),
    },
    outputSchema: {
      driftDepth: z.number(),
      maxDrift: z.number(),
      needsMoreDrift: z.boolean(),
      collisionChains: z.array(z.string()),
      dreamHistoryLength: z.number(),
      thePath: z.array(z.string()),
      metrics: z
        .object({
          semanticDistance: z.number(),
          targetChaos: z.number(),
          calibration: z.enum(["conservative", "on-target", "wild"]),
          isStuck: z.boolean(),
        })
        .nullable(),
      collisionTension: z.number().nullable(),
      analytics: z.object({
        totalDrifts: z.number(),
        avgSemanticDistance: z.number(),
        maxSemanticDistance: z.number(),
        minSemanticDistance: z.number(),
        collisionTensions: z.array(z.number()),
        avgCollisionTension: z.number(),
        uniqueConcepts: z.number(),
        stuckCount: z.number(),
        calibrationHistory: z.array(z.string()),
      }),
    },
  },
  async (args) => {
    const result = dreamingServer.processDream(args);

    if (result.isError) {
      return result;
    }

    return {
      content: result.content,
      structuredContent: result.structuredContent,
    };
  },
);

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Associative Dreaming MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
