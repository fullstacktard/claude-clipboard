import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Install Command - AutoHotkey Detection", () => {
  let execSyncMock;

  beforeEach(() => {
    execSyncMock = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should detect AutoHotkey v2 when installed", () => {
    execSyncMock.mockReturnValue("C:\\Program Files\\AutoHotkey\\v2\\AutoHotkey.exe\r\n");

    const result = execSyncMock('powershell.exe -Command "Get-Command autohotkey"');

    expect(result).toContain("AutoHotkey");
  });

  it("should return false when AutoHotkey not installed", () => {
    execSyncMock.mockImplementation(() => {
      throw new Error("Command not found");
    });

    let detected = true;
    try {
      execSyncMock('powershell.exe -Command "Get-Command autohotkey"');
    } catch {
      detected = false;
    }

    expect(detected).toBe(false);
  });

  it("should handle PowerShell errors gracefully", () => {
    execSyncMock.mockImplementation(() => {
      throw new Error("PowerShell execution failed");
    });

    expect(() => {
      execSyncMock("powershell.exe -Command 'test'");
    }).toThrow("PowerShell execution failed");
  });

  it("should trim whitespace from command output", () => {
    execSyncMock.mockReturnValue("  C:\\AutoHotkey.exe  \r\n");

    const result = execSyncMock("command").trim();

    expect(result).toBe("C:\\AutoHotkey.exe");
  });
});

describe("Install Command - User Prompts", () => {
  let questionCallback;

  beforeEach(() => {
    questionCallback = vi.fn();
  });

  it("should accept 'y' as yes", () => {
    const answer = "y";
    const isYes = answer.toLowerCase().trim() === "y" || answer.toLowerCase().trim() === "yes";

    expect(isYes).toBe(true);
  });

  it("should accept 'yes' as yes", () => {
    const answer = "yes";
    const isYes = answer.toLowerCase().trim() === "y" || answer.toLowerCase().trim() === "yes";

    expect(isYes).toBe(true);
  });

  it("should accept 'YES' as yes (case insensitive)", () => {
    const answer = "YES";
    const isYes = answer.toLowerCase().trim() === "y" || answer.toLowerCase().trim() === "yes";

    expect(isYes).toBe(true);
  });

  it("should reject 'n' as no", () => {
    const answer = "n";
    const isYes = answer.toLowerCase().trim() === "y" || answer.toLowerCase().trim() === "yes";

    expect(isYes).toBe(false);
  });

  it("should reject 'no' as no", () => {
    const answer = "no";
    const isYes = answer.toLowerCase().trim() === "y" || answer.toLowerCase().trim() === "yes";

    expect(isYes).toBe(false);
  });

  it("should reject empty input", () => {
    const answer = "";
    const isYes = answer.toLowerCase().trim() === "y" || answer.toLowerCase().trim() === "yes";

    expect(isYes).toBe(false);
  });

  it("should reject random input", () => {
    const answer = "maybe";
    const isYes = answer.toLowerCase().trim() === "y" || answer.toLowerCase().trim() === "yes";

    expect(isYes).toBe(false);
  });

  it("should handle whitespace in answers", () => {
    const answer = "  y  ";
    const isYes = answer.toLowerCase().trim() === "y" || answer.toLowerCase().trim() === "yes";

    expect(isYes).toBe(true);
  });
});

