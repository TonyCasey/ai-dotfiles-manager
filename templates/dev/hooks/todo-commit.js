#!/usr/bin/env node

/**
 * Todo Commit Enforcement
 * 
 * This script monitors todo.md for completed tasks and enforces automatic commits.
 * It can be called manually or triggered by the session end hook.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const PROJECT_ROOT = process.cwd();
const DEV_DIR = path.join(PROJECT_ROOT, '.dev');
const TODO_PATH = path.join(DEV_DIR, 'todo.md');
const LAST_COMMIT_PATH = path.join(DEV_DIR, '.last-todo-commit.json');

function log(message, type = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = type === 'error' ? chalk.red('❌') : 
                type === 'warn' ? chalk.yellow('⚠️') : 
                type === 'success' ? chalk.green('✅') : 
                chalk.blue('ℹ️');
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function getLastCommitState() {
  if (fs.existsSync(LAST_COMMIT_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(LAST_COMMIT_PATH, 'utf-8'));
    } catch (error) {
      log('Failed to load last commit state', 'warn');
    }
  }
  return { completedTasks: [], lastCommitTime: null };
}

function saveLastCommitState(state) {
  try {
    fs.writeFileSync(LAST_COMMIT_PATH, JSON.stringify(state, null, 2));
  } catch (error) {
    log('Failed to save last commit state', 'warn');
  }
}

function extractTasks(content) {
  const lines = content.split('\n');
  const tasks = [];
  
  lines.forEach((line, index) => {
    // Match both [ ] and [x] patterns
    const match = line.match(/^(\s*)-\s*\[([ x])\]\s*(.+)$/);
    if (match) {
      const [, indent, status, text] = match;
      tasks.push({
        line: index + 1,
        indent: indent.length,
        completed: status === 'x',
        text: text.trim()
      });
    }
  });
  
  return tasks;
}

function findNewlyCompletedTasks(currentTasks, lastState) {
  const lastCompletedTasks = new Set(lastState.completedTasks);
  const newlyCompleted = [];
  
  currentTasks.forEach(task => {
    if (task.completed && !lastCompletedTasks.has(task.text)) {
      newlyCompleted.push(task);
    }
  });
  
  return newlyCompleted;
}

function createCommitMessage(tasks) {
  if (tasks.length === 0) {
    return null;
  }
  
  if (tasks.length === 1) {
    return `chore: complete ${tasks[0].text}\n\n[ai-dotfiles]`;
  }
  
  const taskList = tasks.map(task => task.text).join('\n  - ');
  return `chore: complete multiple tasks\n\n  - ${taskList}\n\n[ai-dotfiles]`;
}

function commitChanges(commitMessage) {
  try {
    const { execSync } = require('child_process');
    
    // Check if we're in a git repository
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    
    // Check if there are changes to commit
    const status = execSync('git status --porcelain .dev/todo.md', { encoding: 'utf-8' });
    if (!status.trim()) {
      log('No changes to commit', 'warn');
      return false;
    }
    
    // Stage the todo file
    execSync('git add .dev/todo.md', { stdio: 'ignore' });
    
    // Commit with the provided message
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'ignore' });
    
    log('Changes committed successfully', 'success');
    return true;
    
  } catch (error) {
    if (error.status === 128) {
      log('Not a git repository - cannot auto-commit', 'warn');
    } else {
      log(`Failed to commit: ${error.message}`, 'error');
    }
    return false;
  }
}

function enforceCommitPolicy() {
  log('Enforcing todo commit policy...');
  
  if (!fs.existsSync(TODO_PATH)) {
    log('todo.md not found', 'error');
    return false;
  }
  
  // Read current todo content
  const currentContent = fs.readFileSync(TODO_PATH, 'utf-8');
  const currentTasks = extractTasks(currentContent);
  
  // Get last commit state
  const lastState = getLastCommitState();
  
  // Find newly completed tasks
  const newlyCompleted = findNewlyCompletedTasks(currentTasks, lastState);
  
  if (newlyCompleted.length === 0) {
    log('No newly completed tasks found');
    return true;
  }
  
  // Create commit message
  const commitMessage = createCommitMessage(newlyCompleted);
  
  // Commit changes
  const committed = commitChanges(commitMessage);
  
  if (committed) {
    // Update last commit state
    const completedTaskTexts = currentTasks
      .filter(task => task.completed)
      .map(task => task.text);
    
    saveLastCommitState({
      completedTasks: completedTaskTexts,
      lastCommitTime: new Date().toISOString()
    });
    
    log(`Committed ${newlyCompleted.length} completed task(s):`, 'success');
    newlyCompleted.forEach(task => {
      log(`  ✓ ${task.text}`, 'success');
    });
  }
  
  return committed;
}

function checkUncommittedWork() {
  log('Checking for uncommitted completed tasks...');
  
  if (!fs.existsSync(TODO_PATH)) {
    return;
  }
  
  const content = fs.readFileSync(TODO_PATH, 'utf-8');
  const tasks = extractTasks(content);
  const completedTasks = tasks.filter(task => task.completed);
  
  if (completedTasks.length > 0) {
    log(`Found ${completedTasks.length} completed task(s) that may need committing:`, 'warn');
    completedTasks.forEach(task => {
      log(`  [x] ${task.text}`, 'warn');
    });
    log('Run "ai-dotfiles-manager commit-todo" to commit these tasks', 'info');
  }
}

function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'enforce':
      enforceCommitPolicy();
      break;
      
    case 'check':
      checkUncommittedWork();
      break;
      
    default:
      log('Usage: todo-commit.js [enforce|check]');
      log('  enforce  - Check for completed tasks and commit them');
      log('  check    - Check for uncommitted completed tasks');
      break;
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    log(`Todo commit enforcement failed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { 
  enforceCommitPolicy, 
  checkUncommittedWork, 
  extractTasks, 
  findNewlyCompletedTasks 
};