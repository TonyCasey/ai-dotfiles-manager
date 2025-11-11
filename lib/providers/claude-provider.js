/**
 * Claude Code Provider
 * Handles Claude Code specific setup
 */

const path = require('path');
const chalk = require('chalk');
const os = require('os');
const BaseProvider = require('./base-provider');
const { copyPath, ensureDirectory } = require('../file-utils');
const { promptOverwriteSettings } = require('../prompts');

class ClaudeProvider extends BaseProvider {
  constructor(projectRoot, templatesDir, options = {}) {
    super('claude', 'Claude Code', projectRoot, templatesDir, options);
  }

  /**
   * Sets up Claude commands in global directory
   * Claude commands are global, not project-specific
   */
  async setupCommands() {
    const globalCommandsDir = path.join(os.homedir(), '.claude', 'commands');
    const templateCommandsDir = path.join(this.templateDir, 'commands');

    if (!this.fs.existsSync(templateCommandsDir) || 
        this.fs.readdirSync(templateCommandsDir).length === 0) {
      return;
    }

    // Create global commands directory if it doesn't exist
    ensureDirectory(globalCommandsDir, this.fs);
    this.log(chalk.green('  ✓ Created global ~/.claude/commands directory'));

    // Copy commands to global directory
    const commandFiles = this.fs.readdirSync(templateCommandsDir)
      .filter(f => f.endsWith('.md'));
    
    for (const file of commandFiles) {
      const source = path.join(templateCommandsDir, file);
      const dest = path.join(globalCommandsDir, file);

      // Only copy if doesn't exist or is different
      if (!this.fs.existsSync(dest) || 
          this.fs.readFileSync(source, 'utf-8') !== this.fs.readFileSync(dest, 'utf-8')) {
        this.fs.copyFileSync(source, dest);
        this.log(chalk.green(`  ✓ Copied ${file} to global commands`));
      }
    }
    
    this.log(chalk.blue('  ℹ Commands available globally in all projects'));
  }

  /**
   * Sets up Claude settings.json
   */
  async setupSettings() {
    const settingsTemplate = path.join(this.templateDir, 'settings.json');
    const settingsTarget = path.join(this.configDir, 'settings.json');

    if (!this.fs.existsSync(settingsTemplate)) {
      return;
    }

    if (this.fs.existsSync(settingsTarget)) {
      if (this.autoYes) {
        // Non-interactive: do not overwrite project-specific settings by default
        this.log(chalk.gray('  Skipped settings.json'));
        return;
      }

      const overwrite = await promptOverwriteSettings();
      if (overwrite) {
        this.fs.copyFileSync(settingsTemplate, settingsTarget);
        this.log(chalk.green('  ✓ Copied settings.json (project-specific)'));
      } else {
        this.log(chalk.gray('  Skipped settings.json'));
      }
    } else {
      this.fs.copyFileSync(settingsTemplate, settingsTarget);
      this.log(chalk.green('  ✓ Copied settings.json (project-specific)'));
    }
  }

  /**
   * Sets up additional Claude-specific files (workflows, etc.)
   */
  async setupAdditional() {
    // Set up workflows directory if it has content
    const workflowsDir = path.join(this.configDir, 'workflows');
    const templateWorkflowsDir = path.join(this.templateDir, 'workflows');

    if (this.fs.existsSync(templateWorkflowsDir) && 
        this.fs.readdirSync(templateWorkflowsDir).length > 0) {
      const result = copyPath(templateWorkflowsDir, workflowsDir, true, this.fs);
      if (result.success) {
        this.log(chalk.green('  ✓ Copied workflows directory'));
      }
    }
  }
}

module.exports = ClaudeProvider;
