# Phone pin and group editing

- Phone apps occupy one 56px row. Pin is limited to four apps, fixes the app to its nearest available screen-grid row, uses underline (normal style, same size/weight), and opens the app directly. Editing permits moving pinned apps between free grid slots.
- Ordinary rows pass fixed rows using complementary clipped fragments of the same app on both sides; fragment height totals one row. Adjacent pins form a continuous skipped region. Release snaps the shared scroll phase to the grid.
- During app dragging in edit mode, holding the top or bottom edge scrolls the background; leaving the edge, release, cancel or focus loss stops it.
- Hovering an existing group for 500ms carries selected apps into it without ending the drag. Dropping commits order, preserving editing. Escape restores membership, order, scroll, selection and navigation.
- A group has an immovable title row. Small groups expand from their home row downward when they fit; otherwise they expand upward from the bottom. Groups exceeding the screen use a full-height scrolling view. Clicking the title returns to home without changing editing. Clicking a visible outside app closes the group and opens the app.
- Group members cannot pin. Right-swipe reads `leave` (including edit mode) and returns the member to home. Leaving the final member deletes only the empty group and returns home, preserving the current editing state.

Checks: `tmp/phone-edit-group-leave-check.cjs`, `tmp/phone-group-layout-leave-check.cjs`, `tmp/phone-group-reorder-cancel-check.cjs`, `tmp/phone-pin-fragments-check.cjs`, `tmp/phone-pin-fragments-browser.cjs`.

- Group marks use four axis-aligned squares in a diamond, measured against the 60px bold T: square side equals its horizontal stroke thickness, overall bounds equal its ink width and cap height. Dissolve uses four corner squares with identical bounds. Both bypass generic 36px artwork fitting.
- In an open group, footer left is < (return), middle line also returns, footer right is dissolve with confirmation. Both returns retain edit mode. Home edit mode allows selecting multiple groups; an all-group selection exposes one confirmed batch-dissolve action. App entries are preserved. Double-click a group to enter it while editing.
- Additional check: tmp/phone-group-symbol-batch-check.cjs.

- Display revision: edit mode keeps every right-hand app mark bright and removes opaque backplates. Group square side remains the measured T stroke; both group marks use compact square bounds no taller than the T cap height, and dissolve is four corners of a square. Group-member names shift one 60px-font character right, limit to eight character cells, and use three dots in one cell for overflow. Small inline groups scroll with home while staying expanded; full-screen groups scroll their own contents. Check: tmp/phone-group-display-check.cjs.

- Information pin revision: pinned weather/news/date/time and other live content remain visible; a shared 1px line at the large-name underline level spans the visible text, instead of replacing content with its app name. Plain names use the same line. /HOUSE scales only its slash vertically to match the T ink box. Stopwatch frame digits use MiSans ExtraLight 200; 24-hour clock seconds use the lower-right slot, reserving upper-right for AM/PM in 12-hour mode. Check: tmp/phone-type-pin-check.cjs.

- Fixed overlay clarification: an expanded inline group and its visible members remain at their opening screen coordinates. They cover the background rather than participating in ordinary pin packing or moving existing pins. Home apps scroll freely behind the opaque group frame; existing pinned home apps keep their pinTop. Outside-app pointerdown is deferred: vertical movement scrolls the background, a stationary release opens the app and closes the group. The expanded group has no duplicate background row and consumes no extra ordinary pin capacity. Check: tmp/phone-fixed-group-overlay-check.cjs.

- Alignment correction: dragging an outside app into an already-expanded group follows the same 500ms entry path and one-character name inset as initial members, with its stale backdrop row removed. Selected backgrounds extend across the full 414px phone width while preserving vertical fragment masks. All pin lines begin at the canonical left name-grid origin, including symbol-led content; their right endpoint still follows visible text. Check: tmp/phone-row-insets-check.cjs.

- Footer hit areas use three equal 138px zones within the 414px phone canvas, leaving symbol geometry unchanged. Normal-home right circle opens Search; inside a group the right zone remains Dissolve. Left is Quick settings / group Back, middle is Home / group return. Check: tmp/phone-footer-third-zones-check.cjs.

- Global edit clarification: edit mode applies to foreground group and entire home backdrop together. Outside apps select/drag rather than launch; background row reordering and pinned movement preserve the fixed group overlay. In edit mode, a stationary group hold of 500ms opens it with no member selected; clicking the expanded title closes it and retains edit mode. All group dissolution (single, batch, footer and drag target) executes immediately without confirmation, preserving app entries. Check: tmp/phone-global-edit-check.cjs.

- PDF icon revision (cbn-p-1): WALL, TIMER, /HOUSE, COLORS, FLASH and LEVEL use authored vector paths extracted from the supplied PDF. Home/search geometry stays inside 36px; all outlined strokes are 1px, HOUSE stays a silhouette. Quick settings may use the larger native footprint. CALC search and app marks use the same thin calculator resource. Quick FLASH toggles a persisted outline/solid state; COLORS retains playback-only palette animation through a vector mask. Check: tmp/phone-pdf-icons-revision-check.cjs.

