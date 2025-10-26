import chalk from "chalk";
import ora from "ora";
import boxen from "boxen";

// Emoji sets
export const emojis = {
  check: "✅",
  cross: "❌",
  warning: "⚠️",
  info: "ℹ️",
  claude: "🤖",
  clipboard: "📋",
  image: "🖼️",
  sparkles: "✨",
  rocket: "🚀",
  config: "⚙️",
  keyboard: "⌨️",
  paste: "📁",
};

// Beautiful spinner
export function createSpinner(text, type = "dots") {
  const isTest = process.env.NODE_ENV === "test" || process.env.CI === "true";

  if (isTest) {
    return {
      start: () => {},
      succeed: () => {},
      fail: () => {},
      warn: () => {},
      info: () => {},
      stop: () => {},
      text: text,
    };
  }

  const spinner = ora({
    text: chalk.magenta(text),
    spinner: type,
    color: "magenta",
  });
  return spinner;
}

export function showSuccess(message, icon = emojis.check) {
  console.log(chalk.green.bold(`${icon} ${message}`));
}

export function showError(message, icon = emojis.cross) {
  console.log(chalk.red.bold(`${icon} ${message}`));
}

export function showWarning(message, icon = emojis.warning) {
  console.log(chalk.yellow.bold(`${icon} ${message}`));
}

export function showInfo(message, icon = emojis.info) {
  console.log(chalk.white(`${icon} ${message}`));
}

export function showHeader(title, subtitle = "") {
  console.log("\n" + chalk.magenta.bold("═".repeat(60)));
  console.log(chalk.magenta.bold(`  ${title}`));
  if (subtitle) {
    console.log(chalk.white(`  ${subtitle}`));
  }
  console.log(chalk.magenta.bold("═".repeat(60)) + "\n");
}

export function showBox(title, content, type = "info") {
  const boxOptions = {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: type === "success" ? "green" : type === "error" ? "red" : "magenta",
    title: title,
    titleAlignment: "center",
  };

  console.log(boxen(content, boxOptions));
}

export function showSection(title, emoji = emojis.sparkles) {
  console.log("\n" + chalk.bold.magenta(`${emoji} ${title}`));
  console.log(chalk.dim("─".repeat(50)));
}
