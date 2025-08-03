#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Function to check if git is initialized
function checkGitInitialized() {
  try {
    execSync("git status", { stdio: "ignore" });
    return true;
  } catch (error) {
    return false;
  }
}

// Function to get git status
function getGitStatus() {
  try {
    const status = execSync("git status --porcelain", { encoding: "utf8" });
    return status.trim();
  } catch (error) {
    return "";
  }
}

// Function to analyze file changes and generate meaningful descriptions
function analyzeFileChanges() {
  const status = getGitStatus();

  if (!status) {
    return { changes: {}, descriptions: {} };
  }

  const lines = status.split("\n").filter((line) => line.trim());
  const changes = {
    added: [],
    modified: [],
    deleted: [],
    renamed: [],
  };
  const descriptions = {};

  lines.forEach((line) => {
    const statusCode = line.substring(0, 2).trim();
    const fileName = line.substring(3);

    if (statusCode === "A" || statusCode === "A ") {
      changes.added.push(fileName);
      descriptions[fileName] = analyzeNewFile(fileName);
    } else if (statusCode === "M" || statusCode === " M") {
      changes.modified.push(fileName);
      descriptions[fileName] = analyzeModifiedFile(fileName);
    } else if (statusCode === "D" || statusCode === " D") {
      changes.deleted.push(fileName);
      descriptions[fileName] = "deleted file";
    } else if (statusCode === "R" || statusCode === "R ") {
      changes.renamed.push(fileName);
      descriptions[fileName] = "renamed file";
    }
  });

  return { changes, descriptions };
}

// Function to analyze what a new file contains
function analyzeNewFile(fileName) {
  try {
    const content = fs.readFileSync(fileName, "utf8");

    if (fileName.endsWith(".tsx") || fileName.endsWith(".jsx")) {
      if (
        content.includes("export default function") ||
        content.includes("export default class")
      ) {
        const componentName = fileName
          .split("/")
          .pop()
          .replace(/\.(tsx|jsx)$/, "");
        return `new React component: ${componentName}`;
      }
      return "new React component";
    }

    if (fileName.endsWith(".ts") || fileName.endsWith(".js")) {
      if (fileName.includes("config")) return "new configuration file";
      if (fileName.includes("script")) return "new utility script";
      return "new TypeScript/JavaScript file";
    }

    if (fileName.endsWith(".css")) return "new stylesheet";
    if (fileName.endsWith(".json")) return "new configuration";
    if (fileName.endsWith(".md")) return "new documentation";

    return "new file";
  } catch (error) {
    return "new file";
  }
}

// Function to analyze what changed in a modified file
function analyzeModifiedFile(fileName) {
  try {
    // Get the diff to see what actually changed
    const diff = execSync(`git diff --no-ext-diff ${fileName}`, {
      encoding: "utf8",
    });

    if (fileName.endsWith(".tsx") || fileName.endsWith(".jsx")) {
      if (diff.includes("className=")) return "update component styling";
      if (diff.includes("import ")) return "update component imports";
      if (diff.includes("export default")) return "update component structure";
      if (diff.includes("//") || diff.includes("/*"))
        return "update component comments";
      return "update React component";
    }

    if (fileName.endsWith(".json")) {
      if (diff.includes('"dependencies"')) return "update dependencies";
      if (diff.includes('"scripts"')) return "update npm scripts";
      return "update configuration";
    }

    if (fileName.endsWith(".css")) return "update styles";
    if (fileName.endsWith(".md")) return "update documentation";
    if (fileName.endsWith(".ts") || fileName.endsWith(".js"))
      return "update code logic";

    return "update file content";
  } catch (error) {
    return "update file";
  }
}

// Function to generate commit message based on changes
function generateCommitMessage() {
  const { changes, descriptions } = analyzeFileChanges();

  if (Object.keys(changes).length === 0) {
    return "No changes to commit";
  }

  let message = "";

  if (changes.added.length > 0) {
    message += `✨ Add ${changes.added.length} new file${
      changes.added.length > 1 ? "s" : ""
    }`;
    if (changes.added.length <= 2) {
      const fileDescriptions = changes.added
        .map((file) => descriptions[file])
        .join(", ");
      message += `: ${fileDescriptions}`;
    }
  }

  if (changes.modified.length > 0) {
    if (message) message += "\n";
    message += `🔧 Update ${changes.modified.length} file${
      changes.modified.length > 1 ? "s" : ""
    }`;
    if (changes.modified.length <= 2) {
      const fileDescriptions = changes.modified
        .map((file) => descriptions[file])
        .join(", ");
      message += `: ${fileDescriptions}`;
    }
  }

  if (changes.deleted.length > 0) {
    if (message) message += "\n";
    message += `🗑️ Remove ${changes.deleted.length} file${
      changes.deleted.length > 1 ? "s" : ""
    }`;
  }

  if (changes.renamed.length > 0) {
    if (message) message += "\n";
    message += `🔄 Rename ${changes.renamed.length} file${
      changes.renamed.length > 1 ? "s" : ""
    }`;
  }

  return message || "Update project files";
}

// Function to execute git workflow
function executeGitWorkflow() {
  console.log("🔍 Checking git status...");

  if (!checkGitInitialized()) {
    console.error("❌ Git repository not initialized.");
    console.log("💡 Run: git init");
    process.exit(1);
  }

  const status = getGitStatus();

  if (!status) {
    console.log("✅ No changes to commit");
    return;
  }

  console.log("📋 Changes detected:");
  console.log(status);
  console.log();

  try {
    // Stage all changes
    console.log("📦 Staging changes...");
    execSync("git add .", { stdio: "inherit" });

    // Generate and show commit message
    const commitMessage = generateCommitMessage();
    console.log(`💬 Commit message: ${commitMessage}`);

    // Commit changes
    console.log("💾 Committing changes...");
    execSync(`git commit -m "${commitMessage}"`, { stdio: "inherit" });

    // Push changes
    console.log("🚀 Pushing to remote...");
    execSync("git push", { stdio: "inherit" });

    console.log("✅ Git workflow completed successfully!");
  } catch (error) {
    console.error("❌ Error during git workflow:", error.message);
    process.exit(1);
  }
}

// Function to show help
function showHelp() {
  console.log(`
📝 Git Workflow Script

Usage: npm run git-workflow

This script will:
1. Check if git is initialized
2. Show current changes
3. Stage all changes (git add .)
4. Generate a descriptive commit message
5. Commit changes (git commit -m "...")
6. Push to remote (git push)

Options:
  --help, -h    Show this help message
  --dry-run     Show what would be done without executing
`);
}

// Main execution
function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    showHelp();
    return;
  }

  if (args.includes("--dry-run")) {
    console.log("🔍 Dry run mode - checking what would be done...");
    const status = getGitStatus();
    if (status) {
      console.log("📋 Changes that would be committed:");
      console.log(status);
      console.log(`💬 Commit message: ${generateCommitMessage()}`);
    } else {
      console.log("✅ No changes to commit");
    }
    return;
  }

  executeGitWorkflow();
}

main();
