const path = require('path');
const {
  createProvider,
  setupTool,
  KiloProvider,
  RooProvider,
} = require('../../../lib/providers');
const {
  createMockFileSystem,
  createFsMock,
} = require('../../helpers/fs-mock');

describe('providers/index', () => {
  const projectRoot = '/project';
  const templatesRoot = '/templates';

  function createFs(structure = {}) {
    const fileSystem = createMockFileSystem(structure);
    return { fileSystem, fs: createFsMock(fileSystem) };
  }

  describe('createProvider', () => {
    it('returns KiloProvider for kilo tool', () => {
      const provider = createProvider('kilo', projectRoot, templatesRoot);
      expect(provider).toBeInstanceOf(KiloProvider);
    });

    it('returns RooProvider for roo tool', () => {
      const provider = createProvider('roo', projectRoot, templatesRoot);
      expect(provider).toBeInstanceOf(RooProvider);
    });
  });

  describe('setupTool', () => {
    it('copies kilocode config.json into .kilocode/', async () => {
      const { fileSystem, fs } = createFs({
        '/templates': {
          kilocode: {
            'config.json': '{ "rulesDirectory": "../.dev/rules" }',
          },
        },
        '/project': {},
      });

      const result = await setupTool('kilo', projectRoot, templatesRoot, {
        fs,
        autoYes: true,
        log: jest.fn(),
      });

      expect(result.success).toBe(true);
      const config = fileSystem.get(path.join(projectRoot, '.kilocode', 'config.json'));
      expect(config).toBeDefined();
      expect(config.content).toContain('"rulesDirectory"');
    });

    it('copies roo config.json into .roo/', async () => {
      const { fileSystem, fs } = createFs({
        '/templates': {
          roo: {
            'config.json': '{ "rulesDirectory": "../.dev/rules" }',
          },
        },
        '/project': {},
      });

      const result = await setupTool('roo', projectRoot, templatesRoot, {
        fs,
        autoYes: true,
        log: jest.fn(),
      });

      expect(result.success).toBe(true);
      const config = fileSystem.get(path.join(projectRoot, '.roo', 'config.json'));
      expect(config).toBeDefined();
      expect(config.content).toContain('"rulesDirectory"');
    });
  });
});
