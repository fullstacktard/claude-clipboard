# Create startup shortcut for Claude Clipboard
# This creates a shortcut that runs on Windows login

$ErrorActionPreference = "Stop"

# Get the Windows Startup folder
$startupFolder = [Environment]::GetFolderPath("Startup")

# Path to our start script (in current directory)
$startScriptPath = Join-Path $PSScriptRoot "start-smart-paste.ps1"

if (-not (Test-Path $startScriptPath)) {
    Write-Host "ERROR: Start script not found at $startScriptPath"
    exit 1
}

# Find AutoHotkey v2 executable
$ahkPaths = @(
    "C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe",
    "C:\Program Files\AutoHotkey\v2\AutoHotkey.exe",
    "C:\Program Files (x86)\AutoHotkey\v2\AutoHotkey64.exe",
    "C:\Program Files (x86)\AutoHotkey\v2\AutoHotkey.exe",
    "C:\Program Files\AutoHotkey\AutoHotkey64.exe",
    "C:\Program Files\AutoHotkey\AutoHotkey.exe"
)

$ahkExe = $ahkPaths | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $ahkExe) {
    Write-Host "ERROR: AutoHotkey not found!"
    Write-Host "Please install from: https://www.autohotkey.com/"
    exit 1
}

# Create shortcut that runs PowerShell script
$shortcutPath = Join-Path $startupFolder "Claude-Smart-Paste.lnk"
$WScriptShell = New-Object -ComObject WScript.Shell
$shortcut = $WScriptShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "powershell.exe"
$shortcut.Arguments = "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$startScriptPath`""
$shortcut.WorkingDirectory = $PSScriptRoot
$shortcut.Description = "Claude Code Smart Clipboard Paste (Ctrl+V)"
$shortcut.WindowStyle = 7  # Minimized
$shortcut.Save()

Write-Host "SUCCESS! Startup shortcut created."
Write-Host "Shortcut: $shortcutPath"
Write-Host ""
Write-Host "Clipboard paste will now start automatically on login."
Write-Host ""
Write-Host "To uninstall, delete: $shortcutPath"
