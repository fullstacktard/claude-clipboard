import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");

describe("Package Structure", () => {
  it("should have package.json with correct bin entry", () => {
    const packageJson = JSON.parse(
      readFileSync(path.join(rootDir, "package.json"), "utf8")
    );
    expect(packageJson.bin).toBeDefined();
    expect(packageJson.bin["claude-clipboard"]).toBe("bin/claude-clipboard.js");
  });

  it("should have main entry point (index.js)", () => {
    expect(existsSync(path.join(rootDir, "index.js"))).toBe(true);
  });

  it("should have CLI entry point", () => {
    expect(existsSync(path.join(rootDir, "bin/claude-clipboard.js"))).toBe(true);
  });

  it("CLI entry point should be executable", () => {
    const cliPath = path.join(rootDir, "bin/claude-clipboard.js");
    const content = readFileSync(cliPath, "utf8");
    expect(content.startsWith("#!/usr/bin/env node")).toBe(true);
  });
});

describe("Template Files", () => {
  const templateDirs = [
    "templates/clipboard",
    "templates/autohotkey",
    "templates/assets",
  ];

  templateDirs.forEach((dir) => {
    it(`should have ${dir} directory`, () => {
      expect(existsSync(path.join(rootDir, dir))).toBe(true);
    });
  });

  it("should have clipboard scripts", () => {
    const clipboardScripts = [
      "claude-paste-image",
      "claude-paste-latest",
      "claude-paste-clear",
      "claude-paste-flush",
      "claude-paste-image-multi",
      "claude-paste-stage",
    ];

    clipboardScripts.forEach((script) => {
      const scriptPath = path.join(rootDir, "templates/clipboard", script);
      expect(existsSync(scriptPath)).toBe(true);
    });
  });

  it("should have AutoHotkey scripts", () => {
    const ahkScripts = [
      "claude-smart-paste.ahk",
      "start-smart-paste.ps1",
      "start-paste-shortcut.ps1",
    ];

    ahkScripts.forEach((script) => {
      const scriptPath = path.join(rootDir, "templates/autohotkey", script);
      expect(existsSync(scriptPath)).toBe(true);
    });
  });

  it("should have asset files", () => {
    const assets = ["claude-icon.png", "claude-icon.ico"];

    assets.forEach((asset) => {
      const assetPath = path.join(rootDir, "templates/assets", asset);
      expect(existsSync(assetPath)).toBe(true);
    });
  });
});

describe("Module Exports", () => {
  it("should export install function", async () => {
    const { install } = await import("../index.js");
    expect(install).toBeDefined();
    expect(typeof install).toBe("function");
  });

  it("should export UI utilities", async () => {
    const ui = await import("../index.js");
    expect(ui.showSuccess).toBeDefined();
    expect(ui.showError).toBeDefined();
    expect(ui.showWarning).toBeDefined();
    expect(ui.showInfo).toBeDefined();
    expect(ui.createSpinner).toBeDefined();
    expect(ui.emojis).toBeDefined();
  });
});
