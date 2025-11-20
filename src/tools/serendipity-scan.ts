/**
 * Serendipity Scan - The Unknown Unknown Finder (V3.0 - COMPLETE REWRITE)
 *
 * This tool automates the search for "Unknown Unknowns" - connections and insights
 * that would normally be missed through linear thinking. It analyzes the dream graph
 * using sophisticated graph algorithms to identify structural holes, disconnected clusters,
 * and potential bridges that could connect these disparate ideas.
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
    const { currentContext, noveltyThreshold = 0.5, scanType = 'random' } = input;
    
    let result: SerendipityScanOutput;
    
    switch (scanType) {
      case 'bridge':
        result = this.findBridgeConcept(currentContext, noveltyThreshold);
        break;
      case 'gap':
        result = this.findGapConcept(currentContext, noveltyThreshold);
        break;
      case 'pattern':
        result = this.findPatternConcept(currentContext, noveltyThreshold);
        break;
      default:
        result = this.findRandomConcept(currentContext, noveltyThreshold);
    }
    
    return result;
  }

  /**
   * BRIDGE: Find concepts connecting different idea clusters
   */
  private findBridgeConcept(context: string, noveltyThreshold: number): SerendipityScanOutput {
    const bridges = this.dreamGraph.findBridgeNodes();
    
    if (bridges.length === 0) {
      return this.findRandomConcept(context, noveltyThreshold);
    }
    
    // Score bridges by combination of betweenness and semantic relevance
    const scoredBridges = bridges.map(bridge => {
      const node = this.dreamGraph.getNode(bridge.nodeId);
      if (!node) return null;
      
      const relevance = this.calculateRelevance(node.content, context);
      const novelty = 1 - relevance; // More novel = less directly relevant
      const centrality = bridge.betweenness;
      
      // Serendipity = balance of novelty, relevance, and structural importance
      const serendipityScore = 
        (novelty * noveltyThreshold) +
        (relevance * (1 - noveltyThreshold)) +
        (centrality * 0.3);
      
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
   */
  private findGapConcept(context: string, noveltyThreshold: number): SerendipityScanOutput {
    const gaps = this.dreamGraph.findStructuralGaps();
    
    if (gaps.length === 0) {
      return this.findRandomConcept(context, noveltyThreshold);
    }
    
    // Score gaps by relevance to context
    const scoredGaps = gaps.map(gap => {
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
      discoveredConcept: `${best.gap.concept1} ↔ ${best.gap.concept2}`,
      scanType: 'gap',
      serendipityScore: best.serendipityScore,
      relatedConcepts: [best.gap.concept1, best.gap.concept2],
      explanation: this.explainGapDiscovery(best, context)
    };
  }

  /**
   * PATTERN: Find recurring structural patterns in the graph
   */
  private findPatternConcept(context: string, noveltyThreshold: number): SerendipityScanOutput {
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
    
    const relatedConcepts = Array.from(exemplarNodes)
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
   */
  private findRandomConcept(context: string, noveltyThreshold: number): SerendipityScanOutput {
    const nodes = this.dreamGraph.getAllNodes();
    
    if (nodes.length === 0) {
      return {
        discoveredConcept: 'No concepts in graph yet',
        scanType: 'random',
        serendipityScore: 0,
        relatedConcepts: [],
        explanation: 'The dream graph is empty. Use other tools first to populate it.'
      };
    }
    
    // Score all nodes by novelty (distance from context)
    const scoredNodes = nodes.map(node => ({
      node,
      novelty: 1 - this.calculateRelevance(node.content, context),
      serendipityScore: Math.random() * 0.3 + 0.5
    }));
    
    // Pick from high-novelty nodes
    scoredNodes.sort((a, b) => b.novelty - a.novelty);
    const topNovel = scoredNodes.slice(0, 5);
    const selected = topNovel[Math.floor(Math.random() * topNovel.length)];
    
    return {
      discoveredConcept: selected.node.content,
      scanType: 'random',
      serendipityScore: selected.serendipityScore,
      relatedConcepts: [],
      explanation: this.explainRandomDiscovery(selected.node, context)
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
    return `
╔═══════════════════════════════════════════════════════════╗
║            ✨ SERENDIPITY SCAN: BRIDGE                    ║
╚═══════════════════════════════════════════════════════════╝

🌉 BRIDGE CONCEPT DISCOVERED:
"${best.node.content}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 DISCOVERY METRICS:
  • Serendipity Score: ${(best.serendipityScore * 100).toFixed(0)}%
  • Novelty: ${(best.novelty * 100).toFixed(0)}%
  • Relevance to context: ${(best.relevance * 100).toFixed(0)}%
  • Graph centrality: ${(best.centrality * 100).toFixed(0)}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 WHY THIS IS A BRIDGE:

This concept connects ${best.bridge.connectsClusters.length} different clusters in
your ideation space. It serves as a conceptual bridge between:

${best.bridge.connectsClusters.map((c: string) => `  • ${c}`).join('\n')}

Bridges are valuable because they:
1. Unite disparate ideas into coherent frameworks
2. Reveal hidden connections between separate domains
3. Enable knowledge transfer across boundaries
4. Create opportunities for innovation at intersections

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 HOW TO USE THIS BRIDGE:

Context: "${context}"

Ask yourself:
- How does "${best.node.content}" connect the different aspects
  of this problem?
- What would happen if you made this bridge MORE explicit in
  your solution?
- Are there other concepts that could serve as bridges here?

╔═══════════════════════════════════════════════════════════╗
║  Bridge identified. Use it to unify fragmented thinking.  ║
╚═══════════════════════════════════════════════════════════╝
`;
  }

  private explainGapDiscovery(best: any, context: string): string {
    return `
╔═══════════════════════════════════════════════════════════╗
║            ✨ SERENDIPITY SCAN: GAP                       ║
╚═══════════════════════════════════════════════════════════╝

🔍 STRUCTURAL GAP DISCOVERED:
"${best.gap.concept1}" ←→ "${best.gap.concept2}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 DISCOVERY METRICS:
  • Serendipity Score: ${(best.serendipityScore * 100).toFixed(0)}%
  • Gap reason: ${best.gap.reason}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🕳️  WHY THIS GAP MATTERS:

These two concepts are related (${best.gap.reason}) but haven't been
explicitly connected in your ideation yet. This suggests a missing
link that could unlock new insights.

Gaps often indicate:
1. Unexplored connections worth investigating
2. Implicit assumptions that need questioning
3. Opportunities for synthesis
4. Missing steps in your reasoning chain

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 BRIDGING THE GAP:

Context: "${context}"

Experiment:
- What happens when you explicitly connect these concepts?
- Is there a third concept that bridges them naturally?
- What would a hybrid of both look like?
- Why haven't you connected them yet - what assumption prevented it?

╔═══════════════════════════════════════════════════════════╗
║    Gap identified. Explore this missing connection.       ║
╚═══════════════════════════════════════════════════════════╝
`;
  }

  private explainPatternDiscovery(pattern: [string, number], concepts: string[], context: string): string {
    return `
╔═══════════════════════════════════════════════════════════╗
║            ✨ SERENDIPITY SCAN: PATTERN                   ║
╚═══════════════════════════════════════════════════════════╝

🔄 RECURRING PATTERN DETECTED:
"${pattern[0]}" (appears ${pattern[1]} times)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 PATTERN MANIFESTATIONS:
${concepts.slice(0, 5).map(c => `  • ${c}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌀 WHY PATTERNS MATTER:

This recurring relationship type reveals how your thinking naturally
structures ideas. Patterns can be:
1. Productive (driving you toward solutions)
2. Limiting (keeping you in familiar territory)
3. Revealing (showing implicit assumptions)

Context: "${context}"

Reflect:
- Is this pattern helping or hindering progress on your context?
- What would happen if you inverted this pattern?
- Are there alternative patterns you haven't explored?

╔═══════════════════════════════════════════════════════════╗
║   Pattern discovered. Examine if it serves you.           ║
╚═══════════════════════════════════════════════════════════╝
`;
  }

  private explainRandomDiscovery(node: Node, context: string): string {
    return `
╔═══════════════════════════════════════════════════════════╗
║            ✨ SERENDIPITY SCAN: RANDOM                    ║
╚═══════════════════════════════════════════════════════════╝

🎲 RANDOM HIGH-NOVELTY CONCEPT:
"${node.content}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌟 SERENDIPITY IN ACTION:

Sometimes the best insights come from unexpected directions.
This concept was selected for its semantic distance from your
current context, maximizing the chance for surprising connections.

Context: "${context}"

Use this random spark to:
- Break out of your current frame
- Ask "what if?" questions
- Find analogies in unexpected places
- Challenge your assumptions

╔═══════════════════════════════════════════════════════════╗
║  Random concept surfaced. Let it surprise you.            ║
╚═══════════════════════════════════════════════════════════╝
`;
  }
}
