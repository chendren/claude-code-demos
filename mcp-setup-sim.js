#!/usr/bin/env node
// Simulates Claude Code setting up AWS Labs' public MCP server.
// Shows: package resolution → settings.json write → MCP handshake → tool discovery.

const readline = require("readline");

const R  = "\x1b[0m";
const B  = "\x1b[1m";
const CY = "\x1b[36m";
const GR = "\x1b[32m";
const YE = "\x1b[33m";
const MA = "\x1b[35m";
const BL = "\x1b[34m";
const WH = "\x1b[97m";
const GY = "\x1b[90m";
const OR = "\x1b[38;5;208m";

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function stream(text, baseDelay) {
  const base = baseDelay || 13;
  for (const ch of text) {
    process.stdout.write(ch);
    const jitter = Math.floor(base * 0.5 + Math.random() * base * 0.9);
    await sleep(jitter);
  }
}

async function streamLine(text, baseDelay, leadDelay) {
  if (leadDelay) await sleep(leadDelay);
  await stream(text + "\n", baseDelay);
}

async function spinner(label, steps, stepDelay) {
  const frames = ["-", "\\", "|", "/"];
  const n = steps || 6;
  const d = stepDelay || 110;
  for (let i = 0; i < n; i++) {
    process.stdout.write("\r  " + GY + frames[i % 4] + "  " + label + R + "   ");
    await sleep(d);
  }
  process.stdout.write("\r");
}

async function dots(label, count, dotDelay) {
  const n = count || 3;
  const d = dotDelay || 180;
  process.stdout.write("  " + GY + label + R);
  for (let i = 0; i < n; i++) {
    await sleep(d);
    process.stdout.write(GY + "." + R);
  }
  process.stdout.write("\n");
  await sleep(80);
}

const CONFIG_LINES = [
  "{",
  '  "awslabs.aws-documentation-mcp-server": {',
  '    "command": "uvx",',
  '    "args": ["awslabs.aws-documentation-mcp-server@latest"],',
  '    "env": {',
  '      "FASTMCP_LOG_LEVEL": "ERROR",',
  '      "AWS_DOCUMENTATION_PARTITION": "aws"',
  "    }",
  "  }",
  "}",
];

const TOOLS = [
  ["search_documentation",      "Search AWS docs via the official search API"],
  ["read_documentation",        "Fetch an AWS docs page and return as Markdown"],
  ["read_sections",             "Fetch specific sections of a docs page"],
  ["recommendations",           "Get content recommendations for a docs page"],
  ["get_available_services_list","List all services available in a given partition"],
];

function colorConfig(line) {
  const trimmed = line.trim();
  if (trimmed === "{" || trimmed === "}" || trimmed === "},") {
    return "    " + GY + line + R;
  }
  const colon = line.indexOf('":');
  if (colon !== -1) {
    const key = line.slice(0, colon + 1);
    const val = line.slice(colon + 2);
    return "    " + CY + key + R + ":" + YE + val + R;
  }
  if (line.includes('"awslabs')) {
    return "    " + B + WH + line + R;
  }
  return "    " + WH + line + R;
}

async function handleMcpAdd(serverAlias) {
  const pkg = "awslabs.aws-documentation-mcp-server";
  const configPath = "~/.claude/settings.json";

  console.log("");

  // Step 1: Resolve package
  await spinner("Resolving " + pkg + "@latest", 8, 100);
  await streamLine("  " + GR + "✓" + R + "  " + GY + "Resolved  " + WH + pkg + "@0.1.5" + R, 14, 40);
  await sleep(120);

  // Step 2: Write config
  await streamLine("  " + GY + "Writing   " + WH + configPath + R, 14, 80);
  await sleep(160);
  console.log("");

  for (const line of CONFIG_LINES) {
    await streamLine(colorConfig(line), 11);
  }
  await sleep(200);

  // Step 3: MCP protocol handshake
  console.log("");
  await streamLine("  " + GY + "Connecting to server..." + R, 14, 60);
  await sleep(120);

  await streamLine(
    "  " + BL + "→" + R + "  " + GY + "initialize" + R +
    "  " + GY + "{ protocolVersion: " + YE + "\"2024-11-05\"" + GY + " }" + R,
    10, 80
  );
  await sleep(360);

  await streamLine(
    "  " + GR + "←" + R + "  " + GY + "initialize" + R +
    "  " + WH + "aws-documentation-mcp-server" + R +
    "  " + GY + "v0.1.5" + R,
    10, 60
  );
  await sleep(160);

  await streamLine(
    "  " + BL + "→" + R + "  " + GY + "tools/list" + R,
    10, 80
  );
  await sleep(420);

  await streamLine(
    "  " + GR + "←" + R + "  " + GY + "tools/list" + R +
    "  " + GY + "(" + WH + "5 tools" + GY + ")" + R,
    10, 60
  );
  await sleep(200);

  // Step 4: Tool listing
  console.log("");
  await streamLine("  " + B + WH + "Available tools" + R + "  " + GY + "mcp:aws-docs" + R, 14, 60);
  await streamLine("  " + GY + "─".repeat(54) + R, 10, 40);

  for (const [name, desc] of TOOLS) {
    const paddedName = name.padEnd(34);
    await streamLine(
      "  " + OR + "⬡" + R + "  " + CY + B + paddedName + R + "  " + GY + desc + R,
      10, 40
    );
  }

  await streamLine("  " + GY + "─".repeat(54) + R, 10, 40);
  console.log("");

  // Step 5: Confirmation
  await streamLine(
    "  " + GR + "✓" + R + "  " + B + WH + "aws-docs" + R + "  " +
    GY + "connected  ·  5 tools  ·  session active" + R,
    13, 120
  );
  await sleep(80);
  await streamLine(
    "  " + GY + "Call tools with " + WH + "mcp__aws-docs__search_documentation" + R,
    13, 70
  );
  console.log("");
}

async function main() {
  process.stdout.write("\x1b[2J\x1b[H");
  await sleep(200);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
    prompt: B + GR + "claude" + R + " " + GY + "›" + R + " ",
  });

  rl.prompt();

  for await (const line of rl) {
    const cmd = line.trim();

    if (cmd.startsWith("mcp add")) {
      const parts = cmd.split(" ");
      const alias = parts[2] || "aws-docs";
      await handleMcpAdd(alias);
      rl.close();
      process.exit(0);
    } else if (cmd === "exit" || cmd === "quit") {
      rl.close();
      process.exit(0);
    }

    rl.prompt();
  }
}

main().catch(console.error);
