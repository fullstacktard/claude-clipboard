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
} from "../ui.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to find AutoHotkey installation path
function findAutoHotkeyPath() {
  try {
    // Try common installation paths
    const commonPaths = [
      "C:\\Program Files\\AutoHotkey\\v2\\AutoHotkey.exe",
      "C:\\Program Files\\AutoHotkey\\AutoHotkey.exe",
      "C:\\Program Files (x86)\\AutoHotkey\\v2\\AutoHotkey.exe",
      "C:\\Program Files (x86)\\AutoHotkey\\AutoHotkey.exe",
    ];

    for (const ahkPath of commonPaths) {
      try {
        const result = execSync(
          `powershell.exe -Command "Test-Path '${ahkPath}'"`,
          { encoding: "utf8", stdio: "pipe" }
        ).trim();

        if (result === "True") {
          return ahkPath;
        }
      } catch {
        continue;
      }
    }

    // Try using Get-Command as fallback
    try {
      const ahkCheck = execSync(
        'powershell.exe -Command "Get-Command autohotkey -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source"',
        { encoding: "utf8", stdio: "pipe" }
      ).trim();

      if (ahkCheck && ahkCheck.includes("AutoHotkey")) {
        return ahkCheck;
      }
    } catch {
      // Ignore
    }

    return null;
  } catch {
    return null;
  }
}

// Helper function to check if AutoHotkey v2 is installed
function checkAutoHotkey() {
  const ahkPath = findAutoHotkeyPath();
  return ahkPath !== null;
}

// Helper function to download and install AutoHotkey v2
async function installAutoHotkey() {
  const spinner = createSpinner("Downloading AutoHotkey v2...");
  spinner.start();

  try {
    // Download URL for AutoHotkey v2 installer (using GitHub releases instead of main site)
    const ahkUrl = "https://github.com/AutoHotkey/AutoHotkey/releases/download/v2.0.18/AutoHotkey_2.0.18_setup.exe";
    const tempDir = execSync("cmd.exe /c echo %TEMP%", { encoding: "utf8" }).trim();
    const wslTempPath = execSync(`wslpath '${tempDir}'`, { encoding: "utf8" }).trim();
    const installerPath = path.join(wslTempPath, "AutoHotkey_v2_setup.exe");
    const winInstallerPath = execSync(`wslpath -w '${installerPath}'`, { encoding: "utf8" }).trim();

    // Download using PowerShell
    spinner.text = "Downloading AutoHotkey v2...";
    execSync(
      `powershell.exe -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '${ahkUrl}' -OutFile '${winInstallerPath}' -UseBasicParsing"`,
      { stdio: "pipe" }
    );

    spinner.text = "Installing AutoHotkey v2...";

    // Run installer silently (/S flag for silent install)
    execSync(`powershell.exe -Command "Start-Process '${winInstallerPath}' -ArgumentList '/S' -Wait"`, {
      stdio: "pipe",
    });

    // Wait a moment for installation to complete
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Verify installation
    if (checkAutoHotkey()) {
      spinner.succeed("AutoHotkey v2 installed successfully");
      return true;
    } else {
      spinner.warn("AutoHotkey v2 installation may have failed");
      return false;
    }
  } catch (error) {
    spinner.fail("Failed to install AutoHotkey v2");
    showError(`Error: ${error.message}`);
    return false;
  }
}

