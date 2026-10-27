# Quick settings and tool page

Source design: C:/Users/cgwma/Desktop/p-page-1lin.pdf. Pages 3 and 4 are two states of one quick page. The new RADIO icon comes from page 2. Vector paths are extracted in original paint order, including dark knockouts and compound winding. Registry: home/icons/manifest.json; source coordinates: home/icons/quick/source-map.json.

Entry: nine dots to the left of Phone Home. The original three-square group target still appears for valid multi-selection and hides the quick entry during grouping. Home always closes the quick page/tools. A leftward swipe on unused quick-page space also returns home.

Implementation: home/phone-quick.js and home/phone-quick.css. Stable tool identities live in application-names.js; PC and Phone use the same app catalog and vector assets. No app display names were renamed. Existing pin/multi-column removal remains in effect.

## Working locally

- Calculator: arithmetic, parentheses, decimals, deletion, reset and result validation.
- Stopwatch: start/pause, hundredths display, lap and reset; elapsed state survives reload.
- Countdown: start/pause/resume/cancel, timestamp-based remaining time; the live home row and pause/cancel icons appear only during an active/paused countdown. Completion plays a short alert while Cabanon is running.
- Alarms: multiple local alarms, enable/disable and remove; trigger only while Cabanon is running.
- Volume and interface brightness: full 56px slider area accepts click, drag and keyboard input, including the raised icon area. Volume controls local playback. Brightness dims the Cabanon Phone interface, not the hardware backlight.
- Local music: file selection, playlist previous/play/pause/next, a non-interactive progress line and elapsed/duration. Audio files stay local; browser sessions must reselect file handles after restart.
- Theme and mode: shared Cabanon theme/mode state with persisted selection.
- Wallet: local income/expense records, not payments or account access.
- Translation: explicitly limited offline example dictionary; full translation is not connected.
- Phone/SMS: explicit links open the device's phone/message app; Cabanon never automatically calls/sends.

## Capability-dependent and disconnected features

- Camera scanning: getUserMedia + BarcodeDetector where available. Not OCR. Browser/device secure-context requirements apply; failures are shown in the tool.
- Flashlight: working screen-light fallback; camera torch only when camera capabilities expose it.
- Level/compass: DeviceOrientation data where supported/permission granted; no data is reported as unavailable, not fabricated.
- Rotation lock and vibration: browser APIs where available; unsupported cases have feedback.
- Casting: Remote Playback capability when provided by the browser/device.
- Airplane, hotspot, VPN, cellular, Wi-Fi and Bluetooth save only the local quick state. Current preload has no OS/network-management API; toggles report that system control is disconnected.
- Music recognition, full AI responses, external radio streams and full translation have no connected service. Their screens state that explicitly. AI draft text is retained locally.

## Validation

- tmp/phone-quick-check.cjs: entry/Home; on/off state; slider clicks above the line; calculator; stopwatch; timer controls; alarm persistence; reload; no page errors.
- tmp/phone-single-group-check.cjs: grouping, ungrouping, mixed-selection protection.
- tmp/phone-bottom-pull-check.cjs: bottom pull range, 320ms return and sorting visibility.

## Interactive demo

Demo mode is on by default and visibly marked DEMO. Toggle it in else or Detailed settings. Demo network toggles never invoke system APIs. Music transport/progress can simulate the PDF track without audio; choosing local files switches the player to real local playback. Sensor, scan, cast, recognition, phone/SMS and assistant demos are explicitly labeled and do not request hardware/service permissions. Direct preview route: /phone/?quick=demo.

## Latest visual and interaction rules

- Original PDF geometry is retained at native relative scale, capped by the 36px SVG canvas. On/off pairs share one center and scale, including cubic-curve extrema; strokes remain 1px. Source-map entries record sharedScale and sourceCenter.
- Music progress is a thin read-only line; no slider/thumb.
- Volume/brightness retain full 56px hit regions. Their shorter track is inset 18px at both ends; the vertical marker travels exactly between track endpoints. Volume zero draws a crossed speaker. Brightness uses CSS rays that shrink continuously to zero, preserving the bottom stem and sun center.
- Footer entry has eight dots (3×3 minus the lower-right dot). Quick settings and tool pages show only the Home line. Grouping remains independent.
- Wi-Fi/Bluetooth icon buttons toggle directly. Only the text selectors below open the choice lists.

## 2026-10-26 visual revision
- Quick row 1 is 56px; every later grid row is 84px. Remove the independent blank spacer; music uses two rows. Keep the 56px Home footer.
- Music pause uses two filled rectangles from PDF page 4, separate from timer pause.
- RADIO divider terminates at its frame sides.
- During home scrolling, marks move at their app row position. The active row contains y=392px (between rows 7/8); it and three neighbors each way use L5 at 100/70/45/15 percent opacity. Other marks are transparent. Existing 1s hold + 1s fade remains.
- Active/paused countdown replaces its row logo with opaque black pause/cancel controls. Their diameter follows MiSans Thin 60px zero ink height, with non-scaling 1px strokes.
- Group prefix occupies 1ch; left and right three-square marks align artwork top to app capital top.
- MARATHON catalog/icon already existed; one-time migration restores its hidden/removed home entry and old uninstalled flag. PDF PLAN maps to TODO; TOOL is a group, TRANSL has an existing tool entry. No additional standalone PDF app is missing.

## Direct choice overlays
Mode and Theme are centered icon/text buttons with no dropdown arrow. Cellular, Wi-Fi and Bluetooth split each cell into an icon+label toggle and a separate right-side up/down selector. Their selector opens an in-page icon/text list over the original cell, without toggling the connection; choosing an entry selects and enables it. Lists dismiss on outside pointerdown, Escape through the shared exit-key handler, selection, redraw or Quick close. Existing demo network choices remain demonstration data. Check: tmp/phone-quick-picker-check.cjs.

## Vertical controls and circular pages (2026-10-27)

Quick volume and brightness use vertical tracks in columns 3 and 4 across rows 3–4 (168px cells). Up increases, down decreases. Horizontal movement over a Quick icon/button or vertical slider navigates pages and suppresses its click; it never changes the slider value. Vertical drags retain direction locking and operate the slider.

The page order is Quick → Home → Search → Quick when swiping left, and the reverse when swiping right. All transitions reuse the 200ms whole-page slide with delayed, preventScroll Search focus. Home/Search keep the existing text/control exclusions; Quick horizontal navigation may start across its grid, including controls.

## Calculator — PDF 8 (2026-10-27)

Mobile CALC uses bundled math.js 15.2.0 with a separate 64-digit BigNumber instance and a restricted calculator expression grammar. The supplied Fira Code variable font uses weight 500. Keys are 42px with 80px rows and 1px black gaps; result is 80px and expression is gray 35px. Hover does not change key appearance. The orange advanced entry is reserved and inactive.

Before evaluation, the clear symbol deletes one character on tap and clears everything after a 500ms hold. After evaluation it becomes AC and clears everything immediately. Repeated equals reuses the final operation and operand (9×6 = 54, 324, 1944). Root defaults to square root; an entered index supports nth roots. Powers, parentheses, sign, decimal and percentages are supported. State survives leaving and reopening CALC. Desktop Qalculate integration is not part of this mobile implementation.

Validation: tmp/calculator-engine-check.cjs and tmp/calculator-phone-ui-check.cjs cover arithmetic, repeated equals, roots, powers, precision, percentages, clear/hold, errors, state restoration, keyboard input and computed layout. Font and math.js licenses are included beside their bundled assets.
