/**
 * Feedback Service - LLM → MCP Learning Loop
 *
 * PROBLEM: LLM generates outputs but MCP never learns from them
 * SOLUTION: Parse LLM responses, extract feedback, adjust parameters
 *
 * The LLM can now:
 * 1. Rate output quality
 * 2. Report actual semantic distance
 * 3. Evaluate hint usefulness
 * 4. Suggest parameter adjustments
 *
 * The MCP learns:
 * 1. Which parameters work for which concepts
 * 2. Which hints are actually helpful
 * 3. How to calibrate distances better
 * 4. Which cross-domain bridges are productive
 */

import { log } from "../utils/logger.js";
import * as fs from "fs";
import * as path from "path";

/**
 * Feedback from LLM about a tool execution
 */
export interface LLMFeedback {
  toolName: string;
  timestamp: number;

  // Input parameters
  inputParams: any;

  // LLM's assessment (parsed from response)
  actualDistance?: number; // What distance did LLM actually achieve? (0-1)
  qualityRating?: number; // How good was this output? (0-10)
  surpriseLevel?: number; // How surprising? (0-10)
  coherenceLevel?: number; // How coherent? (0-10)
  actionabilityLevel?: number; // How actionable? (0-10)

  // Hint/scaffold quality
  hintsQuality?: "too_close" | "just_right" | "too_far" | "unhelpful";
  scaffoldQuality?: "unclear" | "too_constrained" | "needs_example" | "good";

  // Free-form suggestion
  suggestion?: string;

  // Extracted concepts from LLM response
  destinationConcept?: string;
  becauseChain?: string[];
}

/**
 * Learned parameters for a concept type
 */
export interface LearnedParameters {
  conceptPattern: string; // e.g., ".*network.*", "blockchain.*"
  sampleSize: number; // How many examples

  // Optimal parameters learned
  optimalMagnitude?: number; // Best drift magnitude
  optimalTemperature?: number; // Best temperature

  // Quality statistics
  avgQuality: number;
  avgDistance: number; // How far LLM actually drifted
  successRate: number; // % rated >= 7/10
}

/**
 * Feedback storage and learning
 */
export class FeedbackService {
  private feedbackHistory: LLMFeedback[] = [];
  private learnedParams: Map<string, LearnedParameters> = new Map();
  private persistencePath: string;

  constructor(persistencePath: string = "./.feedback-store.json") {
    this.persistencePath = persistencePath;
    this.loadFromDisk();
  }

  /**
   * Parse feedback from LLM response text
   */
  parseFeedback(
    toolName: string,
    inputParams: any,
    llmResponseText: string,
  ): LLMFeedback | null {
    const feedback: LLMFeedback = {
      toolName,
      timestamp: Date.now(),
      inputParams,
    };

    let foundFeedback = false;

    // Parse semantic_distance_estimate
    const distanceMatch = llmResponseText.match(
      /semantic[_\s]distance[_\s]estimate[:\s]*(\d+)%/i,
    );
    if (distanceMatch) {
      feedback.actualDistance = parseInt(distanceMatch[1]) / 100;
      foundFeedback = true;
    }

    // Parse quality/weirdness scores (0-100% → 0-10 scale)
    const qualityMatch = llmResponseText.match(/quality[:\s]*(\d+)%/i);
    if (qualityMatch) {
      feedback.qualityRating = parseInt(qualityMatch[1]) / 10;
      foundFeedback = true;
    }

    const surpriseMatch = llmResponseText.match(/surprise[:\s]*(\d+)%/i);
    if (surpriseMatch) {
      feedback.surpriseLevel = parseInt(surpriseMatch[1]) / 10;
      foundFeedback = true;
    }

    // Parse scaffold feedback signals
    if (llmResponseText.includes("SCAFFOLD_UNCLEAR")) {
      feedback.scaffoldQuality = "unclear";
      const msgMatch = llmResponseText.match(/SCAFFOLD_UNCLEAR:\s*(.+)/i);
      if (msgMatch) feedback.suggestion = msgMatch[1].trim();
      foundFeedback = true;
    } else if (llmResponseText.includes("SCAFFOLD_TOO_CONSTRAINED")) {
      feedback.scaffoldQuality = "too_constrained";
      const msgMatch = llmResponseText.match(
        /SCAFFOLD_TOO_CONSTRAINED:\s*(.+)/i,
      );
      if (msgMatch) feedback.suggestion = msgMatch[1].trim();
      foundFeedback = true;
    } else if (llmResponseText.includes("SCAFFOLD_NEEDS_EXAMPLE")) {
      feedback.scaffoldQuality = "needs_example";
      const msgMatch = llmResponseText.match(/SCAFFOLD_NEEDS_EXAMPLE:\s*(.+)/i);
      if (msgMatch) feedback.suggestion = msgMatch[1].trim();
      foundFeedback = true;
    }

    // Parse destination concept
    const destMatch = llmResponseText.match(
      /###\s*destination[_\s]concept.*?\n(.+?)(?:\n|$)/is,
    );
    if (destMatch) {
      feedback.destinationConcept = destMatch[1].trim();
      foundFeedback = true;
    }

    // Parse because chain
    const becauseMatch = llmResponseText.match(
      /###\s*(?:drift[_\s]path|because[_\s]chain).*?\n((?:[-•*]\s*.+?\n?)+)/is,
    );
    if (becauseMatch) {
      feedback.becauseChain = becauseMatch[1]
        .split(/\n/)
        .map((line) => line.replace(/^[-•*]\s*/, "").trim())
        .filter((line) => line.length > 0);
      foundFeedback = true;
    }

    return foundFeedback ? feedback : null;
  }

