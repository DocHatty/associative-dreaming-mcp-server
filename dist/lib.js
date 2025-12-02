// ============================================================================
// TYPES
// ============================================================================
// ============================================================================
// CONSTANTS
// ============================================================================
const PROMPTS = [
    "Try a completely different domain (biology, music, mythology, cooking)",
    "What metaphor would a child use?",
    "What's the emotional opposite?",
    "If this were a physical sensation, what would it be?",
    "What would this look like in 1000 years?",
    "What animal or weather pattern embodies this?",
    "What's the absurd connection you're suppressing?",
];
// Synonym clusters for surface-level semantic detection
const CLUSTERS = [
    ["grief", "mourning", "sorrow", "loss", "sadness"],
    ["happy", "joy", "elation", "bliss", "cheerful"],
    ["anger", "rage", "fury", "wrath", "outrage"],
    ["fear", "terror", "dread", "anxiety", "panic"],
    [
        "code",
        "programming",
        "software",
        "development",
        "system",
        "application",
        "app",
    ],
    ["money", "currency", "cash", "funds", "wealth"],
    ["start", "begin", "commence", "initiate", "launch"],
    ["end", "finish", "conclude", "terminate", "complete"],
    ["think", "ponder", "contemplate", "reflect", "consider"],
    ["death", "dying", "demise", "mortality", "passing"],
    ["love", "affection", "devotion", "adoration", "passion"],
    ["hate", "loathe", "detest", "despise", "abhor"],
];
// Build cluster map with both original and stemmed forms
const CLUSTER_MAP = new Map();
const simpleStem = (word) => {
    if (word.length <= 3)
        return word;
    const suffixes = [
        "ation",
        "ness",
        "ment",
        "able",
        "ible",
        "ing",
        "ed",
        "er",
        "ly",
        "es",
        "s",
    ];
    for (const suffix of suffixes) {
        if (word.endsWith(suffix) && word.length > suffix.length + 2) {
            return word.slice(0, -suffix.length);
        }
    }
    return word;
};
CLUSTERS.forEach((cluster, i) => {
    cluster.forEach((w) => {
        CLUSTER_MAP.set(w, i);
        CLUSTER_MAP.set(simpleStem(w), i); // Also add stemmed form
    });
});
// Stop words to ignore in distance calculation
const STOP_WORDS = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "is",
    "it",
    "as",
    "be",
    "this",
    "that",
    "are",
    "was",
    "were",
    "been",
    "has",
    "have",
    "had",
    "not",
    "no",
    "yes",
]);
// ============================================================================
// SERVER
// ============================================================================
export class AssociativeDreamingServer {
    // Dream state
    path = [];
    distances = [];
    stuckCount = 0;
    // Conversation state (for dreamcheck)
    topicCounts = new Map();
    errorCounts = new Map();
    checkCount = 0;
    logging;
    constructor() {
        this.logging = process.env.DISABLE_DREAM_LOGGING?.toLowerCase() !== "true";
    }
    // ==========================================================================
    // CORE: Semantic Distance (the "dumb mirror")
    // ==========================================================================
    /**
     * Simple stemmer - removes common suffixes to match "maps" with "map"
     */
    stem(word) {
        if (word.length <= 3)
            return word;
        const suffixes = [
            "ation",
            "ness",
            "ment",
            "able",
            "ible",
            "ing",
            "ed",
            "er",
            "ly",
            "es",
            "s",
        ];
        for (const suffix of suffixes) {
            if (word.endsWith(suffix) && word.length > suffix.length + 2) {
                return word.slice(0, -suffix.length);
            }
        }
        return word;
    }
    distance(a, b) {
        const s1 = a.toLowerCase().trim();
        const s2 = b.toLowerCase().trim();
        if (s1 === s2)
            return 0;
        if (!s1 || !s2)
            return 1;
        // Get meaningful words (filter stop words), then stem
        const words1 = s1
            .split(/\s+/)
            .filter((w) => !STOP_WORDS.has(w) && w.length > 1)
            .map((w) => this.stem(w));
        const words2 = s2
            .split(/\s+/)
            .filter((w) => !STOP_WORDS.has(w) && w.length > 1)
            .map((w) => this.stem(w));
        // If all words were stop words, use originals (stemmed)
        const set1 = new Set(words1.length > 0 ? words1 : s1.split(/\s+/).map((w) => this.stem(w)));
        const set2 = new Set(words2.length > 0 ? words2 : s2.split(/\s+/).map((w) => this.stem(w)));
        // Check synonym clusters (on stemmed words)
        for (const w1 of set1) {
            for (const w2 of set2) {
                const c1 = CLUSTER_MAP.get(w1);
                const c2 = CLUSTER_MAP.get(w2);
                if (c1 !== undefined && c1 === c2)
                    return 0.15;
            }
        }
        // Word-level Jaccard (50% weight) - standard NLP metric
        // Reference: https://www.learndatasci.com/glossary/jaccard-similarity/
        const wordIntersection = [...set1].filter((x) => set2.has(x)).length;
        const wordUnion = new Set([...set1, ...set2]).size;
        const wordJaccard = wordUnion > 0 ? 1 - wordIntersection / wordUnion : 1;
        // Character trigram Jaccard (30% weight) - catches fuzzy/partial matches
        // Reference: https://pubmed.ncbi.nlm.nih.gov/15747904/
        const trigrams = (s) => {
            const result = new Set();
            const normalized = s.replace(/\s+/g, " ");
            for (let i = 0; i <= normalized.length - 3; i++) {
                result.add(normalized.substring(i, i + 3));
            }
            return result;
        };
        const tg1 = trigrams(s1);
        const tg2 = trigrams(s2);
        const tgIntersection = [...tg1].filter((x) => tg2.has(x)).length;
        const tgUnion = new Set([...tg1, ...tg2]).size;
        const trigramJaccard = tgUnion > 0 ? 1 - tgIntersection / tgUnion : 1;
        // Length ratio penalty (20% weight) - very different lengths = more distant
        const lenRatio = Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length);
        const lengthPenalty = 1 - lenRatio;
        // Weighted combination (matches original README specification)
        return Math.min(1, Math.max(0, wordJaccard * 0.5 + trigramJaccard * 0.3 + lengthPenalty * 0.2));
    }
    isStuck() {
        if (this.path.length < 3)
            return false;
        const recent = this.path.slice(-3);
        const d1 = this.distance(recent[0], recent[1]);
        const d2 = this.distance(recent[1], recent[2]);
        const d3 = this.distance(recent[0], recent[2]);
        // Threshold raised slightly - if avg distance < 0.4, you're circling
        return (d1 + d2 + d3) / 3 < 0.4;
    }
    // ==========================================================================
    // TOOL: Dream (main exploration)
    // ==========================================================================
    dream(input) {
        if (input.reset) {
            this.path = [];
            this.distances = [];
            this.stuckCount = 0;
            this.topicCounts.clear();
            this.errorCounts.clear();
            this.checkCount = 0;
        }
        const concept = input.concept.trim();
        const chaos = input.chaosLevel ?? 0.5;
        // Compute distance from previous concept
        let surfaceDist = null;
        let dist = null;
        let calibration = null;
        let llmOverride = false;
        if (this.path.length > 0 && !input.isReturn) {
            // MCP computes surface distance
            surfaceDist = this.distance(this.path[this.path.length - 1], concept);
            // If LLM provided semantic assessment, blend it (LLM knows meaning, MCP knows surface)
            // 60% LLM semantic, 40% MCP surface - LLM's understanding is deeper
            if (input.semanticDistance !== undefined) {
                dist = input.semanticDistance * 0.6 + surfaceDist * 0.4;
                llmOverride = true;
            }
            else {
                dist = surfaceDist;
            }
            this.distances.push(dist);
            const diff = dist - chaos;
            calibration =
                diff < -0.25 ? "conservative" : diff > 0.25 ? "wild" : "on-target";
        }
        // Collision tension
        let tension = null;
        if (input.isCollision && input.collidesWith) {
            tension = this.distance(concept, input.collidesWith);
        }
        // For returns, compute distance back to original
        let returnDist = null;
        if (input.isReturn && input.returnsTo) {
            returnDist = this.distance(concept, input.returnsTo);
        }
        // Track path
        this.path.push(concept);
        // Stuck detection
        const stuck = this.isStuck();
        if (stuck)
            this.stuckCount++;
        // Build output
        const step = this.path.length;
        const icon = input.isCollision ? "💥" : input.isReturn ? "🔄" : "🌀";
        let output = `${icon} Step ${step}: ${concept}`;
        // Show return context
        if (input.isReturn && input.returnsTo) {
            output += `\n   ↩ Returning to: "${input.returnsTo}"`;
            if (returnDist !== null) {
                const transformed = returnDist > 0.5
                    ? "transformed"
                    : returnDist > 0.25
                        ? "shifted"
                        : "similar";
                output += ` (${transformed})`;
            }
        }
        if (dist !== null) {
            const bar = "█".repeat(Math.round(dist * 10)) +
                "░".repeat(10 - Math.round(dist * 10));
            const emoji = { conservative: "🐢", "on-target": "✓", wild: "🔥" }[calibration];
            output += `\n   Distance: ${dist.toFixed(2)} [${bar}] ${emoji}`;
            // Show when LLM's semantic understanding corrected the surface measurement
            if (llmOverride && surfaceDist !== null) {
                const diff = Math.abs(surfaceDist - input.semanticDistance);
                if (diff > 0.3) {
                    output += `\n   ⚡ Semantic override: surface=${surfaceDist.toFixed(2)}, you saw=${input.semanticDistance.toFixed(2)}`;
                }
            }
        }
        if (tension !== null) {
            const label = tension > 0.7 ? "HIGH ⚡" : tension > 0.4 ? "MEDIUM" : "LOW ⚠️";
            output += `\n   Collision tension: ${tension.toFixed(2)} ${label}`;
            if (tension < 0.4) {
                output += "\n   → Concepts too similar, try a more distant collision";
            }
        }
        if (stuck) {
            const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
            output += `\n   ⚠️ STUCK — ${prompt}`;
        }
        return {
            content: [{ type: "text", text: output }],
            structuredContent: {
                step,
                concept,
                distance: dist,
                surfaceDistance: surfaceDist,
                llmSemanticDistance: input.semanticDistance ?? null,
                calibration,
                tension,
                returnTo: input.returnsTo || null,
                returnDistance: returnDist,
                stuck,
                path: [...this.path],
                avgDistance: this.distances.length > 0
                    ? this.distances.reduce((a, b) => a + b, 0) / this.distances.length
                    : null,
                stuckCount: this.stuckCount,
            },
        };
    }
    // ==========================================================================
    // TOOL: Check (should I dream?)
    // ==========================================================================
    check(input) {
        this.checkCount++;
        const topic = input.topic.toLowerCase().trim();
        this.topicCounts.set(topic, (this.topicCounts.get(topic) || 0) + 1);
        // Dedupe errors within this call, then track
        if (input.errors) {
            const uniqueErrors = [
                ...new Set(input.errors.map((e) => e.toLowerCase().trim())),
            ];
            for (const e of uniqueErrors) {
                this.errorCounts.set(e, (this.errorCounts.get(e) || 0) + 1);
            }
        }
        // Score signals
        const signals = [];
        let score = 0;
        // Topic repetition
        const topicN = this.topicCounts.get(topic) || 0;
        if (topicN >= 3) {
            score += 0.35;
            signals.push(`Topic repeated ${topicN}x`);
        }
        else if (topicN >= 2) {
            score += 0.2;
            signals.push(`Topic revisited`);
        }
        // Repeated errors (threshold lowered - 2+ means recurring)
        const repeats = [...this.errorCounts.entries()].filter(([_, n]) => n >= 2);
        if (repeats.length > 0) {
            score += 0.3;
            signals.push(`Errors recurring: ${repeats.map(([e, n]) => `"${e}" (${n}x)`).join(", ")}`);
        }
        // Even single errors are signal
        const totalErrors = [...this.errorCounts.values()].reduce((a, b) => a + b, 0);
        if (totalErrors > 0 && repeats.length === 0) {
            score += 0.1;
            signals.push(`${totalErrors} error(s) seen`);
        }
        // Attempts - give partial credit even for low counts
        if (input.attempts !== undefined) {
            if (input.attempts >= 4) {
                score += 0.3;
                signals.push(`${input.attempts} attempts — significant effort`);
            }
            else if (input.attempts >= 2) {
                score += 0.15;
                signals.push(`${input.attempts} attempts`);
            }
            else if (input.attempts === 1) {
                score += 0.05;
                signals.push(`1 attempt`);
            }
        }
        // Sentiment
        if (input.sentiment === "stuck") {
            score += 0.35;
            signals.push("User stuck");
        }
        else if (input.sentiment === "frustrated") {
            score += 0.25;
            signals.push("User frustrated");
        }
        else if (input.sentiment === "exploring") {
            score += 0.2;
            signals.push("Exploratory mode");
        }
        else if (input.sentiment === "curious") {
            score += 0.1;
            signals.push("Curious tone");
        }
        // Custom signal
        if (input.signal) {
            score += 0.15;
            signals.push(input.signal);
        }
        // Active dream session
        if (this.path.length > 0) {
            score += 0.1;
            signals.push("Dream session active");
        }
        // Check count itself is a signal (they keep checking = uncertainty)
        if (this.checkCount >= 3) {
            score += 0.1;
            signals.push(`${this.checkCount} checks — consider drifting`);
        }
        const confidence = Math.min(1, score);
        const shouldDream = confidence >= 0.35; // Lowered threshold slightly
        const chaosHint = confidence >= 0.7 ? 0.7 : confidence >= 0.5 ? 0.5 : 0.4;
        const emoji = shouldDream ? "🌀" : "💭";
        const verdict = shouldDream
            ? `YES (${Math.round(confidence * 100)}%)`
            : `NOT YET (${Math.round(confidence * 100)}%)`;
        let output = `${emoji} ${verdict}`;
        if (signals.length > 0) {
            output += "\n" + signals.map((s) => `   • ${s}`).join("\n");
        }
        if (shouldDream) {
            output += `\n   → Start with "${input.topic}", chaos ${chaosHint}`;
        }
        return {
            content: [{ type: "text", text: output }],
            structuredContent: {
                shouldDream,
                confidence,
                signals,
                suggestedChaos: shouldDream ? chaosHint : null,
                suggestedStart: shouldDream ? input.topic : null,
                checkCount: this.checkCount,
                topicCount: topicN,
                totalErrors,
            },
        };
    }
}
