/**
 * Associative Dreaming Server - The Yin to Sequential Thinking's Yang
 *
 * PHILOSOPHY:
 * Sequential Thinking = Linear progression with revision/branching (Yang)
 * Associative Dreaming = Rhizomatic wandering with return/collision (Yin)
 *
 * Sequential Thinking tracks: thought → thought → thought (with backtrack)
 * Associative Dreaming tracks: concept ↔ concept ↔ concept (with collision)
 *
 * THE LLM DOES ALL THE CREATIVE WORK.
 * The server just tracks the wandering.
 *
 * ~90 lines. Elegant. Minimal. Trusting.
 */
import chalk from "chalk";
export class AssociativeDreamingServer {
    dreamHistory = [];
    collisions = {};
    disableDreamLogging;
    constructor() {
        this.disableDreamLogging =
            (process.env.DISABLE_DREAM_LOGGING || "").toLowerCase() === "true";
    }
    formatDream(dreamData) {
        const { driftDepth, maxDrift, concept, chaosLevel, isReturn, returnsTo, isCollision, collidesWith, collisionId, } = dreamData;
        let prefix = "";
        let context = "";
        if (isCollision) {
            prefix = chalk.magenta("💥 Collision");
            context = ` (with "${collidesWith}", chain: ${collisionId})`;
        }
        else if (isReturn) {
            prefix = chalk.yellow("🔄 Return");
            context = ` (back to "${returnsTo}", but different)`;
        }
        else {
            prefix = chalk.cyan("🌀 Drift");
            context = "";
        }
        const chaosBar = "█".repeat(Math.round(chaosLevel * 10)) +
            "░".repeat(10 - Math.round(chaosLevel * 10));
        const header = `${prefix} ${driftDepth}/${maxDrift}${context} [${chaosBar}]`;
        const border = "─".repeat(Math.max(header.length, concept.length) + 4);
        return `
┌${border}┐
│ ${header.padEnd(border.length - 2)} │
├${border}┤
│ ${concept.substring(0, border.length - 2).padEnd(border.length - 2)} │
└${border}┘`;
    }
    processDream(input) {
        try {
            // Adjust maxDrift if driftDepth exceeds it
            if (input.driftDepth > input.maxDrift) {
                input.maxDrift = input.driftDepth;
            }
            // Track the dream
            this.dreamHistory.push(input);
            // Track collisions separately (like Sequential Thinking tracks branches)
            if (input.isCollision && input.collisionId) {
                if (!this.collisions[input.collisionId]) {
                    this.collisions[input.collisionId] = [];
                }
                this.collisions[input.collisionId].push(input);
            }
            // Log if enabled
            if (!this.disableDreamLogging) {
                const formattedDream = this.formatDream(input);
                console.error(formattedDream);
            }
            // Format the path as a readable journey
            const pathSteps = this.dreamHistory.map((d) => {
                if (d.isCollision)
                    return `💥 ${d.concept}`;
                if (d.isReturn)
                    return `🔄 ${d.concept}`;
                return `🌀 ${d.concept}`;
            });
            // Build human-readable output with proper formatting
            const status = input.needsMoreDrift ? "Exploring..." : "Arrived.";
            // Format path vertically for readability
            const formattedPath = pathSteps
                .map((step, i) => {
                const connector = i < pathSteps.length - 1 ? "\n       ↓" : "";
                return `    ${step}${connector}`;
            })
                .join("\n");
            const collisionInfo = Object.keys(this.collisions).length > 0
                ? `\nCollision Chains: ${Object.keys(this.collisions).join(", ")}`
                : "";
            const readableOutput = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Drift ${input.driftDepth} of ${input.maxDrift} — ${status}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  The Path:

${formattedPath}
${collisionInfo}`;
            return {
                content: [
                    {
                        type: "text",
                        text: readableOutput,
                    },
                ],
                structuredContent: {
                    driftDepth: input.driftDepth,
                    maxDrift: input.maxDrift,
                    needsMoreDrift: input.needsMoreDrift,
                    collisionChains: Object.keys(this.collisions),
                    dreamHistoryLength: this.dreamHistory.length,
                    thePath: pathSteps,
                },
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            error: error instanceof Error ? error.message : String(error),
                            status: "failed",
                        }, null, 2),
                    },
                ],
                isError: true,
            };
        }
    }
}
