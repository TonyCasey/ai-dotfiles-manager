#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
const PROJECT_ROOT = process.cwd();
const PACKAGE_JSON = require('../package.json');

// Get the directory where the package is installed
const getPackageRoot = () => {
  return path.join(__dirname, '..');
};

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

// Handle commands
if (command === '--version' || command === '-v') {
  console.log(`v${PACKAGE_JSON.version}`);
  process.exit(0);
}

if (command === '--help' || command === '-h') {
  printHelp();
  process.exit(0);
}

if (command === 'review') {
  handleReviewCommand(args.slice(1)).catch((error) => {
    console.error(chalk.red('\n❌ Error during review:'), error);
    process.exit(1);
  });
} else if (command === 'commit-todo') {
  handleCommitTodoCommand().catch((error) => {
    console.error(chalk.red('\n❌ Error during todo commit:'), error);
    process.exit(1);
  });
} else if (command === 'init' || command === 'setup' || command === 'update' || !command) {
  const isUpdate = command === 'update';
  main(isUpdate).catch((error) => {
    console.error(chalk.red(`\n❌ Error during ${isUpdate ? 'update' : 'setup'}:`), error);
    process.exit(1);
  });
} else {
  console.log(chalk.red(`Unknown command: ${command}`));
  console.log(chalk.gray('Run "ai-dotfiles-manager --help" for usage information\n'));
  process.exit(1);
}

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
  console.log(chalk.white('Review Options:'));
  console.log(chalk.gray('  --detailed        Show detailed information including info-level messages'));
  console.log(chalk.gray('  --json            Output results as JSON'));
  console.log(chalk.gray('  --fix             Auto-fix simple issues (not implemented yet)\n'));
  console.log(chalk.white('Examples:'));
  console.log(chalk.gray('  ai-dotfiles-manager setup           # Interactive setup wizard'));
  console.log(chalk.gray('  ai-dotfiles-manager update          # Update existing configuration'));
  console.log(chalk.gray('  ai-dotfiles-manager                 # Same as "ai-dotfiles-manager setup"'));
  console.log(chalk.gray('  ai-dotfiles-manager review          # Run code review'));
  console.log(chalk.gray('  ai-dotfiles-manager review --detailed   # Show all details'));
  console.log(chalk.gray('  ai-dotfiles-manager -v              # Show version\n'));
  console.log(chalk.white('Global Installation:'));
  console.log(chalk.gray('  npm install -g ai-dotfiles-manager\n'));
  console.log(chalk.white('Documentation:'));
  console.log(chalk.gray('  https://github.com/tony.casey/ai-dotfiles-manager\n'));
}

async function main(isUpdate = false) {
  const action = isUpdate ? 'Update' : 'Setup';
  console.log(chalk.blue.bold(`\n🤖 AI Dotfiles Manager ${action}\n`));

  if (isUpdate) {
    console.log(chalk.gray('Updating existing configuration with latest templates...\n'));
  }

  // Detect language
  const detectedLanguage = detectLanguage(PROJECT_ROOT);
  let language;

  if (detectedLanguage) {
    console.log(chalk.gray(`Detected language: ${detectedLanguage}\n`));
    const { confirmLanguage } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmLanguage',
        message: `Use ${detectedLanguage} for this project?`,
        default: true,
      },
    ]);

    if (confirmLanguage) {
      language = detectedLanguage;
    }
  }

  if (!language) {
    // Ask user to select language
    const { selectedLanguage } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedLanguage',
        message: 'What language is your project?',
        choices: [
          { name: 'TypeScript', value: 'typescript' },
          { name: 'Python', value: 'python' },
          { name: 'JavaScript', value: 'javascript' },
        ],
      },
    ]);
    language = selectedLanguage;
  }

  console.log('');

  // Ask which AI tools to configure
  const { tools: selectedTools } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'tools',
      message: 'Which AI tools would you like to configure? (Space to select)',
      choices: [
        { name: '✨ Select All', value: 'all', checked: false },
        new inquirer.Separator(),
        { name: 'Claude Code', value: 'claude', checked: true },
        { name: 'Cursor', value: 'cursor', checked: false },
        { name: 'Kilo Code', value: 'kilo', checked: false },
        { name: 'Roo Code', value: 'roo', checked: false },
      ],
    },
  ]);

  // Handle "Select All" option
  let tools;
  if (selectedTools.includes('all')) {
    tools = ['claude', 'cursor', 'kilo', 'roo'];
    console.log(chalk.gray('\n  → All tools selected'));
  } else {
    tools = selectedTools;
  }

  if (tools.length === 0) {
    console.log(chalk.yellow('No tools selected. Exiting.'));
    return;
  }

  console.log('');
  console.log(chalk.gray('Setting up with symlinked templates (customize via .local directories)...\n'));

  // Set up each selected tool with symlinks
  for (const tool of tools) {
    await setupTool(tool, 'symlink', language);
  }

  // Set up .dev folder for developer workspace
  await setupDevFolder(language, isUpdate);

  // Set up centralized rules directory
  await setupCentralizedRules(language, isUpdate);

  // Set up TypeScript configuration files if TypeScript project
  if (language === 'typescript') {
    await setupTypeScriptConfig(isUpdate);
  }

  console.log(chalk.green.bold(`\n✅ ${isUpdate ? 'Update' : 'Setup'} complete!\n`));
  printNextSteps(tools, language, isUpdate);
}

function detectLanguage(projectRoot) {
  // Detect TypeScript
  if (fs.existsSync(path.join(projectRoot, 'tsconfig.json'))) {
    return 'typescript';
  }

  // Detect from package.json
  const packageJsonPath = path.join(projectRoot, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      if (packageJson.dependencies?.typescript || packageJson.devDependencies?.typescript) {
        return 'typescript';
      }
      // If no TypeScript, assume JavaScript
      return 'javascript';
    } catch (error) {
      // Ignore parse errors
    }
  }

  // Detect Python
  if (fs.existsSync(path.join(projectRoot, 'requirements.txt')) ||
      fs.existsSync(path.join(projectRoot, 'pyproject.toml')) ||
      fs.existsSync(path.join(projectRoot, 'setup.py')) ||
      fs.existsSync(path.join(projectRoot, 'Pipfile'))) {
    return 'python';
  }

  // Could not detect
  return null;
}

