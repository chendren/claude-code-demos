---
name: terminal-video-demo
description: Use when asked to create, record, or reproduce a terminal demo video of Claude Code features, CLI workflows, or developer tool interactions. Covers toolchain setup, simulation scripts, VHS tape authoring, timing calibration, and accuracy standards.
---

# Terminal Video Demo

Produce polished 1280×720 H.264 MP4 terminal recordings using **VHS** (tape-scripted renderer) + **Node.js simulation scripts** (controlled output, real filesystem ops).

## Toolchain

```bash
brew install vhs ffmpeg chromium   # VHS requires Chromium to render
node --version                     # Node.js required for sim scripts
```

Check: `which vhs chromium ffmpeg node`

## Workflow

```
1. Plan scenes         → commands shown, responses needed
2. Capture API output  → claude -p "..." (time the call; save response verbatim)
3. Write sim script    → sim.js + shell.sh wrapper
4. Measure runtime     → node -e "const t=Date.now(); execSync('node sim.js', {input:'...',stdio:['pipe','ignore','ignore']}); console.log(Date.now()-t,'ms')"
5. Write tape          → reference sim runtime for Sleep values
6. Render              → vhs demo.tape
7. Calibrate           → ffprobe duration → adjust final Sleep → re-render
8. Verify              → open output.mp4
```

## File Structure

```
<feature>-sim.js        # Simulation script (readline or self-driven)
<feature>-shell.sh      # Wrapper: #!/bin/bash / exec node <path>/$@
<feature>-demo.tape     # VHS tape
<feature>-demo.mp4      # Output
```

## Simulation Script Rules

**Hard rules (enforced by hooks):**
- No regex — use `.startsWith()` `.includes()` `.split()` `.slice()` `.indexOf()`
- No `execSync`/`exec` with shell strings — use `fs.readdirSync`, `fs.writeFileSync`, `path`, `os` directly

**Streaming animation (char-by-char):**
```js
async function stream(text, base = 13) {
  for (const ch of text) {
    process.stdout.write(ch);
    await sleep(Math.floor(base * 0.5 + Math.random() * base * 0.9));
  }
}
```
- Base 8–12ms → fast (JSON, code)
- Base 13–16ms → normal prose
- Base 18–22ms → slow/deliberate

**Real filesystem ops:**
```js
const fs = require('fs'), os = require('os'), path = require('path');
const skillsDir = path.join(os.homedir(), '.claude', 'skills');
const names = fs.readdirSync(skillsDir).sort();   // real data
fs.mkdirSync(targetDir, { recursive: true });      // real side-effects
fs.writeFileSync(targetFile, content, 'utf8');     // real write
```

**Pre-captured API responses:**  
Run `claude -p "..."` once, copy the response verbatim into a `const RESPONSE = "..."` string. Never make live API calls inside the sim.

**Self-driven sim** (when command has unescapable chars like JSON):  
Skip readline entirely — stream the command and response internally, VHS just sleeps.

## VHS Tape Rules

```tape
Output name.mp4
Set FontSize 14
Set Width 1280
Set Height 720
Set Theme "Catppuccin Mocha"
Set Padding 28
Set TypingSpeed 55ms        # adjust per demo

Hide
Type "node /abs/path/to/sim.js"
Enter
Sleep 600ms
Show
Sleep 500ms                 # pause on live prompt

Type 'command with "double quotes" inside'   # single-quote outer wrapper
Sleep 200ms
Enter
Sleep <sim_scene_runtime>   # from measurement step

Sleep <final_hold>          # adjusted during calibration
```

**Critical VHS rules:**
- `Set Shell` accepts only a bare binary path — use a wrapper `.sh` for scripts with args
- Use `'single quotes'` as outer wrapper for `Type` strings that contain `"` — backslash-escaped `\"` causes "Invalid command" errors
- Hide/Show brackets around the shell boot to suppress startup noise

## Timing Calibration Loop

```bash
vhs demo.tape
ffprobe -v quiet -print_format json -show_streams output.mp4 \
  | python3 -c "import json,sys; v=[s for s in json.load(sys.stdin)['streams'] if s['codec_type']=='video'][0]; print(round(float(v['duration']),1),'s')"
# → adjust final Sleep by (target - actual), re-render
```

One iteration usually lands within ±0.2s of target.

## Accuracy Standard

A clip is **accurate** if every shown command is real and runnable:

| Element | Accurate approach |
|---|---|
| File listing | `fs.readdirSync` on actual path — real names |
| Skill format | `SKILL.md` with `name:` + `description:` frontmatter |
| MCP config | `claude mcp add <name> -e K=V -- <cmd>` exact syntax |
| Agent creation | `claude --agents '{"name":{"description":"...","prompt":"..."}}' -p "..."` |
| API responses | Pre-captured verbatim from real `claude -p` call |
| Commands | Only commands that exist in the installed Claude Code version |

## Common Mistakes

| Mistake | Fix |
|---|---|
| VHS "Invalid command: \\" | Use single-quote outer wrapper: `Type 'cmd "arg"'` |
| VHS "invalid shell" error | Wrap script in a `.sh` file; `Set Shell /path/to/wrapper.sh` |
| Sleep too short → truncated output | Measure sim runtime first; add 10–20% buffer |
| `execSync` hook block | Use `fs`/`path`/`os` built-ins instead |
| Regex hook block | Rewrite with `.split()`, `.startsWith()`, `.includes()` |
| Sim runtime varies | Jitter is random — measure 3× and use the slowest |
