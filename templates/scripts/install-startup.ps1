# Install Claude Clipboard to Windows Startup
# This creates a shortcut that runs on login

$ErrorActionPreference = "Stop"

# Get the Windows Startup folder
$startupFolder = [Environment]::GetFolderPath("Startup")

# Path to the AutoHotkey script (using WSL path)
$ahkScriptPath = "\\wsl.localhost\Ubuntu\home\fullstacktard\development\claude-wsl\autohotkey\claude-smart-paste.ahk"

# Find AutoHotkey v2 executable
$ahkPaths = @(
    "C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe",
    "C:\Program Files\AutoHotkey\v2\AutoHotkey.exe",
    "C:\Program Files (x86)\AutoHotkey\v2\AutoHotkey64.exe",
    "C:\Program Files (x86)\AutoHotkey\v2\AutoHotkey.exe"
)

$ahkExe = $ahkPaths | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $ahkExe) {
    Write-Host "ERROR: AutoHotkey v2 not found!"
    Write-Host "Please install from: https://www.autohotkey.com/download/ahk-v2.exe"
    exit 1
}

Write-Host "Found AutoHotkey at: $ahkExe"

# Create VBS wrapper to run AutoHotkey hidden (no window)
# Store in AppData (permanent location, not TEMP which gets cleaned)
$vbsFolder = Join-Path $env:APPDATA "claude-wsl"
if (-not (Test-Path $vbsFolder)) {
    New-Item -ItemType Directory -Path $vbsFolder -Force | Out-Null
}
$vbsPath = Join-Path $vbsFolder "start-claude-paste.vbs"

$vbsContent = @"
Set objShell = CreateObject("Wscript.Shell")
objShell.Run """$ahkExe"" ""$ahkScriptPath""", 0, False
"@
$vbsContent | Out-File -FilePath $vbsPath -Encoding ASCII -Force

Write-Host "Created VBS launcher at: $vbsPath"

# Create shortcut to VBS wrapper
$shortcutPath = Join-Path $startupFolder "Claude-Clipboard-Paste.lnk"
$WScriptShell = New-Object -ComObject WScript.Shell
$shortcut = $WScriptShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "wscript.exe"
$shortcut.Arguments = "`"$vbsPath`""
$shortcut.WorkingDirectory = $env:TEMP
$shortcut.Description = "Claude Code Smart Clipboard Paste (Ctrl+V)"
$shortcut.WindowStyle = 7  # Minimized
$shortcut.Save()

Write-Host ""
Write-Host "SUCCESS! Clipboard paste will now start automatically on login."
Write-Host "Shortcut created at: $shortcutPath"
Write-Host ""
Write-Host "To test, you can either:"
Write-Host "  1. Restart your computer"
Write-Host "  2. Run the shortcut manually from: $shortcutPath"
Write-Host ""
Write-Host "To uninstall, delete: $shortcutPath"
