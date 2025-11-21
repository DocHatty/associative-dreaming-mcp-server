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
// ============================================================================
// TRANSPARENCY BUILDER
// ============================================================================
export class TransparencyBuilder {
    work = [];
    dependencies = [];
    warnings = [];
    startTime;
    toolName;
    constructor(toolName) {
        this.toolName = toolName;
        this.startTime = Date.now();
    }
    /**
     * Record computational work we actually did
     */
    addComputation(description, method, confidence, timingMs) {
        this.work.push({
            description,
            method,
            confidence,
            timingMs: timingMs ?? 0,
        });
        return this;
    }
    /**
     * Record LLM dependency
     */
    addLLMDependency(description, rationale, criticality = 'required', estimatedTimingMs = 2000) {
        this.dependencies.push({
            description,
            rationale,
            criticality,
            estimatedTimingMs,
        });
        return this;
    }
    /**
     * Add warning or limitation
     */
    addWarning(warning) {
        this.warnings.push(warning);
        return this;
    }
    /**
     * Build final transparency report
     */
    build(overallConfidence, confidenceReasoning) {
        const totalComputationMs = Date.now() - this.startTime;
        const estimatedLLMMs = this.dependencies.reduce((sum, dep) => sum + dep.estimatedTimingMs, 0);
        // Build timing breakdown
        const breakdown = {
            'server-computation': totalComputationMs,
        };
        this.dependencies.forEach((dep, i) => {
            breakdown[`llm-${i + 1}-${dep.description.toLowerCase().replace(/\s+/g, '-')}`] =
                dep.estimatedTimingMs;
        });
        // Identify confidence factors
        const factors = [];
        if (this.work.length > 0) {
            const avgComputationConfidence = this.work.reduce((sum, w) => sum + w.confidence, 0) / this.work.length;
            factors.push(`Computation confidence: ${(avgComputationConfidence * 100).toFixed(0)}% (based on ${this.work.length} operations)`);
        }
        if (this.dependencies.length > 0) {
            factors.push(`LLM dependencies: ${this.dependencies.length} (affects final quality)`);
        }
        if (this.warnings.length > 0) {
            factors.push(`Warnings raised: ${this.warnings.length}`);
        }
        // Generate summary
        const summary = this.generateSummary(totalComputationMs, estimatedLLMMs);
        return {
            summary,
            computationalWork: this.work,
            llmDependencies: this.dependencies,
            confidenceGrounding: {
                score: overallConfidence,
                reasoning: confidenceReasoning,
                factors,
            },
            timing: {
                totalComputationMs,
                estimatedLLMMs,
                breakdown,
            },
            warnings: this.warnings,
            metadata: {
                timestamp: Date.now(),
                toolName: this.toolName,
                version: '1.0.0',
            },
        };
    }
    generateSummary(computationMs, llmMs) {
        const parts = [];
        // Computation summary
        if (this.work.length > 0) {
            parts.push(`Completed ${this.work.length} computational operations in ${computationMs}ms`);
        }
        // LLM summary
        if (this.dependencies.length > 0) {
            const required = this.dependencies.filter(d => d.criticality === 'required').length;
            const optional = this.dependencies.filter(d => d.criticality === 'optional').length;
            if (required > 0) {
                parts.push(`Requires LLM completion (${required} required operations, ~${llmMs}ms)`);
            }
            if (optional > 0) {
                parts.push(`${optional} optional LLM enhancements available`);
            }
        }
        // Warnings summary
        if (this.warnings.length > 0) {
            parts.push(`${this.warnings.length} warnings raised`);
        }
        return parts.join('. ') + '.';
    }
}
// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================
/**
 * Create a new transparency builder for a tool
 */
export function createTransparencyReport(toolName) {
    return new TransparencyBuilder(toolName);
}
/**
 * Format transparency report for human reading
 */
