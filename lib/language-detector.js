/**
 * Language Detection Module
 * Follows Single Responsibility Principle - only detects project language
 * Pure functions with no side effects for easy testing
 */

const fs = require('fs');
const path = require('path');

/**
 * Detects the programming language of a project
 * @param {string} projectRoot - Root directory of the project
 * @param {Object} fsModule - File system module (for dependency injection/testing)
 * @returns {string|null} Detected language or null
 */
function detectLanguage(projectRoot, fsModule = fs) {
  // TypeScript detection
  if (hasTypeScript(projectRoot, fsModule)) {
    return 'typescript';
  }

  // JavaScript detection (from package.json)
  if (hasJavaScript(projectRoot, fsModule)) {
    return 'javascript';
  }

  // Python detection
  if (hasPython(projectRoot, fsModule)) {
    return 'python';
  }

  return null;
}

/**
 * Checks if project uses TypeScript
 * @param {string} projectRoot - Root directory of the project
 * @param {Object} fsModule - File system module
 * @returns {boolean}
 */
function hasTypeScript(projectRoot, fsModule = fs) {
  // Check for tsconfig.json
  if (fsModule.existsSync(path.join(projectRoot, 'tsconfig.json'))) {
    return true;
  }

  // Check package.json for typescript dependency
  const packageJsonPath = path.join(projectRoot, 'package.json');
  if (fsModule.existsSync(packageJsonPath)) {
    try {
      const content = fsModule.readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      const hasTsDependency = packageJson.dependencies?.typescript;
      const hasTsDevDependency = packageJson.devDependencies?.typescript;

      return !!(hasTsDependency || hasTsDevDependency);
    } catch (error) {
      // Ignore parse errors
      return false;
    }
  }

  return false;
}

/**
 * Checks if project uses JavaScript
 * @param {string} projectRoot - Root directory of the project
 * @param {Object} fsModule - File system module
 * @returns {boolean}
 */
function hasJavaScript(projectRoot, fsModule = fs) {
  const packageJsonPath = path.join(projectRoot, 'package.json');

  // If package.json exists and no TypeScript, assume JavaScript
  if (fsModule.existsSync(packageJsonPath)) {
    return !hasTypeScript(projectRoot, fsModule);
  }

  return false;
}

/**
 * Checks if project uses Python
 * @param {string} projectRoot - Root directory of the project
 * @param {Object} fsModule - File system module
 * @returns {boolean}
 */
function hasPython(projectRoot, fsModule = fs) {
  const pythonFiles = [
    'requirements.txt',
    'pyproject.toml',
    'setup.py',
    'Pipfile',
  ];

  return pythonFiles.some(file =>
    fsModule.existsSync(path.join(projectRoot, file))
  );
}

/**
 * Detects framework from package.json
 * @param {string} projectRoot - Root directory of the project
 * @param {Object} fsModule - File system module
 * @returns {string} Detected framework or 'Unknown'
 */
function detectFramework(projectRoot, fsModule = fs) {
  const packageJsonPath = path.join(projectRoot, 'package.json');

  if (!fsModule.existsSync(packageJsonPath)) {
    return 'Unknown';
  }

  try {
    const content = fsModule.readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(content);

    const dependencies = [
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.devDependencies || {}),
    ];

    // Framework detection priority
    const frameworks = [
      { name: 'Next.js', packages: ['next'] },
      { name: 'NestJS', packages: ['@nestjs/core', 'nestjs'] },
      { name: 'React', packages: ['react'] },
      { name: 'Vue', packages: ['vue'] },
      { name: 'Express', packages: ['express'] },
      { name: 'Fastify', packages: ['fastify'] },
      { name: 'Koa', packages: ['koa'] },
    ];

    for (const framework of frameworks) {
      if (framework.packages.some(pkg => dependencies.includes(pkg))) {
        return framework.name;
      }
    }

    return 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
}

module.exports = {
  detectLanguage,
  hasTypeScript,
  hasJavaScript,
  hasPython,
  detectFramework,
};
