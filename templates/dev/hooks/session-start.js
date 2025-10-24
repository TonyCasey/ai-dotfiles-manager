#!/usr/bin/env node

/**
 * Session Start Hook
 * 
 * This script runs when an AI tool starts a new session.
 * It loads the .dev/rules/ content into AI context and prepares the workspace.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const PROJECT_ROOT = process.cwd();
const DEV_DIR = path.join(PROJECT_ROOT, '.dev');
const RULES_DIR = path.join(DEV_DIR, 'rules');
const TODO_PATH = path.join(DEV_DIR, 'todo.md');
const ARCHITECTURE_PATH = path.join(DEV_DIR, 'architecture.md');

function log(message, type = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = type === 'error' ? chalk.red('❌') : 
                type === 'warn' ? chalk.yellow('⚠️') : 
                type === 'success' ? chalk.green('✅') : 
                chalk.blue('ℹ️');
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function loadRulesIntoContext() {
  log('Loading rules into AI context...');
  
  if (!fs.existsSync(RULES_DIR)) {
    log('Rules directory not found. Run "ai-dotfiles-manager setup" first.', 'error');
    return false;
  }

  // Load shared rules
  const sharedRulesPath = path.join(RULES_DIR, 'shared');
  if (fs.existsSync(sharedRulesPath)) {
    const sharedRules = fs.readdirSync(sharedRulesPath).filter(file => file.endsWith('.md'));
    sharedRules.forEach(rule => {
      const rulePath = path.join(sharedRulesPath, rule);
      const content = fs.readFileSync(rulePath, 'utf-8');
      log(`Loaded shared rule: ${rule}`, 'success');
    });
  }

  // Load language-specific rules
  const languageRulesPath = path.join(RULES_DIR, 'typescript'); // Default to TypeScript
  if (fs.existsSync(languageRulesPath)) {
    const languageRules = fs.readdirSync(languageRulesPath).filter(file => file.endsWith('.md'));
    languageRules.forEach(rule => {
      const rulePath = path.join(languageRulesPath, rule);
      const content = fs.readFileSync(rulePath, 'utf-8');
      log(`Loaded language rule: ${rule}`, 'success');
    });
  }

  // Load local overrides
  const localRulesPath = path.join(RULES_DIR, '.local');
  if (fs.existsSync(localRulesPath)) {
    const localRules = fs.readdirSync(localRulesPath).filter(file => file.endsWith('.md'));
    localRules.forEach(rule => {
      const rulePath = path.join(localRulesPath, rule);
      const content = fs.readFileSync(rulePath, 'utf-8');
      log(`Loaded local rule: ${rule}`, 'success');
    });
  }

  return true;
}

function loadProjectContext() {
  log('Loading project context...');

  // Load architecture.md
  if (fs.existsSync(ARCHITECTURE_PATH)) {
    const architectureContent = fs.readFileSync(ARCHITECTURE_PATH, 'utf-8');
    log('Loaded architecture.md', 'success');
  } else {
    log('architecture.md not found', 'warn');
  }

  // Load todo.md
  if (fs.existsSync(TODO_PATH)) {
    const todoContent = fs.readFileSync(TODO_PATH, 'utf-8');
    log('Loaded todo.md', 'success');
    
    // Count pending and completed tasks
    const pendingTasks = (todoContent.match(/\[ \]/g) || []).length;
    const completedTasks = (todoContent.match(/\[x\]/g) || []).length;
    log(`Tasks: ${pendingTasks} pending, ${completedTasks} completed`);
  } else {
    log('todo.md not found', 'warn');
  }
}

function checkGitStatus() {
  try {
    const { execSync } = require('child_process');
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    
    if (status.trim()) {
      log('You have uncommitted changes:', 'warn');
      const lines = status.trim().split('\n');
      lines.forEach(line => {
        const [statusChar, ...filePathParts] = line.split(' ');
        const filePath = filePathParts.join(' ');
        const statusIcon = statusChar.includes('M') ? '📝' :
                         statusChar.includes('A') ? '➕' :
                         statusChar.includes('D') ? '🗑️' : '❓';
        log(`  ${statusIcon} ${filePath}`);
      });
    } else {
      log('Working directory is clean', 'success');
    }
  } catch (error) {
    log('Not a git repository or git not available', 'warn');
  }
}

function updateArchitectureIfNeeded() {
  // Check if project structure has changed since last architecture generation
  const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const lastModified = fs.statSync(packageJsonPath).mtime.toISOString();
    
    // Read last update timestamp from architecture.md
    if (fs.existsSync(ARCHITECTURE_PATH)) {
      const architectureContent = fs.readFileSync(ARCHITECTURE_PATH, 'utf-8');
      const lastUpdatedMatch = architectureContent.match(/\*\*Last Updated\*\*: (.+)/);
      
      if (lastUpdatedMatch) {
        const lastUpdated = lastUpdatedMatch[1];
        if (lastModified > lastUpdated) {
          log('Project structure changed, updating architecture.md...', 'warn');
          // Trigger architecture regeneration
          const { generateArchitectureDoc } = require('../../lib/architecture-generator');
          const newArchitectureContent = generateArchitectureDoc('typescript'); // Auto-detect language
          fs.writeFileSync(ARCHITECTURE_PATH, newArchitectureContent);
          log('Updated architecture.md', 'success');
        }
      }
    }
  }
}

function main() {
  log('AI Session Starting...');
  log('==================');
  
  // Update architecture if needed
  updateArchitectureIfNeeded();
  
  // Load rules into context
  const rulesLoaded = loadRulesIntoContext();
  if (!rulesLoaded) {
    process.exit(1);
  }
  
  // Load project context
  loadProjectContext();
  
  // Check git status
  checkGitStatus();
  
  log('==================');
  log('Session ready! AI context loaded.', 'success');
}

// Run if called directly
if (require.main === module) {
  try {
    main();
  } catch (error) {
    log(`Session start failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

module.exports = { main, loadRulesIntoContext, loadProjectContext };