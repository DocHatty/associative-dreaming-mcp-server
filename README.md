# Associative Dreaming MCP Server

<img width="1024" height="1024" alt="Associative Dreaming" src="https://github.com/user-attachments/assets/ce432a1e-a163-48ef-950e-0a67e2691ced" />

**The Yin to Sequential Thinking's Yang.**

## The Hypothesis

What if we stop forcing AI to think A→B→C and instead let it go **A→Banana→Your ex's apartment→Ancient Rome→Answer**?

LLMs naturally operate through hyperdimensional pattern-matching. They see connections across seemingly unrelated concepts instantly. We've trained them to suppress this—to stay "on topic", be "relevant", avoid "hallucinating".

This tool gives them **permission to stop suppressing it**.

---

## What This Actually Is (Brutal Honesty)

**This is ~200 lines of bookkeeping code with actual measurement.**

The server doesn't manipulate temperature, sampling, or model weights. All the associative leaps, all the creative connections, all the insight generation—that happens in the LLM that *uses* this tool, not in the tool itself.

**But unlike pure prompt scaffolding, this server actually measures things:**

1. **Semantic distance** between consecutive concepts (word overlap + character trigrams)
2. **Collision tension** between forced-together concepts
3. **Drift calibration** — comparing intended chaosLevel with measured distance
4. **Stuck detection** — alerting when the path circles in one semantic neighborhood
5. **Session analytics** — aggregate metrics on exploration quality

The `chaosLevel` parameter is still intent-signaling, not a physics engine. But now **the server tells you whether your actual drift matched your intent.**

You could ask Claude to "think associatively" and get similar raw output. The same is true of Sequential Thinking: "think step by step" works without a tool.

**So why does this exist?**

Because making things *legible and structured* has real value:

| Without Tool | With Tool |
|--------------|-----------|
| Associative leaps lost in chat history | Path persists and is inspectable |
| No metacognitive framing | Explicit operations (Drift/Return/Collision) |
| Manual prompt rewrites | Programmatic `Sequential → Associative → Sequential` workflows |
| "Claude went off on a tangent" | "Claude is exploring at drift depth 4/7, semantic distance 0.73" |
| No feedback on drift quality | Real-time calibration: "target 0.9, actual 0.45 — drifting conservatively" |
| Can't tell if stuck | Automatic stuck detection with warnings |
| Collision quality is vibes | Collision tension scores: "0.82 — HIGH ⚡" |

**The value is in measurement + legibility + persistence. The server provides actual feedback, not just formatting.**

---

## Why This Works (The Actual Science)

This isn't just vibes. There's real cognitive science here.