export function formatTransparencyReport(report) {
    const lines = [];
    lines.push('═══════════════════════════════════════════════');
    lines.push(`TRANSPARENCY REPORT: ${report.metadata.toolName}`);
    lines.push('═══════════════════════════════════════════════');
    lines.push('');
    // Summary
    lines.push('SUMMARY:');
    lines.push(`  ${report.summary}`);
    lines.push('');
    // Computational work
    if (report.computationalWork.length > 0) {
        lines.push('WHAT WE COMPUTED:');
        report.computationalWork.forEach((work, i) => {
            lines.push(`  ${i + 1}. ${work.description}`);
            lines.push(`     Method: ${work.method}`);
            lines.push(`     Confidence: ${(work.confidence * 100).toFixed(0)}%`);
            lines.push(`     Time: ${work.timingMs}ms`);
        });
        lines.push('');
    }
    // LLM dependencies
    if (report.llmDependencies.length > 0) {
        lines.push('WHAT NEEDS LLM:');
        report.llmDependencies.forEach((dep, i) => {
            lines.push(`  ${i + 1}. ${dep.description}`);
            lines.push(`     Why: ${dep.rationale}`);
            lines.push(`     Criticality: ${dep.criticality}`);
            lines.push(`     Est. time: ${dep.estimatedTimingMs}ms`);
        });
        lines.push('');
    }
    // Confidence
    lines.push('CONFIDENCE:');
    lines.push(`  Overall: ${(report.confidenceGrounding.score * 100).toFixed(0)}%`);
    lines.push(`  Reasoning: ${report.confidenceGrounding.reasoning}`);
    if (report.confidenceGrounding.factors.length > 0) {
        lines.push('  Factors:');
        report.confidenceGrounding.factors.forEach(factor => {
            lines.push(`    - ${factor}`);
        });
    }
    lines.push('');
    // Timing
    lines.push('TIMING:');
    lines.push(`  Server computation: ${report.timing.totalComputationMs}ms`);
    lines.push(`  Estimated LLM time: ${report.timing.estimatedLLMMs}ms`);
    lines.push(`  Total estimated: ${report.timing.totalComputationMs + report.timing.estimatedLLMMs}ms`);
    lines.push('');
    // Warnings
    if (report.warnings.length > 0) {
        lines.push('WARNINGS:');
        report.warnings.forEach(warning => {
            lines.push(`  ⚠ ${warning}`);
        });
        lines.push('');
    }
    lines.push('═══════════════════════════════════════════════');
    return lines.join('\n');
}
/**
 * Compute honest confidence score based on multiple factors
 *
 * HONEST APPROACH:
 * - High confidence: Based on solid computation (NLP, vectors, etc.)
 * - Medium confidence: Some computation + some LLM needed
 * - Low confidence: Mostly LLM-dependent or fallback methods used
 */
export function computeHonestConfidence(params) {
    const { computationQuality, llmDependencyLevel, fallbackUsed, dataQuality } = params;
    let score = computationQuality * 0.4 + dataQuality * 0.3;
    // Penalize for LLM dependency
    const llmPenalty = {
        low: 0,
        medium: -0.1,
        high: -0.2,
    }[llmDependencyLevel];
    score += llmPenalty;
    // Penalize for fallback
    if (fallbackUsed) {
        score -= 0.15;
    }
    // Add bonus for strong computation
    if (computationQuality > 0.8 && llmDependencyLevel === 'low') {
        score += 0.1;
    }
    // Clamp to 0-1
    score = Math.max(0, Math.min(1, score));
    // Generate reasoning
    const parts = [];
    if (computationQuality > 0.7) {
        parts.push('Strong computational foundation');
    }
    else if (computationQuality > 0.4) {
        parts.push('Moderate computational foundation');
    }
    else {
        parts.push('Weak computational foundation');
    }
    if (llmDependencyLevel === 'high') {
        parts.push('high LLM dependency');
    }
    else if (llmDependencyLevel === 'medium') {
        parts.push('moderate LLM dependency');
    }
    if (fallbackUsed) {
        parts.push('fallback methods used');
    }
    if (dataQuality > 0.7) {
        parts.push('high-quality input data');
    }
    else if (dataQuality < 0.4) {
        parts.push('limited input data');
    }
    const reasoning = parts.join(', ');
    return { score, reasoning };
}
