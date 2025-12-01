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
 * The server tracks the wandering AND provides feedback on drift quality.
 */

import chalk from "chalk";

export interface DreamData {
  concept: string;
  driftDepth: number;
  maxDrift: number;
  chaosLevel: number;
  needsMoreDrift: boolean;
  isReturn?: boolean;
  returnsTo?: string;
  isCollision?: boolean;
  collidesWith?: string;
  collisionId?: string;
  resetSession?: boolean;
}

export interface DriftMetrics {
  semanticDistance: number;
  targetChaos: number;
  calibration: "conservative" | "on-target" | "wild";
  isStuck: boolean;
}

export interface SessionAnalytics {
  totalDrifts: number;
  avgSemanticDistance: number;
  maxSemanticDistance: number;
  minSemanticDistance: number;
  collisionTensions: number[];
  avgCollisionTension: number;
  uniqueConcepts: number;
  stuckCount: number;
  calibrationHistory: string[];
}

export class AssociativeDreamingServer {
  private dreamHistory: DreamData[] = [];
  private collisions: Record<string, DreamData[]> = {};
  private disableDreamLogging: boolean;
  
  // Metrics tracking
  private driftDistances: number[] = [];
  private collisionTensions: number[] = [];
  private calibrationHistory: string[] = [];
  private stuckCount: number = 0;

  constructor() {
    this.disableDreamLogging =
      (process.env.DISABLE_DREAM_LOGGING || "").toLowerCase() === "true";
  }

  /**
   * Reset the session state. Call this to start a fresh exploration.
   */
  public reset(): void {
    this.dreamHistory = [];
    this.collisions = {};
    this.driftDistances = [];
    this.collisionTensions = [];
    this.calibrationHistory = [];
    this.stuckCount = 0;
  }

  /**
   * Compute semantic distance between two concepts.
   * Uses multiple heuristics combined for a robust estimate:
   * 1. Word-level Jaccard distance (1 - similarity)
   * 2. Character trigram distance
   * 3. Length ratio penalty
   * 
   * Returns 0-1 where 0 = identical, 1 = maximally distant
   */
  private computeSemanticDistance(concept1: string, concept2: string): number {
    const c1 = concept1.toLowerCase().trim();
    const c2 = concept2.toLowerCase().trim();
    
    // Handle edge cases
    if (c1 === c2) return 0;
    if (c1.length === 0 || c2.length === 0) return 1;
    
    // 1. Word-level Jaccard distance
    // Include all words (not just >2 chars) to handle short concepts
    const words1 = new Set(c1.split(/\s+/).filter(w => w.length > 0));
    const words2 = new Set(c2.split(/\s+/).filter(w => w.length > 0));
    const wordIntersection = new Set([...words1].filter(x => words2.has(x)));
    const wordUnion = new Set([...words1, ...words2]);
    const wordJaccard = wordUnion.size > 0 
      ? 1 - (wordIntersection.size / wordUnion.size)
      : 1;
    
    // 2. Character trigram distance (captures partial word overlap)
    // Falls back gracefully for very short strings
    const trigrams = (s: string): Set<string> => {
      const t = new Set<string>();
      const normalized = s.replace(/\s+/g, ' ');
      // For very short strings, use bigrams instead
      const n = normalized.length < 5 ? 2 : 3;
      for (let i = 0; i <= normalized.length - n; i++) {
        t.add(normalized.substring(i, i + n));
      }
      return t;
    };
    const tri1 = trigrams(c1);
    const tri2 = trigrams(c2);
    const triIntersection = new Set([...tri1].filter(x => tri2.has(x)));
    const triUnion = new Set([...tri1, ...tri2]);
    const trigramJaccard = triUnion.size > 0
      ? 1 - (triIntersection.size / triUnion.size)
      : 1;
    
    // 3. Length ratio (very different lengths suggest different domains)
    const lenRatio = Math.min(c1.length, c2.length) / Math.max(c1.length, c2.length);
    const lengthPenalty = 1 - lenRatio; // 0 if same length, approaches 1 if very different
    
    // Combine: weighted average favoring word-level distance
    const combined = (wordJaccard * 0.5) + (trigramJaccard * 0.35) + (lengthPenalty * 0.15);
    
    return Math.min(1, Math.max(0, combined));
  }

  /**
   * Compute collision tension between two concepts.
   * Higher tension = more distant concepts = potentially more productive collision.
   */
  private computeCollisionTension(concept1: string, concept2: string): number {
    return this.computeSemanticDistance(concept1, concept2);
  }

