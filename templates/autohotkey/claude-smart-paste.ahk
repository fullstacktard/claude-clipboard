; Smart Ctrl+V for Claude Code
; Automatically pastes screenshots when Ctrl+V is pressed

#Requires AutoHotkey v2.0

; Show startup notification
TrayTip "Claude Code Clipboard", "Smart paste is active! Press Ctrl+V to paste screenshots.", 1

; Auto-hide notification after 3 seconds
SetTimer () => TrayTip(), -3000

; Only active in Windows Terminal (where Claude Code runs)
#HotIf WinActive("ahk_exe WindowsTerminal.exe") or WinActive("ahk_exe ubuntu.exe")

; Function to paste clipboard image
PasteClipboardImage() {
    ; Check if clipboard contains an image
    if DllCall("IsClipboardFormatAvailable", "uint", 2) ; CF_BITMAP = 2
    {
        try {
            ; Temp file for output
            tempFile := A_Temp . "\ahk-clipboard-result.txt"

            ; Delete old file
            if FileExist(tempFile)
                FileDelete(tempFile)

            ; Run WSL script and save output to file (use C:\ as working dir to avoid UNC path issues)
            ; Script path will be set during installation
            scriptPath := "$HOME/.local/share/claude-clipboard/claude-paste-image"
            RunWait('cmd.exe /c wsl bash -c "' . scriptPath . '" > "' . tempFile . '" 2>&1', "C:\", "Hide")

            ; Read result
            if FileExist(tempFile) {
                result := FileRead(tempFile)
                ; Remove all newlines, carriage returns, and trim whitespace
                result := StrReplace(result, "`r", "")
                result := StrReplace(result, "`n", "")
                result := Trim(result)
                FileDelete(tempFile)

                ; Check if we got a valid path
                if (result != "" and !InStr(result, "Error") and !InStr(result, "NONE") and !InStr(result, "No image")) {
                    ; Type the path followed by a space (no Enter)
                    SendText result . " "
                    return true
                }
            }
        }
        catch as err {
            ; Silently fail
        }
    }
    return false
}

; Ctrl+V
^v::
{
    if (!PasteClipboardImage()) {
        ; No image - do normal paste
        Send "^v"
    }
}

; Alt+V (same behavior)
!v::
{
    if (!PasteClipboardImage()) {
        ; No image - just send Alt+V
        Send "!v"
    }
}

#HotIf
