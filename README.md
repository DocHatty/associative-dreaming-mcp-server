# Associative Dreaming MCP Server
<img width="1024" height="1024" alt="516474930-0ef0af17-d48b-4e32-8674-855af43811a6" src="https://github.com/user-attachments/assets/ce432a1e-a163-48ef-950e-0a67e2691ced" />
The **Yin to Sequential Thinking's Yang**.

## The Hypothesis

What if we stop forcing AI to think A→B→C and instead let it go **A→Banana→Your ex's apartment→Ancient Rome→Answer**?

LLMs operate through pattern-matching across vast semantic spaces. They see connections across seemingly unrelated concepts. But instruction-tuning and safety alignment have biased them away from this—toward staying "on topic", being "relevant", avoiding "hallucinating".

This tool redirects toward exploration—the guardrails remain, the direction changes.

## Philosophy

```
Sequential Thinking (Yang)          Associative Dreaming (Yin)
────────────────────────────        ────────────────────────────
thought → thought → thought         concept ↔ concept ↔ concept
linear progression                  rhizomatic wandering
converges to answer                 diverges to discovery
"Is this correct?"                  "Where did I land?"
revision (fix mistakes)             return (see differently)
branching (explore paths)           collision (force insight)
```

## What This Actually Is

This is **prompt engineering infrastructure**, not magic. The server doesn't manipulate temperature or sampling—it provides structured tracking and explicit permission for associative thinking. The same is true of Sequential Thinking: both are scaffolding that makes a thinking style *legible* and *persistent* across conversation turns.

Could you just ask Claude to "think associatively"? Yes. Could you ask it to "think step by step" instead of using Sequential Thinking? Also yes. The value is threefold:

1. **Legibility**: The associative path becomes visible and inspectable, not lost in chat history
2. **Persistence**: Cognitive state survives across conversation turns and tool calls
3. **Composition**: Enables `Sequential → Associative → Sequential` as a programmatic workflow

This increases your odds of **systematic creative accidents**—structured exploration where the wins are usable and the losses are logged.

## The Value Proposition

The value isn't in producing unexplainable outputs—it's in **escaping the gravity well of the problem's framing**.

Linear reasoning on "meeting fatigue" explores: shorter meetings, better agendas, async alternatives. The solution space is *bounded by the problem's framing*.

Associative Dreaming might drift to "funeral rituals" and land on "meetings as witnessing rituals." Yes, you can explain the path afterward—that's what insight *is*. But no linear approach would have **started** there.

## The Three Operations

### DRIFT
Where does your mind *want* to go? Not where it *should* go. Follow the pull.
- **adjacent** (0.3): nearby fields (biology → chemistry)
- **cross-domain** (0.6): different disciplines (software → architecture → music)
- **distant** (0.9): the weird leap (API design → grief → fermentation)

*(These are prompting hints, not precision dials—the LLM interprets intent, not magnitude.)*

### RETURN
Come back to an earlier concept, but you're different now. What do you see that you couldn't see before? This is NOT revision (fixing mistakes). This is re-seeing (transformed perspective).

### COLLISION
Force two concepts that "don't belong together" to crash. What emerges from the wreckage? The insight lives in the collision, not in either concept alone.

## Tool

### associativedreaming

**Inputs:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `concept` | string | Where you landed. The current node in the rhizome. |
| `driftDepth` | integer | How many drifts deep (like thoughtNumber) |
| `maxDrift` | integer | Estimated total drifts needed (like totalThoughts) |
| `chaosLevel` | number 0-1 | How wild to get |
| `needsMoreDrift` | boolean | Keep wandering? |
| `isReturn` | boolean? | Coming back to an earlier concept? |
| `returnsTo` | string? | Which concept you're returning to |
| `isCollision` | boolean? | Forcing a collision? |
| `collidesWith` | string? | What concept to crash into |
| `collisionId` | string? | Chain identifier for related collisions |

**Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Drift 4 of 5 — Exploring...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  The Path:

    🌀 code review
       ↓
    🌀 confession
       ↓
    🌀 ritual absolution
       ↓
    💥 permission structures
```

## Usage

Associative Dreaming is designed for:
- When linear thinking is stuck or circular
- When you need connections you haven't considered
- When the problem space feels rigid
- When you want to explore, not conclude
- When you keep arriving at the same unsatisfying conclusions

## Rules

1. When you feel the pull toward a "weird" connection—**follow it**
2. **Do not justify each step**—justify at the end, if at all
3. The concept field is for where you are, not a logical argument
4. If a drift feels "too random"—increase chaosLevel and do it anyway
5. Collision is for forcing insight. Pick concepts that feel wrong together
6. You're not solving yet. You're exploring.

**Expect noise.** Most drifts won't produce insight. That's normal—you're exploring a space, not following a path. The tool makes the exploration visible; it doesn't guarantee discoveries.

## Recognizing Value vs. Noise

A productive collision typically:
- **Re-frames the problem space** rather than just adding options
- **Creates surprise that feels retrospectively obvious**
- **Generates explainable insight**: you can trace *why* the connection matters after the fact
- **Suggests a new lens**, not a ready-made answer

If a drift path produces only surface-level metaphors, increase `chaosLevel` or force a collision between more distant concepts.

## Configuration

### Claude Desktop

Add this to your `claude_desktop_config.json`:

#### npx

```json
{
  "mcpServers": {
    "associative-dreaming": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-associative-dreaming"]
    }
  }
}
```

#### docker

```json
{
  "mcpServers": {
    "associative-dreaming": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "mcp/associative-dreaming"]
    }
  }
}
```

### VS Code

For manual installation, add to your user or workspace MCP configuration:

```json
{
  "servers": {
    "associative-dreaming": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-associative-dreaming"]
    }
  }
}
```

For Docker:

```json
{
  "servers": {
    "associative-dreaming": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "mcp/associative-dreaming"]
    }
  }
}
```

Set `DISABLE_DREAM_LOGGING=true` to disable console output.

## Complementary Usage

Use **both servers** together:

```
Problem → Sequential Thinking (stuck) → Associative Dreaming (drift) → Sequential Thinking (structure) → Solution
```

Sequential Thinking converges. Associative Dreaming diverges. You need both.

## Related Work

This complements tools like [unconventional-thinking](https://github.com/stagsz/unconventional-thinking). While that server generates "unreasonable thoughts" and branches, Associative Dreaming focuses on *rhizomatic wandering* with explicit operations (Drift/Return/Collision) and reframing rather than mere exploration.

## Building

```bash
npm install
npm run build
```

Docker:

```bash
docker build -t mcp/associative-dreaming .
```

## License

MIT
