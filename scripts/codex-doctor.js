#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function exists(p) { return fs.existsSync(p); }

function main() {
  const root = process.cwd();
  const manifestPath = path.join(root, '.dev', 'codex-manifest.json');
  const guidePath = path.join(root, 'AGENTS.md');
  const indexPath = path.join(root, '.dev', 'context-index.md');

  console.log('Codex Doctor');
  console.log('============');

  console.log(`Manifest: ${exists(manifestPath) ? 'found' : 'missing'}`);
  if (exists(manifestPath)) {
    try {
      const m = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      console.log(`  Load entries: ${Array.isArray(m.load) ? m.load.length : 0}`);
      (m.load || []).slice(0, 10).forEach(p => console.log(`  - ${p}`));
    } catch (e) {
      console.log(`  Invalid JSON: ${e.message}`);
    }
  }

  console.log(`Index: ${exists(indexPath) ? 'found' : 'missing'}`);

  console.log(`AGENTS.md: ${exists(guidePath) ? 'found' : 'missing'}`);
  if (exists(guidePath)) {
    const txt = fs.readFileSync(guidePath, 'utf-8');
    const hasBlock = txt.includes('<!-- ai-dotfiles-manager:codex-guide:start -->') && txt.includes('<!-- ai-dotfiles-manager:codex-guide:end -->');
    console.log(`  Managed block: ${hasBlock ? 'present' : 'missing'}`);
  }

  console.log('\nStatus: complete.');
}

main();

