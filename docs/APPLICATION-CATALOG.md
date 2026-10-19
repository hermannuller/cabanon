# Application catalog — 2026-10-17

Exactly 23 applications: MARATHON, TXT, PNYX, Ur, RIVER, THEN, COLORS, EMPTY, BLIND, STUFF, BERLIN, PEOPLE, DATE, TYPE, WHERE, DIAL, OUTSIDE, NEWS, STOCKS, CALC, OURDESIGN, HELP, μmail.

## Preserved implementations

- RIVER, including rive and canal prototype pages.
- CALQ → CALC: working calculator, fixed dimensions and window behavior.
- WALL → BERLIN: canvas editor, wallpaper, saved artwork and .wall/.pwall formats.
- STUFF: existing ZIP viewer and archive operations; app entry lists ZIP documents.
- HELP → HELP: existing reader and shortcuts. .help → .help migrates filenames and references without changing document contents.
- File browsing, document reading/editing, file operations, settings and system controls remain available.
- Removed catalog shells: LOGIC and AIR-EAR; MAP is replaced by WHERE. Existing .gri/.ear files remain intact and readable through the generic file reader.

## Application icon count

Before the unfinished-app marker: 10 distinct rendered app-entry graphics across 23 entries, with many generic-document fallbacks.
After the marker: 6 distinct app-entry graphics. Five functional apps retain their current graphics; 18 unfinished apps share one filled-square marker. The outer SVG remains 32 × 32 and the filled square occupies 28 × 28 within it. BLIND’s original icon definition remains preserved in icons.js.

This counts software-entry graphics only, not window controls, folder navigation, system controls, or river’s internal navigation. The shared paths registry currently contains 36 original logical names plus the unfinished marker; the solid library adds BLIND as another logical name. Outline/solid variants and repeated uses are not additional app icons.

The marker is temporary pending the user’s icon font. No new bespoke application graphics were invented. Keep the icon slot stable when replacing SVG artwork with font glyphs; the font uses JetBrains-compatible metrics.

## Validation

Application entry points, 23-name whitelist, capitalization, preserved configuration migration, .help ownership/parser, existing help document migration and all settings sections were checked in a browser with no runtime errors.