export async function install() {
  await showHeader("Claude Clipboard", "Smart clipboard paste for Claude Code");

  const homeDir = os.homedir();
  const installDir = path.join(homeDir, ".local/share/claude-clipboard");

  // Check if running in WSL
  const isWSL = fs.existsSync("/proc/version") &&
    fs.readFileSync("/proc/version", "utf8").toLowerCase().includes("microsoft");

  if (!isWSL) {
    showBox(
      `Not Running in WSL`,
      "This tool is designed for Windows Subsystem for Linux (WSL).\n\n" +
        "It requires WSL to bridge clipboard functionality between\n" +
        "Windows and Linux.",
      "error"
    );
    process.exit(1);
  }

  showSection("Installation Steps");

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

    // Update AutoHotkey script with correct WSL path
    const ahkScriptPath = path.join(ahkInstallDir, "claude-smart-paste.ahk");
    if (fs.existsSync(ahkScriptPath)) {
      let script = fs.readFileSync(ahkScriptPath, "utf8");
      // Replace the hardcoded path with the actual install path
      script = script.replace(
        /scriptPath := "\$HOME\/\.local\/share\/claude-clipboard\/claude-paste-image"/,
        `scriptPath := "${installDir}/claude-paste-image"`
      );
      fs.writeFileSync(ahkScriptPath, script);
    }
  } catch (error) {
    step3.fail("Failed to setup AutoHotkey scripts");
    showError(`Error: ${error.message}`);
    process.exit(1);
  }

  // Step 4: Check for AutoHotkey v2 and install if needed
  const step4 = createSpinner("Checking for AutoHotkey v2...");
  step4.start();

  let ahkInstalled = checkAutoHotkey();

  if (ahkInstalled) {
    step4.succeed("AutoHotkey v2 detected");
  } else {
    step4.stop();
    showInfo("AutoHotkey v2 not found - installing automatically...");

    ahkInstalled = await installAutoHotkey();

    if (!ahkInstalled) {
      showWarning("Could not auto-install AutoHotkey v2");
      showInfo("Please install manually from: https://www.autohotkey.com/");
    }
  }

  // Get Windows user profile path for next steps
  let windowsUserProfile;
  try {
    windowsUserProfile = execSync("cmd.exe /c echo %USERPROFILE%", { encoding: "utf8" }).trim();
  } catch {
    windowsUserProfile = "C:\\Users\\YourUsername";
  }

  const ahkInstallDir = path.join(
    execSync(`wslpath '${windowsUserProfile}'`, { encoding: "utf8" }).trim(),
    "AppData/Local/claude-clipboard"
  );

  // Step 5: Auto-start the clipboard monitor
  let monitorStarted = false;
  if (ahkInstalled) {
    const step5 = createSpinner("Starting clipboard monitor...");
    step5.start();

    try {
      const startScriptPath = path.join(ahkInstallDir, "start-smart-paste.ps1");
      const winScriptPath = execSync(`wslpath -w '${startScriptPath}'`, { encoding: "utf8" }).trim();

      execSync(
        `powershell.exe -ExecutionPolicy Bypass -File "${winScriptPath}"`,
        { stdio: "pipe" }
      );

      step5.succeed("Clipboard monitor started");
      monitorStarted = true;
    } catch (error) {
      step5.fail("Could not start clipboard monitor");
      showError(`Error: ${error.message}`);
      showInfo(`You can start it manually: cd "${windowsUserProfile}\\AppData\\Local\\claude-clipboard" && .\\start-smart-paste.ps1`);
    }
  }

  // Step 6: Configure auto-start on Windows login
  let autoStartConfigured = false;
  if (ahkInstalled) {
    const step6 = createSpinner("Configuring auto-start on login...");
    step6.start();

    try {
      const shortcutScriptPath = path.join(ahkInstallDir, "start-paste-shortcut.ps1");
      const winShortcutPath = execSync(`wslpath -w '${shortcutScriptPath}'`, { encoding: "utf8" }).trim();

      execSync(
        `powershell.exe -ExecutionPolicy Bypass -File "${winShortcutPath}"`,
        { stdio: "pipe" }
      );

      step6.succeed("Auto-start configured");
      autoStartConfigured = true;
    } catch (error) {
      step6.fail("Could not configure auto-start");
      showError(`Error: ${error.message}`);
    }
  }

  // Installation complete
  showSection("Installation Complete!");

  const isFullySetup = ahkInstalled && monitorStarted && autoStartConfigured;
  const needsManualSteps = !ahkInstalled || !monitorStarted;

  showBox(
    isFullySetup ? "✓ Installation Complete" : "Setup Complete",
    `${isFullySetup ? chalk.green.bold("Claude Clipboard is fully configured and running!") : chalk.yellow.bold("Claude Clipboard installation complete!")}

${chalk.bold("What's Configured:")}

${ahkInstalled ? chalk.green("✓") : chalk.yellow("!")} AutoHotkey v2 ${ahkInstalled ? "installed" : "needs manual installation"}
${monitorStarted ? chalk.green("✓") : chalk.yellow("!")} Clipboard monitor ${monitorStarted ? "started" : "not started"}
${autoStartConfigured ? chalk.green("✓") : chalk.yellow("!")} Auto-start on login ${autoStartConfigured ? "configured" : "not configured"}

${chalk.bold("Usage:")}

${chalk.white("1.")} Take screenshot ${chalk.dim("(Win+Shift+S)")}
${chalk.white("2.")} Press Ctrl+V in Claude Code
${chalk.white("3.")} Screenshot path appears automatically!

${chalk.bold("Installed Files:")}
${chalk.dim(installDir + "/")}
${chalk.dim(windowsUserProfile + "\\AppData\\Local\\claude-clipboard\\")}
${needsManualSteps ? `\n${chalk.yellow.bold("Next Steps:")}\n${!ahkInstalled ? chalk.white("Install AutoHotkey v2: https://www.autohotkey.com/\n") : ""}${!monitorStarted ? chalk.white(`Start monitor: cd "${windowsUserProfile}\\AppData\\Local\\claude-clipboard" && .\\start-smart-paste.ps1\n`) : ""}` : ""}`,
    isFullySetup ? "success" : "info"
  );
}
