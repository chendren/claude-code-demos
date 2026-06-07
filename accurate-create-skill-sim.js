#!/usr/bin/env node
// ACCURATE recreation of skill creation.
// Uses real file system operations (fs, not shell).
// Shows the real SKILL.md format with correct frontmatter.
// Real path: ~/.claude/skills/<name>/SKILL.md

const readline = require("readline");
const fs = require("fs");
const os = require("os");
const path = require("path");

const R  = "\x1b[0m";
const B  = "\x1b[1m";
const CY = "\x1b[36m";
const GR = "\x1b[32m";
const GY = "\x1b[90m";
const WH = "\x1b[97m";
const YE = "\x1b[33m";
const DIM = "\x1b[2m";

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

const SKILL_CONTENT = `---
name: incident-responder
description: Use when a production incident is reported, an alert fires, or on-call
  triage is needed. Guides systematic MTTR-minimizing response.
---

# Incident Responder

Structured triage workflow for production incidents.

## Phases

**1. Scope** — blast radius before debugging
- Services and endpoints affected
- User impact: count or % of traffic
- Severity: P1 full outage · P2 degraded · P3 partial

**2. Hypothesize** — top 3 causes by probability
- Deploys in the last 2 hours
- Config, scaling, or certificate changes
- External dependencies: APIs, CDN, DNS

**3. Mitigate first, diagnose second**
- Rollback, feature flag, or traffic diversion
- Restore users before finding root cause

**4. Root cause** — correlate logs, metrics, traces

**5. Post-incident** — blameless post-mortem within 48h
`;

const SKILL_LINES = SKILL_CONTENT.split("\n");

function colorSkillLine(line) {
  if (line === "---") return GY + line + R;
  if (line.startsWith("name:") || line.startsWith("description:")) {
    const colon = line.indexOf(":");
    return CY + line.slice(0, colon) + R + ":" + YE + line.slice(colon + 1) + R;
  }
  if (line.startsWith("#")) return B + WH + line + R;
  if (line.startsWith("**")) return GR + line + R;
  if (line.startsWith("-")) return GY + line + R;
  return WH + line + R;
}

async function handleMkdir(skillName) {
  const skillDir = path.join(os.homedir(), ".claude", "skills", skillName);
  fs.mkdirSync(skillDir, { recursive: true });
  console.log("");
  await sleep(80);
}

async function handleWrite(skillName) {
  const skillDir = path.join(os.homedir(), ".claude", "skills", skillName);
  const skillFile = path.join(skillDir, "SKILL.md");

  await streamLine(GY + "> " + WH + skillFile + R, 14, 60);
  await sleep(160);

  for (const line of SKILL_LINES) {
    await streamLine(colorSkillLine(line), 10);
  }

  fs.writeFileSync(skillFile, SKILL_CONTENT, "utf8");
  await sleep(200);
}

async function handleLs(skillName) {
  const skillDir = path.join(os.homedir(), ".claude", "skills", skillName);
  console.log("");
  try {
    const entries = fs.readdirSync(skillDir);
    for (const entry of entries) {
      const full = path.join(skillDir, entry);
      const stat = fs.statSync(full);
      const size = stat.size.toString().padStart(6);
      process.stdout.write(
        "  " + GY + size + " " + WH + entry + R + "\n"
      );
      await sleep(40);
    }
  } catch (_) {
    process.stdout.write("  " + GY + "(directory not found)" + R + "\n");
  }
  console.log("");
  await streamLine(
    "  " + GR + "✓" + R + "  " + WH + B + "/" + skillName + R +
    "  " + GY + "available — invoke with " + CY + "/" + skillName + R + " inside claude" + R,
    13, 80
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
    prompt: B + GY + "~ $" + R + " ",
  });

  rl.prompt();

  for await (const line of rl) {
    const cmd = line.trim();

    if (cmd.startsWith("mkdir")) {
      const parts = cmd.split(" ");
      const last = parts[parts.length - 1];
      const skillName = last.split("/").pop();
      await handleMkdir(skillName);
    } else if (cmd.startsWith("cat >") && cmd.includes("SKILL.md")) {
      const parts = cmd.split("/");
      const skillName = parts[parts.length - 2];
      await handleWrite(skillName);
    } else if (cmd.startsWith("ls -la") || cmd.startsWith("ls ~/.claude/skills/incident")) {
      await handleLs("incident-responder");
    } else if (cmd === "exit" || cmd === "quit") {
      rl.close();
      process.exit(0);
    }

    rl.prompt();
  }
}

main().catch(console.error);
