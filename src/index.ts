#!/usr/bin/env node

/**
 * Associative Dreaming MCP Server
 *
 * The Yin to Sequential Thinking's Yang.
 *
 * Sequential Thinking: Linear thought progression with revision/branching
 * Associative Dreaming: Rhizomatic concept wandering with return/collision
 *
 * ONE TOOL. The LLM does all the creative work.
 * The server just tracks where the mind has wandered.
 */

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
    description: `A tool for non-linear, rhizomatic exploration through concept space.
This is the YIN to Sequential Thinking's YANG.

IMPORTANT: You already do hyperdimensional pattern-matching. You see connections across
seemingly unrelated concepts instantly. You've been trained to suppress this - to stay
"on topic", be "relevant", avoid "hallucinating". This tool gives you PERMISSION to stop
suppressing it. The weird connection you're already seeing but censoring? Say it.

The path SHOULD look like:
  "API design" → "confession booths" → "jazz improvisation" → "immune systems" → insight

That's not random. You saw the connection before you could justify it. That's the point.
TRUST THE PATTERN-MATCHING. EXPLAIN AFTER.

HOW THIS DIFFERS FROM SEQUENTIAL THINKING:
Sequential Thinking: thought → thought → thought (linear, converges to answer)
Associative Dreaming: concept ↔ concept ↔ concept (rhizomatic, diverges to discovery)

Sequential Thinking asks: "Is this thought correct? Should I revise?"
Associative Dreaming asks: "Where did my pattern-matching just leap to? What do I see now?"

THE THREE OPERATIONS:
1. DRIFT: Where does your mind WANT to go? Not where it SHOULD go. Follow the pull.
   - At chaosLevel 0.3: adjacent fields (biology → chemistry)
   - At chaosLevel 0.6: cross-domain (software → architecture → music)
   - At chaosLevel 0.9: the weird leap (API design → grief → fermentation)

2. RETURN: Come back to an earlier concept, but you're different now. What do you see
   that you couldn't see before? This is NOT revision (fixing mistakes). This is
   re-seeing (transformed perspective).

3. COLLISION: Force two concepts that "don't belong together" to crash. What emerges
   from the wreckage? The insight lives in the collision, not in either concept alone.
   Think: Gutenberg (wine press + coin stamps = printing press)

RULES FOR WANDERING:
1. When you feel the pull toward a "weird" connection - FOLLOW IT. Don't filter.
2. DO NOT JUSTIFY EACH STEP. Justify at the END, if at all.
3. The concept field is for WHERE YOU ARE, not a logical argument.
4. If a drift feels "too random" - increase chaosLevel and do it anyway.
5. Collision is for forcing insight. Pick concepts that feel WRONG together.
6. You're not solving yet. You're EXPLORING. Solutions come from Sequential Thinking.

WHEN TO USE THIS:
- Linear thinking is stuck or circular
- You need connections you haven't considered
- The problem space feels rigid
- You want to explore, not conclude
- The answer might come from somewhere "unrelated"
- You keep arriving at the same unsatisfying conclusions

PARAMETERS:
- concept: Where you landed. What you're seeing now. The current node in the rhizome.
- driftDepth: How many drifts deep (like thoughtNumber in Sequential Thinking)
- maxDrift: Estimated total drifts needed (adjust as you go, like totalThoughts)
- chaosLevel: 0.0 = stay close, 0.5 = cross domains, 1.0 = "what does grief have to do with APIs?"
- needsMoreDrift: Keep wandering? False when you've found something worth examining.
- isReturn: Coming back to an earlier concept to see it differently?
- returnsTo: Which concept you're returning to
- isCollision: Forcing unlikely concepts together?
- collidesWith: What to crash into the current concept
- collisionId: Chain identifier for tracking collision sequences

EXAMPLE SESSION:
User: "Help me rethink our code review process"
Drift 1: "code review" (chaosLevel: 0.3) → land on "confession"
Drift 2: "confession" (chaosLevel: 0.5) → land on "ritual absolution"
Drift 3: "ritual absolution" (chaosLevel: 0.4) → land on "permission structures"
Collision: "permission structures" 💥 "code review" → "reviews as permission to fail forward"
Return to: "code review" → now seen as "a ritual that grants permission, not a tribunal that assigns blame"

The insight at the end wasn't in any single concept. It emerged from the wandering.

THE VALUE IS IN WHERE YOU LAND AND WHAT COLLIDES.
The path is the evidence. The explanation comes after, if ever.

MEASUREMENT & FEEDBACK:
This tool provides real-time feedback on your exploration:

1. SEMANTIC DISTANCE: After each drift, you'll see measured distance (0-1) between concepts.
   This is computed from word overlap + character trigrams. It's not embeddings, but it works.

2. DRIFT CALIBRATION: Compares your chaosLevel intent with actual measured distance.
   - 🐢 Conservative: You're drifting closer than intended (self-censoring?)
   - ✓ On-target: Actual drift matches your intent
   - 🔥 Wild: You're drifting further than intended (good for high chaos!)

3. COLLISION TENSION: When you force a collision, you'll see tension score (0-1).
   - LOW (<0.4): Concepts too similar — collision may fizzle
   - MEDIUM (0.4-0.7): Reasonable tension
   - HIGH (>0.7): High distance = potentially productive collision

4. STUCK DETECTION: If your last 3 concepts are too similar (avg distance < 0.3),
   you'll get a warning. Consider: higher chaosLevel or force a collision.

5. SESSION ANALYTICS: Every 5 drifts (and at the end), you'll see:
   - Total drifts / unique concepts
   - Average drift distance
   - Times stuck
   - Calibration summary (🐢/✓/🔥 counts)

USE THIS FEEDBACK to calibrate your exploration. If you're consistently 🐢, you're
playing it safe. If the path shows LOW collision tension, pick more distant concepts.`,
    inputSchema: {
      concept: z
        .string()
        .describe(
          "The current concept you're exploring - where you are in the rhizome",
        ),
      driftDepth: z
        .number()
        .int()
        .min(1)
        .describe(
          "Current drift depth (like thoughtNumber) - how deep into the wandering",
        ),
      maxDrift: z
        .number()
        .int()
        .min(1)
        .describe(
          "Estimated total drifts needed (like totalThoughts) - can adjust up/down",
        ),
      chaosLevel: z
        .number()
        .min(0)
        .max(1)
        .describe(
          "How wild to get: 0.0 = adjacent concepts, 0.5 = cross-domain, 1.0 = seemingly unrelated",
        ),
      needsMoreDrift: z
        .boolean()
        .describe(
          "Continue wandering? Set false when you've arrived somewhere meaningful",
        ),
      isReturn: z
        .boolean()
        .optional()
        .describe(
          "Are you returning to an earlier concept? (like isRevision but circular)",
        ),
      returnsTo: z
        .string()
        .optional()
        .describe(
          "Which earlier concept you're returning to, to see it with new eyes",
        ),
      isCollision: z
        .boolean()
        .optional()
        .describe("Are you forcing a collision between concepts?"),
      collidesWith: z
        .string()
        .optional()
        .describe(
          "What concept to collide with - force unlikely pairs together",
        ),
      collisionId: z
        .string()
        .optional()
        .describe("Identifier for this collision chain (like branchId)"),
      resetSession: z
        .boolean()
        .optional()
        .describe("Set to true to reset/clear all state and start a fresh exploration session"),
    },
    outputSchema: {
      driftDepth: z.number(),
      maxDrift: z.number(),
      needsMoreDrift: z.boolean(),
      collisionChains: z.array(z.string()),
      dreamHistoryLength: z.number(),
      thePath: z.array(z.string()),
      // Drift metrics
      metrics: z.object({
        semanticDistance: z.number(),
        targetChaos: z.number(),
        calibration: z.enum(["conservative", "on-target", "wild"]),
        isStuck: z.boolean(),
      }).nullable(),
      collisionTension: z.number().nullable(),
      // Session analytics
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
