# Linux port notes

Status: not yet launched on a real Linux desktop. Static review found only a few
Windows-specific pieces, listed below; everything else is platform-neutral.

## Install and run

```sh
sudo apt install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
  libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 \
  libasound2 libpango-1.0-0 libcairo2      # Debian/Ubuntu names; use the distro equivalent
cd home && npm install
cd .. && npm start
```

`tools/launch.cjs` resolves the platform binary (`electron` instead of `electron.exe`) and
adds `--no-sandbox` automatically when running as root, which Chromium requires in
containers. Set `CABANON_ELECTRON` to use a system-wide Electron instead.

## Platform-neutral as written

- `serve-phone.cjs` uses `os.networkInterfaces()` and `fetch`, not `ipconfig`.
- `internet-time.cjs` uses `fetch` only; it never touches the system clock.
- Storage usage uses `fs.statfs`, available in the bundled Node.
- Fonts (JetBrains Mono, Inter, Source Han Sans, MiSans) ship in `home/fonts`.
- File URLs use forward slashes; `npm run check` verifies every `index.html` reference
  with exact case, so a Linux-only casing failure is caught even on Windows.
- `windows-key.ps1` and `captureWindowsKey` are already guarded by
  `process.platform !== 'win32'`.

## Windows-only today

| Piece | Impact on Linux |
| --- | --- |
| `home/windows-key.ps1` | The FROM (Windows/Super) key is not captured. `before-input-event` still handles `F8`+`F1`/`F2`, so PC/phone switching works. The renderer also accepts DOM `Meta`/`OS` key events as a fallback, but that has not been verified under a Linux window manager. |
| `home/start.cmd`, `start-phone-web.cmd`, `stop-phone-web.cmd`, `allow-phone-lan.*` | Convenience wrappers. Use `npm start`, `npm run phone:serve`, `npm run phone:stop`. |
| Fullscreen frameless window | Some tiling window managers ignore the requested fullscreen geometry; test and add a WM rule if needed. `Alt+F4` is handled by the window manager. |

## Things to verify on first Linux run

1. `npm run check` then `npm start`.
2. PC/phone mode switch using `F8`+`F1` / `F8`+`F2`.
3. Whether the Super key reaches the renderer as `Meta`/`OS`; if not, decide between a
   `keyd`/`caps2esc`-style helper and an explicit replacement shortcut.
4. Drag gestures and box selection on a non-100% scale factor.
5. `npm run test:ui` (needs Playwright; `npm install --no-save playwright` and
   `npx playwright install chromium` if the bundled browser is missing).

## Packaging (later)

The app reads `home/` directly, so a packaged build needs `home/` as an extra resource and
`main.cjs` kept as the entry. `app.setPath('userData', …)` already gives a stable data
folder per platform.
