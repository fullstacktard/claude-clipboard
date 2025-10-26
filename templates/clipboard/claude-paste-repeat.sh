#!/bin/bash

# Simple repeatable screenshot paste for Claude Code
# Usage: Bind to Ctrl+V in .inputrc

# Generate unique filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S_%N)
TEMP_FILE="/tmp/screenshot_${TIMESTAMP}.png"

# Get image from Windows clipboard using PowerShell
/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe -Command "
    Add-Type -AssemblyName System.Windows.Forms
    \$clip = [System.Windows.Forms.Clipboard]::GetImage()
    if (\$clip -ne \$null) {
        \$clip.Save('$(wslpath -w "$TEMP_FILE")', [System.Drawing.Imaging.ImageFormat]::Png)
        exit 0
    } else {
        exit 1
    }
" 2>/dev/null

# Check if we got an image
if [ $? -eq 0 ] && [ -f "$TEMP_FILE" ]; then
    # Send the file path to Claude Code's input
    echo -ne "$TEMP_FILE"

    # Optional: Show a brief notification (silent)
    # echo "[Screenshot pasted]" >&2
else
    # No image in clipboard - let normal paste happen
    # Send Ctrl+V through
    echo -ne "\x16"
fi
