/**
 * Rhizomatic Graph - Core data structure for Associative Dreaming
 * 
 * Unlike the linear thoughts of Sequential Thinking, this implements a network structure
 * where any node (concept) can connect to any other node through weighted, labeled edges.
 * This allows for non-linear exploration of the concept space.
 */

// Edge type representing connections between concepts
export interface Edge {
  source: string;        // ID of the source node
  target: string;        // ID of the target node
  type: EdgeType;        // Type of relationship
  weight: number;        // Connection strength (0.0 to 1.0)
  metadata?: Record<string, any>; // Additional properties
}

// Types of associative relationships between concepts
export enum EdgeType {
  METAPHOR_FOR = 'metaphor_for',        // Concept A is a metaphor for concept B
  CONTRASTS_WITH = 'contrasts_with',    // Concept A is opposite of concept B
  REMINDS_OF = 'reminds_of',            // Concept A triggers memory of concept B
  SYNTHESIZED_FROM = 'synthesized_from', // Concept C was created from concepts A and B
  CONTAINS = 'contains',                // Concept A is a superset of concept B
  SPECIALIZES = 'specializes',          // Concept A is a specific instance of concept B
  TRANSFORMS_INTO = 'transforms_into',  // Concept A can become concept B
  CAUSES = 'causes',                    // Concept A leads to concept B
}

// Node representing a concept in the dream space
export interface Node {
  id: string;               // Unique identifier
  content: string;          // The concept text/description
  creationTimestamp: number; // When the concept was generated
  semanticVector?: number[];  // Optional embedding representation
  driftDistance?: number;   // How far from original anchor (0.0 to 1.0)
  source?: string;          // Which tool generated this (drift/bisociation/etc)
  metadata?: Record<string, any>; // Additional tool-specific properties
}

/**
 * The Dream Graph - main data structure for Associative Dreaming
 * Implements a weighted, directed graph with typed edges
 */
export class DreamGraph {
  private nodes: Map<string, Node> = new Map();
  private edges: Edge[] = [];
  private traversalHistory: string[] = []; // Keeps track of the concept exploration path
  
  /**
   * Adds a concept node to the dream graph
   */
  public addNode(node: Node): void {
    // Ensure the node ID is unique
    if (this.nodes.has(node.id)) {
      throw new Error(`Node with ID '${node.id}' already exists`);
    }
    
    // Set creation timestamp if not provided
    if (!node.creationTimestamp) {
      node.creationTimestamp = Date.now();
    }
    
    this.nodes.set(node.id, node);
  }
  
  /**
   * Creates a connection between two concept nodes
   */
  public addEdge(edge: Edge): void {
    // Validate that both nodes exist
    if (!this.nodes.has(edge.source)) {
      throw new Error(`Source node '${edge.source}' does not exist`);
    }
    
    if (!this.nodes.has(edge.target)) {
      throw new Error(`Target node '${edge.target}' does not exist`);
    }
    
    // Add the edge to the graph
    this.edges.push(edge);
  }
  
  /**
   * Records node visitation in the traversal path
   */
  public visitNode(nodeId: string): void {
    if (!this.nodes.has(nodeId)) {
      throw new Error(`Cannot visit node '${nodeId}' as it does not exist`);
    }
    
    this.traversalHistory.push(nodeId);
  }
  
  /**
   * Gets all outgoing edges from a node
   */
  public getEdgesFrom(nodeId: string): Edge[] {
    return this.edges.filter(edge => edge.source === nodeId);
  }
  
  /**
   * Gets all incoming edges to a node
   */
  public getEdgesTo(nodeId: string): Edge[] {
    return this.edges.filter(edge => edge.target === nodeId);
  }
  
  /**
   * Gets all edges of a specific type
   */
  public getEdgesByType(type: EdgeType): Edge[] {
    return this.edges.filter(edge => edge.type === type);
  }
  
  /**
   * Gets a specific node by ID
   */
  public getNode(nodeId: string): Node | undefined {
    return this.nodes.get(nodeId);
  }
  
  /**
   * Gets all nodes in the graph
   */
  public getAllNodes(): Node[] {
    return Array.from(this.nodes.values());
  }
  
