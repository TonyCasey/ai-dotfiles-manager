/**
 * Roo Code Provider
 * Copies the managed config template into .roo/
 */

const BaseProvider = require('./base-provider');

class RooProvider extends BaseProvider {
  constructor(projectRoot, templatesDir, options = {}) {
    super('roo', 'Roo Code', projectRoot, templatesDir, options);
  }

  /**
   * Sets up Roo config.json
   */
  async setupSettings() {
    await this.copyFileFromTemplate('config.json');
  }
}

module.exports = RooProvider;
