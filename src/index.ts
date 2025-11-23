#!/usr/bin/env node

/**
 * Associative Dreaming MCP Server - Entry Point
 *
 * This is the main entry point for the Associative Dreaming MCP server.
 * It sets up the server, registers the tools, and connects to the MCP transport.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  Tool,
  Resource,
  Prompt,
} from "@modelcontextprotocol/sdk/types.js";
import { AssociativeDreamingServer } from "./lib.js";
import { log, logError } from "./utils/logger.js";

// Define the four core tools of Associative Dreaming
const SEMANTIC_DRIFT_TOOL: Tool = {
  name: "semantic_drift",
  description: `The Controlled Hallucination Engine - A stochastic random walk through concept space.

This tool explores semantically distant yet contextually relevant concepts. Unlike nearest-neighbor
searches that find synonyms, semantic drift deliberately seeks concepts in the "Serendipity Zone"
(not too close, not too far) to promote lateral thinking.

When to use this tool:
- When you're stuck in repetitive thinking patterns
- When you need fresh perspectives on a familiar problem
- When you want to explore alternative framings
- When direct approaches have failed to yield insights
- When you're in the divergent phase of ideation

Parameters:
- anchorConcept: The starting point for the semantic drift (required)
- driftMagnitude: How far to drift from the anchor (0.0-1.0, higher = more distant)
- temperature: Additional randomness in the selection process (0.0-1.0)

The tool will return a new concept that's semantically distant but contextually relevant,
along with the path taken to reach it and an explanation of the connections.`,
  inputSchema: {
    type: "object",
    properties: {
      anchorConcept: {
        type: "string",
        description: "The starting concept for semantic drift",
      },
      driftMagnitude: {
        type: "number",
        description:
          "How far to drift semantically (0.0 to 1.0, higher = more distant)",
        minimum: 0,
        maximum: 1,
      },
      temperature: {
        type: "number",
        description: "Additional randomness in selection (0.0 to 1.0)",
        minimum: 0,
        maximum: 1,
      },
    },
    required: ["anchorConcept"],
  },
};

const BISOCIATIVE_SYNTHESIS_TOOL: Tool = {
  name: "bisociative_synthesis",
  description: `The Combinatorial Engine - Forces the intersection of unrelated matrices of thought.

This tool identifies structural similarities between disparate domains to generate creative insights.
Based on Arthur Koestler's theory of Bisociation, it maps patterns from one domain onto another,
creating conceptual bridges that can lead to innovation.

When to use this tool:
- When you need radical innovation rather than incremental improvement
- When you want to reframe a problem using an entirely different perspective
- When looking for innovative solutions by importing paradigms from other fields
- When you're stuck and need to break out of domain-specific thinking patterns
- When you want to create new metaphors for understanding complex problems

Parameters:
- matrixA: The problem domain (required)
- matrixB: The stimulus domain (optional - will auto-select if not provided)
- blendType: Specific structural pattern to use for mapping (optional)

The tool will create a "bridge concept" that connects the two domains, explaining how
concepts from one domain can be mapped onto the other to generate novel insights.`,
  inputSchema: {
    type: "object",
    properties: {
      matrixA: {
        type: "string",
        description: "The problem domain (the context you're working in)",
      },
      matrixB: {
        type: "string",
        description:
          "The stimulus domain (optional - will auto-select if not provided)",
      },
      blendType: {
        type: "string",
        description:
          "Specific structural pattern to use (e.g., hierarchy, network, cycle)",
      },
    },
    required: ["matrixA"],
  },
};

const OBLIQUE_CONSTRAINT_TOOL: Tool = {
  name: "oblique_constraint",
  description: `The Entropy Injector - Introduces creative constraints to break linear thinking.

This tool implements Brian Eno's Oblique Strategies and SCAMPER techniques to act as a
"Circuit Breaker" for rigid thinking. By introducing deliberate constraints, it forces
creative thinking and pattern breaking when you're stuck.

When to use this tool:
- When you're experiencing writer's block or creative impasse
- When you need to break out of conventional thinking patterns
- When logical approaches have reached diminishing returns
- When you want to introduce controlled chaos into your thinking
- When you feel you've exhausted all obvious solutions

Parameters:
- currentBlock: Description of the impasse or block you're facing (required)
- constraintType: Type of constraint (oblique, scamper, creative, or random)

The tool will provide a specific constraint and suggestions for how to apply it
to your current problem, forcing you to approach it from a new angle.`,
  inputSchema: {
    type: "object",
    properties: {
      currentBlock: {
        type: "string",
        description: "Description of the impasse/block you're facing",
      },
      constraintType: {
        type: "string",
        description:
          "Type of constraint (oblique, scamper, creative, or random)",
        enum: ["oblique", "scamper", "creative", "random"],
      },
    },
    required: ["currentBlock"],
  },
};

const SERENDIPITY_SCAN_TOOL: Tool = {
  name: "serendipity_scan",
  description: `The Unknown Unknown Finder - Searches for surprising connections and insights.

This tool automates the search for "Unknown Unknowns" - connections and insights that
would typically be missed through linear thinking. It analyzes the dream graph for
structural holes and disconnected clusters, then identifies potential bridges.

When to use this tool:
- When you want to discover blind spots in your thinking
- When you're looking for unexpected connections between ideas
- When you need to break out of a mental rut
- When you want to inject serendipity into your creative process
- When you're in an exploratory rather than problem-solving mode

Parameters:
- currentContext: Description of your current focus or exploration area (required)
- noveltyThreshold: How novel vs. relevant results should be (0.0-1.0)
- scanType: The type of serendipitous insight to find (bridge, gap, pattern, random)

The tool will discover unexpected concepts or connections based on your current
context, with an explanation of why they might be valuable to consider.`,
  inputSchema: {
    type: "object",
    properties: {
      currentContext: {
        type: "string",
        description: "Description of your current focus or exploration area",
      },
      noveltyThreshold: {
        type: "number",
        description:
          "How novel vs. relevant results should be (0.0-1.0, higher = more novel)",
        minimum: 0,
        maximum: 1,
      },
      scanType: {
        type: "string",
        description: "Type of serendipitous insight to find",
        enum: ["bridge", "gap", "pattern", "random"],
      },
    },
    required: ["currentContext"],
  },
};

const META_ASSOCIATION_TOOL: Tool = {
  name: "meta_association",
  description: `The Chaos Weaver - Amplifies associative chaos by forcing prior outputs to collide.

"A→Banana→Your ex's apartment→Ancient Rome→Answer"

This is the AMPLIFIER, not the dampener. While the other 4 tools generate creative leaps
from a single starting point, this tool takes MULTIPLE prior outputs and forces EVEN MORE
bizarre connections between them. It's recursively bisociative - making wild leaps BETWEEN
the wild leaps.

CORE PRINCIPLE: Maximize semantic chaos while maintaining a thread of "aha!" relevance.
The goal is NOT to synthesize into linear structure (that's Sequential Thinking's job).
The goal is to AMPLIFY the associative possibilities by forcing collisions between prior insights.

When to use this tool:
- After calling 2+ other associative dreaming tools
- When you want to find meta-patterns in the creative chaos
- When linear thinking has failed and you need MAXIMUM lateral force
- When you want to push beyond first-order associations into recursive weirdness
- When you need to see what emerges from forcing unrelated insights to collide

Parameters:
- priorOutputs: Array of previous MCP tool results (required, minimum 2)
- chaosIntensity: How wild to make the meta-leaps (0.0-1.0, default 0.7)
- contextAnchor: Optional grounding concept to maintain some coherence

The tool will return:
- Emergent meta-pattern from forcing the collisions
- Specific collision points where concepts crashed together
- The "really weird" insight that only becomes visible from the meta-view
- Weirdness score indicating how far from conventional thinking this got
- Rhizome map visualizing the associative web`,
  inputSchema: {
    type: "object",
    properties: {
      priorOutputs: {
        type: "array",
        description:
          "Array of previous MCP tool outputs to force into collision",
        items: {
          type: "object",
          properties: {
            tool: {
              type: "string",
              enum: [
                "semantic_drift",
                "bisociative_synthesis",
                "oblique_constraint",
                "serendipity_scan",
              ],
            },
            result: {
              type: "object",
              description: "The result object from the prior tool call",
            },
            timestamp: {
              type: "number",
              description:
                "Optional timestamp of when this output was generated",
            },
          },
          required: ["tool", "result"],
        },
        minItems: 2,
      },
      chaosIntensity: {
        type: "number",
        description:
          "How wild to make the meta-leaps (0.0 to 1.0, higher = more chaotic)",
        minimum: 0,
        maximum: 1,
      },
      contextAnchor: {
        type: "string",
        description: "Optional grounding concept to maintain some coherence",
      },
    },
    required: ["priorOutputs"],
  },
};

// =============================================================================
// RESOURCES - Expose DreamGraph state
// =============================================================================

const RESOURCES: Resource[] = [
  {
    uri: "graph://current",
    name: "Current Dream Graph",
    description: "Full dream graph state including nodes, edges, and metrics",
    mimeType: "application/json",
  },
  {
    uri: "graph://stats",
    name: "Graph Statistics",
    description:
      "Real-time statistics: node count, edge count, diversity score, clustering info",
    mimeType: "application/json",
  },
  {
    uri: "graph://history",
    name: "Traversal History",
    description: "The conceptual journey taken - sequence of visited nodes",
    mimeType: "application/json",
  },
  {
    uri: "graph://recent",
    name: "Recent Associations",
    description: "Last 10 concepts added to the graph",
    mimeType: "application/json",
  },
  {
    uri: "graph://clusters",
    name: "Concept Clusters",
    description: "Identified conceptual communities in the graph",
    mimeType: "application/json",
  },
  {
    uri: "graph://bridges",
    name: "Bridge Nodes",
    description: "Concepts that connect different clusters",
    mimeType: "application/json",
  },
  {
    uri: "graph://gaps",
    name: "Structural Gaps",
    description: "Missing connections between related concepts",
    mimeType: "application/json",
  },
];

// =============================================================================
// PROMPTS - Workflow templates for associative thinking patterns
// =============================================================================

const PROMPTS: Prompt[] = [
  {
    name: "creative-blockbuster",
    description:
      "Break through creative blocks with a powerful 3-step sequence: drift → oblique → bisociate. Best for when you're completely stuck.",
    arguments: [
      {
        name: "problem",
        description: "The problem or concept you're stuck on",
        required: true,
      },
    ],
  },
  {
    name: "deep-exploration",
    description:
      "Maximum chaos exploration: serendipity → meta → drift. High novelty, perfect for discovering unknown unknowns.",
    arguments: [
      {
        name: "domain",
        description: "The domain or area you want to explore",
        required: true,
      },
    ],
  },
  {
    name: "structured-innovation",
    description:
      "Balanced innovation workflow: bisociate → drift → meta. Generates radical ideas while maintaining coherence.",
    arguments: [
      {
        name: "challenge",
        description: "The innovation challenge or opportunity",
        required: true,
      },
      {
        name: "source_domain",
        description: "Optional: A domain to draw inspiration from",
        required: false,
      },
    ],
  },
  {
    name: "problem-reframing",
    description:
      "Reframe problems from multiple angles: oblique → serendipity → bisociate. Transforms how you see the problem.",
    arguments: [
      {
        name: "problem",
        description: "The problem that needs reframing",
        required: true,
      },
    ],
  },
  {
    name: "full-dream-sequence",
    description:
      "The complete associative dreaming experience: all 5 tools in optimal sequence ending with meta-association chaos weaving.",
    arguments: [
      {
        name: "seed",
        description: "The seed concept to begin the dream sequence",
        required: true,
      },
      {
        name: "chaos_level",
        description: "How wild should it get? (low, medium, high)",
        required: false,
      },
    ],
  },
];

// Create the MCP server
const server = new Server(
  {
    name: "associative-dreaming-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  },
);

// Initialize the Associative Dreaming server
const dreamingServer = new AssociativeDreamingServer();

// Register the tools with the MCP server
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    SEMANTIC_DRIFT_TOOL,
    BISOCIATIVE_SYNTHESIS_TOOL,
    OBLIQUE_CONSTRAINT_TOOL,
    SERENDIPITY_SCAN_TOOL,
    META_ASSOCIATION_TOOL,
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;

  if (
    toolName === "semantic_drift" ||
    toolName === "bisociative_synthesis" ||
    toolName === "oblique_constraint" ||
    toolName === "serendipity_scan" ||
    toolName === "meta_association"
  ) {
    const result = dreamingServer.processDream({
      tool: toolName,
      input: request.params.arguments,
    });
    // Return only the MCP-compatible content structure
    return {
      content: result.content,
      isError: result.isError,
    };
  }

  return {
    content: [
      {
        type: "text",
        text: `Unknown tool: ${toolName}`,
      },
    ],
    isError: true,
  };
});

// =============================================================================
// RESOURCE HANDLERS
// =============================================================================

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: RESOURCES,
}));

// Read resource content
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  const graph = dreamingServer.getDreamGraph();

  switch (uri) {
    case "graph://current": {
      const exported = graph.exportGraph();
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(exported, null, 2),
          },
        ],
      };
    }

    case "graph://stats": {
      const nodes = graph.getAllNodes();
      const edges = graph.getAllEdges();
      const clusters = graph.detectClusters();
      const bridges = graph.findBridgeNodes();

      const stats = {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        diversity: graph.calculateDiversity(),
        clusterCount: clusters.size,
        bridgeNodeCount: bridges.length,
        structuralHoles: graph.findStructuralHoles().length,
        averageEdgesPerNode:
          nodes.length > 0 ? (edges.length / nodes.length).toFixed(2) : 0,
        edgeTypeDistribution: edges.reduce(
          (acc, e) => {
            acc[e.type] = (acc[e.type] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
      };

      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(stats, null, 2),
          },
        ],
      };
    }

    case "graph://history": {
      const history = graph.getTraversalHistory();
      const nodes = history.map((id) => {
        const node = graph.getNode(id);
        return node
          ? { id, content: node.content, source: node.source }
          : { id, content: "Unknown", source: "unknown" };
      });

      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                totalSteps: history.length,
                path: nodes,
                currentPosition: nodes[nodes.length - 1] || null,
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    case "graph://recent": {
      const allNodes = graph.getAllNodes();
      const recent = allNodes
        .sort((a, b) => b.creationTimestamp - a.creationTimestamp)
        .slice(0, 10)
        .map((n) => ({
          id: n.id,
          content: n.content,
          source: n.source,
          createdAt: new Date(n.creationTimestamp).toISOString(),
          driftDistance: n.driftDistance,
        }));

      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify({ recentConcepts: recent }, null, 2),
          },
        ],
      };
    }

    case "graph://clusters": {
      const clusters = graph.detectClusters();
      const clusterData: Record<string, { size: number; concepts: string[] }> =
        {};

      for (const [clusterId, nodeIds] of clusters.entries()) {
        const concepts = Array.from(nodeIds).map((id) => {
          const node = graph.getNode(id);
          return node?.content || id;
        });
        clusterData[clusterId] = { size: nodeIds.size, concepts };
      }

      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                totalClusters: clusters.size,
                clusters: clusterData,
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    case "graph://bridges": {
      const bridges = graph.findBridgeNodes();
      const bridgeData = bridges.map((b) => {
        const node = graph.getNode(b.nodeId);
        return {
          id: b.nodeId,
          content: node?.content || "Unknown",
          connectsClusters: b.connectsClusters,
          betweenness: b.betweenness.toFixed(4),
        };
      });

      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                bridgeCount: bridges.length,
                bridges: bridgeData,
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    case "graph://gaps": {
      const gaps = graph.findStructuralGaps();

      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                gapCount: gaps.length,
                gaps: gaps.map((g) => ({
                  concept1: g.concept1,
                  concept2: g.concept2,
                  reason: g.reason,
                  suggestion: `Consider connecting "${g.concept1}" and "${g.concept2}" - they share ${g.reason}`,
                })),
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    default: {
      // Handle dynamic node URIs like graph://nodes/{id}
      if (uri.startsWith("graph://nodes/")) {
        const nodeId = uri.replace("graph://nodes/", "");
        const node = graph.getNode(nodeId);

        if (!node) {
          throw new Error(`Node not found: ${nodeId}`);
        }

        const incomingEdges = graph.getEdgesTo(nodeId);
        const outgoingEdges = graph.getEdgesFrom(nodeId);

        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify(
                {
                  ...node,
                  connections: {
                    incoming: incomingEdges.map((e) => ({
                      from: e.source,
                      type: e.type,
                      weight: e.weight,
                    })),
                    outgoing: outgoingEdges.map((e) => ({
                      to: e.target,
                      type: e.type,
                      weight: e.weight,
                    })),
                  },
                  betweenness: graph.calculateBetweenness(nodeId),
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      throw new Error(`Unknown resource: ${uri}`);
    }
  }
});

// =============================================================================
// PROMPT HANDLERS
// =============================================================================

// List available prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: PROMPTS,
}));

// Get prompt content
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const promptName = request.params.name;
  const args = request.params.arguments || {};

  switch (promptName) {
    case "creative-blockbuster": {
      const problem = args.problem || "your creative challenge";
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `I'm stuck on: "${problem}"

Let's break through this creative block using associative dreaming!

**Step 1: Semantic Drift** - First, let's drift away from the problem to find unexpected angles.
Please call semantic_drift with:
- anchorConcept: "${problem}"
- driftMagnitude: 0.7
- temperature: 0.6

**Step 2: Oblique Constraint** - After the drift, apply a creative constraint to the new concept.
Please call oblique_constraint with:
- currentBlock: [use the concept from step 1]
- constraintType: "oblique"

**Step 3: Bisociative Synthesis** - Finally, force a collision between the original problem and what emerged.
Please call bisociative_synthesis with:
- matrixA: "${problem}"
- matrixB: [use the constraint insight from step 2]

After all three steps, synthesize the insights into actionable ideas for "${problem}".`,
            },
          },
        ],
      };
    }

    case "deep-exploration": {
      const domain = args.domain || "the unknown";
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Let's deeply explore: "${domain}"

This is a high-chaos exploration to discover unknown unknowns!

**Step 1: Serendipity Scan** - Search for surprising entry points.
Please call serendipity_scan with:
- currentContext: "${domain}"
- noveltyThreshold: 0.8
- scanType: "random"

**Step 2: Semantic Drift** - Take what we found and drift even further.
Please call semantic_drift with:
- anchorConcept: [use the discovery from step 1]
- driftMagnitude: 0.9
- temperature: 0.8

**Step 3: Meta-Association** - If we have 2+ results, weave them together for maximum insight.
Please call meta_association with:
- priorOutputs: [array of results from steps 1 and 2]
- chaosIntensity: 0.8

Map out the territory we've discovered in "${domain}".`,
            },
          },
        ],
      };
    }

    case "structured-innovation": {
      const challenge = args.challenge || "the innovation challenge";
      const sourceDomain = args.source_domain;
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Innovation challenge: "${challenge}"
${sourceDomain ? `Drawing inspiration from: "${sourceDomain}"` : ""}

Let's generate structured innovation with balanced chaos!

**Step 1: Bisociative Synthesis** - Import patterns from another domain.
Please call bisociative_synthesis with:
- matrixA: "${challenge}"
${sourceDomain ? `- matrixB: "${sourceDomain}"` : "- matrixB: (let the tool auto-select)"}

**Step 2: Semantic Drift** - Explore variations of the bridge concept.
Please call semantic_drift with:
- anchorConcept: [use the bridge concept from step 1]
- driftMagnitude: 0.5
- temperature: 0.5

**Step 3: Meta-Association** - Synthesize the innovations.
Please call meta_association with:
- priorOutputs: [array of results from steps 1 and 2]
- chaosIntensity: 0.5
- contextAnchor: "${challenge}"

Distill these into 3-5 concrete innovation opportunities for "${challenge}".`,
            },
          },
        ],
      };
    }

    case "problem-reframing": {
      const problem = args.problem || "the problem";
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Problem to reframe: "${problem}"

Let's transform how we see this problem!

**Step 1: Oblique Constraint** - Break the frame with an oblique strategy.
Please call oblique_constraint with:
- currentBlock: "${problem}"
- constraintType: "random"

**Step 2: Serendipity Scan** - Find unexpected connections.
Please call serendipity_scan with:
- currentContext: "${problem}"
- noveltyThreshold: 0.7
- scanType: "gap"

**Step 3: Bisociative Synthesis** - Create a new frame by colliding perspectives.
Please call bisociative_synthesis with:
- matrixA: "${problem}"
- matrixB: [use insight from step 1 or 2]

Present 3 radically different ways to frame "${problem}" based on what emerged.`,
            },
          },
        ],
      };
    }

    case "full-dream-sequence": {
      const seed = args.seed || "the seed concept";
      const chaosLevel = args.chaos_level || "medium";
      const chaosValues = { low: 0.3, medium: 0.6, high: 0.9 };
      const chaos = chaosValues[chaosLevel as keyof typeof chaosValues] || 0.6;

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `🌙 FULL DREAM SEQUENCE 🌙
Seed: "${seed}"
Chaos Level: ${chaosLevel} (${chaos})

Let's traverse the complete associative dreaming journey!

**Step 1: Semantic Drift** - Begin the dream by drifting from the seed.
Please call semantic_drift with:
- anchorConcept: "${seed}"
- driftMagnitude: ${chaos}
- temperature: ${chaos}

**Step 2: Bisociative Synthesis** - Collide the drift result with an unexpected domain.
Please call bisociative_synthesis with:
- matrixA: [concept from step 1]

**Step 3: Oblique Constraint** - Apply creative pressure.
Please call oblique_constraint with:
- currentBlock: [bridge concept from step 2]
- constraintType: "oblique"

**Step 4: Serendipity Scan** - Search for hidden connections in what's emerged.
Please call serendipity_scan with:
- currentContext: [apply constraint insight to original seed]
- noveltyThreshold: ${chaos}
- scanType: "bridge"

**Step 5: Meta-Association** - THE CHAOS WEAVING - Force everything to collide!
Please call meta_association with:
- priorOutputs: [ALL results from steps 1-4]
- chaosIntensity: ${chaos}
- contextAnchor: "${seed}"

After the full sequence, present:
1. The most surprising insight
2. The wildest connection made
3. Three actionable ideas that emerged
4. What "unknown unknowns" were discovered`,
            },
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown prompt: ${promptName}`);
  }
});

/**
 * Start the MCP server and attach it to the stdio transport.
 *
 * Creates a StdioServerTransport, connects the module's server to that transport,
 * and emits an informational startup log message.
 */
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log("info", "Associative Dreaming MCP Server running on stdio");
}

runServer().catch((error) => {
  logError(error, { scope: "startup" });
  process.exit(1);
});