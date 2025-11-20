/**
 * Serendipity Scan - The Unknown Unknown Finder (V4.0 - ECHO CHAMBER FIX)
 *
 * This tool automates the search for "Unknown Unknowns" - connections and insights
 * that would normally be missed through linear thinking. It analyzes the dream graph
 * using sophisticated graph algorithms to identify structural holes, disconnected clusters,
 * and potential bridges that could connect these disparate ideas.
 *
 * V4.0 CRITICAL FIX - THE ECHO CHAMBER BUG:
 * - Filters out recently visited concepts from traversal history
 * - Implements temporal diversity scoring with configurable recency window
 * - Adds aging mechanism - older concepts gradually become eligible again
 * - Graceful fallback when all concepts are recent
 * - Ensures TRUE serendipity instead of echoing recent history
 *
 * V3.0 ENHANCEMENTS:
 * - TRUE cluster detection using DFS-based community finding
 * - Betweenness centrality for identifying bridge nodes
 * - Meaningful serendipity scoring based on novelty, relevance, and centrality
 * - Context-aware concept discovery with semantic relevance calculation
 * - Rich, formatted explanations for each discovery type
 */

import { DreamGraph, Node, EdgeType } from '../graph.js';

// Types for the serendipity scan tool
export interface SerendipityScanInput {
  currentContext: string; // Description of the current state/focus of exploration
  noveltyThreshold?: number; // 0.0 to 1.0, how novel vs relevant the results should be
  scanType?: 'bridge' | 'gap' | 'pattern' | 'random'; // Optional: specific type of serendipity
  recentHistoryWindow?: number; // How many recent concepts to exclude (default: 10)
}

export interface SerendipityScanOutput {
  discoveredConcept: string;
  scanType: string;
  serendipityScore: number;
  relatedConcepts: string[];
  explanation: string;
}

/**
 * The Serendipity Scan tool (V3.0 - REWRITTEN)
 * Identifies surprising connections and bridges between disconnected concepts
 */
export class SerendipityScanTool {
  private dreamGraph: DreamGraph;

  constructor(dreamGraph: DreamGraph) {
    this.dreamGraph = dreamGraph;
  }

  public performScan(input: SerendipityScanInput): SerendipityScanOutput {
    const { currentContext, noveltyThreshold = 0.5, scanType = 'random', recentHistoryWindow = 10 } = input;
    
    // Get recent concepts to exclude (THE ECHO CHAMBER FIX)
    const recentNodeIds = this.getRecentNodeIds(recentHistoryWindow);
    
    let result: SerendipityScanOutput;
    
    switch (scanType) {
      case 'bridge':
        result = this.findBridgeConcept(currentContext, noveltyThreshold, recentNodeIds);
        break;
      case 'gap':
        result = this.findGapConcept(currentContext, noveltyThreshold, recentNodeIds);
        break;
      case 'pattern':
        result = this.findPatternConcept(currentContext, noveltyThreshold, recentNodeIds);
        break;
      default:
        result = this.findRandomConcept(currentContext, noveltyThreshold, recentNodeIds);
    }
    
    return result;
  }

  /**
   * Gets recently visited node IDs from traversal history
   * V4.0: Core of the echo chamber fix
   */
  private getRecentNodeIds(recentHistoryWindow: number): Set<string> {
    const traversalHistory = this.dreamGraph.getTraversalHistory();
    const recentNodeIds = new Set<string>();
    
    // Get the last N nodes from traversal history
    const recentHistory = traversalHistory.slice(-recentHistoryWindow);
    recentHistory.forEach(nodeId => recentNodeIds.add(nodeId));
    
    return recentNodeIds;
  }

  /**
   * Filters nodes to exclude recently visited ones
   * V4.0: Ensures temporal diversity
   */
  private filterRecentNodes(nodes: Node[], recentNodeIds: Set<string>): Node[] {
    return nodes.filter(node => !recentNodeIds.has(node.id));
  }

