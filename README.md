# Claude Clipboard

**Smart clipboard integration for Claude Code - paste screenshots and images directly from clipboard**

Stop manually saving screenshots! Just press Ctrl+V and Claude Clipboard automatically saves and pastes the image path into Claude Code.

## What You Get

**Quick Usage:**
1. Take screenshot (Win+Shift+S)
2. Press Ctrl+V in Claude Code
3. Screenshot path appears automatically!
4. Repeat for more screenshots

## Installation

```bash
npm install -g claude-clipboard
claude-clipboard install
```

The installer will:
- Copy clipboard scripts to `~/.local/share/claude-clipboard/`
- Copy AutoHotkey script to Windows `AppData` directory
- Check for AutoHotkey v2
- Provide setup instructions

## Requirements

- **Windows** with **WSL** (Ubuntu/Debian)
- **Windows Terminal** or Ubuntu.exe
- **AutoHotkey v2** - [Download here](https://www.autohotkey.com/)
- **Node.js** 18 or higher

## After Installation

### 1. Install AutoHotkey v2 (if not already installed)

Download and install from: https://www.autohotkey.com/

### 2. Start the Clipboard Monitor

**In Windows PowerShell:**

```powershell
cd "$env:LOCALAPPDATA\claude-clipboard"
.\start-smart-paste.ps1
```

You should see:
```
Smart Ctrl+V paste system started!
You can now:
  1. Take screenshot (Win+Shift+S)
  2. Press Ctrl+V in Claude Code
  3. Screenshot appears!
  4. Repeat for more screenshots
```

### 3. Optional: Auto-start on Windows Login

**In Windows PowerShell (as Administrator):**

```powershell
cd "$env:LOCALAPPDATA\claude-clipboard"
.\start-paste-shortcut.ps1
```

This creates a startup shortcut so the clipboard monitor starts automatically when you log in.

## How It Works

1. **Screenshot Capture** - Use Windows Snipping Tool (Win+Shift+S) to capture
2. **Clipboard Detection** - AutoHotkey script monitors Ctrl+V in Windows Terminal
3. **Image Processing** - WSL bash script saves clipboard image to `~/.cache/claude-clipboard-images/`
4. **Auto-Paste** - Script types the file path into Claude Code

**Technical Flow:**
- `claude-smart-paste.ahk` (Windows) - Intercepts Ctrl+V
- `claude-paste-image` (WSL) - Saves image and returns path
- Images stored: `~/.cache/claude-clipboard-images/`

## Commands

The installation includes several clipboard utilities:

### `claude-paste-image`
Main command - saves clipboard image and returns path.

```bash
claude-paste-image
# Output: /home/user/.cache/claude-clipboard-images/image_1_20251026_123045.png
```

### `claude-paste-latest`
Paste the most recent image again.

```bash
claude-paste-latest
# Output: /home/user/.cache/claude-clipboard-images/image_1_20251026_123045.png
```

### `claude-paste-clear`
Clear all saved images.

```bash
claude-paste-clear
# Cleared 5 images
```

### `claude-paste-flush`
Reset image counter (starts counting from 1 again).

```bash
claude-paste-flush
# Counter flushed, next image will be image_1
```

## Troubleshooting

### Script Not Intercepting Ctrl+V

**Check if AutoHotkey is running:**
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*AutoHotkey*"}
```

**Restart the script:**
```powershell
cd "$env:LOCALAPPDATA\claude-clipboard"
.\start-smart-paste.ps1
```

### Images Not Pasting

**Test the bash script manually:**
```bash
# Copy an image to clipboard first (Win+Shift+S)
~/.local/share/claude-clipboard/claude-paste-image
# Should output a file path
```

**Check image directory:**
```bash
ls -lah ~/.cache/claude-clipboard-images/
```

### Wrong Window Active

The script only works in **Windows Terminal** or **Ubuntu.exe**. Make sure your terminal is focused when pressing Ctrl+V.

### PowerShell Execution Policy Error

If you get an execution policy error, run this in PowerShell (as Administrator):

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Files & Locations

### WSL Files

| Path | Purpose |
|------|---------|
| `~/.local/share/claude-clipboard/` | Installation directory |
| `~/.cache/claude-clipboard-images/` | Saved screenshots |
| `~/.cache/claude-clipboard-images/.image_counter` | Session tracking |

### Windows Files

| Path | Purpose |
|------|---------|
| `%LOCALAPPDATA%\claude-clipboard\` | Windows installation |
| `claude-smart-paste.ahk` | AutoHotkey Ctrl+V interceptor |
| `start-smart-paste.ps1` | PowerShell launcher |
| `start-paste-shortcut.ps1` | Startup shortcut creator |

## Advanced Usage

### Multiple Screenshots in One Paste

Use `claude-paste-image-multi` for pasting multiple images:

```bash
# Take 3 screenshots, then:
~/.local/share/claude-clipboard/claude-paste-image-multi
# Outputs all images with newlines
```

### Stage Images for Later

```bash
# Stage an image without pasting
~/.local/share/claude-clipboard/claude-paste-stage

# Later, paste the staged image
~/.local/share/claude-clipboard/claude-paste-latest
```

### Continuous Clipboard Watching

For watching clipboard continuously (not just Ctrl+V):

```powershell
# In Windows PowerShell
$env:LOCALAPPDATA\claude-clipboard\clipboard-watcher.ps1
```

This monitors the clipboard and automatically saves images as they're copied.

## Uninstall

```bash
# 1. Stop AutoHotkey script (close from system tray)

# 2. Remove WSL files
rm -rf ~/.local/share/claude-clipboard
rm -rf ~/.cache/claude-clipboard-images

# 3. Remove Windows files (in PowerShell)
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\claude-clipboard"

# 4. Remove startup shortcut (if created)
Remove-Item "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\Claude-Clipboard-Paste.lnk"
```

## Customization

### Change Image Save Location

Edit `~/.local/share/claude-clipboard/claude-paste-image`:

```bash
IMAGE_DIR="$HOME/.cache/my-custom-location"
```

### Change Image Naming Pattern

Edit the same file and modify the `IMAGE_PATH` line:

```bash
IMAGE_PATH="${IMAGE_DIR}/screenshot_${IMAGE_NUM}_${TIMESTAMP}.png"
```

## Security Note

Images are saved to your local WSL filesystem (`~/.cache/claude-clipboard-images/`). They are NOT uploaded anywhere automatically. Claude Code may send them to Anthropic when you submit them in a conversation, following Claude's normal data handling policies.

## License

MIT

## Author

Built by [@fullstacktard](https://github.com/fullstacktard) - because saving screenshots manually is for chumps.

## Related

- [claude-wsl-integration](https://www.npmjs.com/package/claude-wsl-integration) - Visual notifications for Claude Code
- [claude-workflow](https://www.npmjs.com/package/claude-workflow) - Workflow management for Claude Code
