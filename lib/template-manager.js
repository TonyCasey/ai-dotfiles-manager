/**
 * Template Manager Module
 * Handles template discovery, copying, and content generation
 * Follows Single Responsibility Principle
 */

const fs = require('fs');
const path = require('path');
const { copyPath, writeFile, listMarkdownFiles } = require('./file-utils');

/**
 * Gets the templates directory path
 * @param {string} packageRoot - Package root directory
 * @returns {string} Templates directory path
 */
function getTemplatesDir(packageRoot) {
  return path.join(packageRoot, 'templates');
}

/**
 * Gets the package root directory
 * @returns {string} Package root path
 */
function getPackageRoot() {
  return path.join(__dirname, '..');
}

/**
 * Copies a template file or directory
 * @param {string} templateName - Template name/path relative to templates dir
 * @param {string} dest - Destination path
 * @param {Object} options - Options
 * @param {boolean} options.replace - Whether to replace existing files
 * @param {Object} options.fs - File system module (for dependency injection)
 * @returns {Object} Result with success status
 */
function copyTemplate(templateName, dest, options = {}) {
  const fsModule = options.fs || fs;
  const replace = options.replace !== undefined ? options.replace : true;
  
  const packageRoot = getPackageRoot();
  const templatesDir = getTemplatesDir(packageRoot);
  const source = path.join(templatesDir, templateName);

  if (!fsModule.existsSync(source)) {
    return { success: false, error: `Template not found: ${templateName}` };
  }

  return copyPath(source, dest, replace, fsModule);
}

/**
 * Generates a local rules README
 * @param {string} toolName - Tool name (e.g., "Claude Code")
 * @returns {string} README content
 */
function generateLocalRulesReadme(toolName = 'AI Tools') {
  return `# ${toolName} - Local Rules

This directory is for **your project-specific custom rules** that override or extend the base rules.

## Why use .local?

The base rule directories (\`shared/\`, \`typescript/\`, etc.) are **copied** from this package during setup/update. Treat them as managed sources; do not edit them directly because updates may overwrite changes. Use .local for customizations that persist.

## How to customize

### Option 1: Override specific rules
Create a file with the same name as a base rule to override it:
\`\`\`
.local/
  └── architecture.md    # Overrides shared/architecture.md
\`\`\`

### Option 2: Add new rules
Add new markdown files for project-specific requirements:
\`\`\`
.local/
  └── custom-api-standards.md
  └── database-conventions.md
\`\`\`

### Option 3: Extend existing rules
Reference and extend base rules in your custom files:
\`\`\`markdown
<!-- In .local/custom-architecture.md -->
# Custom Architecture Rules

See base rules in \`../shared/clean-architecture.md\`

## Project-Specific Additions
- Our API uses GraphQL instead of REST
- ...
\`\`\`

## Updating base rules

When you run \`ai-dotfiles-manager update\`, the copied base rule directories are refreshed with the latest templates, but your .local files remain untouched.

## Git

**Commit .local files** to share project-specific rules with your team:
\`\`\`gitignore
# In your .gitignore:
# Ignore base rules copied from package
.dev/rules/shared
.dev/rules/typescript

# But commit local customizations
!.dev/rules/.local/
\`\`\`
`;
}

/**
 * Generates centralized rules README
 * @returns {string} README content
 */
function generateCentralizedRulesReadme() {
  return `# Centralized Rules Directory

This directory contains **centralized rules** for all AI coding assistants, eliminating duplication across provider folders.

## Structure

\`\`\`
.dev/rules/
├── shared/              # Language-agnostic rules (managed copies)
│   ├── clean-architecture.md
│   ├── repository-pattern.md
│   └── testing-principles.md
├── typescript/          # Language-specific rules (managed copies)
│   ├── coding-standards.md
│   └── testing.md
└── .local/             # Project-specific overrides
    ├── custom-rules.md
    └── architecture.md   # Override shared rules
\`\`\`

## How It Works

### Base Rules (Managed Copies)
- **Shared Rules**: Universal principles applicable to all projects
- **Language Rules**: Specific conventions for your programming language
- **Source**: Copied from global package templates
- **Updated via**: Run \`ai-dotfiles-manager update\`

### Local Overrides (Writable)
- **Project-specific**: Custom rules for this project only
- **Override capability**: Files with same name replace base rules
- **Version control**: Commit these to share with your team
- **Survive updates**: Never affected by package updates

## Loading Priority

1. **Base shared rules** loaded first
2. **Language-specific rules** loaded next
3. **Local overrides** loaded last (highest priority)

This means your \`.local/\` rules always take precedence over base rules.

---

*This centralized approach eliminates the need to maintain separate rule sets for each AI provider.*
`;
}

/**
 * Generates .dev folder README
 * @returns {string} README content
 */
