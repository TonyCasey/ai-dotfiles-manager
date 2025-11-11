/**
 * Update Command Handler
 * Handles updating existing configuration
 */

const { executeSetup } = require('./setup-command');

/**
 * Executes the update command
 * Update is essentially the same as setup, just with different messaging
 * @param {string} projectRoot - Project root directory
 * @param {Object} options - Command options
 * @returns {Promise<void>}
 */
async function executeUpdate(projectRoot, options = {}) {
  // Update is the same flow as setup, system handles existing configs via migration
  await executeSetup(projectRoot, options);
}

module.exports = {
  executeUpdate,
};
