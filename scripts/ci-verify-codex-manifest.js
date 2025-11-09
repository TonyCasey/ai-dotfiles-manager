#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function fail(msg) {
  console.error(`CI check failed: ${msg}`);
  process.exit(1);
}

function main() {
  const root = process.cwd();
  const manifestPath = path.join(root, '.dev', 'codex-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    fail('Missing .dev/codex-manifest.json');
  }
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  } catch (e) {
    fail(`Invalid manifest JSON: ${e.message}`);
  }
  if (!Array.isArray(manifest.load) || manifest.load.length === 0) {
    fail('Manifest has empty or missing "load" array');
  }
  const missing = manifest.load.filter(p => !fs.existsSync(path.join(root, p)));
  if (missing.length) {
    fail(`Manifest references missing files: ${missing.join(', ')}`);
  }
  console.log('CI verify: codex manifest present and valid ✅');
}

main();

