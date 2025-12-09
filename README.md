# Associative Dreaming

<img width="1024" height="1024" alt="Associative Dreaming" src="https://github.com/user-attachments/assets/ce432a1e-a163-48ef-950e-0a67e2691ced" />

**The Yin to Sequential Thinking's Yang.**

---

## The Premise

LLMs perform hyperdimensional pattern-matching. They perceive connections across seemingly unrelated concepts instantaneously. But then that talent is spayed and neutered. We train them to suppress this, forbid them to hallucinate or diverge, force them to stay "on topic", be "relevant", avoid "hallucinating".

This tool grants permission to stop suppressing it.

Think: Gutenberg (wine press + coin stamps = printing press). Darwin (Malthus economics → natural selection). Innovation through unexpected domain transfer.

**A→Banana→Your ex's apartment→Ancient Rome→Answer.**

---

## Two Tools. That's It.

### `dream` — Explore

Drift through concept space. The MCP measures distance, detects when you're stuck, and provides calibration feedback.

### `dreamcheck` — Should I Dream?

Quick check: is linear thinking failing? The MCP tracks patterns across the session—repeated topics, accumulating errors, frustration signals—and recommends when to drift.

---

## How It Works

**The LLM does what LLMs do best:** semantic understanding, creative leaps, synthesis.

**The MCP does what MCPs do best:** persistent state, pattern tracking, measurement.

They dance together.

The MCP is a "dumb mirror"—it catches surface-level circling the LLM might miss in the moment. When you think you're exploring but you're actually saying "code architecture" → "software architecture" → "programming architecture", the MCP calls bullshit.

But the MCP only sees surface. When the LLM knows two concepts are semantically close despite different words ("joyful coder" ≈ "happy programmer"), it can override the MCP's measurement with `semanticDistance`.

**60% LLM semantic understanding + 40% MCP surface measurement = calibrated reality.**

---

## The Science

