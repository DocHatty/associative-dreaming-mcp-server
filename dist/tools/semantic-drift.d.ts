/**
 * Semantic Drift - Controlled Hallucination Engine (V5.0 - PHASE 1 INTEGRATED)
 *
 * MAJOR UPGRADE FROM V4.0:
 * ✅ Real NLP concept extraction (compromise + natural + stopword)
 * ✅ Transparency reporting (honest about computation vs. LLM work)
 * ✅ Grounded confidence scores (no more fake numbers)
 * ✅ Full provenance tracking for every extraction
 *
 * This tool implements a stochastic random walk through the concept space,
 * seeking semantically distant yet contextually relevant concepts.
 *
 * PHILOSOPHY:
 * - Server provides STRUCTURE (constraints, distance targets, concept extraction)
 * - LLM provides CREATIVITY (the actual semantic leap)
 * - Everything is TRACEABLE with "because chains"
 */
import { DreamGraph } from "../graph.js";
import { CreativeScaffold } from "../prompts/creative-scaffolds.js";
import { ExtractedConcept } from '../utils/concept-extractor.js';
import { TransparencyReport } from '../utils/transparency.js';
/**
 * Association hint - used to suggest directions, not determine them
 */
interface AssociationHint {
    concept: string;
    direction: string;
    distanceRange: [number, number];
}
export interface SemanticDriftInput {
    anchorConcept: string;
    driftMagnitude: number;
    temperature?: number;
}
export interface SemanticDriftOutput {
    scaffold: CreativeScaffold;
    llmPrompt: string;
    suggestedDirection: string;
    explorationPath: string[];
    driftDistance: number;
    associationHints: AssociationHint[];
    bridgeSuggestions: string[];
    explanation: string;
    extractedConcepts: ExtractedConcept[];
    extractionMethod: string;
    extractionConfidence: number;
    transparency: TransparencyReport;
}
/**
 * The Semantic Drift tool (V5.0 - PHASE 1 INTEGRATED)
 */
export declare class SemanticDriftTool {
    private dreamGraph;
    constructor(dreamGraph: DreamGraph);
    performDrift(input: SemanticDriftInput): SemanticDriftOutput;
    private getAssociationHints;
    private generateGenericHints;
    private getCrossDomainBridges;
    private generateDriftGuidance;
    private createExplanation;
    private updateDreamGraph;
}
export {};
