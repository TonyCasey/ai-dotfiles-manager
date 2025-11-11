/**
 * User Interaction Prompts Module
 * Follows Single Responsibility Principle - handles user prompts
 * Uses dependency injection for testability
 */

const inquirer = require('inquirer');

/**
 * Prompts user to confirm detected language
 * @param {string} language - Detected language
 * @param {Object} inquirerModule - Inquirer module (for dependency injection)
 * @returns {Promise<boolean>} Whether user confirmed
 */
async function confirmLanguage(language, inquirerModule = inquirer) {
  const { confirmLanguage } = await inquirerModule.prompt([
    {
      type: 'confirm',
      name: 'confirmLanguage',
      message: `Use ${language} for this project?`,
      default: true,
    },
  ]);
  return confirmLanguage;
}

/**
 * Prompts user to select a language
 * @param {Object} inquirerModule - Inquirer module (for dependency injection)
 * @returns {Promise<string>} Selected language
 */
async function selectLanguage(inquirerModule = inquirer) {
  const { selectedLanguage } = await inquirerModule.prompt([
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
  return selectedLanguage;
}

/**
 * Prompts user to select AI tools to configure
 * @param {Object} inquirerModule - Inquirer module (for dependency injection)
 * @returns {Promise<string[]>} Selected tools
 */
async function selectTools(inquirerModule = inquirer) {
  const { tools } = await inquirerModule.prompt([
    {
      type: 'checkbox',
      name: 'tools',
      message: 'Which AI tools would you like to configure? (Space to select)',
      choices: [
        { name: '✨ Select All', value: 'all', checked: true },
        new inquirerModule.Separator(),
        { name: 'Claude Code', value: 'claude', checked: true },
        { name: 'Gemini CLI', value: 'gemini', checked: true },
        { name: 'Cursor', value: 'cursor', checked: false },
        { name: 'Kilo Code', value: 'kilo', checked: false },
        { name: 'Roo Code', value: 'roo', checked: false },
        new inquirerModule.Separator(),
        { name: '🚫 None (Codex only — skip provider folders)', value: 'none', checked: false },
      ],
    },
  ]);

  // Handle "Select All" option
  if (tools.includes('all')) {
    return ['claude', 'gemini', 'cursor', 'kilo', 'roo'];
  }
  
  // Handle "None" option
  if (tools.includes('none')) {
    return [];
  }
  
  return tools;
}

/**
 * Prompts user for migration action when existing config is found
 * @param {string} toolName - Name of the tool
 * @param {Object} inquirerModule - Inquirer module (for dependency injection)
 * @returns {Promise<string>} Migration action
 */
async function promptMigrationAction(toolName, inquirerModule = inquirer) {
  const { action } = await inquirerModule.prompt([
    {
      type: 'list',
      name: 'action',
      message: `  How would you like to handle existing ${toolName} files?`,
      choices: [
        {
          name: 'Replace with new setup',
          value: 'replace',
          short: 'Replace'
        },
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
          name: 'Skip - keep existing configuration as-is',
          value: 'skip',
          short: 'Skip'
        }
      ],
      default: 'replace'
    }
  ]);
  return action;
}

/**
 * Prompts user for Cursor config migration action
 * @param {Object} inquirerModule - Inquirer module (for dependency injection)
 * @returns {Promise<string>} Migration action
 */
async function promptCursorMigrationAction(inquirerModule = inquirer) {
  const { action } = await inquirerModule.prompt([
    {
      type: 'list',
      name: 'action',
      message: '  How would you like to handle existing .cursorrules file?',
      choices: [
        {
          name: 'Replace with new setup',
          value: 'replace',
          short: 'Replace'
        },
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
          name: 'Skip - keep existing configuration as-is',
          value: 'skip',
          short: 'Skip'
        }
      ],
      default: 'replace'
    }
  ]);
  return action;
}

/**
 * Prompts user whether to replace an existing file
 * @param {string} filename - Name of the file
 * @param {Object} inquirerModule - Inquirer module (for dependency injection)
 * @returns {Promise<boolean>} Whether to replace
 */
async function promptReplace(filename, inquirerModule = inquirer) {
  const { replace } = await inquirerModule.prompt([
    {
      type: 'confirm',
      name: 'replace',
      message: `  ${filename} exists. Replace with copied templates?`,
      default: true,
    },
  ]);
  return replace;
}

/**
 * Prompts user whether to overwrite settings.json
 * @param {Object} inquirerModule - Inquirer module (for dependency injection)
 * @returns {Promise<boolean>} Whether to overwrite
 */
async function promptOverwriteSettings(inquirerModule = inquirer) {
  const { overwrite } = await inquirerModule.prompt([
    {
      type: 'confirm',
      name: 'overwrite',
      message: '  settings.json already exists. Overwrite?',
      default: false,
    },
  ]);
  return overwrite;
}

module.exports = {
  confirmLanguage,
  selectLanguage,
  selectTools,
  promptMigrationAction,
  promptCursorMigrationAction,
  promptReplace,
  promptOverwriteSettings,
};
