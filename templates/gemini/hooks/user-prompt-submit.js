#!/usr/bin/env node

/**
 * Gemini CLI - User Prompt Submit Hook
 *
 * This hook runs before a user's prompt is submitted to Gemini.
 * It can be used to validate, enhance, or log prompts.
 *
 * Configuration: .gemini/settings.json -> hooks.userPromptSubmit
 *
 * Note: This hook is optional and only runs if configured.
 * If the hook exits with non-zero status, the prompt submission is cancelled.
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const DEV_DIR = path.join(PROJECT_ROOT, '.dev');

/**
 * Validate prompt for potentially problematic patterns
 */
function validatePrompt(prompt) {
  const warnings = [];

  // Check for overly broad requests
  if (prompt.toLowerCase().includes('delete all') ||
      prompt.toLowerCase().includes('remove everything')) {
    warnings.push('⚠️  Destructive operation detected - please be specific');
  }

  // Check for requests without context
  if (prompt.length < 10) {
    warnings.push('⚠️  Very short prompt - consider providing more context');
  }

  return warnings;
}

/**
 * Enhance prompt with project context if needed
 */
function enhancePrompt(prompt) {
  // This is where you could automatically append project context
  // For example, if the prompt mentions "our architecture" but doesn't
  // reference architecture.md, we could suggest including it

  const suggestions = [];

  if (prompt.toLowerCase().includes('architecture') ||
      prompt.toLowerCase().includes('structure')) {
    const archPath = path.join(DEV_DIR, 'architecture.md');
    if (fs.existsSync(archPath)) {
      suggestions.push('💡 Consider referencing @.dev/architecture.md for context');
    }
  }

  if (prompt.toLowerCase().includes('todo') ||
      prompt.toLowerCase().includes('task')) {
    const todoPath = path.join(DEV_DIR, 'todo.md');
    if (fs.existsSync(todoPath)) {
      suggestions.push('💡 Your todo list is available at @.dev/todo.md');
    }
  }

  return suggestions;
}

/**
 * Log prompt for analytics (optional)
 */
function logPrompt(prompt) {
  const logPath = path.join(DEV_DIR, '.prompt-log.jsonl');
  const logEntry = {
    timestamp: new Date().toISOString(),
    promptLength: prompt.length,
    promptPreview: prompt.substring(0, 100)
  };

  try {
    fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
  } catch (error) {
    // Silently fail if logging doesn't work
  }
}

/**
 * Main execution
 */
function main() {
  // Get the prompt from command line arguments or stdin
  const prompt = process.argv.slice(2).join(' ') || '';

  if (!prompt) {
    console.log('ℹ️  No prompt provided');
    process.exit(0);
  }

  // Validate prompt
  const warnings = validatePrompt(prompt);
  if (warnings.length > 0) {
    warnings.forEach(warning => console.log(warning));
  }

  // Enhance prompt with suggestions
  const suggestions = enhancePrompt(prompt);
  if (suggestions.length > 0) {
    suggestions.forEach(suggestion => console.log(suggestion));
  }

  // Log prompt for analytics
  logPrompt(prompt);

  // Exit with 0 to allow prompt to proceed
  // Exit with 1 to cancel prompt submission
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`❌ Prompt validation failed: ${error.message}`);
    // Exit with 0 to not block the prompt
    process.exit(0);
  }
}

module.exports = { validatePrompt, enhancePrompt, logPrompt };
