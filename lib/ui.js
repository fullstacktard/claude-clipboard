import chalk from "chalk";
import ora from "ora";
import boxen from "boxen";
import figlet from "figlet";
import gradient from "gradient-string";

// Beautiful gradient themes - fst.wtf inspired
export const brandGradient = gradient(["#dc2626", "#ef4444", "#f87171"]); // Red theme
export const successGradient = gradient(["#10b981", "#34d399"]); // Green
export const infoGradient = gradient(["#dc2626", "#ef4444"]); // Red accent

// Beautiful spinner with custom text
export function createSpinner(text, type = "dots") {
  // Check if running in test environment or spinners should be suppressed
  const isTest = process.env.NODE_ENV === "test" || process.env.CI === "true" || process.env.SUPPRESS_SPINNER === "true";

  if (isTest) {
    // Return a mock spinner that doesn't output anything
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
    text: chalk.red(text),
    spinner: type,
    color: "red",
  });
  return spinner;
}

export function showSuccess(message) {
  console.log(chalk.green.bold(`✓ ${message}`));
}

export function showError(message) {
  console.log(chalk.red.bold(`✗ ${message}`));
}

export function showWarning(message) {
  console.log(chalk.yellow.bold(`! ${message}`));
}

export function showInfo(message) {
  console.log(chalk.white(`ℹ ${message}`));
}

// Beautiful header with ASCII art
export async function showHeader(title, subtitle = "") {
  return new Promise((resolve) => {
    figlet.text(
      title,
      {
        font: "ANSI Shadow",
        horizontalLayout: "fitted",
        verticalLayout: "default",
        width: 80,
        whitespaceBreak: true,
      },
      function (err, data) {
        if (!err && data) {
          console.log("\n" + chalk.hex("#dc2626")(data));
          if (subtitle) {
            console.log(chalk.white(subtitle));
          }
        } else {
          // Fallback to simple header if figlet fails
          console.log("\n" + chalk.hex("#dc2626").bold("═".repeat(60)));
          console.log(chalk.hex("#dc2626").bold(`  ${title}`));
          if (subtitle) {
            console.log(chalk.white(`  ${subtitle}`));
          }
          console.log(chalk.hex("#dc2626").bold("═".repeat(60)) + "\n");
        }
        resolve();
      }
    );
  });
}

// Beautiful box for important messages
export function showBox(title, content, type = "info") {
  const boxOptions = {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: type === "success" ? "green" : type === "error" ? "red" : "red",
    title: title,
    titleAlignment: "center",
  };

  console.log(boxen(content, boxOptions));
}

// Beautiful section headers
export function showSection(title) {
  console.log("\n" + chalk.bold(infoGradient(`▸ ${title}`)));
  console.log(chalk.dim("═".repeat(50)));
}