  /**
   * Check if the path is "stuck" - recent concepts too similar.
   * Looks at last 3 concepts and checks if they're all within low distance.
   */
  private detectStuck(): boolean {
    if (this.dreamHistory.length < 3) return false;
    
    const recent = this.dreamHistory.slice(-3).map(d => d.concept);
    const distances: number[] = [];
    
    for (let i = 0; i < recent.length - 1; i++) {
      distances.push(this.computeSemanticDistance(recent[i], recent[i + 1]));
    }
    
    // Also check first to last
    distances.push(this.computeSemanticDistance(recent[0], recent[recent.length - 1]));
    
    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    
    // If average distance in last 3 is below 0.3, we're circling
    return avgDistance < 0.3;
  }

  /**
   * Calibrate drift: compare intended chaosLevel with actual semantic distance.
   */
  private calibrateDrift(targetChaos: number, actualDistance: number): DriftMetrics["calibration"] {
    const diff = actualDistance - targetChaos;
    
    if (diff < -0.25) return "conservative"; // Drifted much less than intended
    if (diff > 0.25) return "wild";          // Drifted much more than intended
    return "on-target";
  }

  /**
   * Get session analytics.
   */
  private getAnalytics(): SessionAnalytics {
    const uniqueConcepts = new Set(this.dreamHistory.map(d => d.concept.toLowerCase())).size;
    
    return {
      totalDrifts: this.dreamHistory.length,
      avgSemanticDistance: this.driftDistances.length > 0
        ? this.driftDistances.reduce((a, b) => a + b, 0) / this.driftDistances.length
        : 0,
      maxSemanticDistance: this.driftDistances.length > 0
        ? Math.max(...this.driftDistances)
        : 0,
      minSemanticDistance: this.driftDistances.length > 0
        ? Math.min(...this.driftDistances)
        : 0,
      collisionTensions: this.collisionTensions,
      avgCollisionTension: this.collisionTensions.length > 0
        ? this.collisionTensions.reduce((a, b) => a + b, 0) / this.collisionTensions.length
        : 0,
      uniqueConcepts,
      stuckCount: this.stuckCount,
      calibrationHistory: this.calibrationHistory,
    };
  }

