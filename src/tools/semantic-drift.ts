/**
 * Semantic Drift - Controlled Hallucination Engine
 *
 * This tool implements a stochastic random walk through the concept space,
 * seeking semantically distant yet contextually relevant concepts.
 *
 * PHILOSOPHY:
 * - Server provides STRUCTURE (constraints, distance targets, concept extraction)
 * - LLM provides CREATIVITY (the actual semantic leap)
 * - Everything is TRACEABLE with "because chains"
 */

import { DreamGraph, Node, EdgeType } from "../graph.js";
import {
  generateSemanticLeapScaffold,
  formatScaffoldAsPrompt,
  CreativeScaffold,
} from "../prompts/creative-scaffolds.js";

import {
  conceptExtractor,
  ExtractedConcept,
} from "../utils/concept-extractor.js";
import {
  createTransparencyReport,
  TransparencyReport,
  computeHonestConfidence,
} from "../utils/transparency.js";

import { getEmbeddingService } from "../services/embedding-service.js";

import { getHintService } from "../services/hint-service.js";

/**
 * Association hint - used to suggest directions, not determine them
 * Dynamically computed from graph structure
 */
interface AssociationHint {
  concept: string;
  direction: string;
  distanceRange: [number, number];
  confidence?: number; // 0-1, based on graph structure
  source?: "graph" | "embedding" | "fallback";
}



export interface SemanticDriftInput {
  anchorConcept: string;
  driftMagnitude: number; // 0.0 to 1.0
  temperature?: number; // 0.0 to 1.0
}

export interface SemanticDriftOutput {
  scaffold: CreativeScaffold;
  llmPrompt: string;
  anchorConcept: string;
  suggestedDirection: string;
  explorationPath: string[];
  driftDistance: number; // Target distance from user input

    computedCandidates?: Array<{ concept: string; distance: number }>; // Actual computed distances
  embeddingProvider?: string; // Which provider was used

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
export class SemanticDriftTool {
  private dreamGraph: DreamGraph;

  constructor(dreamGraph: DreamGraph) {
    this.dreamGraph = dreamGraph;
  }