  /**
   * Calculates temporal diversity score based on node age and recency
   * V4.0: Aging mechanism - older concepts gradually become more eligible
   */
  private calculateTemporalDiversityScore(node: Node, recentNodeIds: Set<string>): number {
    // If in recent history, heavily penalize
    if (recentNodeIds.has(node.id)) {
      return 0.1;
    }
    
    // Calculate age-based bonus (older = more eligible)
    const now = Date.now();
    const age = now - node.creationTimestamp;
    const ageInMinutes = age / (1000 * 60);
    
    // Exponential decay: concepts become eligible after ~5 minutes
    const ageFactor = Math.min(1.0, ageInMinutes / 5);
    
    return 0.5 + (ageFactor * 0.5); // Score between 0.5 and 1.0
  }

  /**
   * BRIDGE: Find concepts connecting different idea clusters
   * V4.0: Now excludes recently visited concepts
   */
  private findBridgeConcept(context: string, noveltyThreshold: number, recentNodeIds: Set<string>): SerendipityScanOutput {
    const bridges = this.dreamGraph.findBridgeNodes();
    
    if (bridges.length === 0) {
      return this.findRandomConcept(context, noveltyThreshold, recentNodeIds);
    }
    
    // Filter out recently visited bridges
    const freshBridges = bridges.filter(bridge => !recentNodeIds.has(bridge.nodeId));
    
    // Fallback to all bridges if all are recent (with penalty)
    const bridgesToScore = freshBridges.length > 0 ? freshBridges : bridges;
    
    // Score bridges by combination of betweenness and semantic relevance
    const scoredBridges = bridgesToScore.map(bridge => {
      const node = this.dreamGraph.getNode(bridge.nodeId);
      if (!node) return null;
      
      const relevance = this.calculateRelevance(node.content, context);
      const novelty = 1 - relevance; // More novel = less directly relevant
      const centrality = bridge.betweenness;
      const temporalDiversity = this.calculateTemporalDiversityScore(node, recentNodeIds);
      
      // Serendipity = balance of novelty, relevance, structural importance, and temporal diversity
      const serendipityScore = 
        (novelty * noveltyThreshold) +
        (relevance * (1 - noveltyThreshold)) +
        (centrality * 0.2) +
        (temporalDiversity * 0.3); // Boost for non-recent concepts
      
      return {
        bridge,
        node,
        serendipityScore,
        relevance,
        novelty,
        centrality
      };
    }).filter(x => x !== null) as any[];
    
    // Pick best bridge
    scoredBridges.sort((a, b) => b.serendipityScore - a.serendipityScore);
    const best = scoredBridges[0];
    
    // Get related concepts from connected clusters
    const relatedConcepts = this.getConceptsFromClusters(best.bridge.connectsClusters);
    
    return {
      discoveredConcept: best.node.content,
      scanType: 'bridge',
      serendipityScore: best.serendipityScore,
      relatedConcepts,
      explanation: this.explainBridgeDiscovery(best, context)
    };
  }

