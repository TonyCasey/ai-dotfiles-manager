# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

## [Unreleased]

### 1.3.0 - Centralized Architecture with Session Hooks

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