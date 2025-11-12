/**
 * Kilo Code Provider
 * Copies the managed config template into .kilocode/
 */

const BaseProvider = require('./base-provider');

class KiloProvider extends BaseProvider {
  constructor(projectRoot, templatesDir, options = {}) {
    super('kilocode', 'Kilo Code', projectRoot, templatesDir, options);
  }

  /**
   * Sets up Kilo config.json
   */
  async setupSettings() {
    await this.copyFileFromTemplate('config.json');
  }
}

module.exports = KiloProvider;
