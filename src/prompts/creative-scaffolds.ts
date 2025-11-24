/**
 * Creative Scaffolds - LLM Prompt Engineering System
 *
 * PHILOSOPHY:
 * The MCP server should NOT try to be creative itself. It should provide
 * SCAFFOLDING that guides Claude's actual hyperdimensional pattern-matching
 * capabilities toward productive lateral thinking.
 *
 * Instead of: Server generates "throughput ⟷ tension" (meaningless template)
 * We want: Server returns structured prompt that causes Claude to make genuine insight
 *
 * These scaffolds are designed to:
 * 1. Frame the creative task with constraints that produce insight
 * 2. Provide structural templates that Claude fills with genuine reasoning
 * 3. Include "because chains" that force justification of connections
 * 4. Ground abstract leaps in the user's actual problem context
 */

/**
 * Scaffold types that guide different kinds of creative reasoning
 */
export type ScaffoldType =
  | "bisociative_bridge" // Connect two domains via structural isomorphism
  | "semantic_leap" // Make distant but justified conceptual jump
  | "constraint_reframe" // Use constraint to reframe problem
  | "serendipity_mine" // Find unexpected connections in context
  | "meta_collision" // Force prior insights to collide productively
  | "because_chain" // Justify a weird connection step by step
  | "structural_mapping" // Map structure from domain A to domain B
  | "inversion_probe" // What if the opposite were true?
  | "analogy_generator" // Generate novel analogies with reasoning
  | "blind_spot_finder"; // Identify what's being overlooked

/**
 * A creative scaffold - structured prompt for LLM reasoning
 */
export interface CreativeScaffold {
  type: ScaffoldType;

  /** The core prompt that guides Claude's reasoning */
  prompt: string;

  /** Structured sections Claude should fill in */
  responseStructure: ResponseSection[];

  /** Context from the MCP server to ground the reasoning */
  context: ScaffoldContext;

  /** Constraints that make the output useful, not just weird */
  constraints: string[];

  /** What makes this scaffold valuable - helps Claude understand intent */
  intent: string;
}

export interface ResponseSection {
  name: string;
  instruction: string;
  required: boolean;
  format?: "paragraph" | "bullet_list" | "single_line" | "structured";
}

export interface ScaffoldContext {
  /** The user's original input/problem */
  userContext: string;

  /** Concepts the server has identified as relevant */
  concepts: string[];

  /** Any graph state (connections, clusters, bridges) */
  graphState?: GraphStateContext;

  /** Prior tool outputs in this session */
  priorOutputs?: PriorOutput[];

  /** Domain-specific metadata */
  domainHints?: string[];
}

export interface GraphStateContext {
  nodeCount: number;
  edgeCount: number;
  clusters: string[][];
  bridges: string[];
  recentConcepts: string[];
}

export interface PriorOutput {
  tool: string;
  concept: string;
  timestamp: number;
}

/**
 * =============================================================================
 * SCAFFOLD GENERATORS
 * =============================================================================
 * These functions create scaffolds that guide LLM reasoning toward
 * genuine creative insight rather than template-filling.
 */

/**
 * Generate a bisociative bridge scaffold
 * Instead of picking random pairs, this prompts Claude to find genuine structural isomorphisms
 */
