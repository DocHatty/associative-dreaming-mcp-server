/**
 * Associative Dreaming Server - Main Implementation
 *
 * This is the core implementation of the Associative Dreaming MCP server.
 * Unlike the Sequential Thinking server which maintains a linear thought history,
 * this server manages a rhizomatic "Dream Graph" that allows for non-linear,
 * associative exploration of the concept space.
 */

import chalk from 'chalk';
import { DreamGraph, Node, EdgeType } from './graph.js';
import { SemanticDriftTool, SemanticDriftInput } from './tools/semantic-drift.js';
import { BisociativeSynthesisTool, BisociativeSynthesisInput } from './tools/bisociative-synthesis.js';
import { ObliqueConstraintTool, ObliqueConstraintInput } from './tools/oblique-constraint.js';
import { SerendipityScanTool, SerendipityScanInput } from './tools/serendipity-scan.js';

/**
 * Input type for the server that encapsulates all possible tool inputs
 */
export type AssociativeDreamingInput =
  | { tool: 'semantic_drift'; input: SemanticDriftInput }
  | { tool: 'bisociative_synthesis'; input: BisociativeSynthesisInput }
  | { tool: 'oblique_constraint'; input: ObliqueConstraintInput }
  | { tool: 'serendipity_scan'; input: SerendipityScanInput };

/**
 * Main server class that manages the dream graph and tools
 */
export class AssociativeDreamingServer {
  private dreamGraph: DreamGraph;
  private semanticDriftTool: SemanticDriftTool;
  private bisociativeSynthesisTool: BisociativeSynthesisTool;
  private obliqueConstraintTool: ObliqueConstraintTool;
  private serendipityScanTool: SerendipityScanTool;
  private disableDreamLogging: boolean;

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
  public processDream(input: unknown): { content: Array<{ type: string; text: string }>; isError?: boolean } {
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
    } catch (error) {
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
  private validateInput(input: unknown): AssociativeDreamingInput {
    const data = input as Record<string, unknown>;
    
    // Make sure we have a valid tool name
    if (!data.tool || typeof data.tool !== 'string') {
      throw new Error('Invalid request: tool name must be a string');
    }
    
    const toolName = data.tool as string;
    const toolInput = data.input || {};
    
    // Validate based on the tool type
    switch (toolName) {
      case 'semantic_drift':
        if (!this.isValidSemanticDriftInput(toolInput)) {
          throw new Error('Invalid semantic_drift input');
        }
        return { tool: toolName, input: toolInput as SemanticDriftInput };
        
      case 'bisociative_synthesis':
        if (!this.isValidBisociativeSynthesisInput(toolInput)) {
          throw new Error('Invalid bisociative_synthesis input');
        }
        return { tool: toolName, input: toolInput as BisociativeSynthesisInput };
        
      case 'oblique_constraint':
        if (!this.isValidObliqueConstraintInput(toolInput)) {
          throw new Error('Invalid oblique_constraint input');
        }
        return { tool: toolName, input: toolInput as ObliqueConstraintInput };
        
      case 'serendipity_scan':
        if (!this.isValidSerendipityScanInput(toolInput)) {
          throw new Error('Invalid serendipity_scan input');
        }
        return { tool: toolName, input: toolInput as SerendipityScanInput };
        
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
  
  /**
   * Executes the appropriate tool based on the input
   */
  private executeToolRequest(input: AssociativeDreamingInput): unknown {
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
        throw new Error(`Unknown tool: ${(input as any).tool}`);
    }
  }
  
  /**
   * Logs dream tool executions with colorized output
   */
  private logDream(toolName: string, result: any): void {
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
    } else if (toolName === 'bisociative_synthesis' && 'bridgeConcept' in result) {
      summary = `${result.bridgeConcept} (pattern: ${result.pattern})`;
    } else if (toolName === 'oblique_constraint' && 'constraint' in result) {
      summary = `${result.constraint} (type: ${result.constraintType})`;
    } else if (toolName === 'serendipity_scan' && 'discoveredConcept' in result) {
      summary = `${result.discoveredConcept} (score: ${result.serendipityScore.toFixed(2)})`;
    } else {
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
  private getDreamGraphStatistics() {
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
  private isValidSemanticDriftInput(input: unknown): input is SemanticDriftInput {
    const data = input as Record<string, unknown>;
    return typeof data === 'object' && 
           data !== null && 
           typeof data.anchorConcept === 'string' && 
           (data.driftMagnitude === undefined || 
            (typeof data.driftMagnitude === 'number' && 
             data.driftMagnitude >= 0 && 
             data.driftMagnitude <= 1));
  }
  
  private isValidBisociativeSynthesisInput(input: unknown): input is BisociativeSynthesisInput {
    const data = input as Record<string, unknown>;
    return typeof data === 'object' && 
           data !== null && 
           typeof data.matrixA === 'string' && 
           (data.matrixB === undefined || typeof data.matrixB === 'string') && 
           (data.blendType === undefined || typeof data.blendType === 'string');
  }
  
  private isValidObliqueConstraintInput(input: unknown): input is ObliqueConstraintInput {
    const data = input as Record<string, unknown>;
    return typeof data === 'object' && 
           data !== null && 
           typeof data.currentBlock === 'string' && 
           (data.constraintType === undefined || 
            typeof data.constraintType === 'string');
  }
  
  private isValidSerendipityScanInput(input: unknown): input is SerendipityScanInput {
    const data = input as Record<string, unknown>;
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
