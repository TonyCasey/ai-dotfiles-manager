/**
 * Cursor Provider
 * Handles Cursor specific setup (.cursorrules file)
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { copyPath, writeFile } = require('../file-utils');
const { promptCursorMigrationAction } = require('../prompts');
const { migrateCursorConfig } = require('../migration/config-migrator');

class CursorProvider {
  /**
   * @param {string} projectRoot - Project root directory
   * @param {string} templatesDir - Templates directory
   * @param {Object} options - Options
   */
  constructor(projectRoot, templatesDir, options = {}) {
    this.projectRoot = projectRoot;
    this.templatesDir = templatesDir;
    this.autoYes = options.autoYes || false;
    this.fs = options.fs || fs;
    this.log = options.log || console.log;
    
    this.cursorRulesPath = path.join(projectRoot, '.cursorrules');
    this.templatePath = path.join(templatesDir, 'cursor', '.cursorrules');
  }

  /**
   * Main setup method
   */
  async setup() {
    this.log(chalk.blue('\n📦 Setting up Cursor...'));

    if (!this.fs.existsSync(this.templatePath)) {
      this.log(chalk.yellow('  ⚠ Cursor template not found, skipping'));
      return { skipped: true };
    }

    // Check if .cursorrules already exists
    if (this.fs.existsSync(this.cursorRulesPath)) {
      const action = await this.handleExistingConfig();
      if (action === 'skip') {
        this.log(chalk.gray('  Skipped Cursor setup'));
        return { skipped: true };
      }
    }

    // Copy template
    const result = copyPath(this.templatePath, this.cursorRulesPath, true, this.fs);
    if (result.success) {
      this.log(chalk.green('  ✓ Copied .cursorrules'));
    }

    // Create .cursorrules.local for custom overrides
    const cursorLocalPath = path.join(this.projectRoot, '.cursorrules.local');
    if (!this.fs.existsSync(cursorLocalPath)) {
      const localContent = '# Add your custom Cursor rules here\n# These rules will be loaded in addition to .cursorrules\n';
      writeFile(cursorLocalPath, localContent, this.fs);
      this.log(chalk.green('  ✓ Created .cursorrules.local for custom rules'));
    }

    this.log(chalk.green('  ✓ Cursor configuration set up'));
    return { success: true };
  }

  /**
   * Handles existing .cursorrules file
   */
  async handleExistingConfig() {
    this.log(chalk.yellow('\n  ⚠ Existing Cursor configuration detected'));

    let action;
    if (this.autoYes) {
      action = 'migrate-preserve';
    } else {
      action = await promptCursorMigrationAction();
    }

    if (action === 'skip') {
      return 'skip';
    }

    if (action === 'replace') {
      this.fs.unlinkSync(this.cursorRulesPath);
      this.log(chalk.green('  ✓ Removed existing file'));
      return 'replace';
    }

    if (action === 'migrate-supersede' || action === 'migrate-preserve') {
      migrateCursorConfig(this.cursorRulesPath, this.projectRoot, action, {
        fs: this.fs,
        log: this.log
      });
      return action;
    }

    return action;
  }
}

module.exports = CursorProvider;
