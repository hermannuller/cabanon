# Phone prototype

- F8 held + F2 selects Phone; F8 held + F1 selects PC. Last selected mode is stored immediately in localStorage and restored at startup. Native Electron interception suppresses Chromium defaults. No global keyboard hook is added.
- Phone logical canvas: 430 × 932; top 36; content 840 (15 × 56); footer 56. JetBrains Mono text 34/56 and 14/28. Columns start at 20.4 and 224.4, each 183.6 wide. The 2 × 34 home line is centered in a 61.2 × 56 tap target (three 34px monospace characters); remaining footer sides have no actions.
- APP identity/name comes directly from the PC apps catalog. Phone positions, removed-home entries, sizes and pin flags are saved per existing profile. Removing a phone container does not uninstall its PC application.
- Text hit width is the rendered label width, with a minimum of four 20.4px character cells, at height 56. Remaining container blank space is not an APP click target.
- Long press: 500 ms with movement tolerance 10 logical points, following UILongPressGestureRecognizer defaults. This prototype also uses 10 points as its pan decision threshold; Apple does not prescribe that as a universal pan threshold.
- Text long press opens remove / edit containers / pin or unpin. Holding another 1000 ms enters editing. Blank-container long press enters editing after 500 ms. Editing closes the menu. Movement can then reposition unpinned text; pin stays fixed above scrolling content. Blank drag scrolls, blank tap exits editing. No drag lines.
- Rightward swipe reveals pin/unpin on the left; leftward swipe reveals remove from right to left on the right. Names disappear one character at a time according to gesture distance; small action labels appear character by character simultaneously with name erasure. Three logical character cells (61.2px) arm the action; only release executes it. Returning below threshold cancels. Partial swipe release restores each removed character at 20 ms per character, matching PC filename creation.
- Pin: underline 2px, offset 4px, no ink skip. Fixed viewport position; editing keeps it bright and immovable. Sum of pinned heights is at most 15; x2/x3/x4 cost 2/3/4. Over-capacity options stay actionable and show: pinned 15 is max, unpin some apps or make x2/x3/x4 be smaller.
- Provisional widget-capable apps: NEWS, STOCKS, DATE, THEN, WHERE, WEATHER. x1–x3 available only after pin; x4 only for NEWS/STOCKS. Widget content is a mock for this interaction prototype.
- All opened apps show a fullscreen placeholder paragraph. The home line persists. App switcher is deferred. A home-line long press/drag does not navigate.

## Scrolling rules

- Every unpinned container follows finger displacement exactly. Only the particular container crossing a pin receives an instantaneous extra displacement equal to the fixed region height. No neighboring movement, group compression, pausing or recovery timers exist.
- Pins retain full opaque backgrounds and fixed coordinates over their entire container width/height. Incoming text is masked first; at 20.4 points penetration it jumps across the fixed region and remains clipped where it still overlaps. Continued ordinary movement reveals it naturally.
- Up/down use the same motion equation under vertical reflection. Adjacent pins are one fixed region; each column shares the same ordinary scroll delta and 56px grid.
- On release, retain the CURRENT viewport. A top item with less than half its height visible moves above; at least half visible snaps to row zero. Following items fill the shared 56px rows, skipping pins; earlier items remain above and accessible by reverse scrolling. Scrolling does not overwrite the home layout.
- Downward pull at the absolute top does not move the grid or expose blank space; reserved for the future search/typing screen.
- Rightward swipe shows pin it/unpin (unpin padded to six cells); leftward swipe reveals remove from right to left. Each 20.4px name cell reveals two action characters, three cells arm the action, and release executes. For names shorter than four characters, leftward motion first shifts the label left by the missing cell count, then erases letters one by one. Ur shifts two cells before erasure.
- TEMP1 through TEMP12 share the APP catalog, two-column layout and existing interactions.
## Layout changes

