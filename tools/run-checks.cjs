'use strict';
// Sequential runner for the Playwright/Electron scratch checks in tmp/.
// Sequential on purpose: each UI check opens a fullscreen window and focus loss
// cancels the drag gestures under test.
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { repoRoot, tmpDir, resolveElectron } = require('./test-env.cjs');

const args = process.argv.slice(2);
const flags = new Set(args.filter(argument => argument.startsWith('--')));
const filters = args.filter(argument => !argument.startsWith('--'));

function defaultChecks() {
  const file = path.join(__dirname, 'checks.json');
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    console.error(`Cannot read tools/checks.json: ${error.message}`);
    process.exit(1);
  }
}

function allChecks() {
  return fs.readdirSync(tmpDir).filter(name => name.endsWith('.cjs')).sort()
    .map(name => ({ name: name.replace(/\.cjs$/, ''), file: name }));
}

// A check needs a live browser when it asks test-env for Playwright or Electron.
function needsUi(check) {
  try {
    const source = fs.readFileSync(path.join(tmpDir, check.file), 'utf8');
    return /test-env\.cjs['"]\)\.(?:playwright|electronPath)/.test(source);
  } catch {
    return false;
  }
}

let checks = flags.has('--all') ? allChecks() : defaultChecks();
if (filters.length) {
  checks = checks.filter(check => filters.some(filter => check.file.toLowerCase().includes(filter.toLowerCase())));
}
for (const check of checks) check.ui = needsUi(check);
if (flags.has('--unit')) checks = checks.filter(check => !check.ui);
if (flags.has('--ui')) checks = checks.filter(check => check.ui);

if (flags.has('--list')) {
  for (const check of checks) {
    const present = fs.existsSync(path.join(tmpDir, check.file));
    console.log(`${present ? '  ' : '? '}${(check.ui ? 'ui ' : 'unit').padEnd(5)}${check.name.padEnd(32)} tmp/${check.file}`);
  }
  console.log(`\n${checks.length} check(s) from ${flags.has('--all') ? 'tmp/ (all)' : 'tools/checks.json'}.`);
  process.exit(0);
}

if (!checks.length) {
  console.error('No checks matched. Try: npm run test:list');
  process.exit(1);
}

if (!fs.existsSync(tmpDir)) {
  console.error('tmp/ is missing: the scratch checks live there and are not part of git.');
  process.exit(1);
}

if (checks.some(check => check.ui) && !resolveElectron()) {
  console.error('These checks need Electron — install it in home/ or set CABANON_ELECTRON.\nUse "npm test" for the unit checks that run without a display.');
  process.exit(1);
}

const timeout = Number((args.find(argument => argument.startsWith('--timeout=')) || '').split('=')[1]) || 300000;
const retries = Number((args.find(argument => argument.startsWith('--retry=')) || '').split('=')[1]) || 0;
// A closing Electron window can steal focus from the next check and cancel its drag.
const settle = Number((args.find(argument => argument.startsWith('--settle=')) || '').split('=')[1]) || 400;
const bail = flags.has('--bail');

function runCheck(file) {
  return new Promise(resolve => {
    const child = spawn(process.execPath, [file], { cwd: repoRoot, stdio: 'inherit', env: process.env });
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill();
      resolve('timeout');
    }, timeout);
    child.on('error', () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve('error');
    });
    child.on('exit', code => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(code === 0 ? 'pass' : 'fail');
    });
  });
}

(async () => {
  const results = [];
  const startedAll = Date.now();

  for (let index = 0; index < checks.length; index += 1) {
    const check = checks[index];
    const file = path.join(tmpDir, check.file);
    if (!fs.existsSync(file)) {
      results.push({ name: check.name, state: 'missing', ms: 0 });
      console.log(`skip  ${check.name} (tmp/${check.file} not found)`);
      continue;
    }
    console.log(`\n▶ ${check.name}  [${index + 1}/${checks.length}]  tmp/${check.file}`);
    const started = Date.now();
    let state = await runCheck(file);
    // Focus-sensitive UI checks sometimes fail only because another window stole
    // focus; an opt-in retry keeps a suite run meaningful without hiding repeats.
    for (let attempt = 1; state !== 'pass' && attempt <= retries; attempt += 1) {
      console.log(`  retry ${attempt}/${retries}  ${check.name}`);
      state = await runCheck(file);
    }
    const ms = Date.now() - started;
    results.push({ name: check.name, state, ms });
    console.log(`  ${state === 'pass' ? 'PASS' : state.toUpperCase()}  ${check.name}  ${(ms / 1000).toFixed(1)}s`);
    if (index < checks.length - 1) await new Promise(resolve => setTimeout(resolve, settle));
    if (state !== 'pass' && bail) break;
  }

  const failed = results.filter(result => result.state !== 'pass');
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`${results.length - failed.length}/${results.length} passed in ${((Date.now() - startedAll) / 1000).toFixed(1)}s`);
  for (const result of failed) console.log(`  ${result.state.toUpperCase()}  ${result.name}`);
  process.exitCode = failed.length ? 1 : 0;
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
