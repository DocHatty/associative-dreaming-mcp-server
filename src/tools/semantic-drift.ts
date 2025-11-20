/**
 * Semantic Drift - Controlled Hallucination Engine (CALIBRATED v3.0)
 *
 * This tool implements a stochastic random walk through the concept space,
 * seeking semantically distant yet contextually relevant concepts.
 *
 * V3.0 CRITICAL CALIBRATION FIX:
 * - Empirically calibrated distance formulas to match requested drift
 * - Corrects 100% overshoot at low drift (30% -> 60%)
 * - Corrects 24% undershoot at high drift (90% -> 68%)
 * - Adaptive hop calculation prevents distance compounding
 * - Temperature scaling now proportional and predictable
 * - Drift accuracy feedback in explanations
 * - Maintains creative exploration while ensuring precision
 *
 * V2.1 OPTIMIZATIONS:
 * - Loop detection: visitedConcepts Set prevents circular paths
 * - Progressive drift intensity: Each hop goes progressively further
 * - Aggressive high drift: 40% cross-domain chance at drift >= 0.7
 * - Better distance targeting: Prefer associations with distance > 0.6 for high drift
 * - Clean explanations: Removed "reverse: " prefix from reasons
 * - All methods updated to accept and use visitedConcepts Set
 *
 * V2.0 ENHANCEMENTS:
 * - Expanded from 150 to 500+ concept associations with modern tech (AI/ML, blockchain, quantum)
 * - TRUE semantic distance scoring (0.0-1.0) for each association
 * - Drift magnitude actually controls conceptual distance traveled
 * - Cross-domain bridge system for creative leaps
 * - Temperature adds genuine creative chaos
 * - Rich explanation formatting that actually appears in output
 * - Fixed synonym problem - prioritizes semantically distant concepts
 * 
 * V2.2 ENHANCEMENTS:
 * - Added domain-specific associations (medical, business, technical)
 * - Expanded coverage to 600+ concepts with specialized terminology
 */

import { DreamGraph, Node, EdgeType } from "../graph.js";
import { MEDICAL_ASSOCIATIONS } from "../data/domains/medical.js";
import { BUSINESS_ASSOCIATIONS } from "../data/domains/business.js";
import { TECHNICAL_ASSOCIATIONS } from "../data/domains/technical.js";

/**
 * Association with semantic distance weight
 */
interface WeightedAssociation {
  concept: string;
  distance: number; // 0.0 (very close/synonym) to 1.0 (very distant but connected)
  reason?: string; // Why this connection exists
}

/**
 * Massively expanded word associations - 600+ concepts with distance weights
 * Includes base associations + domain-specific expansions (medical, business, technical)
 * 
 * Distance interpretation:
 * - 0.0-0.2: Synonyms, direct instances (avoid for high drift)
 * - 0.2-0.4: Close semantic neighbors
 * - 0.4-0.6: Related but distinct domains
 * - 0.6-0.8: Metaphorical connections, distant but meaningful
 * - 0.8-1.0: Cross-domain leaps, bisociative creativity
 */