async function setupTool(tool, method, language) {
  console.log(chalk.blue(`\n📦 Setting up ${tool}...`));

  if (tool === 'claude') {
    await setupClaude(method, language);
  } else if (tool === 'cursor') {
    await setupCursor(method, language);
  } else if (tool === 'kilo') {
    await setupKilo(method, language);
  } else if (tool === 'roo') {
    await setupRoo(method, language);
  }
}

async function handleExistingConfig(configDir, toolName) {
  console.log(chalk.yellow(`\n  ⚠ Existing ${toolName} configuration detected`));

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: `  How would you like to handle existing ${toolName} files?`,
      choices: [
        {
          name: 'Migrate to .local/ (your files supersede shared rules)',
          value: 'migrate-supersede',
          short: 'Migrate (supersede)'
        },
        {
          name: 'Migrate to .local/ (preserved alongside shared rules)',
          value: 'migrate-preserve',
          short: 'Migrate (preserve)'
        },
        {
          name: 'Replace with new setup (backup old files to .backup/)',
          value: 'replace',
          short: 'Replace'
        },
        {
          name: 'Skip - keep existing configuration as-is',
          value: 'skip',
          short: 'Skip'
        }
      ],
      default: 'migrate-supersede'
    }
  ]);

  if (action === 'skip') {
    return 'skip';
  }

  if (action === 'replace') {
    // Backup existing files
    const backupDir = path.join(configDir, '.backup');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const backupPath = path.join(backupDir, timestamp);

    fs.mkdirSync(backupPath, { recursive: true });

    // Copy all files to backup
    const files = fs.readdirSync(configDir);
    for (const file of files) {
      if (file === '.backup') continue; // Don't backup the backup folder
      const source = path.join(configDir, file);
      const dest = path.join(backupPath, file);

      const stats = fs.statSync(source);
      if (stats.isDirectory()) {
        copyDirectorySync(source, dest);
      } else {
        fs.copyFileSync(source, dest);
      }
    }

    console.log(chalk.green(`  ✓ Backed up existing files to ${path.relative(PROJECT_ROOT, backupPath)}`));

    // Remove old files (except backup)
    for (const file of files) {
      if (file === '.backup') continue;
      const filePath = path.join(configDir, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        fs.rmSync(filePath, { recursive: true });
      } else {
        fs.unlinkSync(filePath);
      }
    }

    return 'replace';
  }

  if (action === 'migrate-supersede' || action === 'migrate-preserve') {
    // Migrate existing files to .local
    const rulesDir = path.join(configDir, 'rules');
    const localDir = path.join(rulesDir, '.local');

    // Check if there are rule files directly in the config dir or in a rules dir
    const filesToMigrate = [];

    // Check root level
    const rootFiles = fs.readdirSync(configDir).filter(file => {
      const filePath = path.join(configDir, file);
      return fs.statSync(filePath).isFile() && file.endsWith('.md');
    });

    // Check rules directory if it exists
    let rulesFiles = [];
    if (fs.existsSync(rulesDir)) {
      rulesFiles = fs.readdirSync(rulesDir).filter(file => {
        const filePath = path.join(rulesDir, file);
        return fs.statSync(filePath).isFile() && file.endsWith('.md');
      });
    }

    if (rootFiles.length > 0 || rulesFiles.length > 0) {
      // Create .local directory
      fs.mkdirSync(localDir, { recursive: true });

      // Migrate root level markdown files
      for (const file of rootFiles) {
        const source = path.join(configDir, file);
        const dest = path.join(localDir, file);
        fs.copyFileSync(source, dest);
        fs.unlinkSync(source);
        filesToMigrate.push(file);
      }

      // Migrate rules directory markdown files
      for (const file of rulesFiles) {
        const source = path.join(rulesDir, file);
        const dest = path.join(localDir, file);
        fs.copyFileSync(source, dest);
        fs.unlinkSync(source);
        filesToMigrate.push(file);
      }

      if (filesToMigrate.length > 0) {
        console.log(chalk.green(`  ✓ Migrated ${filesToMigrate.length} files to .local/`));

        if (action === 'migrate-supersede') {
          console.log(chalk.blue(`  ℹ Your .local/ files will supersede shared rules with same names`));
        } else {
          console.log(chalk.blue(`  ℹ Your .local/ files preserved alongside shared rules`));
        }
      }
    }

    return action;
  }
}

