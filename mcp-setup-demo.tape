# VHS tape — Claude Code MCP connection setup (AWS public server)
# Target: ~30-second MP4, 1280×720

Output mcp-setup-demo.mp4

Set FontSize 14
Set Width 1280
Set Height 720
Set Theme "Catppuccin Mocha"
Set Padding 28
Set TypingSpeed 58ms

# Boot the simulation, hide shell startup
Hide
Type "node /Users/chadhendren/Desktop/claude-skills-demo/mcp-setup-sim.js"
Enter
Sleep 600ms
Show

# Brief pause on live prompt
Sleep 500ms

# User types the mcp add command
Type "mcp add aws-docs"
Sleep 200ms
Enter

# Sim runs: spinner → config write → MCP handshake → tool discovery
# Measured runtime: ~23.7s — sleep 25s to ensure full render
Sleep 25s

# Hold on the completed state (connected + 5 tools listed)
Sleep 5.5s
