/**
 * TRANSPARENCY REPORTING SYSTEM V1.0
 *
 * WHAT THIS IS:
 * A system for HONEST reporting of what the server actually computed
 * vs. what requires LLM completion.
 *
 * NO MORE:
 * - Hiding computational work
 * - Pretending LLM outputs are algorithmic
 * - Fake confidence scores
 *
 * YES:
 * - Clear labeling of computation vs. LLM work
 * - Timing breakdowns
 * - Confidence grounding (explain why this score)
 * - Full methodology transparency
 */
export interface ComputationalWork {
    /** What we actually computed */
    description: string;
    /** How long it took (milliseconds) */
    timingMs: number;
    /** What method/algorithm was used */
    method: string;
    /** Confidence in this computation (0.0 to 1.0) */
    confidence: number;
}
export interface LLMDependency {
    /** What needs LLM to complete */
    description: string;
    /** Estimated LLM time (milliseconds) */
    estimatedTimingMs: number;
    /** Why LLM is needed */
    rationale: string;
    /** How critical is this dependency */
    criticality: 'required' | 'optional' | 'enhancement';
}
export interface TransparencyReport {
    /** Human-readable summary */
    summary: string;
    /** What we computed on our own */
    computationalWork: ComputationalWork[];
    /** What requires LLM */
    llmDependencies: LLMDependency[];
    /** Overall confidence and why */
    confidenceGrounding: {
        score: number;
        reasoning: string;
        factors: string[];
    };
    /** Timing breakdown */
    timing: {
        totalComputationMs: number;
        estimatedLLMMs: number;
        breakdown: Record<string, number>;
    };
    /** Warnings and limitations */
    warnings: string[];
    /** Metadata */
    metadata: {
        timestamp: number;
        toolName: string;
        version: string;
    };
}
export declare class TransparencyBuilder {
    private work;
    private dependencies;
    private warnings;
    private startTime;
    private toolName;
    constructor(toolName: string);
    /**
     * Record computational work we actually did
     */
    addComputation(description: string, method: string, confidence: number, timingMs?: number): this;
    /**
     * Record LLM dependency
     */
    addLLMDependency(description: string, rationale: string, criticality?: 'required' | 'optional' | 'enhancement', estimatedTimingMs?: number): this;
    /**
     * Add warning or limitation
     */
    addWarning(warning: string): this;
    /**
     * Build final transparency report
     */
    build(overallConfidence: number, confidenceReasoning: string): TransparencyReport;
    private generateSummary;
}
/**
 * Create a new transparency builder for a tool
 */
export declare function createTransparencyReport(toolName: string): TransparencyBuilder;
/**
 * Format transparency report for human reading
 */
export declare function formatTransparencyReport(report: TransparencyReport): string;
/**
 * Compute honest confidence score based on multiple factors
 *
 * HONEST APPROACH:
 * - High confidence: Based on solid computation (NLP, vectors, etc.)
 * - Medium confidence: Some computation + some LLM needed
 * - Low confidence: Mostly LLM-dependent or fallback methods used
 */
export declare function computeHonestConfidence(params: {
    computationQuality: number;
    llmDependencyLevel: 'low' | 'medium' | 'high';
    fallbackUsed: boolean;
    dataQuality: number;
}): {
    score: number;
    reasoning: string;
};
