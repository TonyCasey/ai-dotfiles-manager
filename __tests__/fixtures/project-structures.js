/**
 * Test Fixtures for Project Structures
 * Provides sample project structures for testing
 * Follows Single Responsibility Principle - only provides test data
 */

/**
 * TypeScript project with tsconfig.json
 */
const typescriptProject = {
  'tsconfig.json': JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      module: 'commonjs',
      strict: true,
    },
  }),
  'package.json': JSON.stringify({
    name: 'test-project',
    version: '1.0.0',
    dependencies: {
      'express': '^4.18.0',
    },
    devDependencies: {
      'typescript': '^5.0.0',
      '@types/node': '^18.0.0',
    },
  }),
  src: {
    'index.ts': 'console.log("Hello World");',
    domain: {
      interfaces: {
        'IUserRepository.ts': 'export interface IUserRepository {}',
      },
      errors: {
        'UserNotFoundError.ts': 'export class UserNotFoundError extends Error {}',
      },
    },
    application: {
      services: {
        'UserService.ts': 'export class UserService {}',
      },
    },
    infrastructure: {
      repositories: {
        'UserRepository.ts': 'export class UserRepository {}',
      },
    },
  },
};

/**
 * JavaScript project without TypeScript
 */
const javascriptProject = {
  'package.json': JSON.stringify({
    name: 'test-project',
    version: '1.0.0',
    dependencies: {
      'express': '^4.18.0',
    },
  }),
  src: {
    'index.js': 'console.log("Hello World");',
  },
};

/**
 * Python project
 */
const pythonProject = {
  'requirements.txt': 'flask==2.0.0\npytest==7.0.0',
  'pyproject.toml': '[tool.poetry]\nname = "test-project"\nversion = "1.0.0"',
  src: {
    '__init__.py': '',
    'main.py': 'print("Hello World")',
  },
};

/**
 * Next.js project (TypeScript)
 */
const nextjsProject = {
  'tsconfig.json': JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      module: 'esnext',
    },
  }),
  'package.json': JSON.stringify({
    name: 'nextjs-project',
    version: '1.0.0',
    dependencies: {
      'next': '^14.0.0',
      'react': '^18.0.0',
      'react-dom': '^18.0.0',
    },
    devDependencies: {
      'typescript': '^5.0.0',
    },
  }),
  src: {
    app: {
      'page.tsx': 'export default function Page() {}',
    },
  },
};

/**
 * Project with existing .claude directory
 */
const projectWithClaude = {
  'package.json': JSON.stringify({
    name: 'existing-project',
    version: '1.0.0',
  }),
  '.claude': {
    rules: {
      'custom-rule.md': '# Custom Rule\nThis is a custom rule.',
      'architecture.md': '# Architecture\nOur architecture.',
    },
  },
};

/**
 * Project with existing .cursorrules file
 */
const projectWithCursor = {
  'package.json': JSON.stringify({
    name: 'existing-project',
    version: '1.0.0',
  }),
  '.cursorrules': '# Cursor Rules\nExisting cursor rules.',
};

/**
 * Empty project
 */
const emptyProject = {
  'package.json': JSON.stringify({
    name: 'empty-project',
    version: '1.0.0',
  }),
};

module.exports = {
  typescriptProject,
  javascriptProject,
  pythonProject,
  nextjsProject,
  projectWithClaude,
  projectWithCursor,
  emptyProject,
};
