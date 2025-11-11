/**
 * Setup Command Handler
 * Orchestrates the setup workflow
 * Follows Single Responsibility Principle
 */

const chalk = require('chalk');
const { detectLanguage } = require('../language-detector');
const { confirmLanguage, selectLanguage, selectTools } = require('../prompts');
const { setupTool } = require('../providers');
const { setupDevFolder, setupCentralizedRules, writeCodexManifestAndIndex, setupCodexGuide, ensureAgentsTemplate } = require('../dev-workspace');
const { discoverRuleFiles } = require('../template-manager');
const { getPackageRoot, getTemplatesDir } = require('../template-manager');

/**
 * Executes the setup command
 * @param {string} projectRoot - Project root directory
 * @param {Object} options - Command options
 * @param {boolean} options.autoYes - Auto-yes mode
 * @param {boolean} options.noCodexGuide - Skip Codex guide generation
 * @returns {Promise<void>}
 */
async function executeSetup(projectRoot, options = {}) {
  const autoYes = options.autoYes || false;
  const noCodexGuide = options.noCodexGuide || false;

  console.log(chalk.blue.bold('\n🤖 AI Dotfiles Manager Setup\n'));

  if (autoYes) {
    console.log(chalk.gray('Running in non-interactive mode (--yes flag)\n'));
  }

  // Step 1: Detect and confirm language
  const language = await detectAndConfirmLanguage(projectRoot, autoYes);
  console.log('');

  // Step 2: Select AI tools to configure
  const tools = await selectAITools(autoYes);
  console.log('');

  // Step 3: Set up selected tools
  console.log(chalk.gray('Setting up with copied templates (customize via .local directories)...\n'));
  
  const packageRoot = getPackageRoot();
  const templatesDir = getTemplatesDir(packageRoot);
  
  for (const tool of tools) {
    await setupTool(tool, projectRoot, templatesDir, { autoYes });
  }

  // Step 4: Set up .dev folder for developer workspace
  await setupDevFolder(projectRoot, language, false, {});

  // Step 5: Set up centralized rules directory
  await setupCentralizedRules(projectRoot, language, false, autoYes, {});

  // Step 6: Generate Codex manifest/index and session guide
  if (!noCodexGuide) {
    ensureAgentsTemplate(projectRoot);
    const discovered = discoverRuleFiles(projectRoot, language);
    await writeCodexManifestAndIndex(projectRoot, language, discovered);
    await setupCodexGuide(projectRoot, language, false, discovered);
  }

  // Step 7: Set up TypeScript configuration if needed
  if (language === 'typescript') {
    await setupTypeScriptConfig(projectRoot, false, templatesDir);
  }

  // Step 8: Print success message and next steps
  console.log(chalk.green.bold('\n✅ Setup complete!\n'));
  printNextSteps(tools, language, false);
}

/**
 * Detects and confirms project language
 * @param {string} projectRoot - Project root directory
 * @param {boolean} autoYes - Auto-yes mode
 * @returns {Promise<string>} Confirmed language
 */
async function detectAndConfirmLanguage(projectRoot, autoYes) {
  const detectedLanguage = detectLanguage(projectRoot);
  let language;

  if (detectedLanguage) {
    console.log(chalk.gray(`Detected language: ${detectedLanguage}\n`));

    if (autoYes) {
      language = detectedLanguage;
      console.log(chalk.gray(`Using detected language: ${detectedLanguage}\n`));
    } else {
      const confirmed = await confirmLanguage(detectedLanguage);
      if (confirmed) {
        language = detectedLanguage;
      }
    }
  }

  if (!language) {
    if (autoYes) {
      language = 'typescript';
      console.log(chalk.gray('No language detected, defaulting to TypeScript\n'));
    } else {
      language = await selectLanguage();
    }
  }

  return language;
}

/**
 * Selects AI tools to configure
 * @param {boolean} autoYes - Auto-yes mode
 * @returns {Promise<string[]>} Selected tools
 */
async function selectAITools(autoYes) {
  if (autoYes) {
    console.log(chalk.gray('Defaulting to Claude Code\n'));
    return ['claude'];
  }

  const tools = await selectTools();
  
  if (tools.length === 0) {
    console.log(chalk.gray('\n  → No provider folders selected'));
  } else {
    console.log(chalk.gray(`\n  → Selected: ${tools.join(', ')}`));
  }

  return tools;
}

/**
 * Sets up TypeScript configuration files
 * @param {string} projectRoot - Project root directory
 * @param {boolean} isUpdate - Whether this is an update
 * @param {string} templatesDir - Templates directory
 * @returns {Promise<void>}
 */
