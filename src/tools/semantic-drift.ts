/**
 * Semantic Drift - Controlled Hallucination Engine (V4.0 - LLM-SCAFFOLDED)
 *
 * This tool implements a stochastic random walk through the concept space,
 * seeking semantically distant yet contextually relevant concepts.
 *
 * V4.0 MAJOR REFACTOR:
 * - Outputs LLM SCAFFOLDS instead of template strings
 * - Semantic distance is now EMERGENT from LLM reasoning, not hard-coded
 * - "Because chains" make every leap traceable
 * - Each drift includes reasoning the LLM must provide
 * - Server provides STRUCTURE (constraints, distance targets), LLM provides CREATIVITY
 *
 * PHILOSOPHY CHANGE:
 * Old: Hard-coded association table with arbitrary distance weights
 * New: LLM generates the actual semantic leap, constrained by drift parameters
 *
 * The associations table is now used for HINTS and FALLBACKS, not as the
 * source of creativity. The LLM is the creative engine.
 */

import { DreamGraph, Node, EdgeType } from "../graph.js";
import {
  generateSemanticLeapScaffold,
  formatScaffoldAsPrompt,
  CreativeScaffold,
} from "../prompts/creative-scaffolds.js";

/**
 * Association hint - used to suggest directions, not determine them
 */
interface AssociationHint {
  concept: string;
  direction: string; // Description of the associative direction
  distanceRange: [number, number]; // Approximate semantic distance range
}

/**
 * Lightweight hints for common concepts - guides LLM exploration
 * These are SUGGESTIONS, not deterministic mappings
 */
const ASSOCIATION_HINTS: Record<string, AssociationHint[]> = {
  // AI & Tech
  "neural network": [
    {
      concept: "biological systems",
      direction: "toward organic inspiration",
      distanceRange: [0.3, 0.5],
    },
    {
      concept: "social structures",
      direction: "toward collective intelligence",
      distanceRange: [0.6, 0.8],
    },
    {
      concept: "musical composition",
      direction: "toward pattern and harmony",
      distanceRange: [0.7, 0.9],
    },
  ],
  algorithm: [
    {
      concept: "recipes and procedures",
      direction: "toward sequential instruction",
      distanceRange: [0.2, 0.4],
    },
    {
      concept: "natural processes",
      direction: "toward emergent computation",
      distanceRange: [0.5, 0.7],
    },
    {
      concept: "ritual and ceremony",
      direction: "toward prescribed action with meaning",
      distanceRange: [0.7, 0.9],
    },
  ],
  creativity: [
    {
      concept: "biological mutation",
      direction: "toward random variation",
      distanceRange: [0.5, 0.7],
    },
    {
      concept: "play and exploration",
      direction: "toward unconstrained discovery",
      distanceRange: [0.3, 0.5],
    },
    {
      concept: "destruction and chaos",
      direction: "toward breaking existing patterns",
      distanceRange: [0.6, 0.8],
    },
  ],
  problem: [
    {
      concept: "physical obstacles",
      direction: "toward tangible barriers",
      distanceRange: [0.3, 0.5],
    },
    {
      concept: "puzzles and games",
      direction: "toward structured challenge",
      distanceRange: [0.4, 0.6],
    },
    {
      concept: "growth opportunities",
      direction: "toward reframing as potential",
      distanceRange: [0.6, 0.8],
    },
  ],
  system: [
    {
      concept: "organisms",
      direction: "toward living complexity",
      distanceRange: [0.4, 0.6],
    },
    {
      concept: "machines",
      direction: "toward mechanical function",
      distanceRange: [0.2, 0.4],
    },
    {
      concept: "ecosystems",
      direction: "toward interdependent networks",
      distanceRange: [0.5, 0.7],
    },
  ],
  innovation: [
    {
      concept: "evolution",
      direction: "toward adaptive change",
      distanceRange: [0.4, 0.6],
    },
    {
      concept: "accidents and serendipity",
      direction: "toward unexpected discovery",
      distanceRange: [0.6, 0.8],
    },
    {
      concept: "rebellion",
      direction: "toward breaking conventions",
      distanceRange: [0.5, 0.7],
    },
  ],
  network: [
    {
      concept: "mycelium",
      direction: "toward underground connection",
      distanceRange: [0.6, 0.8],
    },
    {
      concept: "social relationships",
      direction: "toward human connection",
      distanceRange: [0.4, 0.6],
    },
    {
      concept: "transportation",
      direction: "toward physical flow",
      distanceRange: [0.5, 0.7],
    },
  ],
  pattern: [
    {
      concept: "music and rhythm",
      direction: "toward temporal structure",
      distanceRange: [0.5, 0.7],
    },
    {
      concept: "natural forms",
      direction: "toward organic geometry",
      distanceRange: [0.4, 0.6],
    },
    {
      concept: "behavior and habit",
      direction: "toward repeated action",
      distanceRange: [0.3, 0.5],
    },
  ],
  flow: [
    {
      concept: "water and rivers",
      direction: "toward natural movement",
      distanceRange: [0.2, 0.4],
    },
    {
      concept: "consciousness",
      direction: "toward mental states",
      distanceRange: [0.6, 0.8],
    },
    {
      concept: "traffic and logistics",
      direction: "toward managed movement",
      distanceRange: [0.4, 0.6],
    },
  ],
  structure: [
    {
      concept: "architecture",
      direction: "toward built form",
      distanceRange: [0.2, 0.4],
    },
    {
      concept: "skeleton and bone",
      direction: "toward biological support",
      distanceRange: [0.4, 0.6],
    },
    {
      concept: "social hierarchy",
      direction: "toward organizational form",
      distanceRange: [0.5, 0.7],
    },
  ],
};