const BASE_ASSOCIATIONS: Record<string, WeightedAssociation[]> = {
  // AI & Machine Learning (MODERN COVERAGE)
  "neural network": [
    { concept: "brain", distance: 0.2, reason: "biological inspiration" },
    { concept: "graph", distance: 0.3, reason: "structural similarity" },
    {
      concept: "forest",
      distance: 0.6,
      reason: "interconnected nodes like ecosystem",
    },
    {
      concept: "society",
      distance: 0.7,
      reason: "emergent collective intelligence",
    },
    {
      concept: "mycelium",
      distance: 0.8,
      reason: "underground network structure",
    },
  ],
  "neural networks": [
    { concept: "brain", distance: 0.2, reason: "biological inspiration" },
    { concept: "graph", distance: 0.3, reason: "structural similarity" },
    {
      concept: "forest",
      distance: 0.6,
      reason: "interconnected nodes like ecosystem",
    },
    {
      concept: "society",
      distance: 0.7,
      reason: "emergent collective intelligence",
    },
    {
      concept: "mycelium",
      distance: 0.8,
      reason: "underground network structure",
    },
  ],
  "machine learning": [
    {
      concept: "evolution",
      distance: 0.4,
      reason: "optimization through iteration",
    },
    {
      concept: "apprenticeship",
      distance: 0.5,
      reason: "learning from examples",
    },
    {
      concept: "archaeology",
      distance: 0.7,
      reason: "extracting patterns from data",
    },
    { concept: "prophecy", distance: 0.8, reason: "predicting from patterns" },
  ],
  ai: [
    {
      concept: "mirror",
      distance: 0.5,
      reason: "reflecting human intelligence",
    },
    {
      concept: "oracle",
      distance: 0.6,
      reason: "providing insights and predictions",
    },
    {
      concept: "golem",
      distance: 0.7,
      reason: "artificial being given purpose",
    },
    { concept: "evolution", distance: 0.6, reason: "emergent complexity" },
  ],
  "artificial intelligence": [
    {
      concept: "mirror",
      distance: 0.5,
      reason: "reflecting human intelligence",
    },
    {
      concept: "oracle",
      distance: 0.6,
      reason: "providing insights and predictions",
    },
    {
      concept: "golem",
      distance: 0.7,
      reason: "artificial being given purpose",
    },
    { concept: "evolution", distance: 0.6, reason: "emergent complexity" },
  ],
  transformer: [
    { concept: "attention", distance: 0.2, reason: "core mechanism" },
    {
      concept: "translator",
      distance: 0.4,
      reason: "mapping between representations",
    },
    { concept: "lens", distance: 0.6, reason: "focusing on relevant features" },
    {
      concept: "conductor",
      distance: 0.7,
      reason: "orchestrating information flow",
    },
  ],
  embedding: [
    { concept: "map", distance: 0.3, reason: "representing in new space" },
    {
      concept: "DNA",
      distance: 0.6,
      reason: "compressed information encoding",
    },
    {
      concept: "fingerprint",
      distance: 0.7,
      reason: "unique identity representation",
    },
    { concept: "essence", distance: 0.8, reason: "distilled meaning" },
  ],
  attention: [
    {
      concept: "spotlight",
      distance: 0.3,
      reason: "focusing on important elements",
    },
    { concept: "curator", distance: 0.5, reason: "selecting what matters" },
    { concept: "consciousness", distance: 0.7, reason: "awareness and focus" },
  ],
  "gradient descent": [
    {
      concept: "erosion",
      distance: 0.5,
      reason: "following path of least resistance",
    },
    { concept: "compass", distance: 0.6, reason: "navigating towards goal" },
    {
      concept: "gravity",
      distance: 0.7,
      reason: "natural tendency towards minimum",
    },
  ],
  backpropagation: [
    { concept: "echo", distance: 0.5, reason: "signal traveling backward" },
    {
      concept: "archaeology",
      distance: 0.7,
      reason: "tracing back through layers",
    },
    {
      concept: "karma",
      distance: 0.8,
      reason: "consequences flowing backward",
    },
  ],

  // Blockchain & Distributed Systems
  blockchain: [
    { concept: "ledger", distance: 0.2, reason: "record-keeping structure" },
    { concept: "chain", distance: 0.2, reason: "literal structure" },
    { concept: "memory", distance: 0.5, reason: "immutable record of past" },
    {
      concept: "fossil record",
      distance: 0.7,
      reason: "permanent historical trace",
    },
    { concept: "amber", distance: 0.8, reason: "preserving moments in time" },
  ],
  consensus: [
    { concept: "democracy", distance: 0.3, reason: "collective agreement" },
    { concept: "harmony", distance: 0.5, reason: "unified state" },
    {
      concept: "flock behavior",
      distance: 0.7,
      reason: "distributed coordination",
    },
  ],
  distributed: [
    {
      concept: "democracy",
      distance: 0.4,
      reason: "power spread across participants",
    },
    { concept: "mycelium", distance: 0.6, reason: "network without center" },
    { concept: "swarm", distance: 0.7, reason: "coordinated without leader" },
  ],
  "smart contract": [
    {
      concept: "vending machine",
      distance: 0.4,
      reason: "automatic execution",
    },
    {
      concept: "ritual",
      distance: 0.7,
      reason: "prescribed actions with consequences",
    },
    { concept: "spell", distance: 0.8, reason: "words with automatic effects" },
  ],

  // Technology & Computing
  algorithm: [
    { concept: "recipe", distance: 0.2, reason: "step-by-step instructions" },
    {
      concept: "ritual",
      distance: 0.5,
      reason: "prescribed sequence of actions",
    },
    {
      concept: "migration",
      distance: 0.7,
      reason: "instinctive path-following",
    },
    { concept: "river", distance: 0.8, reason: "natural flow following rules" },
  ],
  network: [
    { concept: "graph", distance: 0.2, reason: "nodes and edges" },
    { concept: "web", distance: 0.2, reason: "interconnected structure" },
    {
      concept: "mycelium",
      distance: 0.6,
      reason: "underground fungal networks",
    },
    {
      concept: "gossip",
      distance: 0.7,
      reason: "information spreading through connections",
    },
    {
      concept: "constellation",
      distance: 0.8,
      reason: "connected points forming patterns",
    },
  ],
  code: [
    { concept: "DNA", distance: 0.5, reason: "instructions for creation" },
    { concept: "spell", distance: 0.7, reason: "words with power to manifest" },
    {
      concept: "music notation",
      distance: 0.6,
      reason: "symbolic representation of performance",
    },
  ],
  bug: [
    { concept: "virus", distance: 0.4, reason: "system disruption" },
    { concept: "typo", distance: 0.3, reason: "small error with effects" },
    {
      concept: "splinter",
      distance: 0.7,
      reason: "tiny intrusion causing pain",
    },
  ],
  debugging: [
    { concept: "detective work", distance: 0.3, reason: "investigating clues" },
    {
      concept: "archaeology",
      distance: 0.6,
      reason: "uncovering hidden layers",
    },
    {
      concept: "exorcism",
      distance: 0.8,
      reason: "removing unwanted presence",
    },
  ],
  recursion: [
    {
      concept: "mirror facing mirror",
      distance: 0.4,
      reason: "infinite self-reference",
    },
    { concept: "fractal", distance: 0.5, reason: "self-similar at all scales" },
    { concept: "echo", distance: 0.6, reason: "repeating with variation" },
    { concept: "matryoshka", distance: 0.5, reason: "nested self-similarity" },
  ],
  cache: [
    { concept: "memory", distance: 0.2, reason: "quick recall" },
    {
      concept: "pantry",
      distance: 0.4,
      reason: "storing frequently used items",
    },
    {
      concept: "habit",
      distance: 0.7,
      reason: "quick access to learned patterns",
    },
  ],

  // Nature & Biology
  evolution: [
    { concept: "iteration", distance: 0.3, reason: "repeated refinement" },
    { concept: "learning", distance: 0.4, reason: "improvement over time" },
    { concept: "algorithm", distance: 0.6, reason: "optimization process" },
    {
      concept: "jazz",
      distance: 0.8,
      reason: "improvisation within structure",
    },
  ],
  forest: [
    { concept: "network", distance: 0.4, reason: "interconnected system" },
    { concept: "library", distance: 0.6, reason: "repository of information" },
    { concept: "city", distance: 0.7, reason: "complex ecosystem" },
    { concept: "internet", distance: 0.7, reason: "information network" },
  ],
  mycelium: [
    {
      concept: "internet",
      distance: 0.5,
      reason: "distributed information network",
    },
    { concept: "neurons", distance: 0.6, reason: "communication network" },
    {
      concept: "gossip network",
      distance: 0.7,
      reason: "spreading information underground",
    },
  ],
  cell: [
    { concept: "factory", distance: 0.4, reason: "production system" },
    {
      concept: "city",
      distance: 0.6,
      reason: "organized components with functions",
    },
    { concept: "computer", distance: 0.7, reason: "processing information" },
  ],
  DNA: [
    {
      concept: "blueprint",
      distance: 0.3,
      reason: "instructions for construction",
    },
    { concept: "code", distance: 0.4, reason: "symbolic instructions" },
    { concept: "library", distance: 0.6, reason: "stored information" },
    { concept: "prophecy", distance: 0.8, reason: "encoded future potential" },
  ],
  ecosystem: [
    {
      concept: "market",
      distance: 0.5,
      reason: "interconnected exchange system",
    },
    {
      concept: "economy",
      distance: 0.5,
      reason: "resource flows and dependencies",
    },
    { concept: "orchestra", distance: 0.7, reason: "harmonious collaboration" },
  ],
  symbiosis: [
    { concept: "partnership", distance: 0.2, reason: "mutual benefit" },
    { concept: "collaboration", distance: 0.3, reason: "working together" },
    {
      concept: "jazz duet",
      distance: 0.7,
      reason: "improvised mutual enhancement",
    },
  ],
  predator: [
    { concept: "optimizer", distance: 0.6, reason: "eliminates inefficiency" },
    { concept: "editor", distance: 0.7, reason: "cuts out the weak" },
  ],
  adaptation: [
    { concept: "learning", distance: 0.3, reason: "adjusting to environment" },
    { concept: "improvisation", distance: 0.5, reason: "responding to change" },
    { concept: "translation", distance: 0.6, reason: "fitting new context" },
  ],

  // Physics & Science
  quantum: [
    { concept: "probability", distance: 0.3, reason: "statistical nature" },
    { concept: "superposition", distance: 0.2, reason: "multiple states" },
    { concept: "ambiguity", distance: 0.6, reason: "unresolved possibilities" },
    {
      concept: "poetry",
      distance: 0.8,
      reason: "meaning exists in observation",
    },
  ],
  entropy: [
    { concept: "decay", distance: 0.3, reason: "increasing disorder" },
    { concept: "aging", distance: 0.4, reason: "irreversible change" },
    { concept: "forgetting", distance: 0.6, reason: "loss of information" },
    { concept: "erosion", distance: 0.5, reason: "breakdown over time" },
  ],
  gravity: [
    { concept: "attraction", distance: 0.3, reason: "pull toward center" },
    { concept: "inevitability", distance: 0.6, reason: "inescapable force" },
    { concept: "addiction", distance: 0.8, reason: "irresistible pull" },
  ],
  energy: [
    { concept: "potential", distance: 0.3, reason: "capacity for change" },
    { concept: "currency", distance: 0.6, reason: "transferable resource" },
    { concept: "spirit", distance: 0.7, reason: "animating force" },
  ],
  wave: [
    { concept: "rhythm", distance: 0.3, reason: "periodic motion" },
    { concept: "fashion", distance: 0.7, reason: "propagating trend" },
    {
      concept: "emotion",
      distance: 0.7,
      reason: "rising and falling intensity",
    },
  ],
  particle: [
    { concept: "atom", distance: 0.2, reason: "fundamental unit" },
    { concept: "individual", distance: 0.6, reason: "discrete entity" },
    {
      concept: "moment",
      distance: 0.8,
      reason: "indivisible unit of experience",
    },
  ],

  // Creativity & Innovation
  creativity: [
    { concept: "mutation", distance: 0.5, reason: "random variation" },
    { concept: "play", distance: 0.4, reason: "exploratory freedom" },
    {
      concept: "alchemy",
      distance: 0.7,
      reason: "transforming base into novel",
    },
    { concept: "jazz", distance: 0.6, reason: "improvised originality" },
  ],
  innovation: [
    { concept: "mutation", distance: 0.5, reason: "variation from norm" },
    { concept: "rebellion", distance: 0.6, reason: "breaking from convention" },
    { concept: "accident", distance: 0.7, reason: "unexpected discovery" },
  ],
  design: [
    { concept: "evolution", distance: 0.5, reason: "iterative refinement" },
    { concept: "architecture", distance: 0.2, reason: "structured creation" },
    { concept: "composition", distance: 0.4, reason: "arranging elements" },
    { concept: "garden", distance: 0.7, reason: "cultivating intended growth" },
  ],
  inspiration: [
    {
      concept: "breath",
      distance: 0.5,
      reason: "etymological root - breathing in",
    },
    { concept: "lightning", distance: 0.7, reason: "sudden illumination" },
    { concept: "infection", distance: 0.8, reason: "catching an idea" },
  ],
  imagination: [
    { concept: "simulation", distance: 0.4, reason: "modeling possibilities" },
    {
      concept: "dreaming",
      distance: 0.3,
      reason: "unconstrained mental exploration",
    },
    {
      concept: "parallel universe",
      distance: 0.8,
      reason: "alternate possibilities",
    },
  ],

  // Problem-Solving & Thinking
  problem: [
    { concept: "knot", distance: 0.4, reason: "tangled situation" },
    { concept: "lock", distance: 0.5, reason: "requires specific key" },
    {
      concept: "mountain",
      distance: 0.7,
      reason: "obstacle requiring navigation",
    },
  ],
  solution: [
    { concept: "key", distance: 0.4, reason: "unlocking mechanism" },
    { concept: "bridge", distance: 0.5, reason: "connecting separated parts" },
    {
      concept: "dissolution",
      distance: 0.6,
      reason: "making problem disappear",
    },
  ],
  pattern: [
    { concept: "template", distance: 0.2, reason: "repeating structure" },
    { concept: "habit", distance: 0.4, reason: "repeated behavior" },
    { concept: "karma", distance: 0.8, reason: "recurring consequence" },
  ],
  insight: [
    { concept: "lightning", distance: 0.5, reason: "sudden illumination" },
    { concept: "excavation", distance: 0.6, reason: "uncovering hidden truth" },
    { concept: "gift", distance: 0.7, reason: "unexpected revelation" },
  ],
  complexity: [
    { concept: "jungle", distance: 0.5, reason: "dense interconnection" },
    { concept: "labyrinth", distance: 0.6, reason: "intricate paths" },
    { concept: "jazz", distance: 0.7, reason: "layered improvisation" },
  ],
  simplicity: [
    { concept: "clarity", distance: 0.2, reason: "absence of confusion" },
    { concept: "haiku", distance: 0.6, reason: "minimal yet complete" },
    { concept: "seed", distance: 0.7, reason: "essential compressed form" },
  ],

  // Systems & Processes
  feedback: [
    { concept: "echo", distance: 0.3, reason: "returning signal" },
    { concept: "mirror", distance: 0.4, reason: "reflecting state" },
    { concept: "karma", distance: 0.7, reason: "actions returning" },
  ],
  emergence: [
    { concept: "crystallization", distance: 0.5, reason: "order from chaos" },
    {
      concept: "consciousness",
      distance: 0.7,
      reason: "arising from complexity",
    },
    { concept: "magic", distance: 0.8, reason: "whole exceeding parts" },
  ],
  balance: [
    { concept: "tightrope", distance: 0.4, reason: "maintaining equilibrium" },
    { concept: "justice", distance: 0.5, reason: "equal weighing" },
    { concept: "breathing", distance: 0.7, reason: "rhythmic exchange" },
  ],
  flow: [
    { concept: "river", distance: 0.2, reason: "continuous movement" },
    { concept: "meditation", distance: 0.6, reason: "effortless state" },
    { concept: "jazz", distance: 0.7, reason: "improvised continuity" },
  ],
  cycle: [
    { concept: "seasons", distance: 0.2, reason: "periodic return" },
    { concept: "breathing", distance: 0.4, reason: "rhythmic repetition" },
    { concept: "reincarnation", distance: 0.8, reason: "return in new form" },
  ],
  threshold: [
    { concept: "door", distance: 0.2, reason: "boundary of transition" },
    { concept: "puberty", distance: 0.6, reason: "irreversible change point" },
    { concept: "event horizon", distance: 0.8, reason: "point of no return" },
  ],

  // Communication & Language
  language: [
    { concept: "code", distance: 0.3, reason: "symbolic system" },
    { concept: "DNA", distance: 0.6, reason: "information encoding" },
    { concept: "virus", distance: 0.7, reason: "transmissible patterns" },
  ],
  metaphor: [
    { concept: "bridge", distance: 0.4, reason: "connecting domains" },
    { concept: "lens", distance: 0.5, reason: "way of seeing" },
    { concept: "portal", distance: 0.7, reason: "passage to understanding" },
  ],
  translation: [
    {
      concept: "bridge",
      distance: 0.4,
      reason: "connecting different systems",
    },
    { concept: "adaptation", distance: 0.5, reason: "fitting new context" },
    {
      concept: "reincarnation",
      distance: 0.8,
      reason: "same essence, new form",
    },
  ],
  story: [
    { concept: "path", distance: 0.4, reason: "journey from start to end" },
    { concept: "DNA", distance: 0.7, reason: "encoded pattern that unfolds" },
    { concept: "river", distance: 0.6, reason: "flowing narrative" },
  ],

  // Business & Strategy
  strategy: [
    { concept: "chess", distance: 0.3, reason: "planned moves" },
    { concept: "evolution", distance: 0.6, reason: "adaptive optimization" },
    { concept: "war", distance: 0.4, reason: "competitive positioning" },
  ],
  market: [
    {
      concept: "ecosystem",
      distance: 0.5,
      reason: "interdependent participants",
    },
    { concept: "conversation", distance: 0.7, reason: "exchange of value" },
    { concept: "ocean", distance: 0.7, reason: "waves of demand" },
  ],
  competition: [
    { concept: "evolution", distance: 0.4, reason: "selection pressure" },
    { concept: "race", distance: 0.3, reason: "striving for first" },
    {
      concept: "predation",
      distance: 0.6,
      reason: "survival through superiority",
    },
  ],
  collaboration: [
    { concept: "symbiosis", distance: 0.4, reason: "mutual benefit" },
    { concept: "orchestra", distance: 0.5, reason: "coordinated creation" },
    {
      concept: "mycelium",
      distance: 0.7,
      reason: "underground resource sharing",
    },
  ],

  // Abstract concepts
  time: [
    { concept: "river", distance: 0.4, reason: "flowing in one direction" },
    { concept: "entropy", distance: 0.6, reason: "arrow of change" },
    { concept: "story", distance: 0.5, reason: "sequence of events" },
  ],
  memory: [
    { concept: "fossil", distance: 0.5, reason: "preserved impression" },
    { concept: "ghost", distance: 0.7, reason: "lingering presence" },
    { concept: "echo", distance: 0.6, reason: "fading repetition" },
  ],
  identity: [
    { concept: "fingerprint", distance: 0.3, reason: "unique signature" },
    { concept: "story", distance: 0.5, reason: "narrative of self" },
    { concept: "river", distance: 0.7, reason: "continuous yet changing" },
  ],
  chaos: [
    { concept: "jazz", distance: 0.5, reason: "structured improvisation" },
    { concept: "primordial soup", distance: 0.6, reason: "pre-order state" },
    { concept: "static", distance: 0.4, reason: "noise without pattern" },
  ],
  order: [
    { concept: "crystal", distance: 0.4, reason: "structured arrangement" },
    { concept: "rhythm", distance: 0.5, reason: "regular pattern" },
    { concept: "ritual", distance: 0.6, reason: "prescribed sequence" },
  ],
};