function generateDevReadme() {
  return `# .dev/ - Developer Workspace

This folder contains **your personal developer workspace** that's auto-loaded into AI context for every session.

## Files

### architecture.md
**Auto-generated project overview** that provides context to AI assistants about:
- Project structure
- Technologies used
- Architectural patterns
- Key principles

**Regenerated on setup/update** to stay current with your project.

### todo.md
**Your personal task list** with checkboxes:
- [ ] Pending tasks
- [x] Completed tasks

AI assistants see your current tasks and can help you work through them. Simply check off items as you complete them.

## Auto-Loading

All files in .dev/ are automatically loaded into AI context when you start a new session with:
- Claude Code
- Cursor
- Kilo Code
- Roo Code

This gives the AI immediate understanding of:
- What you're working on (todo.md)
- How the project is structured (architecture.md)

## Git

The .dev/ folder is **personal** and typically not committed:

\`\`\`gitignore
# In your .gitignore:
.dev/
\`\`\`

However, you can commit it if you want to share architecture notes or tasks with your team.

## Customization

Feel free to add more files:
- \`notes.md\` - Personal development notes
- \`decisions.md\` - Architectural decision records
- \`research.md\` - Research and exploration notes

All .md files in .dev/ will be loaded into AI context.
`;
}

/**
 * Generates a todo.md template
 * @returns {string} Todo template content
 */
function generateTodoTemplate() {
  return `# Developer Todo List

> Personal task list - auto-loaded into AI context. Check off items as you complete them.

## Current Sprint

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

## Backlog

- [ ] Future task 1
- [ ] Future task 2

## Completed

- [x] Example completed task

---

*Keep this list updated. Checked items ([x]) show completed work.*
`;
}

/**
 * Discovers rule files in .dev/rules directory
 * @param {string} projectRoot - Project root directory
 * @param {string} language - Project language
 * @param {Object} fsModule - File system module (for dependency injection)
 * @returns {Object} Discovered rule files by category
 */
function discoverRuleFiles(projectRoot, language, fsModule = fs) {
  const devDir = path.join(projectRoot, '.dev');
  const rulesDir = path.join(devDir, 'rules');
  const langDir = language === 'javascript' ? 'typescript' : language;
  const lintDir = path.join(devDir, 'lint');

  return {
    shared: listMarkdownFiles(path.join(rulesDir, 'shared'), projectRoot, fsModule),
    language: listMarkdownFiles(path.join(rulesDir, langDir), projectRoot, fsModule),
    local: listMarkdownFiles(path.join(rulesDir, '.local'), projectRoot, fsModule),
    lint: listMarkdownFiles(lintDir, projectRoot, fsModule),
  };
}

/**
 * Generates Codex context index content
 * @param {string} language - Project language
 * @param {Object} files - Discovered rule files
 * @returns {string} Context index content
 */
function generateContextIndex(language, files) {
  const lines = [];
  lines.push('# Codex Context Index');
  lines.push('');
  lines.push('This index lists key context files Codex should consult.');
  lines.push('');
  lines.push('## Core');
  lines.push('- `.dev/DESIGNcode.md` (Codex bootstrap)');
  lines.push('- `.dev/architecture.md`');
  lines.push('- `.dev/feature.md`');
  lines.push('- `.dev/todo.md` (if present)');
  lines.push('');
  lines.push('## Rules (precedence: .local > language > shared)');
  
  const addSection = (title, arr, heading = '###') => {
    lines.push(`${heading} ${title}`);
    if (arr && arr.length) {
      arr.forEach(p => lines.push(`- \`${p}\``));
    } else {
      lines.push('- (none)');
    }
    lines.push('');
  };
  
  addSection('Local Overrides', files.local);
  addSection('Language Rules', files.language);
  addSection('Shared Rules', files.shared);
  addSection('Linting Guides', files.lint, '##');
  
  lines.push('---');
  lines.push('This file is generated by ai-dotfiles-manager.');
  
  return lines.join('\n');
}

/**
 * Generates Codex manifest JSON
 * @param {string} projectRoot - Project root directory
 * @param {string} language - Project language
 * @param {Object} files - Discovered rule files
 * @param {Object} fsModule - File system module (for dependency injection)
 * @returns {Object} Manifest object
 */
function generateCodexManifest(projectRoot, language, files, fsModule = fs) {
  const ordered = [];
  
  // Add core files if they exist
  const design = path.join('.dev', 'DESIGNcode.md');
  if (fsModule.existsSync(path.join(projectRoot, design))) ordered.push(design);
  
  const arch = path.join('.dev', 'architecture.md');
  if (fsModule.existsSync(path.join(projectRoot, arch))) ordered.push(arch);
  
  const feature = path.join('.dev', 'feature.md');
  if (fsModule.existsSync(path.join(projectRoot, feature))) ordered.push(feature);
  
  const todo = path.join('.dev', 'todo.md');
  if (fsModule.existsSync(path.join(projectRoot, todo))) ordered.push(todo);
  
  // Add discovered rules
  ordered.push(...(files.lint || []));
  ordered.push(...(files.shared || []));
  ordered.push(...(files.language || []));
  ordered.push(...(files.local || []));

  const langDir = language === 'javascript' ? 'typescript' : language;
  
  return {
    load: ordered,
    precedence: ['.dev/rules/.local', `.dev/rules/${langDir}`, '.dev/rules/shared']
  };
}

module.exports = {
  getTemplatesDir,
  getPackageRoot,
  copyTemplate,
  generateLocalRulesReadme,
  generateCentralizedRulesReadme,
  generateDevReadme,
  generateTodoTemplate,
  discoverRuleFiles,
  generateContextIndex,
  generateCodexManifest,
};