/**
 * Cross-domain bridge suggestions for high drift
 */
const CROSS_DOMAIN_BRIDGES = [
  {
    from: "technology",
    to: "mythology",
    bridge: "stories we tell about our tools",
  },
  { from: "business", to: "ecology", bridge: "resource flows and competition" },
  { from: "art", to: "science", bridge: "pattern recognition and beauty" },
  {
    from: "medicine",
    to: "architecture",
    bridge: "systems that heal and protect",
  },
  {
    from: "music",
    to: "mathematics",
    bridge: "harmonic structures and ratios",
  },
  {
    from: "cooking",
    to: "chemistry",
    bridge: "transformations through combination",
  },
  {
    from: "gardening",
    to: "software",
    bridge: "cultivation and growth patterns",
  },
  { from: "martial arts", to: "negotiation", bridge: "leverage and balance" },
  { from: "theater", to: "management", bridge: "roles, timing, and audience" },
  { from: "jazz", to: "startups", bridge: "improvisation within structure" },
];

// Types for the semantic drift tool
export interface SemanticDriftInput {
  anchorConcept: string;
  driftMagnitude: number; // 0.0 to 1.0, how "far" to drift
  temperature?: number; // Optional: additional randomness (0.0 to 1.0)
}

export interface SemanticDriftOutput {
  /** LLM scaffold for semantic leap */
  scaffold: CreativeScaffold;

  /** Formatted prompt ready for Claude to process */
  llmPrompt: string;

  /** Suggested direction for drift exploration (guidance, not a result) */
  suggestedDirection: string;

  /** Exploration path with guidance (hints for LLM) */
  explorationPath: string[];

  /** Target drift distance */
  driftDistance: number;

  /** Association hints relevant to this anchor */
  associationHints: AssociationHint[];

  /** Cross-domain bridge suggestions (for high drift) */
  bridgeSuggestions: string[];

  /** Full explanation */
  explanation: string;
}

/**
 * The Semantic Drift tool (V4.0 - LLM-SCAFFOLDED)
 * Returns prompts that guide Claude to make genuine semantic leaps
 */
export class SemanticDriftTool {
  private dreamGraph: DreamGraph;

  constructor(dreamGraph: DreamGraph) {
    this.dreamGraph = dreamGraph;
  }

  public performDrift(input: SemanticDriftInput): SemanticDriftOutput {
    const { anchorConcept, driftMagnitude, temperature = 0.7 } = input;

    // Validate input
    if (driftMagnitude < 0 || driftMagnitude > 1) {
      throw new Error("Drift magnitude must be between 0.0 and 1.0");
    }

    // Get association hints for this anchor
    const associationHints = this.getAssociationHints(
      anchorConcept,
      driftMagnitude,
    );

    // Get cross-domain bridge suggestions for high drift
    const bridgeSuggestions =
      driftMagnitude > 0.6 ? this.getCrossDomainBridges(anchorConcept) : [];

    // Generate the LLM scaffold
    const scaffold = generateSemanticLeapScaffold(
      anchorConcept,
      driftMagnitude,
      anchorConcept, // Use anchor as context
      temperature,
    );

    // Format as prompt
    const llmPrompt = formatScaffoldAsPrompt(scaffold);

    // Generate suggested direction based on hints (NOT a fake result)
    const { suggestedDirection, explorationPath } = this.generateDriftGuidance(
      anchorConcept,
      driftMagnitude,
      associationHints,
      bridgeSuggestions,
    );

    // Create explanation
    const explanation = this.createExplanation(
      anchorConcept,
      driftMagnitude,
      temperature,
      associationHints,
      bridgeSuggestions,
    );

    // Update dream graph with scaffold metadata (not fake concepts)
    this.updateDreamGraph(
      anchorConcept,
      suggestedDirection,
      explorationPath,
      driftMagnitude,
    );

    return {
      scaffold,
      llmPrompt,
      suggestedDirection, // HONEST: This is a suggestion, not a result
      explorationPath,
      driftDistance: driftMagnitude,
      associationHints,
      bridgeSuggestions,
      explanation,
    };
  }

