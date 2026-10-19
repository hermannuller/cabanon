# HOME performance review — 2026-10-14

## 2026-10-16 settings preparation / behavior-preserving pass

- Profile flush serializes the active profile once and reuses that JSON inside the existing all-profile storage record. Storage keys, format, the120ms save queue, unchanged-value guards and exit flushing are retained.
- Trash capacity pruning computes total size once and removes the same oldest prefix in one splice, instead of repeatedly summing and shifting the remaining array. Expiry and capacity rules are retained.
- Removed one redundant synchronous recent-list render from the From opening wrapper; layout already performs that render.
- Widget rendering retains existing nodes when its generated markup is unchanged; changed content still renders immediately.
- `tmp/settings-performance-regression.cjs` passed in an isolated Electron profile: byte-identical storage compared with ordinary JSON serialization, all three profile identities, zero writes for unchanged flushes, six trash comparisons with3000 entries each, widget node retention/content updates,600px From layout, default-name Enter save and reload persistence. No page errors. This is correctness verification, not an FPS benchmark. No settings page redesign or Windows integration was implemented.

This review changes no product behavior. Measurements use an isolated Electron profile with the bundled sample data, two folder windows and one app window. Instrumentation counts style reads, rectangle reads, global function calls and localStorage writes; it is not a CPU/FPS benchmark. Call counts can omit callbacks that captured functions before instrumentation. Instrumentation itself adds overhead. User data was not modified.

## Observed work

| Scenario | Style reads | Rectangle reads | Storage writes | Serialized characters written |
| --- | ---: | ---: | ---: | ---: |
| Idle for 3 seconds | 12,608 | 0 | 0 | 0 |
| Ten arrow-key selection moves | 6,304 | 220 | 0 | 0 |
| Six folder navigations | 1,576 | 0 | 0 | 0 |
| Five saves without data changes | 1,576 | 0 | 15 | 1,186,445 |

Idle activity invoked the scrollbar scan eight times. Selection invoked menu tracking eleven times and scrollbar scans four times. Five unchanged saves invoked sync decoration and From recent-list rendering five times each. Raw results: `tmp/performance-audit.json`; reproduction: `tmp/performance-audit.cjs`.

## Priorities

1. **Remove idle DOM writes.** `interactions.js` updates hidden input-method/time nodes every second, although the From mark no longer displays these labels. `app.js` separately updates the older clock every second; the current widget has a different timer. Update visible clock content only when it actually changes, and update system indicators on state changes.
2. **Stop scanning every DOM element to standardize scrollbars.** `scrollbar-standard.js` queries all desktop descendants and reads computed styles after many class/style/text changes. Register known scrollports when they are created; inspect only changed scrollports on resize/content changes. Preserve the agreed 8px dimensions and endpoint rules.
3. **Save changed data once per operation.** `persistProfiles` clones profile state and serializes it into multiple storage keys. Wrappers add undo snapshots and decorate menus, icons and recent lists during the same operation. Separate state mutation, undo transactions, rendering and persistence. Avoid writes for unchanged state; coalesce frequent changes and flush before exit/user switching.
4. **Update only affected lists.** Opening, copying or deleting often redraws all folder windows and the desktop. DOM replacement triggers label, mark, sync, taskbar and scrollbar observers. Refresh source/destination folder lists only; preserve selection, focus and scroll state.
5. **Merge event dispatch and overridden functions.** There are 53 loaded scripts and many chained replacements of `showContext`, `createWindow`, `renderDesktop`, `drawBrowser` and `persistProfiles`. Script count itself is not proof of slowness; repeated work and ordering dependencies are the issue. Use one dispatcher for selection, context menus, drag/drop and keyboard commands; one window lifecycle and one renderer per view.
6. **Explicitly dispose window observers.** Folder, code-editor and tree resize observers are created during window construction. Closing windows or panels currently does not consistently disconnect them. Add a shared dispose path and verify repeated open/close does not retain detached windows. A leak has not been quantified in this review.

## Unnecessary implementation to retire

- Hidden status-label refresh loops and the superseded clock implementation.
- Old settings forms that are completely replaced by `settings-placeholder.js`.
- Superseded SVG drag-line / ghost-preview CSS and old window/confirmation code paths, after identifying which handlers still execute.
- Repeated Pin/mark/sync decorations on unrelated content mutations.
- Eager rendering of all placeholder apps while the all-apps page is hidden; populate this view on demand. Keep demonstration applications in a test fixture rather than deleting user-visible entries without agreement.

## Model consistency

`prefs.recents` still drives both desktop automatic shortcuts and From recent files. Clearing/removing desktop shortcuts can therefore affect recent history; later file access can repopulate the desktop. From explicit file pins and desktop explicit links have separate fields, but recent history and desktop shortcuts also need separate identities. Define the desired desktop behavior before changing this model.

## Features to retain

The measured waste does not justify removing the lightweight drag tether, hover colors, the 4px app Pin indicator, fixed tree path, or drag feedback. These provide useful feedback. The 100ms snap-preview animation is optional, but no measurements here identify it as the main bottleneck. Address global scans and persistence first.

## Suggested sequence

First remove redundant timers and register scrollports; repeat the exact scenarios above. Next consolidate persistence and target list refreshes. Finally merge duplicated event handlers and delete obsolete code, using a behavior regression suite covering selection, context-hit ranges, drag destinations, Delete/Burn, Pin destinations, focus, menu clamping and multi-window isolation. Keep each step independently reviewable and reversible.

