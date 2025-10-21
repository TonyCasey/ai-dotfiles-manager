/**
 * Unit Tests for Language Detector
 * Following AAA pattern (Arrange, Act, Assert)
 * Tests pure functions with no side effects
 */

const path = require('path');
const {
  detectLanguage,
  hasTypeScript,
  hasJavaScript,
  hasPython,
  detectFramework,
} = require('../../lib/language-detector');
const { createMockFileSystem, createFsMock } = require('../helpers/fs-mock');
const fixtures = require('../fixtures/project-structures');

describe('Language Detector', () => {
  describe('detectLanguage', () => {
    it('should detect TypeScript from tsconfig.json', () => {
      // Arrange
      const fileSystem = createMockFileSystem(fixtures.typescriptProject);
      const fsMock = createFsMock(fileSystem, '/test-project');

      // Act
      const result = detectLanguage('/test-project', fsMock);

      // Assert
      expect(result).toBe('typescript');
      expect(fsMock.existsSync).toHaveBeenCalledWith('/test-project/tsconfig.json');
    });

    it('should detect TypeScript from package.json dependencies', () => {
      // Arrange
      const project = {
        'package.json': JSON.stringify({
          devDependencies: {
            typescript: '^5.0.0',
          },
        }),
      };
      const fileSystem = createMockFileSystem(project);
      const fsMock = createFsMock(fileSystem, '/test-project');

      // Act
      const result = detectLanguage('/test-project', fsMock);

      // Assert
      expect(result).toBe('typescript');
    });

    it('should detect JavaScript from package.json', () => {
      // Arrange
      const fileSystem = createMockFileSystem(fixtures.javascriptProject);
      const fsMock = createFsMock(fileSystem, '/test-project');

      // Act
      const result = detectLanguage('/test-project', fsMock);

      // Assert
      expect(result).toBe('javascript');
    });

    it('should detect Python from requirements.txt', () => {
      // Arrange
      const fileSystem = createMockFileSystem(fixtures.pythonProject);
      const fsMock = createFsMock(fileSystem, '/test-project');

      // Act
      const result = detectLanguage('/test-project', fsMock);

      // Assert
      expect(result).toBe('python');
    });

    it('should return null for unknown project type', () => {
      // Arrange
      const project = {
        'README.md': '# Test Project',
      };
      const fileSystem = createMockFileSystem(project);
      const fsMock = createFsMock(fileSystem, '/test-project');

      // Act
      const result = detectLanguage('/test-project', fsMock);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle missing directories gracefully', () => {
      // Arrange
      const fileSystem = createMockFileSystem({});
      const fsMock = createFsMock(fileSystem, '/nonexistent');

      // Act
      const result = detectLanguage('/nonexistent', fsMock);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('hasTypeScript', () => {
    it('should return true when tsconfig.json exists', () => {
      // Arrange
      const project = { 'tsconfig.json': '{}' };
      const fileSystem = createMockFileSystem(project);
      const fsMock = createFsMock(fileSystem, "/test-project");

      // Act
      const result = hasTypeScript('/test-project', fsMock);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when typescript is in dependencies', () => {
      // Arrange
      const project = {
        'package.json': JSON.stringify({
          dependencies: { typescript: '^5.0.0' },
        }),
      };
      const fileSystem = createMockFileSystem(project);
      const fsMock = createFsMock(fileSystem, "/test-project");

      // Act
      const result = hasTypeScript('/test-project', fsMock);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when typescript is in devDependencies', () => {
      // Arrange
      const project = {
        'package.json': JSON.stringify({
          devDependencies: { typescript: '^5.0.0' },
        }),
      };
      const fileSystem = createMockFileSystem(project);
      const fsMock = createFsMock(fileSystem, "/test-project");

      // Act
      const result = hasTypeScript('/test-project', fsMock);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when no TypeScript indicators exist', () => {
      // Arrange
      const project = {
        'package.json': JSON.stringify({
          dependencies: { express: '^4.0.0' },
        }),
      };
      const fileSystem = createMockFileSystem(project);
      const fsMock = createFsMock(fileSystem, "/test-project");

      // Act
      const result = hasTypeScript('/test-project', fsMock);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle invalid package.json gracefully', () => {
      // Arrange
      const project = {
        'package.json': 'invalid json{',
      };
      const fileSystem = createMockFileSystem(project);
      const fsMock = createFsMock(fileSystem, "/test-project");

      // Act
      const result = hasTypeScript('/test-project', fsMock);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('hasJavaScript', () => {
    it('should return true when package.json exists without TypeScript', () => {
      // Arrange
      const fileSystem = createMockFileSystem(fixtures.javascriptProject);
      const fsMock = createFsMock(fileSystem, "/test-project");

      // Act
      const result = hasJavaScript('/test-project', fsMock);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when TypeScript is present', () => {
      // Arrange
      const fileSystem = createMockFileSystem(fixtures.typescriptProject);
      const fsMock = createFsMock(fileSystem, "/test-project");

      // Act
      const result = hasJavaScript('/test-project', fsMock);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when package.json does not exist', () => {
      // Arrange
      const project = { 'README.md': '# Test' };
      const fileSystem = createMockFileSystem(project);
      const fsMock = createFsMock(fileSystem, "/test-project");

      // Act
      const result = hasJavaScript('/test-project', fsMock);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('hasPython', () => {
    it('should detect Python from requirements.txt', () => {
      // Arrange
      const project = { 'requirements.txt': 'flask==2.0.0' };
      const fileSystem = createMockFileSystem(project);
      const fsMock = createFsMock(fileSystem, "/test-project");

      // Act
      const result = hasPython('/test-project', fsMock);

      // Assert
      expect(result).toBe(true);
    });

    it('should detect Python from pyproject.toml', () => {
      // Arrange
      const project = { 'pyproject.toml': '[tool.poetry]' };
      const fileSystem = createMockFileSystem(project);
      const fsMock = createFsMock(fileSystem, "/test-project");

      // Act
      const result = hasPython('/test-project', fsMock);

      // Assert
      expect(result).toBe(true);
    });

    it('should detect Python from setup.py', () => {
      // Arrange
      const project = { 'setup.py': 'from setuptools import setup' };
      const fileSystem = createMockFileSystem(project);
      const fsMock = createFsMock(fileSystem, "/test-project");

      // Act
      const result = hasPython('/test-project', fsMock);

      // Assert
      expect(result).toBe(true);
    });

    it('should detect Python from Pipfile', () => {
      // Arrange
      const project = { 'Pipfile': '[[source]]' };
      const fileSystem = createMockFileSystem(project);
      const fsMock = createFsMock(fileSystem, "/test-project");

      // Act
      const result = hasPython('/test-project', fsMock);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when no Python files exist', () => {
      // Arrange
      const fileSystem = createMockFileSystem(fixtures.javascriptProject);
      const fsMock = createFsMock(fileSystem, "/test-project");

      // Act
      const result = hasPython('/test-project', fsMock);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('detectFramework', () => {
    it('should detect Next.js', () => {
      // Arrange
      const fileSystem = createMockFileSystem(fixtures.nextjsProject);
      const fsMock = createFsMock(fileSystem, "/test-project");

      // Act
      const result = detectFramework('/test-project', fsMock);

      // Assert
      expect(result).toBe('Next.js');
    });

    it('should detect Express', () => {
      // Arrange
      const project = {
        'package.json': JSON.stringify({
          dependencies: { express: '^4.18.0' },
        }),
      };
      const fileSystem = createMockFileSystem(project);
      const fsMock = createFsMock(fileSystem, "/test-project");

      // Act
      const result = detectFramework('/test-project', fsMock);

      // Assert
      expect(result).toBe('Express');
    });

    it('should detect React', () => {
      // Arrange
      const project = {
        'package.json': JSON.stringify({
          dependencies: { react: '^18.0.0' },
        }),
      };
      const fileSystem = createMockFileSystem(project);
      const fsMock = createFsMock(fileSystem, "/test-project");

      // Act
      const result = detectFramework('/test-project', fsMock);

      // Assert
      expect(result).toBe('React');
    });

    it('should detect NestJS', () => {
      // Arrange
      const project = {
        'package.json': JSON.stringify({
          dependencies: { '@nestjs/core': '^10.0.0' },
        }),
      };
      const fileSystem = createMockFileSystem(project);
      const fsMock = createFsMock(fileSystem, "/test-project");

      // Act
      const result = detectFramework('/test-project', fsMock);

      // Assert
      expect(result).toBe('NestJS');
    });

    it('should return Unknown for projects without known frameworks', () => {
      // Arrange
      const project = {
        'package.json': JSON.stringify({
          dependencies: { lodash: '^4.17.0' },
        }),
      };
      const fileSystem = createMockFileSystem(project);
      const fsMock = createFsMock(fileSystem, "/test-project");

      // Act
      const result = detectFramework('/test-project', fsMock);

      // Assert
      expect(result).toBe('Unknown');
    });

    it('should return Unknown when package.json does not exist', () => {
      // Arrange
      const project = { 'README.md': '# Test' };
      const fileSystem = createMockFileSystem(project);
      const fsMock = createFsMock(fileSystem, "/test-project");

      // Act
      const result = detectFramework('/test-project', fsMock);

      // Assert
      expect(result).toBe('Unknown');
    });

    it('should handle invalid package.json gracefully', () => {
      // Arrange
      const project = {
        'package.json': 'invalid json{',
      };
      const fileSystem = createMockFileSystem(project);
      const fsMock = createFsMock(fileSystem, "/test-project");

      // Act
      const result = detectFramework('/test-project', fsMock);

      // Assert
      expect(result).toBe('Unknown');
    });

    it('should prioritize Next.js over React', () => {
      // Arrange - Next.js includes React as dependency
      const project = {
        'package.json': JSON.stringify({
          dependencies: {
            next: '^14.0.0',
            react: '^18.0.0',
          },
        }),
      };
      const fileSystem = createMockFileSystem(project);
      const fsMock = createFsMock(fileSystem, "/test-project");

      // Act
      const result = detectFramework('/test-project', fsMock);

      // Assert
      expect(result).toBe('Next.js');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty project root', () => {
      // Arrange
      const fileSystem = createMockFileSystem({});
      const fsMock = createFsMock(fileSystem, "/test-project");

      // Act
      const language = detectLanguage('', fsMock);
      const framework = detectFramework('', fsMock);

      // Assert
      expect(language).toBeNull();
      expect(framework).toBe('Unknown');
    });

    it('should handle file system errors gracefully', () => {
      // Arrange
      const fsMock = {
        existsSync: jest.fn(() => {
          throw new Error('File system error');
        }),
        readFileSync: jest.fn(() => {
          throw new Error('File system error');
        }),
      };

      // Act & Assert
      expect(() => hasTypeScript('/test', fsMock)).toThrow();
    });
  });
});
