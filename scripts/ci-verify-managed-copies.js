#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

function fail(msg) {
  console.error(`CI check failed: ${msg}`);
  process.exit(1);
}

function ensure(cond, msg) {
  if (!cond) fail(msg);
}

(function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aidotfiles-ci-'));

  // Run setup with defaults (TypeScript, Claude only)
  const result = spawnSync(process.execPath, [path.join(__dirname, '..', 'bin', 'setup.js'), 'setup', '--yes'], {
    cwd: tmp,
    stdio: 'inherit',
    env: { ...process.env, CI: 'true' }
  });
  ensure(result.status === 0, 'setup exited non-zero');

  const shared = path.join(tmp, '.dev', 'rules', 'shared');
  const lang = path.join(tmp, '.dev', 'rules', 'typescript');
  const local = path.join(tmp, '.dev', 'rules', '.local');

  ensure(fs.existsSync(shared), 'shared rules missing');
  ensure(fs.existsSync(lang), 'language rules missing');
  ensure(fs.existsSync(local), '.local rules dir missing');

  const sharedStat = fs.lstatSync(shared);
  const langStat = fs.lstatSync(lang);

  ensure(sharedStat.isDirectory(), 'shared is not a directory');
  ensure(langStat.isDirectory(), 'language is not a directory');
  ensure(!sharedStat.isSymbolicLink?.() && !langStat.isSymbolicLink?.(), 'rules should be copied, not symlinked');

  console.log('CI verify: managed copies present (no symlinks) ✅');
})();