  /**
   * GAP: Find missing connections between related concepts
   * V4.0: Now excludes recently visited concepts
   */
  private findGapConcept(context: string, noveltyThreshold: number, recentNodeIds: Set<string>): SerendipityScanOutput {
    const gaps = this.dreamGraph.findStructuralGaps();
    
    if (gaps.length === 0) {
      return this.findRandomConcept(context, noveltyThreshold, recentNodeIds);
    }
    
    // Filter out gaps involving recently visited concepts
    const freshGaps = gaps.filter(gap => {
      const node1 = this.dreamGraph.getAllNodes().find(n => n.content === gap.concept1);
      const node2 = this.dreamGraph.getAllNodes().find(n => n.content === gap.concept2);
      
      if (!node1 || !node2) return true; // Keep if we can't find the node
      
      return !recentNodeIds.has(node1.id) && !recentNodeIds.has(node2.id);
    });
    
    // Fallback to all gaps if all are recent
    const gapsToScore = freshGaps.length > 0 ? freshGaps : gaps;
    
    // Score gaps by relevance to context
    const scoredGaps = gapsToScore.map(gap => {
      const relevance1 = this.calculateRelevance(gap.concept1, context);
      const relevance2 = this.calculateRelevance(gap.concept2, context);
      const avgRelevance = (relevance1 + relevance2) / 2;
      const novelty = 1 - avgRelevance;
      
      const serendipityScore = 
        (novelty * noveltyThreshold) +
        (avgRelevance * (1 - noveltyThreshold)) +
        0.3; // Bonus for being a gap
      
      return { gap, serendipityScore, avgRelevance };
    });
    
    scoredGaps.sort((a, b) => b.serendipityScore - a.serendipityScore);
    const best = scoredGaps[0];
    
    return {
      discoveredConcept: `${best.gap.concept1} <-> ${best.gap.concept2}`,
      scanType: 'gap',
      serendipityScore: best.serendipityScore,
      relatedConcepts: [best.gap.concept1, best.gap.concept2],
      explanation: this.explainGapDiscovery(best, context)
    };
  }

  /**
   * PATTERN: Find recurring structural patterns in the graph
   * V4.0: Now excludes recently visited concepts from exemplars
   */
  private findPatternConcept(context: string, noveltyThreshold: number, recentNodeIds: Set<string>): SerendipityScanOutput {
    // Look for patterns in edge types
    const edgeTypes = this.dreamGraph.getAllEdges().map(e => e.type);
    const typeFrequency = new Map<string, number>();
    
    edgeTypes.forEach(type => {
      typeFrequency.set(type, (typeFrequency.get(type) || 0) + 1);
    });
    
    // Find most common pattern
    const sortedTypes = Array.from(typeFrequency.entries())
      .sort((a, b) => b[1] - a[1]);
    
    const dominantPattern = sortedTypes[0];
    
    // Find nodes exemplifying this pattern
    const edges = this.dreamGraph.getAllEdges().filter(e => e.type === dominantPattern[0]);
    const exemplarNodes = new Set<string>();
    edges.slice(0, 5).forEach(e => {
      exemplarNodes.add(e.source);
      exemplarNodes.add(e.target);
    });
    
    // Filter out recent exemplar nodes
    const freshExemplarNodes = Array.from(exemplarNodes).filter(id => !recentNodeIds.has(id));
    const nodesToUse = freshExemplarNodes.length > 0 ? freshExemplarNodes : Array.from(exemplarNodes);
    
    const relatedConcepts = nodesToUse
      .map(id => this.dreamGraph.getNode(id)?.content)
      .filter(c => c !== undefined) as string[];
    
    return {
      discoveredConcept: `Pattern: ${dominantPattern[0]} (${dominantPattern[1]} occurrences)`,
      scanType: 'pattern',
      serendipityScore: 0.6 + (Math.random() * 0.2),
      relatedConcepts,
      explanation: this.explainPatternDiscovery(dominantPattern, relatedConcepts, context)
    };
  }