function copyDirectorySync(source, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const files = fs.readdirSync(source);

  for (const file of files) {
    const sourcePath = path.join(source, file);
    const destPath = path.join(dest, file);
    const stats = fs.statSync(sourcePath);

    if (stats.isDirectory()) {
      copyDirectorySync(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

async function handleExistingCursorConfig(cursorRulesPath) {
  console.log(chalk.yellow(`\n  ⚠ Existing Cursor configuration detected`));

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: `  How would you like to handle existing .cursorrules file?`,
      choices: [
        {
          name: 'Migrate to .cursorrules.local (your rules supersede shared rules)',
          value: 'migrate-supersede',
          short: 'Migrate (supersede)'
        },
        {
          name: 'Migrate to .cursorrules.local (preserved alongside shared rules)',
          value: 'migrate-preserve',
          short: 'Migrate (preserve)'
        },
        {
          name: 'Replace with new setup (backup old file)',
          value: 'replace',
          short: 'Replace'
        },
        {
          name: 'Skip - keep existing configuration as-is',
          value: 'skip',
          short: 'Skip'
        }
      ],
      default: 'migrate-supersede'
    }
  ]);

  if (action === 'skip') {
    return 'skip';
  }

  if (action === 'replace') {
    // Backup existing file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const backupPath = path.join(PROJECT_ROOT, `.cursorrules.backup.${timestamp}`);

    fs.copyFileSync(cursorRulesPath, backupPath);
    console.log(chalk.green(`  ✓ Backed up existing file to .cursorrules.backup.${timestamp}`));

    // Remove old file
    fs.unlinkSync(cursorRulesPath);

    return 'replace';
  }

  if (action === 'migrate-supersede' || action === 'migrate-preserve') {
    // Migrate existing file to .cursorrules.local
    const localPath = path.join(PROJECT_ROOT, '.cursorrules.local');

    // If .cursorrules.local already exists, append content
    if (fs.existsSync(localPath)) {
      const existingContent = fs.readFileSync(cursorRulesPath, 'utf-8');
      const localContent = fs.readFileSync(localPath, 'utf-8');
      fs.writeFileSync(localPath, `${localContent}\n\n# Migrated from .cursorrules\n${existingContent}`);
      console.log(chalk.green(`  ✓ Appended content to existing .cursorrules.local`));
    } else {
      fs.copyFileSync(cursorRulesPath, localPath);
      console.log(chalk.green(`  ✓ Migrated to .cursorrules.local`));
    }

    // Remove old file
    fs.unlinkSync(cursorRulesPath);

    if (action === 'migrate-supersede') {
      console.log(chalk.blue(`  ℹ Your .cursorrules.local will supersede shared rules`));
    } else {
      console.log(chalk.blue(`  ℹ Your .cursorrules.local preserved alongside shared rules`));
    }

    return action;
  }
}

async function setupClaude(method, language) {
  const claudeDir = path.join(PROJECT_ROOT, '.claude');
  const templateDir = path.join(TEMPLATES_DIR, 'claude');

  // Check if .claude directory already exists with content
  const hasExisting = fs.existsSync(claudeDir) && fs.readdirSync(claudeDir).length > 0;

  if (hasExisting) {
    // Handle existing configuration
    const migrated = await handleExistingConfig(claudeDir, 'Claude Code');
    if (migrated === 'skip') {
      console.log(chalk.gray('  Skipped Claude Code setup'));
      return;
    }
  } else {
    // Create .claude directory if it doesn't exist
    fs.mkdirSync(claudeDir, { recursive: true });
    console.log(chalk.gray('  Created .claude directory'));
  }

  // Set up rules directory structure
  const rulesDir = path.join(claudeDir, 'rules');

  // Create rules directory
  if (!fs.existsSync(rulesDir)) {
    fs.mkdirSync(rulesDir, { recursive: true });
  }

  // Symlink shared rules
  const sharedRulesSource = path.join(TEMPLATES_DIR, 'shared', 'rules');
  const sharedRulesDest = path.join(rulesDir, 'shared');
  const sharedResult = await setupSymlink(sharedRulesSource, sharedRulesDest, 'shared rules');

  // Symlink language-specific rules
  const languageRulesSource = path.join(TEMPLATES_DIR, 'languages', language, 'rules');
  const languageRulesDest = path.join(rulesDir, language);
  let languageResult = { usedCopy: false };

  if (fs.existsSync(languageRulesSource)) {
    languageResult = await setupSymlink(languageRulesSource, languageRulesDest, `${language} rules`);
  } else {
    console.log(chalk.yellow(`  ⚠ No ${language} rules available, skipping`));
  }

  // Create .local directory for custom rules
  const rulesLocalDir = path.join(rulesDir, '.local');
  if (!fs.existsSync(rulesLocalDir)) {
    fs.mkdirSync(rulesLocalDir, { recursive: true });
    console.log(chalk.green('  ✓ Created .local/ for custom rules'));
  }

  // Create README in .local directory
  createLocalReadme(rulesLocalDir, 'Claude Code');

  // If we used copying instead of symlinks, create the sync script
  if (sharedResult.usedCopy || languageResult.usedCopy) {
    const scriptsDir = path.join(claudeDir, 'scripts');
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }

    const syncScriptSource = path.join(templateDir, 'scripts', 'sync-rules.js');
    const syncScriptDest = path.join(scriptsDir, 'sync-rules.js');

    if (fs.existsSync(syncScriptSource)) {
      fs.copyFileSync(syncScriptSource, syncScriptDest);
      console.log(chalk.blue('  ✓ Added sync-rules.js script for Windows compatibility'));
      console.log(chalk.gray('    Run "node .claude/scripts/sync-rules.js" to update rules'));
    }
  }

  // Set up global commands directory (user-level, not project-level)
  const globalCommandsDir = path.join(require('os').homedir(), '.claude', 'commands');
  const templateCommandsDir = path.join(templateDir, 'commands');

  // Create global commands directory if it doesn't exist
  if (!fs.existsSync(globalCommandsDir)) {
    fs.mkdirSync(globalCommandsDir, { recursive: true });
    console.log(chalk.green('  ✓ Created global ~/.claude/commands directory'));
  }

  // Copy commands to global directory (not project-level)
  if (fs.existsSync(templateCommandsDir) && fs.readdirSync(templateCommandsDir).length > 0) {
    const commandFiles = fs.readdirSync(templateCommandsDir).filter(f => f.endsWith('.md'));
    for (const file of commandFiles) {
      const source = path.join(templateCommandsDir, file);
      const dest = path.join(globalCommandsDir, file);

      // Only copy if doesn't exist or is different
      if (!fs.existsSync(dest) || fs.readFileSync(source, 'utf-8') !== fs.readFileSync(dest, 'utf-8')) {
        fs.copyFileSync(source, dest);
        console.log(chalk.green(`  ✓ Copied ${file} to global commands`));
      }
    }
    console.log(chalk.blue('  ℹ Commands available globally in all projects'));
  }

  // Set up workflows directory (if it has content in the future)
  const workflowsDir = path.join(claudeDir, 'workflows');
  const templateWorkflowsDir = path.join(templateDir, 'workflows');

  if (fs.existsSync(templateWorkflowsDir) && fs.readdirSync(templateWorkflowsDir).length > 0) {
    await setupSymlink(templateWorkflowsDir, workflowsDir, 'workflows directory');
  }

  // Set up hooks directory
  const hooksDir = path.join(claudeDir, 'hooks');
  const templateHooksDir = path.join(templateDir, 'hooks');

  if (fs.existsSync(templateHooksDir) && fs.readdirSync(templateHooksDir).length > 0) {
    // Create hooks directory if it doesn't exist
    if (!fs.existsSync(hooksDir)) {
      fs.mkdirSync(hooksDir, { recursive: true });
    }

    // Copy hook files (not symlink - projects may customize hooks)
    const hookFiles = fs.readdirSync(templateHooksDir);
    for (const file of hookFiles) {
      const source = path.join(templateHooksDir, file);
      const dest = path.join(hooksDir, file);

      // Only copy if doesn't exist (preserve custom hooks)
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(source, dest);

        // Make hooks executable on Unix systems
        if (file.endsWith('.js')) {
          try {
            fs.chmodSync(dest, 0o755);
          } catch (error) {
            // Ignore permission errors on Windows
          }
        }

        console.log(chalk.green(`  ✓ Copied ${file} to hooks/`));
      }
    }
    console.log(chalk.blue('  ℹ Hooks will run automatically on session start/end'));
  }

  // Copy settings.json if it exists in template (do not symlink - each project needs its own)
  const settingsTemplate = path.join(templateDir, 'settings.json');
  const settingsTarget = path.join(claudeDir, 'settings.json');

  if (fs.existsSync(settingsTemplate)) {
    if (fs.existsSync(settingsTarget)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: '  settings.json already exists. Overwrite?',
          default: false,
        },
      ]);

      if (overwrite) {
        fs.copyFileSync(settingsTemplate, settingsTarget);
        console.log(chalk.green('  ✓ Copied settings.json (project-specific)'));
      } else {
        console.log(chalk.gray('  Skipped settings.json'));
      }
    } else {
      fs.copyFileSync(settingsTemplate, settingsTarget);
      console.log(chalk.green('  ✓ Copied settings.json (project-specific)'));
    }
  }

  console.log(chalk.green('  ✓ Claude Code configuration set up'));
}

