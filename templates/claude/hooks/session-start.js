#!/usr/bin/env node

/**
 * Claude Code - Session Start Hook
 *
 * This hook runs when Claude Code starts a new session.
 * It loads project context, rules, and prepares the development environment.
 *
 * Configuration: .claude/settings.json -> sessionHooks.start
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const DEV_DIR = path.join(PROJECT_ROOT, '.dev');
const RULES_DIR = path.join(DEV_DIR, 'rules');
const TODO_PATH = path.join(DEV_DIR, 'todo.md');
const ARCHITECTURE_PATH = path.join(DEV_DIR, 'architecture.md');
const SESSION_STATE_PATH = path.join(DEV_DIR, '.session-state.json');

/**
 * Load project rules into context
 */
function loadRules() {
  if (!fs.existsSync(RULES_DIR)) {
    console.log('⚠️  Rules directory not found. Run "ai-dotfiles-manager setup" first.');
    return false;
  }

  const ruleDirs = ['shared', 'typescript', 'python', 'javascript', 'go', '.local'];
  let rulesLoaded = 0;

  ruleDirs.forEach(dir => {
    const dirPath = path.join(RULES_DIR, dir);
    if (fs.existsSync(dirPath)) {
      const ruleFiles = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
      rulesLoaded += ruleFiles.length;
    }
  });

  console.log(`✅ Loaded ${rulesLoaded} rule files from .dev/rules/`);
  return true;
}

/**
 * Load project context (architecture and todos)
 */
function loadProjectContext() {
  let context = '';

  // Load architecture overview
  if (fs.existsSync(ARCHITECTURE_PATH)) {
    console.log('✅ Loaded architecture.md');
  } else {
    console.log('⚠️  architecture.md not found');
  }

  // Load and analyze todo list
  if (fs.existsSync(TODO_PATH)) {
    const todoContent = fs.readFileSync(TODO_PATH, 'utf-8');
    const pendingTasks = (todoContent.match(/- \[ \]/g) || []).length;
    const completedTasks = (todoContent.match(/- \[x\]/gi) || []).length;
    console.log(`✅ Loaded todo.md (${pendingTasks} pending, ${completedTasks} completed)`);

    // Save initial state for session-end comparison
    saveSessionState({ todoContent, startTime: new Date().toISOString() });
  } else {
    console.log('⚠️  todo.md not found');
  }
}

/**
 * Check git status for uncommitted changes
 */
function checkGitStatus() {
  try {
    const { execSync } = require('child_process');
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });

    if (status.trim()) {
      const lines = status.trim().split('\n');
      console.log(`⚠️  ${lines.length} uncommitted change(s)`);
    } else {
      console.log('✅ Working directory is clean');
    }
  } catch (error) {
    // Not a git repository or git not available
  }
}

/**
 * Save session state for comparison at session end
 */
function saveSessionState(state) {
  try {
    fs.writeFileSync(SESSION_STATE_PATH, JSON.stringify(state, null, 2));
  } catch (error) {
    console.log('⚠️  Failed to save session state');
  }
}

/**
 * Display session information
 */
function displaySessionInfo() {
  const timestamp = new Date().toLocaleTimeString();
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('🤖 Claude Code Session Started');
  console.log(`⏰ ${timestamp}`);
  console.log('═══════════════════════════════════════');
}

/**
 * Main execution
 */
function main() {
  displaySessionInfo();

  // Load rules
  const rulesLoaded = loadRules();
  if (!rulesLoaded) {
    process.exit(1);
  }

  // Load project context
  loadProjectContext();

  // Check git status
  checkGitStatus();

  console.log('═══════════════════════════════════════');
  console.log('✅ Session ready - AI context loaded');
  console.log('═══════════════════════════════════════');
  console.log('');
}

// Run if called directly
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`❌ Session start failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { main, loadRules, loadProjectContext };
