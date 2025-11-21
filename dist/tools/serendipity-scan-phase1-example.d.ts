/**
 * EXAMPLE: SERENDIPITY SCAN WITH PHASE 1 INTEGRATION
 *
 * This shows how to integrate:
 * - Real NLP concept extraction (no more fake extraction)
 * - Transparency reporting (honest about what we compute)
 * - Grounded confidence scores (no more Math.random())
 *
 * COPY THIS PATTERN to other tools!
 */
import { DreamGraph } from "../graph.js";
import { CreativeScaffold } from "../prompts/creative-scaffolds.js";
import { ConceptExtractionResult } from '../utils/concept-extractor.js';
import { TransparencyReport } from '../utils/transparency.js';
export interface SerendipityScanInput {
    context: string;
    scanType?: "bridge" | "gap" | "pattern" | "random";
    noveltyThreshold?: number;
}
export interface SerendipityScanOutput {
    scaffold: CreativeScaffold;
    llmPrompt: string;
    discoveredConcept: string;
    serendipityScore: number;
    explanation: string;
    extractedConcepts: string[];
    transparency: TransparencyReport;
    extractionDetails: ConceptExtractionResult;
}
export declare class SerendipityScanTool {
    private dreamGraph;
    constructor(dreamGraph: DreamGraph);
    execute(input: SerendipityScanInput): Promise<SerendipityScanOutput>;
    private findRelatedConcepts;
    private generateSeedProbes;
    private createHonestExplanation;
    private updateDreamGraph;
}
