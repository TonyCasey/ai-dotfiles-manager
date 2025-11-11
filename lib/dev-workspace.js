/**
 * Dev Workspace Module
 * Handles .dev/ folder setup and management
 * Follows Single Responsibility Principle
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { ensureDirectory, writeFile, copyPath } = require('./file-utils');
const { 
  generateDevReadme, 
  generateTodoTemplate, 
  generateCentralizedRulesReadme,
  generateLocalRulesReadme,
  discoverRuleFiles,
  generateContextIndex,
  generateCodexManifest,
  getPackageRoot,
  getTemplatesDir
} = require('./template-manager');
const { generateArchitectureDoc } = require('./architecture-generator');
const { generateCodexGuide } = require('./codex-session-guide');

/**
 * Sets up .dev/ folder with architecture, todo, and README
 * @param {string} projectRoot - Project root directory
 * @param {string} language - Project language
 * @param {boolean} isUpdate - Whether this is an update operation
 * @param {Object} options - Options
 * @returns {Promise<void>}
 */
async function setupDevFolder(projectRoot, language, isUpdate, options = {}) {
  const fsModule = options.fs || fs;
  const log = options.log || console.log;
  
  const devDir = path.join(projectRoot, '.dev');
  const packageRoot = getPackageRoot();
  const devTemplatesDir = path.join(getTemplatesDir(packageRoot), 'dev');

  log(chalk.blue('\n📦 Setting up .dev folder...'));

  // Create .dev directory if it doesn't exist
  ensureDirectory(devDir, fsModule);
  if (!isUpdate) {
    log(chalk.green('  ✓ Created .dev/ directory'));
  }

  // Generate architecture.md (always regenerate to keep it fresh)
  const architecturePath = path.join(devDir, 'architecture.md');
  const architectureTemplatePath = path.join(devTemplatesDir, 'architecture.md');
  const sections = [];

  if (fsModule.existsSync(architectureTemplatePath)) {
    const templateContent = fsModule.readFileSync(architectureTemplatePath, 'utf-8').trim();
    if (templateContent.length) {
      sections.push(templateContent);
    }
  }

  const generatedContent = generateArchitectureDoc(projectRoot, language, { fs: fsModule }).trim();
  if (generatedContent.length) {
    sections.push(generatedContent);
  }

  const architectureContent = sections.join('\n\n---\n\n');
  writeFile(architecturePath, architectureContent ? `${architectureContent}\n` : '', fsModule);
  
  const usedTemplate = fsModule.existsSync(architectureTemplatePath) && sections.length > 1;
  log(chalk.green(usedTemplate
    ? '  ✓ Synced architecture.md template with auto-generated overview'
    : '  ✓ Generated architecture.md'));

  // Seed feature.md if it doesn't exist
  const featureTemplatePath = path.join(devTemplatesDir, 'feature.md');
  const featurePath = path.join(devDir, 'feature.md');
  if (fsModule.existsSync(featureTemplatePath)) {
    if (!fsModule.existsSync(featurePath)) {
      fsModule.copyFileSync(featureTemplatePath, featurePath);
      log(chalk.green('  ✓ Created feature.md from template'));
    } else {
      log(chalk.gray('  • Preserved existing feature.md'));
    }
  }

  // Create todo.md only if it doesn't exist (preserve user's tasks)
  const todoPath = path.join(devDir, 'todo.md');
  if (!fsModule.existsSync(todoPath)) {
    const todoContent = generateTodoTemplate();
    writeFile(todoPath, todoContent, fsModule);
    log(chalk.green('  ✓ Created todo.md'));
  } else {
    log(chalk.gray('  ⚬ Preserved existing todo.md'));
  }

  // Create README explaining .dev folder
  const readmePath = path.join(devDir, 'README.md');
  if (!fsModule.existsSync(readmePath)) {
    const readmeContent = generateDevReadme();
    writeFile(readmePath, readmeContent, fsModule);
    log(chalk.green('  ✓ Created README.md'));
  }

  // Copy Codex bootstrap instructions (always overwrite to keep in sync)
  const designSource = path.join(devTemplatesDir, 'DESIGNcode.md');
  if (fsModule.existsSync(designSource)) {
    const designDest = path.join(devDir, 'DESIGNcode.md');
    fsModule.copyFileSync(designSource, designDest);
    log(chalk.green('  ✓ Synced DESIGNcode.md Codex bootstrap'));
  }

  // Sync managed lint guides into .dev/lint
  const lintTemplateDir = path.join(devTemplatesDir, 'lint');
  const lintDestDir = path.join(devDir, 'lint');
  if (fsModule.existsSync(lintTemplateDir)) {
    ensureDirectory(lintDestDir, fsModule);

    const lintFiles = fsModule.readdirSync(lintTemplateDir)
      .filter(name => name.toLowerCase().endsWith('.md'));
    lintFiles.forEach(name => {
      const sourcePath = path.join(lintTemplateDir, name);
      const destPath = path.join(lintDestDir, name);
      fsModule.copyFileSync(sourcePath, destPath);
    });
    if (lintFiles.length) {
      log(chalk.green('  ✓ Synced lint guides into .dev/lint/'));
    }
  }

  log(chalk.blue('  ℹ .dev/ is auto-loaded into AI context on every session'));
}

