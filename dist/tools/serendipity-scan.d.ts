/**
 * Serendipity Scan - The Unknown Unknown Finder (V4.0 - PHASE 1 INTEGRATED)
 *
 * ✅ FIXED: All TypeScript errors resolved
 * ✅ Real NLP concept extraction (compromise + natural + stopword)
 * ✅ Transparency reporting
 * ✅ Honest serendipity scoring
 * ✅ Works on empty graphs using real NLP
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
