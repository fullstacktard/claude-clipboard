#!/usr/bin/env node

import { showError } from "../lib/ui.js";
import { install } from "../lib/commands/install.js";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case "install":
      case undefined:
        await install();
        break;
      case "help":
      case "--help":
      case "-h":
        console.log(`
Claude Clipboard - Smart clipboard paste for Claude Code

Usage:
  claude-clipboard [install]  Install the clipboard integration
  claude-clipboard help       Show this help message

Examples:
  claude-clipboard            # Install (default action)
  claude-clipboard install    # Explicitly install

For more information, visit:
  https://github.com/fullstacktard/claude-clipboard
`);
        break;
      default:
        showError(`Unknown command: ${command}`);
        showError("Run 'claude-clipboard help' for usage information");
        process.exit(1);
    }
  } catch (error) {
    showError(`Error: ${error.message}`);
    if (process.env.DEBUG) {
      console.error(error);
    }
    process.exit(1);
  }
}

main();
