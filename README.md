# AI Dotfiles Manager
## An EASY way to manage your AI CLI Dev tool config folders
![developer.jpg](resources/developer.jpg)
[![npm version](https://badge.fury.io/js/ai-dotfiles-manager.svg)](https://www.npmjs.com/package/ai-dotfiles-manager)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Sick of .files folder overload and having to copy and paste tour rules, workflows & commands into different dotfile folders?

```bash

    ├── .claude/              # Claude Code config
    │   ├── hooks/           # Session automation scripts
    │   ├── commands/        # Slash commands (global)
    │   └── settings.json    # Points to ../.dev/rules/
    ├── .cursorrules           # Cursor config (points to .dev/rules/)
    ├── .kilocode/           # Kilo Code config (points to .dev/rules/)
    ├── .roo/                # Roo Code config (points to .dev/rules/)
    └── .dev/                # Centralized rules and workspace
        ├── rules/            # Centralized rule repository
        │   ├── shared/      # Language-agnostic rules (managed copies)
        │   ├── typescript/   # Language-specific rules (managed copies)
        │   └── .local/      # Project-specific overrides
        ├── architecture.md   # Auto-generated project overview
        └── todo.md           # Developer task list
```

This package provides **centralized configurations** for AI coding CLI assistants (Claude Code, Cursor, Kilo Code, and Roo Code) to ensure consistent rules when you switch between each AI.

**Key Innovation**: All rules are centralized in `.dev/rules/` instead of duplicated across provider folders. Claude Code hooks (in `.claude/hooks/`) automatically load rules and commit completed tasks.

> Deprecation notice: Provider-specific rule folders and shortcut copies are deprecated. All provider configs now reference the centralized `.dev/rules/` (shared) directory. Base rules within `.dev/rules/` are managed copies sourced from this package.

A dotfiles manager for your AI tools!

## Start Here

- [Project Context Index](.dev/context-index.md)
- [Architecture Overview](.dev/architecture.md)

## Features

- **Centralized Rules (.dev/rules/)**: Single source of truth for all AI tools
- **Claude Code Hooks (.claude/hooks/)**: Automatic session start/end actions with todo commit enforcement and current task tracking
- **Session Status Command**: `/status` slash command to view loaded context and current task anytime
- **Non-Interactive Mode**: `--yes` flag for automated setup/updates without prompts
- **Clean Architecture Rules**: Enforce layer separation, dependency inversion, and SOLID principles
- **Developer Workspace (.dev/)**: Personal workspace with auto-generated architecture docs and todo list
- **Auto-Context Loading**: AI assistants automatically load centralized rules and project context
- **Streamlined Updates**: Replace existing files by default (no backups) for faster updates
- **Migration Support**: Gracefully handles existing AI configurations with 4 migration options
- **Multi-Language Support**: TypeScript, Python, Go, Java, and more (see [Multi-Language Support](#multi-language-support))
- **TypeScript Configuration**: Strict tsconfig.json, tsconfig.test.json, tsconfig.eslint.json, and .eslintrc.json automatically added to TypeScript projects
- **Code Quality Rules Guide**: Comprehensive documentation of TypeScript and ESLint rules with error prevention examples
- **Pre-PR Review Command**: `/review-changes` command for comprehensive code review before pushing changes
- **Pre-Push Hook**: Automatic review trigger that prevents pushing code with critical issues
- **Testing Guidelines**: Patterns for repository and service tests with mocking
- **Code Generation**: Step-by-step guides for creating repositories, services, and errors
- **Slash Commands**: Reusable commands for common development tasks (Claude Code)
- **Code Review**: Automated architecture violation detection with detailed reports
- **Multi-Tool Support**: Works with Claude Code, Cursor, Kilo Code, and Roo Code
- **Global Installation**: Install once, use in all your projects
- **Automatic Todo Commits**: Enforces git commits when tasks are completed
- **Comprehensive Test Suite**: 78+ tests following SOLID principles and best practices

## Quick Start

```bash
# 1. Install globally (once per machine)
npm install -g ai-dotfiles-manager

# 2. Navigate to your project
cd ~/projects/your-project

# 3. Run setup (interactive)
ai-dotfiles-manager setup

# Or run non-interactive setup with defaults
ai-dotfiles-manager setup --yes

# 4. Select tools (or use "✨ Select All")
# Creates centralized .dev/rules/ and provider configs pointing to it

# 5. Start coding with AI assistance!
# Claude Code hooks automatically load rules and commit completed todos

# 6. Check session status anytime
# Type /status in Claude Code to see loaded context and current task
```

## Migrating Existing Configurations

### Migration Script

For existing projects, use the migration script to transition to the new centralized structure:

```bash
# Run migration script
npm run migrate
```

This will:
1. Detect existing AI tool configurations
2. Backup existing files with timestamp
3. Migrate custom rules to `.dev/rules/.local/`
4. Set up centralized `.dev/rules/` structure
5. Update provider configurations to point to centralized rules
6. Remove old duplicated rule folders


If you run `ai-dotfiles-manager setup` on a project that already has AI tool configurations (.claude/, .cursorrules, etc.), you'll be prompted with migration options:

### Migration Options

**1. Migrate to .local/ (supersede shared rules)**
- Moves your existing files to `.local/` directories
- Your custom rules will override shared rules with the same names
- Best for: Projects with custom rules you want to preserve and prioritize

**2. Migrate to .local/ (preserve alongside shared rules)**
- Moves your existing files to `.local/` directories
- Your custom rules exist alongside shared rules (no override)
- Best for: Projects with additional custom rules

**3. Replace with new setup**
- Replaces everything with fresh templates (default option)
- Best for: Quick updates or starting fresh

**4. Skip - keep existing configuration as-is**
- Leaves current configuration untouched
- Setup does not proceed for that tool
- Best for: Manually managed configurations

### Migration Examples

**Claude Code (.claude/)**
```bash
# Existing custom rules moved to:
.dev/rules/.local/your-custom-rule.md
```

**Cursor (.cursorrules)**
```bash
# Existing file moved to:
.cursorrules.local
```

**Kilo Code (.kilocode/) and Roo Code (.roo/)**
```bash
# Existing custom rules moved to:
.dev/rules/.local/your-custom-rule.md
```

## Why Global Installation?

Global installation is the **recommended approach** because:

1. **Install Once, Use Everywhere**: One installation serves all your projects
2. **Always Available**: The command works from any directory
3. **Easy Updates**: Update once globally instead of in every project
4. **Consistent Standards**: All projects use the same rules and conventions
5. **Lightweight**: Projects don't need to include the package in dependencies

## Installation

### Option 1: Direct from GitHub (Easiest)

```bash
npm install -g git+https://github.com/TonyCasey/ai-dotfiles-manager.git

# Or install a specific version
npm install -g git+https://github.com/TonyCasey/ai-dotfiles-manager.git#v1.1.0
```

### Option 2: From npm Registry

```bash
npm install -g ai-dotfiles-manager
```

### Option 3: Shared Network Location

For teams without npm infrastructure:

```bash
# Clone to shared drive
git clone https://github.com/TonyCasey/ai-dotfiles-manager.git /shared/dev-tools/ai

# Each developer installs from there
npm install -g /shared/dev-tools/ai
```

### Verify Installation

```bash
ai-dotfiles-manager --version
ai-dotfiles-manager --help
```

## How It Works

### Centralized Rules (.dev/rules/)

All rules are **centralized** in `.dev/rules/` and referenced by all AI tools:

```bash
# After running "ai-dotfiles-manager setup":
~/projects/my-project/.dev/rules/
├── shared/              # Language-agnostic rules (managed copies)
│   ├── clean-architecture.md
│   ├── repository-pattern.md
│   └── testing-principles.md
├── typescript/          # Language-specific rules (managed copies)
│   ├── coding-standards.md
│   └── testing.md
└── .local/             # Project-specific overrides
    ├── custom-api-standards.md
    └── architecture.md   # Override shared rules
```

**Why centralized?**
- ✅ Single source of truth - no duplication across providers
- ✅ Update once, applies to all AI tools
- ✅ Consistent rules across Claude Code, Cursor, Kilo Code, Roo Code
- ✅ Easier maintenance and management

### Provider Configurations (Minimal)

Each AI tool has minimal configuration pointing to `.dev/rules/` (no per-provider rule folders):

```bash
.claude/settings.json     # Points to ../.dev/rules/
.cursorrules            # References ../.dev/rules/ files
.kilocode/config.json     # Points to ../.dev/rules/
.roo/config.json         # Points to ../.dev/rules/
```

**Benefits:**
- ✅ Provider folders still exist for tool-specific features
- ✅ All rules load from centralized location (shared)
- ✅ No more duplicated or shortcut rule folders in providers
- ✅ Easy to maintain and update

### Claude Code Hooks (Automatic)

Claude Code hooks automatically manage your workflow:

```bash
.claude/hooks/
├── session-start.js       # Runs when Claude Code session starts
├── session-end.js         # Runs when Claude Code session ends
└── user-prompt-submit.js  # Validates/enhances prompts (optional)
```

**What they do:**
- ✅ Auto-load `.dev/rules/` into AI context on session start
- ✅ Display project context (architecture, todos, git status)
- ✅ Extract and track current task from `todo.md`
- ✅ Commit completed todo items automatically on session end
- ✅ Track session statistics and duration
- ✅ Validate prompts for destructive operations (optional)
- ✅ Suggest relevant context files (optional)

### Windows Support

- Uses managed copies for all base rules (no symlinks required)
- No special permissions needed


## Developer Workspace (.dev/)

The `.dev/` folder is your **personal developer workspace** that's automatically loaded into AI context for every session.

### What's in .dev/?

**architecture.md** (auto-generated)
- Project structure overview
- Technologies and frameworks
- Architectural patterns
- Key principles
- Regenerated on setup/update

**todo.md** (your personal task list)
- Markdown checkboxes for tasks
- Simply check off `[x]` when complete
- AI sees your current priorities
- Helps AI provide contextual suggestions

**README.md** (auto-generated)
- Explains the .dev/ concept
- Usage instructions

### Auto-Loading

All `.md` files in `.dev/` are automatically loaded into AI context when you start a session with:
- Claude Code
- Cursor
- Kilo Code
- Roo Code

This gives AI assistants immediate understanding of:
- What you're working on (todo.md)
- How the project is structured (architecture.md)

### Example .dev/todo.md

```markdown
# Developer Todo List

## Current Sprint

- [ ] Implement user authentication
- [ ] Add password reset functionality
- [x] Set up database schema

## Backlog

- [ ] Add email notifications
- [ ] Implement rate limiting
```

Simply change `[ ]` to `[x]` when done - no explanations needed!

### Git

The `.dev/` folder is **personal** and typically not committed:

```gitignore
.dev/
```

However, you can commit it to share architecture notes or tasks with your team.

## Multi-Language Support

The package supports multiple programming languages with language-specific and language-agnostic rules.

### Supported Languages

- **TypeScript** (fully supported)
- **Python** (planned - Phase 2)
- **Go** (planned - Phase 3)
- **Java** (planned - future)
- **Rust** (planned - future)

### Architecture

```
templates/
├── shared/                      # Language-agnostic rules
│   └── rules/
│       ├── clean-architecture.md    # Universal architecture principles
│       ├── solid-principles.md      # Universal SOLID patterns
│       └── repository-pattern.md    # Universal data access pattern
│
├── languages/                   # Language-specific rules
│   ├── typescript/
│   │   └── rules/
│   │       ├── coding-standards.md  # TS naming, types, etc.
│   │       ├── testing.md           # Jest, ts-jest patterns
│   │       └── tooling.md           # TSC, ESLint, etc.
│   ├── python/  (coming soon)
│   ├── go/      (coming soon)
│   └── java/    (coming soon)
│
└── tools/                       # Tool-specific configs
    ├── claude/
    ├── cursor/
    ├── kilocode/
    └── roo/
```

### Language Auto-Detection

The setup wizard automatically detects your project language:

```javascript
// TypeScript: tsconfig.json or typescript in package.json
// Python: requirements.txt, pyproject.toml, setup.py
// Go: go.mod
// Rust: Cargo.toml
// Java: pom.xml, build.gradle
```

### Example: Language-Specific Patterns

**TypeScript:**
```typescript
// Interface in domain/interfaces/
export interface IProductRepository {
  getById(id: string): Promise<Product>;
}

// Implementation in infrastructure/repositories/
export class ProductRepository implements IProductRepository {
  constructor(private readonly db: IDatabase) {}
}
```

**Python (coming soon):**
```python
# Protocol in domain/interfaces/
from typing import Protocol

class ProductRepositoryProtocol(Protocol):
    def get_by_id(self, id: str) -> Product:
        ...

# Implementation in infrastructure/repositories/
class ProductRepository:
    def __init__(self, db: DatabaseProtocol):
        self._db = db
```

**Go (coming soon):**
```go
// Interface in domain/
type ProductRepository interface {
    GetByID(ctx context.Context, id string) (*Product, error)
}

// Implementation in infrastructure/
type productRepository struct {
    db Database
}
```

## Commands

### `setup` - Configure AI Tools

Set up AI assistant configuration in the current project:

```bash
# Interactive setup
ai-dotfiles-manager setup

# Non-interactive setup (uses defaults)
ai-dotfiles-manager setup --yes
ai-dotfiles-manager setup -y
```

**Interactive mode** prompts will ask:
- Which language? (auto-detected, or choose manually)
- Which AI tools? (Claude Code, Cursor, Kilo Code, Roo Code, or ✨ Select All)

**Non-interactive mode** (`--yes` flag):
- Uses detected language (defaults to TypeScript if not detected)
- Configures Claude Code only
- Perfect for CI/CD pipelines and automated setups

Creates configuration files in your project directory.

### `update` - Update Configuration

Update existing configuration with latest templates:

```bash
# Interactive update
ai-dotfiles-manager update

# Non-interactive update (uses defaults)
ai-dotfiles-manager update --yes
ai-dotfiles-manager update -y
```

Refreshes base rules (managed copies) while preserving your `.local/` customizations.
By default, replaces existing files without creating backups for streamlined updates.

### `review` - Code Review

Analyze codebase for Clean Architecture violations:

```bash
# Basic review
ai-dotfiles-manager review

# Detailed review (includes info-level messages)
ai-dotfiles-manager review --detailed

# JSON output (for CI/CD integration)
ai-dotfiles-manager review --json
```

**What it checks:**
- Layer Violations (domain importing infrastructure, etc.)
- Interface Conventions ('I' prefix, file naming)
- Repository Pattern (correct layers, DI)
- Service Pattern (constructor injection, layers)
- Domain Errors (extend DomainError)
- TypeScript Quality (no `any` types)

### `--version` - Show Version

```bash
ai-dotfiles-manager --version
```

### `--help` - Show Help

```bash
ai-dotfiles-manager --help
```

## Slash Commands (Claude Code)

After setup, use these commands in Claude Code:

### `/status`
Display current session status:
- Project name and time
- Loaded context (rules, architecture, todos)
- Current task from todo.md
- Git working directory status
- Beautifully formatted output

### `/create-repo`
Creates a repository following Clean Architecture:
- Repository interface in `src/domain/interfaces/`
- Domain error class (optional)
- Repository implementation in `src/infrastructure/repositories/`
- DI registration
- Comprehensive test file

### `/create-service`
Creates an application service:
- Service interface in `src/application/interfaces/`
- Service implementation in `src/application/services/`
- DI registration
- Test file with mocked dependencies

### `/create-error`
Creates a domain error:
- Error class extending `DomainError` in `src/domain/errors/`
- Export from error index
- Usage examples

### `/create-tests`
Generates test files:
- Proper test structure
- Mock dependencies setup
- Test cases for all methods
- Error case tests

## Customization

### Adding Custom Rules

Create new files in `.dev/rules/.local/`:

```bash
.dev/rules/.local/
  ├── custom-api-standards.md
  └── database-conventions.md
```

These custom rules are automatically loaded by all AI tools alongside the base rules.

### Overriding Base Rules

Create a file with the same name in `.local/`:

```bash
.dev/rules/.local/
  └── architecture.md    # Overrides shared/architecture.md
```

Your local version will take precedence over the base rule with the same name.

### Instructions

See `.dev/rules/.local/README.md` (auto-generated) for detailed instructions.

## Version Control

### Recommended .gitignore

```gitignore
# Ignore base rules copied from the package
.dev/rules/shared/
.dev/rules/typescript/
.dev/rules/python/
.dev/rules/go/
.dev/rules/java/

# Ignore provider configs (auto-generated from templates)
.claude/
.cursorrules
.kilocode/
.roo/

# Commit local customizations
!.dev/rules/.local/

# Ignore backups (created during migration)
*.backup.*

# Ignore session state files (auto-generated)
.dev/.session-state.json
.dev/.session-stats.json
.dev/.prompt-log.jsonl

# Developer workspace (personal - usually not committed)
.dev/todo.md
.dev/architecture.md
```

### Why?

- Base rules are managed copies → don't commit (teammates will run `ai-dotfiles-manager setup`)
- Local rules are yours → commit them (project-specific customizations)
- Everyone runs setup once, gets same base rules, sees your custom rules

## Team Workflow

### Day 1: New Developer Joins

```bash
# Step 1: Install the tool globally
npm install -g git+https://github.com/TonyCasey/ai-dotfiles-manager.git

# Step 2: Clone first project
git clone https://github.com/your-org/my-project.git
cd my-project

# Step 3: Set up AI assistance
ai-dotfiles-manager setup

# Step 4: Start coding!
# The AI now knows all development standards
```

### Week 2: New Project Assigned

```bash
# Clone another project
git clone https://github.com/your-org/my-other-project.git
cd my-other-project

# Set up AI (takes 10 seconds)
ai-dotfiles-manager setup

# Start coding with same standards!
```

### Month 2: Rules Updated

```bash
# Update the global tool
npm update -g ai-dotfiles-manager

# Refresh projects
cd ~/projects/my-project && ai-dotfiles-manager update
cd ~/projects/my-other-project && ai-dotfiles-manager update
```

## Quality Assurance

### Testing

The package includes a comprehensive test suite ensuring reliability and maintainability:

- **78+ Unit Tests** - Comprehensive coverage of core functionality including hooks
- **100% Coverage** - Language detection module fully tested
- **Hook Testing** - All Claude Code hooks have dedicated test suites
- **SOLID Principles** - Tests follow the same principles as production code
- **Fast Execution** - Full test suite runs in < 2 seconds
- **CI/CD Ready** - Proper exit codes and coverage reporting

```bash
# Run the full test suite
npm test

# Generate coverage report
npm run test:coverage
```

### Code Quality

- **Dependency Injection** - All modules accept dependencies for testability
- **Pure Functions** - Predictable behavior with no side effects
- **TypeScript AST** - Robust code analysis using TypeScript compiler API
- **Error Handling** - Graceful handling of edge cases and failures
- **Documentation** - JSDoc comments and comprehensive README

### Continuous Improvement

- Tests are required for all new features
- Code reviews ensure quality and consistency
- Regular updates with latest best practices
- Community feedback drives improvements

## Troubleshooting

### "command not found"

The global bin directory is not in PATH:

```bash
# Find npm global bin directory
npm config get prefix

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH="$(npm config get prefix)/bin:$PATH"

# Reload shell
source ~/.zshrc
```

### Updating Rules

To refresh base rules (managed copies) after upgrading the tool:

```bash
npm update -g ai-dotfiles-manager
ai-dotfiles-manager update
```

### Can't Edit Base Rules

This is intentional! Base rules are managed copies. To customize:
1. Create files in `.dev/rules/.local/`
2. See `.dev/rules/.local/README.md` for instructions
3. Your `.local/` files take precedence over base rules

### Rules Not Being Applied

If AI isn't following the rules:
1. Check `.dev/rules/` directory exists and has content
2. Verify `.claude/settings.json` has correct `rulesDirectory` path (`../.dev/rules`)
3. Try explicitly referencing a rule file in your prompt
4. Restart your AI coding assistant

### Commands Not Working (Claude Code)

If slash commands don't work:
1. Check `.claude/commands/` directory exists
2. Verify `settings.json` has correct `commandsDirectory` path
3. Restart Claude Code

## Architecture Overview

### Clean Architecture Layers

```
src/
├── domain/              # Core business entities and interfaces
│   ├── errors/          # Domain error classes
│   └── interfaces/      # Repository interfaces, core service interfaces
├── application/         # Business logic and use cases
│   ├── interfaces/      # Service interfaces, use case configs
│   └── services/        # Service implementations
└── infrastructure/      # External concerns
    ├── di/              # Dependency injection container
    ├── repositories/    # Repository implementations
    └── services/        # External API integrations
```

### Key Principles

1. **Dependency Inversion**: Dependencies flow inward (Infrastructure → Application → Domain)
2. **Repository Pattern**: All data access through repositories
3. **Dependency Injection**: Constructor injection for all dependencies
4. **Interface Segregation**: One focused interface per file
5. **Domain Errors**: Specific error classes with HTTP status codes

## Contributing

We welcome contributions! Here's how to contribute:

### Code Contributions

1. **Fork and Clone** the repository
2. **Create a branch** for your feature: `git checkout -b feature/your-feature`
3. **Make your changes** to files in `templates/`, `lib/`, or `scripts/`
4. **Write tests** for new functionality (see `__tests__/` for examples)
5. **Run the test suite** to ensure everything passes: `npm test`
6. **Test manually** by running `ai-dotfiles-manager setup` in a test project
7. **Commit your changes** with a descriptive message
8. **Submit a pull request** with a clear description of the changes

### Testing Requirements

- All new features must include unit tests
- Tests should follow the AAA pattern (Arrange, Act, Assert)
- Aim for at least 70% code coverage on new code
- Run `npm test` before submitting PR

### Code Quality Standards

- Follow SOLID principles
- Use dependency injection for testability
- Write pure functions where possible
- Add JSDoc comments for public APIs
- Follow existing code style

## Development

### Package Structure

```
ai-dotfiles-manager/
├── bin/
│   └── setup.js              # CLI setup tool
├── lib/
│   └── language-detector.js  # Language detection module (testable)
├── scripts/
│   └── review.js             # Code review engine
├── templates/
│   ├── shared/               # Language-agnostic rules
│   │   └── rules/
│   ├── languages/            # Language-specific rules
│   │   ├── typescript/rules/
│   │   └── python/rules/
│   ├── dev/                  # .dev/ workspace templates
│   ├── claude/               # Claude Code config + hooks
│   │   ├── hooks/
│   │   ├── commands/
│   │   └── settings.json
│   ├── cursor/               # Cursor config
│   ├── kilocode/             # Kilo Code config
│   └── roo/                  # Roo Code config
├── __tests__/
│   ├── helpers/              # Test utilities (fs-mock, etc.)
│   ├── fixtures/             # Test data and sample structures
│   ├── hooks/                # Tests for Claude Code hooks
│   ├── lib/                  # Tests for lib modules
│   ├── scripts/              # Tests for scripts
│   ├── setup.js              # Jest setup
│   └── README.md             # Testing documentation
├── jest.config.js            # Jest configuration
├── package.json
└── README.md
```

### Testing

The package includes a comprehensive test suite with 78+ tests following SOLID principles:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with verbose output
npm run test:verbose
```

**Test Coverage:**
- Language Detector: 100% ✅
- Claude Code Hooks: 100% ✅
- Code Reviewer: 27.82%
- Overall: 5 test suites, 78 passing tests

**Testing Principles:**
- AAA Pattern (Arrange, Act, Assert)
- Dependency Injection for testability
- Mock utilities for file system operations
- Pure functions with no side effects
- SOLID principles throughout

See `__tests__/README.md` for detailed testing documentation.

### Testing Locally

```bash
# Install dependencies
npm install

# Link the package
npm link

# Run tests
npm test

# Test in a project
cd /path/to/test-project
ai-dotfiles-manager setup

# Verify configuration is correct
```

### Adding a New Language

1. Create `templates/languages/{language}/rules/`
2. Add language-specific rules:
   - `coding-standards.md`
   - `testing.md`
   - `tooling.md`
3. Add detection logic in `lib/language-detector.js`
4. Add tests in `__tests__/lib/language-detector.test.js`
5. Run tests to verify: `npm test`
6. Test with a project in that language

## License

MIT License - See LICENSE file for details.

## Changelog

### 1.10.0
- **Improved Package Update Flow** - Streamlined updates and session management
  - Made "replace existing" the default option during package updates (no backups)
  - Added `--yes` / `-y` flag for non-interactive setup and updates
  - Fixed hooks format in settings.json for new Claude Code hooks API
  - Enhanced session-start hook with current task detection from todo.md
  - Added `/status` slash command for on-demand session info display
  - Improved visual formatting in session hooks with better banners
  - Updated help documentation with non-interactive mode examples

### 1.8.1
- **Removed Redundant Code** - Cleanup and optimization release
  - Removed duplicate provider-specific rules folders (7,248 lines deleted)
  - Removed unused `.claude/rules/` setup code
  - Single source of truth for all rules in `.dev/rules/`
  - All providers consistently reference `.dev/rules/`

### 1.8.0
- **Claude Code Hooks System** - Comprehensive hook implementation
  - Added `session-start.js` - Loads context and displays session info
  - Added `session-end.js` - Auto-commits todos and tracks statistics
  - Added `user-prompt-submit.js` - Validates and enhances prompts (optional)
  - Hooks located in `templates/claude/hooks/` → `.claude/hooks/`
  - Updated `settings.json` to reference `.claude/hooks/`
- **Hook Testing** - 25 new tests for hook functionality
  - session-start.test.js (8 tests)
  - session-end.test.js (8 tests)
  - user-prompt-submit.test.js (12 tests)
  - Test suite expanded from 53 to 78 tests

### 1.3.0
- **Added Migration Support** - Graceful handling of existing AI configurations
  - Detects existing .claude/, .cursorrules, .kilocode/, .roo/ configurations
  - Offers 4 migration options: supersede, preserve, replace, or skip
  - Automatically moves existing files to .local/ directories
  - Creates timestamped backups when replacing configurations
  - Special handling for .cursorrules single-file migration
- **Added Comprehensive Test Suite** - Enterprise-grade testing infrastructure
  - 53+ tests following SOLID principles and best practices
  - AAA pattern (Arrange, Act, Assert) throughout
  - Mock utilities for file system operations
  - 100% coverage on language-detector module
  - Jest configuration with coverage thresholds
  - Dependency injection for testability
- **Refactored for Testability** - Extracted pure functions
  - Created lib/language-detector.js module
  - Applied dependency injection pattern
  - Improved code maintainability
- Updated .gitignore recommendations to include backup directories and test coverage

### 1.2.0
- **Added `.dev/` Developer Workspace** - Personal workspace auto-loaded into AI context
  - `architecture.md` - Auto-generated project overview (structure, technologies, patterns)
  - `todo.md` - Personal task list with markdown checkboxes
  - Automatically loaded by all AI tools (Claude Code, Cursor, Kilo Code, Roo Code)
  - Provides immediate project context for AI assistants
- Updated all AI tool configurations to load `.dev/` files on session start
- Enhanced project analysis for better architecture.md generation
- Added framework detection (Next.js, React, Express, NestJS, etc.)
- Updated .gitignore recommendations to include `.dev/`

### 1.1.0
- Added "Select All" option for tool selection
- Added `update` command for updating existing configurations
- Switched to managed copies for consistency
- Added `.local/` directories for project-specific customizations
- Base rules treated as managed sources (edit via .local overrides)
- Auto-generate README.md in `.local/` directories with instructions
- Renamed package from `ai-dev-standards` to `ai-dotfiles-manager`
- Enhanced Windows support with junctions (no admin required for directories)
- Added Kilo Code support with comprehensive rule templates
- Added Roo Code support with comprehensive rule templates
- Added `review` command for automated architecture violation detection
- Enhanced setup wizard to support 4 AI tools
- Added TypeScript AST-based code analysis
- Updated documentation for managed-copies workflow

### 1.0.0
- Initial release
- Clean Architecture rules
- TypeScript conventions
- Testing guidelines
- Code generation patterns
- Slash commands for Claude Code
- Cursor support
- Interactive setup tool
- Global installation support

## Support

For issues, questions, or suggestions:
- Create an issue in the repository
- Check the documentation
- Contact the development team
