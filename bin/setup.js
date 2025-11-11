#!/usr/bin/env node

/**
 * AI Dotfiles Manager CLI
 * Main entry point - routes commands to appropriate handlers
 */

const chalk = require('chalk');
const { parseArguments, getCommandType } = require('../lib/cli-parser');
const { executeSetup, executeUpdate, executeReview, executeCommitTodo } = require('../lib/commands');
const PACKAGE_JSON = require('../package.json');

// Parse command line arguments
const parsed = parseArguments(process.argv.slice(2));
const PROJECT_ROOT = process.cwd();

// Handle --version flag
if (parsed.options.version) {
  console.log(`v${PACKAGE_JSON.version}`);
  process.exit(0);
}

// Handle --help flag
if (parsed.options.help) {
  printHelp();
  process.exit(0);
}

// Get command type
const commandType = getCommandType(parsed.command);

// Route to appropriate command handler
(async () => {
  try {
    switch (commandType) {
      case 'setup':
        await executeSetup(PROJECT_ROOT, {
          autoYes: parsed.options.autoYes,
          noCodexGuide: parsed.options.noCodexGuide,
        });
        break;

      case 'update':
        await executeUpdate(PROJECT_ROOT, {
          autoYes: parsed.options.autoYes,
          noCodexGuide: parsed.options.noCodexGuide,
        });
        break;

      case 'review':
        await executeReview(PROJECT_ROOT, {
          detailed: parsed.options.detailed,
          json: parsed.options.json,
          fix: parsed.options.fix,
          noCodexGuide: parsed.options.noCodexGuide,
        });
        break;

      case 'commit-todo':
        const subCommand = parsed.commandArgs[0] || 'enforce';
        await executeCommitTodo(PROJECT_ROOT, {
          noCodexGuide: parsed.options.noCodexGuide,
        }, subCommand);
        break;

      case 'unknown':
        console.log(chalk.red(`Unknown command: ${parsed.command}`));
        console.log(chalk.gray('Run "ai-dotfiles-manager --help" for usage information\n'));
        process.exit(1);
        break;
    }
  } catch (error) {
    console.error(chalk.red(`\n❌ Error during ${commandType}:`), error);
    if (error.stack) {
      console.error(chalk.gray(error.stack));
    }
    process.exit(1);
  }
})();

/**
 * Prints help message
 */
function printHelp() {
  console.log(chalk.blue.bold('\n🤖 AI Dotfiles Manager\n'));
  console.log(chalk.white('Usage:'));
  console.log(chalk.gray('  ai-dotfiles-manager [command] [options]\n'));
  console.log(chalk.white('Commands:'));
  console.log(chalk.gray('  setup, init       Set up AI configuration in current project (default)'));
  console.log(chalk.gray('  update            Update existing AI configuration with latest templates'));
  console.log(chalk.gray('  review [options]  Analyze codebase for Clean Architecture violations'));
  console.log(chalk.gray('  commit-todo       Enforce todo commit policy'));
  console.log(chalk.gray('  --version, -v     Show version number'));
  console.log(chalk.gray('  --help, -h        Show this help message\n'));
  console.log(chalk.white('Global Options:'));
  console.log(chalk.gray('  --yes, -y         Accept all defaults, skip interactive prompts'));
  console.log(chalk.gray('  --no-codex-guide  Skip generating Codex manifest/index and AGENTS guide block\n'));
  console.log(chalk.white('Review Options:'));
  console.log(chalk.gray('  --detailed        Show detailed information including info-level messages'));
  console.log(chalk.gray('  --json            Output results as JSON'));
  console.log(chalk.gray('  --fix             Auto-fix simple issues (not implemented yet)\n'));
  console.log(chalk.white('Examples:'));
  console.log(chalk.gray('  ai-dotfiles-manager setup           # Interactive setup wizard'));
  console.log(chalk.gray('  ai-dotfiles-manager setup --yes     # Non-interactive setup with defaults'));
  console.log(chalk.gray('  ai-dotfiles-manager update -y       # Non-interactive update'));
  console.log(chalk.gray('  ai-dotfiles-manager                 # Same as "ai-dotfiles-manager setup"'));
  console.log(chalk.gray('  ai-dotfiles-manager review          # Run code review'));
  console.log(chalk.gray('  ai-dotfiles-manager review --detailed   # Show all details'));
  console.log(chalk.gray('  ai-dotfiles-manager -v              # Show version\n'));
  console.log(chalk.white('Global Installation:'));
  console.log(chalk.gray('  npm install -g ai-dotfiles-manager\n'));
  console.log(chalk.white('Documentation:'));
  console.log(chalk.gray('  https://github.com/TonyCasey/ai-dotfiles-manager\n'));
}