  /**
   * RANDOM: High-diversity random concept
   * V4.0: THE CRITICAL FIX - Now excludes recently visited concepts
   */
  private findRandomConcept(context: string, noveltyThreshold: number, recentNodeIds: Set<string>): SerendipityScanOutput {
    const allNodes = this.dreamGraph.getAllNodes();
    
    if (allNodes.length === 0) {
      return {
        discoveredConcept: 'No concepts in graph yet',
        scanType: 'random',
        serendipityScore: 0,
        relatedConcepts: [],
        explanation: 'The dream graph is empty.\n\nUse other tools first to populate it:\n- semantic_drift to explore concept space\n- bisociative_synthesis to merge domains\n- oblique_constraint to add creative constraints'
      };
    }
    
    // Filter out recently visited nodes (THE ECHO CHAMBER FIX)
    const freshNodes = this.filterRecentNodes(allNodes, recentNodeIds);
    
    // Graceful fallback: If all nodes are recent, use all with temporal penalty
    const nodesToConsider = freshNodes.length > 0 ? freshNodes : allNodes;
    const usingFallback = freshNodes.length === 0;
    
    // Score all nodes by novelty (distance from context) + temporal diversity
    const scoredNodes = nodesToConsider.map(node => {
      const novelty = 1 - this.calculateRelevance(node.content, context);
      const temporalDiversity = this.calculateTemporalDiversityScore(node, recentNodeIds);
      
      // Weight novelty higher, but boost non-recent concepts significantly
      const serendipityScore = (novelty * 0.6) + (temporalDiversity * 0.4);
      
      return {
        node,
        novelty,
        temporalDiversity,
        serendipityScore
      };
    });
    
    // Sort by serendipity score (novelty + temporal diversity)
    scoredNodes.sort((a, b) => b.serendipityScore - a.serendipityScore);
    
    // Pick from top candidates (not just top 5, scale with novelty threshold)
    const candidatePoolSize = Math.max(3, Math.floor(nodesToConsider.length * 0.3));
    const topCandidates = scoredNodes.slice(0, candidatePoolSize);
    
    // Weighted random selection from top candidates
    const totalScore = topCandidates.reduce((sum, n) => sum + n.serendipityScore, 0);
    let random = Math.random() * totalScore;
    
    let selected = topCandidates[0];
    for (const candidate of topCandidates) {
      random -= candidate.serendipityScore;
      if (random <= 0) {
        selected = candidate;
        break;
      }
    }
    
    return {
      discoveredConcept: selected.node.content,
      scanType: 'random',
      serendipityScore: selected.serendipityScore,
      relatedConcepts: [],
      explanation: this.explainRandomDiscovery(selected.node, context, usingFallback, freshNodes.length, allNodes.length)
    };
  }

  /**
   * Calculate semantic relevance (simplified - uses keyword matching)
   * In production, could use embeddings or better NLP
   */
  private calculateRelevance(concept: string, context: string): number {
    const conceptWords = concept.toLowerCase().split(/\s+/);
    const contextWords = context.toLowerCase().split(/\s+/);
    
    let matches = 0;
    for (const word of conceptWords) {
      if (contextWords.some(cw => cw.includes(word) || word.includes(cw))) {
        matches++;
      }
    }
    
    return matches / Math.max(conceptWords.length, contextWords.length);
  }

  /**
   * Get concepts from cluster IDs
   */
  private getConceptsFromClusters(clusterIds: string[]): string[] {
    const clusters = this.dreamGraph.detectClusters();
    const concepts: string[] = [];
    
    for (const clusterId of clusterIds) {
      const cluster = clusters.get(clusterId);
      if (cluster) {
        for (const nodeId of Array.from(cluster).slice(0, 3)) {
          const node = this.dreamGraph.getNode(nodeId);
          if (node) concepts.push(node.content);
        }
      }
    }
    
    return concepts;
  }

  // Explanation generators
  private explainBridgeDiscovery(best: any, context: string): string {
    const lines = [
      "=== Serendipity Scan: Bridge ===",
      "",
      `Bridge concept: "${best.node.content}"`,
      "",
      "Discovery metrics:",
      `- Serendipity Score: ${(best.serendipityScore * 100).toFixed(0)}%`,
      `- Novelty: ${(best.novelty * 100).toFixed(0)}%`,
      `- Relevance to context: ${(best.relevance * 100).toFixed(0)}%`,
      `- Graph centrality: ${(best.centrality * 100).toFixed(0)}%`,
      "",
      "Why this is a bridge:",
      `This concept connects ${best.bridge.connectsClusters.length} different clusters in your ideation space.`,
      "It serves as a conceptual bridge between:",
      ...best.bridge.connectsClusters.map((c: string) => `- ${c}`),
      "",
      "Bridges are valuable because they:",
      "- Unite disparate ideas into coherent frameworks",
      "- Reveal hidden connections between separate domains",
      "- Enable knowledge transfer across boundaries",
      "- Create opportunities for innovation at intersections",
      "",
      "How to use this bridge:",
      `Context: "${context}"`,
      "- How does this connect the different aspects of this problem?",
      "- What happens if you make this bridge more explicit in your solution?",
      "- Are there other concepts that could serve as bridges here?",
      "",
      "Bridge identified. Use it to unify fragmented thinking.",
    ];
    return lines.join("\n");
  }

