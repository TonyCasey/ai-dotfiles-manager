#!/usr/bin/env node

/**
 * Session End Hook
 * 
 * This script runs when an AI tool ends a session.
 * It checks for completed todo items and triggers automatic commits.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const PROJECT_ROOT = process.cwd();
const DEV_DIR = path.join(PROJECT_ROOT, '.dev');
const TODO_PATH = path.join(DEV_DIR, 'todo.md');
const SESSION_STATE_PATH = path.join(DEV_DIR, '.session-state.json');

function log(message, type = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = type === 'error' ? chalk.red('❌') : 
                type === 'warn' ? chalk.yellow('⚠️') : 
                type === 'success' ? chalk.green('✅') : 
                chalk.blue('ℹ️');
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function loadSessionState() {
  if (fs.existsSync(SESSION_STATE_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(SESSION_STATE_PATH, 'utf-8'));
    } catch (error) {
      log('Failed to load session state', 'warn');
    }
  }
  return { todoContent: '', startTime: new Date().toISOString() };
}

function saveSessionState(state) {
  try {
    fs.writeFileSync(SESSION_STATE_PATH, JSON.stringify(state, null, 2));
  } catch (error) {
    log('Failed to save session state', 'warn');
  }
}

function findCompletedTasks(oldContent, newContent) {
  const oldTasks = (oldContent.match(/\[ \].+/g) || []).map(task => task.trim());
  const newTasks = (newContent.match(/\[ \].+/g) || []).map(task => task.trim());
  const newCompleted = (newContent.match(/\[x\].+/g) || []).map(task => task.trim());
  
  // Find tasks that were [ ] in old content but are [x] in new content
  const completedTasks = [];
  
  oldTasks.forEach(oldTask => {
    const taskText = oldTask.replace(/^\[ \]\s*/, '');
    const matchingCompleted = newCompleted.find(completed => 
      completed.replace(/^\[x\]\s*/, '') === taskText
    );
    
    if (matchingCompleted) {
      completedTasks.push(taskText);
    }
  });
  
  return completedTasks;
}

function commitCompletedTasks(tasks) {
  if (tasks.length === 0) {
    log('No new completed tasks to commit');
    return;
  }

  try {
    const { execSync } = require('child_process');
    
    // Check if we're in a git repository
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    
    // Stage todo.md
    execSync('git add .dev/todo.md', { stdio: 'ignore' });
    
    // Create commit message
    const taskList = tasks.map(task => `- ${task}`).join('\n  ');
    const commitMessage = `chore: complete task(s)\n\n  ${taskList}\n\n[ai-dotfiles]`;
    
    // Commit changes
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'ignore' });
    
    log(`Committed ${tasks.length} completed task(s):`, 'success');
    tasks.forEach(task => log(`  ✓ ${task}`, 'success'));
    
  } catch (error) {
    if (error.status === 128) {
      log('Not a git repository - skipping auto-commit', 'warn');
    } else {
      log(`Failed to commit completed tasks: ${error.message}`, 'error');
    }
  }
}

function updateSessionStatistics(sessionState) {
  const endTime = new Date();
  const startTime = new Date(sessionState.startTime);
  const duration = Math.round((endTime - startTime) / 1000 / 60); // minutes
  
  log(`Session duration: ${duration} minutes`);
  
  // Update session statistics
  const statsPath = path.join(DEV_DIR, '.session-stats.json');
  let stats = { totalSessions: 0, totalMinutes: 0, lastSession: null };
  
  if (fs.existsSync(statsPath)) {
    stats = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
  }
  
  stats.totalSessions++;
  stats.totalMinutes += duration;
  stats.lastSession = endTime.toISOString();
  
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
  log(`Total sessions: ${stats.totalSessions}, Total time: ${stats.totalMinutes} minutes`);
}

function cleanup() {
  // Clean up any temporary files created during session
  const tempDir = path.join(DEV_DIR, '.temp');
  if (fs.existsSync(tempDir)) {
    try {
      const files = fs.readdirSync(tempDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(tempDir, file));
      });
      log('Cleaned up temporary files', 'success');
    } catch (error) {
      log('Failed to clean up temporary files', 'warn');
    }
  }
}

function main() {
  log('AI Session Ending...');
  log('==================');
  
  // Load previous session state
  const sessionState = loadSessionState();
  
  // Check current todo.md content
  if (fs.existsSync(TODO_PATH)) {
    const currentTodoContent = fs.readFileSync(TODO_PATH, 'utf-8');
    
    // Find newly completed tasks
    const completedTasks = findCompletedTasks(sessionState.todoContent, currentTodoContent);
    
    // Commit completed tasks
    if (completedTasks.length > 0) {
      commitCompletedTasks(completedTasks);
    }
    
    // Update session state with current content
    sessionState.todoContent = currentTodoContent;
  }
  
  // Update session statistics
  updateSessionStatistics(sessionState);
  
  // Cleanup
  cleanup();
  
  // Save updated session state
  saveSessionState(sessionState);
  
  log('==================');
  log('Session ended successfully', 'success');
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    log(`Session end failed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { main, findCompletedTasks, commitCompletedTasks };