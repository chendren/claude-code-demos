# ACCURATE — Create a skill
# Workflow: mkdir + cat heredoc writes real SKILL.md to real path
# Target: ~30s

Output accurate-create-skill-demo.mp4

Set FontSize 14
Set Width 1280
Set Height 720
Set Theme "Catppuccin Mocha"
Set Padding 28
Set TypingSpeed 55ms

Hide
Type "node /Users/chadhendren/Desktop/claude-skills-demo/accurate-create-skill-sim.js"
Enter
Sleep 600ms
Show

Sleep 500ms

# Real command: create the skill directory
Type "mkdir -p ~/.claude/skills/incident-responder"
Sleep 200ms
Enter
Sleep 400ms

# Real command: write the SKILL.md with correct format
Type "cat > ~/.claude/skills/incident-responder/SKILL.md"
Sleep 200ms
Enter
Sleep 16s

# Real command: verify the file exists
Type "ls -la ~/.claude/skills/incident-responder/"
Sleep 200ms
Enter
Sleep 3s

Sleep 2.8s