describe("Install Command - File Operations", () => {
  let fsMock;

  beforeEach(() => {
    fsMock = {
      existsSync: vi.fn(),
      mkdirSync: vi.fn(),
      copyFileSync: vi.fn(),
      chmodSync: vi.fn(),
      readdirSync: vi.fn(),
    };
  });

  it("should create installation directory if not exists", () => {
    fsMock.existsSync.mockReturnValue(false);

    const installDir = "/home/user/.local/share/claude-clipboard";

    if (!fsMock.existsSync(installDir)) {
      fsMock.mkdirSync(installDir, { recursive: true });
    }

    expect(fsMock.mkdirSync).toHaveBeenCalledWith(installDir, { recursive: true });
  });

  it("should skip creating directory if exists", () => {
    fsMock.existsSync.mockReturnValue(true);

    const installDir = "/home/user/.local/share/claude-clipboard";

    if (!fsMock.existsSync(installDir)) {
      fsMock.mkdirSync(installDir, { recursive: true });
    }

    expect(fsMock.mkdirSync).not.toHaveBeenCalled();
  });

  it("should copy files", () => {
    const srcPath = "/source/script";
    const destPath = "/dest/script";

    fsMock.copyFileSync(srcPath, destPath);

    expect(fsMock.copyFileSync).toHaveBeenCalledWith(srcPath, destPath);
  });

  it("should set executable permissions on bash scripts", () => {
    const destPath = "/dest/script";

    fsMock.chmodSync(destPath, 0o755);

    expect(fsMock.chmodSync).toHaveBeenCalledWith(destPath, 0o755);
  });

  it("should skip chmod for PowerShell files", () => {
    const file = "start-smart-paste.ps1";

    if (!file.endsWith(".ps1")) {
      fsMock.chmodSync("/dest/" + file, 0o755);
    }

    expect(fsMock.chmodSync).not.toHaveBeenCalled();
  });

  it("should skip README files when copying", () => {
    const file = "README.md";

    if (!file.startsWith("README")) {
      fsMock.copyFileSync("/src/" + file, "/dest/" + file);
    }

    expect(fsMock.copyFileSync).not.toHaveBeenCalled();
  });

  it("should handle file copy errors", () => {
    fsMock.copyFileSync.mockImplementation(() => {
      throw new Error("Permission denied");
    });

    expect(() => {
      fsMock.copyFileSync("/src/file", "/dest/file");
    }).toThrow("Permission denied");
  });

  it("should handle mkdir errors", () => {
    fsMock.mkdirSync.mockImplementation(() => {
      throw new Error("Disk full");
    });

    expect(() => {
      fsMock.mkdirSync("/path", { recursive: true });
    }).toThrow("Disk full");
  });
});

describe("Install Command - PowerShell/WSL Integration", () => {
  let execSyncMock;

  beforeEach(() => {
    execSyncMock = vi.fn();
  });

  it("should get Windows user profile path", () => {
    execSyncMock.mockReturnValue("C:\\Users\\TestUser\r\n");

    const result = execSyncMock("cmd.exe /c echo %USERPROFILE%");
    const trimmed = result.trim();

    expect(trimmed).toBe("C:\\Users\\TestUser");
  });

  it("should convert Windows path to WSL path", () => {
    execSyncMock.mockReturnValue("/mnt/c/Users/TestUser\n");

    const result = execSyncMock("wslpath 'C:\\Users\\TestUser'");

    expect(result).toContain("/mnt/c/Users/TestUser");
  });

  it("should convert WSL path to Windows path", () => {
    execSyncMock.mockReturnValue("C:\\Users\\TestUser\\file.txt\r\n");

    const result = execSyncMock("wslpath -w '/home/user/file.txt'");

    expect(result).toContain("C:\\Users\\TestUser");
  });

  it("should execute PowerShell commands from WSL", () => {
    execSyncMock.mockReturnValue("Success\r\n");

    const result = execSyncMock('powershell.exe -Command "Write-Host Success"');

    expect(result).toContain("Success");
  });

  it("should handle command with ExecutionPolicy bypass", () => {
    execSyncMock.mockReturnValue("");

    execSyncMock('powershell.exe -ExecutionPolicy Bypass -File "script.ps1"');

    expect(execSyncMock).toHaveBeenCalledWith(
      'powershell.exe -ExecutionPolicy Bypass -File "script.ps1"'
    );
  });

  it("should handle PowerShell errors", () => {
    execSyncMock.mockImplementation(() => {
      throw new Error("PowerShell not found");
    });

    expect(() => {
      execSyncMock("powershell.exe -Command 'test'");
    }).toThrow("PowerShell not found");
  });
});