  private formatDream(dreamData: DreamData): string {
    const {
      driftDepth,
      maxDrift,
      concept,
      chaosLevel,
      isReturn,
      returnsTo,
      isCollision,
      collidesWith,
      collisionId,
    } = dreamData;

    let prefix = "";
    let context = "";

    if (isCollision) {
      prefix = chalk.magenta("💥 Collision");
      context = ` (with "${collidesWith}", chain: ${collisionId})`;
    } else if (isReturn) {
      prefix = chalk.yellow("🔄 Return");
      context = ` (back to "${returnsTo}", but different)`;
    } else {
      prefix = chalk.cyan("🌀 Drift");
      context = "";
    }

    const chaosBar =
      "█".repeat(Math.round(chaosLevel * 10)) +
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

  public processDream(input: DreamData): {
    content: Array<{ type: "text"; text: string }>;
    structuredContent?: Record<string, unknown>;
    isError?: boolean;
  } {
    try {
      // Handle session reset
      if (input.resetSession) {
        this.reset();
      }

      // Adjust maxDrift if driftDepth exceeds it
      if (input.driftDepth > input.maxDrift) {
        input.maxDrift = input.driftDepth;
      }

      // === NEW: Compute metrics before adding to history ===
      let driftMetrics: DriftMetrics | null = null;
      let collisionTension: number | null = null;
      
      // Compute semantic distance from previous concept
      if (this.dreamHistory.length > 0 && !input.isReturn) {
        const prevConcept = this.dreamHistory[this.dreamHistory.length - 1].concept;
        const distance = this.computeSemanticDistance(prevConcept, input.concept);
        this.driftDistances.push(distance);
        
        const calibration = this.calibrateDrift(input.chaosLevel, distance);
        this.calibrationHistory.push(calibration);
        
        const isStuck = this.detectStuck();
        if (isStuck) this.stuckCount++;
        
        driftMetrics = {
          semanticDistance: distance,
          targetChaos: input.chaosLevel,
          calibration,
          isStuck,
        };
      }
      
      // Compute collision tension
      if (input.isCollision && input.collidesWith) {
        collisionTension = this.computeCollisionTension(input.concept, input.collidesWith);
        this.collisionTensions.push(collisionTension);
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
        if (d.isCollision) return `💥 ${d.concept}`;
        if (d.isReturn) return `🔄 ${d.concept}`;
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

      const collisionInfo =
        Object.keys(this.collisions).length > 0
          ? `\n  Collision Chains: ${Object.keys(this.collisions).join(", ")}`
          : "";

      // === NEW: Build metrics feedback ===
      let metricsBlock = "";
      
      if (driftMetrics) {
        const distanceBar = "█".repeat(Math.round(driftMetrics.semanticDistance * 10)) +
                           "░".repeat(10 - Math.round(driftMetrics.semanticDistance * 10));
        
        const calibrationEmoji = {
          "conservative": "🐢",
          "on-target": "✓",
          "wild": "🔥"
        }[driftMetrics.calibration];
        
        const calibrationNote = {
          "conservative": "drifting closer than intended",
          "on-target": "drift matches intent",
          "wild": "drifting further than intended"
        }[driftMetrics.calibration];
        
        metricsBlock += `
  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
  📊 Drift Metrics:
     Target chaos:     ${input.chaosLevel.toFixed(2)}
     Measured distance: ${driftMetrics.semanticDistance.toFixed(2)} [${distanceBar}]
     Calibration:      ${calibrationEmoji} ${calibrationNote}`;
        
        if (driftMetrics.isStuck) {
          metricsBlock += `
     ⚠️  PATH APPEARS STUCK — recent concepts too similar
         Consider: higher chaosLevel or force a collision`;
        }
      }
      
      if (collisionTension !== null) {
        const tensionBar = "█".repeat(Math.round(collisionTension * 10)) +
                         "░".repeat(10 - Math.round(collisionTension * 10));
        const tensionLabel = collisionTension > 0.7 ? "HIGH ⚡" :
                            collisionTension > 0.4 ? "MEDIUM" : "LOW ⚠️";
        metricsBlock += `
  
  💥 Collision Tension: ${collisionTension.toFixed(2)} [${tensionBar}] ${tensionLabel}`;
        
        if (collisionTension < 0.4) {
          metricsBlock += `
     ⚠️  Low tension — concepts may be too similar for productive collision
         Consider: collide with a more distant concept`;
        }
      }
      
      // === NEW: Session analytics summary (show every 5 drifts or at end) ===
      let analyticsBlock = "";
      if (!input.needsMoreDrift || this.dreamHistory.length % 5 === 0) {
        const analytics = this.getAnalytics();
        analyticsBlock = `
  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
  📈 Session Analytics:
     Total drifts:        ${analytics.totalDrifts}
     Unique concepts:     ${analytics.uniqueConcepts}
     Avg drift distance:  ${analytics.avgSemanticDistance.toFixed(2)}
     Distance range:      ${analytics.minSemanticDistance.toFixed(2)} — ${analytics.maxSemanticDistance.toFixed(2)}
     Times stuck:         ${analytics.stuckCount}`;
        
        if (analytics.collisionTensions.length > 0) {
          analyticsBlock += `
     Avg collision tension: ${analytics.avgCollisionTension.toFixed(2)}`;
        }
        
        // Calibration summary
        const calibCounts = {
          conservative: analytics.calibrationHistory.filter(c => c === "conservative").length,
          "on-target": analytics.calibrationHistory.filter(c => c === "on-target").length,
          wild: analytics.calibrationHistory.filter(c => c === "wild").length,
        };
        if (analytics.calibrationHistory.length > 0) {
          analyticsBlock += `
     Calibration: 🐢${calibCounts.conservative} ✓${calibCounts["on-target"]} 🔥${calibCounts.wild}`;
        }
      }

      const readableOutput = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Drift ${input.driftDepth} of ${input.maxDrift} — ${status}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  The Path:

${formattedPath}
${collisionInfo}${metricsBlock}${analyticsBlock}`;

      return {
        content: [
          {
            type: "text" as const,
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
          // NEW: structured metrics
          metrics: driftMetrics ? {
            semanticDistance: driftMetrics.semanticDistance,
            targetChaos: driftMetrics.targetChaos,
            calibration: driftMetrics.calibration,
            isStuck: driftMetrics.isStuck,
          } : null,
          collisionTension: collisionTension,
          analytics: this.getAnalytics(),
        },
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                error: error instanceof Error ? error.message : String(error),
                status: "failed",
              },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    }
  }
}