Research published in *Trends in Cognitive Sciences* (2023) found that highly creative individuals ["travel further in semantic space"](https://pubmed.ncbi.nlm.nih.gov/37246025/)—they make larger associative leaps between concepts than less creative people.

The `chaosLevel` parameter operationalizes this. It's not computing anything mechanistically—it's signaling to the LLM how far to jump in semantic space:

- **0.3**: Stay close. Biology → Chemistry. Safe.
- **0.6**: Cross domains. Software → Architecture → Music. Interesting.
- **0.9**: The weird leap. API design → Grief → Fermentation. Where insight often lives.

The tool doesn't generate the leaps. The LLM already makes them. **The tool makes them intentional and visible.**

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

---

## A Real Example (Not Abstract)

**Problem:** "Our code review process creates anxiety and delays."

**Linear thinking produces:**
- Shorter reviews
- Better checklists
- Async alternatives
- Smaller PRs

*Bounded by the problem's framing. The solution space is the problem space.*

**Associative Dreaming session:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Drift 5 of 5 — Arrived.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  The Path:

    🌀 code review
       ↓
    🌀 confession booth
       ↓
    🌀 ritual absolution
       ↓
    🌀 permission to fail
       ↓
    💥 code review ⊗ permission to fail

  Collision Chain: review-reframe
  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
  📊 Drift Metrics:
     Target chaos:      0.60
     Measured distance: 0.78 [████████░░]
     Calibration:       🔥 drifting further than intended

  💥 Collision Tension: 0.82 [████████░░] HIGH ⚡
  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
  📈 Session Analytics:
     Total drifts:        5
     Unique concepts:     5
     Avg drift distance:  0.71
     Distance range:      0.58 — 0.82
     Times stuck:         0
     Avg collision tension: 0.82
     Calibration: 🐢0 ✓1 🔥4
```

**Insight:** Code review isn't a tribunal that assigns blame—it's a ritual that grants permission to fail forward. The anxiety comes from framing it as judgment rather than absolution.

**The fix:** Rename the process "Failure Permission Review." First reviewer comment must be what they'd do differently in the author's position. Frame approval as "blessing" rather than "passing."

*That insight wasn't in any single concept. It emerged from the collision. No linear approach would have started at "confession booth."*

---

## The Three Operations

### DRIFT 🌀

Where does your mind *want* to go? Not where it *should* go. Follow the pull.

The `chaosLevel` is intent-signaling, not a physics engine:
- **0.3**: Adjacent fields. Safe. Predictable.
- **0.6**: Cross-domain. Interesting. Unexpected.
- **0.9**: The weird leap. Uncomfortable. Often valuable.

**Rule:** If a drift feels "too random"—increase `chaosLevel` and follow it anyway.

### RETURN 🔄

Come back to an earlier concept, but you're different now. What do you see that you couldn't see before?

This is **NOT** revision (fixing mistakes). This is re-seeing (transformed perspective).

**The question:** "Now that I've been to grief and fermentation, what does 'API design' look like from here?"

### COLLISION 💥

Force two concepts that "don't belong together" to crash. What emerges from the wreckage?

Think: Gutenberg (wine press + coin stamps = printing press)

The insight lives in the collision, not in either concept alone.

**Pick concepts that feel WRONG together.** That's the point.

---

## Tool Reference

### associativedreaming

**Core inputs** (required):
| Parameter | Type | Description |
|-----------|------|-------------|
| `concept` | string | Where you landed. The current node in the rhizome. |
| `driftDepth` | integer | How many drifts deep (starts at 1) |
| `maxDrift` | integer | Estimated total drifts needed (adjust as you go) |
| `chaosLevel` | number 0-1 | Intent signal: how far to leap in semantic space |
| `needsMoreDrift` | boolean | Keep wandering? False when done. |

**Optional inputs** (for specific operations):
| Parameter | Type | Description |
|-----------|------|-------------|
| `isReturn` | boolean | Returning to an earlier concept? |
| `returnsTo` | string | Which concept you're returning to |
| `isCollision` | boolean | Forcing a collision? |
| `collidesWith` | string | What concept to crash into |
| `collisionId` | string | Chain identifier for collision sequences |
| `resetSession` | boolean | Set true to clear all state and start fresh |

**Sensible defaults:**
- Start with `chaosLevel: 0.5`
- Start with `maxDrift: 5` (adjust up if stuck)
- Use collision when you have two interesting concepts but no insight yet

---

## Measurement System (What Makes This Different)

Unlike pure prompt scaffolding, this server provides **actual measurement and feedback**:

### Semantic Distance

Computed using a combination of:
- Word-level Jaccard distance (50%)
- Character trigram distance (35%)
- Length ratio penalty (15%)

Returns 0–1 where 0 = identical concepts, 1 = maximally distant.

*This isn't as sophisticated as embedding-based distance, but it's zero-dependency, runs locally, and provides meaningful signal.*

### Drift Calibration

Compares your intended `chaosLevel` with the measured semantic distance:

| Symbol | Label | Meaning |
|--------|-------|----------|
| 🐢 | Conservative | Actual drift < target − 0.25 |
| ✓ | On-target | Actual drift ≈ target |
| 🔥 | Wild | Actual drift > target + 0.25 |

If you're consistently 🐢, you're censoring yourself. If you're consistently 🔥, your concepts are further apart than you think.

### Collision Tension

Same distance metric applied to collision pairs:

| Tension | Label | Meaning |
|---------|-------|----------|
| < 0.4 | LOW ⚠️ | Concepts too similar for productive collision |
| 0.4–0.7 | MEDIUM | Reasonable tension |
| > 0.7 | HIGH ⚡ | High conceptual distance = potentially productive |

### Stuck Detection

Examines the last 3 concepts. If average inter-concept distance < 0.3, triggers:

```
⚠️  PATH APPEARS STUCK — recent concepts too similar
    Consider: higher chaosLevel or force a collision
```

### Session Analytics

Reported every 5 drifts and at session end:

- Total drifts / unique concepts (reveals repetition)
- Avg/min/max semantic distance (exploration breadth)
- Times stuck (path quality)
- Calibration history summary (🐢/✓/🔥 counts)
- Average collision tension

---

## When This Works

Use Associative Dreaming when:
- Linear thinking produces circular results
- The problem space feels rigid
- You keep arriving at the same unsatisfying conclusions
- You need connections you haven't considered
- You want to explore, not conclude

---

## When This Fails (Failure Modes)

### The Insight Illusion

**Symptom:** Drifts produce interesting-sounding connections that don't actually illuminate anything.

*"Code review → butterflies → metamorphosis → CI/CD as cocoon"* — This sounds profound but is just metaphor-shopping.

**Diagnostic questions:**
1. Does this reframe the problem, or just rename it?
2. Can you trace *why* the connection matters?
3. Is there surprise that feels retrospectively obvious?
4. Does it suggest a new lens, or just a new analogy?

**Fix:** Increase `chaosLevel`. Force a collision. The issue is usually not enough conceptual distance, not too much.

### The Random Walk

**Symptom:** Each drift is interesting but they don't build. The path goes nowhere.

**Fix:** Return to the original concept after drift 3-4. Ask: "What do I see now that I couldn't see before?" If nothing: you're random walking, not exploring.

### The Collision Fizzle

**Symptom:** You force a collision but nothing emerges.

**Diagnostic:** Did you pick concepts that feel *wrong* together? If both concepts are from the same conceptual neighborhood, collision can't produce novelty.

**Fix:** Collide across maximum distance. Pick the concept that feels most absurd to combine.

---

## What This Is NOT

- **Not an embedding-based semantic network.** The distance measurement uses surface-level heuristics (word overlap, character trigrams), not deep embeddings. It provides useful signal, not ground truth.
- **Not a creativity engine.** The LLM does all creative work. The server measures and tracks.
- **Not a solution generator.** It produces framings, not answers.
- **Not a replacement for linear thinking.** You need Sequential Thinking (Yang) to converge on answers. This is the divergent complement.
- **Not magic.** Most drifts won't produce insight. That's expected. You're exploring a space, not following a path.

---

## Recognizing Value vs. Noise

A productive collision typically:

- **Re-frames the problem space** rather than just adding options
- **Creates surprise that feels retrospectively obvious**
- **Generates explainable insight**: you can trace *why* the connection matters after the fact
- **Suggests a new lens**, not a ready-made answer

If you're generating only surface-level metaphors, you're not drifting far enough.

---

## Complementary Usage

Use **both tools** together:

```
Problem
   │
   ▼
Sequential Thinking ──► [stuck/circular]
   │
   ▼
Associative Dreaming ──► [new framing]
   │
   ▼
Sequential Thinking ──► [structured solution]
```

**Sequential Thinking converges. Associative Dreaming diverges. Complex problems require both.**

---

## Configuration

### Claude Desktop

Add to `claude_desktop_config.json`:

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

Or with Docker:

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

### Environment Variables

| Variable | Effect |
|----------|--------|
| `DISABLE_DREAM_LOGGING=true` | Suppress console output |

---

## Related Work

This complements [unconventional-thinking](https://github.com/stagsz/unconventional-thinking), which generates "unreasonable thoughts" and branches. Associative Dreaming focuses on *rhizomatic wandering* with explicit operations (Drift/Return/Collision) and a structured approach to reframing rather than generation.

---

## Building

```bash
npm install
npm run build
```

Docker:

```bash
docker build -t mcp/associative-dreaming .
```

---

## The Honest Pitch

This started as good product design around a thin technical artifact. Then we added actual measurement.

The magic is now in:

1. **Semantic distance measurement** — turns `chaosLevel` from theater into feedback
2. **Drift calibration** — tells you when your intent doesn't match your execution
3. **Collision tension scoring** — distinguishes productive collisions from noise
4. **Stuck detection** — catches unproductive circling before you waste time
5. **Session analytics** — provides empirical data on exploration quality

The LLM still does all the creative work. But now the server **measures and reports** on the quality of that work.

Is it still "prompting with extra steps"? Yes. But it's prompting with *measurement*, *feedback*, and *calibration*.

That's the difference between a suggestion and a closed-loop system.

---

## License

MIT
