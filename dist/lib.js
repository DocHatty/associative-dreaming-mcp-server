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
import { SemanticDriftTool } from "./tools/semantic-drift.js";
import { BisociativeSynthesisTool } from "./tools/bisociative-synthesis.js";
import { ObliqueConstraintTool } from "./tools/oblique-constraint.js";
import { SerendipityScanTool } from "./tools/serendipity-scan.js";
import { MetaAssociationTool } from "./tools/meta-association.js";
import { loadConfig, getConfig } from "./config.js";
import { DreamError, ErrorCode, wrapError, isDreamError, } from "./utils/errors.js";
import { log } from "./utils/logger.js";
import { validateToolInput, } from "./schemas.js";
/**
 * Main server class that manages the dream graph and tools
 */
export class AssociativeDreamingServer {
    dreamGraph;
    semanticDriftTool;
    bisociativeSynthesisTool;
    obliqueConstraintTool;
    serendipityScanTool;
    metaAssociationTool;
    constructor() {
        // Load configuration
        loadConfig();
        const config = getConfig();
        this.dreamGraph = new DreamGraph();
        this.semanticDriftTool = new SemanticDriftTool(this.dreamGraph);
        this.bisociativeSynthesisTool = new BisociativeSynthesisTool(this.dreamGraph);
        this.obliqueConstraintTool = new ObliqueConstraintTool(this.dreamGraph);
        this.serendipityScanTool = new SerendipityScanTool(this.dreamGraph);
        this.metaAssociationTool = new MetaAssociationTool(this.dreamGraph);
    }
    /**
     * Process a request to the Associative Dreaming server
     * V2.0: Now returns scaffold-based outputs with LLM prompts
     */
    processDream(input) {
        try {
            const validatedInput = this.validateInput(input);
            const result = this.executeToolRequest(validatedInput);
            // Log the result if logging is enabled
            const config = getConfig();
            if (config.logging.enabled) {
                this.logDream(validatedInput.tool, result);
            }
            // Format the output to emphasize the LLM prompt
            const formattedOutput = this.formatScaffoldOutput(validatedInput.tool, result);
            return {
                content: [
                    {
                        type: "text",
                        text: formattedOutput,
                    },
                ],
                scaffoldData: result,
            };
        }
        catch (error) {
            // Handle errors with structured format
            const dreamError = isDreamError(error) ? error : wrapError(error);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(dreamError.toJSON(), null, 2),
                    },
                ],
                isError: true,
            };
        }
    }
    /**
     * Format scaffold output to emphasize the LLM prompt
     */
    formatScaffoldOutput(toolName, result) {
        const output = [];
        // Add header
        output.push(`═══════════════════════════════════════════════════════════════`);
        output.push(`  ${toolName.toUpperCase().replace("_", " ")} - LLM SCAFFOLD OUTPUT`);
        output.push(`═══════════════════════════════════════════════════════════════`);
        output.push("");
        // Add the explanation first
        if (result.explanation) {
            output.push(result.explanation);
            output.push("");
        }
        // Add the LLM prompt section (most important)
        if (result.llmPrompt) {
            output.push(`───────────────────────────────────────────────────────────────`);
            output.push(`  LLM PROMPT (Process this for genuine insight)`);
            output.push(`───────────────────────────────────────────────────────────────`);
            output.push("");
            output.push(result.llmPrompt);
            output.push("");
        }
        // Add key data in compact form
        output.push(`───────────────────────────────────────────────────────────────`);
        output.push(`  KEY DATA`);
        output.push(`───────────────────────────────────────────────────────────────`);
        // Tool-specific key data
        switch (toolName) {
            case "semantic_drift":
                output.push(`  Anchor: "${result.driftPath?.[0] || "N/A"}"`);
                output.push(`  Target Distance: ${((result.driftDistance || 0) * 100).toFixed(0)}%`);
                output.push(`  Association Hints: ${result.associationHints?.length || 0}`);
                break;
            case "bisociative_synthesis":
                output.push(`  Matrix A: "${result.matrixA}"`);
                output.push(`  Matrix B: "${result.matrixB}"`);
                output.push(`  Pattern: ${result.suggestedPattern}`);
                break;
            case "oblique_constraint":
                output.push(`  Constraint: "${result.constraint}"`);
                output.push(`  Type: ${result.constraintType}`);
                break;
            case "serendipity_scan":
                output.push(`  Scan Type: ${result.scanType}`);
                output.push(`  Serendipity Score: ${((result.serendipityScore || 0) * 100).toFixed(0)}%`);
                output.push(`  Extracted Concepts: ${result.extractedConcepts?.length || 0}`);
                break;
            case "meta_association":
                output.push(`  Concepts: ${result.extractedConcepts?.filter((c) => c.type === "primary").length || 0}`);
                output.push(`  Collisions: ${result.collisionMap?.length || 0}`);
                output.push(`  Chaos Target: ${((result.weirdnessTarget || 0) * 100).toFixed(0)}%`);
                break;
        }
        output.push("");
        output.push(`═══════════════════════════════════════════════════════════════`);
        output.push(`  HOW TO USE THIS OUTPUT`);
        output.push(`═══════════════════════════════════════════════════════════════`);
        output.push("");
        output.push('  The "LLM PROMPT" section above is designed to be processed by');
        output.push("  Claude to generate genuine creative insight. The server provides");
        output.push("  STRUCTURE; the LLM provides CREATIVITY.");
        output.push("");
        output.push("  To get the actual insight:");
        output.push("  1. Copy the LLM PROMPT section");
        output.push("  2. Send it to Claude (or process it in your Claude integration)");
        output.push("  3. The response will contain justified, traceable creative leaps");
        output.push("");
        return output.join("\n");
    }
    /**
     * Validates and normalizes the input using Zod schemas
     */
    validateInput(input) {
        const data = input;
        // Validate tool name
        if (!data.tool || typeof data.tool !== "string") {
            throw new DreamError(ErrorCode.INVALID_INPUT, "Invalid request: tool name must be a string", { field: "tool", received: data.tool });
        }
        const toolName = data.tool;
        const toolInput = data.input || {};
        // Use Zod schema validation
        const validationResult = validateToolInput(toolName, toolInput);
        if (!validationResult.success) {
            throw new DreamError(ErrorCode.INVALID_INPUT, validationResult.error, {
                tool: toolName,
                details: validationResult.details,
            });
        }
        return {
            tool: toolName,
            input: validationResult.data,
        };
    }
    /**
     * Executes the appropriate tool based on the input
     */
    executeToolRequest(input) {
        try {
            switch (input.tool) {
                case "semantic_drift":
                    return this.semanticDriftTool.performDrift(input.input);
                case "bisociative_synthesis":
                    return this.bisociativeSynthesisTool.performSynthesis(input.input);
                case "oblique_constraint":
                    return this.obliqueConstraintTool.generateConstraint(input.input);
                case "serendipity_scan":
                    return this.serendipityScanTool.performScan(input.input);
                case "meta_association":
                    return this.metaAssociationTool.associate(input.input);
                default:
                    throw new DreamError(ErrorCode.UNKNOWN_TOOL, `Unknown tool: ${input.tool}`, { tool: input.tool });
            }
        }
        catch (error) {
            // Re-throw DreamErrors, wrap others
            if (isDreamError(error)) {
                throw error;
            }
            throw new DreamError(ErrorCode.TOOL_EXECUTION_FAILED, `Tool '${input.tool}' failed: ${error instanceof Error ? error.message : String(error)}`, { tool: input.tool }, true);
        }
    }
    /**
     * Logs dream tool executions with colorized output
     */
    logDream(toolName, result) {
        const prefix = toolName.toUpperCase().replaceAll("_", " ");
        // Format a summary of the result
        const summary = result.llmPrompt
            ? `LLM scaffold generated (${result.llmPrompt.length} chars)`
            : `Result: ${JSON.stringify(result).substring(0, 100)}...`;
        log("info", `${prefix} | ${summary}`, { tool: toolName });
        const graphStats = this.getDreamGraphStatistics();
        log("debug", "Dream graph updated", {
            nodeCount: graphStats.nodeCount,
            edgeCount: graphStats.edgeCount,
            diversity: Number(graphStats.diversity.toFixed(2)),
        });
    }
    /**
     * Gets statistics about the current dream graph
     */
    getDreamGraphStatistics() {
        const nodes = this.dreamGraph.getAllNodes();
        const edges = this.dreamGraph.getAllEdges();
        const diversity = this.dreamGraph.calculateDiversity();
        return {
            nodeCount: nodes.length,
            edgeCount: edges.length,
            diversity,
        };
    }
    /**
     * Public accessor for the dream graph (used by resources)
     */
    getDreamGraph() {
        return this.dreamGraph;
    }
}
