#!/usr/bin/env node
/**
 * Windows-compatible rule synchronization script
 * Copies rule files instead of using symlinks when symlinks fail
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function findPackageRoot() {
  let current = __dirname;

  // Look for the ai-dotfiles-manager package
  while (current !== path.dirname(current)) {
    const packagePath = path.join(current, 'node_modules', 'ai-dotfiles-manager');
    if (fs.existsSync(packagePath)) {
      return packagePath;
    }

    const localPackagePath = path.join(current, 'package.json');
    if (fs.existsSync(localPackagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(localPackagePath, 'utf8'));
      if (packageJson.name === 'ai-dotfiles-manager') {
        return current;
      }
    }

    current = path.dirname(current);
  }

  // Fallback: try global installation paths
  const globalPaths = [
    path.join(process.env.APPDATA || '', 'npm', 'node_modules', 'ai-dotfiles-manager'),
    path.join(process.env.HOME || process.env.USERPROFILE || '', '.nvm', 'versions', 'node'),
    '/usr/local/lib/node_modules/ai-dotfiles-manager',
    '/usr/lib/node_modules/ai-dotfiles-manager'
  ];

  for (const globalPath of globalPaths) {
    if (fs.existsSync(globalPath)) {
      return globalPath;
    }

    // Check nvm paths
    if (globalPath.includes('.nvm')) {
      try {
        const nvmDir = path.dirname(path.dirname(globalPath));
        const versions = fs.readdirSync(nvmDir).filter(v => v.startsWith('v'));
        for (const version of versions) {
          const versionPath = path.join(nvmDir, version, 'node_modules', 'ai-dotfiles-manager');
          if (fs.existsSync(versionPath)) {
            return versionPath;
          }
        }
      } catch (e) {
        // Ignore errors in nvm detection
      }
    }
  }

  throw new Error('Could not find ai-dotfiles-manager package installation');
}

const RULES_DIR = path.join(__dirname, '..', 'rules');

function copyDirectory(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`Source directory does not exist: ${src}`);
    return;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${entry.name}`);
    }
  }
}

function detectLanguage() {
  const cwd = process.cwd();

  // Look for language indicators
  if (fs.existsSync(path.join(cwd, 'package.json'))) {
    return 'typescript';
  }
  if (fs.existsSync(path.join(cwd, 'requirements.txt')) || fs.existsSync(path.join(cwd, 'pyproject.toml'))) {
    return 'python';
  }
  if (fs.existsSync(path.join(cwd, 'go.mod'))) {
    return 'go';
  }
  if (fs.existsSync(path.join(cwd, 'pom.xml')) || fs.existsSync(path.join(cwd, 'build.gradle'))) {
    return 'java';
  }

  return 'typescript'; // Default fallback
}

function syncRules() {
  console.log('🔄 Syncing coding rules (Windows-compatible mode)...');

  try {
    const packageRoot = findPackageRoot();
    const templatesPath = path.join(packageRoot, 'templates');
    const language = detectLanguage();

    const SOURCES = {
      shared: path.join(templatesPath, 'shared', 'rules'),
      [language]: path.join(templatesPath, 'languages', language, 'rules')
    };

    // Remove existing symlink directories
    for (const [name] of Object.entries(SOURCES)) {
      const targetDir = path.join(RULES_DIR, name);
      if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
      }
    }

    // Copy actual files
    for (const [name, sourcePath] of Object.entries(SOURCES)) {
      const targetDir = path.join(RULES_DIR, name);
      console.log(`📁 Syncing ${name} rules...`);
      copyDirectory(sourcePath, targetDir);
    }

    console.log('✅ Rules synced successfully!');
    console.log('💡 Re-run this script after updating ai-dotfiles-manager to get latest rules');

  } catch (error) {
    console.error('❌ Error syncing rules:', error.message);
    console.error('💡 Make sure ai-dotfiles-manager is installed globally: npm install -g ai-dotfiles-manager');
    process.exit(1);
  }
}

if (require.main === module) {
  syncRules();
}

module.exports = { syncRules };