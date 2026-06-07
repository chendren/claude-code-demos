#!/usr/bin/env node
// ACCURATE recreation of AI agent creation.
// Shows the real --agents JSON flag syntax (actual Claude Code CLI).
// Response is pre-captured from a real claude --agents API call.

const readline = require("readline");

const R  = "\x1b[0m";
const B  = "\x1b[1m";
const CY = "\x1b[36m";
const GR = "\x1b[32m";
const GY = "\x1b[90m";
const WH = "\x1b[97m";
const YE = "\x1b[33m";
const RD = "\x1b[31m";
const OR = "\x1b[38;5;208m";
const MA = "\x1b[35m";

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

// Pre-captured from real:
// claude --agents '{"security-auditor": {...}}' -p "identify vulnerabilities..."
const FINDINGS = [
  {
    sev: "CRITICAL",
    sevColor: RD,
    title: "SQL Injection",
    loc: "route.js:3",
    detail: "Raw query parameter concatenated into SQL string.",
    fix: "Use parameterized query:  db.query('SELECT * FROM users WHERE id=?', [id])",
  },
  {
    sev: "HIGH",
    sevColor: OR,
    title: "Sensitive Data in Logs",
    loc: "route.js:4",
    detail: "req.headers logged on every request — exposes Authorization, Cookie headers.",
    fix: "Log only req.method and req.path; strip auth headers before logging.",
  },
  {
    sev: "MEDIUM",
    sevColor: YE,
    title: "Missing Input Validation",
    loc: "route.js:2",
    detail: "id is used unvalidated; null or non-numeric values corrupt the query.",
    fix: "Validate: if (!Number.isInteger(Number(id))) return res.status(400).end()",
  },
  {
    sev: "MEDIUM",
    sevColor: YE,
    title: "Unhandled Query Error",
    loc: "route.js:3",
    detail: "err is never checked; query failure throws accessing rows[0] of undefined.",
    fix: "Add: if (err) return res.status(500).json({ error: 'query failed' })",
  },
];

async function streamAgentResponse() {
  console.log("");
  await sleep(120);

  for (const f of FINDINGS) {
    await streamLine(
      f.sevColor + B + f.sev + R + "  " + WH + B + f.title + R +
      "  " + GY + f.loc + R,
      12, 100
    );
    await streamLine("  " + WH + f.detail + R, 11, 30);
    await streamLine("  " + GY + "↳ " + CY + f.fix + R, 11, 30);
    console.log("");
    await sleep(60);
  }
}

const AGENT_JSON = JSON.stringify({
  "security-auditor": {
    description: "Reviews code for OWASP Top 10 security vulnerabilities",
    prompt:
      "You are a security code auditor. Analyze code for: SQL injection, " +
      "command injection, sensitive data exposure, authentication flaws, and " +
      "unhandled errors. For each finding report severity, file:line, description, " +
      "and a one-line remediation.",
  },
});

// The full real command, shown character-by-character as if typed by the user.
// Driven internally so VHS doesn't need to type backslash-escaped JSON.
const AGENT_CMD_PARTS = [
  "claude --agents ",
  "'{",
  '"security-auditor": {',
  '"description": "Reviews code for OWASP Top 10 vulnerabilities",',
  '"prompt": "You are a security code auditor. Report severity, ',
  "location, and remediation for each finding.\"",
  "}}'",
  " \\",
  "\n  -p ",
  '"identify vulnerabilities: ',
  "app.get('/user',(req,res)=>",
  "db.query('SELECT * FROM users WHERE id='+req.query.id))",
  '"',
];

async function typeCommand() {
  const prompt = B + GY + "~ $" + R + " ";
  process.stdout.write(prompt);
  await sleep(400);

  let onContinuationLine = false;
  for (const part of AGENT_CMD_PARTS) {
    if (part === "\n  -p ") {
      process.stdout.write("\n");
      await sleep(80);
      process.stdout.write("  -p ");
      onContinuationLine = true;
      await sleep(120);
      continue;
    }
    for (const ch of part) {
      process.stdout.write(ch);
      const jitter = Math.floor(35 + Math.random() * 40);
      await sleep(jitter);
    }
  }
  process.stdout.write("\n");
  await sleep(300);
}

async function main() {
  process.stdout.write("\x1b[2J\x1b[H");
  await sleep(300);

  // Self-drive: type the command, then show the response. No readline needed.
  await typeCommand();
  await streamAgentResponse();
}

main().catch(console.error);
