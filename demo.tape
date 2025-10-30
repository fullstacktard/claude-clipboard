Output demo.gif

Set FontSize 20
Set Width 1200
Set Height 600
Set Theme { "name": "Custom", "black": "#000000", "red": "#dc2626", "green": "#00ff00", "yellow": "#ffff00", "blue": "#dc2626", "purple": "#ff00ff", "cyan": "#00ffff", "white": "#ffffff", "brightBlack": "#808080", "brightRed": "#dc2626", "brightGreen": "#00ff00", "brightYellow": "#ffff00", "brightBlue": "#dc2626", "brightPurple": "#ff00ff", "brightCyan": "#00ffff", "brightWhite": "#ffffff", "background": "#1a1b21", "foreground": "#ffffff", "cursor": "#dc2626", "cursorAccent": "#000000", "selection": "#dc2626" }
Set TypingSpeed 50ms
Set PlaybackSpeed 1.0
Set Padding 20

# Hide setup
Hide

# Set up test environment
Type "cd /tmp && rm -rf claude-clipboard-demo && mkdir claude-clipboard-demo && cd claude-clipboard-demo"
Enter
Sleep 2s

# Set red prompt
Type 'export PS1="\[\033[0;31m\]> \[\033[0m\]"'
Enter
Sleep 500ms

# Clear screen
Type "clear"
Enter
Sleep 500ms

# Show from here
Show

# Install claude-clipboard
Type "npm install -g claude-clipboard"
Enter
Sleep 5s

# Run installation
Type "claude-clipboard install"
Enter

# Wait for header and installation to show
Sleep 3s

# Let installation steps complete (AutoHotkey install, monitor start, auto-start)
Sleep 20s

# Show completion box
Sleep 5s

# Clear and show usage
Type "clear"
Enter
Sleep 1s

# Show usage
Type "# Now just:"
Enter
Sleep 1s

Type "# 1. Take screenshot (Win+Shift+S)"
Enter
Sleep 1s

Type "# 2. Press Ctrl+V in Claude Code"
Enter
Sleep 1s

Type "# 3. Screenshot path appears!"
Enter
Sleep 3s