async function setupCursor(method, language) {
  const cursorRulesPath = path.join(PROJECT_ROOT, '.cursorrules');
  const templatePath = path.join(TEMPLATES_DIR, 'cursor', '.cursorrules');

  if (!fs.existsSync(templatePath)) {
    console.log(chalk.yellow('  ⚠ Cursor template not found, skipping'));
    return;
  }

  // Check if .cursorrules already exists and is NOT a symlink
  if (fs.existsSync(cursorRulesPath)) {
    const stats = fs.lstatSync(cursorRulesPath);
    if (!stats.isSymbolicLink()) {
      // Handle existing file
      const migrated = await handleExistingCursorConfig(cursorRulesPath);
      if (migrated === 'skip') {
        console.log(chalk.gray('  Skipped Cursor setup'));
        return;
      }
    } else {
      // It's already a symlink, just remove and recreate
      fs.unlinkSync(cursorRulesPath);
    }
  }

  await setupSymlink(templatePath, cursorRulesPath, '.cursorrules');

  // Create .cursorrules.local for custom overrides
  const cursorLocalPath = path.join(PROJECT_ROOT, '.cursorrules.local');
  if (!fs.existsSync(cursorLocalPath)) {
    fs.writeFileSync(cursorLocalPath, '# Add your custom Cursor rules here\n# These rules will be loaded in addition to .cursorrules\n');
    console.log(chalk.green('  ✓ Created .cursorrules.local for custom rules'));
  }

  console.log(chalk.green('  ✓ Cursor configuration set up'));
}

async function setupKilo(method, language) {
  const kiloDir = path.join(PROJECT_ROOT, '.kilocode');

  // Check if .kilocode directory already exists with content
  const hasExisting = fs.existsSync(kiloDir) && fs.readdirSync(kiloDir).length > 0;

  if (hasExisting) {
    // Handle existing configuration
    const migrated = await handleExistingConfig(kiloDir, 'Kilo Code');
    if (migrated === 'skip') {
      console.log(chalk.gray('  Skipped Kilo Code setup'));
      return;
    }
  } else {
    // Create .kilocode directory if it doesn't exist
    fs.mkdirSync(kiloDir, { recursive: true });
    console.log(chalk.gray('  Created .kilocode directory'));
  }

  // Set up rules directory structure
  const rulesDir = path.join(kiloDir, 'rules');

  // Create rules directory
  if (!fs.existsSync(rulesDir)) {
    fs.mkdirSync(rulesDir, { recursive: true });
  }

  // Symlink shared rules
  const sharedRulesSource = path.join(TEMPLATES_DIR, 'shared', 'rules');
  const sharedRulesDest = path.join(rulesDir, 'shared');
  await setupSymlink(sharedRulesSource, sharedRulesDest, 'shared rules');

  // Symlink language-specific rules
  const languageRulesSource = path.join(TEMPLATES_DIR, 'languages', language, 'rules');
  const languageRulesDest = path.join(rulesDir, language);

  if (fs.existsSync(languageRulesSource)) {
    await setupSymlink(languageRulesSource, languageRulesDest, `${language} rules`);
  } else {
    console.log(chalk.yellow(`  ⚠ No ${language} rules available, skipping`));
  }

  // Create .local directory for custom rules
  const rulesLocalDir = path.join(rulesDir, '.local');
  if (!fs.existsSync(rulesLocalDir)) {
    fs.mkdirSync(rulesLocalDir, { recursive: true });
    console.log(chalk.green('  ✓ Created .local/ for custom rules'));
  }

  // Create README in .local directory
  createLocalReadme(rulesLocalDir, 'Kilo Code');

  console.log(chalk.green('  ✓ Kilo Code configuration set up'));
}

