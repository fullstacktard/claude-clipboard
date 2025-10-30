# Manually start the clipboard monitor
# This will keep the AutoHotkey script running and auto-restart it if it crashes

$ErrorActionPreference = "SilentlyContinue"

# Path to monitor script
$monitorScriptPath = "\\wsl.localhost\Ubuntu\home\fullstacktard\development\claude-wsl\monitor-smart-paste.ps1"

# Kill any existing monitor processes
Get-CimInstance Win32_Process -Filter "name = 'powershell.exe'" | Where-Object {
    $_.CommandLine -like "*monitor-smart-paste.ps1*"
} | ForEach-Object {
    try {
        Stop-Process -Id $_.ProcessId -Force
        Write-Host "Stopped existing monitor process (PID: $($_.ProcessId))"
    } catch {}
}

Start-Sleep -Milliseconds 500

# Start monitor in hidden window
Start-Process powershell.exe -ArgumentList "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$monitorScriptPath`"" -WindowStyle Hidden

Write-Host "Monitor started successfully!"
Write-Host "The monitor will:"
Write-Host "  - Keep claude-smart-paste.ahk running"
Write-Host "  - Auto-restart it every 5 minutes if it crashes"
Write-Host "  - Run silently in the background"
Write-Host ""
Write-Host "To stop the monitor, kill the PowerShell process running monitor-smart-paste.ps1"