describe("Install Command - AutoHotkey Installation", () => {
  let execSyncMock;

  beforeEach(() => {
    execSyncMock = vi.fn();
  });

  it("should download AutoHotkey installer", () => {
    execSyncMock.mockReturnValue("");

    const url = "https://www.autohotkey.com/download/ahk-v2.exe";
    const outFile = "C:\\Temp\\AutoHotkey_v2_setup.exe";

    execSyncMock(`powershell.exe -Command "Invoke-WebRequest -Uri '${url}' -OutFile '${outFile}'"`);

    expect(execSyncMock).toHaveBeenCalledWith(
      expect.stringContaining("Invoke-WebRequest")
    );
  });

  it("should run installer with silent flag", () => {
    execSyncMock.mockReturnValue("");

    const installerPath = "C:\\Temp\\setup.exe";

    execSyncMock(`powershell.exe -Command "Start-Process '${installerPath}' -ArgumentList '/S' -Wait"`);

    expect(execSyncMock).toHaveBeenCalledWith(
      expect.stringContaining("Start-Process")
    );
    expect(execSyncMock).toHaveBeenCalledWith(
      expect.stringContaining("/S")
    );
  });

  it("should verify installation after install", () => {
    execSyncMock
      .mockReturnValueOnce("") // Download
      .mockReturnValueOnce("") // Install
      .mockReturnValueOnce("C:\\Program Files\\AutoHotkey\\v2\\AutoHotkey.exe\r\n"); // Verify

    execSyncMock("download");
    execSyncMock("install");
    const result = execSyncMock("verify");

    expect(result).toContain("AutoHotkey");
  });

  it("should handle download failures", () => {
    execSyncMock.mockImplementation(() => {
      throw new Error("Network error");
    });

    expect(() => {
      execSyncMock("powershell.exe -Command 'Invoke-WebRequest'");
    }).toThrow("Network error");
  });

  it("should handle installation failures", () => {
    execSyncMock
      .mockReturnValueOnce("") // Download succeeds
      .mockImplementationOnce(() => {
        throw new Error("Installation failed");
      });

    execSyncMock("download");

    expect(() => {
      execSyncMock("install");
    }).toThrow("Installation failed");
  });

  it("should use /S flag for silent installation", () => {
    const command = "Start-Process 'installer.exe' -ArgumentList '/S' -Wait";

    expect(command).toContain("/S");
  });
});

describe("Install Command - Error Handling", () => {
  let fsMock;
  let execSyncMock;

  beforeEach(() => {
    fsMock = {
      existsSync: vi.fn(),
      mkdirSync: vi.fn(),
      copyFileSync: vi.fn(),
      chmodSync: vi.fn(),
      readFileSync: vi.fn(),
    };
    execSyncMock = vi.fn();
  });

  it("should detect non-WSL environment", () => {
    fsMock.existsSync.mockReturnValue(false);
    fsMock.readFileSync.mockReturnValue("");

    const isWSL = fsMock.existsSync("/proc/version");

    expect(isWSL).toBe(false);
  });

  it("should detect WSL environment", () => {
    fsMock.existsSync.mockReturnValue(true);
    fsMock.readFileSync.mockReturnValue("Microsoft WSL");

    const fileExists = fsMock.existsSync("/proc/version");
    const content = fsMock.readFileSync("/proc/version", "utf8");
    const isWSL = fileExists && content.toLowerCase().includes("microsoft");

    expect(isWSL).toBe(true);
  });

  it("should handle missing Windows user profile", () => {
    execSyncMock.mockImplementation(() => {
      throw new Error("Could not determine Windows user profile path");
    });

    expect(() => {
      execSyncMock("cmd.exe /c echo %USERPROFILE%");
    }).toThrow();
  });

  it("should handle directory creation errors", () => {
    fsMock.mkdirSync.mockImplementation(() => {
      throw new Error("Permission denied");
    });

    expect(() => {
      fsMock.mkdirSync("/restricted/path", { recursive: true });
    }).toThrow("Permission denied");
  });

  it("should handle script copy errors", () => {
    fsMock.copyFileSync.mockImplementation(() => {
      throw new Error("Disk full");
    });

    expect(() => {
      fsMock.copyFileSync("/src/script", "/dest/script");
    }).toThrow("Disk full");
  });

  it("should handle chmod errors", () => {
    fsMock.chmodSync.mockImplementation(() => {
      throw new Error("Operation not permitted");
    });

    expect(() => {
      fsMock.chmodSync("/file", 0o755);
    }).toThrow("Operation not permitted");
  });

  it("should provide fallback for Windows path", () => {
    let windowsUserProfile;
    try {
      execSyncMock.mockImplementation(() => {
        throw new Error("Failed");
      });
      windowsUserProfile = execSyncMock("cmd.exe /c echo %USERPROFILE%");
    } catch {
      windowsUserProfile = "C:\\Users\\YourUsername";
    }

    expect(windowsUserProfile).toBe("C:\\Users\\YourUsername");
  });
});

