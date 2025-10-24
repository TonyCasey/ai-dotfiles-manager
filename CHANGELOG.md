# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

## [Unreleased]

## [1.6.2] - 2024-10-24

### Fixed
- **Duplicate Slash Commands**: Removed `allowedCommands` field from settings.json template that was causing commands to be registered twice
  - Commands now load correctly from `commandsDirectory` without duplication
  - `allowedCommands` should only be used when restricting/whitelisting specific commands

## [1.6.1] - 2024-10-24

### Fixed
- **Invalid hooks.prePush Configuration**: Removed unsupported `hooks.prePush` from settings.json template
  - Claude Code only supports: PreToolUse, PostToolUse, Notification, UserPromptSubmit, SessionStart, SessionEnd, Stop, SubagentStop, PreCompact
  - Eliminates "Expected array, but received object" validation error on startup

## [1.6.0] - 2024-10-24

### Fixed
- **Critical Security Fix**: Shell injection vulnerability in session-end.js
  - Changed from string interpolation to stdin input for git commits
  - Task names can now safely contain quotes and special characters
- **Syntax Error**: Fixed incorrect variable assignment in ternary operator (session-start.js:111)
  - Removed erroneous `statusIcon =` assignment that caused JavaScript syntax error
- **Promise Handling**: Fixed `.catch()` call on non-async main() function in both session hooks
  - Changed to try/catch blocks to properly handle synchronous errors
- **Settings.json Symlink Issue**: Changed from symlink to copy for project-specific configuration
  - Each project now has its own settings.json instead of sharing global template
  - Prevents accidental global template modifications

## [1.5.4] - 2024-10-24

### Added
- **Pre-PR Review Command**: New `/review-changes` command for comprehensive code review before pushing
  - Analyzes all changes compared to main branch
  - Code quality assessment with Clean Architecture compliance check
  - Testing coverage analysis
  - Breaking changes detection
  - Security and performance review
  - Documentation status check
  - Provides actionable recommendations
- **Pre-Push Hook**: Automatic review trigger when user requests a push
  - Blocks pushes with critical issues (security, failing tests, etc.)
  - Warns about non-critical issues and asks user for confirmation
  - Integrates seamlessly with git push workflow
  - Configurable via Claude settings (can be disabled)
- **Review Categories**:
  - Source code changes analysis
  - Test coverage assessment
  - Configuration changes review
  - Documentation updates check
  - Architecture compliance verification
  - Security vulnerability detection
  - Performance issue identification

### Changed
- Updated Claude settings.json to include pre-push hook configuration
- Enhanced hooks setup to include pre-push-review.md
- Added `/review-changes` to allowed commands list

### Documentation
- Comprehensive pre-PR review guidelines with structured output format
- Pre-push hook documentation with decision logic and edge cases
- Examples of critical issues vs warnings
- User override capabilities documented

## [1.5.3] - 2024-10-24

### Added
- **Code Quality Rules Guide**: Added comprehensive `code-quality-rules.md` to shared rules
  - Documents all TypeScript compiler rules and their purpose
  - Explains ESLint rules for TypeScript projects
  - Provides error prevention examples for common mistakes
  - Includes development workflow and pre-commit check guidelines
  - Shows IDE integration and CI/CD pipeline setup
  - Quick reference table for all rules and their locations
- **Error Prevention**: Detailed guide on preventing 6 major error categories:
  - Import/Export errors
  - Missing properties in interfaces
  - Type mismatches
  - Incomplete mocks
  - Array/Object safety
  - Async/Promise errors

### Documentation
- Added comprehensive documentation on TypeScript and ESLint rules
- Included real-world examples of errors caught by each rule
- Provided setup instructions for IDE integration and git hooks

## [1.5.2] - 2024-10-24

### Added
- **ESLint Configuration**: Automatically copies `.eslintrc.json` with TypeScript-specific linting rules
- **ESLint TypeScript Config**: Added `tsconfig.eslint.json` for ESLint parsing configuration
- **Configuration Backup**: Existing configuration files are now automatically backed up with `.bak` extension before being replaced
- **Incremental Backups**: If `.bak` file exists, creates numbered backups (`.bak1`, `.bak2`, etc.)

### Changed
- Updated `setupTypeScriptConfig()` to include ESLint configuration files
- Changed behavior from skipping existing files to backing them up and replacing
- Enhanced console output to show backup file locations
- Updated documentation to reflect ESLint support and backup feature

## [1.5.1] - 2024-10-24

### Added
- **TypeScript Configuration Files**: Automatically copies strict `tsconfig.json` and `tsconfig.test.json` to TypeScript projects during setup
- **Strict Type Checking**: Includes comprehensive compiler options for maximum type safety
- **Test Configuration**: Separate test config with relaxed rules for testing
- **Setup Integration**: TypeScript configs are automatically added when setting up TypeScript projects

### Changed
- Updated setup process to include TypeScript configuration files
- Enhanced documentation to reflect TypeScript configuration feature
- Updated `printNextSteps()` to inform users about TypeScript config files

## [1.5.0] - 2024-10-24 - Centralized Architecture with Session Hooks

- **Added Centralized Rules (.dev/rules/)**: Single source of truth for all AI tools
- **Implemented Session Hooks**: Automatic start/end actions with todo commit enforcement
- **Added Migration Script**: Transition from old distributed structure to centralized rules
- **Enhanced Provider Configurations**: Minimal configs pointing to centralized rules
- **Updated Documentation**: Comprehensive guide for new architecture
- **Improved .gitignore**: Updated recommendations for centralized structure
- **Added Todo Commit Command**: `ai-dotfiles-manager commit-todo` for manual enforcement

#### Breaking Changes
- Provider configurations now point to centralized `.dev/rules/` instead of containing duplicate rules
- Existing installations should run `npm run migrate` to transition to new structure

#### Migration Guide
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

#### New Features
- **Session Start Hook**: Automatically loads `.dev/rules/` content into AI context
- **Session End Hook**: Commits completed todo items automatically
- **Todo Commit Enforcement**: Ensures no completed work goes uncommitted
- **Centralized Rules**: Single source of truth eliminates duplication

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2024-10-21

### Added
- **Windows compatibility improvements**: Automatic fallback to file copying when symlinks fail
- **Sync script generation**: Auto-generated `sync-rules.js` script for Windows users when symlinks fail
- **Enhanced error handling**: Graceful fallback for Windows symlink permission issues
- **Documentation updates**: Comprehensive Windows troubleshooting and usage instructions

### Changed
- Modified `setupSymlink` function to return operation status and detect copy fallback
- Enhanced Windows support documentation with fallback mode instructions
- Improved Claude setup to automatically add sync script when needed

### Fixed
- Windows users no longer blocked by symlink permission errors
- Rules are now accessible via copied files when symlinks fail
- Automatic detection of Windows environment for appropriate fallback behavior

## [1.3.0] - Previous release

### Added
- Enhanced Windows support with junctions (no admin required for directories)
- Set symlinked files as read-only to prevent accidental modifications
- Updated documentation for symlink-only workflow

### Changed
- Removed copy option (symlink-only for consistency)
- Improved error messages and troubleshooting guidance