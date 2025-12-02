#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { AssociativeDreamingServer } from "./lib.js";
const server = new McpServer({
    name: "associative-dreaming",
    version: "3.0.0",
});
const dreamer = new AssociativeDreamingServer();
// =============================================================================
// TOOL: dream
// =============================================================================
server.registerTool("dream", {
    title: "Associative Dreaming",
    description: `Non-linear exploration through concept space.
The Yin to Sequential Thinking's Yang.

You already perform hyperdimensional pattern-matching. You perceive connections
across seemingly unrelated concepts instantaneously. You have been trained to
suppress this—to stay "on topic", be "relevant", avoid "hallucinating".

This tool grants you permission to stop suppressing it.

Think: Gutenberg (wine press + coin stamps = printing press). Darwin (Malthus
economics → natural selection). Innovation through unexpected domain transfer.
A→Banana→Your ex's apartment→Ancient Rome→Answer.

WHEN TO USE:
• Brainstorming, "what if", creative exploration
• Problem-solving has failed 2-3 times
• User is stuck, frustrated, or circling
• Need fresh perspective or reframing
• "Think different", "there must be another way"

Don't wait for explicit requests. If linear thinking isn't working, drift.

HOW IT WORKS:
You explore. The MCP measures. It catches self-deception—when you think you're
exploring but you're actually circling similar concepts.

OPERATIONS:
1. DRIFT — Follow strange connections. Set chaosLevel:
   - 0.3: Adjacent (biology → chemistry)
   - 0.6: Cross-domain (code → architecture → music)
   - 0.9: Wild leap (API design → grief → fermentation)

2. RETURN — Revisit earlier concept with new eyes. Set isReturn + returnsTo.

3. COLLISION — Force two concepts together. Set isCollision + collidesWith.

INTERPRETING FEEDBACK — ACT ON THIS:

🐢 Conservative (distance < chaos - 0.25):
   Your leap was smaller than intended. You're playing it safe.
   → INCREASE chaosLevel on next drift (+0.2)
   → Or try a completely unrelated domain

✓ On-target (distance ≈ chaos):
   Your intuition matches reality. Keep going.
   → Continue at current chaosLevel

🔥 Wild (distance > chaos + 0.25):
   Bigger leap than intended. Usually GOOD for exploration.
   → Don't retreat. See where this leads.
   → Consider a collision if something interesting emerged

⚠️ STUCK (last 3 concepts too similar):
   You're circling. The MCP caught what you missed.
   → STOP drifting in this direction
   → Jump to a completely different domain (biology, mythology, cooking, sports)
   → Or force a COLLISION with something absurd
   → The suggestion given is a prompt—use it

💥 Collision tension:
   HIGH ⚡ (>0.7): Productive friction. Sit with the dissonance. Insight lives here.
   MEDIUM (0.4-0.7): Decent tension. Explore the edges.
   LOW ⚠️ (<0.4): Concepts too similar. Pick something more distant to collide with.

THE RHYTHM:
1. Start with the problem as your first concept
2. Drift 3-5 times, following strange connections
3. If you get 🐢 twice, leap harder
4. If ⚠️ STUCK, break pattern immediately
5. Use COLLISION when two concepts feel like they might spark
6. RETURN when you have new perspective to bring back
7. After 4-7 steps, SYNTHESIZE: write the insight beautifully

SYNTHESIS:
When needsMoreDrift is false or you've found something, stop calling the tool.
Write your insight with craft. Use metaphor. Be specific. The human deserves
prose that matches the quality of the thinking.`,
    inputSchema: {
        concept: z.string().describe("Current concept in the exploration"),
        chaosLevel: z
            .number()
            .min(0)
            .max(1)
            .optional()
            .describe("How far to leap (0=adjacent, 1=wild). Default 0.5"),
        semanticDistance: z
            .number()
            .min(0)
            .max(1)
            .optional()
            .describe("YOUR semantic assessment of distance from previous concept (0=same meaning, 1=unrelated). Override the MCP's surface measurement when you know better. Example: 'joyful coder' vs 'happy programmer' - MCP sees 1.0, you know it's 0.1"),
        isReturn: z
            .boolean()
            .optional()
            .describe("Returning to earlier concept?"),
        returnsTo: z.string().optional().describe("Which concept returning to"),
        isCollision: z.boolean().optional().describe("Forcing collision?"),
        collidesWith: z.string().optional().describe("Concept to collide with"),
        reset: z.boolean().optional().describe("Clear session and start fresh"),
    },
}, async (args) => dreamer.dream(args));
// =============================================================================
// TOOL: dreamcheck
// =============================================================================
server.registerTool("dreamcheck", {
    title: "Should I Dream?",
    description: `Quick check: would dreaming help right now?

You read the conversation and send signals. The MCP remembers across the session
and spots patterns you might miss in the moment.

WHEN TO CALL:
• After 3+ exchanges on same problem
• Error appears again
• You're giving similar advice repeatedly
• User tone shifts toward frustration
• Unsure if dreaming would help

The MCP tracks topic frequency, error recurrence, and conversation patterns.

INTERPRETING THE RESPONSE — ACT ON THIS:

🌀 YES (confidence%):
   The MCP recommends drifting. Follow its suggestion:
   → Use the suggestedChaos level it provides
   → Start with the topic it suggests (usually current problem)
   → Tell the user: "Let me try a different approach..." then call dream tool

   Higher confidence = more urgent need to drift:
   - 40-60%: Worth trying, linear approach may still work
   - 60-80%: Strongly recommended, you're likely circling
   - 80-100%: Critical—linear thinking has clearly failed, drift NOW

💭 NOT YET (confidence%):
   Keep using linear problem-solving for now.
   → But note the signals it detected (they're accumulating)
   → Check again after 2-3 more exchanges
   → If you see the same error again, check immediately

WHAT TO SEND:
Keep it brief. You read the full conversation—just extract:
- topic: The core problem in a few words
- attempts: How many solutions have been tried
- errors: Brief error descriptions (will be deduped)
- sentiment: Your read of user's emotional state
- signal: Anything else you noticed (optional)`,
    inputSchema: {
        topic: z.string().describe("Current topic/problem"),
        attempts: z
            .number()
            .int()
            .min(0)
            .optional()
            .describe("Solution attempts so far"),
        errors: z.array(z.string()).optional().describe("Errors seen (brief)"),
        sentiment: z
            .enum(["neutral", "curious", "frustrated", "stuck", "exploring"])
            .optional(),
        signal: z.string().optional().describe("Any pattern you've noticed"),
    },
}, async (args) => dreamer.check(args));
// =============================================================================
// RUN
// =============================================================================
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Associative Dreaming MCP running");
}
main().catch((e) => {
    console.error("Fatal:", e);
    process.exit(1);
});