- Remove, pin/unpin and widget height changes all use changeLayout; no action manually shifts another APP. Capture projected positions before mutation, then apply the shared PhoneFlow.snap grid packer.
- Scroll release, edit release and membership/height changes use the same settle entry. Cancellation never changes membership or layout.
- Viewport geometry and persisted home layout are distinct. Current viewport remains where the user browsed; the home layout is independently packed by the same algorithm before saving, so removed/shrunk regions do not leave holes on reopening.
- Unpin returns widget-only expanded heights to x1.
- Test input: wheel over the home content scrolls through the same motion model. Pixel wheel deltas convert to logical points; line/page deltas use 56/840. A 160ms idle interval settles the grid when no pointer is held. During edit dragging, wheel scrolls other content while keeping the held APP at its screen position; pointer release settles and saves.
- Edit drag: all labels use L6; only pins have L3 backgrounds. The dragged label follows the pointer continuously at 50% opacity, preserving its grab offset. Release uses the target container midpoint: upper half inserts before, lower half inserts after, including pinned targets. Pins remain fixed; insertion packs around their occupied rows. Wheel leaves the floating label under the pointer. No catalog-order tie decides insertion.

## Shared application naming

- `home/application-names.js` is the sole source of display names for PC and Phone. Change values there only; application IDs, ownerApp, window keys, file associations and saved keys remain stable.
- All application labels, search/sort labels, settings labels, titles and authored messages must use `appLabel(id)` or `appText(text)`; do not copy display names into UI literals. Escape labels inserted into HTML. Never rewrite user document/file content to rename applications.
- `canonicalAppName` accepts legacy IDs and current display labels. Profile migration retains phone positions, pin flags, removed flags, usage and file mappings. Phone /HOUSE is the `/house` system location entry, not a separately installed PC app; its content is currently a phone prototype placeholder.
- Regression: `tmp/application-names-check.cjs` changes one registry value and verifies propagation across PC, Phone, settings, window title and messages, plus legacy profile migration and old launch aliases.

## Multi-selection and groups

- While editing, the entire container is the selection and drag-origin hit area. Tapping toggles selection; selected containers use L5 background / L1 text, matching PC inversion. Pinned containers remain fixed and cannot join a movable selection.
- Dragging any selected item carries the selected unpinned items together, in visual row/column order. The floating column retains full inverted container backgrounds and text, with 50% opacity applied to the whole column. It preserves the grab offset and stays under the pointer while wheel scrolling. Batch insertion uses the same target upper/lower-half rule as a single item.
- Editing shows a grouping target left of Home: three 4×4 squares at upper-left, upper-right, lower-left. A group name includes the same mark in one 20.4px character cell.
- Hovering a dragged selection over the target for 500ms replaces it at the pointer with a group named NEW, NEW1, NEW2, etc., choosing the first unused name. Hovering a single group instead expands its immediate members into the dragged column. Leaving/reentering is required to trigger another transformation; holding in place cannot repeatedly toggle.
- Groups store member IDs, never copied APP names. Members stay in phone state but are excluded from the home grid while grouped. Group opening lists members; their names use the shared application registry. Grouping/dissolving and placement save together on release. Escape, pointer cancellation, mode changes and focus loss roll back in-flight group changes.
- Regression: tmp/phone-groups-check.cjs covers full-container selection, inverted 50% drag, dwell threshold/latch, group/dissolve, Escape rollback, numbering, persistence and batch placement.

- Selection palette override: selected containers and their floating drag copies use L3 dark gray backgrounds with L5 bright text. The floating column retains 50% overall opacity. Ur's stable ID remains Ur; its display name is LIST in application-names.js.

- Selection palette update: selected containers and floating copies now use L4 backgrounds / L5 text, distinguishing selection from fixed PIN containers' L3 backgrounds. Drag opacity remains 50%.

