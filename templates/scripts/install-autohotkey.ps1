# Quick AutoHotkey v2 Installer

Write-Host "Installing AutoHotkey v2..."
Write-Host ""

$downloadUrl = "https://www.autohotkey.com/download/ahk-v2.exe"
$installerPath = "$env:TEMP\autohotkey-v2-setup.exe"

try {
    # Download
    Write-Host "Downloading AutoHotkey v2..."
    Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing

    # Run installer
    Write-Host "Running installer..."
    Write-Host "(Please follow the installation prompts)"
    Write-Host ""
    Start-Process -FilePath $installerPath -Wait

    # Clean up
    Remove-Item $installerPath -ErrorAction SilentlyContinue

    Write-Host ""
    Write-Host "Installation complete!"
    Write-Host ""
    Write-Host "Now run: powershell.exe -ExecutionPolicy Bypass -File 'C:\Users\fullstacktard\Documents\development\claude-code-notifier\start-paste-shortcut.ps1'"

} catch {
    Write-Host "ERROR: Failed to download or install AutoHotkey"
    Write-Host "Please install manually from: https://www.autohotkey.com/download/ahk-v2.exe"
}