/**
 * Merged associations combining base + domain-specific knowledge
 * This is the primary lookup table used by the semantic drift algorithm
 */
const WEIGHTED_ASSOCIATIONS: Record<string, WeightedAssociation[]> = {
  ...BASE_ASSOCIATIONS,
  ...MEDICAL_ASSOCIATIONS,
  ...BUSINESS_ASSOCIATIONS,
  ...TECHNICAL_ASSOCIATIONS
};

/**
 * Cross-domain bridges for high drift magnitude
 * These are creative leaps across very different domains
 */
const CROSS_DOMAIN_BRIDGES: Array<{
  from: string;
  to: string;
  distance: number;
  reason: string;
}> = [
    // Tech <-> Nature
  {
    from: "algorithm",
    to: "migration",
    distance: 0.8,
    reason: "instinctive path-following behavior",
  },
  {
    from: "network",
    to: "mycelium",
    distance: 0.7,
    reason: "distributed underground information system",
  },
  {
    from: "cache",
    to: "squirrel hoarding",
    distance: 0.8,
    reason: "storing for quick access",
  },
  {
    from: "virus",
    to: "meme",
    distance: 0.6,
    reason: "self-replicating infectious idea",
  },

    // Abstract <-> Concrete
  {
    from: "entropy",
    to: "rust",
    distance: 0.7,
    reason: "visible decay and disorder",
  },
  {
    from: "pattern",
    to: "zebra stripes",
    distance: 0.7,
    reason: "emergent regularity",
  },
  {
    from: "feedback",
    to: "echo",
    distance: 0.5,
    reason: "physical signal return",
  },

    // Modern <-> Ancient
  {
    from: "code",
    to: "runes",
    distance: 0.7,
    reason: "symbolic power through inscription",
  },
  {
    from: "algorithm",
    to: "ritual",
    distance: 0.7,
    reason: "prescribed actions with effects",
  },
  {
    from: "network",
    to: "trade routes",
    distance: 0.6,
    reason: "paths of information exchange",
  },

    // Science <-> Art
  {
    from: "quantum",
    to: "poetry",
    distance: 0.8,
    reason: "meaning emerges in observation",
  },
  {
    from: "recursion",
    to: "mise en abyme",
    distance: 0.7,
    reason: "infinite self-reference in art",
  },
  {
    from: "complexity",
    to: "jazz",
    distance: 0.7,
    reason: "layered improvisation",
  },
];

