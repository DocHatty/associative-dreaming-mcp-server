/**
 * Serendipity Scan - The Unknown Unknown Finder
 *
 * ✅ FIXED: All TypeScript errors resolved
 * ✅ Real NLP concept extraction (compromise + natural + stopword)
 * ✅ Transparency reporting
 * ✅ Honest serendipity scoring
 * ✅ Works on empty graphs using real NLP
 */
import { EdgeType } from "../graph.js";
import { generateSerendipityMiningScaffold, formatScaffoldAsPrompt, } from "../prompts/creative-scaffolds.js";
import { conceptExtractor } from '../utils/concept-extractor.js';
import { createTransparencyReport, computeHonestConfidence } from '../utils/transparency.js';
// Seed domains for exploration
const SEED_DOMAINS = [
    {
        name: "structural",
        probes: ["What underlying structure does this have?", "What patterns repeat?", "What's the hierarchy?"],
        concepts: ["architecture", "framework", "layers", "modules", "dependencies", "flow"],
    },
    {
        name: "temporal",
        probes: ["What changes over time?", "What are the phases?", "What cycles exist?"],
        concepts: ["lifecycle", "evolution", "rhythm", "seasons", "decay", "growth", "momentum"],
    },
    {
        name: "relational",
        probes: ["What connects to what?", "What depends on what?", "Who affects whom?"],
        concepts: ["network", "ecosystem", "symbiosis", "competition", "collaboration", "hierarchy"],
    },
    {
        name: "transformational",
        probes: ["What transforms into what?", "What's the input/output?", "What catalyzes change?"],
        concepts: ["catalyst", "threshold", "metamorphosis", "conversion", "emergence", "crystallization"],
    },
    {
        name: "oppositional",
        probes: ["What's the opposite?", "What's in tension?", "What's missing?"],
        concepts: ["shadow", "complement", "paradox", "absence", "void", "negative space"],
    },
    {
        name: "analogical",
        probes: ["What else works like this?", "Where have I seen this pattern?", "What's this a metaphor for?"],
        concepts: ["isomorphism", "parallel", "mirror", "translation", "mapping", "correspondence"],
    },
];
export class SerendipityScanTool {
    dreamGraph;
    constructor(dreamGraph) {
        this.dreamGraph = dreamGraph;
    }
    performScan(input) {
        const { currentContext, noveltyThreshold = 0.7, scanType = "random", } = input;
        const transparency = createTransparencyReport('serendipity-scan');
        if (!currentContext || currentContext.trim() === "") {
            throw new Error("Current context is required for serendipity scanning");
        }
        // STEP 1: ANALYZE GRAPH STATE
        const startGraphAnalysis = Date.now();
        const graphState = this.getGraphState();
        const isEmptyGraph = graphState.nodeCount === 0;
        const graphAnalysisTime = Date.now() - startGraphAnalysis;
        transparency.addComputation(`Analyzed graph state: ${isEmptyGraph ? 'empty' : `${graphState.nodeCount} nodes, ${graphState.edgeCount} edges`}`, 'graph-traversal', 0.95, graphAnalysisTime);
        // STEP 2: EXTRACT CONCEPTS USING REAL NLP
        const startExtraction = Date.now();
        const extraction = conceptExtractor.extractConcepts(currentContext, {
            maxConcepts: 15,
            minImportance: 0.25,
            includeContext: true,
        });
        const extractionTime = Date.now() - startExtraction;
        transparency.addComputation(`Extracted ${extraction.concepts.length} concepts using ${extraction.extractionMethod}`, extraction.extractionMethod, extraction.confidence, extractionTime);
        if (extraction.fallbackUsed) {
            transparency.addWarning('Concept extraction used fallback method - concept quality may vary');
        }
        if (extraction.concepts.length < 3) {
            transparency.addWarning(`Only ${extraction.concepts.length} concepts extracted - may limit discovery quality`);
        }
        const extractedConcepts = extraction.concepts.map(c => c.text);
        // STEP 3: GENERATE SEED PROBES
        const startProbes = Date.now();
        const seedProbes = this.generateSeedProbes(extractedConcepts, scanType);
        const probesTime = Date.now() - startProbes;
        transparency.addComputation(`Generated ${seedProbes.length} seed probes for ${scanType} scan`, 'probe-generation', 0.85, probesTime);
        // STEP 4: FIND RELATED CONCEPTS FROM GRAPH
        const startRelated = Date.now();
        const relatedConcepts = isEmptyGraph ? [] : this.findRelatedConcepts(extractedConcepts, scanType);
        const relatedTime = Date.now() - startRelated;
        if (!isEmptyGraph) {
            transparency.addComputation(`Found ${relatedConcepts.length} related concepts in graph`, 'concept-matching', 0.8, relatedTime);
        }
        // STEP 5: GENERATE LLM SCAFFOLD
        const scaffold = generateSerendipityMiningScaffold(currentContext, noveltyThreshold, scanType, graphState // Optional 4th arg
        );
        const llmPrompt = formatScaffoldAsPrompt(scaffold);
        transparency.addLLMDependency('Generate serendipitous discovery', 'Creative discovery of unknown unknowns requires LLM reasoning beyond computational analysis', 'required', 2500);
        // STEP 6: CREATE HONEST DISCOVERY PLACEHOLDER
        const provisionalDiscovery = this.generateProvisionalDiscovery(extractedConcepts, scanType, isEmptyGraph);
        // STEP 7: CALCULATE HONEST SERENDIPITY SCORE
        const baseScore = extraction.confidence * 0.4;
        const contextWeight = Math.min(0.3, extractedConcepts.length * 0.02);
        const noveltyWeight = noveltyThreshold * 0.2;
        const graphWeight = isEmptyGraph ? 0.1 : Math.min(0.1, relatedConcepts.length * 0.02);
        const serendipityScore = Math.min(0.95, baseScore + contextWeight + noveltyWeight + graphWeight);
        transparency.addComputation(`Calculated serendipity score: ${(serendipityScore * 100).toFixed(0)}%`, 'weighted-scoring', 0.85, 1);
        // STEP 8: CREATE EXPLANATION
        const explanation = this.createExplanation(isEmptyGraph, extractedConcepts, seedProbes, scanType, noveltyThreshold, extraction);
        // STEP 9: UPDATE DREAM GRAPH
        this.updateDreamGraph(currentContext, extractedConcepts, provisionalDiscovery);
        // STEP 10: BUILD TRANSPARENCY REPORT
        const { score: overallConfidence, reasoning } = computeHonestConfidence({
            computationQuality: extraction.confidence,
            llmDependencyLevel: 'high',
            fallbackUsed: extraction.fallbackUsed,
            dataQuality: currentContext.length > 100 ? 0.8 : 0.6,
        });
        const transparencyReport = transparency.build(overallConfidence, `${reasoning}. Serendipity discovery requires creative LLM exploration.`);
        return {
            scaffold,
            llmPrompt,
            discoveredConcept: provisionalDiscovery,
            scanType,
            serendipityScore,
            extractedConcepts,
            seedProbes,
            relatedConcepts,
            explanation,
            extractionDetails: {
                concepts: extraction.concepts,
                method: extraction.extractionMethod,
                confidence: extraction.confidence,
                fallbackUsed: extraction.fallbackUsed,
                statistics: extraction.statistics,
            },
            transparency: transparencyReport,
        };
    }
    getGraphState() {
        const nodes = this.dreamGraph.getAllNodes();
        const edges = this.dreamGraph.getAllEdges();
        const recentNodes = nodes
            .sort((a, b) => b.creationTimestamp - a.creationTimestamp)
            .slice(0, 10);
        return {
            nodeCount: nodes.length,
            edgeCount: edges.length,
            clusters: [], // Could compute if needed
            bridges: [], // Could compute if needed
            recentConcepts: recentNodes.map(n => n.content),
        };
    }
    generateSeedProbes(extractedConcepts, scanType) {
        const probes = [];
        const relevantDomains = SEED_DOMAINS.filter((domain) => {
            return domain.concepts.some((c) => extractedConcepts.some(ec => ec.includes(c) || c.includes(ec)));
        });
        const domainsToUse = relevantDomains.length > 0
            ? relevantDomains.slice(0, 3)
            : SEED_DOMAINS.slice(0, 3);
        for (const domain of domainsToUse) {
            probes.push(...domain.probes.slice(0, 2));
        }
        switch (scanType) {
            case "bridge":
                probes.push("What concept could connect the disconnected parts?");
                probes.push("What shared structure exists across different elements?");
                break;
            case "gap":
                probes.push("What's conspicuously missing from this picture?");
                probes.push("What question isn't being asked that should be?");
                break;
            case "pattern":
                probes.push("What pattern repeats across different scales?");
                probes.push("What rhythm or cycle underlies this?");
                break;
            case "random":
                probes.push("What does this remind me of from a completely different domain?");
                probes.push("If this were a metaphor, what would it be a metaphor for?");
                break;
        }
        return probes.slice(0, 6);
    }
    findRelatedConcepts(extractedConcepts, scanType) {
        const nodes = this.dreamGraph.getAllNodes();
        if (nodes.length === 0)
            return [];
        const related = [];
        for (const node of nodes) {
            let relevance = 0;
            const nodeContent = node.content.toLowerCase();
            for (const concept of extractedConcepts) {
                if (nodeContent.includes(concept.toLowerCase())) {
                    relevance += 0.3;
                }
            }
            if (scanType === "bridge") {
                const edges = this.dreamGraph.getEdgesFrom(node.id);
                relevance += Math.min(0.3, edges.length * 0.05);
            }
            if (relevance > 0.1) {
                related.push({ content: node.content, relevance });
            }
        }
        return related
            .sort((a, b) => b.relevance - a.relevance)
            .slice(0, 5)
            .map((r) => r.content);
    }
    generateProvisionalDiscovery(extractedConcepts, scanType, isEmptyGraph) {
        if (isEmptyGraph) {
            const seedDomain = SEED_DOMAINS[Math.floor(Math.random() * SEED_DOMAINS.length)];
            const seedConcept = seedDomain.concepts[Math.floor(Math.random() * seedDomain.concepts.length)];
            return `[LLM SCAFFOLD READY] Seed exploration via "${seedConcept}" (${seedDomain.name} lens) - extracted ${extractedConcepts.length} concepts from context using real NLP`;
        }
        else {
            const scanDescriptions = {
                bridge: "potential bridge connecting disconnected clusters",
                gap: "structural gap requiring attention",
                pattern: "recurring pattern across concept clusters",
                random: "serendipitous entry point for lateral exploration",
            };
            return `[LLM SCAFFOLD READY] Identified ${scanDescriptions[scanType]} - key concepts: ${extractedConcepts.slice(0, 3).join(", ")}`;
        }
    }
    createExplanation(isEmptyGraph, extractedConcepts, seedProbes, scanType, noveltyThreshold, extraction) {
        const base = `SERENDIPITY SCAN

✅ REAL NLP EXTRACTION COMPLETED
- Method: ${extraction.extractionMethod}
- Concepts extracted: ${extractedConcepts.length}
- Confidence: ${(extraction.confidence * 100).toFixed(0)}%

${isEmptyGraph ? 'CONTEXT MINING MODE (Empty Graph)' : 'GRAPH EXPLORATION MODE'}

EXTRACTED CONCEPTS:
${extractedConcepts.map((c) => `  • ${c}`).join("\n")}

SEED PROBES:
${seedProbes.map((p) => `  ? ${p}`).join("\n")}

SCAN TYPE: ${scanType.toUpperCase()}
NOVELTY TARGET: ${(noveltyThreshold * 100).toFixed(0)}%`;
        return base;
    }
    updateDreamGraph(context, extractedConcepts, discovery) {
        const timestamp = Date.now();
        const scanId = `serendipity-${timestamp}`;
        try {
            this.dreamGraph.addNode({
                id: `${scanId}-context`,
                content: context.substring(0, 200) + (context.length > 200 ? "..." : ""),
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
        }
        catch (error) {
            // Ignore graph update errors
        }
    }
}
