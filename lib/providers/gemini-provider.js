/**
 * Gemini CLI Provider
 * Handles Gemini CLI specific setup
 */

const path = require('path');
const chalk = require('chalk');
const BaseProvider = require('./base-provider');
const { copyPath } = require('../file-utils');

class GeminiProvider extends BaseProvider {
  constructor(projectRoot, templatesDir, options = {}) {
    super('gemini', 'Gemini CLI', projectRoot, templatesDir, options);
  }

  /**
   * Sets up Gemini commands (project-specific)
   */
  async setupCommands() {
    const commandsDir = path.join(this.configDir, 'commands');
    const templateCommandsDir = path.join(this.templateDir, 'commands');

    if (this.fs.existsSync(templateCommandsDir) && 
        this.fs.readdirSync(templateCommandsDir).length > 0) {
      const result = copyPath(templateCommandsDir, commandsDir, true, this.fs);
      if (result.success) {
        this.log(chalk.green('  ✓ Copied commands directory'));
        this.log(chalk.blue('  ℹ Commands are available for use'));
      }
    }
  }

  /**
   * Sets up Gemini settings files
   */
  async setupSettings() {
    // Copy settings.json
    await this.copyFileFromTemplate('settings.json');

    // Copy tool-policy.json
    await this.copyFileFromTemplate('tool-policy.json');
  }
}

module.exports = GeminiProvider;
