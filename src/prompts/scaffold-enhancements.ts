/**
 * Scaffold Enhancements - Better LLM ↔ MCP Communication
 *
 * IMPROVEMENTS:
 * 1. Handshake instructions - Tell LLM how to work with scaffolds
 * 2. Example-driven prompts - Show good output
 * 3. Feedback mechanisms - Let LLM guide MCP
 */

/**
 * Handshake instruction to prepend to ALL scaffold prompts
 * This teaches the LLM how to work with the MCP server
 */
export const SCAFFOLD_HANDSHAKE = `
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
3. Include "because chains" that trace your reasoning
4. Make connections that are surprising BUT explainable

QUALITY BARS:
✓ Surprising: Not obvious from domain knowledge
✓ Justified: You can explain WHY in 2-3 steps
✓ Actionable: Suggests something concrete
✗ Avoid: Random weirdness, forced connections, generic advice

FEEDBACK MECHANISM:
If the scaffold doesn't make sense or seems flawed, you can:
- Say "SCAFFOLD_UNCLEAR: [what's confusing]"
- Say "SCAFFOLD_TOO_CONSTRAINED: [why]"
- Say "SCAFFOLD_NEEDS_EXAMPLE: [what would help]"

The server will learn from your feedback.

═══════════════════════════════════════════════════════════════
`;

/**
 * Example outputs for each scaffold type
 * These show the LLM what good output looks like
 */
export const SCAFFOLD_EXAMPLES = {
  semantic_drift: `
EXAMPLE SEMANTIC DRIFT (anchor: "API rate limiting", magnitude: 0.7):

### destination_concept
Traffic calming in urban planning

### drift_path
• API rate limiting → controlling flow to prevent system overload
• Flow control → traffic management → vehicles on roads
• Preventing overload → preventing congestion
• System capacity → road capacity
• Rate limiting strategies → traffic calming strategies

### why_this_connection
Both are about managing flow through a system with finite capacity.
Rate limiting = artificial slowdowns to prevent catastrophic failure.
Traffic calming = intentional friction (speed bumps, narrow lanes)
to prevent accidents and maintain livable neighborhoods.

The structural parallel: Sometimes the best way to preserve system
function isn't to maximize throughput, but to deliberately slow things
down at choke points.

### reframe_suggestion
Instead of thinking "how do I handle more requests?", think "how do
I design intentional friction that protects the system?" Traffic
calming uses speed bumps, roundabouts, narrow streets. What are your
API's speed bumps? Maybe: progressive delays, required pagination,
complexity budgets for queries.

The insight: Good rate limiting isn't punishment, it's UX design for
system health.
`,

  bisociative_synthesis: `
EXAMPLE BISOCIATIVE SYNTHESIS (A: "startup growth", B: "forest succession"):

### structural_insight
Both follow staged progression where early-stage strategies actively
PREVENT late-stage success if not abandoned at the right time.

In forests: Pioneer species (fast-growing, sun-loving) colonize
cleared land, then must be outcompeted by shade-tolerant species
for the forest to mature.

In startups: "Hustle tactics" (manual processes, founder-driven sales)
gain initial traction, but must be actively dismantled to scale.

The structure: Stage N strategies are Stage N+1 obstacles.

### because_chain
1. Forest succession requires pioneer species to prepare soil
2. But pioneers are MALADAPTED to the conditions they create
3. They create shade → shade kills them → succession happens
4. Startups have "pioneer tactics" that win early customers
5. But these tactics create organizational complexity
6. That complexity makes those tactics unsustainable
7. The tactics that got you here will kill you there

### the_reveal
You're not just growing your startup, you're SUCCEEDING yourself.
Each stage requires REPLACING, not just building on, previous tactics.

### concrete_application
Audit your "pioneer tactics":
• What are you doing manually that worked at 10 customers?
• Which founder-driven processes are now bottlenecks at 100?
• What hustle tactics create debt that will compound?

Then: Deliberately obsolete them. Not "when we have time" but as
an active strategic choice, like a forest replacing pioneers.
`,

  oblique_constraint: `
EXAMPLE OBLIQUE CONSTRAINT (block: "Users don't activate after signup"):

### the_constraint
"Design for users who will never come back after today"

### why_this_constraint
You're optimizing for "activation" (multi-day engagement), but the
block reveals users aren't staying long enough to activate. This
constraint flips the frame: What if one-session-and-done is not a
bug, but your actual use case?

It interrupts: "How do I get them to return?"
Forces: "What value can I deliver in ONE session?"

### how_to_apply
1. Analyze your most successful "one session only" users
   - What did they accomplish?
   - Did they get value even without returning?

2. Redesign onboarding as a complete experience, not a trailer
   - What's the ONE thing they should accomplish today?
   - Remove all "come back tomorrow to..." flows

3. Add "quick win" mode
   - No account required OR
   - Value before signup OR
   - Complete workflow in first session

### what_might_emerge
You might discover:
• Your actual value is single-use (like Calendly for guests)
• Multi-session activation is fighting user intent
• Your "power users" are a different segment entirely
• The "aha moment" must happen in minutes, not days
`
};

