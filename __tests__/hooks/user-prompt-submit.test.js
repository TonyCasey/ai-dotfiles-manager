/**
 * Unit Tests for user-prompt-submit.js hook
 * Tests the Claude Code user prompt submission hook functionality
 */

describe('User Prompt Submit Hook', () => {
  let promptSubmit;

  beforeEach(() => {
    // Clear module cache
    jest.resetModules();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Module Loading', () => {
    it('should load without errors', () => {
      // Act & Assert - should not throw
      expect(() => {
        promptSubmit = require('../../templates/claude/hooks/user-prompt-submit.js');
      }).not.toThrow();
    });

    it('should export required functions', () => {
      // Arrange
      promptSubmit = require('../../templates/claude/hooks/user-prompt-submit.js');

      // Assert
      expect(promptSubmit).toHaveProperty('validatePrompt');
      expect(promptSubmit).toHaveProperty('enhancePrompt');
      expect(promptSubmit).toHaveProperty('logPrompt');
      expect(typeof promptSubmit.validatePrompt).toBe('function');
      expect(typeof promptSubmit.enhancePrompt).toBe('function');
      expect(typeof promptSubmit.logPrompt).toBe('function');
    });
  });

  describe('validatePrompt', () => {
    it('should warn about destructive operations', () => {
      // Arrange
      promptSubmit = require('../../templates/claude/hooks/user-prompt-submit.js');
      const prompt = 'delete all files in the directory';

      // Act
      const warnings = promptSubmit.validatePrompt(prompt);

      // Assert
      expect(Array.isArray(warnings)).toBe(true);
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0]).toContain('Destructive operation');
    });

    it('should warn about very short prompts', () => {
      // Arrange
      promptSubmit = require('../../templates/claude/hooks/user-prompt-submit.js');
      const prompt = 'fix it';

      // Act
      const warnings = promptSubmit.validatePrompt(prompt);

      // Assert
      expect(Array.isArray(warnings)).toBe(true);
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0]).toContain('short prompt');
    });

    it('should return no warnings for normal prompts', () => {
      // Arrange
      promptSubmit = require('../../templates/claude/hooks/user-prompt-submit.js');
      const prompt = 'Create a new user service that handles authentication and authorization';

      // Act
      const warnings = promptSubmit.validatePrompt(prompt);

      // Assert
      expect(Array.isArray(warnings)).toBe(true);
      expect(warnings).toHaveLength(0);
    });

    it('should handle empty prompts', () => {
      // Arrange
      promptSubmit = require('../../templates/claude/hooks/user-prompt-submit.js');

      // Act
      const warnings = promptSubmit.validatePrompt('');

      // Assert
      expect(Array.isArray(warnings)).toBe(true);
    });
  });

  describe('enhancePrompt', () => {
    it('should return suggestions array', () => {
      // Arrange
      promptSubmit = require('../../templates/claude/hooks/user-prompt-submit.js');
      const prompt = 'Show me the code';

      // Act
      const suggestions = promptSubmit.enhancePrompt(prompt);

      // Assert
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should handle empty prompts', () => {
      // Arrange
      promptSubmit = require('../../templates/claude/hooks/user-prompt-submit.js');

      // Act
      const suggestions = promptSubmit.enhancePrompt('');

      // Assert
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions).toHaveLength(0);
    });
  });

  describe('logPrompt', () => {
    it('should be callable', () => {
      // Arrange
      promptSubmit = require('../../templates/claude/hooks/user-prompt-submit.js');

      // Act & Assert - should not throw
      expect(() => {
        promptSubmit.logPrompt('test prompt');
      }).not.toThrow();
    });

    it('should handle empty prompts', () => {
      // Arrange
      promptSubmit = require('../../templates/claude/hooks/user-prompt-submit.js');

      // Act & Assert - should not throw
      expect(() => {
        promptSubmit.logPrompt('');
      }).not.toThrow();
    });
  });

  describe('File Structure', () => {
    it('should be a valid JavaScript file', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../../templates/claude/hooks/user-prompt-submit.js');

      // Check file exists
      expect(fs.existsSync(hookPath)).toBe(true);

      // Check file is readable
      const content = fs.readFileSync(hookPath, 'utf-8');
      expect(content).toContain('validatePrompt');
      expect(content).toContain('enhancePrompt');
      expect(content).toContain('logPrompt');
      expect(content).toContain('module.exports');
    });

    it('should have shebang for direct execution', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../../templates/claude/hooks/user-prompt-submit.js');
      const content = fs.readFileSync(hookPath, 'utf-8');

      expect(content).toMatch(/^#!/);
    });
  });
});
