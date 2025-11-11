/**
 * CLI Argument Parser Module
 * Follows Single Responsibility Principle - only parses command line arguments
 * Pure functions with no side effects for easy testing
 */

/**
 * Parses command line arguments into structured options
 * @param {string[]} argv - Command line arguments (process.argv.slice(2))
 * @returns {Object} Parsed command and options
 */
function parseArguments(argv = []) {
  const flags = argv.filter(arg => arg.startsWith('-'));
  const positionals = argv.filter(arg => !arg.startsWith('-'));
  const command = positionals[0] || null;
  const commandIndex = typeof command === 'string' ? argv.indexOf(command) : -1;
  
  return {
    command,
    commandArgs: commandIndex >= 0 ? argv.slice(commandIndex + 1) : [],
    flags,
    options: {
      autoYes: flags.includes('--yes') || flags.includes('-y'),
      noCodexGuide: flags.includes('--no-codex-guide'),
      detailed: flags.includes('--detailed'),
      json: flags.includes('--json'),
      fix: flags.includes('--fix'),
      help: flags.includes('--help') || flags.includes('-h'),
      version: flags.includes('--version') || flags.includes('-v'),
    }
  };
}

/**
 * Gets the command type from parsed arguments
 * @param {string|null} command - Command name
 * @returns {string} Normalized command type
 */
function getCommandType(command) {
  if (!command || command === 'init' || command === 'setup') {
    return 'setup';
  }
  if (command === 'update') {
    return 'update';
  }
  if (command === 'review') {
    return 'review';
  }
  if (command === 'commit-todo') {
    return 'commit-todo';
  }
  return 'unknown';
}

module.exports = {
  parseArguments,
  getCommandType,
};
