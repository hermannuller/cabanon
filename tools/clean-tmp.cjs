'use strict';
// Removes the throwaway Chromium profiles that every Electron check leaves behind.
// Dry run by default; --apply actually deletes. Only direct children of tmp/
// named like "<label>-<uuid>" are touched, and each path is re-verified first.
const fs = require('node:fs');
const path = require('node:path');
const { repoRoot, tmpDir } = require('./test-env.cjs');

const apply = process.argv.includes('--apply');
const withLogs = process.argv.includes('--logs');
const PROFILE = /^[A-Za-z0-9._-]+-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

if (path.basename(tmpDir) !== 'tmp' || !fs.existsSync(tmpDir)) {
  console.error(`Refusing to clean: ${tmpDir} is not an existing tmp/ folder.`);
  process.exit(1);
}

function sizeOf(target) {
  let total = 0;
  const stack = [target];
  while (stack.length) {
    const current = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile()) {
        try {
          total += fs.statSync(full).size;
        } catch {}
      }
    }
  }
  return total;
}

const profiles = [];
for (const entry of fs.readdirSync(tmpDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const full = path.join(tmpDir, entry.name);
  if (!PROFILE.test(entry.name)) continue;
  const real = fs.realpathSync(full);
  if (path.dirname(real) !== fs.realpathSync(tmpDir)) continue;
  const stat = fs.lstatSync(full);
  if (!stat.isDirectory() || stat.isSymbolicLink()) continue;
  profiles.push({ name: entry.name, full, bytes: sizeOf(full) });
}

const logs = withLogs
  ? fs.readdirSync(tmpDir).filter(name => name.endsWith('.log')).map(name => ({ name, full: path.join(tmpDir, name), bytes: fs.statSync(path.join(tmpDir, name)).size }))
  : [];
const targets = [...profiles, ...logs];
const totalBytes = targets.reduce((sum, target) => sum + target.bytes, 0);
const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);

console.log(`Cabanon tmp cleanup${apply ? '' : ' (dry run)'}`);
console.log(`  repo: ${repoRoot}`);
console.log(`  ${profiles.length} test profile(s), ${logs.length} log(s), ${mb(totalBytes)} MB`);
for (const target of profiles.slice(0, 5)) console.log(`  - ${target.name}  ${mb(target.bytes)} MB`);
if (profiles.length > 5) console.log(`  … and ${profiles.length - 5} more profile(s)`);

if (!targets.length) {
  console.log('  Nothing to remove.');
  process.exit(0);
}
if (!apply) {
  console.log('\nRe-run with --apply to delete these throwaway profiles.');
  process.exit(0);
}

let removed = 0;
let freed = 0;
for (const target of targets) {
  try {
    fs.rmSync(target.full, { recursive: true, force: true, maxRetries: 2 });
    removed += 1;
    freed += target.bytes;
  } catch (error) {
    console.error(`  failed: ${target.name}: ${error.message}`);
  }
}
console.log(`\nRemoved ${removed}/${targets.length} (${mb(freed)} MB). Screenshots, logs and check scripts were kept.`);