  private explainGapDiscovery(best: any, context: string): string {
    const lines = [
      "=== Serendipity Scan: Gap ===",
      "",
      "Structural gap discovered:",
      `"${best.gap.concept1}" <-> "${best.gap.concept2}"`,
      "",
      "Discovery metrics:",
      `- Serendipity Score: ${(best.serendipityScore * 100).toFixed(0)}%`,
      `- Gap reason: ${best.gap.reason}`,
      "",
      "Why this gap matters:",
      `These two concepts are related (${best.gap.reason}) but haven't been explicitly connected yet.`,
      "This suggests a missing link that could unlock new insights.",
      "",
      "Gaps often indicate:",
      "- Unexplored connections worth investigating",
      "- Implicit assumptions that need questioning",
      "- Opportunities for synthesis",
      "- Missing steps in your reasoning chain",
      "",
      "Bridging the gap:",
      `Context: "${context}"`,
      "- What happens when you explicitly connect these concepts?",
      "- Is there a third concept that bridges them naturally?",
      "- What would a hybrid of both look like?",
      "- Why haven't you connected them yet? What assumption prevented it?",
      "",
      "Gap identified. Explore this missing connection.",
    ];
    return lines.join("\n");
  }

  private explainPatternDiscovery(pattern: [string, number], concepts: string[], context: string): string {
    const lines = [
      "=== Serendipity Scan: Pattern ===",
      "",
      "Recurring pattern detected:",
      `"${pattern[0]}" (appears ${pattern[1]} times)`,
      "",
      "Pattern manifestations:",
      ...concepts.slice(0, 5).map(c => `- ${c}`),
      "",
      "Why patterns matter:",
      "This recurring relationship type reveals how your thinking naturally structures ideas.",
      "Patterns can be:",
      "- Productive (driving you toward solutions)",
      "- Limiting (keeping you in familiar territory)",
      "- Revealing (showing implicit assumptions)",
      "",
      `Context: "${context}"`,
      "Reflect:",
      "- Is this pattern helping or hindering progress on your context?",
      "- What would happen if you inverted this pattern?",
      "- Are there alternative patterns you haven't explored?",
      "",
      "Pattern discovered. Examine if it serves you.",
    ];
    return lines.join("\n");
  }

  private explainRandomDiscovery(node: Node, context: string, usingFallback: boolean, freshCount: number, totalCount: number): string {
    const diversityLines = usingFallback
      ? [
          "Temporal diversity note:",
          `- All ${totalCount} concepts in the graph have been recently visited.`,
          "- Selected from full pool with temporal diversity scoring.",
          "- Try using other tools to expand your concept space.",
        ]
      : [
          "Temporal diversity:",
          `- Selected from ${freshCount} non-recent concepts (${totalCount} total).`,
          "- This helps surface truly novel connections, not just recent echoes.",
        ];
    const lines = [
      "=== Serendipity Scan: Random ===",
      "",
      "Random high-novelty concept:",
      `"${node.content}"`,
      "",
      "Serendipity in action:",
      "This concept was selected for its semantic distance from your current context and its temporal diversity (avoiding recently visited concepts).",
      "This encourages true serendipity - discovering what you haven't been thinking about.",
      ...diversityLines,
      `Context: "${context}"`,
      "",
      "Use this random spark to:",
      "- Break out of your current frame",
      "- Ask \"what if?\" questions",
      "- Find analogies in unexpected places",
      "- Challenge your assumptions",
      "",
      "Random concept surfaced. Let it surprise you.",
    ];
    return lines.join("\n");
  }
}
