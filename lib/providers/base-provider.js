/**
 * Base Provider Class
 * Abstract base class for AI tool provider setup
 * Follows Template Method Pattern and Single Responsibility Principle
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { copyPath, ensureDirectory, makeExecutable } = require('../file-utils');
const { migrateConfigToLocal, removeExistingConfig } = require('../migration/config-migrator');
const { promptMigrationAction } = require('../prompts');

/**
 * Base class for provider setup
 * Subclasses should override specific setup methods
 */
class BaseProvider {
  /**
   * @param {string} providerName - Provider name (e.g., 'claude', 'gemini')
   * @param {string} displayName - Display name (e.g., 'Claude Code')
   * @param {string} projectRoot - Project root directory
   * @param {string} templatesDir - Templates directory
   * @param {Object} options - Options
   * @param {boolean} options.autoYes - Auto-yes mode (skip prompts)
   * @param {Object} options.fs - File system module (for dependency injection)
   * @param {Function} options.log - Logging function
   */
  constructor(providerName, displayName, projectRoot, templatesDir, options = {}) {
    this.providerName = providerName;
    this.displayName = displayName;
    this.projectRoot = projectRoot;
    this.templatesDir = templatesDir;
    this.autoYes = options.autoYes || false;
    this.fs = options.fs || fs;
    this.log = options.log || console.log;
    
    this.configDir = path.join(projectRoot, `.${providerName}`);
    this.templateDir = path.join(templatesDir, providerName);
  }

  /**
   * Main setup method (Template Method Pattern)
   * Orchestrates the setup flow
   */
  async setup() {
    this.log(chalk.blue(`\n📦 Setting up ${this.displayName}...`));

    // Check for existing configuration
    const hasExisting = this.fs.existsSync(this.configDir) && 
                       this.fs.readdirSync(this.configDir).length > 0;

    if (hasExisting) {
      const action = await this.handleExistingConfig();
      if (action === 'skip') {
        this.log(chalk.gray(`  Skipped ${this.displayName} setup`));
        return { skipped: true };
      }
    } else {
      // Create config directory
      this.fs.mkdirSync(this.configDir, { recursive: true });
      this.log(chalk.gray(`  Created .${this.providerName} directory`));
    }

    // Provider-specific setup
    await this.setupHooks();
    await this.setupCommands();
    await this.setupSettings();
    await this.setupAdditional();

    this.log(chalk.green(`  ✓ ${this.displayName} configuration set up`));
    return { success: true };
  }

  /**
   * Handles existing configuration (migration or replacement)
   * @returns {Promise<string>} Action taken
   */
  async handleExistingConfig() {
    this.log(chalk.yellow(`\n  ⚠ Existing ${this.displayName} configuration detected`));

    let action;
    if (this.autoYes) {
      action = 'migrate-preserve'; // Safe default for CI
    } else {
      action = await promptMigrationAction(this.displayName);
    }

    if (action === 'skip') {
      return 'skip';
    }

    if (action === 'replace') {
      removeExistingConfig(this.configDir, { fs: this.fs, log: this.log });
      return 'replace';
    }

    if (action === 'migrate-supersede' || action === 'migrate-preserve') {
      migrateConfigToLocal(this.configDir, action, { fs: this.fs, log: this.log });
      return action;
    }

    return action;
  }

  /**
   * Sets up hooks directory
   * Override in subclass if hooks setup is different
   */
  async setupHooks() {
    const hooksDir = path.join(this.configDir, 'hooks');
    const templateHooksDir = path.join(this.templateDir, 'hooks');

    if (!this.fs.existsSync(templateHooksDir) || 
        this.fs.readdirSync(templateHooksDir).length === 0) {
      return;
    }

    ensureDirectory(hooksDir, this.fs);

    const hookFiles = this.fs.readdirSync(templateHooksDir);
    for (const file of hookFiles) {
      const source = path.join(templateHooksDir, file);
      const dest = path.join(hooksDir, file);

      // Only copy if doesn't exist (preserve custom hooks)
      if (!this.fs.existsSync(dest)) {
        this.fs.copyFileSync(source, dest);

        // Make hooks executable on Unix systems
        if (file.endsWith('.js')) {
          makeExecutable(dest, this.fs);
        }

        this.log(chalk.green(`  ✓ Copied ${file} to hooks/`));
      }
    }
    
    this.log(chalk.blue('  ℹ Hooks will run automatically on session start/end'));
  }

  /**
   * Sets up commands directory
   * Override in subclass if commands setup is different
   */
  async setupCommands() {
    // Default: no commands setup
    // Subclasses can override
  }

  /**
   * Sets up settings file(s)
   * Override in subclass for provider-specific settings
   */
  async setupSettings() {
    // Default: no settings setup
    // Subclasses can override
  }

  /**
   * Sets up additional provider-specific files
   * Override in subclass for additional setup
   */
  async setupAdditional() {
    // Default: no additional setup
    // Subclasses can override
  }

  /**
   * Copies a file from template to config directory
   * @param {string} filename - File name
   * @param {boolean} preserveExisting - Whether to preserve existing files
   * @returns {Object} Copy result
   */
  async copyFileFromTemplate(filename, preserveExisting = false) {
    const source = path.join(this.templateDir, filename);
    const dest = path.join(this.configDir, filename);

    if (!this.fs.existsSync(source)) {
      return { success: false, skipped: true, reason: 'Template not found' };
    }

    if (this.fs.existsSync(dest)) {
      if (preserveExisting) {
        this.log(chalk.gray(`  Skipped ${filename} (already exists)`));
        return { success: false, skipped: true, reason: 'Already exists' };
      }
    }

    const result = copyPath(source, dest, !preserveExisting, this.fs);
    if (result.success) {
      this.log(chalk.green(`  ✓ Copied ${filename}`));
    }
    return result;
  }
}

module.exports = BaseProvider;
