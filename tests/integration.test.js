import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

/**
 * Integration Tests - These tests run REAL commands and make REAL system changes
 *
 * Requirements:
 * - Must be run on WSL (Windows Subsystem for Linux)
 * - PowerShell must be accessible (powershell.exe)
 * - Will create actual files and directories
 * - May download and install AutoHotkey v2
 */

const homeDir = os.homedir();
const testInstallDir = path.join(homeDir, ".local/share/claude-clipboard-test");

describe("Integration Tests - System Requirements", () => {
  it("should be running on WSL", () => {
    const isWSL = fs.existsSync("/proc/version") &&
      fs.readFileSync("/proc/version", "utf8").toLowerCase().includes("microsoft");

    expect(isWSL).toBe(true);
  });

  it("should have PowerShell available", () => {
    let hasPowerShell = false;

    try {
      const result = execSync("powershell.exe -Command 'Write-Host test'", {
        encoding: "utf8",
        stdio: "pipe"
      });
      hasPowerShell = result.includes("test");
    } catch {
      hasPowerShell = false;
    }

    expect(hasPowerShell).toBe(true);
  });

  it("should be able to get Windows user profile", () => {
    let hasUserProfile = false;

    try {
      const result = execSync("cmd.exe /c echo %USERPROFILE%", {
        encoding: "utf8"
      }).trim();
      hasUserProfile = result.includes(":\\Users\\");
    } catch {
      hasUserProfile = false;
    }

    expect(hasUserProfile).toBe(true);
  });

  it("should be able to convert paths with wslpath", () => {
    let canConvert = false;

    try {
      const winPath = "C:\\Windows";
      const result = execSync(`wslpath '${winPath}'`, {
        encoding: "utf8"
      }).trim();
      canConvert = result.startsWith("/mnt/c/");
    } catch {
      canConvert = false;
    }

    expect(canConvert).toBe(true);
  });
});

describe("Integration Tests - AutoHotkey Detection", () => {
  it("should detect if AutoHotkey v2 is installed", () => {
    let ahkInstalled = false;

    try {
      const ahkCheck = execSync(
        'powershell.exe -Command "Get-Command autohotkey -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source"',
        { encoding: "utf8", stdio: "pipe" }
      ).trim();

      ahkInstalled = ahkCheck && ahkCheck.includes("AutoHotkey");
    } catch {
      ahkInstalled = false;
    }

    // This test documents whether AHK is installed, doesn't fail either way
    console.log(`AutoHotkey v2 installed: ${ahkInstalled}`);
    expect(typeof ahkInstalled).toBe("boolean");
  });
});

describe("Integration Tests - File Operations", () => {
  beforeAll(() => {
    // Clean up test directory if it exists
    if (fs.existsSync(testInstallDir)) {
      fs.rmSync(testInstallDir, { recursive: true, force: true });
    }
  });

  afterAll(() => {
    // Clean up after tests
    if (fs.existsSync(testInstallDir)) {
      fs.rmSync(testInstallDir, { recursive: true, force: true });
    }
  });

  it("should create installation directory", () => {
    fs.mkdirSync(testInstallDir, { recursive: true });

    expect(fs.existsSync(testInstallDir)).toBe(true);
  });

  it("should copy template files", () => {
    const srcFile = path.join(process.cwd(), "templates/clipboard/claude-paste-image");
    const destFile = path.join(testInstallDir, "claude-paste-image");

    expect(fs.existsSync(srcFile)).toBe(true);

    fs.copyFileSync(srcFile, destFile);

    expect(fs.existsSync(destFile)).toBe(true);
  });

  it("should make bash scripts executable", () => {
    const scriptPath = path.join(testInstallDir, "claude-paste-image");

    fs.chmodSync(scriptPath, 0o755);

    const stats = fs.statSync(scriptPath);
    const isExecutable = (stats.mode & 0o100) !== 0;

    expect(isExecutable).toBe(true);
  });

  it("should be able to read copied files", () => {
    const scriptPath = path.join(testInstallDir, "claude-paste-image");
    const content = fs.readFileSync(scriptPath, "utf8");

    expect(content).toContain("#!/bin/bash");
  });
});

