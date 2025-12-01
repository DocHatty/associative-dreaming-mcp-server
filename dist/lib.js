import chalk from "chalk";
// Conceptual clusters: words that are semantically related but share no surface features
// This catches cases like "grief/mourning" that word-overlap metrics miss
const CONCEPTUAL_CLUSTERS = [
    ["grief", "mourning", "sorrow", "bereavement", "loss", "sadness", "lament"],
    ["happy", "joy", "elation", "bliss", "cheerful", "delighted", "pleased"],
    ["anger", "rage", "fury", "wrath", "ire", "outrage", "indignation"],
    ["fear", "terror", "dread", "anxiety", "panic", "fright", "apprehension"],
    ["code", "programming", "software", "development", "coding", "engineering"],
    ["money", "currency", "cash", "funds", "capital", "wealth", "finance"],
    ["doctor", "physician", "medic", "clinician", "practitioner"],
    ["car", "automobile", "vehicle", "auto"],
    ["house", "home", "dwelling", "residence", "abode"],
    ["big", "large", "huge", "enormous", "massive", "giant", "vast"],
    ["small", "tiny", "little", "minute", "minuscule", "petite"],
    ["fast", "quick", "rapid", "swift", "speedy", "hasty"],
    ["slow", "sluggish", "gradual", "leisurely", "unhurried"],
    ["start", "begin", "commence", "initiate", "launch", "embark"],
    ["end", "finish", "conclude", "terminate", "complete", "cease"],
    ["think", "ponder", "contemplate", "reflect", "consider", "muse"],
    ["say", "speak", "tell", "utter", "express", "articulate", "state"],
    ["walk", "stroll", "amble", "saunter", "trek", "hike", "march"],
    ["run", "sprint", "dash", "race", "jog", "bolt"],
    ["eat", "consume", "devour", "dine", "feast", "ingest"],
    ["death", "dying", "demise", "mortality", "passing", "expiration"],
    ["birth", "born", "arrival", "emergence", "genesis", "origin"],
    ["war", "conflict", "battle", "combat", "warfare", "hostilities"],
    ["peace", "harmony", "tranquility", "serenity", "calm"],
    ["love", "affection", "devotion", "adoration", "fondness", "passion"],
    ["hate", "loathe", "detest", "despise", "abhor"],
    ["truth", "fact", "reality", "veracity", "accuracy"],
    ["lie", "falsehood", "deception", "untruth", "fabrication"],
    ["leader", "chief", "head", "boss", "director", "commander"],
    ["follower", "subordinate", "disciple", "adherent"],
    ["teacher", "instructor", "educator", "tutor", "mentor", "professor"],
    ["student", "learner", "pupil", "apprentice", "scholar"],
];
// Build a lookup map for O(1) cluster membership checks
const CLUSTER_MAP = new Map();
CONCEPTUAL_CLUSTERS.forEach((cluster, idx) => {
    cluster.forEach((word) => CLUSTER_MAP.set(word.toLowerCase(), idx));
});
// Suggestions for when drift is too conservative
const CONSERVATIVE_SUGGESTIONS = [
    "Try a concept from a completely different domain (biology, music, mythology, cooking)",
    "What metaphor would a child use to describe this?",
    "What's the emotional opposite of this concept?",
    "If this were a physical sensation, what would it be?",
    "What would this look like in 1000 years? Or 1000 years ago?",
    "What animal, plant, or weather pattern embodies this?",
    "What's the most absurd connection you're suppressing right now?",
];
export class AssociativeDreamingServer {
    dreamHistory = [];
    collisions = {};
    driftDistances = [];
    collisionTensions = [];
    calibrationHistory = [];
    stuckCount = 0;
    disableDreamLogging;
    constructor() {
        this.disableDreamLogging =
            (process.env.DISABLE_DREAM_LOGGING || "").toLowerCase() === "true";
    }
    reset() {
        this.dreamHistory = [];
        this.collisions = {};
        this.driftDistances = [];
        this.collisionTensions = [];
        this.calibrationHistory = [];
        this.stuckCount = 0;
    }
    /**
     * Basic Porter-style stemming (handles common suffixes)
     * Not perfect, but catches grief/grieving, run/running, etc.
     */
    stem(word) {
        let w = word.toLowerCase();
        // Common suffixes in rough order of length
        const suffixes = [
            "ation",
            "ness",
            "ment",
            "able",
            "ible",
            "ful",
            "less",
            "ing",
            "ed",
            "er",
            "ly",
            "s",
        ];
        for (const suffix of suffixes) {
            if (w.length > suffix.length + 2 && w.endsWith(suffix)) {
                w = w.slice(0, -suffix.length);
                break;
            }
        }
        return w;
    }
    /**
     * Check if two words belong to the same conceptual cluster
     */
    inSameCluster(word1, word2) {
        const c1 = CLUSTER_MAP.get(word1.toLowerCase());
        const c2 = CLUSTER_MAP.get(word2.toLowerCase());
        return c1 !== undefined && c2 !== undefined && c1 === c2;
    }
    /**
     * Check if any words from two concepts share a conceptual cluster
     */
    shareConceptualCluster(concept1, concept2) {
        const words1 = concept1.toLowerCase().split(/\s+/);
        const words2 = concept2.toLowerCase().split(/\s+/);
        for (const w1 of words1) {
            for (const w2 of words2) {
                if (this.inSameCluster(w1, w2) ||
                    this.inSameCluster(this.stem(w1), this.stem(w2))) {
                    return true;
                }
            }
        }
        return false;
    }
    computeSemanticDistance(concept1, concept2) {
        const c1 = concept1.toLowerCase().trim();
        const c2 = concept2.toLowerCase().trim();
        if (c1 === c2)
            return 0;
        if (c1.length === 0 || c2.length === 0)
            return 1;
        // Check conceptual clusters FIRST - catches grief/mourning cases
        if (this.shareConceptualCluster(c1, c2)) {
            return 0.15; // Very close semantically despite surface differences
        }
        // Word-level Jaccard with stemming (45% weight)
        const words1 = new Set(c1
            .split(/\s+/)
            .filter((w) => w.length > 0)
            .map((w) => this.stem(w)));
        const words2 = new Set(c2
            .split(/\s+/)
            .filter((w) => w.length > 0)
            .map((w) => this.stem(w)));
        const wordIntersection = new Set([...words1].filter((x) => words2.has(x)));
        const wordUnion = new Set([...words1, ...words2]);
        const wordJaccard = wordUnion.size > 0 ? 1 - wordIntersection.size / wordUnion.size : 1;
        // Character n-gram distance (35% weight)
        const ngrams = (s) => {
            const t = new Set();
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
        const ngramJaccard = ngUnion.size > 0 ? 1 - ngIntersection.size / ngUnion.size : 1;
        // Length ratio penalty (20% weight)
        const lenRatio = Math.min(c1.length, c2.length) / Math.max(c1.length, c2.length);
        const lengthPenalty = 1 - lenRatio;
        return Math.min(1, Math.max(0, wordJaccard * 0.45 + ngramJaccard * 0.35 + lengthPenalty * 0.2));
    }
    detectStuck() {
        if (this.dreamHistory.length < 3)
            return false;
        const recent = this.dreamHistory.slice(-3).map((d) => d.concept);
        const distances = [];
        for (let i = 0; i < recent.length - 1; i++) {
            distances.push(this.computeSemanticDistance(recent[i], recent[i + 1]));
        }
        distances.push(this.computeSemanticDistance(recent[0], recent[recent.length - 1]));
        const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
        return avgDistance < 0.3;
    }
    calibrateDrift(targetChaos, actualDistance) {
        const diff = actualDistance - targetChaos;
        if (diff < -0.25)
            return "conservative";
        if (diff > 0.25)
            return "wild";
        return "on-target";
    }
    getSuggestion(calibration, isStuck) {
        if (calibration === "conservative" || isStuck) {
            return CONSERVATIVE_SUGGESTIONS[Math.floor(Math.random() * CONSERVATIVE_SUGGESTIONS.length)];
        }
        return undefined;
    }
    /**
     * Normalize concept to sentence case for consistent display
     */
    toSentenceCase(text) {
        if (!text)
            return text;
        const trimmed = text.trim();
        const words = trimmed.split(/\s+/);
        return words
            .map((word, index) => {
            // Preserve all-caps acronyms (2-4 letters)
            if (word.length >= 2 &&
                word.length <= 4 &&
                word === word.toUpperCase() &&
                /^[A-Z]+$/.test(word)) {
                return word;
            }
            // First word gets capitalized
            if (index === 0) {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
            // Other words stay lowercase unless they're acronyms
            return word.toLowerCase();
        })
            .join(" ");
    }
    getAnalytics() {
        const uniqueConcepts = new Set(this.dreamHistory.map((d) => d.concept.toLowerCase())).size;
        return {
            totalDrifts: this.dreamHistory.length,
            avgSemanticDistance: this.driftDistances.length > 0
                ? this.driftDistances.reduce((a, b) => a + b, 0) /
                    this.driftDistances.length
                : 0,
            maxSemanticDistance: this.driftDistances.length > 0 ? Math.max(...this.driftDistances) : 0,
            minSemanticDistance: this.driftDistances.length > 0 ? Math.min(...this.driftDistances) : 0,
            collisionTensions: this.collisionTensions,
            avgCollisionTension: this.collisionTensions.length > 0
                ? this.collisionTensions.reduce((a, b) => a + b, 0) /
                    this.collisionTensions.length
                : 0,
            uniqueConcepts,
            stuckCount: this.stuckCount,
            calibrationHistory: this.calibrationHistory,
        };
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
            context = ` (back to "${returnsTo}")`;
        }
        else {
            prefix = chalk.cyan("🌀 Drift");
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
            if (input.resetSession)
                this.reset();
            if (input.driftDepth > input.maxDrift)
                input.maxDrift = input.driftDepth;
            // Compute metrics
            let driftMetrics = null;
            let collisionTension = null;
            if (this.dreamHistory.length > 0 && !input.isReturn) {
                const prevConcept = this.dreamHistory[this.dreamHistory.length - 1].concept;
                const distance = this.computeSemanticDistance(prevConcept, input.concept);
                this.driftDistances.push(distance);
                const calibration = this.calibrateDrift(input.chaosLevel, distance);
                this.calibrationHistory.push(calibration);
                const isStuck = this.detectStuck();
                if (isStuck)
                    this.stuckCount++;
                const suggestion = this.getSuggestion(calibration, isStuck);
                driftMetrics = {
                    semanticDistance: distance,
                    targetChaos: input.chaosLevel,
                    calibration,
                    isStuck,
                    suggestion,
                };
            }
            if (input.isCollision && input.collidesWith) {
                collisionTension = this.computeSemanticDistance(input.concept, input.collidesWith);
                this.collisionTensions.push(collisionTension);
            }
            // Track state
            this.dreamHistory.push(input);
            if (input.isCollision && input.collisionId) {
                if (!this.collisions[input.collisionId])
                    this.collisions[input.collisionId] = [];
                this.collisions[input.collisionId].push(input);
            }
            // Log if enabled
            if (!this.disableDreamLogging) {
                console.error(this.formatDream(input));
            }
            // Build output with consistent sentence case
            const pathSteps = this.dreamHistory.map((d) => {
                const concept = this.toSentenceCase(d.concept);
                if (d.isCollision)
                    return `💥 ${concept} × ${this.toSentenceCase(d.collidesWith || "")}`;
                if (d.isReturn)
                    return `🔄 ${concept}`;
                return concept;
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
                const calibNote = {
                    conservative: "drifting closer than intended",
                    "on-target": "drift matches intent",
                    wild: "drifting further than intended",
                }[driftMetrics.calibration];
                metricsBlock = `
  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
  📊 Drift Metrics:
     Target chaos:      ${input.chaosLevel.toFixed(2)}
     Measured distance: ${driftMetrics.semanticDistance.toFixed(2)} [${distanceBar}]
     Calibration:       ${calibEmoji} ${calibNote}`;
                if (driftMetrics.isStuck) {
                    metricsBlock += `\n     ⚠️  PATH APPEARS STUCK — recent concepts too similar`;
                }
                if (driftMetrics.suggestion) {
                    metricsBlock += `\n     💡 Try: ${driftMetrics.suggestion}`;
                }
            }
            if (collisionTension !== null) {
                const tensionBar = "█".repeat(Math.round(collisionTension * 10)) +
                    "░".repeat(10 - Math.round(collisionTension * 10));
                const tensionLabel = collisionTension > 0.7
                    ? "HIGH ⚡"
                    : collisionTension > 0.4
                        ? "MEDIUM"
                        : "LOW ⚠️";
                metricsBlock += `\n\n  💥 Collision Tension: ${collisionTension.toFixed(2)} [${tensionBar}] ${tensionLabel}`;
                if (collisionTension < 0.4) {
                    metricsBlock += `\n     ⚠️  Low tension — try colliding with a more distant concept`;
                }
            }
            // Analytics block (every 5 drifts or at end)
            let analyticsBlock = "";
            if (!input.needsMoreDrift || this.dreamHistory.length % 5 === 0) {
                const a = this.getAnalytics();
                const calibCounts = {
                    conservative: a.calibrationHistory.filter((c) => c === "conservative")
                        .length,
                    "on-target": a.calibrationHistory.filter((c) => c === "on-target")
                        .length,
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
                content: [{ type: "text", text: readableOutput }],
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
