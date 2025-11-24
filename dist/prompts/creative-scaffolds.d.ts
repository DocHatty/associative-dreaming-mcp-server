/**
 * Creative Scaffolds - LLM Prompt Engineering System
 *
 * PHILOSOPHY:
 * The MCP server should NOT try to be creative itself. It should provide
 * SCAFFOLDING that guides Claude's actual hyperdimensional pattern-matching
 * capabilities toward productive lateral thinking.
 *
 * Instead of: Server generates "throughput ⟷ tension" (meaningless template)
 * We want: Server returns structured prompt that causes Claude to make genuine insight
 *
 * These scaffolds are designed to:
 * 1. Frame the creative task with constraints that produce insight
 * 2. Provide structural templates that Claude fills with genuine reasoning
 * 3. Include "because chains" that force justification of connections
 * 4. Ground abstract leaps in the user's actual problem context
 */
/**
 * Scaffold types that guide different kinds of creative reasoning
 */
export type ScaffoldType = "bisociative_bridge" | "semantic_leap" | "constraint_reframe" | "serendipity_mine" | "meta_collision" | "because_chain" | "structural_mapping" | "inversion_probe" | "analogy_generator" | "blind_spot_finder";
/**
 * A creative scaffold - structured prompt for LLM reasoning
 */
export interface CreativeScaffold {
    type: ScaffoldType;
    /** The core prompt that guides Claude's reasoning */
    prompt: string;
    /** Structured sections Claude should fill in */
    responseStructure: ResponseSection[];
    /** Context from the MCP server to ground the reasoning */
    context: ScaffoldContext;
    /** Constraints that make the output useful, not just weird */
    constraints: string[];
    /** What makes this scaffold valuable - helps Claude understand intent */
    intent: string;
}
export interface ResponseSection {
    name: string;
    instruction: string;
    required: boolean;
    format?: "paragraph" | "bullet_list" | "single_line" | "structured";
}
export interface ScaffoldContext {
    /** The user's original input/problem */
    userContext: string;
    /** Concepts the server has identified as relevant */
    concepts: string[];
    /** Any graph state (connections, clusters, bridges) */
    graphState?: GraphStateContext;
    /** Prior tool outputs in this session */
    priorOutputs?: PriorOutput[];
    /** Domain-specific metadata */
    domainHints?: string[];
}
export interface GraphStateContext {
    nodeCount: number;
    edgeCount: number;
    clusters: string[][];
    bridges: string[];
    recentConcepts: string[];
}
export interface PriorOutput {
    tool: string;
    concept: string;
    timestamp: number;
}
/**
 * =============================================================================
 * SCAFFOLD GENERATORS
 * =============================================================================
 * These functions create scaffolds that guide LLM reasoning toward
 * genuine creative insight rather than template-filling.
 */
/**
 * Generate a bisociative bridge scaffold
 * Instead of picking random pairs, this prompts Claude to find genuine structural isomorphisms
 */
export declare function generateBisociativeBridgeScaffold(domainA: string, domainB: string, userContext: string, patternHint?: string): CreativeScaffold;
/**
 * Generate a semantic leap scaffold
 * Instead of hard-coded association tables, guide Claude to make justified leaps
 */
export declare function generateSemanticLeapScaffold(anchorConcept: string, driftMagnitude: number, userContext: string, temperature?: number): CreativeScaffold;
/**
 * Generate a serendipity mining scaffold
 * Works even with empty graph by mining the user's context for unexpected connections
 */
export declare function generateSerendipityMiningScaffold(currentContext: string, noveltyThreshold: number, scanType: "bridge" | "gap" | "pattern" | "random", graphState?: GraphStateContext): CreativeScaffold;
/**
 * Generate a constraint reframe scaffold
 * Instead of random oblique strategies, guide Claude to apply constraints meaningfully
 */
export declare function generateConstraintReframeScaffold(currentBlock: string, constraintType: "oblique" | "scamper" | "inversion" | "random", userContext?: string): CreativeScaffold;
/**
 * Generate a meta-collision scaffold
 * Forces prior outputs to collide in ways that produce genuine insight, not just weirdness
 */
export declare function generateMetaCollisionScaffold(priorOutputs: PriorOutput[], chaosIntensity: number, contextAnchor?: string): CreativeScaffold;
/**
 * =============================================================================
 * SCAFFOLD OUTPUT FORMATTING
 * =============================================================================
 */
/**
 * Format a scaffold into a prompt that can be returned to the LLM
 */
export declare function formatScaffoldAsPrompt(scaffold: CreativeScaffold, includeHandshake?: boolean): string;
/**
 * Format scaffold as structured JSON for programmatic parsing
 */
export declare function formatScaffoldAsJSON(scaffold: CreativeScaffold): object;