- PC icon synchronization: shared assets also drive FROM, software catalog/search, canonical application and Quick-tool window titles, and DOCK. /HOUSE root title and the file-browser DOCK group use the new house silhouette; ordinary folder entries retain their folder glyph. Check: tmp/pc-pdf-icons-sync-check.cjs.

- Live-layer revision: the expanded group overlays the complete live home model rather than a translated HTML snapshot. Home uses the same CabanonPhoneFlow geometry and all complementary pin fragments while open; the source group stays present at 20% opacity and every other background app at 50%. Stationary clicks on the source close and reopen the group at its current home-grid position. Opening paints a 20ms curtain, then reveals authored name nodes by 10ms mono-cell steps without replacing text or symbols. In the final 10ms all right-hand app marks and functional controls appear together; app-icon layers fade linearly for 1000ms while functional controls persist. Home return from app/search/Quick views replays name reveal without the curtain. Checks: tmp/phone-live-home-layer-check.cjs and tmp/phone-name-entrance-check.cjs.

- Functional row geometry is keyed by the phone-functional-row class, not data-id. Original and complementary pin-crossing copies therefore share the exact same width and right-button positions. Check: tmp/phone-functional-pin-position-check.cjs.

- Scrolling icon pulse revision: no distance/neighbor brightness bands. Track actual row-icon centers against the screen middle line, sharing state across complementary fragments and home/background render passes. Each crossing holds full brightness for 10ms, then fades linearly for 1000ms even while scrolling continues; reverse crossings restart that icon only. Hidden crossings through fixed pin/foreground overlay areas do not light background marks. Editing remains all-bright; functional controls and the separate line-tap/name entrance sequence keep their prior rules. Check: tmp/phone-midline-pulse-check.cjs.

- Home reveal now includes information-widget text (date/time/weather/stocks/news and live timing rows). Visual rows reveal concurrently, left-to-right; 14px and smaller text shows two graphemes per 10ms, larger text one per 10ms. Temporary inline glyph runs preserve layout/color and restore original text nodes afterward or on interruption. Live clock/stopwatch/countdown painting waits only during the reveal, without pausing their underlying time state. Final icon/control reveal waits for the longest visual row. Check: tmp/phone-info-text-reveal-check.cjs.

## Current Home gesture and display rules (2026-10-27)

- Bottom dot/ring/back marks are hidden; the existing equal left/middle/right hit regions remain. The middle Home line remains 2px.
- Non-control empty space, including the gap between live text and round controls and the fading right-side identity icons, permits side-page swipes. Text retains its app gesture behavior.
- phone-gestures.js owns the shared logical-point direction sectors: 8pt recognition, horizontal/vertical within 30 degrees, no diagonal action, and a locked direction for each gesture. Page switching requires 16pt horizontal travel. Long-press drift must not exceed 10pt.
- Every Home information app has show name/show info as the first long-press menu item; item.showInfo persists independently of pin, order, playback or message data.
- Three short Home-line taps within 1500ms, while on normal Home, dismiss Home-only unread/notice marks. This uses prefs.phone.homeHintsDismissed and never changes message read state.
- Horizontal movement starting in the Home-line region opens/scrubs task cards. Task-name travel stops at the complete right edge of the last selected name, independent of longer unselected names.

## Footer task switching and overview commit (2026-10-27)

The entire bottom 56px bar recognizes horizontal swipes and switches directly between open apps at the 16pt page threshold. It never opens the overview for horizontal movement. A vertical upward gesture from the middle third still opens overview. Ordinary left/right third taps open Quick/Search; the center tap returns Home.

Task-card selection activates the chosen app directly through activateTask, without home() or a second app-entry animation. Other preview cards exit right and the task name rail/axis exit down over 200ms. The selected live app is already underneath. Actual quick-tool apps are recorded as tasks and resume through their app entry point.

## Shared Phone confirmation dialogs (2026-10-27)

phone-dialogs.js/css own Phone confirmations and adopted rename forms. The dialog is 288 logical pixels wide (eight 36px NAME cells), centered on the complete 414x896 canvas. Text is JetBrains Regular 14px with 18px message line-height. The last message-line center, the affirmative text center, and cancel text center are 30px apart. The affirmative row fills the complete dialog width, is 30px high and uses L9; cancel is another 30px row.

The full-screen shade dims the background by exactly 50%, leaving the middle footer third / Home-line region undimmed. The shade still captures that region: all clicks outside the dialog cancel without triggering controls underneath. Escape cancels the shared modal before other app/page exit handling. Task close-all and app removal share the same component; rename forms adopt its centering, typography, shade and outside-cancel behavior.

## Home row interaction boundary (2026-10-27, supersedes glyph-hole hit rules)

Each complete 56px Home row has one horizontal boundary at its rightmost visible text edge, measured across all lines. Everything between the screen left edge and that boundary is the content region, including prefixes, weather/ASTRO symbols and internal gaps. Only the region to its right is page-drag space. Right-side clickable controls accept taps while horizontal drags navigate pages without firing their action. Text clipping constrains the boundary; hidden marquee copies never enlarge it. Editing selects the same complete left content region.
