# Start the smart Ctrl+V paste system for Claude Code
# This script kills old AutoHotkey instances and starts the new one

$ErrorActionPreference = "SilentlyContinue"

# Kill only existing AutoHotkey processes running THIS script (not all AutoHotkey processes)
Get-CimInstance Win32_Process -Filter "name = 'AutoHotkey64.exe' OR name = 'AutoHotkey.exe'" | Where-Object {
    $_.CommandLine -like "*claude-smart-paste.ahk*"
} | ForEach-Object {
    try {
        Stop-Process -Id $_.ProcessId -Force
        Start-Sleep -Milliseconds 100
    } catch {}
}

# Wait a moment
Start-Sleep -Milliseconds 500

# Start the new smart paste script
$scriptPath = "\\wsl.localhost\Ubuntu\home\fullstacktard\development\claude-wsl\autohotkey\claude-smart-paste.ahk"

if (Test-Path $scriptPath) {
    # Try to find AutoHotkey v2
    $ahkPaths = @(
        "C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe",
        "C:\Program Files\AutoHotkey\v2\AutoHotkey.exe",
        "C:\Program Files (x86)\AutoHotkey\v2\AutoHotkey64.exe",
        "C:\Program Files (x86)\AutoHotkey\v2\AutoHotkey.exe"
    )

    $ahkExe = $ahkPaths | Where-Object { Test-Path $_ } | Select-Object -First 1

    if ($ahkExe) {
        Start-Process -FilePath $ahkExe -ArgumentList "`"$scriptPath`"" -WindowStyle Hidden
        Write-Host "Smart Ctrl+V paste system started!"
        Write-Host "You can now:"
        Write-Host "  1. Take screenshot (Win+Shift+S)"
        Write-Host "  2. Press Ctrl+V in Claude Code"
        Write-Host "  3. Screenshot appears!"
        Write-Host "  4. Repeat for more screenshots"
    } else {
        Write-Host "ERROR: AutoHotkey v2 not found!"
        Write-Host "Please install from: https://www.autohotkey.com/download/ahk-v2.exe"
    }
} else {
    Write-Host "ERROR: Script not found at $scriptPath"
}
