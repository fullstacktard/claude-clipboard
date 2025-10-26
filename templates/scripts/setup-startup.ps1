# Setup Claude Smart Paste to run on startup

$monitorScript = "\\wsl.localhost\Ubuntu\home\fullstacktard\development\claude-wsl\scripts\monitor-smart-paste.ps1"
$vbsPath = Join-Path $env:TEMP 'start-claude-monitor.vbs'
$startupFolder = [Environment]::GetFolderPath('Startup')
$shortcutPath = Join-Path $startupFolder 'Claude-Smart-Paste.lnk'

Write-Host "Setting up Claude Smart Paste startup..."
Write-Host ""

# Create VBS launcher (runs hidden)
$vbsContent = @"
Set objShell = CreateObject("WScript.Shell")
objShell.Run "powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File ""$monitorScript"" ", 0, False
"@

Set-Content -Path $vbsPath -Value $vbsContent -Encoding ASCII
Write-Host "[OK] Created VBS launcher at: $vbsPath"

# Create shortcut in startup folder
$WScriptShell = New-Object -ComObject WScript.Shell
$Shortcut = $WScriptShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = "wscript.exe"
$Shortcut.Arguments = """$vbsPath"""
$Shortcut.WindowStyle = 7
$Shortcut.Description = "Claude Smart Paste Monitor"
$Shortcut.Save()

Write-Host "[OK] Created startup shortcut at: $shortcutPath"
Write-Host ""
Write-Host "Claude Smart Paste will now start automatically on login!"
Write-Host "Starting it now..."

# Start it immediately
Start-Process -FilePath "wscript.exe" -ArgumentList """$vbsPath""" -WindowStyle Hidden

Start-Sleep -Seconds 2

# Verify it's running
$running = Get-Process | Where-Object {
    $_.ProcessName -eq 'AutoHotkey64' -or $_.ProcessName -eq 'AutoHotkey'
} | Where-Object {
    $_.CommandLine -like '*claude-smart-paste*'
}

if ($running) {
    Write-Host "[SUCCESS] Claude Smart Paste is now running!"
} else {
    Write-Host "[WARNING] Could not verify if script started. Check if AutoHotkey is installed."
}