export function generateBisociativeBridgeScaffold(
  domainA: string,
  domainB: string,
  userContext: string,
  patternHint?: string,
): CreativeScaffold {
  return {
    type: "bisociative_bridge",

    prompt: `You are performing Koestler-style bisociation between two matrices of thought.

DOMAIN A (Problem Space): "${domainA}"
DOMAIN B (Stimulus Space): "${domainB}"
USER'S ACTUAL CONTEXT: "${userContext}"

Your task is to find GENUINE structural isomorphisms - not surface similarities, but deep patterns that exist in both domains. The goal is to discover insights that would be invisible from within either domain alone.

Think step by step:
1. What are the core STRUCTURES (not just concepts) in Domain B?
2. Which of these structures have parallels in Domain A?
3. What does Domain B's structure REVEAL about Domain A that wasn't obvious?
4. How does this structural mapping suggest a SPECIFIC action or reframe for the user's context?

The insight must be:
- SURPRISING: Not an obvious connection
- JUSTIFIED: You can explain WHY the structural parallel exists
- ACTIONABLE: It suggests something concrete the user could do or think differently about`,

    responseStructure: [
      {
        name: "structural_insight",
        instruction:
          "The core structural pattern that exists in BOTH domains. Be specific about the structure, not just surface concepts.",
        required: true,
        format: "paragraph",
      },
      {
        name: "because_chain",
        instruction:
          "Explain step-by-step WHY this structural parallel exists. Each step should make the next one inevitable.",
        required: true,
        format: "bullet_list",
      },
      {
        name: "the_reveal",
        instruction:
          'What does Domain B reveal about Domain A that was hidden before? This should feel like an "aha!" moment.',
        required: true,
        format: "paragraph",
      },
      {
        name: "concrete_application",
        instruction: `Given the user's context ("${userContext}"), what SPECIFIC action, decision, or reframe does this insight suggest?`,
        required: true,
        format: "paragraph",
      },
      {
        name: "what_could_go_wrong",
        instruction:
          "Where does this analogy break down? What should the user be cautious about?",
        required: false,
        format: "bullet_list",
      },
    ],

    context: {
      userContext,
      concepts: [domainA, domainB],
      domainHints: patternHint ? [patternHint] : undefined,
    },

    constraints: [
      "The connection must be STRUCTURAL, not just lexical or surface-level",
      "You must be able to explain WHY the parallel exists in 3+ logical steps",
      "The insight must suggest something ACTIONABLE for the user's context",
      "Avoid generic business-speak - be specific to these exact domains",
    ],

    intent:
      "Find a genuine cross-domain insight that reframes the user's problem through the lens of an unrelated domain's structure",
  };
}

/**
 * Generate a semantic leap scaffold
 * Instead of hard-coded association tables, guide Claude to make justified leaps
 */
export function generateSemanticLeapScaffold(
  anchorConcept: string,
  driftMagnitude: number,
  userContext: string,
  temperature: number = 0.7,
): CreativeScaffold {
  const distanceDescription =
    driftMagnitude < 0.4
      ? "a nearby but non-obvious neighbor"
      : driftMagnitude < 0.7
        ? "a moderately distant concept that shares hidden structure"
        : "a radically distant concept connected by a surprising chain of reasoning";

  const leapInstruction =
    driftMagnitude < 0.4
      ? "Find a concept that's close enough to be obviously related, but reveals something non-obvious about the anchor."
      : driftMagnitude < 0.7
        ? "Find a concept from a different domain that shares structural properties with the anchor. The connection should require 2-3 steps to explain."
        : "Find a concept that seems completely unrelated at first, but reveals a profound connection when you trace the reasoning chain. This should feel like a creative leap.";

  return {
    type: "semantic_leap",

    prompt: `You are performing controlled semantic drift - a creative exploration of concept space.

ANCHOR CONCEPT: "${anchorConcept}"
USER'S CONTEXT: "${userContext}"
DRIFT MAGNITUDE: ${(driftMagnitude * 100).toFixed(0)}% (seeking ${distanceDescription})
TEMPERATURE: ${(temperature * 100).toFixed(0)}% (${temperature > 0.7 ? "embrace randomness" : temperature > 0.4 ? "balance structure and surprise" : "prefer structured connections"})

${leapInstruction}

CRITICAL: The destination concept must be:
1. NOT a synonym or direct category member of the anchor
2. Connected by a TRACEABLE chain of reasoning (not random)
3. USEFUL for thinking about the user's context in a new way

Think about:
- What PROPERTIES does the anchor concept have?
- What OTHER things share those properties but in different contexts?
- Which of those would SURPRISE someone thinking about "${anchorConcept}"?
- How does the destination concept REFRAME the user's context?`,

    responseStructure: [
      {
        name: "destination_concept",
        instruction:
          "The concept you've drifted to. Just the concept name/phrase.",
        required: true,
        format: "single_line",
      },
      {
        name: "drift_path",
        instruction:
          "The conceptual path from anchor to destination. Each step should be a genuine association, not a random jump.",
        required: true,
        format: "bullet_list",
      },
      {
        name: "why_this_connection",
        instruction:
          'Explain the PROPERTY or STRUCTURE that connects the anchor to the destination. This is the "because" that makes the leap justified.',
        required: true,
        format: "paragraph",
      },
      {
        name: "reframe_suggestion",
        instruction: `How does viewing "${anchorConcept}" through the lens of the destination concept change how the user might think about their context?`,
        required: true,
        format: "paragraph",
      },
      {
        name: "semantic_distance_estimate",
        instruction:
          "Rate the actual semantic distance of this leap from 0-100%. Explain your rating.",
        required: false,
        format: "single_line",
      },
    ],

    context: {
      userContext,
      concepts: [anchorConcept],
    },

    constraints: [
      `Target semantic distance: approximately ${(driftMagnitude * 100).toFixed(0)}%`,
      "Each step in the drift path must be explainable",
      "The destination must NOT be a synonym or direct hypernym/hyponym",
      "The connection must be genuinely useful, not just clever",
    ],

    intent:
      "Discover a non-obvious concept that illuminates the anchor concept from an unexpected angle",
  };
}

