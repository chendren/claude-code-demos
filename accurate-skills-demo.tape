# ACCURATE — Skills listing + invocation
# Commands: ls ~/.claude/skills/ (real fs) + claude -p with real pre-captured responses
# Target: ~30s

Output accurate-skills-demo.mp4

Set FontSize 14
Set Width 1280
Set Height 720
Set Theme "Catppuccin Mocha"
Set Padding 28
Set TypingSpeed 55ms

Hide
Type "node /Users/chadhendren/Desktop/claude-skills-demo/accurate-skills-sim.js"
Enter
Sleep 600ms
Show

Sleep 500ms

# Real command: list the skills directory
Type "ls ~/.claude/skills/ | sort"
Sleep 200ms
Enter
Sleep 3.5s

# Real command: ask claude to list skills (uses actual claude -p)
Type 'claude -p "list available skills"'
Sleep 200ms
Enter
Sleep 5.5s

# Real command: invoke /senior-architect skill
Type 'claude -p "/senior-architect What is your primary expertise?"'
Sleep 200ms
Enter
Sleep 5s

Sleep 9s