async function setupTypeScriptConfig(projectRoot, isUpdate, templatesDir) {
  const fs = require('fs');
  const path = require('path');
  
  console.log(chalk.blue('\n📦 Setting up TypeScript configuration files...'));

  const tsConfigFiles = [
    { source: 'tsconfig.json', dest: 'tsconfig.json' },
    { source: 'tsconfig.test.json', dest: 'tsconfig.test.json' },
    { source: 'tsconfig.eslint.json', dest: 'tsconfig.eslint.json' },
    { source: '.eslintrc.json', dest: '.eslintrc.json' }
  ];

  for (const { source, dest } of tsConfigFiles) {
    const sourcePath = path.join(templatesDir, 'languages', 'typescript', source);
    const destPath = path.join(projectRoot, dest);

    if (!fs.existsSync(sourcePath)) {
      console.log(chalk.yellow(`  ⚠ Template file ${source} not found, skipping`));
      continue;
    }

    if (fs.existsSync(destPath)) {
      const backupPath = `${destPath}.bak`;
      let backupNumber = 1;
      let finalBackupPath = backupPath;

      while (fs.existsSync(finalBackupPath)) {
        finalBackupPath = `${destPath}.bak${backupNumber}`;
        backupNumber++;
      }

      fs.copyFileSync(destPath, finalBackupPath);
      console.log(chalk.yellow(`  ⚠ Backed up existing ${dest} to ${path.basename(finalBackupPath)}`));
    }

    fs.copyFileSync(sourcePath, destPath);
    console.log(chalk.green(`  ✓ Created ${dest}`));
  }

  console.log(chalk.blue('  ℹ TypeScript configuration files provide strict type checking and linting'));
}

/**
 * Prints next steps for the user
 * @param {string[]} tools - Selected tools
 * @param {string} language - Project language
 * @param {boolean} isUpdate - Whether this was an update
 */
function printNextSteps(tools, language, isUpdate) {
  const toolSummary = tools.length
    ? tools.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')
    : 'none (Codex only)';

  if (isUpdate) {
    console.log(chalk.bold('✨ Configuration Updated:\n'));
    console.log(chalk.gray(`Language: ${language}`));
    console.log(chalk.gray(`Updated tools: ${toolSummary}\n`));
    if (!tools.length) {
      console.log(chalk.gray('No provider folders selected — Codex will load .dev context only.\n'));
    }
    console.log(chalk.green('Your AI coding assistants now have the latest templates and rules!\n'));
    console.log(chalk.blue('💡 Run "ai-dotfiles-manager review" to check for architecture violations\n'));
    return;
  }

  console.log(chalk.bold('📋 Next Steps:\n'));
  console.log(chalk.gray(`Language: ${language}\n`));

  if (!tools.length) {
    console.log(chalk.white('Codex (no provider folders):'));
    console.log(chalk.gray('  • .dev workspace + DESIGNcode.md copied for Codex session bootstrap'));
    console.log(chalk.gray('  • No .claude/.cursor/.kilo/.roo folders were installed\n'));
  }

  if (tools.includes('claude')) {
    console.log(chalk.white('Claude Code:'));
    console.log(chalk.gray('  • Rules loaded from centralized .dev/rules/'));
    console.log(chalk.gray('    - shared/ (managed copies)'));
    console.log(chalk.gray(`    - ${language}/ (managed copies)`));
    console.log(chalk.gray('    - .local/ (your custom rules)'));
    console.log(chalk.gray('  • Commands are available as slash commands'));
    console.log(chalk.gray('  • Session hooks: Auto-load rules and commit completed todos\n'));
  }

  if (tools.includes('gemini')) {
    console.log(chalk.white('Gemini CLI:'));
    console.log(chalk.gray('  • Rules loaded from centralized .dev/rules/'));
    console.log(chalk.gray('  • Session hooks: Auto-load rules and commit completed todos'));
    console.log(chalk.gray('  • Tool policy: Includes tool-policy.json for guided tool use\n'));
  }

  if (tools.includes('cursor')) {
    console.log(chalk.white('Cursor:'));
    console.log(chalk.gray('  • Rules loaded from centralized .dev/rules/'));
    console.log(chalk.gray('    - Via .cursorrules pointing to .dev/rules/'));
    console.log(chalk.gray('  • Customize: Edit .cursorrules.local\n'));
  }

  if (language === 'typescript') {
    console.log(chalk.blue('💡 TypeScript configuration files added'));
    console.log(chalk.blue('💡 Existing config files are backed up with .bak extension'));
  }
  console.log(chalk.blue('💡 All rules are now centralized in .dev/rules/ - no more duplication!'));
  console.log(chalk.blue('💡 Run "ai-dotfiles-manager update" to get the latest templates'));
  console.log(chalk.blue('💡 Run "ai-dotfiles-manager review" to check for architecture violations\n'));
}

module.exports = {
  executeSetup,
  detectAndConfirmLanguage,
  selectAITools,
  setupTypeScriptConfig,
  printNextSteps,
};