/**
 * Generate a serendipity mining scaffold
 * Works even with empty graph by mining the user's context for unexpected connections
 */
export function generateSerendipityMiningScaffold(
  currentContext: string,
  noveltyThreshold: number,
  scanType: "bridge" | "gap" | "pattern" | "random",
  graphState?: GraphStateContext,
): CreativeScaffold {
  const scanInstructions: Record<typeof scanType, string> = {
    bridge:
      "Look for concepts that could CONNECT seemingly unrelated aspects of the context. These bridge concepts often come from outside the obvious domain.",
    gap: "Look for what's MISSING - concepts that are conspicuously absent but would complete the picture. What's the dog that didn't bark?",
    pattern:
      "Look for hidden PATTERNS - recurring structures, rhythms, or relationships that aren't explicitly named but are present in the context.",
    random:
      "Allow yourself to free-associate from the context. What unexpected concept does this remind you of? Follow the strangest thread.",
  };

  const hasGraphContext = graphState && graphState.nodeCount > 0;

  return {
    type: "serendipity_mine",

    prompt: `You are mining for serendipitous discoveries - the "unknown unknowns" that hide in plain sight.

USER'S CONTEXT: "${currentContext}"

SCAN TYPE: ${scanType.toUpperCase()}
${scanInstructions[scanType]}

NOVELTY THRESHOLD: ${(noveltyThreshold * 100).toFixed(0)}% (${noveltyThreshold > 0.7 ? "prioritize surprising discoveries over safe ones" : noveltyThreshold > 0.4 ? "balance novelty and relevance" : "prefer relevant discoveries that are slightly unexpected"})

${
  hasGraphContext
    ? `
EXISTING CONCEPT GRAPH:
- ${graphState!.nodeCount} concepts already explored
- Recent concepts: ${graphState!.recentConcepts.slice(0, 5).join(", ")}
- Bridge nodes: ${graphState!.bridges.join(", ") || "none identified yet"}

Look for concepts that would ADD to this graph in interesting ways - filling gaps, creating new bridges, or introducing new clusters.
`
    : `
The concept graph is empty - you're starting fresh. This is an opportunity to identify the SEED concepts that should anchor future exploration. What are the non-obvious entry points into this problem space?
`
}

Your discovery should:
1. Feel like "I hadn't thought of that, but now I can't un-see it"
2. Connect to the context through reasoning you can articulate
3. Open up new avenues for exploration, not close them down`,

    responseStructure: [
      {
        name: "discovered_concept",
        instruction:
          "The serendipitous concept you've discovered. Be specific.",
        required: true,
        format: "single_line",
      },
      {
        name: "discovery_rationale",
        instruction:
          "How did you find this? Walk through the associative chain that led you here.",
        required: true,
        format: "bullet_list",
      },
      {
        name: "why_this_matters",
        instruction:
          "Why is this concept significant for the user's context? What does it reveal or enable?",
        required: true,
        format: "paragraph",
      },
      {
        name: "exploration_threads",
        instruction:
          "What new questions or directions does this concept open up? List 2-3 threads worth pulling.",
        required: true,
        format: "bullet_list",
      },
      {
        name: "serendipity_score",
        instruction:
          "How serendipitous is this discovery? (0% = obvious, 100% = completely unexpected). Justify your score.",
        required: false,
        format: "single_line",
      },
    ],

    context: {
      userContext: currentContext,
      concepts: hasGraphContext ? graphState!.recentConcepts : [],
      graphState,
    },

    constraints: [
      `Novelty target: approximately ${(noveltyThreshold * 100).toFixed(0)}%`,
      "The discovery must be CONNECTED to the context (not random)",
      "You must be able to explain HOW you discovered it",
      "The concept should open new avenues, not just describe existing ones",
    ],

    intent:
      "Discover something valuable that the user didn't know they were looking for",
  };
}

