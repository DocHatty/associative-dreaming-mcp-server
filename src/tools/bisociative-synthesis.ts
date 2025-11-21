/**
 * Bisociative Synthesis - The Combinatorial Engine (V3.0 - LLM-SCAFFOLDED)
 *
 * This tool forces the intersection of two unrelated matrices of thought.
 * Based on Arthur Koestler's theory of Bisociation and Conceptual Blending Theory.
 *
 * V3.0 MAJOR REFACTOR:
 * - Outputs are now LLM SCAFFOLDS, not template-filled strings
 * - The server provides STRUCTURE, Claude provides INSIGHT
 * - Each output includes a structured prompt for genuine creative reasoning
 * - "Because chains" force justification of connections
 * - Grounded in user's actual context, not generic mappings
 */

import { DreamGraph, Node, EdgeType } from "../graph.js";
import {
  generateBisociativeBridgeScaffold,
  formatScaffoldAsPrompt,
  CreativeScaffold,
} from "../prompts/creative-scaffolds.js";

// Domain knowledge - used to SELECT domains and provide hints, not to generate output
const DOMAINS = [
  {
    name: "biology",
    keywords: [
      "evolution",
      "ecosystem",
      "cell",
      "organism",
      "adaptation",
      "metabolism",
      "symbiosis",
      "homeostasis",
      "mutation",
      "natural selection",
    ],
    structuralPatterns: [
      "hierarchical organization",
      "feedback loops",
      "distributed networks",
      "emergent properties",
      "specialization",
      "redundancy",
      "modularity",
      "self-organization",
      "co-evolution",
    ],
  },
  {
    name: "architecture",
    keywords: [
      "structure",
      "form",
      "function",
      "space",
      "material",
      "aesthetic",
      "context",
      "scale",
      "proportion",
      "rhythm",
      "balance",
    ],
    structuralPatterns: [
      "load-bearing systems",
      "circulation patterns",
      "modular components",
      "layers",
      "symmetry",
      "negative space",
      "environmental integration",
      "spatial hierarchy",
    ],
  },
  {
    name: "music",
    keywords: [
      "harmony",
      "rhythm",
      "melody",
      "timbre",
      "composition",
      "dynamics",
      "texture",
      "tempo",
      "counterpoint",
      "resolution",
      "theme",
      "motif",
    ],
    structuralPatterns: [
      "patterns",
      "repetition with variation",
      "layering",
      "tension and release",
      "call and response",
      "transitions",
      "development",
      "theme and variation",
    ],
  },
  {
    name: "economics",
    keywords: [
      "market",
      "value",
      "exchange",
      "scarcity",
      "efficiency",
      "incentive",
      "competition",
      "equilibrium",
      "growth",
      "distribution",
      "trade",
      "utility",
    ],
    structuralPatterns: [
      "feedback mechanisms",
      "flows",
      "game theory",
      "network effects",
      "optimization",
      "resource allocation",
      "supply chains",
      "price signals",
    ],
  },
  {
    name: "mythology",
    keywords: [
      "archetype",
      "hero",
      "journey",
      "transformation",
      "symbol",
      "ritual",
      "divine",
      "mortal",
      "underworld",
      "creation",
      "destruction",
      "trickster",
    ],
    structuralPatterns: [
      "cyclical patterns",
      "opposing forces",
      "symbolic representations",
      "narrative arcs",
      "thresholds",
      "tests",
      "death and rebirth",
      "quest structure",
    ],
  },
  {
    name: "game design",
    keywords: [
      "rules",
      "mechanics",
      "balance",
      "progression",
      "engagement",
      "challenge",
      "feedback",
      "player agency",
      "reward",
      "strategy",
      "emergence",
    ],
    structuralPatterns: [
      "core loops",
      "risk/reward systems",
      "decision trees",
      "progression curves",
      "balance triangles",
      "economies",
      "state machines",
      "skill expression",
    ],
  },
  {
    name: "urban planning",
    keywords: [
      "density",
      "connectivity",
      "zoning",
      "public space",
      "transit",
      "growth",
      "community",
      "infrastructure",
      "mixed-use",
      "walkability",
    ],
    structuralPatterns: [
      "grid patterns",
      "hub-and-spoke",
      "organic growth",
      "layered networks",
      "spatial hierarchy",
      "land use patterns",
      "transit-oriented development",
    ],
  },
  {
    name: "jazz improvisation",
    keywords: [
      "spontaneity",
      "conversation",
      "theme",
      "variation",
      "syncopation",
      "swing",
      "call and response",
      "blue notes",
      "tension",
      "release",
      "solo",
    ],
    structuralPatterns: [
      "cyclical structures",
      "question and answer",
      "building intensity",
      "thematic development",
      "motivic variation",
      "polyrhythm",
      "space and density",
    ],
  },
  {
    name: "immune system",
    keywords: [
      "recognition",
      "response",
      "memory",
      "specificity",
      "tolerance",
      "adaptation",
      "surveillance",
      "elimination",
      "antibody",
      "antigen",
    ],
    structuralPatterns: [
      "distributed detection",
      "cascade amplification",
      "memory storage",
      "pattern recognition",
      "adaptive response",
      "multilayered defense",
      "self-regulation",
    ],
  },
  {
    name: "supply chain",
    keywords: [
      "procurement",
      "logistics",
      "inventory",
      "distribution",
      "lead time",
      "bottleneck",
      "throughput",
      "optimization",
      "resilience",
      "visibility",
    ],
    structuralPatterns: [
      "network topology",
      "push vs pull",
      "just-in-time",
      "hub-and-spoke",
      "flow optimization",
      "buffer management",
      "information flow",
      "constraint management",
    ],
  },
  {
    name: "gardening",
    keywords: [
      "cultivation",
      "soil",
      "season",
      "pruning",
      "nurturing",
      "patience",
      "succession",
      "companion planting",
      "harvest",
      "perennial",
      "composting",
    ],
    structuralPatterns: [
      "cyclical processes",
      "layered systems",
      "succession planning",
      "symbiotic relationships",
      "resource cycling",
      "timing coordination",
      "spatial arrangement",
    ],
  },
  {
    name: "theater",
    keywords: [
      "performance",
      "character",
      "conflict",
      "resolution",
      "tension",
      "climax",
      "subtext",
      "blocking",
      "timing",
      "ensemble",
      "improvisation",
    ],
    structuralPatterns: [
      "dramatic arc",
      "act structure",
      "scene progression",
      "character development",
      "tension building",
      "ensemble dynamics",
      "stage composition",
      "rhythm and pacing",
    ],
  },
  {
    name: "martial arts",
    keywords: [
      "balance",
      "center",
      "flow",
      "timing",
      "distance",
      "leverage",
      "awareness",
      "adaptation",
      "technique",
      "principle",
      "efficiency",
    ],
    structuralPatterns: [
      "circular motion",
      "redirection",
      "momentum transfer",
      "rhythm disruption",
      "spatial control",
      "progressive refinement",
      "principle-based response",
      "energy management",
    ],
  },
  {
    name: "storytelling",
    keywords: [
      "narrative",
      "character",
      "conflict",
      "arc",
      "transformation",
      "stakes",
      "theme",
      "pacing",
      "hook",
      "payoff",
      "tension",
      "resolution",
    ],
    structuralPatterns: [
      "three-act structure",
      "hero's journey",
      "nested loops",
      "parallel threads",
      "setup and payoff",
      "escalation",
      "cause and effect",
      "emotional beats",
    ],
  },
  {
    name: "epidemiology",
    keywords: [
      "transmission",
      "reproduction rate",
      "susceptible",
      "infected",
      "recovered",
      "vector",
      "outbreak",
      "containment",
      "immunity",
      "contact tracing",
    ],
    structuralPatterns: [
      "network propagation",
      "exponential growth",
      "threshold dynamics",
      "spatial spread patterns",
      "intervention strategies",
      "herd immunity",
      "super-spreader events",
    ],
  },
];

