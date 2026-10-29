'use strict';
// Cross-platform replacement for home/start.cmd: resolve Electron, then run the app.
const { spawn } = require('node:child_process');
const path = require('node:path');
const { repoRoot, homeDir, resolveElectron } = require('./test-env.cjs');

const binary = resolveElectron();
if (!binary) {
  console.error('Electron was not found.\n');
  console.error('  Windows / macOS / Linux:  cd home && npm install');
  console.error('  Or point CABANON_ELECTRON at an existing electron binary.\n');
  console.error('Looked in: home/node_modules, ./node_modules and the sibling "blind" checkout.');
  process.exit(1);
}

if (process.argv.includes('--where')) {
  console.log(binary);
  process.exit(0);
}

const flags = [];
// Chromium refuses to start as root without this on Linux; keep normal sandboxing everywhere else.
if (process.platform === 'linux' && typeof process.getuid === 'function' && process.getuid() === 0) {
  flags.push('--no-sandbox');
  console.warn('Running Electron as root: adding --no-sandbox.');
}

const args = [...flags, homeDir, ...process.argv.slice(2).filter(argument => argument !== '--where')];
const env = { ...process.env };
// A globally exported ELECTRON_RUN_AS_NODE would start Node instead of the app.
delete env.ELECTRON_RUN_AS_NODE;
const child = spawn(binary, args, { cwd: repoRoot, stdio: 'inherit', env });

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    if (!child.killed) child.kill(signal);
  });
}

child.on('error', error => {
  console.error(`Could not start Electron (${path.basename(binary)}): ${error.message}`);
  process.exitCode = 1;
});
child.on('exit', (code, signal) => {
  process.exitCode = signal ? 1 : code ?? 0;
});
