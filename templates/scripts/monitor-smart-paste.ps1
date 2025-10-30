# Monitor and auto-restart claude-smart-paste.ahk if it stops running
# Checks every 5 minutes

$ErrorActionPreference = "SilentlyContinue"

# Configuration
$checkIntervalSeconds = 300  # 5 minutes
$scriptPath = "\\wsl.localhost\Ubuntu\home\fullstacktard\development\claude-wsl\autohotkey\claude-smart-paste.ahk"

# Find AutoHotkey v2
$ahkPaths = @(
    "C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe",
    "C:\Program Files\AutoHotkey\v2\AutoHotkey.exe",
    "C:\Program Files (x86)\AutoHotkey\v2\AutoHotkey64.exe",
    "C:\Program Files (x86)\AutoHotkey\v2\AutoHotkey.exe"
)

$ahkExe = $ahkPaths | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $ahkExe) {
    Write-Host "ERROR: AutoHotkey v2 not found!"
    exit 1
}

# Function to check if script is running
function IsScriptRunning {
    $running = Get-CimInstance Win32_Process -Filter "name = 'AutoHotkey64.exe' OR name = 'AutoHotkey.exe'" | Where-Object {
        $_.CommandLine -like "*claude-smart-paste.ahk*"
    }
    return ($null -ne $running)
}

# Function to start the script
function StartScript {
    Start-Process -FilePath $ahkExe -ArgumentList "`"$scriptPath`"" -WindowStyle Hidden
}

# Initial start
if (-not (IsScriptRunning)) {
    StartScript
    Write-Host "Started claude-smart-paste.ahk"
}

# Monitor loop
while ($true) {
    Start-Sleep -Seconds $checkIntervalSeconds

    if (-not (IsScriptRunning)) {
        Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] claude-smart-paste.ahk not running, restarting..."
        StartScript
    }
}
