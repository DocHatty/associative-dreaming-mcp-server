/**
 * Associative Dreaming Server - Main Implementation (V2.0 - LLM-SCAFFOLDED)
 *
 * This is the core implementation of the Associative Dreaming MCP server.
 * Unlike the Sequential Thinking server which maintains a linear thought history,
 * this server manages a rhizomatic "Dream Graph" that allows for non-linear,
 * associative exploration of the concept space.
 *
 * V2.0 ARCHITECTURE CHANGE:
 * - All tools now return LLM SCAFFOLDS instead of template-filled strings
 * - The server provides STRUCTURE, Claude provides INSIGHT
 * - Each output includes a formatted prompt for genuine creative reasoning
 * - "Because chains" ensure all connections are traceable
 * - Outputs are ACTIONABLE, not just aesthetically weird
 *
 * The Philosophy:
 * LLMs naturally operate through hyperdimensional pattern-matching. This server
 * harnesses that capability by providing structured scaffolds that guide Claude
 * toward productive lateral thinking, rather than trying to simulate creativity
 * in TypeScript with lookup tables.
 */
import { DreamGraph } from "./graph.js";
import { SemanticDriftInput, BisociativeSynthesisInput, ObliqueConstraintInput, SerendipityScanInput, MetaAssociationInput } from "./schemas.js";
/**
 * Input type for the server that encapsulates all possible tool inputs
 */
export type AssociativeDreamingInput = {
    tool: "semantic_drift";
    input: SemanticDriftInput;
} | {
    tool: "bisociative_synthesis";
    input: BisociativeSynthesisInput;
} | {
    tool: "oblique_constraint";
    input: ObliqueConstraintInput;
} | {
    tool: "serendipity_scan";
    input: SerendipityScanInput;
} | {
    tool: "meta_association";
    input: MetaAssociationInput;
};
/**
 * Output type that includes both the scaffold and formatted content
 */
export interface AssociativeDreamingOutput {
    content: Array<{
        type: string;
        text: string;
    }>;
    isError?: boolean;
    /** The scaffold object for programmatic access (when not an error) */
    scaffoldData?: any;
}
/**
 * Main server class that manages the dream graph and tools
 */
export declare class AssociativeDreamingServer {
    private dreamGraph;
    private semanticDriftTool;
    private bisociativeSynthesisTool;
    private obliqueConstraintTool;
    private serendipityScanTool;
    private metaAssociationTool;
    constructor();
    /**
     * Process a request to the Associative Dreaming server
     * V2.0: Now returns scaffold-based outputs with LLM prompts
     */
    processDream(input: unknown): Promise<AssociativeDreamingOutput>;
    /**
     * Format scaffold output - SIMPLIFIED for direct LLM processing
     */
    private formatScaffoldOutput;
    /**
     * Validates and normalizes the input using Zod schemas
     */
    private validateInput;
    /**
     * Executes the appropriate tool based on the input
     */
    private executeToolRequest;
    /**
     * Logs dream tool executions with colorized output
     */
    private logDream;
    /**
     * Gets statistics about the current dream graph
     */
    private getDreamGraphStatistics;
    /**
     * Public accessor for the dream graph (used by resources)
     */
    getDreamGraph(): DreamGraph;
}
export type { SemanticDriftInput } from "./schemas.js";
export type { BisociativeSynthesisInput } from "./schemas.js";
export type { ObliqueConstraintInput } from "./schemas.js";
export type { SerendipityScanInput } from "./schemas.js";
export type { MetaAssociationInput } from "./schemas.js";
export type { CreativeScaffold, ScaffoldType, } from "./prompts/creative-scaffolds.js";