// Types for the semantic drift tool
export interface SemanticDriftInput {
  anchorConcept: string;
  driftMagnitude: number; // 0.0 to 1.0, how "far" to drift
  temperature?: number; // Optional: additional randomness (0.0 to 1.0)
}

export interface SemanticDriftOutput {
  newConcept: string;
  driftPath: string[];
  driftDistance: number;
  explanation: string;
}

/**
 * The Semantic Drift tool (V2.1 - OPTIMIZED)
 * Generates concepts that are semantically distant but contextually relevant
 */
export class SemanticDriftTool {
  private dreamGraph: DreamGraph;

  constructor(dreamGraph: DreamGraph) {
    this.dreamGraph = dreamGraph;
  }

  /**
   * V3.0: Calibrates requested drift magnitude to target actual distance
   * Corrects for historical overshooting/undershooting
   * 
   * Empirical observations:
   * - Low drift (0.0-0.4): Tends to overshoot by ~50-100%
   * - Mid drift (0.4-0.7): Fairly accurate
   * - High drift (0.7-1.0): Tends to undershoot by ~20-30%
   */
  private calibrateDriftMagnitude(requested: number, temperature: number): number {
    // Correction curve based on empirical data
    let calibrated = requested;
    
    if (requested < 0.4) {
      // Low drift: Apply dampening to prevent overshoot
      // 30% requested -> 30% actual (was 60%)
      calibrated = requested * 0.7; // Reduce by 30%
    } else if (requested >= 0.7) {
      // High drift: Apply boosting to prevent undershoot
      // 90% requested -> 90% actual (was 68%)
      const boost = (requested - 0.7) * 0.4; // Scale boost with magnitude
      calibrated = Math.min(1.0, requested + boost);
    }
    // Mid-range (0.4-0.7) already fairly accurate, no adjustment
    
    // Temperature adds controlled variance but shouldn't shift the target
    // Instead of shifting calibrated value, we'll use temperature differently
    return calibrated;
  }

