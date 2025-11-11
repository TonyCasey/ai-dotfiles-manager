#!/usr/bin/env node

/**
 * Gemini CLI - Session End Hook
 *
 * This hook runs when Gemini CLI ends a session.
 * It commits completed todo items and updates session statistics.
 *
 * Configuration: .gemini/settings.json -> sessionHooks.end
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const DEV_DIR = path.join(PROJECT_ROOT, '.dev');
const TODO_PATH = path.join(DEV_DIR, 'todo.md');
const SESSION_STATE_PATH = path.join(DEV_DIR, '.session-state.json');
const SESSION_STATS_PATH = path.join(DEV_DIR, '.session-stats.json');

/**
 * Load previous session state
 */
function loadSessionState() {
  if (fs.existsSync(SESSION_STATE_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(SESSION_STATE_PATH, 'utf-8'));
    } catch (error) {
      console.log('⚠️  Failed to load session state');
    }
  }
  return { todoContent: '', startTime: new Date().toISOString() };
}

/**
 * Find tasks that were completed during this session
 */
function findCompletedTasks(oldContent, newContent) {
  const oldPending = (oldContent.match(/- [ ] .+/g) || []).map(t => t.replace('- [ ] ', '').trim());
  const newCompleted = (newContent.match(/- [x] .+/gi) || []).map(t => t.replace(/- [x] /i, '').trim());

  // Find tasks that were pending before but are now completed
  const completedThisSession = [];
  oldPending.forEach(task => {
    if (newCompleted.some(completed => completed === task)) {
      completedThisSession.push(task);
    }
  });

  return completedThisSession;
}

/**
 * Commit completed tasks to git
 */
function commitCompletedTasks(tasks) {
  if (tasks.length === 0) {
    console.log('ℹ️  No new completed tasks to commit');
    return false;
  }

  try {
    const { execSync } = require('child_process');

    // Check if we're in a git repository
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });

    // Check if todo.md has changes
    const status = execSync('git status --porcelain .dev/todo.md', { encoding: 'utf-8' });
    if (!status.trim()) {
      console.log('ℹ️  No changes to commit in todo.md');
      return false;
    }

    // Stage todo.md
    execSync('git add .dev/todo.md', { stdio: 'ignore' });

    // Create commit message
    const taskList = tasks.map(task => `  - ${task}`).join('\n');
    const commitMessage = tasks.length === 1
      ? `chore: complete task - ${tasks[0]}\n\n[ai-dotfiles-manager]`
      : `chore: complete ${tasks.length} tasks\n\n${taskList}\n\n[ai-dotfiles-manager]`

    // Commit changes
    execSync('git commit -F -', {
      input: commitMessage,
      stdio: ['pipe', 'ignore', 'ignore']
    });

    console.log(`✅ Committed ${tasks.length} completed task(s)`);
    tasks.forEach(task => console.log(`   ✓ ${task}`));
    return true;

  } catch (error) {
    if (error.status === 128) {
      console.log('⚠️  Not a git repository - skipping auto-commit');
    } else {
      console.log(`⚠️  Failed to commit tasks: ${error.message}`);
    }
    return false;
  }
}

/**
 * Update session statistics
 */
function updateSessionStats(sessionState) {
  const endTime = new Date();
  const startTime = new Date(sessionState.startTime);
  const durationMinutes = Math.round((endTime - startTime) / 1000 / 60);

  let stats = {
    totalSessions: 0,
    totalMinutes: 0,
    lastSession: null,
    averageDuration: 0
  };

  if (fs.existsSync(SESSION_STATS_PATH)) {
    try {
      stats = JSON.parse(fs.readFileSync(SESSION_STATS_PATH, 'utf-8'));
    } catch (error) {
      // Use default stats
    }
  }

  stats.totalSessions++;
  stats.totalMinutes += durationMinutes;
  stats.lastSession = endTime.toISOString();
  stats.averageDuration = Math.round(stats.totalMinutes / stats.totalSessions);

  fs.writeFileSync(SESSION_STATS_PATH, JSON.stringify(stats, null, 2));

  console.log(`ℹ️  Session duration: ${durationMinutes} minutes`);
  console.log(`ℹ️  Total sessions: ${stats.totalSessions} (avg: ${stats.averageDuration} min)`);
}

/**
 * Display session summary
 */
function displaySessionSummary() {
  const timestamp = new Date().toLocaleTimeString();
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('🤖 Gemini CLI Session Ended');
  console.log(`⏰ ${timestamp}`);
  console.log('═══════════════════════════════════════');
}

/**
 * Main execution
 */
function main() {
  displaySessionSummary();

  // Load session state
  const sessionState = loadSessionState();

  // Check for completed tasks
  if (fs.existsSync(TODO_PATH)) {
    const currentTodoContent = fs.readFileSync(TODO_PATH, 'utf-8');
    const completedTasks = findCompletedTasks(sessionState.todoContent, currentTodoContent);

    // Commit completed tasks
    if (completedTasks.length > 0) {
      commitCompletedTasks(completedTasks);
    }
  }

  // Update session statistics
  updateSessionStats(sessionState);

  // Clean up session state
  if (fs.existsSync(SESSION_STATE_PATH)) {
    fs.unlinkSync(SESSION_STATE_PATH);
  }

  console.log('═══════════════════════════════════════');
  console.log('✅ Session ended successfully');
  console.log('═══════════════════════════════════════');
  console.log('');
}

// Run if called directly
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`❌ Session end failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { main, findCompletedTasks, commitCompletedTasks };
