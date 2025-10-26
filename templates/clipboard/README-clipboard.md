# Claude Code Screenshot Paste for WSL

Paste screenshots from Windows clipboard directly into Claude Code running in WSL.

## Quick Start

1. **Take screenshot** (Win+Shift+S)
2. **Press Ctrl+V** in Claude Code
3. **Screenshot path appears** - Claude can read it!

## Setup Methods

### Option A: AutoHotkey Integration (Recommended)

**True Ctrl+V experience** - Images paste automatically, text pastes normally.

1. **Install AutoHotkey v2**: https://www.autohotkey.com/download/ahk-v2.exe

2. **Start it** (choose one):
   ```bash
   # Manual start (run each session)
   powershell.exe -ExecutionPolicy Bypass -File "$(wslpath -w "$HOME/development/claude-code-notifier/start-smart-paste.ps1")"

   # OR auto-start on Windows login
   ./install-startup.sh
   ```

3. **Use normally**:
   - **Ctrl+V** with image → pastes image path
   - **Ctrl+V** with text → pastes text
   - **Ctrl+Shift+V** → same as Ctrl+V (also works)
   - **Alt+V** → same as Ctrl+V (also works)

   **Notes**:
   - AutoHotkey must be running. If killed, restart manually.
   - A toast notification appears when AutoHotkey starts
   - Can run alongside other AutoHotkey scripts (unless hotkeys conflict)

### Option B: Manual Commands

Use bash commands/aliases without AutoHotkey:

```bash
pb          # Paste single image
cbi         # Paste single image (alias)
cbstage     # Stage image for multi-paste
cbflush     # Paste all staged images
cbclear     # Clear staged images
```

## Multi-Screenshot Workflow

Paste multiple screenshots in one message:

```bash
# Take screenshot 1
Win+Shift+S → cbstage    # ✓ Staged image #1

# Take screenshot 2
Win+Shift+S → cbstage    # ✓ Staged image #2

# Take screenshot 3
Win+Shift+S → cbstage    # ✓ Staged image #3

# Now paste all at once
cbflush    # Outputs all 3 image paths!
```

### Staging Commands

| Command | Description |
|---------|-------------|
| `cbstage` | Save current clipboard image for later |
| `cbflush` (or `pp`) | Paste all staged images at once |
| `cbclear` | Clear staged images without pasting |
| `pb` or `cbi` | Paste single image immediately (no staging) |

## How It Works

```
Windows Clipboard → PowerShell → Save PNG → WSL Path → Claude Code
```

1. PowerShell accesses Windows clipboard via .NET APIs
2. Image saved to `~/.cache/claude-clipboard-images/`
3. WSL path returned for Claude to read
4. Old images auto-deleted after 24 hours
5. Toast notification shows when AutoHotkey starts (auto-hides after 3 seconds)

**Staging workflow**:
- Staged images go to `~/.cache/claude-clipboard-staging/`
- After flush, they move to permanent cache
- Staging area is cleared after each flush

## Files Structure

```
claude-code-notifier/
├── README-clipboard.md          # This file
├── claude-paste-image           # Core clipboard script
├── claude-paste-stage           # Stage images
├── claude-paste-flush           # Flush staged images
├── claude-paste-clear           # Clear staging
├── claude-smart-paste.ahk       # AutoHotkey script for Ctrl+V
├── start-smart-paste.ps1        # Start AutoHotkey
└── install-startup.sh           # Install to Windows startup
```

## Bash Aliases

Added to `~/.bashrc`:

```bash
CLIPBOARD_DIR="$HOME/development/claude-code-notifier"

# Multi-screenshot workflow
alias cbstage="$CLIPBOARD_DIR/claude-paste-stage"
alias cbflush="$CLIPBOARD_DIR/claude-paste-flush"
alias pp="$CLIPBOARD_DIR/claude-paste-flush"
alias cbclear="$CLIPBOARD_DIR/claude-paste-clear"

# Single paste
alias pb="$CLIPBOARD_DIR/claude-paste-image"
alias cbi="$CLIPBOARD_DIR/claude-paste-image"
```

## Troubleshooting

### AutoHotkey not working?

```bash
# Check if running (in PowerShell)
Get-Process | Where-Object {$_.ProcessName -match "AutoHotkey"}

# Restart it
powershell.exe -ExecutionPolicy Bypass -File "$(wslpath -w "$HOME/development/claude-code-notifier/start-smart-paste.ps1")"
```

### Running multiple AutoHotkey scripts?

You can run this alongside other AutoHotkey scripts **simultaneously**. They won't interfere unless they use the same hotkeys.

**This script uses**:
- `Ctrl+V` (only in Windows Terminal)
- `Ctrl+Shift+V` (only in Windows Terminal)
- `Alt+V` (only in Windows Terminal)

**If you have hotkey conflicts**:
- Modify `claude-smart-paste.ahk` to use different keys
- Or combine all your scripts into one .ahk file
- The script only activates in Windows Terminal/Ubuntu, so conflicts with other apps are minimal

### Images not pasting?

1. Verify image is in clipboard (paste in Paint first)
2. Test PowerShell: `powershell.exe -Command "Get-Clipboard"`
3. Check scripts are executable: `chmod +x ~/development/claude-code-notifier/claude-paste-*`
4. Reload bash: `source ~/.bashrc`

### Permission errors?

```bash
chmod +x ~/development/claude-code-notifier/claude-paste-* ~/development/claude-code-notifier/*.sh ~/development/claude-code-notifier/*.ahk
```

### Where are my images?

- **Single paste cache**: `~/.cache/claude-clipboard-images/`
- **Staging area**: `~/.cache/claude-clipboard-staging/`
- Auto-deleted after 24 hours

## Advanced Usage

### Manual Cleanup

```bash
# Delete all cached images
rm -rf ~/.cache/claude-clipboard-images/*

# Delete staging
rm -rf ~/.cache/claude-clipboard-staging/*
```

### Custom Storage Location

Edit scripts and change `TEMP_DIR`:

```bash
# In claude-paste-image
TEMP_DIR="$HOME/your-custom-location"
```

### Check Running AutoHotkey

```bash
# PowerShell
powershell.exe -Command "Get-Process | Where-Object {$_.ProcessName -match 'AutoHotkey'}"
```

### Uninstall Startup

Delete the shortcut:
```bash
powershell.exe -Command "Remove-Item \"$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\Claude-Clipboard-Paste.lnk\""
```

## Why PowerShell Bridge?

WSL terminals can't directly transfer binary image data. Solutions:

1. **Terminal protocols** are text-based (can't handle binary images)
2. **WSL isolation** separates Windows and Linux clipboard
3. **PowerShell .NET APIs** provide direct Windows clipboard access
4. **Cross-boundary bridge** - WSL can execute `powershell.exe`

This approach:
- ✅ Works reliably across all terminals
- ✅ Full control over image storage
- ✅ Auto-cleanup prevents disk clutter
- ✅ No complex dependencies (just bash + PowerShell)

## License

MIT License - Feel free to modify and distribute

---

**Made for Claude Code users on WSL** 🚀