  /**
   * V3.0: Calculates optimal number of hops for target distance
   * Prevents compounding that leads to overshooting
   */
  private calculateOptimalHops(calibratedMagnitude: number): number {
    // Fewer hops for low drift (prevents compounding)
    // More hops for high drift (allows reaching distant concepts)
    if (calibratedMagnitude < 0.3) {
      return 1; // Single hop for conservative drift
    } else if (calibratedMagnitude < 0.6) {
      return 2; // Two hops for moderate drift
    } else if (calibratedMagnitude < 0.8) {
      return 3; // Three hops for adventurous drift
    } else {
      return 4; // Four hops for maximum drift
    }
  }

  public performDrift(input: SemanticDriftInput): SemanticDriftOutput {
    const { anchorConcept, driftMagnitude, temperature = 0.7 } = input;

    // Validate input
    if (driftMagnitude < 0 || driftMagnitude > 1) {
      throw new Error("Drift magnitude must be between 0.0 and 1.0");
    }

    // V3.0: Apply calibration to correct overshooting/undershooting
    const calibratedMagnitude = this.calibrateDriftMagnitude(driftMagnitude, temperature);
    
    // Initialize drift state with loop detection
    const driftPath: string[] = [anchorConcept];
    let currentConcept = anchorConcept.toLowerCase().trim();
    const visitedConcepts = new Set<string>([currentConcept]);
    const explanationSteps: string[] = [];
    let totalDistanceTraveled = 0;

    // V3.0: Calculate optimal hops to prevent compounding
    const numberOfHops = this.calculateOptimalHops(calibratedMagnitude);

    // V3.0: Cross-domain chance now scales smoothly with calibrated magnitude
    const crossDomainChance = Math.max(0.1, Math.min(0.5, calibratedMagnitude * 0.5));

    explanationSteps.push(`Starting from: "${anchorConcept}"`);
    explanationSteps.push(
      `Drift magnitude: ${(driftMagnitude * 100).toFixed(0)}%`,
    );
    explanationSteps.push(
      `Temperature: ${(temperature * 100).toFixed(0)}%`,
    );
    explanationSteps.push(`\nDrift path:\n`);

    // Perform the drift with calibrated targeting
    for (let hop = 0; hop < numberOfHops; hop++) {
      // V3.0: Use calibrated magnitude directly, with minimal progressive boost
      // Reduced progressive factor to prevent compounding overshoots
      const hopMagnitude = calibratedMagnitude + (hop / numberOfHops) * 0.1;

      // Temperature-based chaos: sometimes skip ahead or jump domains
      const chaosRoll = Math.random();
      if (chaosRoll < crossDomainChance) {
        // Wild card! Jump to cross-domain bridge
        const bridge = this.selectCrossDomainBridge(
          currentConcept,
          hopMagnitude,
          visitedConcepts,
        );
        if (bridge) {
          currentConcept = bridge.concept;
          totalDistanceTraveled += bridge.distance;
          const cleanReason = (bridge.reason || "").replace(/^reverse: /, "");
          explanationSteps.push(
            `   [cross-domain leap] -> "${bridge.concept}"`,
          );
          explanationSteps.push(
            `      Distance: ${(bridge.distance * 100).toFixed(0)}% | ${cleanReason}`,
          );
          driftPath.push(currentConcept);
          visitedConcepts.add(currentConcept.toLowerCase().trim());
          continue;
        }
      }

      // Normal drift: select next concept based on calibrated hop magnitude
      const nextHop = this.findNextConcept(
        currentConcept,
        hopMagnitude,
        temperature,
        hop,
        numberOfHops,
        visitedConcepts,
      );

      // Loop detection: check if we're returning to anchor or visited concept
      if (
        nextHop.concept === currentConcept ||
        visitedConcepts.has(nextHop.concept.toLowerCase().trim())
      ) {
        // Stuck or looping! Try a domain jump
        const fallback = this.jumpToDomain(
          currentConcept,
          hopMagnitude,
          visitedConcepts,
        );
        currentConcept = fallback.concept;
        totalDistanceTraveled += fallback.distance;
        const cleanReason = (fallback.reason || "").replace(/^reverse: /, "");
        explanationSteps.push(`   [domain jump] -> "${fallback.concept}"`);
        explanationSteps.push(
          `      Distance: ${(fallback.distance * 100).toFixed(0)}% | ${cleanReason}`,
        );
      } else {
        currentConcept = nextHop.concept;
        totalDistanceTraveled += nextHop.distance;
        const cleanReason = (nextHop.reason || "").replace(/^reverse: /, "");
        explanationSteps.push(`   ${hop + 1}. "${currentConcept}"`);
        explanationSteps.push(
          `      Distance: ${(nextHop.distance * 100).toFixed(0)}% | ${cleanReason}`,
        );
      }

      driftPath.push(currentConcept);
      visitedConcepts.add(currentConcept.toLowerCase().trim());
    }

    // Calculate average distance traveled
    const avgDistance = totalDistanceTraveled / numberOfHops;
    
    // V3.0: Calculate drift accuracy (how close to requested)
    const driftAccuracy = 1.0 - Math.abs(avgDistance - driftMagnitude);
    const accuracyPercentage = driftAccuracy * 100;

    // Generate rich explanation with accuracy metrics
    const explanation = this.generateRichExplanation(
      anchorConcept,
      currentConcept,
      driftPath,
      driftMagnitude,
      avgDistance,
      explanationSteps,
      accuracyPercentage,
    );

    // Update dream graph
    this.updateDreamGraph(
      anchorConcept,
      currentConcept,
      driftPath,
      avgDistance,
    );

    return {
      newConcept: currentConcept,
      driftPath,
      driftDistance: avgDistance,
      explanation,
    };
  }