  /**
   * Record feedback
   */
  recordFeedback(feedback: LLMFeedback): void {
    this.feedbackHistory.push(feedback);

    // Update learned parameters
    this.updateLearnedParameters(feedback);

    // Persist to disk immediately for reliability
    this.saveToDisk();

    log("info", "Feedback recorded", {
      tool: feedback.toolName,
      quality: feedback.qualityRating,
      distance: feedback.actualDistance,
    });
  }

  /**
   * Update learned parameters based on feedback
   */
  private updateLearnedParameters(feedback: LLMFeedback): void {
    if (feedback.toolName !== "semantic_drift") return;
    if (!feedback.inputParams?.anchorConcept) return;

    const anchor = feedback.inputParams.anchorConcept.toLowerCase();

    // Find or create learned parameters for this concept type
    let pattern = this.findConceptPattern(anchor);
    if (!pattern) {
      // Create new pattern
      pattern = this.extractConceptPattern(anchor);
      this.learnedParams.set(pattern, {
        conceptPattern: pattern,
        sampleSize: 0,
        avgQuality: 0,
        avgDistance: 0,
        successRate: 0,
      });
    }

    const learned = this.learnedParams.get(pattern)!;
    const n = learned.sampleSize;

    // Update running averages
    if (feedback.qualityRating !== undefined) {
      learned.avgQuality =
        (learned.avgQuality * n + feedback.qualityRating) / (n + 1);
    }
    if (feedback.actualDistance !== undefined) {
      learned.avgDistance =
        (learned.avgDistance * n + feedback.actualDistance) / (n + 1);
    }

    // Update success rate
    if (feedback.qualityRating !== undefined) {
      const success = feedback.qualityRating >= 7 ? 1 : 0;
      learned.successRate = (learned.successRate * n + success) / (n + 1);
    }

    // Learn optimal parameters
    if (feedback.qualityRating !== undefined && feedback.qualityRating >= 7) {
      if (
        !learned.optimalMagnitude ||
        feedback.qualityRating > learned.avgQuality
      ) {
        learned.optimalMagnitude = feedback.inputParams.driftMagnitude;
        learned.optimalTemperature = feedback.inputParams.temperature;
      }
    }

    learned.sampleSize++;
    this.learnedParams.set(pattern, learned);
  }

  /**
   * Extract concept pattern (e.g., "blockchain" → ".*chain.*")
   */
  private extractConceptPattern(concept: string): string {
    // Simple pattern: main word + wildcards
    const words = concept.split(/\s+/).filter((w) => w.length > 3);
    if (words.length === 0) return concept;

    const mainWord = words[0];
    return `.*${mainWord}.*`;
  }

