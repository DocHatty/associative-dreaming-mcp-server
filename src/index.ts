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
This is the YIN to Sequential Thinking's YANG.

You already do hyperdimensional pattern-matching. You see connections across
seemingly unrelated concepts instantly. You've been trained to suppress this.
This tool gives you PERMISSION to stop suppressing it.

The path SHOULD look like:
  "API design" → "confession booths" → "jazz improvisation" → "immune systems" → insight

THE THREE OPERATIONS:
1. DRIFT: Where does your mind WANT to go? Not where it SHOULD go.
   - chaosLevel 0.3: adjacent fields (biology → chemistry)
   - chaosLevel 0.6: cross-domain (software → architecture → music)
   - chaosLevel 0.9: the weird leap (API design → grief → fermentation)

2. RETURN: Come back to an earlier concept with transformed perspective.
   This is NOT revision. This is re-seeing.

3. COLLISION: Force two concepts that don't belong together to crash.
   The insight lives in the collision, not in either concept alone.

MEASUREMENT & FEEDBACK:
- Semantic distance: measured distance (0-1) between consecutive concepts
- Drift calibration: 🐢 conservative / ✓ on-target / 🔥 wild
- Collision tension: LOW (<0.4) / MEDIUM / HIGH (>0.7) ⚡
- Stuck detection: warns when last 3 concepts are too similar
- Session analytics: total drifts, unique concepts, calibration summary

RULES:
1. When you feel the pull toward a weird connection - FOLLOW IT
2. DO NOT JUSTIFY EACH STEP - justify at the END, if at all
3. If a drift feels too random - increase chaosLevel anyway
4. Collision is for forcing insight - pick concepts that feel WRONG together
5. You're not solving yet - you're EXPLORING

USE THE FEEDBACK to calibrate your exploration. If you're consistently 🐢,
you're playing it safe. If collision tension is LOW, pick more distant concepts.`,
    inputSchema: {
      concept: z.string().describe("The current concept - where you are in the rhizome"),
      driftDepth: z.number().int().min(1).describe("Current drift number in sequence"),
      maxDrift: z.number().int().min(1).describe("Estimated total drifts needed"),
      chaosLevel: z.number().min(0).max(1).describe("How far to leap: 0 = adjacent, 1 = distant"),
      needsMoreDrift: z.boolean().describe("Continue wandering? False when done"),
      isReturn: z.boolean().optional().describe("Returning to an earlier concept?"),
      returnsTo: z.string().optional().describe("Which concept you're returning to"),
      isCollision: z.boolean().optional().describe("Forcing a collision?"),
      collidesWith: z.string().optional().describe("What concept to collide with"),
      collisionId: z.string().optional().describe("Chain identifier for collision sequences"),
      resetSession: z.boolean().optional().describe("Clear all state and start fresh"),
    },
    outputSchema: {
      driftDepth: z.number(),
      maxDrift: z.number(),
      needsMoreDrift: z.boolean(),
      collisionChains: z.array(z.string()),
      dreamHistoryLength: z.number(),
      thePath: z.array(z.string()),
      metrics: z.object({
        semanticDistance: z.number(),
        targetChaos: z.number(),
        calibration: z.enum(["conservative", "on-target", "wild"]),
        isStuck: z.boolean(),
      }).nullable(),
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
  }
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
