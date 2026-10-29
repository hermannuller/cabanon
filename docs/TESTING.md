# Testing

The repository has no build step and no test framework. Checks are small Node scripts in
`tmp/` (scratch, not committed) driven by `tools/run-checks.cjs`.

For the 2026-10-29 interaction review — which failures are real bugs, which are stale
fixtures, and which need a design decision — see
[INTERACTION-AUDIT.md](INTERACTION-AUDIT.md).

## Levels

| Command | Scope | Requirements |
| --- | --- | --- |
| `npm run check` | Syntax of every `home/*.js`, all `index.html` references with exact case, `icons/manifest.json`, bundled `fonts/` URLs | Node only |
| `npm test` | `check` + unit checks from `tools/checks.json` | Node only |
| `npm run test:ui` | UI checks from `tools/checks.json` | Electron, a display |
| `npm run test:all` | Every `tmp/*.cjs` (hundreds of scripts, very slow) | Electron, a display |
| `npm run test:list` | Print the curated checks, marking `unit` or `ui` | Node only |

Filters match filenames: `node tools/run-checks.cjs folder- split`.
Other flags: `--bail` (stop on first failure), `--timeout=300000`, `--retry=1`,
`--settle=400` (pause between checks so a closing window cannot steal focus).

UI checks launch a fullscreen Electron window and are focus-sensitive: another window
stealing focus cancels the drag under test. Run them sequentially (the runner does), keep
the default settle delay, and use `--retry=1` if a machine still flakes.

## Environment

| Variable | Purpose |
| --- | --- |
| `CABANON_ELECTRON` | Electron binary or package folder |
| `CABANON_PLAYWRIGHT` | Path/name of a Playwright module |
| `CABANON_PLAYWRIGHT_CACHE` | Extra root to search for cached Playwright installs |

`tools/test-env.cjs` also deletes an inherited `ELECTRON_RUN_AS_NODE`, which otherwise
starts Node instead of the browser and makes Playwright report "Process failed to launch!".

## Updating the checks

`tools/checks.json` is the curated list used by `npm test` / `npm run test:ui`. Add a script
only when it passes on the current working tree, and keep the file name relative to `tmp/`.
New checks should resolve Electron, Playwright and the app URL through
`tools/test-env.cjs` rather than absolute paths:

```js
const { playwright, electronPath, homeUrl } = require('../tools/test-env.cjs');
```

Older checks hardcoded `C:/Users/...` paths and the Windows Edge channel; they were
rewritten once to resolve through `tools/test-env.cjs` (backup in
`tmp/_portable-backup-<date>/`). Keep new checks path-free.

## Known drift (pre-existing, not caused by the tooling)

These scripts fail on the current tree for reasons unrelated to the runner. Repair them
when touching the matching feature; do not add them to `checks.json` until they pass.

| Script | Symptom |
| --- | --- |
| `home-smoke.cjs` | Expects 42 pinned/desktop entries; current defaults differ |
| `file-operations-regression.cjs` | 1500-file paste scenario reports a copy-count mismatch |
| `file-batch-tools-check.cjs` | Expects an `≈` marker that the info table no longer renders |
| `filename-spec-check.cjs` | Looks for `[data-rename]`, renamed in the title-rename refactor |
| `gesture-revision-check.cjs` | Reads a drag origin that is now `undefined` |
| `river-check.cjs` | Welcome overlay stays open and blocks the first click |
| `phone-prototype-check.cjs` | Expects MARATHON first; phone now opens RIVER |
| `saved-button-state-check.cjs` | HELP and MARATHON pass; the WALL save state stays `save` |

The 2026-10-29 folder-group batch (`folder-split`, `folder-grid`, `folder-pane-swap`,
`folder-group-transfer`, `folder-new-window`, `folder-close-controls`, `dock-window-groups`)
passes and is in the curated list; `folder-group-transfer` needs the settle delay above.