/**
 * Sets up centralized rules directory in .dev/rules/
 * @param {string} projectRoot - Project root directory
 * @param {string} language - Project language
 * @param {boolean} isUpdate - Whether this is an update operation
 * @param {boolean} autoYes - Auto-yes mode
 * @param {Object} options - Options
 * @returns {Promise<void>}
 */
async function setupCentralizedRules(projectRoot, language, isUpdate, autoYes, options = {}) {
  const fsModule = options.fs || fs;
  const log = options.log || console.log;
  
  const packageRoot = getPackageRoot();
  const templatesDir = getTemplatesDir(packageRoot);
  const devDir = path.join(projectRoot, '.dev');
  const rulesDir = path.join(devDir, 'rules');

  log(chalk.blue('\n📦 Setting up centralized rules...'));

  // Create .dev/rules directory structure
  ensureDirectory(rulesDir, fsModule);
  if (!isUpdate) {
    log(chalk.green('  ✓ Created .dev/rules/ directory'));
  }

  // Copy shared rules
  const sharedRulesSource = path.join(templatesDir, 'shared', 'rules');
  const sharedRulesDest = path.join(rulesDir, 'shared');
  const sharedResult = copyPath(sharedRulesSource, sharedRulesDest, true, fsModule);
  if (sharedResult.success) {
    log(chalk.green('  ✓ Copied shared rules'));
  }

  // Copy language-specific rules
  const languageRulesSource = path.join(templatesDir, 'languages', language, 'rules');
  const languageRulesDest = path.join(rulesDir, language);

  if (fsModule.existsSync(languageRulesSource)) {
    const languageResult = copyPath(languageRulesSource, languageRulesDest, true, fsModule);
    if (languageResult.success) {
      log(chalk.green(`  ✓ Copied ${language} rules`));
    }
  } else {
    log(chalk.yellow(`  ⚠ No ${language} rules available, skipping`));
  }

  // Create .local directory for custom rules
  const rulesLocalDir = path.join(rulesDir, '.local');
  if (!fsModule.existsSync(rulesLocalDir)) {
    ensureDirectory(rulesLocalDir, fsModule);
    log(chalk.green('  ✓ Created .dev/rules/.local/ for custom rules'));
  }

  // Create README in .local directory
  const localReadmePath = path.join(rulesLocalDir, 'README.md');
  if (!fsModule.existsSync(localReadmePath)) {
    const localReadmeContent = generateLocalRulesReadme();
    writeFile(localReadmePath, localReadmeContent, fsModule);
    log(chalk.green('  ✓ Created .local/README.md'));
  }

  // Create README in rules directory
  const rulesReadmePath = path.join(rulesDir, 'README.md');
  if (!fsModule.existsSync(rulesReadmePath)) {
    const rulesReadmeContent = generateCentralizedRulesReadme();
    writeFile(rulesReadmePath, rulesReadmeContent, fsModule);
    log(chalk.green('  ✓ Created .dev/rules/README.md'));
  }

  log(chalk.green('  ✓ Centralized rules set up'));
}