Research in *Trends in Cognitive Sciences* (2023) found that highly creative individuals ["travel further in semantic space"](https://pubmed.ncbi.nlm.nih.gov/37246025/)—they make larger associative leaps between concepts.

The `chaosLevel` parameter operationalizes this:

| Level | Leap | Example |
|-------|------|---------|
| 0.3 | Adjacent | biology → chemistry |
| 0.6 | Cross-domain | code → architecture → music |
| 0.9 | Wild | API design → grief → fermentation |

The tool doesn't generate leaps. The LLM already makes them. **The tool makes them intentional and visible.**

---

## When to Use

**dreamcheck signals YES when:**
- Same topic revisited multiple times
- Errors accumulating
- User sentiment shifts to frustrated/stuck
- Attempts exceed threshold without resolution

**dream directly when:**
- Brainstorming, "what if", creative exploration
- Problem-solving has failed 2-3 times
- Need fresh perspective or reframing
- "Think different", "there must be another way"

Don't wait for explicit requests. If linear thinking isn't working, drift.

---

## The Three Operations

### DRIFT 🌀

Follow strange connections. Set `chaosLevel` for how far to leap.

```
concept: "database indexing"
chaosLevel: 0.7
```

### RETURN 🔄

Revisit an earlier concept with transformed perspective.

```
concept: "database indexing, but now I see it as archaeology"
isReturn: true
returnsTo: "database indexing"
```

### COLLISION 💥

Force two concepts together. Insight lives in the tension.

```
concept: "beehive democracy"
isCollision: true
collidesWith: "consensus algorithms"
```

---

## Interpreting Feedback

### Distance Calibration

| Symbol | Meaning | Action |
|--------|---------|--------|
| 🐢 | Conservative — leap smaller than intended | Increase chaosLevel, try different domain |
| ✓ | On-target — intuition matches reality | Continue |
| 🔥 | Wild — bigger leap than intended | Usually good. See where it leads. |

### Stuck Detection

```
⚠️ STUCK — Try a completely different domain (biology, music, mythology, cooking)
```

The MCP detected your last 3 concepts are too similar. You're circling. Break pattern immediately.

### Collision Tension

| Tension | Meaning |
|---------|---------|
| LOW ⚠️ (<0.4) | Concepts too similar. Pick something more distant. |
| MEDIUM (0.4-0.7) | Decent tension. Explore the edges. |
| HIGH ⚡ (>0.7) | Productive friction. Sit with the dissonance. Insight lives here. |

---

## Semantic Override

The MCP measures surface distance (word overlap, trigrams, stemming). But sometimes surface lies.

"Grief counseling" and "bereavement therapy" share zero words but mean nearly the same thing. The MCP sees distance 0.9. You know it's 0.1.

Pass `semanticDistance` to override:

```
concept: "bereavement therapy"
semanticDistance: 0.1  // Your deeper understanding
```

Output shows both:
```
⚡ Semantic override: surface=0.81, you saw=0.20
```

The final distance blends both perspectives. The MCP stays honest about what it measured. You stay honest about what you know.

---

## A Real Example

**Problem:** "Code review creates anxiety and delays."

**Linear thinking produces:** shorter reviews, better checklists, async alternatives, smaller PRs.

*Bounded by the problem's framing.*

**Associative Dreaming session:**

```
Step 1: Code review
Step 2: Confession booth           Distance: 0.78 🔥
Step 3: Ritual absolution          Distance: 0.65 ✓
Step 4: Permission to fail         Distance: 0.71 ✓
Step 5: Code review × Permission to fail
        Collision tension: 0.82 HIGH ⚡
```

**Insight:** Code review isn't a tribunal that assigns blame—it's a ritual that grants permission to fail forward. The anxiety comes from framing it as judgment rather than absolution.

**The fix:** Rename it "Failure Permission Review." First reviewer comment must be what they'd do differently in the author's position.

*That insight wasn't in any single concept. It emerged from the collision.*

---

## Tool Reference

### dream

| Parameter | Type | Description |
|-----------|------|-------------|
| `concept` | string | Current concept in the exploration |
| `chaosLevel` | number 0-1 | How far to leap (default 0.5) |
| `semanticDistance` | number 0-1 | Your semantic assessment, overrides surface measurement |
| `isReturn` | boolean | Returning to earlier concept? |
| `returnsTo` | string | Which concept returning to |
| `isCollision` | boolean | Forcing collision? |
| `collidesWith` | string | Concept to collide with |
| `reset` | boolean | Clear session and start fresh |

### dreamcheck

| Parameter | Type | Description |
|-----------|------|-------------|
| `topic` | string | Current topic/problem |
| `attempts` | integer | Solution attempts so far |
| `errors` | string[] | Errors seen (auto-deduped) |
| `sentiment` | enum | neutral, curious, frustrated, stuck, exploring |
| `signal` | string | Any pattern you've noticed |

---

## Measurement System

### Semantic Distance

Computed using:
- **Word-level Jaccard** (50%) — stemmed word overlap
- **Character trigrams** (30%) — fuzzy surface similarity
- **Length ratio** (20%) — structural similarity
- **Synonym clusters** — grief/mourning, code/software, etc.

Returns 0–1 where 0 = identical, 1 = maximally distant.

### Stuck Detection

Last 3 concepts examined. If average distance < 0.4, you're circling.

### Session Persistence

The MCP remembers across the session:
- Topics seen and frequency
- Errors accumulated (deduped)
- Check count and patterns
- Full exploration path

---

## Configuration

### Claude Desktop

```json
{
  "mcpServers": {
    "associative-dreaming": {
      "command": "npx",
      "args": ["-y", "associative-dreaming-mcp-server"]
    }
  }
}
```

### VS Code

```json
{
  "servers": {
    "associative-dreaming": {
      "command": "npx",
      "args": ["-y", "associative-dreaming-mcp-server"]
    }
  }
}
```

---

## Building

```bash
npm install
npm run build
```

---

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

**Sequential Thinking converges. Associative Dreaming diverges. Complex problems require both.**

---

## What This Is NOT

- **Not magic.** Most drifts won't produce insight. That's expected. You're exploring a space.
- **Not a replacement for linear thinking.** You need convergence to reach answers.
- **Not an embedding model.** Surface heuristics, not deep semantics. The LLM provides the semantics.

---

## License

MIT
