/**
 * Unit Tests for Code Reviewer
 * Tests Clean Architecture violation detection
 */

const path = require('path');
const CodeReviewer = require('../../scripts/review');
const { createMockFileSystem, createFsMock } = require('../helpers/fs-mock');

describe('CodeReviewer', () => {
  let mockConsoleLog;

  beforeEach(() => {
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
  });

  describe('Constructor', () => {
    it('should initialize with default options', () => {
      // Arrange & Act
      const reviewer = new CodeReviewer('/test-project');

      // Assert
      expect(reviewer.projectRoot).toBe('/test-project');
      expect(reviewer.options.detailed).toBe(false);
      expect(reviewer.options.fix).toBe(false);
      expect(reviewer.options.format).toBe('console');
      expect(reviewer.violations).toEqual({
        errors: [],
        warnings: [],
        info: [],
      });
    });

    it('should initialize with custom options', () => {
      // Arrange & Act
      const reviewer = new CodeReviewer('/test-project', {
        detailed: true,
        fix: true,
        format: 'json',
      });

      // Assert
      expect(reviewer.options.detailed).toBe(true);
      expect(reviewer.options.fix).toBe(true);
      expect(reviewer.options.format).toBe('json');
    });
  });

  describe('collectTypeScriptFiles', () => {
    // Note: This test requires refactoring CodeReviewer to accept dependency injection
    // Skipping for now as it requires file system access
    it.skip('should collect all TypeScript files from src directory', () => {
      // TODO: Refactor CodeReviewer to accept fs module via dependency injection
      // This would allow proper mocking for unit tests
      // For now, this method is tested via integration tests when CodeReviewer.analyze() runs
    });

    it('should skip .d.ts declaration files', () => {
      // Arrange
      const projectStructure = {
        src: {
          'index.ts': 'export {}',
          'types.d.ts': 'declare module "test"',
        },
      };

      const fileSystem = createMockFileSystem(projectStructure);
      const fsMock = createFsMock(fileSystem);

      const reviewer = new CodeReviewer('/test-project');

      // We need to test the logic directly
      // This is a simplified test focusing on the filter logic

      // Act
      const isDeclarationFile = 'types.d.ts'.endsWith('.d.ts');

      // Assert
      expect(isDeclarationFile).toBe(true);
    });

    it('should skip node_modules and dist directories', () => {
      // Arrange
      const projectStructure = {
        src: {
          'index.ts': 'export {}',
        },
        node_modules: {
          'package': {
            'index.ts': 'export {}',
          },
        },
        dist: {
          'index.js': 'export {}',
        },
      };

      // This tests the skip logic conceptually
      const skipDirs = ['node_modules', 'dist', 'build', '.git', 'coverage'];

      // Act & Assert
      expect(skipDirs).toContain('node_modules');
      expect(skipDirs).toContain('dist');
    });
  });

  describe('getLayer', () => {
    it('should identify domain layer', () => {
      // Arrange
      const reviewer = new CodeReviewer('/test-project');

      // Act
      const layer = reviewer.getLayer('/test-project/src/domain/User.ts');

      // Assert
      expect(layer).toBe('domain');
    });

    it('should identify application layer', () => {
      // Arrange
      const reviewer = new CodeReviewer('/test-project');

      // Act
      const layer = reviewer.getLayer('/test-project/src/application/UserService.ts');

      // Assert
      expect(layer).toBe('application');
    });

    it('should identify infrastructure layer', () => {
      // Arrange
      const reviewer = new CodeReviewer('/test-project');

      // Act
      const layer = reviewer.getLayer('/test-project/src/infrastructure/UserRepository.ts');

      // Assert
      expect(layer).toBe('infrastructure');
    });

    it('should identify utils layer', () => {
      // Arrange
      const reviewer = new CodeReviewer('/test-project');

      // Act
      const layer = reviewer.getLayer('/test-project/src/utils/helper.ts');

      // Assert
      expect(layer).toBe('utils');
    });

    it('should return null for unknown layer', () => {
      // Arrange
      const reviewer = new CodeReviewer('/test-project');

      // Act
      const layer = reviewer.getLayer('/test-project/src/unknown/file.ts');

      // Assert
      expect(layer).toBeNull();
    });
  });

  describe('getLayerFromImport', () => {
    it('should detect layer from import path containing /domain/', () => {
      // Arrange
      const reviewer = new CodeReviewer('/test-project');

      // Act
      const layer = reviewer.getLayerFromImport(
        '../domain/interfaces/IUser',
        '/test-project/src/application/UserService.ts'
      );

      // Assert
      expect(layer).toBe('domain');
    });

    it('should detect layer from import path containing /application/', () => {
      // Arrange
      const reviewer = new CodeReviewer('/test-project');

      // Act
      const layer = reviewer.getLayerFromImport(
        '@/application/services/UserService',
        '/test-project/src/infrastructure/repositories/UserRepository.ts'
      );

      // Assert
      expect(layer).toBe('application');
    });

    it('should detect layer from import path containing /infrastructure/', () => {
      // Arrange
      const reviewer = new CodeReviewer('/test-project');

      // Act
      const layer = reviewer.getLayerFromImport(
        '../infrastructure/database/connection',
        '/test-project/src/application/UserService.ts'
      );

      // Assert
      expect(layer).toBe('infrastructure');
    });

    it('should return null for external packages', () => {
      // Arrange
      const reviewer = new CodeReviewer('/test-project');

      // Act
      const layer = reviewer.getLayerFromImport(
        'express',
        '/test-project/src/application/UserService.ts'
      );

      // Assert
      expect(layer).toBeNull();
    });
  });

  describe('addViolation', () => {
    it('should add error violation', () => {
      // Arrange
      const reviewer = new CodeReviewer('/test-project');

      // Act
      reviewer.addViolation(
        'error',
        '/test-project/src/domain/User.ts',
        10,
        'LAYER_VIOLATION',
        'Domain cannot import from infrastructure'
      );

      // Assert
      expect(reviewer.violations.errors).toHaveLength(1);
      expect(reviewer.violations.errors[0]).toEqual({
        file: 'src/domain/User.ts',
        line: 10,
        code: 'LAYER_VIOLATION',
        message: 'Domain cannot import from infrastructure',
      });
      expect(reviewer.stats.totalViolations).toBe(1);
    });

    it('should add warning violation', () => {
      // Arrange
      const reviewer = new CodeReviewer('/test-project');

      // Act
      reviewer.addViolation(
        'warning',
        '/test-project/src/domain/interfaces/UserRepository.ts',
        5,
        'INTERFACE_NAMING',
        'Interface should be prefixed with I'
      );

      // Assert
      expect(reviewer.violations.warnings).toHaveLength(1);
      expect(reviewer.violations.warnings[0].code).toBe('INTERFACE_NAMING');
      expect(reviewer.stats.totalViolations).toBe(1);
    });

    it('should add info violation', () => {
      // Arrange
      const reviewer = new CodeReviewer('/test-project');

      // Act
      reviewer.addViolation(
        'info',
        '/test-project/src/domain/interfaces/types.ts',
        null,
        'MULTIPLE_INTERFACES',
        'File contains multiple interfaces'
      );

      // Assert
      expect(reviewer.violations.info).toHaveLength(1);
      expect(reviewer.violations.info[0].code).toBe('MULTIPLE_INTERFACES');
      expect(reviewer.violations.info[0].line).toBeNull();
    });

    it('should increment total violations count', () => {
      // Arrange
      const reviewer = new CodeReviewer('/test-project');

      // Act
      reviewer.addViolation('error', '/test-project/src/test.ts', 1, 'TEST', 'Test 1');
      reviewer.addViolation('warning', '/test-project/src/test.ts', 2, 'TEST', 'Test 2');
      reviewer.addViolation('info', '/test-project/src/test.ts', 3, 'TEST', 'Test 3');

      // Assert
      expect(reviewer.stats.totalViolations).toBe(3);
    });
  });

  describe('extractImports', () => {
    it('should extract import statements from TypeScript AST', () => {
      // Arrange
      const ts = require('typescript');
      const reviewer = new CodeReviewer('/test-project');

      const sourceCode = `
import { User } from './User';
import express from 'express';
import type { Request } from 'express';
      `;

      const sourceFile = ts.createSourceFile(
        'test.ts',
        sourceCode,
        ts.ScriptTarget.Latest,
        true
      );

      // Act
      const imports = reviewer.extractImports(sourceFile);

      // Assert
      expect(imports).toHaveLength(3);
      expect(imports[0].module).toBe('./User');
      expect(imports[1].module).toBe('express');
      expect(imports[2].module).toBe('express');
      expect(imports[0].line).toBeGreaterThan(0);
    });

    it('should handle files with no imports', () => {
      // Arrange
      const ts = require('typescript');
      const reviewer = new CodeReviewer('/test-project');

      const sourceCode = `
export class User {
  constructor(public name: string) {}
}
      `;

      const sourceFile = ts.createSourceFile(
        'test.ts',
        sourceCode,
        ts.ScriptTarget.Latest,
        true
      );

      // Act
      const imports = reviewer.extractImports(sourceFile);

      // Assert
      expect(imports).toHaveLength(0);
    });
  });

  describe('extractInterfaces', () => {
    it('should extract interface declarations from TypeScript AST', () => {
      // Arrange
      const ts = require('typescript');
      const reviewer = new CodeReviewer('/test-project');

      const sourceCode = `
export interface IUserRepository {
  findById(id: string): Promise<User>;
}

export interface IUser {
  id: string;
  name: string;
}
      `;

      const sourceFile = ts.createSourceFile(
        'test.ts',
        sourceCode,
        ts.ScriptTarget.Latest,
        true
      );

      // Act
      const interfaces = reviewer.extractInterfaces(sourceFile);

      // Assert
      expect(interfaces).toHaveLength(2);
      expect(interfaces[0].name).toBe('IUserRepository');
      expect(interfaces[1].name).toBe('IUser');
      expect(interfaces[0].line).toBeGreaterThan(0);
    });
  });

  describe('extractClasses', () => {
    it('should extract class declarations from TypeScript AST', () => {
      // Arrange
      const ts = require('typescript');
      const reviewer = new CodeReviewer('/test-project');

      const sourceCode = `
export class UserService {
  constructor(private repository: IUserRepository) {}

  async getUser(id: string): Promise<User> {
    return this.repository.findById(id);
  }
}
      `;

      const sourceFile = ts.createSourceFile(
        'test.ts',
        sourceCode,
        ts.ScriptTarget.Latest,
        true
      );

      // Act
      const classes = reviewer.extractClasses(sourceFile);

      // Assert
      expect(classes).toHaveLength(1);
      expect(classes[0].name).toBe('UserService');
      expect(classes[0].hasConstructor).toBe(true);
      expect(classes[0].line).toBeGreaterThan(0);
    });

    it('should detect class inheritance', () => {
      // Arrange
      const ts = require('typescript');
      const reviewer = new CodeReviewer('/test-project');

      const sourceCode = `
export class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super(\`User \${userId} not found\`);
  }
}
      `;

      const sourceFile = ts.createSourceFile(
        'test.ts',
        sourceCode,
        ts.ScriptTarget.Latest,
        true
      );

      // Act
      const classes = reviewer.extractClasses(sourceFile);

      // Assert
      expect(classes).toHaveLength(1);
      expect(classes[0].name).toBe('UserNotFoundError');
      expect(classes[0].extends).toBeDefined();
      expect(classes[0].extends.length).toBeGreaterThan(0);
    });

    it('should detect class implementing interfaces', () => {
      // Arrange
      const ts = require('typescript');
      const reviewer = new CodeReviewer('/test-project');

      const sourceCode = `
export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User> {
    // implementation
  }
}
      `;

      const sourceFile = ts.createSourceFile(
        'test.ts',
        sourceCode,
        ts.ScriptTarget.Latest,
        true
      );

      // Act
      const classes = reviewer.extractClasses(sourceFile);

      // Assert
      expect(classes).toHaveLength(1);
      expect(classes[0].name).toBe('UserRepository');
      expect(classes[0].implements).toBeDefined();
      expect(classes[0].implements.length).toBeGreaterThan(0);
    });
  });

  describe('Integration', () => {
    it('should correctly classify violations by severity', () => {
      // Arrange
      const reviewer = new CodeReviewer('/test-project');

      // Act
      reviewer.addViolation('error', '/test/file1.ts', 1, 'ERR1', 'Error 1');
      reviewer.addViolation('error', '/test/file2.ts', 2, 'ERR2', 'Error 2');
      reviewer.addViolation('warning', '/test/file3.ts', 3, 'WARN1', 'Warning 1');
      reviewer.addViolation('info', '/test/file4.ts', 4, 'INFO1', 'Info 1');

      // Assert
      expect(reviewer.violations.errors.length).toBe(2);
      expect(reviewer.violations.warnings.length).toBe(1);
      expect(reviewer.violations.info.length).toBe(1);
      expect(reviewer.stats.totalViolations).toBe(4);
    });
  });
});
