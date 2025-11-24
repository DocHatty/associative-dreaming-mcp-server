/**
 * Graph-Based Hint Service
 *
 * PROBLEM: Hints were hardcoded static data
 * SOLUTION: Compute hints dynamically from the dream graph
 *
 * Instead of ASSOCIATION_HINTS dictionary, we:
 * 1. Query actual graph neighbors of the anchor concept
 * 2. Use edge types to determine direction descriptions
 * 3. Use edge weights to rank hint quality
 * 4. Find bridge nodes for cross-domain suggestions
 * 5. Use betweenness centrality to identify important concepts
 */

import { DreamGraph, EdgeType, Edge } from '../graph.js';
import { getEmbeddingService } from './embedding-service.js';
import { log } from '../utils/logger.js';

export interface AssociationHint {
  concept: string;
  direction: string;
  distanceRange: [number, number];
  confidence: number; // 0-1, based on edge weight and graph structure
  source: 'graph' | 'embedding' | 'fallback';
}

export interface CrossDomainBridge {
  from: string;
  to: string;
  bridge: string;
  confidence: number;
}

/**
 * Service for generating hints from the dream graph
 */
export class HintService {
  private graph: DreamGraph;

  constructor(graph: DreamGraph) {
    this.graph = graph;
  }

  /**
   * Get association hints for a concept from the graph
   */
  async getAssociationHints(
    anchorConcept: string,
    targetDistance: number,
    maxHints: number = 5
  ): Promise<AssociationHint[]> {
    const hints: AssociationHint[] = [];

    // Strategy 1: Get hints from graph if anchor exists
    const graphHints = this.getGraphBasedHints(anchorConcept, targetDistance);
    hints.push(...graphHints);

    // Strategy 2: If not enough graph hints, use embeddings to find similar concepts
    if (hints.length < maxHints) {
      const embeddingHints = await this.getEmbeddingBasedHints(
        anchorConcept,
        targetDistance,
        maxHints - hints.length
      );
      hints.push(...embeddingHints);
    }

    // Strategy 3: Fallback to generic hints if still not enough
    if (hints.length === 0) {
      hints.push(...this.getGenericHints(targetDistance));
    }

    // Sort by confidence and return top N
    hints.sort((a, b) => b.confidence - a.confidence);
    return hints.slice(0, maxHints);
  }

  /**
   * Get hints from actual graph structure
   */
  private getGraphBasedHints(
    anchorConcept: string,
    targetDistance: number
  ): AssociationHint[] {
    const hints: AssociationHint[] = [];

    // Find anchor node in graph (exact match or partial match)
    const anchorNode = this.findNodeInGraph(anchorConcept);
    if (!anchorNode) {
      return hints;
    }

    // Get outgoing edges from anchor
    const edges = this.graph.getEdgesFrom(anchorNode.id);

    for (const edge of edges) {
      const targetNode = this.graph.getNode(edge.target);
      if (!targetNode) continue;

      // Map edge type to direction description
      const direction = this.edgeTypeToDirection(edge.type);

      // Estimate distance range based on edge weight
      // High weight = close connection (low distance)
      // Low weight = loose connection (high distance)
      const baseDistance = 1 - edge.weight;
      const distanceRange: [number, number] = [
        Math.max(0, baseDistance - 0.15),
        Math.min(1, baseDistance + 0.15)
      ];

      // Check if this hint is relevant for target distance
      const [min, max] = distanceRange;
      if (targetDistance >= min - 0.2 && targetDistance <= max + 0.2) {
        hints.push({
          concept: targetNode.content,
          direction,
          distanceRange,
          confidence: edge.weight,
          source: 'graph'
        });
      }
    }

    log('debug', `Found ${hints.length} graph-based hints for "${anchorConcept}"`);
    return hints;
  }

  /**
   * Get hints using embedding similarity
   */
  private async getEmbeddingBasedHints(
    anchorConcept: string,
    targetDistance: number,
    maxHints: number
  ): Promise<AssociationHint[]> {
    const hints: AssociationHint[] = [];

    // Get all concepts from the graph
    const allNodes = this.graph.getAllNodes();
    if (allNodes.length === 0) {
      return hints;
    }

    const candidates = allNodes.map(n => n.content);

    // Use embedding service to find concepts at target distance
    const embeddingService = getEmbeddingService();
    const matches = await embeddingService.findConceptsAtDistance(
      anchorConcept,
      targetDistance,
      candidates,
      0.2 // tolerance
    );

    for (const match of matches.slice(0, maxHints)) {
      hints.push({
        concept: match.concept,
        direction: this.inferDirection(anchorConcept, match.concept, match.distance),
        distanceRange: [
          Math.max(0, match.distance - 0.1),
          Math.min(1, match.distance + 0.1)
        ],
        confidence: 1 - Math.abs(match.distance - targetDistance),
        source: 'embedding'
      });
    }

    log('debug', `Found ${hints.length} embedding-based hints for "${anchorConcept}"`);
    return hints;
  }