  /**
   * Gets all edges in the graph
   */
  public getAllEdges(): Edge[] {
    return this.edges;
  }
  
  /**
   * Gets the traversal history (path of exploration)
   */
  public getTraversalHistory(): string[] {
    return [...this.traversalHistory];
  }
  
  /**
   * Gets the current/last visited node
   */
  public getCurrentNode(): Node | undefined {
    if (this.traversalHistory.length === 0) {
      return undefined;
    }
    
    const currentNodeId = this.traversalHistory[this.traversalHistory.length - 1];
    return this.getNode(currentNodeId);
  }
  
  /**
   * Finds nodes that could serve as bridges between disconnected clusters
   * Used by the serendipity_scan tool to identify potential "bridging concepts"
   */
  public findStructuralHoles(): Node[] {
    // Simple implementation: find nodes with incoming but no outgoing edges
    const potentialBridges: Node[] = [];
    
    for (const node of this.nodes.values()) {
      const incomingEdges = this.getEdgesTo(node.id);
      const outgoingEdges = this.getEdgesFrom(node.id);
      
      // Node has incoming connections but no outgoing ones
      if (incomingEdges.length > 0 && outgoingEdges.length === 0) {
        potentialBridges.push(node);
      }
    }
    
    return potentialBridges;
  }
  
  /**
   * Detects communities/clusters using simple edge-weight based clustering
   * Returns a map of cluster IDs to sets of node IDs
   */
  public detectClusters(): Map<string, Set<string>> {
    const clusters = new Map<string, Set<string>>();
    const visited = new Set<string>();
    let clusterID = 0;
    
    // Simple connected components with weight threshold
    for (const node of this.nodes.values()) {
      if (visited.has(node.id)) continue;
      
      const cluster = new Set<string>();
      this.dfs(node.id, visited, cluster, 0.5); // 0.5 = min edge weight
      
      if (cluster.size > 0) {
        clusters.set(`cluster-${clusterID++}`, cluster);
      }
    }
    
    return clusters;
  }
  
  /**
   * DFS helper for cluster detection
   * Traverses the graph following edges above a minimum weight threshold
   */
  private dfs(nodeId: string, visited: Set<string>, cluster: Set<string>, minWeight: number): void {
    visited.add(nodeId);
    cluster.add(nodeId);
    
    const edges = this.getEdgesFrom(nodeId);
    for (const edge of edges) {
      if (!visited.has(edge.target) && edge.weight >= minWeight) {
        this.dfs(edge.target, visited, cluster, minWeight);
      }
    }
  }
  
  /**
   * Calculates betweenness centrality (simplified)
   * Measures how many shortest paths pass through this node
   * Returns a normalized value between 0 and 1
   */
  public calculateBetweenness(nodeId: string): number {
    if (!this.nodes.has(nodeId)) return 0;
    
    let betweenness = 0;
    const allNodes = Array.from(this.nodes.keys());
    
    // For each pair of nodes, find if this node is on their shortest path
    for (let i = 0; i < allNodes.length; i++) {
      for (let j = i + 1; j < allNodes.length; j++) {
        const source = allNodes[i];
        const target = allNodes[j];
        
        if (source === nodeId || target === nodeId) continue;
        
        const paths = this.findAllShortestPaths(source, target);
        const pathsThroughNode = paths.filter(path => path.includes(nodeId));
        
        if (paths.length > 0) {
          betweenness += pathsThroughNode.length / paths.length;
        }
      }
    }
    
    // Normalize by the maximum possible betweenness
    const maxPairs = (allNodes.length - 1) * (allNodes.length - 2) / 2;
    return maxPairs > 0 ? betweenness / maxPairs : 0;
  }
  
