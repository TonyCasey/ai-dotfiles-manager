/**
 * Tests for CLI Parser Module
 * Demonstrates SOLID principles and AAA pattern
 */

const { parseArguments, getCommandType } = require('../../lib/cli-parser');

describe('CLI Parser', () => {
  describe('parseArguments', () => {
    it('should parse command with no flags', () => {
      // Arrange
      const argv = ['setup'];

      // Act
      const result = parseArguments(argv);

      // Assert
      expect(result.command).toBe('setup');
      expect(result.flags).toEqual([]);
      expect(result.options.autoYes).toBe(false);
      expect(result.options.help).toBe(false);
      expect(result.options.version).toBe(false);
    });

    it('should parse command with --yes flag', () => {
      // Arrange
      const argv = ['setup', '--yes'];

      // Act
      const result = parseArguments(argv);

      // Assert
      expect(result.command).toBe('setup');
      expect(result.options.autoYes).toBe(true);
      expect(result.flags).toContain('--yes');
    });

    it('should parse command with -y short flag', () => {
      // Arrange
      const argv = ['update', '-y'];

      // Act
      const result = parseArguments(argv);

      // Assert
      expect(result.command).toBe('update');
      expect(result.options.autoYes).toBe(true);
      expect(result.flags).toContain('-y');
    });

    it('should parse --no-codex-guide flag', () => {
      // Arrange
      const argv = ['setup', '--no-codex-guide'];

      // Act
      const result = parseArguments(argv);

      // Assert
      expect(result.options.noCodexGuide).toBe(true);
    });

    it('should parse multiple flags', () => {
      // Arrange
      const argv = ['review', '--detailed', '--json'];

      // Act
      const result = parseArguments(argv);

      // Assert
      expect(result.command).toBe('review');
      expect(result.options.detailed).toBe(true);
      expect(result.options.json).toBe(true);
      expect(result.flags).toEqual(['--detailed', '--json']);
    });

    it('should parse --help flag', () => {
      // Arrange
      const argv = ['--help'];

      // Act
      const result = parseArguments(argv);

      // Assert
      expect(result.options.help).toBe(true);
      expect(result.command).toBeNull();
    });

    it('should parse --version flag', () => {
      // Arrange
      const argv = ['-v'];

      // Act
      const result = parseArguments(argv);

      // Assert
      expect(result.options.version).toBe(true);
      expect(result.command).toBeNull();
    });

    it('should extract command arguments', () => {
      // Arrange
      const argv = ['review', '--detailed', 'src/', 'lib/'];

      // Act
      const result = parseArguments(argv);

      // Assert
      expect(result.command).toBe('review');
      expect(result.commandArgs).toEqual(['--detailed', 'src/', 'lib/']);
    });

    it('should handle empty argv', () => {
      // Arrange
      const argv = [];

      // Act
      const result = parseArguments(argv);

      // Assert
      expect(result.command).toBeNull();
      expect(result.flags).toEqual([]);
      expect(result.options.autoYes).toBe(false);
    });
  });

  describe('getCommandType', () => {
    it('should normalize "setup" command', () => {
      // Arrange & Act
      const result = getCommandType('setup');

      // Assert
      expect(result).toBe('setup');
    });

    it('should normalize "init" to "setup"', () => {
      // Arrange & Act
      const result = getCommandType('init');

      // Assert
      expect(result).toBe('setup');
    });

    it('should normalize null/undefined to "setup"', () => {
      // Arrange & Act
      const result1 = getCommandType(null);
      const result2 = getCommandType(undefined);

      // Assert
      expect(result1).toBe('setup');
      expect(result2).toBe('setup');
    });

    it('should return "update" for update command', () => {
      // Arrange & Act
      const result = getCommandType('update');

      // Assert
      expect(result).toBe('update');
    });

    it('should return "review" for review command', () => {
      // Arrange & Act
      const result = getCommandType('review');

      // Assert
      expect(result).toBe('review');
    });

    it('should return "commit-todo" for commit-todo command', () => {
      // Arrange & Act
      const result = getCommandType('commit-todo');

      // Assert
      expect(result).toBe('commit-todo');
    });

    it('should return "unknown" for unrecognized command', () => {
      // Arrange & Act
      const result = getCommandType('invalid-command');

      // Assert
      expect(result).toBe('unknown');
    });
  });
});