  /**
   * Get association hints relevant to the anchor concept
   */
  private getAssociationHints(
    anchor: string,
    driftMagnitude: number,
  ): AssociationHint[] {
    const normalized = anchor.toLowerCase().trim();
    const hints: AssociationHint[] = [];

    // Direct lookup
    if (normalized in ASSOCIATION_HINTS) {
      hints.push(...ASSOCIATION_HINTS[normalized]);
    }

    // Partial match lookup
    for (const [key, keyHints] of Object.entries(ASSOCIATION_HINTS)) {
      if (
        key !== normalized &&
        (normalized.includes(key) || key.includes(normalized))
      ) {
        hints.push(...keyHints);
      }
    }

    // Filter by drift magnitude
    const filteredHints = hints.filter((h) => {
      const [min, max] = h.distanceRange;
      // Allow some tolerance around the target drift magnitude
      return driftMagnitude >= min - 0.2 && driftMagnitude <= max + 0.2;
    });

    // If no hints match, return general hints
    if (filteredHints.length === 0) {
      return this.generateGenericHints(driftMagnitude);
    }

    return filteredHints.slice(0, 5);
  }

  /**
   * Generate generic hints when no specific hints are available
   */
  private generateGenericHints(driftMagnitude: number): AssociationHint[] {
    if (driftMagnitude < 0.4) {
      return [
        {
          concept: "close synonyms and variants",
          direction: "toward nearby semantic space",
          distanceRange: [0.1, 0.3],
        },
        {
          concept: "direct examples and instances",
          direction: "toward concrete manifestations",
          distanceRange: [0.2, 0.4],
        },
      ];
    } else if (driftMagnitude < 0.7) {
      return [
        {
          concept: "related domains",
          direction: "toward adjacent fields",
          distanceRange: [0.4, 0.6],
        },
        {
          concept: "structural analogies",
          direction: "toward similar patterns in different contexts",
          distanceRange: [0.5, 0.7],
        },
        {
          concept: "metaphorical connections",
          direction: "toward figurative mappings",
          distanceRange: [0.5, 0.7],
        },
      ];
    } else {
      return [
        {
          concept: "distant domains",
          direction: "toward radically different fields",
          distanceRange: [0.7, 0.9],
        },
        {
          concept: "paradoxical opposites",
          direction: "toward surprising inversions",
          distanceRange: [0.8, 1.0],
        },
        {
          concept: "cross-cultural analogies",
          direction: "toward alternative worldviews",
          distanceRange: [0.7, 0.9],
        },
      ];
    }
  }

  /**
   * Get cross-domain bridge suggestions
   */
  private getCrossDomainBridges(anchor: string): string[] {
    const normalized = anchor.toLowerCase();
    const suggestions: string[] = [];

    for (const bridge of CROSS_DOMAIN_BRIDGES) {
      // Check if anchor might relate to either side of the bridge
      if (
        normalized.includes(bridge.from) ||
        normalized.includes(bridge.to) ||
        Math.random() > 0.7
      ) {
        suggestions.push(`${bridge.from} ↔ ${bridge.to}: ${bridge.bridge}`);
      }
    }

    // Always include at least 2-3 random bridges for inspiration
    while (suggestions.length < 3) {
      const randomBridge =
        CROSS_DOMAIN_BRIDGES[
          Math.floor(Math.random() * CROSS_DOMAIN_BRIDGES.length)
        ];
      const bridgeStr = `${randomBridge.from} ↔ ${randomBridge.to}: ${randomBridge.bridge}`;
      if (!suggestions.includes(bridgeStr)) {
        suggestions.push(bridgeStr);
      }
    }

    return suggestions.slice(0, 5);
  }

