#!/usr/bin/env node

import chalk from "chalk";
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
${chalk.red.bold("Claude Clipboard")} ${chalk.white("- Smart clipboard paste for Claude Code")}

${chalk.red.bold("Usage:")}
  ${chalk.white("claude-clipboard")} ${chalk.gray("[install]")}  ${chalk.dim("Install the clipboard integration")}
  ${chalk.white("claude-clipboard install")}    ${chalk.dim("Install the clipboard integration")}
  ${chalk.white("claude-clipboard help")}       ${chalk.dim("Show this help message")}

${chalk.red.bold("Examples:")}
  ${chalk.white("claude-clipboard")}            ${chalk.dim("# Install (default action)")}
  ${chalk.white("claude-clipboard install")}    ${chalk.dim("# Explicitly install")}

${chalk.red.bold("For more information, visit:")}
  ${chalk.cyan("https://github.com/fullstacktard/claude-clipboard")}
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
