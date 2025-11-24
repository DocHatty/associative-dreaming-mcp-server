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

import { DreamGraph, Node, EdgeType } from "../graph.js";
import {
  generateSerendipityMiningScaffold,
  formatScaffoldAsPrompt,
  CreativeScaffold,
  GraphStateContext,
} from "../prompts/creative-scaffolds.js";

// ✅ PHASE 1: Import real NLP and transparency
import {
  conceptExtractor,
  ExtractedConcept,
  ConceptExtractionResult,
} from "../utils/concept-extractor.js";
import {
  createTransparencyReport,
  TransparencyReport,
  computeHonestConfidence,
} from "../utils/transparency.js";

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

  // ✅ PHASE 1: Add transparency
  transparency: TransparencyReport;

  // ✅ PHASE 1: Add extraction details
  extractionDetails: ConceptExtractionResult;
}

export class SerendipityScanTool {
  constructor(private dreamGraph: DreamGraph) {}

  async execute(input: SerendipityScanInput): Promise<SerendipityScanOutput> {
    // ✅ PHASE 1: Create transparency tracker
    const transparency = createTransparencyReport("serendipity-scan");

    const scanType = input.scanType ?? "random";
    const noveltyThreshold = input.noveltyThreshold ?? 0.7;

    // ═══════════════════════════════════════════════════════════════════
    // STEP 1: EXTRACT CONCEPTS USING REAL NLP (NO MORE FAKE EXTRACTION)
    // ═══════════════════════════════════════════════════════════════════

    const startExtraction = Date.now();

    // ✅ REAL NLP EXTRACTION
    const extraction = conceptExtractor.extractConcepts(input.context, {
      maxConcepts: 10,
      minImportance: 0.3,
      includeContext: true,
    });

    const extractionTime = Date.now() - startExtraction;

    // ✅ Record what we actually did
    transparency.addComputation(
      `Extracted ${extraction.concepts.length} concepts using ${extraction.extractionMethod}`,
      extraction.extractionMethod,
      extraction.confidence,
      extractionTime,
    );

    // ✅ Add warnings if extraction had issues
    if (extraction.fallbackUsed) {
      transparency.addWarning(
        "Concept extraction used fallback method - concept quality may vary",
      );
    }

    if (extraction.concepts.length < 3) {
      transparency.addWarning(
        `Only ${extraction.concepts.length} concepts extracted - may limit discovery quality`,
      );
    }

    // Extract just the concept texts
    const extractedConcepts = extraction.concepts.map((c) => c.text);

    // ═══════════════════════════════════════════════════════════════════
    // STEP 2: ANALYZE GRAPH STATE
    // ═══════════════════════════════════════════════════════════════════

    const startGraphAnalysis = Date.now();

    const isEmptyGraph = this.dreamGraph.getAllNodes().length === 0;
    const relatedConcepts = isEmptyGraph
      ? []
      : this.findRelatedConcepts(extractedConcepts);

    const graphAnalysisTime = Date.now() - startGraphAnalysis;

    transparency.addComputation(
      `Analyzed graph state: ${isEmptyGraph ? "empty" : `${relatedConcepts.length} related concepts found`}`,
      "graph-traversal",
      isEmptyGraph ? 0.9 : 0.95,
      graphAnalysisTime,
    );

    // ═══════════════════════════════════════════════════════════════════
    // STEP 3: GENERATE SEED PROBES
    // ═══════════════════════════════════════════════════════════════════

    const startProbeGeneration = Date.now();

    const seedProbes = this.generateSeedProbes(
      extractedConcepts,
      scanType,
      isEmptyGraph,
    );

    const probeGenerationTime = Date.now() - startProbeGeneration;

    transparency.addComputation(
      `Generated ${seedProbes.length} seed probes for ${scanType} scan`,
      "probe-generation",
      0.85,
      probeGenerationTime,
    );

    // ═══════════════════════════════════════════════════════════════════
    // STEP 4: CREATE LLM SCAFFOLD (HONEST ABOUT LLM DEPENDENCY)
    // ═══════════════════════════════════════════════════════════════════

    const graphContext: GraphStateContext = {
      nodeCount: this.dreamGraph.getAllNodes().length,
      edgeCount: this.dreamGraph.getAllEdges().length,
      clusters: [],
      bridges: [],
      recentConcepts: [],
    };

    const scaffold = generateSerendipityMiningScaffold(
      input.context,
      noveltyThreshold,
      scanType,
      graphContext,
    );

    const llmPrompt = formatScaffoldAsPrompt(scaffold);

    // ✅ Be honest about LLM dependency
    transparency.addLLMDependency(
      "Generate serendipitous discovery",
      "Creative discovery of unknown unknowns requires LLM reasoning beyond computational analysis",
      "required",
      2500, // estimated 2.5 seconds
    );

    // ═══════════════════════════════════════════════════════════════════
    // STEP 5: CREATE HONEST DISCOVERY PLACEHOLDER
    // ═══════════════════════════════════════════════════════════════════

    // ✅ NO MORE FAKE TEMPLATE STRINGS
    // Instead, we provide a clear scaffold prompt
    const discoveredConcept = `[LLM SCAFFOLD READY] Context analyzed (${extractedConcepts.length} concepts). Ready for Claude to discover serendipitous connections.`;

    // ═══════════════════════════════════════════════════════════════════
    // STEP 6: CALCULATE HONEST SERENDIPITY SCORE
    // ═══════════════════════════════════════════════════════════════════

    // ✅ NO MORE Math.random()!
    // Base score on actual extraction quality and graph state
    const baseScore = extraction.confidence * 0.5; // 50% weight on extraction
    const contextWeight = Math.min(0.3, extractedConcepts.length * 0.03); // More concepts = more potential
    const noveltyWeight = noveltyThreshold * 0.2; // User's novelty preference

    const serendipityScore = Math.min(
      0.95,
      baseScore + contextWeight + noveltyWeight,
    );

    transparency.addComputation(
      `Calculated serendipity score: ${(serendipityScore * 100).toFixed(0)}%`,
      "weighted-scoring",
      0.8,
      1, // trivial computation time
    );

    // ═══════════════════════════════════════════════════════════════════
    // STEP 7: BUILD TRANSPARENCY REPORT
    // ═══════════════════════════════════════════════════════════════════

    const { score: overallConfidence, reasoning } = computeHonestConfidence({
      computationQuality: extraction.confidence,
      llmDependencyLevel: "high", // We need LLM for creative discovery
      fallbackUsed: extraction.fallbackUsed,
      dataQuality: Math.min(1.0, extractedConcepts.length / 10), // More concepts = better data
    });

    const transparencyReport = transparency.build(overallConfidence, reasoning);

    // ═══════════════════════════════════════════════════════════════════
    // STEP 8: CREATE EXPLANATION
    // ═══════════════════════════════════════════════════════════════════

    const explanation = this.createHonestExplanation(
      isEmptyGraph,
      extractedConcepts,
      seedProbes,
      scanType,
      noveltyThreshold,
      extraction,
    );

    // ═══════════════════════════════════════════════════════════════════
    // STEP 9: UPDATE GRAPH (if needed)
    // ═══════════════════════════════════════════════════════════════════

    this.updateDreamGraph(input.context, extractedConcepts, discoveredConcept);

    // ═══════════════════════════════════════════════════════════════════
    // RETURN HONEST OUTPUT
    // ═══════════════════════════════════════════════════════════════════

    return {
      scaffold,
      llmPrompt,
      discoveredConcept,
      serendipityScore,
      explanation,
      extractedConcepts,
      transparency: transparencyReport, // ✅ Full transparency
      extractionDetails: extraction, // ✅ Show extraction provenance
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════

  private findRelatedConcepts(extractedConcepts: string[]): string[] {
    const related: string[] = [];
    const nodes = this.dreamGraph.getAllNodes();

    for (const node of nodes) {
      for (const concept of extractedConcepts) {
        if (node.content.toLowerCase().includes(concept.toLowerCase())) {
          related.push(node.content);
          break;
        }
      }
    }

    return related.slice(0, 10);
  }

  private generateSeedProbes(
    concepts: string[],
    scanType: string,
    isEmptyGraph: boolean,
  ): string[] {
    const probes: string[] = [];

    if (isEmptyGraph) {
      // Generate probes based on concepts
      if (concepts.length > 0) {
        probes.push(
          `What unexpected connections exist between ${concepts[0]} and seemingly unrelated domains?`,
        );
      }
      if (concepts.length > 1) {
        probes.push(
          `What would ${concepts[1]} look like if viewed through a completely different lens?`,
        );
      }
      if (concepts.length > 2) {
        probes.push(
          `What's the hidden relationship between ${concepts[0]} and ${concepts[2]}?`,
        );
      }
    } else {
      // Graph-specific probes
      if (scanType === "bridge") {
        probes.push("What concept could bridge these disconnected clusters?");
      } else if (scanType === "gap") {
        probes.push("What obvious concept is conspicuously missing?");
      } else if (scanType === "pattern") {
        probes.push("What hidden pattern repeats across these concepts?");
      }
    }

    return probes;
  }

  private createHonestExplanation(
    isEmptyGraph: boolean,
    extractedConcepts: string[],
    seedProbes: string[],
    scanType: string,
    noveltyThreshold: number,
    extraction: ConceptExtractionResult,
  ): string {
    const lines: string[] = [];

    lines.push("SERENDIPITY SCAN - AUTHENTIC ANALYSIS");
    lines.push("");
    lines.push(
      `MODE: ${isEmptyGraph ? "Context Mining" : "Graph Exploration"}`,
    );
    lines.push(`SCAN TYPE: ${scanType.toUpperCase()}`);
    lines.push(`NOVELTY TARGET: ${(noveltyThreshold * 100).toFixed(0)}%`);
    lines.push("");

    lines.push("CONCEPT EXTRACTION:");
    lines.push(`  Method: ${extraction.extractionMethod}`);
    lines.push(`  Confidence: ${(extraction.confidence * 100).toFixed(0)}%`);
    lines.push(`  Extracted: ${extractedConcepts.length} concepts`);
    if (extraction.fallbackUsed) {
      lines.push("  ⚠ Fallback method used");
    }
    lines.push("");

    lines.push("EXTRACTED CONCEPTS:");
    extractedConcepts.slice(0, 8).forEach((c) => {
      lines.push(`  • ${c}`);
    });
    if (extractedConcepts.length > 8) {
      lines.push(`  ... and ${extractedConcepts.length - 8} more`);
    }
    lines.push("");

    lines.push("SEED PROBES:");
    seedProbes.forEach((p) => {
      lines.push(`  ? ${p}`);
    });
    lines.push("");

    lines.push("WHAT HAPPENS NEXT:");
    lines.push(
      "The llmPrompt field contains a structured scaffold that will guide",
    );
    lines.push(
      "Claude to discover genuinely serendipitous connections grounded in",
    );
    lines.push("YOUR context (not random hallucinations).");

    return lines.join("\n");
  }

  private updateDreamGraph(
    context: string,
    extractedConcepts: string[],
    discovery: string,
  ): void {
    const timestamp = Date.now();
    const scanId = `serendipity-${timestamp}`;

    try {
      this.dreamGraph.addNode({
        id: `${scanId}-context`,
        content:
          context.substring(0, 200) + (context.length > 200 ? "..." : ""),
        creationTimestamp: timestamp,
        source: "serendipity_scan",
        metadata: {
          role: "scan_context",
          extractedConcepts,
          fullContextLength: context.length,
        },
      });

      this.dreamGraph.addNode({
        id: `${scanId}-discovery`,
        content: discovery,
        creationTimestamp: timestamp + 1,
        source: "serendipity_scan",
        metadata: {
          role: "discovery",
          isPending: true,
        },
      });

      this.dreamGraph.addEdge({
        source: `${scanId}-context`,
        target: `${scanId}-discovery`,
        type: EdgeType.REMINDS_OF,
        weight: 0.6,
        metadata: { scanType: "serendipity" },
      });

      this.dreamGraph.visitNode(`${scanId}-discovery`);
    } catch (error) {
      // Graph updates are non-critical
    }
  }
}
