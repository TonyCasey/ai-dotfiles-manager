/**
 * File System Utilities Module
 * Follows Single Responsibility Principle - filesystem operations
 * Uses dependency injection for testability
 */

const fs = require('fs');
const path = require('path');

/**
 * Recursively copies a directory
 * @param {string} source - Source directory path
 * @param {string} dest - Destination directory path
 * @param {Object} fsModule - File system module (for dependency injection)
 */
function copyDirectorySync(source, dest, fsModule = fs) {
  fsModule.mkdirSync(dest, { recursive: true });
  const files = fsModule.readdirSync(source);

  for (const file of files) {
    const sourcePath = path.join(source, file);
    const destPath = path.join(dest, file);
    const stats = fsModule.statSync(sourcePath);

    if (stats.isDirectory()) {
      copyDirectorySync(sourcePath, destPath, fsModule);
    } else {
      fsModule.copyFileSync(sourcePath, destPath);
    }
  }
}

/**
 * Copies a file or directory with optional overwrite confirmation
 * @param {string} source - Source path
 * @param {string} target - Target path
 * @param {boolean} replace - Whether to replace existing file/directory
 * @param {Object} fsModule - File system module (for dependency injection)
 * @returns {Object} Result object with success status
 */
function copyPath(source, target, replace = true, fsModule = fs) {
  const isDirectory = fsModule.statSync(source).isDirectory();

  if (fsModule.existsSync(target)) {
    if (!replace) {
      return { success: false, skipped: true };
    }

    const stats = fsModule.lstatSync(target);
    if (stats.isDirectory()) {
      fsModule.rmSync(target, { recursive: true });
    } else {
      fsModule.unlinkSync(target);
    }
  }

  try {
    if (isDirectory) {
      copyDirectorySync(source, target, fsModule);
    } else {
      const parent = path.dirname(target);
      if (!fsModule.existsSync(parent)) {
        fsModule.mkdirSync(parent, { recursive: true });
      }
      fsModule.copyFileSync(source, target);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Ensures a directory exists, creating it if necessary
 * @param {string} dirPath - Directory path
 * @param {Object} fsModule - File system module (for dependency injection)
 */
function ensureDirectory(dirPath, fsModule = fs) {
  if (!fsModule.existsSync(dirPath)) {
    fsModule.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Writes content to a file, creating parent directories if necessary
 * @param {string} filePath - File path
 * @param {string} content - File content
 * @param {Object} fsModule - File system module (for dependency injection)
 */
function writeFile(filePath, content, fsModule = fs) {
  const parent = path.dirname(filePath);
  ensureDirectory(parent, fsModule);
  fsModule.writeFileSync(filePath, content);
}

/**
 * Lists markdown files in a directory
 * @param {string} dir - Directory path
 * @param {string} baseDir - Base directory for relative paths
 * @param {Object} fsModule - File system module (for dependency injection)
 * @returns {string[]} Array of relative file paths
 */
function listMarkdownFiles(dir, baseDir, fsModule = fs) {
  try {
    if (!fsModule.existsSync(dir)) return [];
    return fsModule.readdirSync(dir)
      .filter(f => f.toLowerCase().endsWith('.md'))
      .sort()
      .map(f => path.join(path.relative(baseDir, dir), f).replace(/\\/g, '/'));
  } catch (error) {
    return [];
  }
}

/**
 * Makes a file executable on Unix systems
 * @param {string} filePath - File path
 * @param {Object} fsModule - File system module (for dependency injection)
 */
function makeExecutable(filePath, fsModule = fs) {
  try {
    fsModule.chmodSync(filePath, 0o755);
  } catch (error) {
    // Ignore permission errors on Windows
  }
}

module.exports = {
  copyDirectorySync,
  copyPath,
  ensureDirectory,
  writeFile,
  listMarkdownFiles,
  makeExecutable,
};
