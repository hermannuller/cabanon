# Application catalog — 2026-10-22

Exactly 24 applications: MARATHON, TXT, POINT, Ur, RIVER, THEN, COLORS, EMPTY, LINE, ZIP, WALL, CARE, DATE, TYPE, WHERE, DIAL, WEATHER, NEWS, STOCKS, CALC, OutDesign, HELP, ASTRO, TIME.

## Preserved implementations

- RIVER, including rive and canal prototype pages.
- CALC: working calculator, fixed dimensions and window behavior.
- WALL: canvas editor, wallpaper, saved artwork and .wall/.pwall formats.
- ZIP: existing ZIP viewer and archive operations; app entry lists ZIP documents.
- HELP: existing reader and shortcuts. .help → .help migrates filenames and references without changing document contents.
- File browsing, document reading/editing, file operations, settings and system controls remain available.
- Removed catalog shells: LOGIC and AIR-EAR; MAP is replaced by WHERE. Existing .gri/.ear files remain intact and readable through the generic file reader.

## Application icon count

Before the unfinished-app marker: 10 distinct rendered app-entry graphics across 23 entries, with many generic-document fallbacks.
After the marker: 6 distinct app-entry graphics. Five functional apps retain their current graphics; 18 unfinished apps share one filled-square marker. The outer SVG remains 32 × 32 and the filled square occupies 28 × 28 within it. LINE’s original icon definition remains preserved in icons.js.

This counts software-entry graphics only, not window controls, folder navigation, system controls, or river’s internal navigation. The shared paths registry currently contains 36 original logical names plus the unfinished marker; the solid library adds LINE as another logical name. Outline/solid variants and repeated uses are not additional app icons.

The marker is temporary pending the user’s icon font. No new bespoke application graphics were invented. Keep the icon slot stable when replacing SVG artwork with font glyphs; the font uses JetBrains-compatible metrics.

## Validation

Application entry points, 23-name whitelist, capitalization, preserved configuration migration, .help ownership/parser, existing help document migration and all settings sections were checked in a browser with no runtime errors.


## ASTRO

- ASTRO is a separate bundled application in the shared PC/Phone catalog, with a stable ASTRO ID and display-name registry entry. It currently uses the standard unfinished-app mark and PC application shell, with no file associations.
- Phone astronomy widgets belong to ASTRO, not WHERE. WHERE retains its mapping identity/icon and existing pin state; obsolete expanded astronomy heights on WHERE collapse to one row. ASTRO supports three widget modules: Sun/Moon rise/set with Moon phase, station pass, and geomagnetic information.

## TIME

- TIME is registered in the shared PC/Phone catalog. Phone shows live local HH:mm:ss at 28px JetBrains Mono Thin (100), refreshed each second without rebuilding the home layout. It occupies one widget row. All Phone 28px ExtraLight widget text (date, weekday, temperature) now uses Thin (100); app/group names remain ExtraBold (800).

## Shared PC/Phone application policy

- Software identity, display-name changes, icons and action/removal availability must use shared sources and apply to both PC and Phone. Device-specific layout/typography may differ. Never implement a name/icon/policy change in only one surface unless the user explicitly requests that exception.
- Display names: home/application-names.js. Canonical icons: home/icons.js plus the app glyph registry in home/app.js. Removal exemptions: applicationNoRemove in home/application-names.js; menus and execution paths use canRemoveApplication.
- All software menus place remove last, after every other action and any size controls.

### Applications without remove

| Stable ID | Display name | PC | Phone |
| --- | --- | --- | --- |
| TIME | TIME | No remove | No remove |
| DATE | DATE | No remove | No remove |

Add future exceptions to applicationNoRemove; do not maintain per-device copies. Exempt apps also reject direct uninstall and Phone removal gestures.
