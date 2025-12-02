/**
 * REAL TEST: Actually spawns the MCP server and sends JSON-RPC over stdio
 * Tests: dreamcheck progression, dream drifts, stuck detection, returns
 */

import { spawn } from "child_process";

const server = spawn("node", ["dist/index.js"], {
  stdio: ["pipe", "pipe", "pipe"],
});

let buffer = "";
let requestId = 1;

server.stdout.on("data", (data) => {
  buffer += data.toString();
  const lines = buffer.split("\n");
  buffer = lines.pop();

  for (const line of lines) {
    if (line.trim()) {
      try {
        const response = JSON.parse(line);
        console.log("\n📥 MCP RESPONSE:");
        if (response.result?.content?.[0]?.text) {
          console.log(response.result.content[0].text);
          if (response.result.structuredContent) {
            console.log(
              "   [structured]:",
              JSON.stringify(response.result.structuredContent, null, 2)
                .split("\n")
                .map((l) => "   " + l)
                .join("\n"),
            );
          }
        } else {
          console.log(JSON.stringify(response, null, 2));
        }
      } catch (e) {
        console.log("Raw:", line);
      }
    }
  }
});

server.stderr.on("data", (data) => {
  // Suppress stderr for cleaner output
});

function send(method, params) {
  const request = { jsonrpc: "2.0", id: requestId++, method, params };
  console.log("\n📤 REQUEST:", method, params?.name || "");
  server.stdin.write(JSON.stringify(request) + "\n");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTest() {
  console.log("═".repeat(70));
  console.log("REAL MCP SERVER TEST - COMPREHENSIVE");
  console.log("═".repeat(70));

  await sleep(500);

  // Initialize
  send("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test", version: "1.0.0" },
  });
  await sleep(200);

  // =========================================================================
  console.log("\n" + "─".repeat(70));
  console.log(
    "TEST 1: dreamcheck with minimal input (should show SOME signal)",
  );
  console.log("─".repeat(70));

  send("tools/call", {
    name: "dreamcheck",
    arguments: { topic: "webpack error", attempts: 1, sentiment: "neutral" },
  });
  await sleep(200);

  // =========================================================================
  console.log("\n" + "─".repeat(70));
  console.log("TEST 2: dreamcheck with duplicate errors (should dedupe)");
  console.log("─".repeat(70));

  send("tools/call", {
    name: "dreamcheck",
    arguments: {
      topic: "webpack error",
      attempts: 3,
      errors: ["Module not found", "Module not found", "Module not found"],
      sentiment: "frustrated",
    },
  });
  await sleep(200);

  // =========================================================================
  console.log("\n" + "─".repeat(70));
  console.log("TEST 3: Distance calculation with shared words");
  console.log("─".repeat(70));

  send("tools/call", {
    name: "dream",
    arguments: { concept: "treasure maps and X marks the spot", reset: true },
  });
  await sleep(200);

  send("tools/call", {
    name: "dream",
    arguments: { concept: "the map is not the territory", chaosLevel: 0.5 },
  });
  await sleep(200);

  // =========================================================================
  console.log("\n" + "─".repeat(70));
  console.log("TEST 4: Return shows connection to original");
  console.log("─".repeat(70));

  send("tools/call", {
    name: "dream",
    arguments: { concept: "module resolution failure", reset: true },
  });
  await sleep(200);

  send("tools/call", {
    name: "dream",
    arguments: { concept: "symlinks point elsewhere", chaosLevel: 0.7 },
  });
  await sleep(200);

  send("tools/call", {
    name: "dream",
    arguments: {
      concept: "the path was wrong all along",
      isReturn: true,
      returnsTo: "module resolution failure",
    },
  });
  await sleep(200);

  // =========================================================================
  console.log("\n" + "─".repeat(70));
  console.log("TEST 5: Stuck detection (circling similar concepts)");
  console.log("─".repeat(70));

  send("tools/call", {
    name: "dream",
    arguments: { concept: "code architecture", chaosLevel: 0.7, reset: true },
  });
  await sleep(200);

  send("tools/call", {
    name: "dream",
    arguments: { concept: "software architecture", chaosLevel: 0.7 },
  });
  await sleep(200);

  send("tools/call", {
    name: "dream",
    arguments: { concept: "programming architecture", chaosLevel: 0.7 },
  });
  await sleep(200);

  // =========================================================================
  console.log("\n" + "─".repeat(70));
  console.log("TEST 6: Collision with low tension warning");
  console.log("─".repeat(70));

  send("tools/call", {
    name: "dream",
    arguments: {
      concept: "software development",
      isCollision: true,
      collidesWith: "code programming",
      reset: true,
    },
  });
  await sleep(200);

  // =========================================================================
  console.log("\n" + "─".repeat(70));
  console.log("TEST 7: Collision with high tension");
  console.log("─".repeat(70));

  send("tools/call", {
    name: "dream",
    arguments: {
      concept: "butterfly migration",
      isCollision: true,
      collidesWith: "database sharding",
    },
  });
  await sleep(300);

  // =========================================================================
  console.log("\n" + "─".repeat(70));
  console.log("TEST 8: Semantic override (LLM knows concepts are related)");
  console.log("─".repeat(70));

  // Surface measurement will see these as distant (different words)
  // But LLM knows they're semantically close (both about sadness/loss)
  send("tools/call", {
    name: "dream",
    arguments: { concept: "grief and loss", reset: true },
  });
  await sleep(200);

  // Without semantic override - should show high surface distance
  send("tools/call", {
    name: "dream",
    arguments: { concept: "mourning a loved one", chaosLevel: 0.5 },
  });
  await sleep(200);

  // With semantic override - LLM tells MCP these are actually close
  send("tools/call", {
    name: "dream",
    arguments: {
      concept: "bereavement counseling",
      chaosLevel: 0.5,
      semanticDistance: 0.2, // LLM knows this is semantically close
    },
  });
  await sleep(300);

  console.log("\n" + "═".repeat(70));
  console.log("TEST COMPLETE");
  console.log("═".repeat(70));

  server.kill();
  process.exit(0);
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  server.kill();
  process.exit(1);
});