describe("Integration Tests - Windows File Operations", () => {
  let windowsUserProfile;
  let ahkInstallDir;

  beforeAll(() => {
    try {
      windowsUserProfile = execSync("cmd.exe /c echo %USERPROFILE%", {
        encoding: "utf8"
      }).trim();
      const wslPath = execSync(`wslpath '${windowsUserProfile}'`, {
        encoding: "utf8"
      }).trim();
      ahkInstallDir = path.join(wslPath, "AppData/Local/claude-clipboard-test");

      // Clean up test directory
      if (fs.existsSync(ahkInstallDir)) {
        fs.rmSync(ahkInstallDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.error("Could not setup Windows test directory:", error.message);
    }
  });

  afterAll(() => {
    // Clean up Windows test directory
    if (ahkInstallDir && fs.existsSync(ahkInstallDir)) {
      fs.rmSync(ahkInstallDir, { recursive: true, force: true });
    }
  });

  it("should create directory in Windows AppData", () => {
    expect(ahkInstallDir).toBeDefined();

    fs.mkdirSync(ahkInstallDir, { recursive: true });

    expect(fs.existsSync(ahkInstallDir)).toBe(true);
  });

  it("should copy AutoHotkey scripts to Windows location", () => {
    const srcFile = path.join(process.cwd(), "templates/autohotkey/claude-smart-paste.ahk");
    const destFile = path.join(ahkInstallDir, "claude-smart-paste.ahk");

    expect(fs.existsSync(srcFile)).toBe(true);

    fs.copyFileSync(srcFile, destFile);

    expect(fs.existsSync(destFile)).toBe(true);
  });

  it("should be able to access Windows file from WSL", () => {
    const ahkScript = path.join(ahkInstallDir, "claude-smart-paste.ahk");
    const content = fs.readFileSync(ahkScript, "utf8");

    expect(content).toContain("#Requires AutoHotkey v2.0");
  });
});

describe("Integration Tests - PowerShell Script Execution", () => {
  it("should execute simple PowerShell command", () => {
    const result = execSync('powershell.exe -Command "Write-Host Hello"', {
      encoding: "utf8",
      stdio: "pipe"
    }).trim();

    expect(result).toContain("Hello");
  });

  it("should check clipboard format availability", () => {
    // This tests the PowerShell command used to check for images in clipboard
    const command = 'powershell.exe -Command "Add-Type -AssemblyName System.Windows.Forms; Write-Host ([System.Windows.Forms.Clipboard]::ContainsImage())"';

    const result = execSync(command, {
      encoding: "utf8",
      stdio: "pipe"
    }).trim();

    // Result should be either "True" or "False"
    expect(["True", "False"]).toContain(result);
  });

  it("should execute PowerShell scripts without errors", () => {
    const testScript = `exit 0`;

    const tempScript = path.join(os.tmpdir(), "test-script.ps1");
    fs.writeFileSync(tempScript, testScript);

    const winScriptPath = execSync(`wslpath -w '${tempScript}'`, {
      encoding: "utf8"
    }).trim();

    // Should not throw
    expect(() => {
      execSync(`powershell.exe -ExecutionPolicy Bypass -File "${winScriptPath}"`, {
        encoding: "utf8",
        stdio: "pipe"
      });
    }).not.toThrow();

    fs.unlinkSync(tempScript);
  });
});

describe("Integration Tests - Template Files Validation", () => {
  it("should have all required clipboard scripts", () => {
    const requiredScripts = [
      "claude-paste-image",
      "claude-paste-latest",
      "claude-paste-clear",
      "claude-paste-flush",
      "claude-paste-image-multi",
      "claude-paste-stage",
    ];

    requiredScripts.forEach(script => {
      const scriptPath = path.join(process.cwd(), "templates/clipboard", script);
      expect(fs.existsSync(scriptPath)).toBe(true);
    });
  });

  it("should have all required AutoHotkey scripts", () => {
    const requiredScripts = [
      "claude-smart-paste.ahk",
      "start-smart-paste.ps1",
      "start-paste-shortcut.ps1",
    ];

    requiredScripts.forEach(script => {
      const scriptPath = path.join(process.cwd(), "templates/autohotkey", script);
      expect(fs.existsSync(scriptPath)).toBe(true);
    });
  });

  it("should have valid bash shebang in clipboard scripts", () => {
    const scripts = [
      "claude-paste-image",
      "claude-paste-latest",
      "claude-paste-clear",
    ];

    scripts.forEach(script => {
      const scriptPath = path.join(process.cwd(), "templates/clipboard", script);
      const content = fs.readFileSync(scriptPath, "utf8");
      expect(content.startsWith("#!/bin/bash")).toBe(true);
    });
  });
});

describe("Integration Tests - Path Conversion", () => {
  it("should convert Windows path to WSL path", () => {
    const winPath = "C:\\Windows\\System32";
    const wslPath = execSync(`wslpath '${winPath}'`, {
      encoding: "utf8"
    }).trim();

    expect(wslPath).toBe("/mnt/c/Windows/System32");
  });

  it("should convert WSL path to Windows path", () => {
    const wslPath = "/mnt/c/Users";
    const winPath = execSync(`wslpath -w '${wslPath}'`, {
      encoding: "utf8"
    }).trim();

    expect(winPath).toMatch(/^C:\\Users/);
  });

  it("should handle paths with spaces", () => {
    const testPath = "/mnt/c/Program Files";
    const winPath = execSync(`wslpath -w '${testPath}'`, {
      encoding: "utf8"
    }).trim();

    expect(winPath).toContain("Program Files");
  });
});

describe("Integration Tests - Clipboard Cache Directory", () => {
  const cacheDir = path.join(homeDir, ".cache/claude-clipboard-images-test");

  beforeAll(() => {
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true });
    }
  });

  it("should create cache directory", () => {
    fs.mkdirSync(cacheDir, { recursive: true });

    expect(fs.existsSync(cacheDir)).toBe(true);
  });

  it("should be able to write files to cache", () => {
    const testFile = path.join(cacheDir, "test-image.png");
    fs.writeFileSync(testFile, "test content");

    expect(fs.existsSync(testFile)).toBe(true);
  });

  it("should be able to delete cache files", () => {
    const files = fs.readdirSync(cacheDir);

    files.forEach(file => {
      fs.unlinkSync(path.join(cacheDir, file));
    });

    const remainingFiles = fs.readdirSync(cacheDir);
    expect(remainingFiles.length).toBe(0);
  });
});