- Editing background geometry: ordinary selected backgrounds cover the entire logical half-screen (0–215 / 215–430), retaining text positions. PIN L3 background starts at its half-screen left edge and ends at the label's measured right edge; its opaque full-container scrolling mask remains intact. Floating selected backgrounds use the same 215px width and remain 50% opaque. Colors unchanged (selected L4/L5, PIN L3).

- Footer update: grouping target sits at the left edge (hit area x=0–61.2; centered one-character symbol begins at x=20.4, aligned with the left text column). Home remains centered; its hit area is now five characters wide, 102px (x=164–266), with the visible 2px line still centered at x=215. Remaining side spaces retain no action.

## Bottom sorting controls

- The grouping target appears only with multiple selected/carried entries, or a single existing group for dissolving. A single ordinary APP does not reveal it.
- In normal home mode, sorting controls appear only at the bottom scroll limit; leaving that limit hides them immediately. Editing and opened apps hide them.
- A/Z arrow: centered in the row above Home, 102×56 hit area, same width as Home. Old/new: bottom-left 164×56. Often/rare: bottom-right 164×56. No visible hit-area borders.
- Sort uses shared display names, catalog installation timestamps (group creation timestamps for groups), and shared launch counts. Ties use names; repeated clicks toggle direction. PINs stay fixed, unpinned entries fill both columns around fixed cells, and sorted results open at the top and persist. Phone launches now increment shared usage.
- Regression: tmp/phone-footer-sort-check.cjs.

## Temporary icon view

- A short Home-line tap on the normal home page (with or without bottom sort controls) preserves the viewport and temporarily shows all containers as shared PC 36×36 app icons plus 14px labels. Editing/app-open Home behavior is unchanged.
- The view holds for 1000ms, then labels erase grapheme by grapheme from right to left using the same FILE_REMOVAL_CHARACTER_MS (10ms) constant as PC deletion. Each icon disappears after its own label; after the longest name completes, the home page restores large labels. Another Home tap restores all icon labels and restarts the hold, including during erasure.
- Preview is transient: no app order, group membership, pin position or scroll offset changes. Opening an app, entering editing or changing device mode cancels it.
- Regression: tmp/phone-icon-preview-check.cjs.

- Reachability: downward Home-line gesture moves content and status bar to row 8 (428 logical px). The Home control remains reachable at the physical footer. Top blank space or a Home tap restores; the muted upward cue uses a rounded CSS border corner. Verified by tmp/phone-reach-check.cjs.

- PhoneOS has no mouse-hover feedback. All controls preserve their resting appearance when the pointer moves over them. Reachability's upper blank region is always L2. The existing held-drag 500ms grouping gesture remains active without hover highlighting.

## Search keyboard and Home contract

- Home short tap ALWAYS returns to the normal home page at scroll zero, from search, apps, editing, reachability and the home page itself. This supersedes the temporary-icon-preview tap binding. Downward Home drag still enables reachability.
- Search pointer events never enter the home gesture recognizer. At scroll zero, wheel pull-down accumulates 112 logical px to open search, matching the existing two-row pull gesture.
- Keyboard is square, edge-to-edge, 1px horizontal key gaps and 6px row gaps, with L5 held-letter popup. CSS symbols use the shared 2px icon stroke. Letter, shift, numeric, delete, space and return keys work; return opens the first result.
- Search field follows FROM's 14/28 font, L3 fill, L4 border, 40px height and 6px/8px inner padding, with 2px outer horizontal margins. UI controls have zero corner radius; drawn symbol curves remain intentional.
- Footer language toggles input language/placeholder between English and Chinese (Chinese composition uses system IME); microphone uses browser speech recognition where supported, otherwise states unavailability. No microphone access occurs before a user tap.
- Regression: tmp/phone-keyboard-check.cjs covers actual pointer input, wheel entry, deletion/numbers/popup and Home from search and opened result.

- Shift cycles off → one-letter uppercase → locked uppercase → off. One-letter shift clears after a letter only. Active key uses L5 background and L4 arrow; locked arrow keeps its shape and moves up 6px, with an independent 3px-high rectangle at its original bottom. Test: tmp/phone-shift-check.cjs.

