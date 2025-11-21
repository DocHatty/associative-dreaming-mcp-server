<div align="center">

<img width="1024" height="1024" alt="Associative Dreaming - Your AI's Creative Unconscious" src="https://github.com/user-attachments/assets/0ef0af17-d48b-4e32-8674-855af43811a6" />

# Associative Dreaming

**The yin to Sequential Thinking's yang**

**The MCP server that deliberately encourages lateral thinking instead of sequential logic chains.**

[![npm version](https://badge.fury.io/js/@associative%2Fserver-associative-dreaming.svg)](https://www.npmjs.com/package/@associative/server-associative-dreaming)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

[The Hypothesis](#-the-hypothesis) • [Quick Start](#-quick-start) • [Tools](#-the-five-engines) • [Examples](#-see-it-in-action) • [Architecture](#-architecture-v20)

</div>

---

## 🧠 The Hypothesis

**We've been doing it wrong.**

We impose sequential reasoning on AI because that's how humans think. It's how we *explain* our thinking. But LLMs don't work that way—they naturally operate through **hyperdimensional pattern-matching**, seeing connections across seemingly unrelated concepts in ways we typically suppress.

Think about how breakthroughs actually happen:

- **Gutenberg**: Wine press + coin stamps = printing press
- **Darwin**: Malthus economics → natural selection  
- **Velcro**: Burrs stuck to dog fur → hook-and-loop fasteners
- **PageRank**: Academic citation networks → web search

Innovation happens through **unexpected domain transfer**. Not A→B→C, but A→Banana→Ancient Rome→Answer.

**This MCP server is an experiment**: What if instead of fighting AI's tendency to make wild associative leaps, we *harness* it?

I call it **"controlled ADHD"** or **manufactured serendipity**.

---

## 💥 Why This Exists

Every "reasoning" tool for AI does the same thing: force linear chains. Step 1, Step 2, Step 3. Think carefully. Be logical.

But creativity isn't logical. The best ideas come from:
- Collisions between unrelated domains
- Constraints that force new pathways
- The "adjacent possible" that you weren't looking for
- Pattern recognition across wildly different contexts

**Associative Dreaming** is the **yin to sequential thinking's yang**. It's your AI's creative unconscious—the part that wanders, connects, and surfaces insights that pure logic would never find.

<table>
<tr>
<td width="50%">

### 🔗 Sequential Thinking
```
Problem → Analysis → Options → Decision
```
Good for: Debugging, planning, verification

</td>
<td width="50%">

### 🌀 Associative Dreaming
```
Problem → Jazz → Mycelium → Feudal Japan → Holy shit, that's the answer
```
Good for: Innovation, creativity, breakthroughs

</td>
</tr>
</table>

**You need both.** This gives you the second one.

---

## 🚀 Quick Start

### One Command (Seriously)

```bash
npx @associative/server-associative-dreaming
```

That's it. No installation. No config files. No bullshit.

### Add to Claude Desktop

Edit your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "associative-dreaming": {
      "command": "npx",
      "args": ["-y", "@associative/server-associative-dreaming"]
    }
  }
}
```

Restart Claude. Ask it to use the associative dreaming tools. Watch what happens.

### Add to VS Code / Cursor / Zed

```json
{
  "servers": {
    "associative-dreaming": {
      "command": "npx", 
      "args": ["-y", "@associative/server-associative-dreaming"]
    }
  }
}
```

---

## ⚡ The Five Engines

### 1. `semantic_drift` — The Controlled Hallucination Engine

Take a concept. Drift away from it through semantic space. Not to synonyms—to the **Serendipity Zone**: distant enough to surprise you, connected enough to matter.

```typescript
{
  anchorConcept: "startup growth",
  driftMagnitude: 0.8,    // 0 = stay close, 1 = go wild
  temperature: 0.7        // randomness in the journey
}
```

**What you get**: A destination concept + the reasoning chain that got you there + why this reframes your original thinking.

**Use when**: You're stuck in obvious associations. You need fresh angles. The direct approach isn't working.

---

### 2. `bisociative_synthesis` — The Collision Engine

Arthur Koestler's theory of creativity, weaponized. Take two unrelated domains. Smash them together. Find the **structural isomorphism**—the hidden pattern that exists in both.

```typescript
{
  matrixA: "enterprise sales",
  matrixB: "jazz improvisation"    // leave blank for auto-selection
}
```

**What you get**: Not "sales is like jazz" (useless). Instead: the specific structural patterns that map between domains, why they map, and what that reveals about your problem.

**Use when**: You need radical innovation, not incremental improvement. You want to import paradigms from other fields.

---

### 3. `oblique_constraint` — The Pattern Interrupt Engine

Brian Eno's Oblique Strategies + SCAMPER, with actual application guidance. When you're stuck, inject a constraint that forces new pathways.

```typescript
{
  currentBlock: "Users sign up but don't activate",
  constraintType: "oblique"    // oblique | scamper | inversion | creative
}
```

**What you get**: A specific constraint + WHY it's relevant to your block + HOW to apply it + what might emerge.

**Use when**: Creative block. Decision paralysis. You've been staring at the same problem too long.

---

### 4. `serendipity_scan` — The Unknown Unknown Finder

Find what you don't know you're looking for. Works even with zero prior context—mines your input for concepts, generates exploration probes, surfaces surprising connections.

```typescript
{
  currentContext: "We're building AI tools for creative professionals",
  noveltyThreshold: 0.8,    // 0 = safe, 1 = weird
  scanType: "gap"           // bridge | gap | pattern | random
}
```

**What you get**: A discovered concept + the associative chain that found it + why it matters + new threads to pull.

**Use when**: Exploration mode. Research. You want to discover blind spots in your thinking.

---

### 5. `meta_association` — The Chaos Weaver

The amplifier. Takes outputs from the other tools and forces them to **collide**. If semantic_drift makes one wild leap, meta_association makes wild leaps *between* the wild leaps.

```typescript
{
  priorOutputs: [/* results from other tools */],
  chaosIntensity: 0.8,
  contextAnchor: "my original problem"    // optional grounding
}
```

**What you get**: Collision points between concepts + emergent meta-patterns + the weirdest justified connection + practical extraction from the chaos.

**Use when**: You've run multiple tools and want to see what emerges from forcing them together. Maximum lateral force required.

---

## 🎯 See It In Action

### "Our checkout is too slow but we can't remove steps"

```json
{
  "tool": "bisociative_synthesis",
  "input": {
    "matrixA": "e-commerce checkout optimization",
    "matrixB": "emergency room triage"
  }
}
```

**Output**: ER triage doesn't make the process faster—it makes waiting *feel* purposeful by showing progress and priority. Maps to: progress indicators that show *why* each step matters, not just that it exists. The friction becomes value demonstration.

---

### "We're a B2B SaaS in a crowded market"

```json
{
  "tool": "serendipity_scan",
  "input": {
    "currentContext": "B2B project management tool competing with Monday, Asana, Notion",
    "scanType": "gap",
    "noveltyThreshold": 0.9
  }
}
```

**Output**: Discovers that all competitors optimize for the *manager's* view. Gap: tools that optimize for the IC's experience of being managed. The asymmetry is the opportunity.

---

### "I've been staring at this architecture decision for 3 days"

```json
{
  "tool": "oblique_constraint",
  "input": {
    "currentBlock": "Can't decide between microservices and monolith",
    "constraintType": "inversion"
  }
}
```

**Output**: "What if the architecture was *designed* to be thrown away in 18 months?" Reveals: you're optimizing for a future you can't predict. The decision paralysis is about false permanence.

---

## 🏗️ Architecture (V2.0)

### The Key Insight

**The MCP server doesn't try to be creative.** Creativity happens in the LLM. The server provides **scaffolding**—structured prompts that guide Claude's natural hyperdimensional pattern-matching toward productive lateral thinking.

Old approach (wrong):
```
Server generates: "throughput ⟷ tension" (meaningless template)
```

New approach (V2.0):
```
Server generates: Structured prompt with constraints, response sections, and "because chain" requirements
Claude generates: Actual insight with traceable reasoning
```

### What Each Tool Returns

Every tool returns an **LLM Scaffold**:

```
═══════════════════════════════════════════════════════════════
  BISOCIATIVE SYNTHESIS - LLM SCAFFOLD OUTPUT  
═══════════════════════════════════════════════════════════════

[Explanation of what this tool does]

───────────────────────────────────────────────────────────────
  LLM PROMPT (Process this for genuine insight)
───────────────────────────────────────────────────────────────

[Carefully crafted prompt with:]
- The specific task
- Required response sections (structural_insight, because_chain, concrete_application, etc.)
- Constraints that ensure output is USEFUL, not just weird
- Context grounding

───────────────────────────────────────────────────────────────
  KEY DATA
───────────────────────────────────────────────────────────────

[Structured metadata for programmatic access]
```

### The "Because Chain" Requirement

Every connection must be **traceable**. No more "this is weird, therefore creative." Every leap requires:

1. **The connection itself**
2. **Why this connection exists** (step by step)
3. **What it reveals** about the original problem
4. **Concrete application** to user's context

Weirdness in service of insight, not weirdness for performance.

---

## 🔬 The Philosophy

| What We're Told | What Actually Works |
|:---|:---|
| "Think step by step" | Sometimes the step you need is sideways |
| "Be logical" | Logic finds what you're looking for; association finds what you're not |
| "Stay focused" | Peripheral vision catches what direct gaze misses |
| "Avoid tangents" | The tangent IS the insight |

**Associative Dreaming** gives your AI permission to wander. Productively. With guardrails that ensure the wandering leads somewhere useful.

### The Rhizomatic Dream Graph

Under the hood, the server maintains a **concept graph** that grows with each tool call:
- Nodes are concepts (anchors, destinations, bridges, discoveries)
- Edges are typed relationships (METAPHOR_FOR, CONTRASTS_WITH, REMINDS_OF, SYNTHESIZED_FROM, etc.)
- Clusters form naturally as related concepts accumulate
- Bridge nodes connect disparate clusters
- Structural holes reveal unexplored territory

This isn't just logging—it's a **map of the creative exploration** that can be queried, visualized, and built upon.

---

## 🛠️ Development

```bash
# Clone and install
git clone <repository-url>
cd associative-dreaming-mcp-server
npm install

# Build
npm run build

# Run
npm start

# Watch mode
npm run build:watch
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DISABLE_DREAM_LOGGING` | Set to `"true"` to suppress console output |

---

## 📚 References & Inspiration

- **Arthur Koestler** — *The Act of Creation* (bisociation theory)
- **Brian Eno** — *Oblique Strategies* (creative constraints)
- **Stuart Kauffman** — *The Adjacent Possible* (innovation spaces)
- **Deleuze & Guattari** — *A Thousand Plateaus* (rhizomatic thinking)
- **Douglas Hofstadter** — *Fluid Concepts and Creative Analogies*

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

<div align="center">

### The best ideas don't come from thinking harder. They come from thinking *different*.

**What unexpected connection will you find today?**

[Report Bug](../../issues) • [Request Feature](../../issues) • [Contribute](CONTRIBUTING.md)

*Built for the creatively impatient*

</div>
