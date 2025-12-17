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
    console.error('⚠️  Rules directory not found. Run "ai-dotfiles-manager setup" first.');
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

  console.error(`✅ Loaded ${rulesLoaded} rule files from .dev/rules/`);
  return true;
}

/**
 * Load project context (architecture and todos)
 */
function loadProjectContext() {
  let context = '';

  // Load architecture overview
  if (fs.existsSync(ARCHITECTURE_PATH)) {
    console.error('✅ Loaded architecture.md');
  } else {
    console.error('⚠️  architecture.md not found');
  }

  // Load and analyze todo list
  if (fs.existsSync(TODO_PATH)) {
    const todoContent = fs.readFileSync(TODO_PATH, 'utf-8');
    const pendingTasks = (todoContent.match(/- \[ \]/g) || []).length;
    const completedTasks = (todoContent.match(/- \[x\]/gi) || []).length;
    console.error(`✅ Loaded todo.md (${pendingTasks} pending, ${completedTasks} completed)`);

    // Save initial state for session-end comparison
    saveSessionState({ todoContent, startTime: new Date().toISOString() });
  } else {
    console.error('⚠️  todo.md not found');
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
      console.error(`⚠️  ${lines.length} uncommitted change(s)`);
    } else {
      console.error('✅ Working directory is clean');
    }
  } catch (_error) {
    // Not a git repository or git not available
  }
}

/**
 * Save session state for comparison at session end
 */
function saveSessionState(state) {
  try {
    fs.writeFileSync(SESSION_STATE_PATH, JSON.stringify(state, null, 2));
  } catch (_error) {
    console.log('⚠️  Failed to save session state');
  }
}

/**
 * Get current active todo from todo.md
 */
function getCurrentTodo() {
  if (!fs.existsSync(TODO_PATH)) {
    return null;
  }

  const todoContent = fs.readFileSync(TODO_PATH, 'utf-8');
  const lines = todoContent.split('\n');

  // Look for the first unchecked todo under "Current Sprint" or similar
  let inCurrentSection = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if we're in a "current" section
    if (line.match(/##\s*(Current|In Progress|Active|Working On)/i)) {
      inCurrentSection = true;
      continue;
    }

    // Exit current section when we hit another heading
    if (inCurrentSection && line.match(/^##\s/)) {
      break;
    }

    // Find first unchecked todo in current section
    if (inCurrentSection && line.match(/^\s*-\s*\[\s*\]\s*(.+)/)) {
      const match = line.match(/^\s*-\s*\[\s*\]\s*(.+)/);
      return match[1].trim();
    }
  }

  // If no current section, just get the first unchecked todo
  for (const line of lines) {
    const match = line.match(/^\s*-\s*\[\s*\]\s*(.+)/);
    if (match) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Display session information
 */
function displaySessionInfo() {
  const timestamp = new Date().toLocaleTimeString();
  const projectName = path.basename(PROJECT_ROOT);

  console.error('');
  console.error('╔════════════════════════════════════════════════════════════╗');
  console.error('║          🤖 Claude Code Session Started                   ║');
  console.error('╚════════════════════════════════════════════════════════════╝');
  console.error('');
  console.error(`📁 Project: ${projectName}`);
  console.error(`⏰ Time: ${timestamp}`);
  console.error('');
}

/**
 * Main execution
 */
function main() {
  displaySessionInfo();

  console.error('📋 CONTEXT LOADING:');
  console.error('─────────────────────────────────────────────────────────');

  // Load rules (output to stderr for user visibility)
  const rulesLoaded = loadRules();
  if (!rulesLoaded) {
    process.exit(1);
  }

  // Load project context (output to stderr for user visibility)
  loadProjectContext();

  // Check git status (output to stderr for user visibility)
  checkGitStatus();

  console.error('');

  // Display current todo
  const currentTodo = getCurrentTodo();
  if (currentTodo) {
    console.error('🎯 CURRENT TASK:');
    console.error('─────────────────────────────────────────────────────────');
    console.error(`   ${currentTodo}`);
    console.error('');
  }

  console.error('╔════════════════════════════════════════════════════════════╗');
  console.error('║  ✅ SESSION READY - All context loaded into Claude        ║');
  console.error('╚════════════════════════════════════════════════════════════╝');
  console.error('');

  // Output to stdout for Claude's context
  console.log('RELAY_TO_USER: Session initialized successfully');
  console.log(`RELAY_TO_USER: Rules, architecture, and todos loaded`);
  if (currentTodo) {
    console.log(`RELAY_TO_USER: Current task: ${currentTodo}`);
  }
}

// Run if called directly
if (require.main === module) {
  try {
    main();
  } catch (_error) {
    console.error(`❌ Session start failed: ${_error.message}`);
    process.exit(1);
  }
}

module.exports = { main, loadRules, loadProjectContext };
