/**
 * Session Context - Track LLM familiarity with scaffolds
 *
 * PROBLEM: Showing the full handshake every time is redundant.
 * SOLUTION: Track which tools the LLM has used and adjust verbosity.
 */

export interface SessionState {
  toolsUsed: Set<string>;
  totalCalls: number;
  lastCallTimestamp: number;
  feedbackReceived: number;
}

export class SessionContextManager {
  private sessions: Map<string, SessionState> = new Map();

  /**
   * Get or create session state
   */
  getSession(sessionId: string = 'default'): SessionState {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        toolsUsed: new Set(),
        totalCalls: 0,
        lastCallTimestamp: Date.now(),
        feedbackReceived: 0,
      });
    }
    return this.sessions.get(sessionId)!;
  }

  /**
   * Record a tool usage
   */
  recordToolUse(toolName: string, sessionId: string = 'default'): void {
    const session = this.getSession(sessionId);
    session.toolsUsed.add(toolName);
    session.totalCalls++;
    session.lastCallTimestamp = Date.now();
  }

  /**
   * Check if this is the first time using this tool
   */
  isFirstUse(toolName: string, sessionId: string = 'default'): boolean {
    const session = this.getSession(sessionId);
    return !session.toolsUsed.has(toolName);
  }

  /**
   * Check if any tools have been used (first interaction ever)
   */
  isFirstInteraction(sessionId: string = 'default'): boolean {
    const session = this.getSession(sessionId);
    return session.totalCalls === 0;
  }

  /**
   * Determine handshake verbosity level
   */
  getHandshakeLevel(toolName: string, sessionId: string = 'default'): 'full' | 'brief' | 'none' {
    const session = this.getSession(sessionId);

    // First interaction ever: full handshake
    if (session.totalCalls === 0) {
      return 'full';
    }

    // First time using THIS tool: brief handshake
    if (!session.toolsUsed.has(toolName)) {
      return 'brief';
    }

    // Familiar with this tool: no handshake
    return 'none';
  }

  /**
   * Record feedback
   */
  recordFeedback(sessionId: string = 'default'): void {
    const session = this.getSession(sessionId);
    session.feedbackReceived++;
  }

  /**
   * Clear old sessions (garbage collection)
   */
  clearStale(maxAgeMs: number = 3600000): void {
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastCallTimestamp > maxAgeMs) {
        this.sessions.delete(id);
      }
    }
  }
}

// Global session manager
export const sessionManager = new SessionContextManager();

/**
 * Generate handshake text based on familiarity level
 */
export function getHandshakeText(level: 'full' | 'brief' | 'none'): string {
  if (level === 'none') {
    return '';
  }

  if (level === 'brief') {
    return `
═══════════════════════════════════════════════════════════════
MCP-LLM COLLABORATION: Structure from server, creativity from you.
Quality bars: Surprising + Justified + Actionable
Feedback: Start with "SCAFFOLD_UNCLEAR:", "SCAFFOLD_TOO_CONSTRAINED:", etc.
═══════════════════════════════════════════════════════════════

`;
  }

  // Full handshake
  return `
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

`;
}
