#!/bin/bash
# Install clipboard paste to Windows startup

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WIN_SCRIPT_PATH=$(wslpath -w "$SCRIPT_DIR/install-startup.ps1")

echo "Installing to Windows Startup..."
powershell.exe -ExecutionPolicy Bypass -File "$WIN_SCRIPT_PATH"
