# Clipboard Image Watcher for Claude Code
# Automatically saves clipboard images when they change

# Get WSL home directory dynamically
$wslHome = (wsl bash -c 'echo $HOME' 2>$null).Trim()
if ([string]::IsNullOrEmpty($wslHome)) {
    Write-Error "Could not determine WSL home directory"
    exit 1
}
$cachePath = "\\wsl.localhost\Ubuntu$wslHome\.cache\claude-clipboard-images"
New-Item -ItemType Directory -Force -Path $cachePath | Out-Null

$imageCounter = 1
$lastImageHash = $null

Write-Host "Clipboard watcher started. Monitoring for images..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

while ($true) {
    try {
        $image = Get-Clipboard -Format Image -ErrorAction SilentlyContinue

        if ($image) {
            # Get hash of current image to detect changes
            $ms = New-Object System.IO.MemoryStream
            $image.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
            $imageBytes = $ms.ToArray()
            $ms.Close()

            $hash = [BitConverter]::ToString((New-Object System.Security.Cryptography.SHA256Managed).ComputeHash($imageBytes))

            # Only save if it's a new/different image
            if ($hash -ne $lastImageHash) {
                $filename = "image_$imageCounter.png"
                $fullPath = Join-Path $cachePath $filename
                $image.Save($fullPath, [System.Drawing.Imaging.ImageFormat]::Png)

                Write-Host "[Image $imageCounter] saved: $filename" -ForegroundColor Cyan
                $lastImageHash = $hash
                $imageCounter++
            }
        }

        Start-Sleep -Milliseconds 500
    }
    catch {
        # Ignore errors (clipboard might be locked, etc.)
        Start-Sleep -Milliseconds 500
    }
}