/**
 * Feedback schema for LLM → MCP communication
 */
export interface ScaffoldFeedback {
  feedbackType: 'UNCLEAR' | 'TOO_CONSTRAINED' | 'NEEDS_EXAMPLE' | 'WRONG_DIRECTION' | 'GOOD';
  message: string;
  suggestion?: string;
  timestamp: number;
}

/**
 * Parse feedback from LLM response
 */
export function parseScaffoldFeedback(llmResponse: string): ScaffoldFeedback | null {
  const feedbackPatterns = [
    /SCAFFOLD_UNCLEAR:\s*(.+)/i,
    /SCAFFOLD_TOO_CONSTRAINED:\s*(.+)/i,
    /SCAFFOLD_NEEDS_EXAMPLE:\s*(.+)/i,
    /SCAFFOLD_WRONG_DIRECTION:\s*(.+)/i,
  ];

  for (const pattern of feedbackPatterns) {
    const match = llmResponse.match(pattern);
    if (match) {
      const feedbackType = pattern.source.split('_')[1].split(':')[0] as any;
      return {
        feedbackType,
        message: match[1].trim(),
        timestamp: Date.now(),
      };
    }
  }

  // Check for positive feedback
  if (/SCAFFOLD_GOOD|EXCELLENT_SCAFFOLD|WELL_STRUCTURED/i.test(llmResponse)) {
    return {
      feedbackType: 'GOOD',
      message: 'LLM found scaffold helpful',
      timestamp: Date.now(),
    };
  }

  return null;
}

/**
 * Enhance a scaffold with handshake + examples
 */
export function enhanceScaffold(
  basePrompt: string,
  scaffoldType: keyof typeof SCAFFOLD_EXAMPLES,
  includeExample: boolean = true
): string {
  const parts = [
    SCAFFOLD_HANDSHAKE,
    basePrompt,
  ];

  if (includeExample && scaffoldType in SCAFFOLD_EXAMPLES) {
    parts.push(`
───────────────────────────────────────────────────────────────
  EXAMPLE OUTPUT (for reference)
───────────────────────────────────────────────────────────────
${SCAFFOLD_EXAMPLES[scaffoldType]}

Now produce YOUR output following the same structure:
`);
  }

  return parts.join('\n');
}

/**
 * Store feedback for learning
 */
export class FeedbackStore {
  private feedback: Map<string, ScaffoldFeedback[]> = new Map();

  add(scaffoldType: string, feedback: ScaffoldFeedback): void {
    if (!this.feedback.has(scaffoldType)) {
      this.feedback.set(scaffoldType, []);
    }
    this.feedback.get(scaffoldType)!.push(feedback);
  }

  getRecent(scaffoldType: string, limit: number = 10): ScaffoldFeedback[] {
    const items = this.feedback.get(scaffoldType) || [];
    return items.slice(-limit);
  }

  getStats(scaffoldType: string): {
    total: number;
    byType: Record<string, number>;
    goodRate: number;
  } {
    const items = this.feedback.get(scaffoldType) || [];
    const byType = items.reduce((acc, f) => {
      acc[f.feedbackType] = (acc[f.feedbackType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: items.length,
      byType,
      goodRate: items.length > 0 ? (byType.GOOD || 0) / items.length : 0,
    };
  }

  export(): object {
    const exported: Record<string, any> = {};
    for (const [type, items] of this.feedback.entries()) {
      exported[type] = {
        feedbackItems: items,
        stats: this.getStats(type),
      };
    }
    return exported;
  }
}

// Global feedback store
export const feedbackStore = new FeedbackStore();
