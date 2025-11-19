<div align="center">

<img width="1024" height="1024" alt="Associative Dreaming - Your AI's Creative Unconscious" src="https://github.com/user-attachments/assets/0ef0af17-d48b-4e32-8674-855af43811a6" />

# Associative Dreaming

The yin to sequential thinking's yang

### *Unlock the creative unconscious of your AI*

**Transform linear thinking into breakthrough insights through controlled semantic exploration**

[![npm version](https://badge.fury.io/js/@associative%2Fserver-associative-dreaming.svg)](https://www.npmjs.com/package/@associative/server-associative-dreaming)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

[Quick Start](#-quick-start) • [Features](#-what-makes-it-extraordinary) • [Tools](#-creative-engines) • [Examples](#-see-it-in-action)

</div>

---

## 🌟 What Makes It Extraordinary

**Associative Dreaming** is the creative counterpart to sequential reasoning—where logic meets imagination, where structure meets serendipity. While traditional AI thinking follows straight lines, this server introduces the **cognitive wandering** that leads to breakthroughs.

<table>
<tr>
<td width="50%">

### 🕸️ **Neural Concept Networks**
Move beyond linear thought chains. Your AI maintains an interconnected web of ideas, mirroring how creative minds actually work—through association, not just deduction.

</td>
<td width="50%">

### 🎲 **Controlled Serendipity**
Harness productive randomness. Discover the "adjacent possible" through guided exploration of conceptual territories you didn't know existed.

</td>
</tr>
<tr>
<td width="50%">

### 🔮 **Bisociative Synthesis**
Arthur Koestler's theory of creativity, implemented. Merge unrelated domains to generate insights that pure logic could never reach—the essence of innovation.

</td>
<td width="50%">

### ⚡ **Pattern Interruption**
Break through creative blocks with Brian Eno's Oblique Strategies and SCAMPER techniques. When you're stuck, inject productive constraints.

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Instant Launch (Zero Installation)

```bash
npx @associative/server-associative-dreaming
```

**That's it.** No setup, no configuration files, no dependencies to manage.

### Integrate with Your Workflow

<details>
<summary><b>📱 Claude Desktop</b></summary>

Add to your `claude_desktop_config.json`:

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
</details>

<details>
<summary><b>💻 VS Code</b></summary>

Add to your MCP configuration:

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
</details>

<details>
<summary><b>🔧 Local Development</b></summary>

```bash
git clone <repository-url>
cd associative-dreaming-mcp-server
npm install
npm run build
npm start
```
</details>

---

## 🎨 Creative Engines

### `semantic_drift`
**The Controlled Hallucination Engine**

Explore the conceptual horizon through intelligent semantic wandering. This isn't about finding synonyms—it's about discovering ideas in the **Serendipity Zone**: distant enough to be surprising, close enough to be relevant.

```typescript
{
  anchorConcept: "neural networks",
  driftMagnitude: 0.6,      // 0 = conservative, 1 = adventurous
  temperature: 0.7          // add creative randomness
}
```

**Perfect for:** Breaking out of obvious associations • Finding unexpected angles • Divergent thinking sessions

---

### `bisociative_synthesis`
**The Combinatorial Innovation Engine**

Force the collision of unrelated domains to generate breakthrough insights. Based on Arthur Koestler's *The Act of Creation*, this tool finds **structural patterns** in one domain and maps them onto your problem space.

```typescript
{
  matrixA: "user interface design",
  matrixB: "jazz improvisation",   // leave blank for auto-selection
  blendType: "metaphoric"          // optional: guide the synthesis
}
```

**Perfect for:** Innovation challenges • Creative problem-solving • Cross-domain insight discovery

---

### `oblique_constraint`
**The Pattern Interrupt Engine**

When you're stuck in a mental loop, inject a creative constraint to force new pathways. Implements **Brian Eno's Oblique Strategies** and **SCAMPER techniques** to break rigid thinking patterns.

```typescript
{
  currentBlock: "Our product is feature-complete but users aren't engaged",
  constraintType: "oblique"        // oblique | scamper | creative | random
}
```

**Perfect for:** Creative blocks • Decision paralysis • Stale thinking patterns

---

### `serendipity_scan`
**The Unknown Unknown Finder**

Automate the search for what you don't know you're missing. Analyzes your concept network for **structural holes**, **disconnected clusters**, and **latent patterns**, then surfaces surprising connections.

```typescript
{
  currentContext: "Exploring AI-enhanced creativity workflows",
  noveltyThreshold: 0.7,           // 0 = safe, 1 = wild
  scanType: "bridge"               // bridge | gap | pattern | random
}
```

**Perfect for:** Research • Strategic planning • Finding hidden opportunities

---

## 💡 See It in Action

### Scenario: Breaking Through a Design Impasse

```json
// You're redesigning an e-commerce checkout flow
{
  "tool": "oblique_constraint",
  "input": {
    "currentBlock": "Our checkout needs to be fast but also build trust",
    "constraintType": "oblique"
  }
}
```

**Response:** *"Honor thy error as a hidden intention"* → Leads to exploring how checkout "mistakes" could reveal user intent and improve the experience.

---

### Scenario: Finding Your Blue Ocean

```json
// Your SaaS is in a crowded market
{
  "tool": "bisociative_synthesis",
  "input": {
    "matrixA": "project management software",
    "matrixB": "improvisational theater"
  }
}
```

**Response:** Maps the principles of "Yes, and..." and adaptive collaboration onto PM tools, leading to a novel real-time collaborative planning approach.

---

### Scenario: Research Discovery

```json
// You're exploring emerging trends
{
  "tool": "serendipity_scan",
  "input": {
    "currentContext": "Future of remote work collaboration",
    "scanType": "gap",
    "noveltyThreshold": 0.8
  }
}
```

**Response:** Identifies an unexplored connection between asynchronous communication patterns and musical polyrhythms.

---

## 🧠 The Philosophy

**Associative Dreaming** embodies the **Yin** to Sequential Thinking's **Yang**:

| Sequential Thinking | Associative Dreaming |
|:---:|:---:|
| Convergent | **Divergent** |
| Logical | **Intuitive** |
| Linear | **Networked** |
| Deductive | **Abductive** |
| Answers | **Questions** |

Great breakthroughs require both. This server gives your AI the ability to **wander productively**, to make **non-obvious connections**, and to **discover what wasn't being searched for**.

---

## 🛠️ Development

### Watch Mode
```bash
npm run build:watch
```

### Environment Variables
- `DISABLE_DREAM_LOGGING` — Set to `"true"` to disable execution logging

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

<div align="center">

**Built for creators, researchers, and anyone who believes the best ideas come from unexpected places**

[Report Bug](../../issues) • [Request Feature](../../issues) • [Contribute](CONTRIBUTING.md)

</div>
