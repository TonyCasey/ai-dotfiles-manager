/**
 * Provider Factory
 * Creates provider instances based on tool name
 */

const ClaudeProvider = require('./claude-provider');
const GeminiProvider = require('./gemini-provider');
const CursorProvider = require('./cursor-provider');

/**
 * Creates a provider instance
 * @param {string} toolName - Tool name ('claude', 'gemini', 'cursor', etc.)
 * @param {string} projectRoot - Project root directory
 * @param {string} templatesDir - Templates directory
 * @param {Object} options - Provider options
 * @returns {Object} Provider instance
 */
function createProvider(toolName, projectRoot, templatesDir, options = {}) {
  switch (toolName) {
    case 'claude':
      return new ClaudeProvider(projectRoot, templatesDir, options);
    case 'gemini':
      return new GeminiProvider(projectRoot, templatesDir, options);
    case 'cursor':
      return new CursorProvider(projectRoot, templatesDir, options);
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

/**
 * Sets up a tool using the appropriate provider
 * @param {string} toolName - Tool name
 * @param {string} projectRoot - Project root directory
 * @param {string} templatesDir - Templates directory
 * @param {Object} options - Provider options
 * @returns {Promise<Object>} Setup result
 */
async function setupTool(toolName, projectRoot, templatesDir, options = {}) {
  const provider = createProvider(toolName, projectRoot, templatesDir, options);
  return await provider.setup();
}

module.exports = {
  createProvider,
  setupTool,
  ClaudeProvider,
  GeminiProvider,
  CursorProvider,
};