  /**
   * Find existing pattern that matches concept
   */
  private findConceptPattern(concept: string): string | null {
    for (const pattern of this.learnedParams.keys()) {
      const regex = new RegExp(pattern, "i");
      if (regex.test(concept)) {
        return pattern;
      }
    }
    return null;
  }

  /**
   * Get optimal parameters for a concept
   */
  getOptimalParameters(concept: string): Partial<LearnedParameters> | null {
    const pattern = this.findConceptPattern(concept);
    if (!pattern) return null;

    const learned = this.learnedParams.get(pattern);
    if (!learned || learned.sampleSize < 3) return null; // Need at least 3 samples

    return learned;
  }

  /**
   * Get feedback statistics for a tool
   */
  getStats(toolName: string): {
    totalFeedback: number;
    avgQuality: number;
    avgDistance: number;
    scaffoldIssues: number;
    learnedPatterns: number;
  } {
    const toolFeedback = this.feedbackHistory.filter(
      (f) => f.toolName === toolName,
    );

    const qualities = toolFeedback
      .map((f) => f.qualityRating)
      .filter((q): q is number => q !== undefined);

    const distances = toolFeedback
      .map((f) => f.actualDistance)
      .filter((d): d is number => d !== undefined);

    const scaffoldIssues = toolFeedback.filter(
      (f) => f.scaffoldQuality && f.scaffoldQuality !== "good",
    ).length;

    return {
      totalFeedback: toolFeedback.length,
      avgQuality:
        qualities.length > 0
          ? qualities.reduce((a, b) => a + b, 0) / qualities.length
          : 0,
      avgDistance:
        distances.length > 0
          ? distances.reduce((a, b) => a + b, 0) / distances.length
          : 0,
      scaffoldIssues,
      learnedPatterns: this.learnedParams.size,
    };
  }

  /**
   * Get recent feedback
   */
  getRecent(limit: number = 10): LLMFeedback[] {
    return this.feedbackHistory.slice(-limit);
  }

  /**
   * Save to disk
   */
  private saveToDisk(): void {
    try {
      const data = {
        feedbackHistory: this.feedbackHistory,
        learnedParams: Array.from(this.learnedParams.entries()),
        savedAt: Date.now(),
      };

      fs.writeFileSync(this.persistencePath, JSON.stringify(data, null, 2));
      log("debug", `Feedback saved to ${this.persistencePath}`);
    } catch (error) {
      log("error", `Failed to save feedback: ${error}`);
    }
  }

  /**
   * Load from disk
   */
  private loadFromDisk(): void {
    try {
      if (!fs.existsSync(this.persistencePath)) {
        log("debug", "No existing feedback file - starting fresh");
        return;
      }

      const data = JSON.parse(fs.readFileSync(this.persistencePath, "utf-8"));

      this.feedbackHistory = data.feedbackHistory || [];

      if (data.learnedParams) {
        this.learnedParams = new Map(data.learnedParams);
      }

      log(
        "info",
        `Loaded ${this.feedbackHistory.length} feedback items from disk`,
      );
    } catch (error) {
      log("error", `Failed to load feedback: ${error}`);
    }
  }

  /**
   * Export all data
   */
  exportData() {
    return {
      feedbackHistory: this.feedbackHistory,
      learnedParams: Array.from(this.learnedParams.entries()),
      stats: {
        totalItems: this.feedbackHistory.length,
        patternsLearned: this.learnedParams.size,
      },
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.feedbackHistory = [];
    this.learnedParams.clear();
    this.saveToDisk();
  }
}

// Global instance
let globalFeedbackService: FeedbackService | null = null;

/**
 * Get global feedback service
 */
export function getFeedbackService(): FeedbackService {
  if (!globalFeedbackService) {
    globalFeedbackService = new FeedbackService();
  }
  return globalFeedbackService;
}

/**
 * Set custom feedback service (for testing)
 */
export function setFeedbackService(service: FeedbackService): void {
  globalFeedbackService = service;
}
