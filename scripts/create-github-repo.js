#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Read package.json to get app name
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const appName = packageJson.name;

// Get current directory name as fallback
const currentDir = path.basename(process.cwd());

// Function to check if GitHub CLI is installed
function checkGitHubCLI() {
  try {
    execSync("gh --version", { stdio: "ignore" });
    return true;
  } catch (error) {
    return false;
  }
}

// Function to check if user is authenticated with GitHub CLI
function checkGitHubAuth() {
  try {
    execSync("gh auth status", { stdio: "ignore" });
    return true;
  } catch (error) {
    return false;
  }
}

// Function to create GitHub repository
function createGitHubRepo() {
  const repoName = appName || currentDir;

  console.log(`🚀 Creating GitHub repository: ${repoName}`);

  try {
    // Create the repository
    execSync(
      `gh repo create ${repoName} --public --source=. --remote=origin --push`,
      {
        stdio: "inherit",
      }
    );

    console.log(
      `✅ Successfully created GitHub repository: https://github.com/YOUR_USERNAME/${repoName}`
    );
    console.log(
      `📝 Don't forget to update the README.md with your project description!`
    );
  } catch (error) {
    console.error("❌ Failed to create GitHub repository:", error.message);
    console.log("\n💡 Make sure you:");
    console.log("   1. Have GitHub CLI installed (gh)");
    console.log("   2. Are authenticated with GitHub CLI (gh auth login)");
    console.log("   3. Have git initialized in this directory");
  }
}

// Main execution
function main() {
  console.log("🔍 Checking prerequisites...");

  if (!checkGitHubCLI()) {
    console.error("❌ GitHub CLI (gh) is not installed.");
    console.log("📦 Install it from: https://cli.github.com/");
    process.exit(1);
  }

  if (!checkGitHubAuth()) {
    console.error("❌ You are not authenticated with GitHub CLI.");
    console.log("🔐 Run: gh auth login");
    process.exit(1);
  }

  // Check if git is initialized
  if (!fs.existsSync(".git")) {
    console.log("📁 Initializing git repository...");
    try {
      execSync("git init", { stdio: "inherit" });
    } catch (error) {
      console.error("❌ Failed to initialize git repository");
      process.exit(1);
    }
  }

  createGitHubRepo();
}

main();
