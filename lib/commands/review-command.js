/**
 * Review Command Handler
 * Handles code review operations
 */

const { detectLanguage } = require('../language-detector');
const { discoverRuleFiles, writeCodexManifestAndIndex } = require('../template-manager');
const { setupCodexGuide } = require('../dev-workspace');

/**
 * Executes the review command
 * @param {string} projectRoot - Project root directory
 * @param {Object} options - Command options
 * @param {boolean} options.detailed - Show detailed output
 * @param {boolean} options.json - JSON output format
 * @param {boolean} options.fix - Auto-fix issues
 * @param {boolean} options.noCodexGuide - Skip Codex guide refresh
 * @returns {Promise<void>}
 */
async function executeReview(projectRoot, options = {}) {
  // Auto-refresh Codex guide block on review command
  if (!options.noCodexGuide) {
    try {
      const language = detectLanguage(projectRoot) || 'typescript';
      const discovered = discoverRuleFiles(projectRoot, language);
      await writeCodexManifestAndIndex(projectRoot, language, discovered);
      await setupCodexGuide(projectRoot, language, true, discovered);
    } catch (error) {
      // Non-fatal if Codex guide update fails
    }
  }

  // Load and execute the code reviewer
  const CodeReviewer = require('../../scripts/review.js');

  const reviewOptions = {
    detailed: options.detailed || false,
    fix: options.fix || false,
    format: options.json ? 'json' : 'console',
  };

  const reviewer = new CodeReviewer(projectRoot, reviewOptions);
  const violations = await reviewer.analyze();

  // Exit with error code if there are errors
  if (violations.errors.length > 0) {
    process.exit(1);
  }
}

module.exports = {
  executeReview,
};
