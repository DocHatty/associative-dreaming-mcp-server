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
  private driftDistances: number[] = [];
  private collisionTensions: number[] = [];
  private calibrationHistory: string[] = [];
  private stuckCount: number = 0;
  private disableDreamLogging: boolean;

  constructor() {
    this.disableDreamLogging =
      (process.env.DISABLE_DREAM_LOGGING || "").toLowerCase() === "true";
  }

  public reset(): void {
    this.dreamHistory = [];
    this.collisions = {};
    this.driftDistances = [];
    this.collisionTensions = [];
    this.calibrationHistory = [];
    this.stuckCount = 0;
  }

  private computeSemanticDistance(concept1: string, concept2: string): number {
    const c1 = concept1.toLowerCase().trim();
    const c2 = concept2.toLowerCase().trim();

    if (c1 === c2) return 0;
    if (c1.length === 0 || c2.length === 0) return 1;

    // Word-level Jaccard distance (50% weight)
    const words1 = new Set(c1.split(/\s+/).filter((w) => w.length > 0));
    const words2 = new Set(c2.split(/\s+/).filter((w) => w.length > 0));
    const wordIntersection = new Set([...words1].filter((x) => words2.has(x)));
    const wordUnion = new Set([...words1, ...words2]);
    const wordJaccard =
      wordUnion.size > 0 ? 1 - wordIntersection.size / wordUnion.size : 1;

    // Character n-gram distance (35% weight)
    const ngrams = (s: string): Set<string> => {
      const t = new Set<string>();
      const normalized = s.replace(/\s+/g, " ");
      const n = normalized.length < 5 ? 2 : 3;
      for (let i = 0; i <= normalized.length - n; i++) {
        t.add(normalized.substring(i, i + n));
      }
      return t;
    };
    const ng1 = ngrams(c1);
    const ng2 = ngrams(c2);
    const ngIntersection = new Set([...ng1].filter((x) => ng2.has(x)));
    const ngUnion = new Set([...ng1, ...ng2]);
    const ngramJaccard =
      ngUnion.size > 0 ? 1 - ngIntersection.size / ngUnion.size : 1;

    // Length ratio penalty (15% weight)
    const lenRatio =
      Math.min(c1.length, c2.length) / Math.max(c1.length, c2.length);
    const lengthPenalty = 1 - lenRatio;

    return Math.min(
      1,
      Math.max(0, wordJaccard * 0.5 + ngramJaccard * 0.35 + lengthPenalty * 0.15)
    );
  }

  private detectStuck(): boolean {
    if (this.dreamHistory.length < 3) return false;

    const recent = this.dreamHistory.slice(-3).map((d) => d.concept);
    const distances: number[] = [];

    for (let i = 0; i < recent.length - 1; i++) {
      distances.push(this.computeSemanticDistance(recent[i], recent[i + 1]));
    }
    distances.push(
      this.computeSemanticDistance(recent[0], recent[recent.length - 1])
    );

    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    return avgDistance < 0.3;
  }

  private calibrateDrift(
    targetChaos: number,
    actualDistance: number
  ): DriftMetrics["calibration"] {
    const diff = actualDistance - targetChaos;
    if (diff < -0.25) return "conservative";
    if (diff > 0.25) return "wild";
    return "on-target";
  }

  private getAnalytics(): SessionAnalytics {
    const uniqueConcepts = new Set(
      this.dreamHistory.map((d) => d.concept.toLowerCase())
    ).size;

    return {
      totalDrifts: this.dreamHistory.length,
      avgSemanticDistance:
        this.driftDistances.length > 0
          ? this.driftDistances.reduce((a, b) => a + b, 0) /
            this.driftDistances.length
          : 0,
      maxSemanticDistance:
        this.driftDistances.length > 0 ? Math.max(...this.driftDistances) : 0,
      minSemanticDistance:
        this.driftDistances.length > 0 ? Math.min(...this.driftDistances) : 0,
      collisionTensions: this.collisionTensions,
      avgCollisionTension:
        this.collisionTensions.length > 0
          ? this.collisionTensions.reduce((a, b) => a + b, 0) /
            this.collisionTensions.length
          : 0,
      uniqueConcepts,
      stuckCount: this.stuckCount,
      calibrationHistory: this.calibrationHistory,
    };
  }

  private formatDream(dreamData: DreamData): string {
    const { driftDepth, maxDrift, concept, chaosLevel, isReturn, returnsTo, isCollision, collidesWith, collisionId } = dreamData;

    let prefix = "";
    let context = "";

    if (isCollision) {
      prefix = chalk.magenta("💥 Collision");
      context = ` (with "${collidesWith}", chain: ${collisionId})`;
    } else if (isReturn) {
      prefix = chalk.yellow("🔄 Return");
      context = ` (back to "${returnsTo}")`;
    } else {
      prefix = chalk.cyan("🌀 Drift");
    }

    const chaosBar = "█".repeat(Math.round(chaosLevel * 10)) + "░".repeat(10 - Math.round(chaosLevel * 10));
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
      if (input.resetSession) this.reset();
      if (input.driftDepth > input.maxDrift) input.maxDrift = input.driftDepth;

      // Compute metrics
      let driftMetrics: DriftMetrics | null = null;
      let collisionTension: number | null = null;

      if (this.dreamHistory.length > 0 && !input.isReturn) {
        const prevConcept = this.dreamHistory[this.dreamHistory.length - 1].concept;
        const distance = this.computeSemanticDistance(prevConcept, input.concept);
        this.driftDistances.push(distance);

        const calibration = this.calibrateDrift(input.chaosLevel, distance);
        this.calibrationHistory.push(calibration);

        const isStuck = this.detectStuck();
        if (isStuck) this.stuckCount++;

        driftMetrics = { semanticDistance: distance, targetChaos: input.chaosLevel, calibration, isStuck };
      }

      if (input.isCollision && input.collidesWith) {
        collisionTension = this.computeSemanticDistance(input.concept, input.collidesWith);
        this.collisionTensions.push(collisionTension);
      }

      // Track state
      this.dreamHistory.push(input);

      if (input.isCollision && input.collisionId) {
        if (!this.collisions[input.collisionId]) this.collisions[input.collisionId] = [];
        this.collisions[input.collisionId].push(input);
      }

      // Log if enabled
      if (!this.disableDreamLogging) {
        console.error(this.formatDream(input));
      }

      // Build output
      const pathSteps = this.dreamHistory.map((d) => {
        if (d.isCollision) return `💥 ${d.concept}`;
        if (d.isReturn) return `🔄 ${d.concept}`;
        return `🌀 ${d.concept}`;
      });

      const status = input.needsMoreDrift ? "Exploring..." : "Arrived.";
      const formattedPath = pathSteps
        .map((step, i) => `    ${step}${i < pathSteps.length - 1 ? "\n       ↓" : ""}`)
        .join("\n");

      const collisionInfo = Object.keys(this.collisions).length > 0
        ? `\n  Collision Chains: ${Object.keys(this.collisions).join(", ")}`
        : "";

      // Metrics block
      let metricsBlock = "";
      if (driftMetrics) {
        const distanceBar = "█".repeat(Math.round(driftMetrics.semanticDistance * 10)) +
                           "░".repeat(10 - Math.round(driftMetrics.semanticDistance * 10));
        const calibEmoji = { conservative: "🐢", "on-target": "✓", wild: "🔥" }[driftMetrics.calibration];
        const calibNote = { conservative: "drifting closer than intended", "on-target": "drift matches intent", wild: "drifting further than intended" }[driftMetrics.calibration];

        metricsBlock = `
  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
  📊 Drift Metrics:
     Target chaos:      ${input.chaosLevel.toFixed(2)}
     Measured distance: ${driftMetrics.semanticDistance.toFixed(2)} [${distanceBar}]
     Calibration:       ${calibEmoji} ${calibNote}`;

        if (driftMetrics.isStuck) {
          metricsBlock += `
     ⚠️  PATH APPEARS STUCK — recent concepts too similar`;
        }
      }

      if (collisionTension !== null) {
        const tensionBar = "█".repeat(Math.round(collisionTension * 10)) + "░".repeat(10 - Math.round(collisionTension * 10));
        const tensionLabel = collisionTension > 0.7 ? "HIGH ⚡" : collisionTension > 0.4 ? "MEDIUM" : "LOW ⚠️";
        metricsBlock += `\n\n  💥 Collision Tension: ${collisionTension.toFixed(2)} [${tensionBar}] ${tensionLabel}`;
        if (collisionTension < 0.4) {
          metricsBlock += `\n     ⚠️  Low tension — concepts may be too similar`;
        }
      }

      // Analytics block (every 5 drifts or at end)
      let analyticsBlock = "";
      if (!input.needsMoreDrift || this.dreamHistory.length % 5 === 0) {
        const a = this.getAnalytics();
        const calibCounts = {
          conservative: a.calibrationHistory.filter((c) => c === "conservative").length,
          "on-target": a.calibrationHistory.filter((c) => c === "on-target").length,
          wild: a.calibrationHistory.filter((c) => c === "wild").length,
        };
        analyticsBlock = `
  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
  📈 Session Analytics:
     Total drifts:        ${a.totalDrifts}
     Unique concepts:     ${a.uniqueConcepts}
     Avg drift distance:  ${a.avgSemanticDistance.toFixed(2)}
     Distance range:      ${a.minSemanticDistance.toFixed(2)} — ${a.maxSemanticDistance.toFixed(2)}
     Times stuck:         ${a.stuckCount}${a.collisionTensions.length > 0 ? `\n     Avg collision tension: ${a.avgCollisionTension.toFixed(2)}` : ""}${a.calibrationHistory.length > 0 ? `\n     Calibration: 🐢${calibCounts.conservative} ✓${calibCounts["on-target"]} 🔥${calibCounts.wild}` : ""}`;
      }

      const readableOutput = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Drift ${input.driftDepth} of ${input.maxDrift} — ${status}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  The Path:

${formattedPath}
${collisionInfo}${metricsBlock}${analyticsBlock}`;

      return {
        content: [{ type: "text" as const, text: readableOutput }],
        structuredContent: {
          driftDepth: input.driftDepth,
          maxDrift: input.maxDrift,
          needsMoreDrift: input.needsMoreDrift,
          collisionChains: Object.keys(this.collisions),
          dreamHistoryLength: this.dreamHistory.length,
          thePath: pathSteps,
          metrics: driftMetrics,
          collisionTension,
          analytics: this.getAnalytics(),
        },
      };
    } catch (error) {
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ error: error instanceof Error ? error.message : String(error), status: "failed" }, null, 2) }],
        isError: true,
      };
    }
  }
}