async function setupRoo(method, language) {
  const rooDir = path.join(PROJECT_ROOT, '.roo');

  // Check if .roo directory already exists with content
  const hasExisting = fs.existsSync(rooDir) && fs.readdirSync(rooDir).length > 0;

  if (hasExisting) {
    // Handle existing configuration
    const migrated = await handleExistingConfig(rooDir, 'Roo Code');
    if (migrated === 'skip') {
      console.log(chalk.gray('  Skipped Roo Code setup'));
      return;
    }
  } else {
    // Create .roo directory if it doesn't exist
    fs.mkdirSync(rooDir, { recursive: true });
    console.log(chalk.gray('  Created .roo directory'));
  }

  // Set up rules directory structure
  const rulesDir = path.join(rooDir, 'rules');

  // Create rules directory
  if (!fs.existsSync(rulesDir)) {
    fs.mkdirSync(rulesDir, { recursive: true });
  }

  // Symlink shared rules
  const sharedRulesSource = path.join(TEMPLATES_DIR, 'shared', 'rules');
  const sharedRulesDest = path.join(rulesDir, 'shared');
  await setupSymlink(sharedRulesSource, sharedRulesDest, 'shared rules');

  // Symlink language-specific rules
  const languageRulesSource = path.join(TEMPLATES_DIR, 'languages', language, 'rules');
  const languageRulesDest = path.join(rulesDir, language);

  if (fs.existsSync(languageRulesSource)) {
    await setupSymlink(languageRulesSource, languageRulesDest, `${language} rules`);
  } else {
    console.log(chalk.yellow(`  ⚠ No ${language} rules available, skipping`));
  }

  // Create .local directory for custom rules
  const rulesLocalDir = path.join(rulesDir, '.local');
  if (!fs.existsSync(rulesLocalDir)) {
    fs.mkdirSync(rulesLocalDir, { recursive: true });
    console.log(chalk.green('  ✓ Created .local/ for custom rules'));
  }

  // Create README in .local directory
  createLocalReadme(rulesLocalDir, 'Roo Code');

  console.log(chalk.green('  ✓ Roo Code configuration set up'));
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function setupSymlink(source, target, name, fallbackToCopy = true) {
  // Remove existing symlink or file if it exists
  if (fs.existsSync(target)) {
    const stats = fs.lstatSync(target);
    if (stats.isSymbolicLink()) {
      fs.unlinkSync(target);
    } else {
      const { replace } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'replace',
          message: `  ${name} exists. Replace with symlink?`,
          default: false,
        },
      ]);

      if (!replace) {
        console.log(chalk.gray(`  Skipped ${name}`));
        return { success: false, usedCopy: false };
      }

      if (stats.isDirectory()) {
        fs.rmSync(target, { recursive: true });
      } else {
        fs.unlinkSync(target);
      }
    }
  }

  // Determine symlink type based on OS and source type
  const isDirectory = fs.statSync(source).isDirectory();
  const isWindows = process.platform === 'win32';

  // On Windows, use 'junction' for directories (doesn't require admin rights)
  // Use 'file' for files (requires admin or Developer Mode)
  let symlinkType;
  if (isWindows) {
    symlinkType = isDirectory ? 'junction' : 'file';
  } else {
    symlinkType = isDirectory ? 'dir' : 'file';
  }

  try {
    fs.symlinkSync(source, target, symlinkType);

    // Set symlink target as read-only (on Unix-like systems)
    // This prevents accidental modifications to shared templates
    if (!isWindows && isDirectory) {
      try {
        // Make the symlink target read-only
        fs.chmodSync(target, 0o444); // r--r--r--
      } catch (chmodError) {
        // Silently fail if chmod doesn't work (some filesystems don't support it)
      }
    }

    console.log(chalk.green(`  ✓ Created ${isWindows && isDirectory ? 'junction' : 'symlink'} for ${name} (read-only)`));
    return { success: true, usedCopy: false };
  } catch (error) {
    if (error.code === 'EPERM' && isWindows && fallbackToCopy) {
      console.log(chalk.yellow(`  ⚠ Permission denied creating symlink for ${name}`));
      console.log(chalk.gray('  ℹ Falling back to copying files (Windows compatibility mode)'));

      try {
        if (isDirectory) {
          copyDirectory(source, target);
        } else {
          fs.copyFileSync(source, target);
        }
        console.log(chalk.green(`  ✓ Copied ${name} (use sync script to update)`));
        return { success: true, usedCopy: true };
      } catch (copyError) {
        console.log(chalk.red(`  ✗ Failed to copy ${name}: ${copyError.message}`));
        throw copyError;
      }
    } else {
      console.log(chalk.red(`  ✗ Failed to create symlink for ${name}: ${error.message}`));
      throw error;
    }
  }
}

function createLocalReadme(localDir, toolName) {
  const readmePath = path.join(localDir, 'README.md');
  if (fs.existsSync(readmePath)) {
    return; // Don't overwrite existing README
  }

  const readmeContent = `# ${toolName} - Local Rules

This directory is for **your project-specific custom rules** that override or extend the base rules.

## Why use .local?

The symlinked rule directories (\`shared/\`, \`typescript/\`, etc.) are **read-only** and point to the global package installation. This ensures:
- ✅ You always get the latest team standards when updating the package
- ✅ Rules remain consistent across all projects
- ✅ No accidental modifications to shared standards

## How to customize

### Option 1: Override specific rules
Create a file with the same name as a base rule to override it:
\`\`\`
.local/
  └── architecture.md    # Overrides shared/architecture.md
\`\`\`

### Option 2: Add new rules
Add new markdown files for project-specific requirements:
\`\`\`
.local/
  └── custom-api-standards.md
  └── database-conventions.md
\`\`\`

### Option 3: Extend existing rules
Reference and extend base rules in your custom files:
\`\`\`markdown
<!-- In .local/custom-architecture.md -->
# Custom Architecture Rules

See base rules in \`../shared/clean-architecture.md\`

## Project-Specific Additions
- Our API uses GraphQL instead of REST
- ...
\`\`\`

## Updating base rules

When you run \`ai-dotfiles-manager update\`, the symlinked directories are automatically updated with the latest templates, but your .local files remain untouched.

## Git

**Commit .local files** to share project-specific rules with your team:
\`\`\`gitignore
# In your .gitignore:
# Ignore symlinked base rules
.claude/rules/shared
.claude/rules/typescript

# But commit local customizations
!.claude/rules/.local/
\`\`\`
`;

  fs.writeFileSync(readmePath, readmeContent);
}