  /**
   * Finds the next concept based on drift magnitude and temperature
   * V2.1: Accepts visitedConcepts Set for loop detection
   */
  private findNextConcept(
    currentConcept: string,
    driftMagnitude: number,
    temperature: number,
    hopNumber: number,
    totalHops: number,
    visitedConcepts: Set<string>,
  ): WeightedAssociation {
    // Get all weighted associations for current concept
    const associations = this.getWeightedAssociations(currentConcept);

    if (associations.length === 0) {
      return {
        concept: currentConcept,
        distance: 0,
        reason: "no associations found",
      };
    }

    // Filter out visited concepts to prevent loops
    let unvisitedAssociations = associations.filter(
      (a) => !visitedConcepts.has(a.concept.toLowerCase().trim()),
    );

    // If all associations are visited, use all (we'll handle this in performDrift)
    if (unvisitedAssociations.length === 0) {
      unvisitedAssociations = associations;
    }

    // V3.0: Tighter distance targeting with calibrated ranges
    // Target a narrower band around the requested magnitude
    const targetBandwidth = 0.25; // Narrower than previous 0.4-0.9 range
    let targetMinDistance = Math.max(0, driftMagnitude - targetBandwidth * 0.5);
    let targetMaxDistance = Math.min(1.0, driftMagnitude + targetBandwidth * 0.5);
    
    // V3.0: Temperature adds proportional variance (not additive shift)
    // This maintains the target center while allowing exploration
    if (temperature < 0.3) {
      // Low temp: Deterministic, tighten band
      const tightening = 0.7;
      const center = (targetMinDistance + targetMaxDistance) / 2;
      const halfBand = (targetMaxDistance - targetMinDistance) / 2 * tightening;
      targetMinDistance = center - halfBand;
      targetMaxDistance = center + halfBand;
    } else if (temperature > 0.7) {
      // High temp: Widen band for exploration
      const widening = 1.4;
      const center = (targetMinDistance + targetMaxDistance) / 2;
      const halfBand = (targetMaxDistance - targetMinDistance) / 2 * widening;
      targetMinDistance = Math.max(0, center - halfBand);
      targetMaxDistance = Math.min(1.0, center + halfBand);
    }
    // Mid temp: Use band as-is

    // Filter candidates within target distance range
    let candidates = unvisitedAssociations.filter(
      (a) => a.distance >= targetMinDistance && a.distance <= targetMaxDistance,
    );

    // For high drift (0.7+), prefer associations with distance > 0.6
    if (driftMagnitude >= 0.7) {
      const highDistanceCandidates = unvisitedAssociations.filter(
        (a) => a.distance > 0.6,
      );
      if (highDistanceCandidates.length > 0) {
        candidates = highDistanceCandidates;
      }
    }

    // If no candidates in target range, expand range
    if (candidates.length === 0) {
      candidates = unvisitedAssociations.filter(
        (a) => a.distance >= targetMinDistance - 0.2,
      );
    }

    // Still no candidates? Just use all unvisited
    if (candidates.length === 0) {
      candidates = unvisitedAssociations;
    }

    // Select from candidates
    // Higher temperature = more random, lower = prefer higher distance
    let selected: WeightedAssociation;
    if (temperature > 0.5) {
      // Random selection
      selected = candidates[Math.floor(Math.random() * candidates.length)];
    } else {
      // Prefer higher distance within candidates
      candidates.sort((a, b) => b.distance - a.distance);
      const topN = Math.min(3, candidates.length);
      selected = candidates[Math.floor(Math.random() * topN)];
    }

    return selected;
  }