## 2026-10-15 context-menu / large-list pass

Current HOME loads the newer context-menus.js registry. Profiling used isolated profiles with 300 and 1500 files. Before this pass, opening one menu caused 306 / 1506 CSS setProperty calls through whole-desktop decoration. After scoped decoration and unchanged-value guards, the same instrument recorded no extra CSS setProperty calls. This is not a count of every DOM mutation and does not establish an FPS claim. Opening-to-two-animation-frame samples changed from roughly 16.6 / 18.8 ms to 11.2 / 16.3 ms in single runs; timing varies by machine and these are not statistically stable benchmarks.

Changes:
- Mark and folder-label observers process only added subtrees, and mark writes are skipped when values are unchanged. A folder draw decorates its window rather than the entire desktop.
- Sorting evaluates only the selected sort key and caches it once per entry for the current sort. A name sort no longer repeatedly encodes file content or searches recent dates.
- Selection skips unchanged classes/aria attributes; ordinary clicks do not build a range-selection array unnecessarily.
- Multi-selection menu resolution builds one name-to-entry index instead of scanning the full array for each selected name.
- Context Delete/Burn executes as a batch with one final save/refresh instead of saving and redrawing after each item.
- New Select/Link submenus remain visible and use the common anchor-placement helper, avoiding incorrect desktop coordinates in a menu-relative container.

Regression: on a 1500-file directory, Select > All selected 1500 entries; deleting 25 selected files produced one save and one refresh, moved 25 records to trash and kept the folder window open. New menus retain their current item list. Further work: coalesced data persistence and incremental/virtualized directory rendering; do not claim those are completed.

## 2026-10-15 incremental refresh and simplified desktop
Directory redraws reuse unchanged file rows and detail cells, reconcile order only when needed, and avoid regenerating unchanged layout values. Profile saves are coalesced for 120ms; unchanged serialized values skip storage writes, with pending changes flushed on page exit. Five unchanged saves produced zero storage writes in an isolated test. This reduces redundant work; directory virtualization remains future work for very large folders.

Desktop now has one explicitly placed reference, independent of recent history. Runtime regression covered 56px normal rows, unchanged font size, Pin/To desk menus, desktop replacement Yes/No, free positioning, deletion preserving the source, repeated Details redraws, and From-only recents. Special 21px tree rows retain their existing size; tree scrolling now uses that same step.


## 2026-10-15 bulk file operation follow-up
Isolated Electron profile with 1500 additional files; 30 files copied into a second open folder and deleted. Before: paste 60 directory draws / 153 snapshots / about 1586ms; delete 62 draws / 31 snapshots / about 1380ms. After: each operation one affected directory draw / one undo snapshot; paste about 16ms and deletion mutation about 16ms in single runs. These are synchronous processing samples, not stable cross-machine benchmarks, and exclude the separately requested deletion visual duration (10ms per filename grapheme).

Clipboard entries are grouped by source directory, copy names use a shared collision set, content maps directly to the exact source, nested operations defer save/refresh/trash pruning to their outer transaction, and both keyboard/menu paths share this pipeline. Undo, cut/paste, copy content and source-preserving desktop deletion were verified. A second open unrelated directory is no longer redrawn on sort/copy/delete.

Box selection now caches geometry for the gesture and updates at most once per animation frame, correcting cached coordinates for scroll. With 1550 items the first update measured 1552 rectangles; a subsequent move measured zero. Pending final movement flushes before pointer release. Closed code/folder window test disconnected all three owned observers. From recents and sync decorators no longer do whole-list work on every unchanged save; hidden status text is not rewritten.


## 2026-10-16 application convergence
Removed the large demo app-name registry, per-app randomized demonstration usage, obsolete FILE app launch branches, duplicate legacy help reader and automatic desktop-example seeding. Ten application records remain. Three rounds verified exact catalog/legacy-ID blocking, calculator/help behavior and icon rendering, and restart/user-switch migrations preserving folder/file pins.

## 2026-10-16 WALL

WALL uses one canvas rather than a DOM element for each character. Glyph sprites are cached; ordinary strokes update only changed character cells and combine movement into one frame. Overlapping glyph configurations use full redraws to avoid leaving partial glyphs. Serialization/storage occurs on release rather than during pointer movement. The applied wallpaper is a separate static canvas snapshot. Capacity is capped at80,000 characters to prevent accidental extreme settings from freezing the interface.

Verified the document engine (layout, crop/fill, stroke interpolation, empty brush/bucket, serialization and invalid settings) and isolated Electron interactions (painting,56px settings, fixed panel, second-right-click close, Save/Open/custom extension, new folder, path code, restart persistence, desktop wallpaper and From/dock visibility), with no page errors. A warm four-cell repaint repeated10 times measured approximately0.1ms for a3,638-cell document on this machine; this is a narrow rendering measurement, not a guarantee for all canvas settings or hardware.

## 2026-10-16 paragraph browser

Paragraph mode uses stable per-file nodes and incremental updates, with a separate positioned caret instead of per-character nodes or inline caret layout changes. Geometry is cached, scrolling is scoped, and editor observers/listeners are released on view exit. On this machine1,507 files built in approximately26.9ms and10 caret movements took11.2ms. These are narrow local measurements. Integration, regular file keyboard and central context-menu range regressions passed.