async function setupDevFolder(language, isUpdate) {
  const devDir = path.join(PROJECT_ROOT, '.dev');

  console.log(chalk.blue('\n📦 Setting up .dev folder...'));

  // Create .dev directory if it doesn't exist
  if (!fs.existsSync(devDir)) {
    fs.mkdirSync(devDir, { recursive: true });
    console.log(chalk.green('  ✓ Created .dev/ directory'));
  }

  // Generate architecture.md (always regenerate to keep it fresh)
  const architecturePath = path.join(devDir, 'architecture.md');
  const { generateArchitectureDoc } = require('../lib/architecture-generator');
  const architectureContent = generateArchitectureDoc(language);
  fs.writeFileSync(architecturePath, architectureContent);
  console.log(chalk.green('  ✓ Generated architecture.md'));

  // Create todo.md only if it doesn't exist (preserve user's tasks)
  const todoPath = path.join(devDir, 'todo.md');
  if (!fs.existsSync(todoPath)) {
    const todoContent = generateTodoTemplate();
    fs.writeFileSync(todoPath, todoContent);
    console.log(chalk.green('  ✓ Created todo.md'));
  } else {
    console.log(chalk.gray('  ⚬ Preserved existing todo.md'));
  }

  // Create README explaining .dev folder
  const readmePath = path.join(devDir, 'README.md');
  if (!fs.existsSync(readmePath)) {
    const readmeContent = generateDevReadme();
    fs.writeFileSync(readmePath, readmeContent);
    console.log(chalk.green('  ✓ Created README.md'));
  }

  console.log(chalk.blue('  ℹ .dev/ is auto-loaded into AI context on every session'));
}

async function setupCentralizedRules(language, isUpdate) {
  const devDir = path.join(PROJECT_ROOT, '.dev');
  const rulesDir = path.join(devDir, 'rules');

  console.log(chalk.blue('\n📦 Setting up centralized rules...'));

  // Create .dev/rules directory structure
  if (!fs.existsSync(rulesDir)) {
    fs.mkdirSync(rulesDir, { recursive: true });
    console.log(chalk.green('  ✓ Created .dev/rules/ directory'));
  }

  // Create shared rules symlink
  const sharedRulesSource = path.join(TEMPLATES_DIR, 'shared', 'rules');
  const sharedRulesDest = path.join(rulesDir, 'shared');
  const sharedResult = await setupSymlink(sharedRulesSource, sharedRulesDest, 'shared rules');

  // Create language-specific rules symlink
  const languageRulesSource = path.join(TEMPLATES_DIR, 'languages', language, 'rules');
  const languageRulesDest = path.join(rulesDir, language);
  let languageResult = { usedCopy: false };

  if (fs.existsSync(languageRulesSource)) {
    languageResult = await setupSymlink(languageRulesSource, languageRulesDest, `${language} rules`);
  } else {
    console.log(chalk.yellow(`  ⚠ No ${language} rules available, skipping`));
  }

  // Create .local directory for custom rules
  const rulesLocalDir = path.join(rulesDir, '.local');
  if (!fs.existsSync(rulesLocalDir)) {
    fs.mkdirSync(rulesLocalDir, { recursive: true });
    console.log(chalk.green('  ✓ Created .dev/rules/.local/ for custom rules'));
  }

  // Create README in .local directory
  createLocalRulesReadme(rulesLocalDir);

  // Create README in rules directory
  const rulesReadmePath = path.join(rulesDir, 'README.md');
  if (!fs.existsSync(rulesReadmePath)) {
    const rulesReadmeContent = generateRulesReadme();
    fs.writeFileSync(rulesReadmePath, rulesReadmeContent);
    console.log(chalk.green('  ✓ Created .dev/rules/README.md'));
  }

  console.log(chalk.green('  ✓ Centralized rules set up'));
}

async function setupTypeScriptConfig(isUpdate) {
  console.log(chalk.blue('\n📦 Setting up TypeScript configuration files...'));

  const tsConfigFiles = [
    { source: 'tsconfig.json', dest: 'tsconfig.json' },
    { source: 'tsconfig.test.json', dest: 'tsconfig.test.json' },
    { source: 'tsconfig.eslint.json', dest: 'tsconfig.eslint.json' },
    { source: '.eslintrc.json', dest: '.eslintrc.json' }
  ];

  for (const { source, dest } of tsConfigFiles) {
    const sourcePath = path.join(TEMPLATES_DIR, 'languages', 'typescript', source);
    const destPath = path.join(PROJECT_ROOT, dest);

    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
      console.log(chalk.yellow(`  ⚠ Template file ${source} not found, skipping`));
      continue;
    }

    // If file already exists in project, backup and replace
    if (fs.existsSync(destPath)) {
      const backupPath = `${destPath}.bak`;
      let backupNumber = 1;
      let finalBackupPath = backupPath;

      // Find unique backup filename if .bak already exists
      while (fs.existsSync(finalBackupPath)) {
        finalBackupPath = `${destPath}.bak${backupNumber}`;
        backupNumber++;
      }

      // Create backup
      fs.copyFileSync(destPath, finalBackupPath);
      console.log(chalk.yellow(`  ⚠ Backed up existing ${dest} to ${path.basename(finalBackupPath)}`));
    }

    // Copy the file
    fs.copyFileSync(sourcePath, destPath);
    console.log(chalk.green(`  ✓ Created ${dest}`));
  }

  console.log(chalk.blue('  ℹ TypeScript configuration files provide strict type checking and linting'));
}