## Application removal, naming and bottom sorting

- Shared labels: DIAL → RADIO; Ur → SHEET; THEN → LIST. Internal IDs do not change.
- PC software menus now expose remove, using a red confirmation. PC and Phone removal share persisted uninstalled IDs; startup normalization must never reset that list. Remove app pins/startup entries and hide app entries on both surfaces. User documents are retained.
- Group long-press menu begins with rename. The editor validates through validApplicationLabel, rejects duplicate group names, saves to the profile, and permits 3–9 ASCII letters/digits (digits retain NEW1/TEMP1 conventions). System /HOUSE is exempt. Shared app registry values are validated; programmatic changes use setApplicationLabel.
- Sorting keeps the phone at the bottom. The lowest movable row ends at logical content y=616; A/Z starts at y=784, leaving exactly three 56px blank rows. Normal fixed PIN slots remain unchanged.
- Regression: tmp/phone-remove-rename-sort-check.cjs.

- Home tap final routing: normal homepage (including its scrolled positions) runs the 1s icon/small-label preview and resettable erasure. Search, open apps, editing, dialogs and reachability return to default home/top. The status mask now extends to 47px with 11px bottom padding, preserving time/battery positions and the 36px content/grid origin while covering top-row leading. Regressions: tmp/phone-icon-preview-check.cjs, tmp/phone-top-pin-check.cjs.

## Widget adjustment preview

- Pinned widgets use minus/plus controls in the long-press menu instead of x1/x2/x3/x4. Each control has a fixed 112 x 56 logical-pixel hit area, with four spaces on each side of its symbol. Hidden boundary controls retain their grid slot.
- Each click changes height by one 56px row through changeLayout and keeps the menu open. Minus hides at one row; plus hides at the widget maximum. NEWS, STOCKS, DATE and WEATHER allow four rows; the other currently supported widgets retain three. Existing capacity rules remain active.
- This first preview changes adjustment controls only; PDF card content and icons are pending. Regression: tmp/phone-widget-adjust-check.cjs checks real long press, blank-corner clicks, repeated changes, boundary visibility and persistence.

## Information widget layout

- NEWS, STOCKS, DATE, LIST (stable ID THEN), WHERE and WEATHER show information from x1, without an APP-name header. A record with no content falls back to the shared APP name; cached content remains usable offline. The Home icon preview still temporarily shows shared icons/names.
- Each information module occupies exactly 56 logical px. Small text is 14/20, with relative baselines 0/20, then 56/76 for the next module. DATE and current weather retain a 34px primary value. NEWS clamps each item to two lines; stocks and schedule entries use two lines per module.
- WEATHER uses current temperature/icon, range plus rain/humidity, wind plus AQI/visibility, then three forecast columns. There is no bottom time. Weather and astronomy marks are inline SVG; the Moon uses the date's approximate synodic phase. AQI is a colored square beside its value.
- PIN has no visible mark in normal mode. Editing shows one short 2px underline per information widget, below the whole widget, never per text line. Ordinary APP-name underlines also show only while editing. Existing opaque scroll masking is retained.
- phone-widgets.js owns the prototype fixtures and rendering. These are sample records, not a live news/weather/astronomy service. prefs.phone.widgetData may override each APP with cached title/detail records; explicit null or an empty list displays its shared APP name. Network status alone never clears content.
- LIST supports four entries; WHERE supports three; the other implemented widgets support four. Music and radio are outside this six-widget update.
- Verified: tmp/phone-widget-content-check.cjs, tmp/phone-widget-adjust-check.cjs, tmp/phone-icon-preview-check.cjs, tmp/phone-top-pin-check.cjs.


## Long-press menu placement