/**
 * Writes Codex manifest and context index
 * @param {string} projectRoot - Project root directory
 * @param {string} language - Project language
 * @param {Object} files - Discovered rule files
 * @param {Object} options - Options
 * @returns {Promise<void>}
 */
async function writeCodexManifestAndIndex(projectRoot, language, files, options = {}) {
  const fsModule = options.fs || fs;
  const log = options.log || console.log;
  
  const devDir = path.join(projectRoot, '.dev');
  ensureDirectory(devDir, fsModule);

  const manifestPath = path.join(devDir, 'codex-manifest.json');
  const indexPath = path.join(devDir, 'context-index.md');

  const manifest = generateCodexManifest(projectRoot, language, files, fsModule);
  const index = generateContextIndex(language, files);

  try {
    writeFile(manifestPath, JSON.stringify(manifest, null, 2), fsModule);
    writeFile(indexPath, index, fsModule);
    log(chalk.green('  ✓ Generated Codex manifest and context index'));
  } catch (e) {
    log(chalk.yellow(`  ⚠ Skipped manifest/index generation: ${e.message}`));
  }
}

/**
 * Sets up Codex guide in AGENTS.md
 * @param {string} projectRoot - Project root directory
 * @param {string} language - Project language
 * @param {boolean} isUpdate - Whether this is an update
 * @param {Object} files - Discovered rule files (optional)
 * @param {Object} options - Options
 * @returns {Promise<void>}
 */
async function setupCodexGuide(projectRoot, language, isUpdate, files, options = {}) {
  const fsModule = options.fs || fs;
  const log = options.log || console.log;
  
  const agentsPath = path.join(projectRoot, 'AGENTS.md');
  const discoveredFiles = files || discoverRuleFiles(projectRoot, language, fsModule);
  const guideBlock = generateCodexGuide(language, { files: discoveredFiles });

  const startMarker = '<!-- ai-dotfiles-manager:codex-guide:start -->';
  const endMarker = '<!-- ai-dotfiles-manager:codex-guide:end -->';

  try {
    if (fsModule.existsSync(agentsPath)) {
      const current = fsModule.readFileSync(agentsPath, 'utf-8');
      const startIdx = current.indexOf(startMarker);
      const endIdx = current.indexOf(endMarker);

      let nextContent;
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        // Replace existing managed block
        nextContent = current.substring(0, startIdx) + guideBlock + current.substring(endIdx + endMarker.length);
      } else {
        // Append new managed block at the end with spacing
        nextContent = current.trimEnd() + '\n\n' + guideBlock + '\n';
      }

      writeFile(agentsPath, nextContent, fsModule);
      log(chalk.green('  ✓ Updated Codex session guide in AGENTS.md'));
    } else {
      // Create a new AGENTS.md focused on Codex guide
      const content = `${guideBlock}\n`;
      writeFile(agentsPath, content, fsModule);
      log(chalk.green('  ✓ Created AGENTS.md with Codex session guide'));
    }
  } catch (error) {
    log(chalk.yellow(`  ⚠ Skipped Codex guide update: ${error.message}`));
  }
}

/**
 * Ensures AGENTS.md template exists
 * @param {string} projectRoot - Project root directory
 * @param {Object} options - Options
 */
function ensureAgentsTemplate(projectRoot, options = {}) {
  const fsModule = options.fs || fs;
  const log = options.log || console.log;
  
  const packageRoot = getPackageRoot();
  const templatesDir = getTemplatesDir(packageRoot);
  const templatePath = path.join(templatesDir, 'AGENTS.md');
  const destPath = path.join(projectRoot, 'AGENTS.md');

  if (!fsModule.existsSync(templatePath) || fsModule.existsSync(destPath)) {
    return;
  }

  try {
    fsModule.copyFileSync(templatePath, destPath);
    log(chalk.green('  ✓ Copied default AGENTS.md template'));
  } catch (error) {
    log(chalk.yellow(`  ⚠ Unable to copy AGENTS.md template: ${error.message}`));
  }
}

module.exports = {
  setupDevFolder,
  setupCentralizedRules,
  writeCodexManifestAndIndex,
  setupCodexGuide,
  ensureAgentsTemplate,
};