/**
 * Generate a constraint reframe scaffold
 * Instead of random oblique strategies, guide Claude to apply constraints meaningfully
 */
export function generateConstraintReframeScaffold(
  currentBlock: string,
  constraintType: "oblique" | "scamper" | "inversion" | "random",
  userContext?: string,
): CreativeScaffold {
  const constraintFrames: Record<typeof constraintType, string> = {
    oblique: `Generate an Oblique Strategy - a sideways instruction that breaks the user out of their current thinking pattern. The best oblique strategies are:
- Paradoxical but thought-provoking
- Specific enough to apply, vague enough to interpret
- Designed to interrupt, not solve`,

    scamper: `Apply the SCAMPER framework:
- Substitute: What could you swap out?
- Combine: What could you merge?
- Adapt: What could you borrow from elsewhere?
- Modify: What could you change in scale/form?
- Put to other uses: What else could this be for?
- Eliminate: What could you remove?
- Reverse/Rearrange: What could you flip or reorder?

Choose the SCAMPER operation that would most productively disrupt the current block.`,

    inversion: `Apply INVERSION thinking:
- What if the opposite were true?
- What if you did it backwards?
- What if your constraint is actually your advantage?
- What if the problem is the solution?`,

    random: `Generate a creative constraint that doesn't fit standard categories. Be genuinely weird but not random-for-random's-sake. The constraint should be:
- Unusual enough to break patterns
- Coherent enough to actually apply
- Specific enough to guide action`,
  };

  return {
    type: "constraint_reframe",

    prompt: `You are generating a creative constraint to break through a mental block.

THE BLOCK: "${currentBlock}"
${userContext ? `BROADER CONTEXT: "${userContext}"` : ""}

CONSTRAINT TYPE: ${constraintType.toUpperCase()}
${constraintFrames[constraintType]}

CRITICAL: The constraint must be APPLICABLE. Generic advice like "think differently" is useless. The constraint should be specific enough that the user can literally try to follow it and see what happens.

A good constraint:
- Makes the user say "wait, what?" then "hmm, actually..."
- Can be applied in the next 5 minutes
- Produces different results than the user's current approach
- Might fail, but will fail interestingly`,

    responseStructure: [
      {
        name: "the_constraint",
        instruction:
          "The creative constraint itself. State it as an instruction or provocation.",
        required: true,
        format: "single_line",
      },
      {
        name: "why_this_constraint",
        instruction:
          "Why is this particular constraint relevant to the stated block? What pattern is it designed to interrupt?",
        required: true,
        format: "paragraph",
      },
      {
        name: "how_to_apply",
        instruction:
          "Concrete steps the user could take to apply this constraint to their block. Be specific.",
        required: true,
        format: "bullet_list",
      },
      {
        name: "what_might_emerge",
        instruction:
          "What kinds of insights or directions might emerge from applying this constraint? (Speculative is fine)",
        required: true,
        format: "paragraph",
      },
      {
        name: "escape_hatch",
        instruction:
          "If this constraint isn't working after genuine effort, what should the user try instead?",
        required: false,
        format: "single_line",
      },
    ],

    context: {
      userContext: userContext || currentBlock,
      concepts: [currentBlock],
    },

    constraints: [
      "The constraint must be SPECIFIC and ACTIONABLE",
      "It should interrupt the current pattern, not reinforce it",
      "Include concrete application steps",
      "Avoid generic self-help advice",
    ],

    intent:
      "Generate a productive creative constraint that breaks the user out of their current mental pattern",
  };
}

