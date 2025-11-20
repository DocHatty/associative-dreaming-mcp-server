/**
 * Associative Dreaming Server - Main Implementation
 *
 * This is the core implementation of the Associative Dreaming MCP server.
 * Unlike the Sequential Thinking server which maintains a linear thought history,
 * this server manages a rhizomatic "Dream Graph" that allows for non-linear,
 * associative exploration of the concept space.
 */
import chalk from 'chalk';
import { DreamGraph } from './graph.js';
import { SemanticDriftTool } from './tools/semantic-drift.js';
import { BisociativeSynthesisTool } from './tools/bisociative-synthesis.js';
import { ObliqueConstraintTool } from './tools/oblique-constraint.js';
import { SerendipityScanTool } from './tools/serendipity-scan.js';
/**
 * Main server class that manages the dream graph and tools
 */
export class AssociativeDreamingServer {
    dreamGraph;
    semanticDriftTool;
    bisociativeSynthesisTool;
    obliqueConstraintTool;
    serendipityScanTool;
    disableDreamLogging;
    constructor() {
        this.dreamGraph = new DreamGraph();
        this.semanticDriftTool = new SemanticDriftTool(this.dreamGraph);
        this.bisociativeSynthesisTool = new BisociativeSynthesisTool(this.dreamGraph);
        this.obliqueConstraintTool = new ObliqueConstraintTool(this.dreamGraph);
        this.serendipityScanTool = new SerendipityScanTool(this.dreamGraph);
        this.disableDreamLogging = (process.env.DISABLE_DREAM_LOGGING || "").toLowerCase() === "true";
    }
    /**
     * Process a request to the Associative Dreaming server
     */
    processDream(input) {
        try {
            const validatedInput = this.validateInput(input);
            const result = this.executeToolRequest(validatedInput);
            // Log the result if logging is enabled
            if (!this.disableDreamLogging) {
                this.logDream(validatedInput.tool, result);
            }
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: error instanceof Error ? error.message : String(error),
                            status: 'failed'
                        }, null, 2)
                    }],
                isError: true
            };
        }
    }
    /**
     * Validates and normalizes the input
     */
    validateInput(input) {
        const data = input;
        // Make sure we have a valid tool name
        if (!data.tool || typeof data.tool !== 'string') {
            throw new Error('Invalid request: tool name must be a string');
        }
        const toolName = data.tool;
        const toolInput = data.input || {};
        // Validate based on the tool type
        switch (toolName) {
            case 'semantic_drift':
                if (!this.isValidSemanticDriftInput(toolInput)) {
                    throw new Error('Invalid semantic_drift input');
                }
                return { tool: toolName, input: toolInput };
            case 'bisociative_synthesis':
                if (!this.isValidBisociativeSynthesisInput(toolInput)) {
                    throw new Error('Invalid bisociative_synthesis input');
                }
                return { tool: toolName, input: toolInput };
            case 'oblique_constraint':
                if (!this.isValidObliqueConstraintInput(toolInput)) {
                    throw new Error('Invalid oblique_constraint input');
                }
                return { tool: toolName, input: toolInput };
            case 'serendipity_scan':
                if (!this.isValidSerendipityScanInput(toolInput)) {
                    throw new Error('Invalid serendipity_scan input');
                }
                return { tool: toolName, input: toolInput };
            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }
    }
    /**
     * Executes the appropriate tool based on the input
     */
    executeToolRequest(input) {
        switch (input.tool) {
            case 'semantic_drift':
                return this.semanticDriftTool.performDrift(input.input);
            case 'bisociative_synthesis':
                return this.bisociativeSynthesisTool.performSynthesis(input.input);
            case 'oblique_constraint':
                return this.obliqueConstraintTool.generateConstraint(input.input);
            case 'serendipity_scan':
                return this.serendipityScanTool.performScan(input.input);
            default:
                // This should never happen due to validation in validateInput
                throw new Error(`Unknown tool: ${input.tool}`);
        }
    }
    /**
     * Logs dream tool executions with colorized output
     */
    logDream(toolName, result) {
        let prefix = '';
        let border = '';
        switch (toolName) {
            case 'semantic_drift':
                prefix = chalk.blue('DRIFT');
                border = '~'.repeat(40);
                break;
            case 'bisociative_synthesis':
                prefix = chalk.magenta('SYNTHESIS');
                border = '*'.repeat(40);
                break;
            case 'oblique_constraint':
                prefix = chalk.yellow('CONSTRAINT');
                border = '='.repeat(40);
                break;
            case 'serendipity_scan':
                prefix = chalk.green('SERENDIPITY');
                border = '+'.repeat(40);
                break;
            default:
                prefix = chalk.white('UNKNOWN TOOL');
                border = '-'.repeat(40);
        }
        // Format a summary of the result based on the tool type
        let summary = '';
        if (toolName === 'semantic_drift' && 'newConcept' in result) {
            summary = `${result.newConcept} (drift: ${result.driftDistance.toFixed(2)})`;
        }
        else if (toolName === 'bisociative_synthesis' && 'bridgeConcept' in result) {
            summary = `${result.bridgeConcept} (pattern: ${result.pattern})`;
        }
        else if (toolName === 'oblique_constraint' && 'constraint' in result) {
            summary = `${result.constraint} (type: ${result.constraintType})`;
        }
        else if (toolName === 'serendipity_scan' && 'discoveredConcept' in result) {
            summary = `${result.discoveredConcept} (score: ${result.serendipityScore.toFixed(2)})`;
        }
        else {
            summary = 'Result: ' + JSON.stringify(result).substring(0, 100) + '...';
        }
        // Log the formatted dream
        console.error(`
${border}
${prefix} | ${summary}
${border}`);
        // Graph statistics
        const graphStats = this.getDreamGraphStatistics();
        console.error(`Dream Graph: ${graphStats.nodeCount} nodes, ${graphStats.edgeCount} edges, ${graphStats.diversity.toFixed(2)} diversity`);
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
            diversity
        };
    }
    /**
     * Input validation helpers
     */
    isValidSemanticDriftInput(input) {
        const data = input;
        return typeof data === 'object' &&
            data !== null &&
            typeof data.anchorConcept === 'string' &&
            (data.driftMagnitude === undefined ||
                (typeof data.driftMagnitude === 'number' &&
                    data.driftMagnitude >= 0 &&
                    data.driftMagnitude <= 1));
    }
    isValidBisociativeSynthesisInput(input) {
        const data = input;
        return typeof data === 'object' &&
            data !== null &&
            typeof data.matrixA === 'string' &&
            (data.matrixB === undefined || typeof data.matrixB === 'string') &&
            (data.blendType === undefined || typeof data.blendType === 'string');
    }
    isValidObliqueConstraintInput(input) {
        const data = input;
        return typeof data === 'object' &&
            data !== null &&
            typeof data.currentBlock === 'string' &&
            (data.constraintType === undefined ||
                typeof data.constraintType === 'string');
    }
    isValidSerendipityScanInput(input) {
        const data = input;
        return typeof data === 'object' &&
            data !== null &&
            typeof data.currentContext === 'string' &&
            (data.noveltyThreshold === undefined ||
                (typeof data.noveltyThreshold === 'number' &&
                    data.noveltyThreshold >= 0 &&
                    data.noveltyThreshold <= 1)) &&
            (data.scanType === undefined || typeof data.scanType === 'string');
    }
}