function createLocalRulesReadme(localDir) {
  const readmePath = path.join(localDir, 'README.md');
  if (fs.existsSync(readmePath)) {
    return; // Don't overwrite existing README
  }

  const readmeContent = `# Local Rules Directory

This directory contains **project-specific custom rules** that override or extend the base rules.

## How to customize

### Override specific rules
Create a file with the same name as a base rule to override it:
\`\`\`
.local/
  └── clean-architecture.md    # Overrides shared/clean-architecture.md
\`\`\`

### Add new rules
Add new markdown files for project-specific requirements:
\`\`\`
.local/
  └── custom-api-standards.md
  └── database-conventions.md
\`\`\`

### Extend existing rules
Reference and extend base rules in your custom files:
\`\`\`markdown
<!-- In .local/custom-architecture.md -->
# Custom Architecture Rules

See base rules in \`../shared/clean-architecture.md\`

## Project-Specific Additions
- Our API uses GraphQL instead of REST
- ...
\`\`\`

## Updating base rules

When you run \`ai-dotfiles-manager update\`, the symlinked directories are automatically updated with the latest templates, but your .local files remain untouched.

## Git

**Commit .local files** to share project-specific rules with your team:
\`\`\`gitignore
# In your .gitignore:
# Ignore symlinked base rules
.dev/rules/shared/
.dev/rules/typescript/

# But commit local customizations
!.dev/rules/.local/
\`\`\`
`;

  fs.writeFileSync(readmePath, readmeContent);
}

function generateRulesReadme() {
  return `# Centralized Rules Directory

This directory contains **centralized rules** for all AI coding assistants, eliminating duplication across provider folders.

## Structure

\`\`\`
.dev/rules/
├── shared/              # Language-agnostic rules (symlinked)
│   ├── clean-architecture.md
│   ├── repository-pattern.md
│   └── testing-principles.md
├── typescript/          # Language-specific rules (symlinked)
│   ├── coding-standards.md
│   └── testing.md
└── .local/             # Project-specific overrides
    ├── custom-rules.md
    └── architecture.md   # Override shared rules
\`\`\`

## How It Works

### Base Rules (Read-Only Symlinks)
- **Shared Rules**: Universal principles applicable to all projects
- **Language Rules**: Specific conventions for your programming language
- **Symlinked from**: Global package templates
- **Automatically updated**: Run \`ai-dotfiles-manager update\`

### Local Overrides (Writable)
- **Project-specific**: Custom rules for this project only
- **Override capability**: Files with same name replace base rules
- **Version control**: Commit these to share with your team
- **Survive updates**: Never affected by package updates

## Loading Priority

1. **Base shared rules** loaded first
2. **Language-specific rules** loaded next
3. **Local overrides** loaded last (highest priority)

This means your \`.local/\` rules always take precedence over base rules.

---

*This centralized approach eliminates the need to maintain separate rule sets for each AI provider.*
`;
}

function generateArchitectureDoc(language) {
  const projectName = path.basename(PROJECT_ROOT);

  // Analyze project structure
  const hasPackageJson = fs.existsSync(path.join(PROJECT_ROOT, 'package.json'));
  const hasSrc = fs.existsSync(path.join(PROJECT_ROOT, 'src'));
  const hasTests = fs.existsSync(path.join(PROJECT_ROOT, 'tests')) ||
                   fs.existsSync(path.join(PROJECT_ROOT, 'test')) ||
                   fs.existsSync(path.join(PROJECT_ROOT, '__tests__'));

  let framework = 'Unknown';
  let dependencies = [];

  if (hasPackageJson) {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf-8'));
      dependencies = [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.devDependencies || {})
      ];

      // Detect framework
      if (dependencies.includes('next')) framework = 'Next.js';
      else if (dependencies.includes('react')) framework = 'React';
      else if (dependencies.includes('vue')) framework = 'Vue';
      else if (dependencies.includes('express')) framework = 'Express';
      else if (dependencies.includes('nestjs')) framework = 'NestJS';
      else if (dependencies.includes('fastify')) framework = 'Fastify';
    } catch (error) {
      // Ignore parse errors
    }
  }

  // Scan directory structure
  const srcDirs = [];
  if (hasSrc) {
    try {
      const srcContents = fs.readdirSync(path.join(PROJECT_ROOT, 'src'));
      srcDirs.push(...srcContents.filter(item => {
        const stat = fs.statSync(path.join(PROJECT_ROOT, 'src', item));
        return stat.isDirectory();
      }));
    } catch (error) {
      // Ignore read errors
    }
  }

  return `# ${projectName} - Architecture Overview

> Auto-generated architecture overview for AI context loading

## Project Information

- **Language**: ${language}
- **Framework**: ${framework}
- **Architecture**: Clean Architecture (3-layer)

## Directory Structure

\`\`\`
${projectName}/
${hasSrc ? '├── src/                    # Source code' : ''}
${srcDirs.includes('domain') ? '│   ├── domain/              # Core business logic' : ''}
${srcDirs.includes('application') ? '│   ├── application/         # Use cases & services' : ''}
${srcDirs.includes('infrastructure') ? '│   ├── infrastructure/      # External integrations' : ''}
${hasTests ? '├── tests/                  # Test files' : ''}
${hasPackageJson ? '└── package.json           # Dependencies' : ''}
\`\`\`

## Key Technologies

${dependencies.length > 0 ? dependencies.slice(0, 10).map(dep => `- ${dep}`).join('\n') : '- (Add key technologies here)'}

## Architecture Principles

This project follows **Clean Architecture** with three layers:

1. **Domain Layer** (src/domain/)
   - Business entities and interfaces
   - Domain errors
   - No external dependencies

2. **Application Layer** (src/application/)
   - Business logic and use cases
   - Service implementations
   - Depends only on Domain

3. **Infrastructure Layer** (src/infrastructure/)
   - External integrations (databases, APIs)
   - Repository implementations
   - Depends on Application and Domain

## Key Patterns

- **Repository Pattern**: All data access through repositories
- **Dependency Injection**: Constructor injection for all dependencies
- **Interface Segregation**: One focused interface per file
- **Domain Errors**: Specific error classes with HTTP status codes

## Notes

*Use this document to add project-specific architectural decisions, conventions, and important context for AI assistants.*

**Last Updated**: ${new Date().toISOString().split('T')[0]}
`;
}