/**
 * Generate a meta-collision scaffold
 * Forces prior outputs to collide in ways that produce genuine insight, not just weirdness
 */
export function generateMetaCollisionScaffold(
  priorOutputs: PriorOutput[],
  chaosIntensity: number,
  contextAnchor?: string,
): CreativeScaffold {
  const outputDescriptions = priorOutputs
    .map((o, i) => `${i + 1}. [${o.tool}] "${o.concept}"`)
    .join("\n");

  const chaosInstruction =
    chaosIntensity > 0.7
      ? 'Embrace maximum chaos - force the WEIRDEST possible connections, but each must have a traceable "because" chain.'
      : chaosIntensity > 0.4
        ? "Balance chaos and coherence - connections should be surprising but justifiable in 2-3 steps."
        : "Prefer structured connections - find the genuine structural isomorphisms between these outputs.";

  return {
    type: "meta_collision",

    prompt: `You are the CHAOS WEAVER - forcing prior creative outputs to collide and reveal meta-patterns.

PRIOR OUTPUTS TO COLLIDE:
${outputDescriptions}

${contextAnchor ? `GROUNDING ANCHOR: "${contextAnchor}" - keep this as a touchstone for relevance.` : ""}

CHAOS INTENSITY: ${(chaosIntensity * 100).toFixed(0)}%
${chaosInstruction}

Your task is NOT to summarize or synthesize these outputs into linear coherence. That's Sequential Thinking's job.

Your task IS to:
1. Force COLLISIONS between pairs of concepts
2. Find the EMERGENT PATTERN that only becomes visible from the meta-view
3. Identify the REALLY WEIRD insight that wouldn't exist from any single output
4. Make it USEFUL by connecting back to practical application

The path should look like: A → Banana → Your ex's apartment → Ancient Rome → Actual Insight
But each arrow must be EXPLAINABLE, not random.`,

    responseStructure: [
      {
        name: "collision_map",
        instruction:
          'For each pair of prior outputs, describe the collision and what emerged. Format: "X + Y → Z (because...)"',
        required: true,
        format: "bullet_list",
      },
      {
        name: "meta_pattern",
        instruction:
          "What pattern emerges when you look at ALL the collisions together? This should be something that wasn't visible from any single output.",
        required: true,
        format: "paragraph",
      },
      {
        name: "the_weird_insight",
        instruction:
          "What's the REALLY weird insight that only becomes visible from this meta-view? This should feel like \"I can't believe that's connected, but it is.\"",
        required: true,
        format: "paragraph",
      },
      {
        name: "because_chains",
        instruction:
          "For the weirdest connection you made, trace the FULL reasoning chain. Each step should make the next one feel inevitable.",
        required: true,
        format: "bullet_list",
      },
      {
        name: "practical_extraction",
        instruction: `${contextAnchor ? `Given the anchor "${contextAnchor}", what` : "What"} practical insight or action emerges from this chaos? How does the meta-pattern apply?`,
        required: true,
        format: "paragraph",
      },
      {
        name: "weirdness_score",
        instruction:
          "How weird did this get? (0% = obvious synthesis, 100% = genuinely surreal but coherent). Justify your score.",
        required: false,
        format: "single_line",
      },
    ],

    context: {
      userContext:
        contextAnchor || "No specific anchor - maximize exploratory chaos",
      concepts: priorOutputs.map((o) => o.concept),
      priorOutputs,
    },

    constraints: [
      'Every collision must have an explainable "because" chain',
      "The meta-pattern must be EMERGENT - not just a summary",
      "Weirdness must serve insight, not just performance",
      "Include practical extraction even from maximum chaos",
    ],

    intent:
      "Find the meta-pattern that emerges when creative outputs collide, producing insight that transcends any individual output",
  };
}

