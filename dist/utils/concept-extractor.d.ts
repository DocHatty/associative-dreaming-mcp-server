/**
 * AUTHENTIC CONCEPT EXTRACTOR V1.0
 *
 * NO MORE FAKE BULLSHIT. This extracts concepts using REAL NLP:
 * - compromise: Real linguistic analysis (POS tagging, NER)
 * - natural: Statistical importance (TF-IDF)
 * - stopword: Noise removal
 *
 * HONEST OUTPUT:
 * - Every concept has provenance (how it was found)
 * - Confidence scores based on actual metrics
 * - Fallback indicators when we're uncertain
 * - Full transparency about extraction method
 */
export interface ExtractedConcept {
    /** The concept text */
    text: string;
    /** How this concept was found */
    extractionMethod: 'noun-phrase' | 'named-entity' | 'keyword' | 'fallback';
    /** Statistical importance (0.0 to 1.0) */
    importance: number;
    /** Confidence in this extraction (0.0 to 1.0) */
    confidence: number;
    /** Detailed metadata about extraction */
    metadata: {
        tfidfScore?: number;
        partOfSpeech?: string;
        entityType?: 'person' | 'place' | 'organization' | 'topic';
        rawFrequency?: number;
    };
}
export interface ConceptExtractionResult {
    /** Extracted concepts, ranked by importance */
    concepts: ExtractedConcept[];
    /** Primary extraction method used */
    extractionMethod: string;
    /** Overall confidence in extraction (0.0 to 1.0) */
    confidence: number;
    /** Whether fallback extraction was used */
    fallbackUsed: boolean;
    /** Detailed extraction statistics */
    statistics: {
        totalTokens: number;
        uniqueTokens: number;
        nounPhrases: number;
        namedEntities: number;
        stopwordsRemoved: number;
        conceptsBeforeFiltering: number;
        conceptsAfterFiltering: number;
    };
    /** Transparent explanation of what we did */
    transparency: {
        steps: string[];
        warnings: string[];
    };
}
export declare class ConceptExtractor {
    private tfidf;
    private tokenizer;
    constructor();
    /**
     * Extract concepts from text using real NLP
     *
     * HONEST APPROACH:
     * 1. Try noun phrase extraction (best method)
     * 2. Try named entity recognition (good for proper nouns)
     * 3. Use TF-IDF for statistical importance
     * 4. Fall back to keyword extraction if needed
     * 5. Always be transparent about what worked
     */
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
/** Singleton instance for easy use */
export declare const conceptExtractor: ConceptExtractor;
/** Quick extraction function */
export declare function extractConcepts(text: string, maxConcepts?: number): ConceptExtractionResult;