  /**
   * Generate suggested drift direction based on hints
   * Returns guidance, not fake results
   */
  private generateDriftGuidance(
    anchor: string,
    driftMagnitude: number,
    hints: AssociationHint[],
    bridges: string[],
  ): { suggestedDirection: string; explorationPath: string[] } {
    const path = [anchor];

    // For high drift, suggest bridge exploration
    if (driftMagnitude > 0.7 && bridges.length > 0) {
      const bridge = bridges[0]; // Use first, not random
      path.push(`Consider cross-domain bridge: ${bridge}`);
      return {
        suggestedDirection: `High-magnitude drift (${(driftMagnitude * 100).toFixed(0)}%) - explore cross-domain connections like: ${bridge}`,
        explorationPath: path,
      };
    }

    // For medium drift, use hints
    if (hints.length > 0) {
      const hint = hints[0]; // Use first, not random
      path.push(`Direction: ${hint.direction}`);
      path.push(`Suggestion: ${hint.concept}`);
      return {
        suggestedDirection: `"${anchor}" explored ${hint.direction} toward concepts like "${hint.concept}"`,
        explorationPath: path,
      };
    }

    // Generic fallback
    const distanceDesc =
      driftMagnitude < 0.4
        ? "nearby"
        : driftMagnitude < 0.7
          ? "moderate"
          : "distant";
    return {
      suggestedDirection: `Seeking ${distanceDesc} semantic neighbors of "${anchor}" (${(driftMagnitude * 100).toFixed(0)}% drift)`,
      explorationPath: [anchor, `Target: ${distanceDesc} drift exploration`],
    };
  }

  /**
   * Create explanation of the output
   */
  private createExplanation(
    anchor: string,
    driftMagnitude: number,
    temperature: number,
    hints: AssociationHint[],
    bridges: string[],
  ): string {
    const distanceDesc =
      driftMagnitude < 0.4
        ? "CONSERVATIVE (nearby neighbors)"
        : driftMagnitude < 0.7
          ? "MODERATE (related but distinct domains)"
          : "ADVENTUROUS (cross-domain leaps)";

    const tempDesc =
      temperature < 0.4
        ? "LOW (prefer structured connections)"
        : temperature < 0.7
          ? "MEDIUM (balance structure and surprise)"
          : "HIGH (embrace randomness)";

    return `SEMANTIC DRIFT SCAFFOLD

This output guides Claude to make a GENUINE semantic leap, not a template-filled result.

ANCHOR: "${anchor}"
DRIFT MAGNITUDE: ${(driftMagnitude * 100).toFixed(0)}% - ${distanceDesc}
TEMPERATURE: ${(temperature * 100).toFixed(0)}% - ${tempDesc}

ASSOCIATION HINTS (suggestions, not deterministic):
${hints.map((h) => `  • ${h.concept} (${h.direction})`).join("\n")}

${
  bridges.length > 0
    ? `CROSS-DOMAIN BRIDGES (for high drift):
${bridges.map((b) => `  ⟷ ${b}`).join("\n")}`
    : ""
}

KEY CHANGES FROM V3:
1. Semantic distance is now EMERGENT from LLM reasoning
2. Each drift requires a "because chain" explaining the connection
3. The destination must be justified, not just random
4. Hints guide exploration but don't determine output

The 'llmPrompt' field contains a complete prompt that will generate:
- The actual destination concept (not a template)
- The drift path with reasoning at each step
- Why this connection is meaningful (not just clever)
- How this reframes the original anchor`;
  }

  /**
   * Update dream graph with scaffold metadata
   * Records the prompt/scaffold, not fake results
   */
  private updateDreamGraph(
    anchor: string,
    suggestedDirection: string,
    explorationPath: string[],
    driftMagnitude: number,
  ): void {
    const timestamp = Date.now();
    const anchorId = `drift-anchor-${timestamp}`;
    const scaffoldId = `drift-scaffold-${timestamp}`;

    try {
      // Add anchor concept
      this.dreamGraph.addNode({
        id: anchorId,
        content: anchor,
        creationTimestamp: timestamp,
        source: "semantic_drift",
        metadata: {
          role: "anchor",
          driftMagnitude,
        },
      });
    } catch (error) {
      // Node might already exist
    }

    try {
      // Add scaffold metadata (not a fake concept)
      this.dreamGraph.addNode({
        id: scaffoldId,
        content: `Semantic drift scaffold: ${suggestedDirection}`,
        creationTimestamp: timestamp,
        source: "semantic_drift",
        metadata: {
          role: "scaffold",
          type: "semantic_drift",
          anchorConcept: anchor,
          driftMagnitude,
          explorationPath,
          isScaffold: true, // This is a scaffold, not a concept
        },
      });

      // Link anchor to scaffold
      this.dreamGraph.addEdge({
        source: anchorId,
        target: scaffoldId,
        type: EdgeType.TRANSFORMS_INTO,
        weight: 1.0 - driftMagnitude,
        metadata: {
          explorationPath,
          driftMagnitude,
          scaffoldType: "semantic_drift",
        },
      });

      this.dreamGraph.visitNode(scaffoldId);
    } catch (error) {
      // Silently ignore graph errors (non-critical)
    }
  }
}