function generateTodoTemplate() {
  return `# Developer Todo List

> Personal task list - auto-loaded into AI context. Check off items as you complete them.

## Current Sprint

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

## Backlog

- [ ] Future task 1
- [ ] Future task 2

## Completed

- [x] Example completed task

---

*Keep this list updated. Checked items ([x]) show completed work.*
`;
}

function generateDevReadme() {
  return `# .dev/ - Developer Workspace

This folder contains **your personal developer workspace** that's auto-loaded into AI context for every session.

## Files

### architecture.md
**Auto-generated project overview** that provides context to AI assistants about:
- Project structure
- Technologies used
- Architectural patterns
- Key principles

**Regenerated on setup/update** to stay current with your project.

### todo.md
**Your personal task list** with checkboxes:
- [ ] Pending tasks
- [x] Completed tasks

AI assistants see your current tasks and can help you work through them. Simply check off items as you complete them.

## Auto-Loading

All files in .dev/ are automatically loaded into AI context when you start a new session with:
- Claude Code
- Cursor
- Kilo Code
- Roo Code

This gives the AI immediate understanding of:
- What you're working on (todo.md)
- How the project is structured (architecture.md)

## Git

The .dev/ folder is **personal** and typically not committed:

\`\`\`gitignore
# In your .gitignore:
.dev/
\`\`\`

However, you can commit it if you want to share architecture notes or tasks with your team.

## Customization

Feel free to add more files:
- \`notes.md\` - Personal development notes
- \`decisions.md\` - Architectural decision records
- \`research.md\` - Research and exploration notes

All .md files in .dev/ will be loaded into AI context.
`;
}

function printNextSteps(tools, language, isUpdate = false) {
  if (isUpdate) {
    console.log(chalk.bold('✨ Configuration Updated:\n'));
    console.log(chalk.gray(`Language: ${language}`));
    console.log(chalk.gray('Updated tools: ' + tools.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ') + '\n'));
    console.log(chalk.green('Your AI coding assistants now have the latest templates and rules!\n'));
    console.log(chalk.blue('💡 Run "ai-dotfiles-manager review" to check for architecture violations\n'));
    return;
  }

  console.log(chalk.bold('📋 Next Steps:\n'));
  console.log(chalk.gray(`Language: ${language}\n`));

  if (tools.includes('claude')) {
    console.log(chalk.white('Claude Code:'));
    console.log(chalk.gray('  • Rules loaded from centralized .dev/rules/'));
    console.log(chalk.gray('    - shared/ (symlinked, read-only)'));
    console.log(chalk.gray(`    - ${language}/ (symlinked, read-only)`));
    console.log(chalk.gray('    - .local/ (your custom rules)'));
    console.log(chalk.gray('  • Commands are available as slash commands:'));
    console.log(chalk.gray('    - /create-repo - Create a new repository'));
    console.log(chalk.gray('    - /create-service - Create a new service'));
    console.log(chalk.gray('    - /create-error - Create a domain error'));
    console.log(chalk.gray('    - /create-tests - Generate test files'));
    console.log(chalk.gray('  • Session hooks: Auto-load rules and commit completed todos\n'));
  }

  if (tools.includes('cursor')) {
    console.log(chalk.white('Cursor:'));
    console.log(chalk.gray('  • Rules loaded from centralized .dev/rules/'));
    console.log(chalk.gray('    - Via .cursorrules pointing to .dev/rules/'));
    console.log(chalk.gray('  • Customize: Edit .cursorrules.local\n'));
  }

  if (tools.includes('kilo')) {
    console.log(chalk.white('Kilo Code:'));
    console.log(chalk.gray('  • Rules loaded from centralized .dev/rules/'));
    console.log(chalk.gray('    - Via config.json pointing to .dev/rules/'));
    console.log(chalk.gray('  • Session hooks: Auto-load rules and commit completed todos\n'));
  }

  if (tools.includes('roo')) {
    console.log(chalk.white('Roo Code:'));
    console.log(chalk.gray('  • Rules loaded from centralized .dev/rules/'));
    console.log(chalk.gray('    - Via config.json pointing to .dev/rules/'));
    console.log(chalk.gray('  • Session hooks: Auto-load rules and commit completed todos\n'));
  }

  if (language === 'typescript') {
    console.log(chalk.blue('💡 TypeScript configuration files added (tsconfig.json, tsconfig.test.json, tsconfig.eslint.json, .eslintrc.json)'));
    console.log(chalk.blue('💡 Existing config files are backed up with .bak extension'));
  }
  console.log(chalk.blue('💡 All rules are now centralized in .dev/rules/ - no more duplication!'));
  console.log(chalk.blue('💡 Session hooks automatically load rules and commit completed todos'));
  console.log(chalk.blue('💡 Run "ai-dotfiles-manager update" to get the latest templates'));
  console.log(chalk.blue('💡 Run "ai-dotfiles-manager review" to check for architecture violations\n'));
}

async function handleCommitTodoCommand() {
  const { enforceCommitPolicy, checkUncommittedWork } = require('../templates/dev/hooks/todo-commit.js');
  
  console.log(chalk.blue.bold('\n🔄 Todo Commit Enforcement\n'));
  
  const command = process.argv[3];
  
  switch (command) {
    case 'check':
      checkUncommittedWork();
      break;
    case 'enforce':
    default:
      enforceCommitPolicy();
      break;
  }
}

async function handleReviewCommand(reviewArgs) {
  const CodeReviewer = require('../scripts/review.js');

  // Parse review options
  const options = {
    detailed: reviewArgs.includes('--detailed'),
    fix: reviewArgs.includes('--fix'),
    format: reviewArgs.includes('--json') ? 'json' : 'console',
  };

  // Create reviewer instance
  const reviewer = new CodeReviewer(PROJECT_ROOT, options);

  // Run analysis
  const violations = await reviewer.analyze();

  // Exit with error code if there are errors
  if (violations.errors.length > 0) {
    process.exit(1);
  }
}