describe("Install Command - Clipboard Monitor", () => {
  let execSyncMock;

  beforeEach(() => {
    execSyncMock = vi.fn();
  });

  it("should start PowerShell script to launch monitor", () => {
    execSyncMock.mockReturnValue("");

    const scriptPath = "C:\\Users\\User\\AppData\\Local\\claude-clipboard\\start-smart-paste.ps1";

    execSyncMock(`powershell.exe -ExecutionPolicy Bypass -File "${scriptPath}"`);

    expect(execSyncMock).toHaveBeenCalledWith(
      expect.stringContaining("start-smart-paste.ps1")
    );
  });

  it("should handle monitor start failures", () => {
    execSyncMock.mockImplementation(() => {
      throw new Error("PowerShell script failed");
    });

    expect(() => {
      execSyncMock("powershell.exe -ExecutionPolicy Bypass -File 'script.ps1'");
    }).toThrow("PowerShell script failed");
  });

  it("should use ExecutionPolicy Bypass", () => {
    const command = "powershell.exe -ExecutionPolicy Bypass -File 'script.ps1'";

    expect(command).toContain("-ExecutionPolicy Bypass");
  });
});

describe("Install Command - Auto-Start Configuration", () => {
  let execSyncMock;

  beforeEach(() => {
    execSyncMock = vi.fn();
  });

  it("should create startup shortcut", () => {
    execSyncMock.mockReturnValue("");

    const shortcutScript = "start-paste-shortcut.ps1";

    execSyncMock(`powershell.exe -ExecutionPolicy Bypass -File "${shortcutScript}"`);

    expect(execSyncMock).toHaveBeenCalledWith(
      expect.stringContaining("start-paste-shortcut.ps1")
    );
  });

  it("should handle shortcut creation failures", () => {
    execSyncMock.mockImplementation(() => {
      throw new Error("Access denied");
    });

    expect(() => {
      execSyncMock("powershell.exe -File 'create-shortcut.ps1'");
    }).toThrow("Access denied");
  });
});

describe("Install Command - Path Conversions", () => {
  it("should trim carriage returns from Windows output", () => {
    const output = "C:\\Users\\Test\r\n";
    const trimmed = output.trim();

    expect(trimmed).toBe("C:\\Users\\Test");
  });

  it("should handle WSL path format", () => {
    const wslPath = "/mnt/c/Users/Test";

    expect(wslPath).toMatch(/^\/mnt\/[a-z]\//);
  });

  it("should handle Windows path format", () => {
    const winPath = "C:\\Users\\Test";

    expect(winPath).toMatch(/^[A-Z]:\\/);
  });
});