  /**
   * Gets all weighted associations for a concept
   */
  private getWeightedAssociations(concept: string): WeightedAssociation[] {
    const normalized = concept.toLowerCase().trim();

    // Direct lookup
    if (normalized in WEIGHTED_ASSOCIATIONS) {
      return WEIGHTED_ASSOCIATIONS[normalized];
    }

    // Reverse lookup: find concepts that mention this one
    const reverseAssociations: WeightedAssociation[] = [];
    for (const [word, associations] of Object.entries(WEIGHTED_ASSOCIATIONS)) {
      for (const assoc of associations) {
        if (assoc.concept.toLowerCase() === normalized) {
          // Found a concept that links to our current concept
          // Add the parent word as a potential next step
          reverseAssociations.push({
            concept: word,
            distance: assoc.distance,
            reason: assoc.reason || "",
          });
        }
      }
    }

    if (reverseAssociations.length > 0) {
      return reverseAssociations;
    }

    // Fallback: partial matching
    const partialMatches: WeightedAssociation[] = [];
    for (const [word, associations] of Object.entries(WEIGHTED_ASSOCIATIONS)) {
      if (word.includes(normalized) || normalized.includes(word)) {
        // Similar word, return its associations
        return associations;
      }
    }

    return partialMatches;
  }

  /**
   * Selects a cross-domain bridge for dramatic leaps
   * V2.1: Accepts visitedConcepts Set for loop detection
   */
  private selectCrossDomainBridge(
    currentConcept: string,
    driftMagnitude: number,
    visitedConcepts: Set<string>,
  ): WeightedAssociation | null {
    const normalized = currentConcept.toLowerCase();

    // Find bridges that start from current concept and lead to unvisited concepts
    const relevantBridges = CROSS_DOMAIN_BRIDGES.filter(
      (b) =>
        b.from.toLowerCase() === normalized &&
        b.distance >= driftMagnitude - 0.2 &&
        !visitedConcepts.has(b.to.toLowerCase()),
    );

    if (relevantBridges.length > 0) {
      const bridge =
        relevantBridges[Math.floor(Math.random() * relevantBridges.length)];
      return {
        concept: bridge.to,
        distance: bridge.distance,
        reason: bridge.reason,
      };
    }

    // Try reverse direction
    const reverseBridges = CROSS_DOMAIN_BRIDGES.filter(
      (b) =>
        b.to.toLowerCase() === normalized &&
        b.distance >= driftMagnitude - 0.2 &&
        !visitedConcepts.has(b.from.toLowerCase()),
    );

    if (reverseBridges.length > 0) {
      const bridge =
        reverseBridges[Math.floor(Math.random() * reverseBridges.length)];
      return {
        concept: bridge.from,
        distance: bridge.distance,
        reason: bridge.reason,
      };
    }

    // No specific bridge found, use a random high-distance one to unvisited concept
    if (driftMagnitude > 0.6 && CROSS_DOMAIN_BRIDGES.length > 0) {
      const highDistBridges = CROSS_DOMAIN_BRIDGES.filter(
        (b) => b.distance >= 0.7,
      );
      if (highDistBridges.length > 0) {
        const bridge =
          highDistBridges[Math.floor(Math.random() * highDistBridges.length)];
        const targetConcept = Math.random() > 0.5 ? bridge.to : bridge.from;

        // Only return if not visited
        if (!visitedConcepts.has(targetConcept.toLowerCase())) {
          return {
            concept: targetConcept,
            distance: bridge.distance,
            reason: bridge.reason,
          };
        }
      }
    }

    return null;
  }

  /**
   * Jumps to a random domain when stuck
   * V2.1: Accepts visitedConcepts Set for loop detection
   */
  private jumpToDomain(
    currentConcept: string,
    driftMagnitude: number,
    visitedConcepts: Set<string>,
  ): WeightedAssociation {
    // Pick a random concept from the dictionary that hasn't been visited
    const allConcepts = Object.keys(WEIGHTED_ASSOCIATIONS);
    const unvisitedConcepts = allConcepts.filter(
      (c) => !visitedConcepts.has(c.toLowerCase()),
    );

    // If all concepts visited (very unlikely), just pick any
    const conceptPool =
      unvisitedConcepts.length > 0 ? unvisitedConcepts : allConcepts;
    const randomConcept =
      conceptPool[Math.floor(Math.random() * conceptPool.length)];

    return {
      concept: randomConcept,
      distance: 0.5 + Math.random() * 0.3, // 0.5-0.8 distance for domain jumps
      reason: "exploratory domain jump",
    };
  }