// Structural pattern hints for different isomorphic patterns
const ISOMORPHIC_PATTERNS = [
  {
    name: "hierarchy",
    hints: ["levels", "containment", "abstraction", "delegation", "emergence"],
  },
  {
    name: "network",
    hints: ["nodes", "edges", "topology", "connectivity", "flow", "hubs"],
  },
  {
    name: "cycle",
    hints: ["repetition", "rhythm", "periodicity", "return", "renewal"],
  },
  {
    name: "emergence",
    hints: [
      "collective behavior",
      "self-organization",
      "higher-order properties",
    ],
  },
  {
    name: "feedback",
    hints: ["reinforcement", "dampening", "amplification", "stability"],
  },
  {
    name: "symmetry-breaking",
    hints: ["differentiation", "specialization", "contrast", "divergence"],
  },
  {
    name: "tension-resolution",
    hints: ["build-up", "release", "equilibrium", "expectation"],
  },
  {
    name: "layering",
    hints: [
      "abstraction",
      "encapsulation",
      "interface",
      "separation of concerns",
    ],
  },
  {
    name: "flow",
    hints: ["throughput", "bottleneck", "velocity", "obstruction", "pathway"],
  },
  {
    name: "call-response",
    hints: [
      "dialogue",
      "reciprocity",
      "turn-taking",
      "exchange",
      "interaction",
    ],
  },
];

