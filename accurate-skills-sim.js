#!/usr/bin/env node
// ACCURATE recreation of skills listing + invocation.
// Commands shown are real Claude Code CLI commands.
// ls output is live from the real filesystem.
// claude -p responses are pre-captured from actual API calls.

const readline = require("readline");
const fs = require("fs");
const os = require("os");

const R  = "\x1b[0m";
const B  = "\x1b[1m";
const CY = "\x1b[36m";
const GR = "\x1b[32m";
const GY = "\x1b[90m";
const WH = "\x1b[97m";
const YE = "\x1b[33m";
const DIM = "\x1b[2m";

// Pre-captured real response from: claude -p "/senior-architect What is your
// primary expertise? Answer in exactly 2 sentences."
const SKILL_RESPONSE =
  "My primary expertise is designing and analyzing software architecture — " +
  "evaluating patterns, decomposing systems, and guiding decisions on structure, " +
  "scalability, and technology selection. I specialize in translating complex " +
  "technical trade-offs into clear, actionable architecture decisions across " +
  "databases, deployment models, and integration patterns.";

// Curated from real: claude -p "List every skill available. Format: /name — description"
const SKILLS_SAMPLE = [
  ["/senior-architect",      "Design systems, evaluate patterns, architecture decision records"],
  ["/senior-fullstack",      "Full-stack feature implementation, TypeScript + React"],
  ["/senior-backend",        "API design and server-side logic"],
  ["/aws-solution-architect","Serverless AWS architectures with IaC templates"],
  ["/rag-architect",         "RAG pipelines and vector store setup"],
  ["/tdd-guide",             "Test-driven development workflow"],
  ["/database-designer",     "Schema design and query optimisation"],
  ["/mcp-server-builder",    "Build custom MCP tool servers"],
  ["/performance-profiler",  "Profiling and bottleneck analysis"],
  ["/deep-research",         "Multi-source cited research reports"],
];

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function stream(text, base) {
  const b = base || 13;
  for (const ch of text) {
    process.stdout.write(ch);
    const j = Math.floor(b * 0.5 + Math.random() * b * 0.9);
    await sleep(j);
  }
}

async function streamLine(text, base, lead) {
  if (lead) await sleep(lead);
  await stream(text + "\n", base);
}

async function runLs() {
  console.log("");
  try {
    const skillsDir = os.homedir() + "/.claude/skills";
    const names = fs.readdirSync(skillsDir).sort();
    for (const name of names) {
      process.stdout.write("  " + GY + "/" + WH + name + R + "\n");
      await sleep(28);
    }
  } catch (_) {
    process.stdout.write("  " + GY + "(no skills directory found)" + R + "\n");
  }
  console.log("");
}

async function streamSkillsList() {
  console.log("");
  for (const [name, desc] of SKILLS_SAMPLE) {
    const padded = name.padEnd(26);
    await streamLine(
      "  " + CY + B + padded + R + "  " + GY + desc + R,
      10, 35
    );
  }
  await streamLine(
    "  " + DIM + GY + "... and " + WH + "70+ more" + GY + " — invoke any with /skill-name inside claude" + R,
    10, 60
  );
  console.log("");
}

async function streamSkillResponse() {
  console.log("");
  await stream("  " + WH + SKILL_RESPONSE + R, 12);
  process.stdout.write("\n");
  console.log("");
}

async function main() {
  process.stdout.write("\x1b[2J\x1b[H");
  await sleep(200);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
    prompt: B + GY + "~ $" + R + " ",
  });

  rl.prompt();

  for await (const line of rl) {
    const cmd = line.trim();

    if (cmd === "ls ~/.claude/skills/ | sort") {
      await runLs();
    } else if (cmd.startsWith("claude -p") && cmd.includes("list") && cmd.includes("skill")) {
      await streamSkillsList();
    } else if (cmd.startsWith("claude -p") && cmd.includes("senior-architect")) {
      await streamSkillResponse();
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
