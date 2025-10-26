#!/bin/bash
# Enable Ctrl+V pasting for Claude Code
# This starts the AutoHotkey script in Windows

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WIN_SCRIPT_PATH=$(wslpath -w "$SCRIPT_DIR/start-smart-paste.ps1")

echo "Starting Ctrl+V paste system..."
powershell.exe -ExecutionPolicy Bypass -File "$WIN_SCRIPT_PATH"

echo ""
echo "Ctrl+V is now enabled! Try it:"
echo "  1. Take a screenshot (Win+Shift+S)"
echo "  2. Press Ctrl+V in this terminal"
echo "  3. The image path will appear!"