- Every APP/group/widget long-press menu occupies the opposite half-screen column at x=0 or 215, with width 215px matching the APP selection width. Its top follows the APP container viewport top, rather than the press point. If it would extend past the content bottom (y=876), move it upward so its bottom aligns with the footer top. Keep it below the status origin.
- Widget resizing repositions the open menu if the APP relocates. Minus and plus retain fixed left/right slots, now 107.5 x 56 each within the 215px menu.
- Verified: tmp/phone-menu-position-check.cjs covers left/right placement, top alignment, normal and widget menus near the footer, and open-menu positioning after resizing.


## Astronomy application correction

- ASTRO is newly registered in the shared PC/Phone catalog. Astronomy content, its three-row limit and Moon phase belong to ASTRO. WHERE is a separate application and no longer renders astronomy data or exposes widget size controls. Existing WHERE pins remain, but old expanded astronomy heights collapse to x1. Earlier references to WHERE as the astronomy widget are superseded.

- Widget 34px primary values use JetBrains Mono ExtraLight (weight 200), loaded from the bundled variable font. Small text and ordinary APP labels keep their existing weights.

- TEMP1–TEMP12 prototype software entries have been removed from the shared PC/Phone catalog. Catalog normalization removes old Phone entries and group references (including groups left empty), alongside existing PC pin/startup/usage cleanup. User files and group titles are unaffected.

- Bottom installation sort reads new above old. First activation orders newer installations/group creations first; repeated activation reverses to older first. PINs retain their positions.


## Search placement

- Search field stays directly above the keyboard. Results grow from the bottom upward, with the first match nearest the search field. Keep shared 36px icons and 34px labels, 56px result hit rows; Enter opens the first match. Overflow scrolls through results.
- A stationary tap on search blank space, status or unused footer space closes search and returns to the normal home/top, like Home from search. Search field, results, keyboard and input tools retain their actions. Dragging blank space does not dismiss search. Remove the former downward-drag keyboard hiding/bar relocation behavior.

## Phone type and home columns (2026-10-23)

- Phone large text is independently configured at 30px (JetBrains Mono, 18px Latin advance); PC retains 36px. Existing line heights stay unchanged.
- Home labels start at x=36 and x=234, each 162px wide (nine Latin letters). Left margin and column gap are 36px (two letters); right margin is 34px. Canvas remains 430px wide. These dimensions supersede the original home column geometry above.
- Character erasure uses the Phone 18px advance; selection backgrounds still cover logical half-screens. Text and widget hit areas follow the revised home columns.

## Compact Phone preview (2026-10-23)

- Latest override: 393 × 852 canvas; independent 34px large type, 20.4px Latin advance. Two 183.6px labels begin at x=0 and x=204; middle gap 20.4px, right remainder 5.4px. No red 99 preview.
- Top status area 32px; home viewport 672px, exactly 12 rows at 56px. Row 13 is the Home control at y=704; the remaining 92px below that row stays blank. Footer background extends to the screen bottom. Existing PC 36px typography is unchanged.

- Latest preview refinement: canvas height is 760px (32 + 12 × 56 + 56), removing the unused 92px below Home. Left home labels align right toward the central gutter; right labels remain left aligned. Text hit bands and dragged labels follow the alignment. The 393px width, 34px type and 56px rows remain unchanged.

- Widget composition: ASTRO and DATE align right; weekday uses the same large type as day number. WEATHER is centered. STOCKS stays left aligned toward the central gutter, with two literal spaces between symbol/price and between percent/amount on the next line, replacing distributed columns.

- Latest typography override: 28px large text (16.8px Latin advance), all home labels and widget text left aligned in both columns. Left margin 33.6px; each column 151.2px; gutter 33.6px; column starts x=33.6 / 218.4. Right remainder 23.4px (one character plus 6.6px surplus). Canvas remains 393 × 760, top 32px, 12 rows plus Home at 56px. Stock pairs retain two literal spaces.

- PIN editing marker override: L3 occupies only the band from the Phone left edge to the pinned label's left edge, at full container height. No L3 background extends behind the text. Selected unpinned backgrounds retain their existing geometry.