// Types for the bisociative synthesis tool
export interface BisociativeSynthesisInput {
  matrixA: string;
  matrixB?: string;
  blendType?: string;
}

export interface BisociativeSynthesisOutput {
  /** LLM scaffold for genuine insight generation */
  scaffold: CreativeScaffold;

  /** Formatted prompt ready for Claude to process */
  llmPrompt: string;

  /** The two domains being connected */
  matrixA: string;
  matrixB: string;

  /** Suggested structural pattern for exploration */
  suggestedPattern: string;

  /** Pattern hints to guide the LLM */
  patternHints: string[];

  /** Explanation of what the LLM should do */
  explanation: string;
}

/**
 * The Bisociative Synthesis tool (V3.0 - LLM-SCAFFOLDED)
 * Returns prompts that guide Claude toward genuine insight, not pre-filled templates
 */
export class BisociativeSynthesisTool {
  private dreamGraph: DreamGraph;

  constructor(dreamGraph: DreamGraph) {
    this.dreamGraph = dreamGraph;
  }

  public performSynthesis(
    input: BisociativeSynthesisInput,
  ): BisociativeSynthesisOutput {
    const { matrixA, matrixB, blendType } = input;

    if (!matrixA || matrixA.trim() === "") {
      throw new Error("Matrix A (problem domain) is required");
    }

    // Select or validate matrixB - choose a domain that's genuinely different
    const selectedMatrixB = matrixB || this.selectComplementaryDomain(matrixA);

    // Identify the best structural pattern to suggest
    const patternInfo = this.identifyPattern(
      matrixA,
      selectedMatrixB,
      blendType,
    );

    // Generate the LLM scaffold - this is the key change
    const scaffold = generateBisociativeBridgeScaffold(
      matrixA,
      selectedMatrixB,
      matrixA, // Use matrixA as the user context for now
      patternInfo.name,
    );

    // Format the scaffold as a prompt
    const llmPrompt = formatScaffoldAsPrompt(scaffold);

    // Create explanation
    const explanation = this.createExplanation(
      matrixA,
      selectedMatrixB,
      patternInfo,
    );

    // Update graph with scaffold metadata (not fake concepts)
    this.updateDreamGraph(matrixA, selectedMatrixB, patternInfo.name);

    return {
      scaffold,
      llmPrompt,
      matrixA,
      matrixB: selectedMatrixB,
      suggestedPattern: patternInfo.name,
      patternHints: patternInfo.hints,
      explanation,
    };
  }

  /**
   * Selects a complementary domain that's genuinely different from matrixA
   */
  private selectComplementaryDomain(matrixA: string): string {
    const normalized = matrixA.toLowerCase();

    // Score domains by how DIFFERENT they are from matrixA
    const scoredDomains = DOMAINS.map((domain) => {
      let similarityScore = 0;

      // Check keyword overlap
      for (const keyword of domain.keywords) {
        if (normalized.includes(keyword) || keyword.includes(normalized)) {
          similarityScore += 10;
        }
      }

      // Check if domain name appears in query
      if (
        normalized.includes(domain.name) ||
        domain.name.includes(normalized)
      ) {
        similarityScore += 20;
      }

      // Add randomness to avoid always picking the same domain
      const randomness = Math.random() * 5;

      return {
        domain: domain.name,
        difference: 100 - similarityScore + randomness,
      };
    });

    // Sort by difference (most different first)
    scoredDomains.sort((a, b) => b.difference - a.difference);

    // Pick from the top 3 most different domains randomly
    const topDomains = scoredDomains.slice(0, 3);
    return topDomains[Math.floor(Math.random() * topDomains.length)].domain;
  }

