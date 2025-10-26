# Start Ctrl+Shift+V paste system for Claude Code

$ErrorActionPreference = "SilentlyContinue"

# Kill any existing AutoHotkey processes
Get-Process | Where-Object {
    $_.ProcessName -like "*AutoHotkey*"
} | ForEach-Object {
    try {
        $_.Kill()
        Start-Sleep -Milliseconds 100
    } catch {}
}

Start-Sleep -Milliseconds 500

# Path to our script (in current directory)
$scriptPath = Join-Path $PSScriptRoot "claude-smart-paste.ahk"

if (Test-Path $scriptPath) {
    # Try to find AutoHotkey v2
    $ahkPaths = @(
        "C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe",
        "C:\Program Files\AutoHotkey\v2\AutoHotkey.exe",
        "C:\Program Files (x86)\AutoHotkey\v2\AutoHotkey64.exe",
        "C:\Program Files (x86)\AutoHotkey\v2\AutoHotkey.exe",
        "C:\Program Files\AutoHotkey\AutoHotkey64.exe",
        "C:\Program Files\AutoHotkey\AutoHotkey.exe"
    )

    $ahkExe = $ahkPaths | Where-Object { Test-Path $_ } | Select-Object -First 1

    if ($ahkExe) {
        Start-Process -FilePath $ahkExe -ArgumentList "`"$scriptPath`"" -WindowStyle Hidden
        Write-Host "SUCCESS: Ctrl+Shift+V is ready!"
        Write-Host ""
        Write-Host "Usage:"
        Write-Host "  1. Take screenshot (Win+Shift+S)"
        Write-Host "  2. Press Ctrl+Shift+V in Claude Code"
        Write-Host "  3. Screenshot appears!"
        Write-Host "  4. Repeat for more screenshots"
        Write-Host ""
        Write-Host "Each screenshot will be labeled [Image 1], [Image 2], etc."
    } else {
        Write-Host "ERROR: AutoHotkey not found!"
        Write-Host ""
        Write-Host "Please install AutoHotkey:"
        Write-Host "  Download: https://www.autohotkey.com/download/ahk-v2.exe"
        Write-Host ""
        Write-Host "After installing, run this command again."
    }
} else {
    Write-Host "ERROR: Script not found at $scriptPath"
}