- PIN marker clarification: each column starts its editing marker at its own half-screen edge: x=0 for the left column, x=196.5 for the right column. The marker ends at that column's text left edge; never spans the opposite column.

- Pull-to-search: drag the entire home page including PINs, revealing a pull hint. Search opens only beyond two 56px rows (112px); releasing/cancelling below threshold restores the page without changing saved positions. Wheel pull uses the same threshold and restores on idle. Search remains above PIN content. Status clock left padding is 33.6px, aligned with the left text column.

- Latest horizontal rule: 1 + 10 + 1 + 10 + 1 Latin cells at 28px JetBrains (16.8px advance). Left column starts 16.8px, right column 201.6px; each label is 168px wide, gap 16.8px. On 393px canvas right remainder is 23.4px (one cell + 6.6px surplus). Clock aligns at 16.8px.

## Phone multitasking

- Swipe up from Home's vertical line to show open Phone app tasks. Only apps opened in this session create tasks; no fabricated task entries. App names resolve through the common registry. Closing a task does not uninstall, remove its home entry, or change the shared no-remove policy.
- Name rail starts at y=592 (32px status + ten home rows). Three 56px rows maximum; index modulo three selects row, and each successive app begins four 28px JetBrains character cells (67.2px) farther right. Names are alphabetically ordered, uppercase and 800 weight. One/two tasks use one/two name rows. No wraparound carousel.
- Vertical Home axis at x=196.5 selects names: content moving right switches when a new name's start crosses the axis; content moving left switches when the selected name's end leaves the axis. Cards update with selection. Horizontal gestures work during the initial held Home swipe and after release.
- Return to Home region during the initial uninterrupted swipe cancels the overlay. Tap the upper preview area to commit the selected task; Escape cancels. Main task covers the previous surface, adjacent task enters at x=262 (right third) with a permanent 1px left edge. No preview wraps from the last task back to the first.
- Swipe either visible card upward by more than 56 logical points to close that task. The task name disappears, surviving names repack, and the rail shrinks to two/one rows. Drag cancellation restores the card. Empty task list shows No open apps.
- Implementation: phone-multitask.js, Phone API open/activeApp bridge, phone.css. Regression: tmp/phone-multitask-check.cjs covers entry, same-touch cancellation, horizontal selection, tap to commit, both card close origins, shrinking rows and no uninstall.

### Multitasking refinement

- Names now use 42px row spacing, with an independent bottom 56px Home button/vertical mark. Three name rows occupy 126px immediately above Home; their top edge is y=578. Each entry still steps right by four character widths, every fourth returns to row one.
- Every entry starts selected index zero and horizontal offset zero: empty left half, first label at x=196.5, subsequent labels extend to the right. The carousel does not resume a previously selected horizontal position.
- App opening and initial card entry animate from the right. Subsequent card movement follows horizontal finger direction. Rightward transitions slide the right preview out and shift the preceding card to the right-third position while exposing the task below. Both outer 1px Phone edges have a fixed high stacking layer, independent of the cards.
- Regression additionally checks exact name positions/42px rows, fixed guide-edge layer, and the standalone Home button.

### First-letter selection and continuous name coverage

- Selection is determined only by name start positions. Sliding names left selects the next app as its first letter crosses the Home axis; sliding right selects the previous app as the current first letter moves back to the right of the axis. A long previous name never delays the switch.
- Each successive start advances min(4, previous-name character count) cells. Thus a three-letter LIN advances the next name by only three cells: OUT and all subsequent names move left one cell. Recompute after task closure; modulo-three row assignment stays intact. This removes horizontal gaps in the union of all three name rows.
- The axis extends upward only to the selected name's underline position, computed from the actual font metrics and selected row. It never crosses through earlier rows' letters. Regression: tmp/phone-task-first-letter-check.cjs verifies both sides of the first-letter boundary, long-name overlap, LIN/OUT packing, and 42px axis-height changes.
