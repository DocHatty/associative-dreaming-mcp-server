/**
 * AUTHENTIC CONCEPT EXTRACTOR V1.0
 *
 * Real NLP concept extraction using:
 * - compromise: Real linguistic analysis (POS tagging, NER)
 * - natural: Statistical importance (TF-IDF)
 * - stopword: Noise removal
 */
export interface ExtractedConcept {
    text: string;
    extractionMethod: "noun-phrase" | "named-entity" | "keyword" | "fallback";
    importance: number;
    confidence: number;
    metadata: {
        tfidfScore?: number;
        partOfSpeech?: string;
        entityType?: "person" | "place" | "organization" | "topic";
        rawFrequency?: number;
    };
}
export interface ConceptExtractionResult {
    concepts: ExtractedConcept[];
    extractionMethod: string;
    confidence: number;
    fallbackUsed: boolean;
    statistics: {
        totalTokens: number;
        uniqueTokens: number;
        nounPhrases: number;
        namedEntities: number;
        stopwordsRemoved: number;
        conceptsBeforeFiltering: number;
        conceptsAfterFiltering: number;
    };
    transparency: {
        steps: string[];
        warnings: string[];
    };
}
export declare class ConceptExtractor {
    private tfidf;
    private tokenizer;
    constructor();
    extractConcepts(text: string, options?: {
        maxConcepts?: number;
        minImportance?: number;
        includeContext?: boolean;
    }): ConceptExtractionResult;
    private extractNamedEntities;
    private computeTfIdfScores;
    private calculateImportance;
    private extractKeywords;
    private emptyResult;
}
export declare const conceptExtractor: ConceptExtractor;
export declare function extractConcepts(text: string, maxConcepts?: number): ConceptExtractionResult;