  /**
   * Identify the best structural pattern for this pair
   */
  private identifyPattern(
    matrixA: string,
    matrixB: string,
    preferredPattern?: string,
  ): (typeof ISOMORPHIC_PATTERNS)[0] {
    // If preferred pattern specified and valid, use it
    if (preferredPattern) {
      const pattern = ISOMORPHIC_PATTERNS.find(
        (p) => p.name.toLowerCase() === preferredPattern.toLowerCase(),
      );
      if (pattern) return pattern;
    }

    // Score patterns based on relevance
    const normalizedA = matrixA.toLowerCase();
    const normalizedB = matrixB.toLowerCase();

    const scoredPatterns = ISOMORPHIC_PATTERNS.map((pattern) => {
      let score = 0;

      // Check if pattern hints appear in either domain
      for (const hint of pattern.hints) {
        if (normalizedA.includes(hint)) score += 2;
        if (normalizedB.includes(hint)) score += 2;
      }

      // Add randomness to vary results
      score += Math.random() * 3;

      return { pattern, score };
    });

    scoredPatterns.sort((a, b) => b.score - a.score);
    return scoredPatterns[0].pattern;
  }

  /**
   * Create explanation of what the output means
   */
  private createExplanation(
    domainA: string,
    domainB: string,
    pattern: (typeof ISOMORPHIC_PATTERNS)[0],
  ): string {
    return `BISOCIATIVE SYNTHESIS SCAFFOLD

This output contains a STRUCTURED PROMPT for genuine creative insight.

Instead of pre-filled templates, you receive:
1. A carefully crafted prompt that guides reasoning toward structural insight
2. Response sections that ensure the connection is JUSTIFIED (not random)
3. Constraints that keep the output ACTIONABLE (not just clever)

DOMAINS TO CONNECT:
- Problem Space: "${domainA}"
- Stimulus Space: "${domainB}"

SUGGESTED PATTERN: ${pattern.name}
Pattern hints: ${pattern.hints.join(", ")}

TO GET THE INSIGHT:
The 'llmPrompt' field contains a complete prompt. When processed by Claude, it will generate:
- The actual structural insight (not a template)
- A "because chain" explaining WHY the connection exists
- Concrete application to your problem
- Awareness of where the analogy breaks down

The scaffold ensures the creative leap is TRACEABLE and USEFUL, not just weird.`;
  }

  /**
   * Updates the dream graph with scaffold metadata
   * Records the domains and scaffold, not fake concepts
   */
  private updateDreamGraph(
    domainA: string,
    domainB: string,
    patternName: string,
  ): void {
    const timestamp = Date.now();

    const domainAId = `bisoc-domainA-${timestamp}`;
    const domainBId = `bisoc-domainB-${timestamp}`;
    const scaffoldId = `bisoc-scaffold-${timestamp}`;

    try {
      this.dreamGraph.addNode({
        id: domainAId,
        content: domainA,
        creationTimestamp: timestamp,
        source: "bisociative_synthesis",
        metadata: { role: "problem_domain", pattern: patternName },
      });
    } catch (error) {
      // Node may exist
    }

    try {
      this.dreamGraph.addNode({
        id: domainBId,
        content: domainB,
        creationTimestamp: timestamp,
        source: "bisociative_synthesis",
        metadata: { role: "stimulus_domain", pattern: patternName },
      });
    } catch (error) {
      // Node may exist
    }

    try {
      // Add scaffold metadata (not a fake bridge)
      this.dreamGraph.addNode({
        id: scaffoldId,
        content: `Bisociative scaffold: ${domainA} × ${domainB} via ${patternName}`,
        creationTimestamp: timestamp,
        source: "bisociative_synthesis",
        metadata: {
          role: "scaffold",
          type: "bisociative_synthesis",
          pattern: patternName,
          domains: [domainA, domainB],
          isScaffold: true, // This is a scaffold, not a concept
        },
      });

      // Create edges from domains to scaffold
      this.dreamGraph.addEdge({
        source: domainAId,
        target: scaffoldId,
        type: EdgeType.SYNTHESIZED_FROM,
        weight: 0.8,
        metadata: { pattern: patternName, role: "problem_domain" },
      });

      this.dreamGraph.addEdge({
        source: domainBId,
        target: scaffoldId,
        type: EdgeType.SYNTHESIZED_FROM,
        weight: 0.8,
        metadata: { pattern: patternName, role: "stimulus_domain" },
      });

      this.dreamGraph.visitNode(scaffoldId);
    } catch (error) {
      // Silently ignore graph errors (non-critical)
    }
  }
}

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
