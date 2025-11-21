/**
 * Serendipity Scan - The Unknown Unknown Finder (V4.0 - PHASE 1 INTEGRATED)
 *
 * MAJOR UPGRADE FROM V3.0:
 * ✅ Real NLP concept extraction (compromise + natural + stopword)
 * ✅ Transparency reporting (honest about computation vs. LLM work)
 * ✅ Grounded confidence scores (no more fake numbers)
 * ✅ Full provenance tracking for every extraction
 *
 * This tool automates the search for "Unknown Unknowns" - connections and insights
 * that would typically be missed through linear thinking.
 *
 * NOW WORKS ON EMPTY GRAPHS - mines user context directly using real NLP.
 */
import { DreamGraph } from "../graph.js";
import { CreativeScaffold } from "../prompts/creative-scaffolds.js";
import { ExtractedConcept } from '../utils/concept-extractor.js';
import { TransparencyReport } from '../utils/transparency.js';
export interface SerendipityScanInput {
    currentContext: string;
    noveltyThreshold?: number;
    scanType?: "bridge" | "gap" | "pattern" | "random";
}
export interface SerendipityScanOutput {
    scaffold: CreativeScaffold;
    llmPrompt: string;
    discoveredConcept: string;
    scanType: string;
    serendipityScore: number;
    extractedConcepts: string[];
    seedProbes: string[];
    relatedConcepts: string[];
    explanation: string;
    extractionDetails: {
        concepts: ExtractedConcept[];
        method: string;
        confidence: number;
        fallbackUsed: boolean;
        statistics: any;
    };
    transparency: TransparencyReport;
}
/**
 * The Serendipity Scan tool (V4.0 - PHASE 1 INTEGRATED)
 */
export declare class SerendipityScanTool {
    private dreamGraph;
    constructor(dreamGraph: DreamGraph);
    performScan(input: SerendipityScanInput): SerendipityScanOutput;
    private getGraphState;
    private generateSeedProbes;
    private findRelatedConcepts;
    private generateProvisionalDiscovery;
    private createExplanation;
    private updateDreamGraph;
}
