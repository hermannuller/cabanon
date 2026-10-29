# Cabanon

Cabanon is a text-and-icon operating system prototype built with Electron: one fullscreen
window, a virtual filesystem, 23 registered applications and the same data shown as a
desktop, a phone and (partially) a pad interface. There is no build step — the renderer is
plain HTML/CSS/JS loaded by `home/index.html`.

## Run

Requirements: Node.js 20+ and an Electron install for the current platform.

```sh
cd home
npm install        # once; downloads Electron
cd ..
npm start          # resolves Electron, then opens the app
```

`npm start` looks for Electron in `home/node_modules`, `./node_modules`, the sibling
`../blind` checkout used during development, or `$CABANON_ELECTRON`. `npm run start:where`
prints the binary it would use. Windows can also double-click `home\start.cmd`; Linux and
macOS can run `./start.sh`.

The phone build is the same source served over the LAN:

```sh
npm run phone:serve      # foreground, prints the Wi-Fi URL
npm run phone:start      # background
npm run phone:stop
```

Open `http://<lan-ip>:8787/phone/` in a phone browser and add it to the home screen. See
[docs/PHONE-WEB-APP.md](docs/PHONE-WEB-APP.md).

## Verify

| Command | What it does | Needs a display |
| --- | --- | --- |
| `npm run check` | Syntax of every renderer script, every `index.html` reference (case-exact), icon manifest and bundled fonts | no |
| `npm test` | `check` plus the unit checks (calculator, internet time, WALL, selection, drag labels) | no |
| `npm run test:ui` | The curated Electron/Playwright checks in `tmp/` | yes |
| `npm run test:list` | List the curated checks and whether each is UI or unit | no |

`tmp/` holds the scratch checks and is not committed. See [docs/TESTING.md](docs/TESTING.md)
for environment variables, retries and the list of checks that have drifted.

## Layout

| Path | Contents |
| --- | --- |
| `home/` | Electron main process, renderer sources, fonts, icons |
| `docs/` | Feature specs, interaction contracts, UI screenshots |
| `tools/` | Launcher, source check, test runner, tmp cleanup |
| `paragraph-explorer/` | Early standalone paragraph file manager prototype |
| Root Markdown | Design plans and specifications (`HOME-SPEC`, `RIVER-SPEC`, `UI-RULES`, …) |

## Data

Files, profiles and drafts live in the Electron user-data directory, outside the repository:

- Windows: `%APPDATA%\Cabanon OS Prototype`
- Linux: `~/.config/Cabanon OS Prototype`
- macOS: `~/Library/Application Support/Cabanon OS Prototype`

The phone web build keeps its own browser-local data; it does not sync with the desktop.

## Status

A working prototype, not a product. MARATHON, TXT, RIVER, ZIP, WALL, CALC and HELP are
implemented; the remaining catalog entries are placeholder windows. RIVER/rive/CANAL are
local prototypes, not live services. Sample files, network, volume, weather and power are
simulated. See [CABANON-PLAN.md](CABANON-PLAN.md) for the roadmap and
[docs/LINUX.md](docs/LINUX.md) for the Linux port notes.
