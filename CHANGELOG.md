# Changelog

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