  /**
   * Get cross-domain bridges from graph structure
   */
  getCrossDomainBridges(anchorConcept: string, maxBridges: number = 5): CrossDomainBridge[] {
    const bridges: CrossDomainBridge[] = [];

    // Find bridge nodes in the graph
    const bridgeNodes = this.graph.findBridgeNodes();

    // Get clusters to identify domain boundaries
    const clusters = this.graph.detectClusters();

    for (const bridgeNode of bridgeNodes.slice(0, maxBridges)) {
      const node = this.graph.getNode(bridgeNode.nodeId);
      if (!node) continue;

      // Find which clusters this bridge connects
      const connectedClusters = bridgeNode.connectsClusters;
      if (connectedClusters.length < 2) continue;

      // Get representative concepts from each cluster
      const clusterA = clusters.get(connectedClusters[0]);
      const clusterB = clusters.get(connectedClusters[1]);

      if (!clusterA || !clusterB) continue;

      const fromConcept = this.getRepresentativeConcept(clusterA);
      const toConcept = this.getRepresentativeConcept(clusterB);

      bridges.push({
        from: fromConcept,
        to: toConcept,
        bridge: node.content,
        confidence: bridgeNode.betweenness
      });
    }

    // Sort by confidence (betweenness)
    bridges.sort((a, b) => b.confidence - a.confidence);

    log('debug', `Found ${bridges.length} cross-domain bridges`);
    return bridges;
  }

  /**
   * Find node in graph (exact or fuzzy match)
   */
  private findNodeInGraph(concept: string): { id: string; content: string } | null {
    const normalized = concept.toLowerCase().trim();
    const allNodes = this.graph.getAllNodes();

    // Try exact match
    for (const node of allNodes) {
      if (node.content.toLowerCase() === normalized) {
        return { id: node.id, content: node.content };
      }
    }

    // Try partial match
    for (const node of allNodes) {
      const nodeContent = node.content.toLowerCase();
      if (nodeContent.includes(normalized) || normalized.includes(nodeContent)) {
        return { id: node.id, content: node.content };
      }
    }

    return null;
  }

  /**
   * Map edge type to human-readable direction
   */
  private edgeTypeToDirection(edgeType: EdgeType): string {
    const directionMap: Record<EdgeType, string> = {
      [EdgeType.METAPHOR_FOR]: 'toward metaphorical interpretation',
      [EdgeType.CONTRASTS_WITH]: 'toward opposing concepts',
      [EdgeType.REMINDS_OF]: 'toward associated memories',
      [EdgeType.SYNTHESIZED_FROM]: 'toward constituent parts',
      [EdgeType.CONTAINS]: 'toward contained elements',
      [EdgeType.SPECIALIZES]: 'toward specific instances',
      [EdgeType.TRANSFORMS_INTO]: 'toward evolutionary outcomes',
      [EdgeType.CAUSES]: 'toward causal effects'
    };

    return directionMap[edgeType] || 'toward related concepts';
  }

  /**
   * Infer direction description from semantic distance
   */
  private inferDirection(anchor: string, target: string, distance: number): string {
    if (distance < 0.3) {
      return `toward nearby variations of "${anchor}"`;
    } else if (distance < 0.6) {
      return `toward related domains from "${anchor}"`;
    } else {
      return `toward distant concepts from "${anchor}"`;
    }
  }

  /**
   * Get representative concept from a cluster
   */
  private getRepresentativeConcept(cluster: Set<string>): string {
    // Just return first concept for now
    // TODO: Could use centrality to pick best representative
    const firstId = Array.from(cluster)[0];
    const node = this.graph.getNode(firstId);
    return node?.content || 'unknown';
  }

  /**
   * Generic fallback hints based only on distance
   */
  private getGenericHints(targetDistance: number): AssociationHint[] {
    if (targetDistance < 0.3) {
      return [
        {
          concept: 'synonyms and variants',
          direction: 'toward nearby semantic space',
          distanceRange: [0.1, 0.3],
          confidence: 0.3,
          source: 'fallback'
        },
        {
          concept: 'specific examples',
          direction: 'toward concrete instances',
          distanceRange: [0.15, 0.35],
          confidence: 0.25,
          source: 'fallback'
        }
      ];
    } else if (targetDistance < 0.6) {
      return [
        {
          concept: 'related fields',
          direction: 'toward adjacent domains',
          distanceRange: [0.4, 0.6],
          confidence: 0.3,
          source: 'fallback'
        },
        {
          concept: 'structural analogies',
          direction: 'toward similar patterns',
          distanceRange: [0.45, 0.65],
          confidence: 0.25,
          source: 'fallback'
        }
      ];
    } else {
      return [
        {
          concept: 'distant domains',
          direction: 'toward radically different fields',
          distanceRange: [0.7, 0.9],
          confidence: 0.3,
          source: 'fallback'
        },
        {
          concept: 'paradoxical opposites',
          direction: 'toward surprising inversions',
          distanceRange: [0.75, 0.95],
          confidence: 0.25,
          source: 'fallback'
        }
      ];
    }
  }
}

/**
 * Global singleton
 */
let globalHintService: HintService | null = null;

/**
 * Get or create hint service
 */
export function getHintService(graph: DreamGraph): HintService {
  if (!globalHintService) {
    globalHintService = new HintService(graph);
  }
  return globalHintService;
}
