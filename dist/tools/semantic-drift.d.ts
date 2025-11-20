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
import { DreamGraph } from "../graph.js";
export interface SemanticDriftInput {
    anchorConcept: string;
    driftMagnitude: number;
    temperature?: number;
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
export declare class SemanticDriftTool {
    private dreamGraph;
    constructor(dreamGraph: DreamGraph);
    /**
     * V3.0: Calibrates requested drift magnitude to target actual distance
     * Corrects for historical overshooting/undershooting
     *
     * Empirical observations:
     * - Low drift (0.0-0.4): Tends to overshoot by ~50-100%
     * - Mid drift (0.4-0.7): Fairly accurate
     * - High drift (0.7-1.0): Tends to undershoot by ~20-30%
     */
    private calibrateDriftMagnitude;
    /**
     * V3.0: Calculates optimal number of hops for target distance
     * Prevents compounding that leads to overshooting
     */
    private calculateOptimalHops;
    performDrift(input: SemanticDriftInput): SemanticDriftOutput;
    /**
     * Finds the next concept based on drift magnitude and temperature
     * V2.1: Accepts visitedConcepts Set for loop detection
     */
    private findNextConcept;
    /**
     * Gets all weighted associations for a concept
     */
    private getWeightedAssociations;
    /**
     * Selects a cross-domain bridge for dramatic leaps
     * V2.1: Accepts visitedConcepts Set for loop detection
     */
    private selectCrossDomainBridge;
    /**
     * Jumps to a random domain when stuck
     * V2.1: Accepts visitedConcepts Set for loop detection
     */
    private jumpToDomain;
    /**
     * Generates rich explanation with proper formatting
     */
    private generateRichExplanation;
    /**
     * Generates contextual insights about the drift
     */
    private generateInsights;
    /**
     * Updates the dream graph with new nodes and edges
     */
    private updateDreamGraph;
}