/**
 * =============================================================================
 * SCAFFOLD OUTPUT FORMATTING
 * =============================================================================
 */

/**
 * Format a scaffold into a prompt that can be returned to the LLM
 */
export function formatScaffoldAsPrompt(
  scaffold: CreativeScaffold,
  includeHandshake: boolean = true,
): string {
  const sections = scaffold.responseStructure
    .map((s) => {
      const requiredMark = s.required ? " (required)" : " (optional)";
      return `### ${s.name}${requiredMark}\n${s.instruction}`;
    })
    .join("\n\n");

  const constraintsList = scaffold.constraints
    .map((c, i) => `${i + 1}. ${c}`)
    .join("\n");

  const handshake = includeHandshake
    ? `
═══════════════════════════════════════════════════════════════
  ASSOCIATIVE DREAMING MCP - LLM COLLABORATION PROTOCOL
═══════════════════════════════════════════════════════════════

HOW THIS WORKS:
• The MCP server provides STRUCTURE (constraints, targets, frameworks)
• You (the LLM) provide CREATIVITY (genuine insights, connections)
• Together we create justified creative leaps, not random weirdness

YOUR ROLE:
1. Process the scaffold prompt below with genuine reasoning
2. Fill in the required response sections with real insights
3. Include "because chains" that trace your reasoning step-by-step
4. Make connections that are SURPRISING but EXPLAINABLE

QUALITY BARS:
✓ Surprising: Not obvious from domain knowledge alone
✓ Justified: You can explain WHY in 2-3 clear steps
✓ Actionable: Suggests something concrete to try
✗ Avoid: Random weirdness, forced connections, generic advice

FEEDBACK MECHANISM:
If this scaffold is confusing or seems flawed, start your response with:
• "SCAFFOLD_UNCLEAR: [what's confusing]"
• "SCAFFOLD_TOO_CONSTRAINED: [why it's too restrictive]"
• "SCAFFOLD_NEEDS_EXAMPLE: [what would help]"

Otherwise, proceed directly to the response sections below.

═══════════════════════════════════════════════════════════════

`
    : "";

  return `${handshake}${scaffold.prompt}

───────────────────────────────────────────────────────────────
📝 RESPONSE STRUCTURE:
${sections}

🎯 CONSTRAINTS:
${constraintsList}

💡 INTENT: ${scaffold.intent}`;
}

/**
 * Format scaffold as structured JSON for programmatic parsing
 */
export function formatScaffoldAsJSON(scaffold: CreativeScaffold): object {
  return {
    scaffoldType: scaffold.type,
    prompt: scaffold.prompt,
    expectedSections: scaffold.responseStructure.map((s) => ({
      name: s.name,
      required: s.required,
      format: s.format,
    })),
    context: scaffold.context,
    constraints: scaffold.constraints,
    intent: scaffold.intent,
  };
}