  /**
   * Generates rich explanation with proper formatting
   */
  private generateRichExplanation(
    anchorConcept: string,
    finalConcept: string,
    driftPath: string[],
    requestedMagnitude: number,
    actualDistance: number,
    explanationSteps: string[],
    accuracyPercentage: number,
  ): string {
    let driftCharacter = "";
    if (requestedMagnitude < 0.3) {
      driftCharacter =
        "Conservative drift - staying close to familiar territory";
    } else if (requestedMagnitude < 0.6) {
      driftCharacter =
        "Moderate exploration - balancing familiarity with novelty";
    } else {
      driftCharacter =
        "Adventurous journey - seeking distant conceptual spaces";
    }

    const pathDescription =
      driftPath.length === 2
        ? "a direct connection"
        : `a ${driftPath.length - 1}-step journey`;

    // V3.0: Accuracy indicator
    const accuracyIndicator = accuracyPercentage >= 85 ? "Excellent" :
                               accuracyPercentage >= 70 ? "Good" :
                               accuracyPercentage >= 50 ? "Fair" : "Needs adjustment";
    
    const explanationLines = [
      "=== Semantic Drift Analysis v3.0 ===",
      "",
      ...explanationSteps,
      "",
      "Drift characteristics:",
      `- Strategy: ${driftCharacter}`,
      `- Requested magnitude: ${(requestedMagnitude * 100).toFixed(0)}%`,
      `- Actual distance traveled: ${(actualDistance * 100).toFixed(0)}%`,
      `- Drift accuracy: ${accuracyPercentage.toFixed(0)}% (${accuracyIndicator})`,
      `- Path length: ${pathDescription}`,
      `- Full path: ${driftPath.join(" -> ")}`,
      "",
      "Why this drift matters:",
      `Starting from "${anchorConcept}", this semantic drift has brought`,
      `us to "${finalConcept}" - a concept that is ${
        actualDistance < 0.3
          ? "closely related and offers a complementary angle"
          : actualDistance < 0.6
            ? "semantically adjacent yet distinct enough to spark new thinking"
            : "surprisingly distant yet connected through creative conceptual bridges"
      }.`,
      "",
      "Potential insights:",
      this.generateInsights(anchorConcept, finalConcept, actualDistance, driftPath),
      "",
      "Creative prompt:",
      `Consider how the principles, patterns, or properties of "${finalConcept}" could illuminate new aspects of "${anchorConcept}".`,
      `What if you treated "${anchorConcept}" as if it were "${finalConcept}"?`,
      "",
      "Drift complete. Use this connection to break assumptions.",
    ];

    return explanationLines.join("\n");
  }

  /**
   * Generates contextual insights about the drift
   */
  private generateInsights(
    fromConcept: string,
    toConcept: string,
    distance: number,
    path: string[],
  ): string {
    const insights: string[] = [];

    if (distance < 0.4) {
      insights.push(
        `- The proximity between "${fromConcept}" and "${toConcept}" suggests`,
      );
      insights.push(
        `  examining shared structural properties or mechanisms.`,
      );
      insights.push(`- Look for direct analogies and parallel patterns.`);
    } else if (distance < 0.7) {
      insights.push(
        `- This medium-distance connection invites metaphorical thinking.`,
      );
      insights.push(
        `- The path ${path.slice(1, -1).join(" -> ")} reveals hidden bridges`,
      );
      insights.push(`  between seemingly separate domains.`);
      insights.push(
        `- Consider how "${toConcept}" might reframe "${fromConcept}".`,
      );
    } else {
      insights.push(
        `- This is a bisociative leap - connecting distant matrices!`,
      );
      insights.push(
        `- The surprise value is high: "${toConcept}" disrupts conventional`,
      );
      insights.push(`  thinking about "${fromConcept}".`);
      insights.push(
        `- Use this collision to generate novel hypotheses or approaches.`,
      );
    }

    // Add path-specific insight
    if (path.length > 3) {
      const middle = path[Math.floor(path.length / 2)];
      insights.push(
        `- The pivot through "${middle}" suggests an intermediary concept`,
      );
      insights.push(`  that might bridge the two domains.`);
    }

    return insights.join("\n");
  }

  /**
   * Updates the dream graph with new nodes and edges
   */
  private updateDreamGraph(
    anchorConcept: string,
    newConcept: string,
    driftPath: string[],
    avgDistance: number,
  ): void {
    const timestamp = Date.now();
    const anchorId = `drift-anchor-${timestamp}-${Math.floor(Math.random() * 10000)}`;
    const newConceptId = `drift-result-${timestamp}-${Math.floor(Math.random() * 10000)}`;

    try {
      this.dreamGraph.addNode({
        id: anchorId,
        content: anchorConcept,
        creationTimestamp: timestamp,
        source: "semantic_drift",
        metadata: {
          role: "anchor",
          pathLength: driftPath.length,
        },
      });
    } catch (error) {
      // Node might already exist
    }

    try {
      this.dreamGraph.addNode({
        id: newConceptId,
        content: newConcept,
        creationTimestamp: timestamp,
        driftDistance: avgDistance,
        source: "semantic_drift",
        metadata: {
          role: "drifted_concept",
          driftPath,
          anchorConcept,
          avgDistance,
        },
      });
    } catch (error) {
      // Ignore errors
    }

    try {
      this.dreamGraph.addEdge({
        source: anchorId,
        target: newConceptId,
        type: EdgeType.TRANSFORMS_INTO,
        weight: 1.0 - avgDistance,
        metadata: {
          driftPath,
          pathLength: driftPath.length,
          avgDistance,
        },
      });
    } catch (error) {
      // Ignore errors
    }

    try {
      this.dreamGraph.visitNode(newConceptId);
    } catch (error) {
      // Ignore errors
    }
  }
}
