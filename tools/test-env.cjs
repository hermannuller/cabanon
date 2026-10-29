'use strict';
// Shared resolution of the two native dependencies used by the scratch checks:
// Electron (the app binary) and Playwright (the UI driver).
// Absolute per-machine paths from earlier sessions stay supported as fallbacks,
// but nothing in this file requires a specific user name or drive letter.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const repoRoot = path.resolve(__dirname, '..');
const homeDir = path.join(repoRoot, 'home');
const tmpDir = path.join(repoRoot, 'tmp');

// Some shells and CI images export ELECTRON_RUN_AS_NODE=1, which turns the
// Electron binary into plain Node. Playwright then sees "bad option:
// --remote-debugging-port" and the launch fails. Checks always want the browser.
delete process.env.ELECTRON_RUN_AS_NODE;

function electronBinaryIn(packageDir) {
  if (!packageDir) return null;
  const dist = path.basename(packageDir) === 'dist' ? packageDir : path.join(packageDir, 'dist');
  const relative = process.platform === 'win32'
    ? 'electron.exe'
    : process.platform === 'darwin'
      ? path.join('Electron.app', 'Contents', 'MacOS', 'Electron')
      : 'electron';
  const candidate = path.join(dist, relative);
  try {
    if (fs.statSync(candidate).isFile()) return candidate;
  } catch {}
  return null;
}

function resolveElectron() {
  const configured = process.env.CABANON_ELECTRON;
  if (configured) {
    const resolved = path.resolve(configured);
    try {
      if (fs.statSync(resolved).isFile()) return resolved;
      if (fs.statSync(resolved).isDirectory()) {
        const direct = path.join(resolved, process.platform === 'win32' ? 'electron.exe' : 'electron');
        if (fs.existsSync(direct)) return direct;
        const fromPackage = electronBinaryIn(resolved);
        if (fromPackage) return fromPackage;
      }
    } catch {}
  }
  const packages = [
    path.join(homeDir, 'node_modules', 'electron'),
    path.join(repoRoot, 'node_modules', 'electron'),
    // Local convenience: this workspace historically borrowed the sibling checkout.
    path.resolve(repoRoot, '..', 'blind', 'node_modules', 'electron'),
    path.resolve(repoRoot, '..', 'cabanon', 'node_modules', 'electron'),
  ];
  for (const pkg of packages) {
    const binary = electronBinaryIn(pkg);
    if (binary) return binary;
  }
  // An installed electron package also reports its own binary path.
  for (const base of [homeDir, repoRoot]) {
    try {
      const reported = require(path.join(base, 'node_modules', 'electron'));
      if (typeof reported === 'string' && fs.existsSync(reported)) return reported;
    } catch {}
  }
  return null;
}

function playwrightFromCache() {
  const cacheRoots = [
    process.env.CABANON_PLAYWRIGHT_CACHE,
    path.join(os.homedir(), '.cache', 'codex-runtimes'),
    path.join(os.homedir(), 'AppData', 'Local', 'codex-runtimes'),
  ].filter(Boolean);
  for (const root of cacheRoots) {
    let entries;
    try {
      entries = fs.readdirSync(root);
    } catch {
      continue;
    }
    for (const entry of entries) {
      for (const name of ['playwright', 'playwright-core']) {
        const candidate = path.join(root, entry, 'dependencies', 'node', 'node_modules', name);
        try {
          if (fs.statSync(candidate).isDirectory()) return require(candidate);
        } catch {}
      }
    }
  }
  return null;
}

function resolvePlaywright() {
  const configured = process.env.CABANON_PLAYWRIGHT;
  if (configured) return require(configured.startsWith('.') || path.isAbsolute(configured) ? path.resolve(repoRoot, configured) : configured);
  for (const name of ['playwright', 'playwright-core', '@playwright/test']) {
    try {
      return require(name);
    } catch {}
  }
  const cached = playwrightFromCache();
  if (cached) return cached;
  throw new Error(
    'Playwright is not available.\n' +
    '  Install it once:  npm install --no-save playwright\n' +
    '  or point CABANON_PLAYWRIGHT at an existing playwright module folder.'
  );
}

module.exports = {
  repoRoot,
  homeDir,
  tmpDir,
  resolveElectron,
  get homeUrl() {
    return pathToFileURL(path.join(homeDir, 'index.html')).href;
  },
  get electronPath() {
    const found = resolveElectron();
    if (!found) {
      throw new Error(
        'Electron is not available.\n' +
        '  Install it:        cd home && npm install\n' +
        '  or point CABANON_ELECTRON at an electron binary (or its package folder).'
      );
    }
    return found;
  },
  get playwright() {
    return resolvePlaywright();
  },
};
