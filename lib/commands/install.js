import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import os from "os";
import { fileURLToPath } from "url";
import chalk from "chalk";
import {
  showHeader,
  showSection,
  showError,
  showWarning,
  showInfo,
  showSuccess,
  showBox,
  createSpinner,
  emojis,
} from "../ui.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function install() {
  showHeader("Claude Clipboard Installer", "Smart clipboard paste for Claude Code");

  const homeDir = os.homedir();
  const installDir = path.join(homeDir, ".local/share/claude-clipboard");

  // Check if running in WSL
  const isWSL = fs.existsSync("/proc/version") &&
    fs.readFileSync("/proc/version", "utf8").toLowerCase().includes("microsoft");

  if (!isWSL) {
    showBox(
      `${emojis.warning} Not Running in WSL`,
      "This tool is designed for Windows Subsystem for Linux (WSL).\n\n" +
        "It requires WSL to bridge clipboard functionality between\n" +
        "Windows and Linux.",
      "error"
    );
    process.exit(1);
  }

  showSection("Installation Steps", emojis.rocket);

  // Step 1: Create installation directory
  const step1 = createSpinner("Creating installation directory...");
  step1.start();

  try {
    if (!fs.existsSync(installDir)) {
      fs.mkdirSync(installDir, { recursive: true });
    }
    step1.succeed("Installation directory created");
  } catch (error) {
    step1.fail("Failed to create installation directory");
    showError(`Error: ${error.message}`);
    process.exit(1);
  }

  // Step 2: Copy clipboard scripts
  const step2 = createSpinner("Copying clipboard scripts...");
  step2.start();

  try {
    const clipboardTemplatesDir = path.join(__dirname, "../../templates/clipboard");
    const files = fs.readdirSync(clipboardTemplatesDir);

    for (const file of files) {
      const srcPath = path.join(clipboardTemplatesDir, file);
      const destPath = path.join(installDir, file);

      // Skip README files
      if (file.startsWith("README")) continue;

      fs.copyFileSync(srcPath, destPath);

      // Make scripts executable (excluding .ps1 files)
      if (!file.endsWith(".ps1")) {
        fs.chmodSync(destPath, 0o755);
      }
    }

    step2.succeed("Copied clipboard scripts");
  } catch (error) {
    step2.fail("Failed to copy clipboard scripts");
    showError(`Error: ${error.message}`);
    process.exit(1);
  }

  // Step 3: Copy AutoHotkey scripts to Windows location
  const step3 = createSpinner("Setting up AutoHotkey scripts...");
  step3.start();

  try {
    // Determine Windows user profile path
    let windowsUserProfile;
    try {
      windowsUserProfile = execSync("cmd.exe /c echo %USERPROFILE%", { encoding: "utf8" }).trim();
      // Convert Windows path to WSL path
      windowsUserProfile = execSync(`wslpath '${windowsUserProfile}'`, { encoding: "utf8" }).trim();
    } catch (error) {
      throw new Error("Could not determine Windows user profile path");
    }

    const ahkInstallDir = path.join(windowsUserProfile, "AppData/Local/claude-clipboard");

    if (!fs.existsSync(ahkInstallDir)) {
      fs.mkdirSync(ahkInstallDir, { recursive: true });
    }

    const ahkTemplatesDir = path.join(__dirname, "../../templates/autohotkey");
    const ahkFiles = fs.readdirSync(ahkTemplatesDir);

    for (const file of ahkFiles) {
      const srcPath = path.join(ahkTemplatesDir, file);
      const destPath = path.join(ahkInstallDir, file);
      fs.copyFileSync(srcPath, destPath);
    }

    step3.succeed("AutoHotkey scripts copied to Windows");

    // Update PowerShell script with correct WSL path
    const startScriptPath = path.join(ahkInstallDir, "start-smart-paste.ps1");
    if (fs.existsSync(startScriptPath)) {
      let script = fs.readFileSync(startScriptPath, "utf8");
      script = script.replace(
        /\$wslScriptPath = .*/,
        `$wslScriptPath = "${installDir}/claude-paste-image"`
      );
      fs.writeFileSync(startScriptPath, script);
    }
  } catch (error) {
    step3.fail("Failed to setup AutoHotkey scripts");
    showError(`Error: ${error.message}`);
    process.exit(1);
  }

  // Step 4: Check for AutoHotkey v2
  const step4 = createSpinner("Checking for AutoHotkey v2...");
  step4.start();

  try {
    const ahkCheck = execSync("powershell.exe -Command \"Get-Command autohotkey -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source\"", {
      encoding: "utf8",
      stdio: "pipe"
    }).trim();

    if (ahkCheck && ahkCheck.includes("AutoHotkey")) {
      step4.succeed("AutoHotkey v2 detected");
    } else {
      step4.warn("AutoHotkey v2 not found - manual installation required");
    }
  } catch (error) {
    step4.warn("AutoHotkey v2 not found - manual installation required");
  }

  // Installation complete
  showSection("Installation Complete!", emojis.sparkles);

  // Get Windows path for instructions
  let windowsUserProfile;
  try {
    windowsUserProfile = execSync("cmd.exe /c echo %USERPROFILE%", { encoding: "utf8" }).trim();
  } catch {
    windowsUserProfile = "C:\\Users\\YourUsername";
  }

  showBox(
    `${emojis.check} Setup Complete`,
    `Claude Clipboard has been installed successfully!

${chalk.bold("Before You Can Use It:")}

1. ${chalk.magenta("Install AutoHotkey v2 (if not already installed):")}
   ${chalk.white("Download from: https://www.autohotkey.com/")}

2. ${chalk.magenta("Start the clipboard monitor (in Windows PowerShell):")}
   ${chalk.white(`cd "${windowsUserProfile}\\\\AppData\\\\Local\\\\claude-clipboard"`)}
   ${chalk.white(".\\\\start-smart-paste.ps1")}

${chalk.bold("How to Use:")}

1. Take a screenshot (Win+Shift+S)
2. Open Claude Code in Windows Terminal
3. Press Ctrl+V
4. Screenshot path appears automatically!

${chalk.bold("Installed Files:")}
${chalk.dim(`  WSL:     ${installDir}/`)}
${chalk.dim(`  Windows: ${windowsUserProfile}\\AppData\\Local\\claude-clipboard\\`)}

${chalk.bold("Optional - Auto-start on Windows login:")}
Run this in PowerShell (as Administrator):
${chalk.white(`  cd "${windowsUserProfile}\\\\AppData\\\\Local\\\\claude-clipboard"`)}
${chalk.white("  .\\\\start-paste-shortcut.ps1")}

For troubleshooting, see:
${chalk.magenta("https://github.com/fullstacktard/claude-clipboard#readme")}`,
    "success"
  );
}
