# claude-clipboard

**stop manually saving screenshots. just hit Ctrl+V and the path appears in Claude Code.**

![Demo](https://vhs.charm.sh/vhs-6HA3PYFYbXEIN4hp5WdaWw.gif)

sick of doing Win+Shift+S, then Save As, then typing the path? me too. this intercepts Ctrl+V in Windows Terminal, auto-saves your clipboard screenshot to WSL, and pastes the path into Claude Code.

## what this does

- **Win+Shift+S** to screenshot
- **Ctrl+V** in Claude Code
- screenshot path appears automatically
- **images saved** to `~/.cache/claude-clipboard-images/`

basically: no more Save As dialog hell. paste screenshots like you paste text.

## installation

```bash
npm install -g claude-clipboard
claude-clipboard install
```

that's it. installer sets up AutoHotkey scripts on Windows, bash scripts in WSL, and starts the clipboard monitor. auto-starts on Windows login.

## requirements

- Windows Terminal + WSL (Ubuntu/Debian)
- Claude Code installed
- Node.js 18+
- AutoHotkey v2 (installer handles this)

if you're not using Windows Terminal or Ubuntu.exe, this won't work. PRs welcome but I use Windows Terminal.

## troubleshooting

if something's not working, check [the troubleshooting guide](https://github.com/fullstacktard/claude-clipboard-public#readme).

## license

MIT

---

*built by [@fullstacktard](https://github.com/fullstacktard) because Save As dialogs are productivity cancer*
