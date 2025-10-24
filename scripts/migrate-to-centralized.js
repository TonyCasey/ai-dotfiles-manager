#!/usr/bin/env node

/**
 * Migration Script - Transition to Centralized Rules
 * 
 * This script helps users migrate from the old distributed rule structure
 * to the new centralized .dev/rules/ architecture.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

const PROJECT_ROOT = process.cwd();
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

function log(message, type = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = type === 'error' ? chalk.red('❌') : 
                type === 'warn' ? chalk.yellow('⚠️') : 
                type === 'success' ? chalk.green('✅') : 
                chalk.blue('ℹ️');
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function detectExistingProviders() {
  const providers = [];
  
  // Check for Claude Code
  if (fs.existsSync(path.join(PROJECT_ROOT, '.claude'))) {
    providers.push({
      name: 'Claude Code',
      folder: '.claude',
      hasRules: fs.existsSync(path.join(PROJECT_ROOT, '.claude', 'rules'))
    });
  }
  
  // Check for Cursor
  if (fs.existsSync(path.join(PROJECT_ROOT, '.cursorrules'))) {
    providers.push({
      name: 'Cursor',
      folder: '.cursorrules',
      hasRules: true
    });
  }
  
  // Check for Kilo Code
  if (fs.existsSync(path.join(PROJECT_ROOT, '.kilocode'))) {
    providers.push({
      name: 'Kilo Code',
      folder: '.kilocode',
      hasRules: fs.existsSync(path.join(PROJECT_ROOT, '.kilocode', 'rules'))
    });
  }
  
  // Check for Roo Code
  if (fs.existsSync(path.join(PROJECT_ROOT, '.roo'))) {
    providers.push({
      name: 'Roo Code',
      folder: '.roo',
      hasRules: fs.existsSync(path.join(PROJECT_ROOT, '.roo', 'rules'))
    });
  }
  
  return providers;
}

function backupExistingFiles(sourceDir, backupDir) {
  if (!fs.existsSync(sourceDir)) {
    return;
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const backupPath = path.join(backupDir, timestamp);
  
  fs.mkdirSync(backupPath, { recursive: true });
  
  const files = fs.readdirSync(sourceDir);
  for (const file of files) {
    if (file === '.backup') continue;
    
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(backupPath, file);
    
    const stats = fs.statSync(sourcePath);
    if (stats.isDirectory()) {
      copyDirectorySync(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  }
  
  return backupPath;
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

function migrateProviderRules(provider, targetRulesDir) {
  const sourceDir = path.join(PROJECT_ROOT, provider.folder);
  
  if (!provider.hasRules) {
    log(`No rules found for ${provider.name}, skipping migration`);
    return;
  }
  
  const rulesDir = path.join(sourceDir, 'rules');
  if (!fs.existsSync(rulesDir)) {
    log(`No rules directory found for ${provider.name}, skipping migration`);
    return;
  }
  
  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetRulesDir)) {
    fs.mkdirSync(targetRulesDir, { recursive: true });
  }
  
  // Create .local directory for custom rules
  const localDir = path.join(targetRulesDir, '.local');
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }
  
  // Migrate existing rules to .local
  const files = fs.readdirSync(rulesDir);
  let migratedCount = 0;
  
  for (const file of files) {
    if (file === '.local' || file === 'shared' || file === 'typescript' || file === 'python') {
      continue; // Skip system directories
    }
    
    const sourcePath = path.join(rulesDir, file);
    const destPath = path.join(localDir, file);
    
    fs.copyFileSync(sourcePath, destPath);
    fs.unlinkSync(sourcePath);
    migratedCount++;
  }
  
  if (migratedCount > 0) {
    log(`Migrated ${migratedCount} custom rules to .local/ for ${provider.name}`, 'success');
  }
}

async function setupCentralizedRules() {
  const devDir = path.join(PROJECT_ROOT, '.dev');
  const rulesDir = path.join(devDir, 'rules');
  
  log('Setting up centralized rules...');
  
  // Create .dev directory structure
  if (!fs.existsSync(devDir)) {
    fs.mkdirSync(devDir, { recursive: true });
    log('Created .dev/ directory', 'success');
  }
  
  if (!fs.existsSync(rulesDir)) {
    fs.mkdirSync(rulesDir, { recursive: true });
    log('Created .dev/rules/ directory', 'success');
  }
  
  // Create shared rules symlink
  const sharedRulesSource = path.join(TEMPLATES_DIR, 'shared', 'rules');
  const sharedRulesDest = path.join(rulesDir, 'shared');
  if (fs.existsSync(sharedRulesDest)) {
    fs.unlinkSync(sharedRulesDest);
  }
  fs.symlinkSync(sharedRulesSource, sharedRulesDest, 'dir');
  log('Created shared rules symlink', 'success');
  
  // Create language-specific rules symlink (detect language)
  const language = detectLanguage();
  const languageRulesSource = path.join(TEMPLATES_DIR, 'languages', language, 'rules');
  const languageRulesDest = path.join(rulesDir, language);
  
  if (fs.existsSync(languageRulesSource)) {
    if (fs.existsSync(languageRulesDest)) {
      fs.unlinkSync(languageRulesDest);
    }
    fs.symlinkSync(languageRulesSource, languageRulesDest, 'dir');
    log(`Created ${language} rules symlink`, 'success');
  } else {
    log(`No ${language} rules available, skipping`, 'warn');
  }
  
  // Create .local directory
  const localDir = path.join(rulesDir, '.local');
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
    log('Created .dev/rules/.local/ directory', 'success');
  }
  
  // Create hooks directory
  const hooksDir = path.join(devDir, 'hooks');
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
    log('Created .dev/hooks/ directory', 'success');
  }
  
  // Copy hook scripts
  const hooksSourceDir = path.join(TEMPLATES_DIR, 'dev', 'hooks');
  const hooks = ['session-start.js', 'session-end.js', 'todo-commit.js'];
  
  for (const hook of hooks) {
    const sourcePath = path.join(hooksSourceDir, hook);
    const destPath = path.join(hooksDir, hook);
    
    if (fs.existsSync(sourcePath) && !fs.existsSync(destPath)) {
      fs.copyFileSync(sourcePath, destPath);
      try {
        fs.chmodSync(destPath, 0o755);
      } catch (error) {
        // Ignore permission errors on Windows
      }
      log(`Created ${hook}`, 'success');
    }
  }
  
  // Create README files
  const readmeContent = `# Centralized Rules Directory

This directory contains **centralized rules** for all AI coding assistants, eliminating duplication across provider folders.

## Structure

\`\`\`
.dev/rules/
├── shared/              # Language-agnostic rules (symlinked)
│   ├── clean-architecture.md
│   ├── repository-pattern.md
│   └── testing-principles.md
├── ${language}/          # Language-specific rules (symlinked)
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
  
  const rulesReadmePath = path.join(rulesDir, 'README.md');
  if (!fs.existsSync(rulesReadmePath)) {
    fs.writeFileSync(rulesReadmePath, readmeContent);
  }
  
  const localReadmePath = path.join(localDir, 'README.md');
  if (!fs.existsSync(localReadmePath)) {
    const localReadmeContent = `# Local Rules Directory

This directory contains **project-specific custom rules** that override or extend the base rules migrated from your previous setup.

## Migrated Rules

Your existing custom rules have been migrated here. They will override the base rules with the same names.

## How to Customize

### Override Base Rules
Create a file with the same name as a base rule to override it:
\`\`\`
.local/
  └── clean-architecture.md    # Overrides shared/clean-architecture.md
\`\`\`

### Add New Rules
Add new markdown files for project-specific requirements:
\`\`\`
.local/
  └── custom-api-standards.md
  └── database-conventions.md
\`\`\`

---

*These local rules ensure your project follows both team standards and project-specific requirements.*
`;
    fs.writeFileSync(localReadmePath, localReadmeContent);
  }
  
  log('Centralized rules setup complete', 'success');
}

function detectLanguage() {
  // Detect TypeScript
  if (fs.existsSync(path.join(PROJECT_ROOT, 'tsconfig.json'))) {
    return 'typescript';
  }

  // Detect from package.json
  const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
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
  if (fs.existsSync(path.join(PROJECT_ROOT, 'requirements.txt')) ||
      fs.existsSync(path.join(PROJECT_ROOT, 'pyproject.toml')) ||
      fs.existsSync(path.join(PROJECT_ROOT, 'setup.py')) ||
      fs.existsSync(path.join(PROJECT_ROOT, 'Pipfile'))) {
    return 'python';
  }

  // Default to JavaScript
  return 'javascript';
}

async function main() {
  console.log(chalk.blue.bold('\n🔄 Migration to Centralized Rules\n'));
  console.log(chalk.gray('This script will migrate your existing AI tool configurations to the new centralized .dev/rules/ structure.\n'));
  
  // Detect existing providers
  const providers = detectExistingProviders();
  
  if (providers.length === 0) {
    log('No existing AI tool configurations found. Run "ai-dotfiles-manager setup" to create new centralized structure.', 'warn');
    return;
  }
  
  console.log(chalk.blue('\n📋 Found Existing Configurations:\n'));
  providers.forEach(provider => {
    const status = provider.hasRules ? '✅ Has rules' : '⚠️  No rules';
    console.log(chalk.white(`  ${provider.name}: ${status}`));
  });
  
  const { shouldMigrate } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'shouldMigrate',
      message: 'Migrate existing rules to centralized .dev/rules/ structure?',
      default: true,
    },
  ]);
  
  if (!shouldMigrate) {
    log('Migration cancelled by user.', 'warn');
    return;
  }
  
  console.log(chalk.blue('\n🔄 Starting Migration...\n'));
  
  // Create backup of existing configurations
  const backupDir = path.join(PROJECT_ROOT, '.ai-backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  for (const provider of providers) {
    if (provider.hasRules) {
      const backupPath = backupExistingFiles(provider.folder, backupDir);
      if (backupPath) {
        log(`Backed up ${provider.name} to ${path.relative(PROJECT_ROOT, backupPath)}`, 'success');
      }
      
      // Migrate rules to centralized structure
      migrateProviderRules(provider, path.join(PROJECT_ROOT, '.dev', 'rules'));
      
      // Remove old configuration (optional - keep for safety)
      const { removeOld } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'removeOld',
          message: `Remove old ${provider.name} configuration?`,
          default: false,
        },
      ]);
      
      if (removeOld) {
        const sourceDir = path.join(PROJECT_ROOT, provider.folder);
        if (fs.existsSync(sourceDir)) {
          fs.rmSync(sourceDir, { recursive: true });
          log(`Removed old ${provider.name} configuration`, 'success');
        }
      }
    }
  }
  
  // Set up centralized rules
  await setupCentralizedRules();
  
  // Update provider configurations to point to centralized rules
  console.log(chalk.blue('\n🔄 Updating Provider Configurations...\n'));
  
  for (const provider of providers) {
    if (provider.folder === '.claude') {
      await updateClaudeConfig();
    } else if (provider.folder === '.cursorrules') {
      await updateCursorConfig();
    } else if (provider.folder === '.kilocode') {
      await updateKiloConfig();
    } else if (provider.folder === '.roo') {
      await updateRooConfig();
    }
  }
  
  console.log(chalk.green.bold('\n✅ Migration Complete!\n'));
  console.log(chalk.blue('Your AI tools now use centralized rules from .dev/rules/\n'));
  console.log(chalk.gray('Run "ai-dotfiles-manager update" to get the latest templates\n'));
  console.log(chalk.gray('Session hooks will automatically load rules and commit completed todos\n'));
}

async function updateClaudeConfig() {
  const settingsPath = path.join(PROJECT_ROOT, '.claude', 'settings.json');
  const settingsContent = {
    "rulesDirectory": "../.dev/rules",
    "commandsDirectory": ".claude/commands",
    "workflowsDirectory": ".claude/workflows",
    "autoLoadRules": true,
    "sessionHooks": {
      "start": "../.dev/hooks/session-start.js",
      "end": "../.dev/hooks/session-end.js"
    },
    "excludePatterns": [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/lib/**",
      "**/.git/**",
      "**/coverage/**",
      "**/.next/**",
      "**/.nuxt/**"
    ],
    "allowedCommands": [
      "/create-repo",
      "/create-service",
      "/create-error",
      "/create-tests"
    ]
  };
  
  fs.writeFileSync(settingsPath, JSON.stringify(settingsContent, null, 2));
  log('Updated Claude Code configuration', 'success');
}

async function updateCursorConfig() {
  const cursorRulesPath = path.join(PROJECT_ROOT, '.cursorrules');
  const cursorContent = `# Cursor AI Configuration
# This file points to centralized rules in .dev/rules/

# Load centralized shared rules
> ../.dev/rules/shared/clean-architecture.md
> ../.dev/rules/shared/repository-pattern.md
> ../.dev/rules/shared/testing-principles.md

# Load language-specific rules (adjust based on your project)
> ../.dev/rules/typescript/coding-standards.md
> ../.dev/rules/typescript/testing.md

# Load project-specific custom rules
> ../.dev/rules/.local/custom-rules.md

# Session hooks (if supported)
# Start: ../.dev/hooks/session-start.js
# End: ../.dev/hooks/session-end.js

---

## Development Standards

### Clean Architecture
- Follow layer separation: Domain → Application → Infrastructure
- Dependencies point inward
- Use dependency injection

### Code Quality
- Write clean, readable code
- Add meaningful comments
- Follow established patterns

### Todo Management
- Use .dev/todo.md for task tracking
- Completed tasks are auto-committed
- Keep tasks specific and actionable

---

*This configuration loads rules from centralized .dev/rules/ directory.*
*Custom rules can be added to .dev/rules/.local/*
`;
  
  fs.writeFileSync(cursorRulesPath, cursorContent);
  log('Updated Cursor configuration', 'success');
}

async function updateKiloConfig() {
  const configPath = path.join(PROJECT_ROOT, '.kilocode', 'config.json');
  const configContent = {
    "rulesDirectory": "../.dev/rules",
    "sessionHooks": {
      "start": "../.dev/hooks/session-start.js",
      "end": "../.dev/hooks/session-end.js"
    },
    "autoLoadRules": true,
    "excludePatterns": [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/lib/**",
      "**/.git/**",
      "**/coverage/**",
      "**/.next/**",
      "**/.nuxt/**"
    ],
    "features": {
      "autoCommit": true,
      "sessionTracking": true,
      "architectureGeneration": true
    }
  };
  
  fs.writeFileSync(configPath, JSON.stringify(configContent, null, 2));
  log('Updated Kilo Code configuration', 'success');
}

async function updateRooConfig() {
  const configPath = path.join(PROJECT_ROOT, '.roo', 'config.json');
  const configContent = {
    "rulesDirectory": "../.dev/rules",
    "sessionHooks": {
      "start": "../.dev/hooks/session-start.js",
      "end": "../.dev/hooks/session-end.js"
    },
    "autoLoadRules": true,
    "excludePatterns": [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/lib/**",
      "**/.git/**",
      "**/coverage/**",
      "**/.next/**",
      "**/.nuxt/**"
    ],
    "features": {
      "autoCommit": true,
      "sessionTracking": true,
      "architectureGeneration": true
    }
  };
  
  fs.writeFileSync(configPath, JSON.stringify(configContent, null, 2));
  log('Updated Roo Code configuration', 'success');
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    log(`Migration failed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { 
  main, 
  detectExistingProviders, 
  migrateProviderRules, 
  setupCentralizedRules 
};