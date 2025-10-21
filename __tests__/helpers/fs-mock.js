/**
 * File System Mock Helper
 * Provides utilities for mocking fs operations
 * Follows Interface Segregation Principle - focused on specific mock needs
 */

/**
 * Creates a mock file system structure
 * @param {Object} structure - Object representing directory structure
 * @returns {Map} Map of paths to file contents/stats
 */
function createMockFileSystem(structure) {
  const fileSystem = new Map();

  function traverse(obj, currentPath = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = currentPath ? `${currentPath}/${key}` : key;

      if (typeof value === 'string') {
        // File
        fileSystem.set(fullPath, {
          type: 'file',
          content: value,
          isDirectory: () => false,
          isFile: () => true,
          isSymbolicLink: () => false,
        });
      } else if (typeof value === 'object' && value !== null) {
        // Directory
        fileSystem.set(fullPath, {
          type: 'directory',
          children: Object.keys(value),
          isDirectory: () => true,
          isFile: () => false,
          isSymbolicLink: () => false,
        });
        traverse(value, fullPath);
      }
    }
  }

  traverse(structure);
  return fileSystem;
}

/**
 * Creates mock fs module based on file system structure
 * @param {Map} fileSystem - Mock file system from createMockFileSystem
 * @param {string} basePath - Base path to prepend (e.g., '/test-project')
 * @returns {Object} Mock fs module
 */
function createFsMock(fileSystem, basePath = '') {
  // Helper to normalize paths - handle both Unix and Windows separators
  const normalizePath = (p) => {
    if (!basePath) return p;
    // Normalize to forward slashes for consistent comparison
    const normalizedPath = p.replace(/\\/g, '/');
    const normalizedBase = basePath.replace(/\\/g, '/');

    // Remove base path prefix if present
    if (normalizedPath.startsWith(normalizedBase + '/')) {
      return normalizedPath.substring(normalizedBase.length + 1);
    }
    if (normalizedPath === normalizedBase) {
      return '';
    }
    return normalizedPath;
  };

  return {
    existsSync: jest.fn((path) => {
      const normalizedPath = normalizePath(path);
      return fileSystem.has(normalizedPath);
    }),

    readFileSync: jest.fn((path, encoding) => {
      const normalizedPath = normalizePath(path);
      const entry = fileSystem.get(normalizedPath);
      if (!entry || entry.type !== 'file') {
        throw new Error(`ENOENT: no such file or directory, open '${path}'`);
      }
      return entry.content;
    }),

    writeFileSync: jest.fn((path, content) => {
      const normalizedPath = normalizePath(path);
      fileSystem.set(normalizedPath, {
        type: 'file',
        content,
        isDirectory: () => false,
        isFile: () => true,
        isSymbolicLink: () => false,
      });
    }),

    mkdirSync: jest.fn((path, options) => {
      const normalizedPath = normalizePath(path);
      fileSystem.set(normalizedPath, {
        type: 'directory',
        children: [],
        isDirectory: () => true,
        isFile: () => false,
        isSymbolicLink: () => false,
      });
    }),

    readdirSync: jest.fn((path, options) => {
      const normalizedPath = normalizePath(path);
      const entry = fileSystem.get(normalizedPath);
      if (!entry || entry.type !== 'directory') {
        throw new Error(`ENOTDIR: not a directory, scandir '${path}'`);
      }

      if (options?.withFileTypes) {
        return entry.children.map(name => ({
          name,
          isDirectory: () => fileSystem.get(`${normalizedPath}/${name}`)?.type === 'directory',
          isFile: () => fileSystem.get(`${normalizedPath}/${name}`)?.type === 'file',
        }));
      }

      return entry.children;
    }),

    statSync: jest.fn((path) => {
      const normalizedPath = normalizePath(path);
      const entry = fileSystem.get(normalizedPath);
      if (!entry) {
        throw new Error(`ENOENT: no such file or directory, stat '${path}'`);
      }
      return entry;
    }),

    lstatSync: jest.fn((path) => {
      const normalizedPath = normalizePath(path);
      const entry = fileSystem.get(normalizedPath);
      if (!entry) {
        throw new Error(`ENOENT: no such file or directory, lstat '${path}'`);
      }
      return entry;
    }),

    symlinkSync: jest.fn((target, path, type) => {
      const normalizedPath = normalizePath(path);
      fileSystem.set(normalizedPath, {
        type: 'symlink',
        target,
        linkType: type,
        isDirectory: () => false,
        isFile: () => false,
        isSymbolicLink: () => true,
      });
    }),

    unlinkSync: jest.fn((path) => {
      const normalizedPath = normalizePath(path);
      fileSystem.delete(normalizedPath);
    }),

    copyFileSync: jest.fn((src, dest) => {
      const normalizedSrc = normalizePath(src);
      const normalizedDest = normalizePath(dest);
      const entry = fileSystem.get(normalizedSrc);
      if (!entry) {
        throw new Error(`ENOENT: no such file or directory, copyfile '${src}' -> '${dest}'`);
      }
      fileSystem.set(normalizedDest, { ...entry });
    }),

    rmSync: jest.fn((path, options) => {
      const normalizedPath = normalizePath(path);
      fileSystem.delete(normalizedPath);
    }),

    chmodSync: jest.fn((path, mode) => {
      // Mock implementation - does nothing in tests
    }),
  };
}

module.exports = {
  createMockFileSystem,
  createFsMock,
};