  public async performDrift(
    input: SemanticDriftInput,
  ): Promise<SemanticDriftOutput> {
    let { anchorConcept, driftMagnitude, temperature = 0.7 } = input;
    const transparency = createTransparencyReport("semantic-drift");

    // Validate input
    if (driftMagnitude < 0 || driftMagnitude > 1) {
      throw new Error("Drift magnitude must be between 0.0 and 1.0");
    }

        const { getFeedbackService } = await import(
      "../services/feedback-service.js"
    );
    const feedbackService = getFeedbackService();
    const learnedParams = feedbackService.getOptimalParameters(anchorConcept);

    if (
      learnedParams &&
      learnedParams.sampleSize !== undefined &&
      learnedParams.sampleSize >= 3
    ) {
      transparency.addComputation(
        `Applied learned parameters from ${learnedParams.sampleSize} previous feedback samples (avg quality: ${learnedParams.avgQuality?.toFixed(1) || "N/A"}/10)`,
        "parameter-learning",
        0.95,
        0,
      );

      // Override parameters with learned values if they exist
      if (learnedParams.optimalMagnitude !== undefined) {
        driftMagnitude = learnedParams.optimalMagnitude;
        transparency.addComputation(
          `Drift magnitude adjusted to learned optimal: ${(driftMagnitude * 100).toFixed(0)}%`,
          "parameter-adjustment",
          0.9,
          0,
        );
      }
      if (learnedParams.optimalTemperature !== undefined) {
        temperature = learnedParams.optimalTemperature;
        transparency.addComputation(
          `Temperature adjusted to learned optimal: ${(temperature * 100).toFixed(0)}%`,
          "parameter-adjustment",
          0.9,
          0,
        );
      }
    }
    // 
    const startExtraction = Date.now();

    const extraction = conceptExtractor.extractConcepts(anchorConcept, {
      maxConcepts: 8,
      minImportance: 0.25,
    });

    const extractionTime = Date.now() - startExtraction;

    transparency.addComputation(
      `Extracted ${extraction.concepts.length} concepts from anchor using ${extraction.extractionMethod}`,
      extraction.extractionMethod,
      extraction.confidence,
      extractionTime,
    );

    if (extraction.fallbackUsed) {
      transparency.addWarning(
        "Used fallback extraction method - concept quality may vary",
      );
    }
    // 
    const startHints = Date.now();

        const hintService = getHintService(this.dreamGraph);
    const associationHints = await hintService.getAssociationHints(
      anchorConcept,
      driftMagnitude,
      5, // max hints
    );
    const bridgeObjects =
      driftMagnitude > 0.6
        ? hintService.getCrossDomainBridges(anchorConcept, 5)
        : [];
    const bridgeSuggestions = bridgeObjects.map(
      (b) => `${b.from} ↔ ${b.to}: ${b.bridge}`,
    );

    const hintsTime = Date.now() - startHints;

    transparency.addComputation(
      `Gathered ${associationHints.length} graph-based hints (${associationHints.filter((h) => h.source === "graph").length} from graph structure, ${associationHints.filter((h) => h.source === "embedding").length} from embeddings) and ${bridgeSuggestions.length} cross-domain bridges`,
      "hint-matching",
      0.9,
      hintsTime,
    );

    // ═══════════════════════════════════════════════════════════════════
    // STEP 2.5: COMPUTE REAL SEMANTIC DISTANCES (PHASE 2)
    // ═══════════════════════════════════════════════════════════════════

    const startEmbedding = Date.now();
    let computedCandidates: Array<{ concept: string; distance: number }> = [];
    let embeddingProvider = "none";

    try {
      const embeddingService = getEmbeddingService();
      embeddingProvider = embeddingService.getCacheStats().provider;

      // Get all graph nodes as candidates for distance computation
      const allNodes = this.dreamGraph.getAllNodes();
      const candidates = allNodes
        .map((n) => n.content)
        .filter((c) => c !== anchorConcept);

      // If we have candidates, compute actual distances
      if (candidates.length > 0) {
        computedCandidates = await embeddingService.findConceptsAtDistance(
          anchorConcept,
          driftMagnitude,
          candidates.slice(0, 100), // Limit to 100 most recent for performance
          0.15, // Tolerance
        );

        const embeddingTime = Date.now() - startEmbedding;
        transparency.addComputation(
          `Computed semantic distances for ${candidates.length} concepts using ${embeddingProvider}`,
          "embedding-distance",
          computedCandidates.length > 0 ? 0.95 : 0.5,
          embeddingTime,
        );

        if (computedCandidates.length > 0) {
          transparency.addComputation(
            `Found ${computedCandidates.length} concepts at target distance ${(driftMagnitude * 100).toFixed(0)}%`,
            "distance-filtering",
            0.9,
            0,
          );
        }
      } else {
        transparency.addComputation(
          "No graph candidates yet - using hints only",
          "embedding-distance",
          0.3,
          Date.now() - startEmbedding,
        );
      }
    } catch (error) {
      // Embedding service failed - fall back to hints only
      transparency.addWarning(
        `Embedding service error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      transparency.addComputation(
        "Falling back to hint-based suggestions",
        "embedding-fallback",
        0.4,
        Date.now() - startEmbedding,
      );
    }
    // 
    const scaffold = generateSemanticLeapScaffold(
      anchorConcept,
      driftMagnitude,
      anchorConcept,
      temperature,
    );

    const llmPrompt = formatScaffoldAsPrompt(scaffold);

    transparency.addLLMDependency(
      "Generate creative semantic leap",
      "Creative reasoning requires LLM to explore conceptual space and make justified leaps",
      "required",
      2000,
    );
    // 
    const { suggestedDirection, explorationPath } = this.generateDriftGuidance(
      anchorConcept,
      driftMagnitude,
      associationHints,
      bridgeSuggestions,
    );
    // 
    const explanation = this.createExplanation(
      anchorConcept,
      driftMagnitude,
      temperature,
      associationHints,
      bridgeSuggestions,
      extraction,
    );
    // 
    this.updateDreamGraph(
      anchorConcept,
      suggestedDirection,
      explorationPath,
      driftMagnitude,
    );
    // 
    const { score: overallConfidence, reasoning } = computeHonestConfidence({
      computationQuality: extraction.confidence,
      llmDependencyLevel: "high",
      fallbackUsed: extraction.fallbackUsed,
      dataQuality: anchorConcept.length > 10 ? 0.8 : 0.6,
    });

    const transparencyReport = transparency.build(
      overallConfidence,
      `${reasoning}. Drift guidance computed, creative leap requires LLM.`,
    );

    return {
      scaffold,
      llmPrompt,
      anchorConcept,
      suggestedDirection,
      explorationPath,
      driftDistance: driftMagnitude,

            computedCandidates:
        computedCandidates.length > 0
          ? computedCandidates.slice(0, 5)
          : undefined,
      embeddingProvider,

      associationHints,
      bridgeSuggestions,
      explanation,
      extractedConcepts: extraction.concepts,
      extractionMethod: extraction.extractionMethod,
      extractionConfidence: extraction.confidence,
      transparency: transparencyReport,
    };
  }

  

  private generateDriftGuidance(
    anchor: string,
    driftMagnitude: number,
    hints: AssociationHint[],
    bridges: string[],
  ): { suggestedDirection: string; explorationPath: string[] } {
    const path = [anchor];

    if (driftMagnitude > 0.7 && bridges.length > 0) {
      const bridge = bridges[0];
      path.push(`Consider cross-domain bridge: ${bridge}`);
      return {
        suggestedDirection: `High-magnitude drift (${(driftMagnitude * 100).toFixed(0)}%) - explore cross-domain connections like: ${bridge}`,
        explorationPath: path,
      };
    }

    if (hints.length > 0) {
      const hint = hints[0];
      path.push(`Direction: ${hint.direction}`);
      path.push(`Suggestion: ${hint.concept}`);
      return {
        suggestedDirection: `"${anchor}" explored ${hint.direction} toward concepts like "${hint.concept}"`,
        explorationPath: path,
      };
    }

    const distanceDesc =
      driftMagnitude < 0.4
        ? "nearby"
        : driftMagnitude < 0.7
          ? "moderate"
          : "distant";
    return {
      suggestedDirection: `Seeking ${distanceDesc} semantic neighbors of "${anchor}" (${(driftMagnitude * 100).toFixed(0)}% drift)`,
      explorationPath: [anchor, `Target: ${distanceDesc} drift exploration`],
    };
  }

  private createExplanation(
    anchor: string,
    driftMagnitude: number,
    temperature: number,
    hints: AssociationHint[],
    bridges: string[],
    extraction: any,
  ): string {
    const distanceDesc =
      driftMagnitude < 0.4
        ? "CONSERVATIVE (nearby neighbors)"
        : driftMagnitude < 0.7
          ? "MODERATE (related but distinct domains)"
          : "ADVENTUROUS (cross-domain leaps)";
    const tempDesc =
      temperature < 0.4
        ? "LOW (prefer structured connections)"
        : temperature < 0.7
          ? "MEDIUM (balance structure and surprise)"
          : "HIGH (embrace randomness)";

    return `SEMANTIC DRIFT SCAFFOLD

NLP EXTRACTION COMPLETED
- Method: ${extraction.extractionMethod}
- Concepts extracted: ${extraction.concepts.length}
- Confidence: ${(extraction.confidence * 100).toFixed(0)}%

ANCHOR: "${anchor}"
DRIFT MAGNITUDE: ${(driftMagnitude * 100).toFixed(0)}% - ${distanceDesc}
TEMPERATURE: ${(temperature * 100).toFixed(0)}% - ${tempDesc}

ASSOCIATION HINTS (suggestions, not deterministic):
${hints.map((h) => `  • ${h.concept} (${h.direction})`).join("\n")}

${
  bridges.length > 0
    ? `CROSS-DOMAIN BRIDGES (for high drift):
${bridges.map((b) => `  ⟷ ${b}`).join("\n")}`
    : ""
}

The 'llmPrompt' field contains a complete prompt that will generate:
- The actual destination concept (not a template)
- The drift path with reasoning at each step
- Why this connection is meaningful (not just clever)
- How this reframes the original anchor`;
  }

  private updateDreamGraph(
    anchor: string,
    suggestedDirection: string,
    explorationPath: string[],
    driftMagnitude: number,
  ): void {
    const timestamp = Date.now();
    const anchorId = `drift-anchor-${timestamp}`;
    const scaffoldId = `drift-scaffold-${timestamp}`;

    try {
      this.dreamGraph.addNode({
        id: anchorId,
        content: anchor,
        creationTimestamp: timestamp,
        source: "semantic_drift",
        metadata: { role: "anchor", driftMagnitude },
      });
    } catch (error) {
      // Node might already exist
    }

    try {
      this.dreamGraph.addNode({
        id: scaffoldId,
        content: `Semantic drift scaffold: ${suggestedDirection}`,
        creationTimestamp: timestamp,
        source: "semantic_drift",
        metadata: {
          role: "scaffold",
          type: "semantic_drift",
          anchorConcept: anchor,
          driftMagnitude,
          explorationPath,
          isScaffold: true,
        },
      });

      this.dreamGraph.addEdge({
        source: anchorId,
        target: scaffoldId,
        type: EdgeType.TRANSFORMS_INTO,
        weight: 1.0 - driftMagnitude,
        metadata: {
          explorationPath,
          driftMagnitude,
          scaffoldType: "semantic_drift",
        },
      });

      this.dreamGraph.visitNode(scaffoldId);
    } catch (error) {
      // Silently ignore graph errors
    }
  }
}