  /**
   * Finds all shortest paths between two nodes (BFS)
   * Returns an array of paths, where each path is an array of node IDs
   */
  private findAllShortestPaths(sourceId: string, targetId: string): string[][] {
    const queue: Array<{node: string, path: string[]}> = [{node: sourceId, path: [sourceId]}];
    const visited = new Map<string, number>(); // node -> distance
    const shortestPaths: string[][] = [];
    let shortestLength = Infinity;
    
    visited.set(sourceId, 0);
    
    while (queue.length > 0) {
      const {node, path} = queue.shift()!;
      
      if (node === targetId) {
        if (path.length < shortestLength) {
          shortestLength = path.length;
          shortestPaths.length = 0;
          shortestPaths.push(path);
        } else if (path.length === shortestLength) {
          shortestPaths.push(path);
        }
        continue;
      }
      
      if (path.length >= shortestLength) continue;
      
      const edges = this.getEdgesFrom(node);
      for (const edge of edges) {
        const nextDist = path.length + 1;
        const prevDist = visited.get(edge.target);
        
        if (prevDist === undefined || nextDist <= prevDist) {
          visited.set(edge.target, nextDist);
          queue.push({node: edge.target, path: [...path, edge.target]});
        }
      }
    }
    
    return shortestPaths;
  }
  
  /**
   * Finds true bridge nodes connecting different clusters
   * Returns nodes with their connected clusters and betweenness scores
   */
  public findBridgeNodes(): Array<{nodeId: string, connectsClusters: string[], betweenness: number}> {
    const clusters = this.detectClusters();
    const bridges: Array<{nodeId: string, connectsClusters: string[], betweenness: number}> = [];
    
    // Build reverse map: nodeId -> clusterIds it belongs to
    const nodeToCluster = new Map<string, string[]>();
    for (const [clusterID, nodeSet] of clusters.entries()) {
      for (const nodeId of nodeSet) {
        if (!nodeToCluster.has(nodeId)) {
          nodeToCluster.set(nodeId, []);
        }
        nodeToCluster.get(nodeId)!.push(clusterID);
      }
    }
    
    // Find nodes that connect multiple clusters
    for (const node of this.nodes.values()) {
      const edges = this.getEdgesFrom(node.id);
      const connectedClusters = new Set<string>();
      
      for (const edge of edges) {
        const targetClusters = nodeToCluster.get(edge.target) || [];
        targetClusters.forEach(c => connectedClusters.add(c));
      }
      
      if (connectedClusters.size >= 2) {
        bridges.push({
          nodeId: node.id,
          connectsClusters: Array.from(connectedClusters),
          betweenness: this.calculateBetweenness(node.id)
        });
      }
    }
    
    return bridges.sort((a, b) => b.betweenness - a.betweenness);
  }
  
  /**
   * Finds structural gaps - concepts that should be connected but aren't
   * Returns pairs of concepts with reasons why they might be related
   */
  public findStructuralGaps(): Array<{concept1: string, concept2: string, reason: string}> {
    const gaps: Array<{concept1: string, concept2: string, reason: string}> = [];
    const nodes = Array.from(this.nodes.values());
    
    // Look for nodes with similar metadata that aren't connected
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        
        // Check if they share metadata but no edge
        const sharedSource = node1.source === node2.source;
        const similarDrift = Math.abs((node1.driftDistance || 0) - (node2.driftDistance || 0)) < 0.2;
        const notConnected = !this.getEdgesFrom(node1.id).some(e => e.target === node2.id) &&
                            !this.getEdgesFrom(node2.id).some(e => e.target === node1.id);
        
        if ((sharedSource || similarDrift) && notConnected) {
          gaps.push({
            concept1: node1.content,
            concept2: node2.content,
            reason: sharedSource ? 'same generation tool' : 'similar semantic distance'
          });
        }
      }
    }
    
    return gaps.slice(0, 10); // Return top 10 gaps
  }
  
  /**
   * Calculates the semantic diversity of the graph
   * Higher values indicate more diverse concepts
   */
  public calculateDiversity(): number {
    // Simple implementation: use the number of different edge types as a proxy for diversity
    const uniqueEdgeTypes = new Set<EdgeType>();
    
    for (const edge of this.edges) {
      uniqueEdgeTypes.add(edge.type);
    }
    
    // Normalize by max possible edge types
    return uniqueEdgeTypes.size / Object.keys(EdgeType).length;
  }
  
  /**
   * Exports the graph in a format suitable for visualization
   */
  public exportGraph() {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: this.edges,
      traversalHistory: this.traversalHistory,
      metrics: {
        nodeCount: this.nodes.size,
        edgeCount: this.edges.length,
        diversity: this.calculateDiversity(),
        structuralHoles: this.findStructuralHoles().length
      }
    };
  }
}
