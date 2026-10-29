'use strict';
// Fast, dependency-free health check for the renderer sources.
// Catches the two mistakes that break the no-build app most often:
// a syntax error, and an index.html reference that does not resolve
// (including case mismatches, which only fail on Linux/macOS).
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const repoRoot = path.resolve(__dirname, '..');
const homeDir = path.join(repoRoot, 'home');
const indexPath = path.join(homeDir, 'index.html');

const problems = [];
const notes = [];
const fail = message => problems.push(message);

function sources() {
  return fs.readdirSync(homeDir, { withFileTypes: true })
    .filter(entry => entry.isFile() && /\.(?:js|cjs)$/.test(entry.name))
    .map(entry => entry.name)
    .sort();
}

function checkSyntax(files) {
  let checked = 0;
  for (const name of files) {
    const file = path.join(homeDir, name);
    try {
      new vm.Script(fs.readFileSync(file, 'utf8'), { filename: file, displayErrors: true });
      checked += 1;
    } catch (error) {
      fail(`${name}: ${String(error.message).split('\n')[0]}`);
    }
  }
  return checked;
}

// Walk a relative URL segment by segment so a wrong-case name is reported exactly.
function resolveCaseExact(relative) {
  const clean = relative.replace(/[?#].*$/, '');
  if (!clean) return { ok: true };
  let current = homeDir;
  const segments = clean.split('/');
  const actual = [];
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    if (segment === '..') return { ok: false, reason: 'escapes home/' };
    let entries;
    try {
      entries = fs.readdirSync(current);
    } catch {
      return { ok: false, reason: `cannot read ${actual.join('/') || 'home/'}` };
    }
    if (!entries.includes(segment)) {
      const insensitive = entries.find(entry => entry.toLowerCase() === segment.toLowerCase());
      return {
        ok: false,
        reason: insensitive ? `wrong case, filesystem has "${insensitive}"` : 'missing',
      };
    }
    actual.push(segment);
    current = path.join(current, segment);
  }
  return { ok: true };
}

function checkIndexHtml() {
  const html = fs.readFileSync(indexPath, 'utf8');
  const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map(match => match[1])
    .filter(url => !/^(?:https?:|#|data:|mailto:)/.test(url));
  const counts = new Map();
  for (const ref of refs) counts.set(ref, (counts.get(ref) || 0) + 1);
  let resolved = 0;
  for (const ref of counts.keys()) {
    const result = resolveCaseExact(ref);
    if (result.ok) resolved += 1;
    else fail(`index.html: ${ref} — ${result.reason}`);
  }
  for (const [ref, count] of counts) {
    if (count > 1) fail(`index.html: ${ref} is loaded ${count} times`);
  }
  if (!/<script[^>]+src="/.test(html)) fail('index.html: no external scripts found — is this the right file?');
  return { refs: counts.size, resolved };
}

function checkIconManifest() {
  const manifestPath = path.join(homeDir, 'icons', 'manifest.json');
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    fail(`icons/manifest.json: ${error.message}`);
    return { entries: 0 };
  }
  let entries = 0;
  for (const [key, relative] of Object.entries(manifest)) {
    entries += 1;
    if (typeof relative !== 'string' || !relative) {
      fail(`icons/manifest.json: ${key} has no path`);
      continue;
    }
    const target = path.join(homeDir, 'icons', relative);
    if (!fs.existsSync(target)) fail(`icons/manifest.json: ${key} → ${relative} is missing`);
  }
  return { entries };
}

function checkBundledFonts() {
  let fonts = 0;
  for (const name of fs.readdirSync(homeDir).filter(entry => entry.endsWith('.css'))) {
    const css = fs.readFileSync(path.join(homeDir, name), 'utf8');
    for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
      const url = match[1];
      if (/^(?:https?:|data:)/.test(url)) continue;
      if (!/^fonts\//.test(url)) continue;
      fonts += 1;
      if (!fs.existsSync(path.join(homeDir, url.replace(/[?#].*$/, '')))) fail(`${name}: font ${url} is missing`);
    }
  }
  return { fonts };
}

const files = sources();
const syntax = checkSyntax(files);
const index = checkIndexHtml();
const manifest = checkIconManifest();
const fonts = checkBundledFonts();

if (!files.length) fail('home/: no JavaScript sources found');
notes.push(`${files.length} renderer sources, ${index.refs} index.html references, ${manifest.entries} icon entries, ${fonts.fonts} bundled font files`);

console.log('Cabanon source check');
console.log(`  ${notes[0]}`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const problem of problems) console.log(`  ✗ ${problem}`);
  process.exitCode = 1;
} else {
  console.log(`  ✓ syntax ${syntax}/${files.length}, references resolved, icons and fonts present`);
}
