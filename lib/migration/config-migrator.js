/**
 * Configuration Migration Module
 * Handles migration of existing AI tool configurations
 * Follows Single Responsibility Principle
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

/**
 * Migrates existing configuration directory to .local
 * @param {string} configDir - Configuration directory path
 * @param {string} action - Migration action (migrate-supersede or migrate-preserve)
 * @param {Object} options - Options object
 * @param {Object} options.fs - File system module (for dependency injection)
 * @param {Function} options.log - Logging function
 * @returns {Object} Migration result
 */
function migrateConfigToLocal(configDir, action, options = {}) {
  const fsModule = options.fs || fs;
  const log = options.log || console.log;

  const rulesDir = path.join(configDir, 'rules');
  const localDir = path.join(rulesDir, '.local');

  // Check if there are rule files to migrate
  const filesToMigrate = [];

  // Check root level
  const rootFiles = fsModule.readdirSync(configDir).filter(file => {
    const filePath = path.join(configDir, file);
    return fsModule.statSync(filePath).isFile() && file.endsWith('.md');
  });

  // Check rules directory if it exists
  let rulesFiles = [];
  if (fsModule.existsSync(rulesDir)) {
    rulesFiles = fsModule.readdirSync(rulesDir).filter(file => {
      const filePath = path.join(rulesDir, file);
      return fsModule.statSync(filePath).isFile() && file.endsWith('.md');
    });
  }

  if (rootFiles.length === 0 && rulesFiles.length === 0) {
    return { filesMigrated: 0, action };
  }

  // Create .local directory
  fsModule.mkdirSync(localDir, { recursive: true });

  // Migrate root level markdown files
  for (const file of rootFiles) {
    const source = path.join(configDir, file);
    const dest = path.join(localDir, file);
    fsModule.copyFileSync(source, dest);
    fsModule.unlinkSync(source);
    filesToMigrate.push(file);
  }

  // Migrate rules directory markdown files
  for (const file of rulesFiles) {
    const source = path.join(rulesDir, file);
    const dest = path.join(localDir, file);
    fsModule.copyFileSync(source, dest);
    fsModule.unlinkSync(source);
    filesToMigrate.push(file);
  }

  if (filesToMigrate.length > 0) {
    log(chalk.green(`  ✓ Migrated ${filesToMigrate.length} files to .local/`));

    if (action === 'migrate-supersede') {
      log(chalk.blue('  ℹ Your .local/ files will supersede shared rules with same names'));
    } else {
      log(chalk.blue('  ℹ Your .local/ files preserved alongside shared rules'));
    }
  }

  return { filesMigrated: filesToMigrate.length, action, files: filesToMigrate };
}

/**
 * Migrates existing .cursorrules file to .cursorrules.local
 * @param {string} cursorRulesPath - Path to .cursorrules file
 * @param {string} projectRoot - Project root directory
 * @param {string} action - Migration action
 * @param {Object} options - Options object
 * @param {Object} options.fs - File system module (for dependency injection)
 * @param {Function} options.log - Logging function
 * @returns {Object} Migration result
 */
function migrateCursorConfig(cursorRulesPath, projectRoot, action, options = {}) {
  const fsModule = options.fs || fs;
  const log = options.log || console.log;

  const localPath = path.join(projectRoot, '.cursorrules.local');

  // If .cursorrules.local already exists, append content
  if (fsModule.existsSync(localPath)) {
    const existingContent = fsModule.readFileSync(cursorRulesPath, 'utf-8');
    const localContent = fsModule.readFileSync(localPath, 'utf-8');
    fsModule.writeFileSync(localPath, `${localContent}\n\n# Migrated from .cursorrules\n${existingContent}`);
    log(chalk.green('  ✓ Appended content to existing .cursorrules.local'));
  } else {
    fsModule.copyFileSync(cursorRulesPath, localPath);
    log(chalk.green('  ✓ Migrated to .cursorrules.local'));
  }

  // Remove old file
  fsModule.unlinkSync(cursorRulesPath);

  if (action === 'migrate-supersede') {
    log(chalk.blue('  ℹ Your .cursorrules.local will supersede shared rules'));
  } else {
    log(chalk.blue('  ℹ Your .cursorrules.local preserved alongside shared rules'));
  }

  return { migrated: true, action };
}

/**
 * Removes existing configuration files
 * @param {string} configDir - Configuration directory path
 * @param {Object} options - Options object
 * @param {Object} options.fs - File system module (for dependency injection)
 * @param {Function} options.log - Logging function
 */
function removeExistingConfig(configDir, options = {}) {
  const fsModule = options.fs || fs;
  const log = options.log || console.log;

  const files = fsModule.readdirSync(configDir);
  for (const file of files) {
    const filePath = path.join(configDir, file);
    const stats = fsModule.statSync(filePath);
    if (stats.isDirectory()) {
      fsModule.rmSync(filePath, { recursive: true });
    } else {
      fsModule.unlinkSync(filePath);
    }
  }

  log(chalk.green('  ✓ Removed existing files'));
}

module.exports = {
  migrateConfigToLocal,
  migrateCursorConfig,
  removeExistingConfig,
};
