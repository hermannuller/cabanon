# SETTING — 2026-10-16

## Acceptance revision (supersedes earlier details below)

- On/off revision: the entire system’s visible on/off switches show the unchanging string `on/off` before the option label. Exactly four preserved spaces separate switch and label. Only the current word is L5; the inactive word and slash are L6. Switching swaps emphasis, never text. Nine controls share this implementation (six sounds, Ethernet, automatic updates and the locally saved else switch).

- Time zones now use bundled IANA country/zone metadata from `docs/iana-zone.tab` (official source retrieved2026-10-16). Country/city names and current GMT offsets are displayed, including China / Beijing for the underlying Asia/Shanghai zone. Search accepts Beijing/北京/China/中国 and internal names. Single click does not apply; double click applies, clears search and updates the Time zone summary. Keyboard Enter is equivalent confirmation. Offset computation retains daylight-saving and fractional-hour rules from runtime ICU.

- Concise operational rows replace duplicated headings. All gray explanations move to HELP → Setting; else has its own HELP page. Time-zone search filters a bordered L6 list. Sound effects and automatic updates use right-side on/off text. Modes are text choices with L5 selected fill and dark text. Basic controls use pin/unpin rows.
- Apps supports full-row right-click, sortable headers, and requested demonstration installation/size/recent-use values. “Recently” replaces “Past 7 days.” Demo metadata is explained in HELP.
- Power has Basic/Energy-saving dropdown placeholders and a confirmed integer inactivity timeout in minutes; blank means never. This blanks only Cabanon, with input waking it, never Windows. Ethernet, Wi-Fi scan/list and hotspot name/password are local preview controls. Hotspot credentials are stored as a hash.
- on desk previews the actual WALL colors. Theme DIY and font DIY use fixed760×1008 editors; × cancels, confirmation names/applies. Font presets S/M/L/XL/XXL use12/14/16/18/21px. The latest user instruction changes font size only, not strokes, padding, row geometry or icons. Named user schemes can be removed; built-in schemes cannot.
- Multiple `//name` shared targets have independent credentials, mappings and connection states. + creates a target; − requires the irreversible-deletion confirmation then credentials. Sources remain local originals. The source-file share dialog has a Target dropdown. Connect/Connected and Disconnect occupy separate lines and cannot both be actionable. Shared badges are L6 while idle.
- Save controls are disabled gray text when clean, enabled after edits, disabled after success. No success notifications. Audited live saves: screen timeout, hotspot, named shortcuts, Widget editor, rename, folder permissions, WALL and its chooser. Save as stays available.
- Added regression suites `tmp/setting-revision-test.cjs` and `tmp/save-standard-test.cjs` passed. Existing WALL and paragraph suites passed after these changes. No real Windows device/network integration or mobile else communication was added.

## Agreed structure

HELP-style window: full-width40px search below the titlebar, left sections and right details. Search covers section/item titles only. Existing dark L palette,14px text,28px text line height,56px setting rows,1px borders and common8px scrollbars. UI copy stays English. About is last and is plain text.

Sections, in order: It's me!; Time, Date; Language; Volume; Devices; Apps; Power; Internet; Modes; Visual; Shortcuts; Sharing; Cabanon; About.

User and keyboard basic controls enter Identity and Language. Volume click enters Volume; its existing hover flyout remains. The time widget enters Time, Date. Ordinary text preferences save on blur. Explicit confirmation remains for color/font previews and the app-extension modal; × cancels the extension modal.

## Implemented locally

- Immutable random local IDs, private local names, account-local houses/preferences, sign-out screen, account selection, guest creation/deletion. Deleted built-in guests do not silently return. Sign-out preserves the account's house. This is local profile separation, not OS encryption or Windows authentication.
-12/24-hour display and IANA time zones affect the Cabanon clock only. “Sync with internet” reads fresh HTTPS server Date headers through a narrowly scoped main-process action, with a second source as fallback and compensation for round-trip delay. Sources are Cloudflare and Microsoft; time.is is no longer used. It is approximate server time, not an atomic-time API or Windows clock adjustment. Cached/invalid responses and failures do not change the saved clock. The HTTPS fallback uses Cloudflare's documented [public diagnostic endpoint](https://developers.cloudflare.com/fundamentals/reference/cdn-cgi-endpoint/).
- Volume uses the same20-character `▓`/`░` form as the existing From flyout; each character is5%. Click, drag, arrows, Home and End are supported. Audio-source choices match the existing flyout. Brightness has the same disabled control as a Windows-integration placeholder.
- App details use the actual registered catalog. Unavailable installation/size records show `—`; focused usage is recorded from implementation onward. Uninstall and start-on-launch preferences are connected. Extensions have one owner, conflict validation, per-app/all defaults, and confirm/cancel in the modal. Apps still use their existing implemented readers/renderers.
- PC wallpaper dropdown reads local `.wall` documents. `-` removes the wallpaper. Preview shows small L5 glyphs on the background without artwork colors. WALL and its saved snapshot remain independent of theme.
- Dark is official; pale is a disabled placeholder. DIY edits L1–L9 functional roles plus the two dark derivatives. RGB/HEX confirmation, automatic L7.5/L8.5 generation, manual overrides, named schemes and custom-scheme deletion are connected.
- Font/size has a full-work-area example-folder preview and explicit confirmation/cancel.
- Shortcut schemes Cabanon/Windows/Mac/DIY, custom names, multiple aliases, SPACE syntax and conflict validation are connected to the existing dispatcher. Settings displays underscore notation; old HELP plus notation remains compatible. Presets affect Cabanon, not Windows/macOS globally.
- Night mode changes the Cabanon image. Silent/airplane are local preferences; airplane blocks simulated sharing. Welcome is the new-entry base name and appears with a typing reveal at startup. Basic-control visibility retains User, Setting, Power, Phone and a16-control maximum.

## Local simulated sharing

No remote service, upload, real network authentication or cross-device sync. The explicitly labelled demonstration login is `demo` / `123456789`; only the local simulated-online state is checked. Passwords are not persisted or sent. Connection state is session-local and cleared on profile switch.

`//share` is accessible via Sharing and by entering the path in a folder's title code then ArrowDown. Its entries reference the original file identities. Shared folders keep normal views/editing/copy/ordering; removing a root share uses Unshare and preserves the source. Opening a shared child resolves to the same local content. Renames update mappings and live paths. Shared names are checked against source and shared locations; numeric suffixes advance until both allow the name. Sharing badges are two small slashes. Share mappings participate in file undo snapshots.

## Reserved / undecided

- No Windows device, audio, input, networking, sign-in or power integration. Related settings stay placeholders. Brightness cannot change Windows brightness.
- Password/PIN sign-in, real Bluetooth discovery, multilingual UI, pale theme and automatic upgrades are not implemented. Sound toggles currently save preferences; sound assets/behavior are reserved.
- Reinstall/factory reset only have placeholders. Exact data-retention/ID-regeneration policies remain undecided; no destructive reset action is exposed.
- Complete filename-character policy remains undecided. The existing basic validation is retained.
- Phone wallpaper selection belongs to the future phone surface; the desktop chooses PC `.wall` files only.

## else — confirmed phone behavior, desktop placeholder

Low-energy Bluetooth finds nearby Cabanon users. `some else` → A sends `Here is A-ID` (one bell) → B replies with B-ID for free → A automatically sends B a friend request, without an A-side confirmation → B accepts in RIVER.

Three bells maximum, reset to three each local date. A same-day acceptance returns each spent bell once, capped at three. Yesterday's requests do not return bells today. Zero stops discovery only; outstanding replies/acceptances still arrive. A returned bell does not restart discovery automatically. Dismissal hides that person for the day. Friends and pending requests are excluded. Simultaneous greetings merge and return each side's spent bell on acceptance. IDs are immutable; local names and private remarks are visible only to their owner. No daily limit on successful friendships.

## Verification

Isolated Electron tests passed before the final internet-sync replacement: `tmp/setting-smoke.cjs`, `tmp/setting-regression.cjs`, `tmp/setting-entry-test.cjs`, `tmp/settings-performance-regression.cjs`. Existing right-click-range, paragraph-migration and WALL UI suites also passed. The new `tmp/internet-time-test.cjs` passes deterministic tests for HTTPS requests, offset calculation, fallback, stale/invalid headers, offline errors and a backwards local clock. Syntax checks pass for the final scripts. The final GUI rerun was not executed because automatic approval review failed due to its usage limit. Live availability of the replacement time sources has not been verified in this environment.

- Welcome is the first item in It's me, removed from Cabanon. Blur-save and new-entry naming remain unchanged. The else switch is editable and persists locally; Bluetooth discovery remains a future mobile capability.

Project convention: all demonstration login accounts use demo / 123456789, including the forthcoming virtual social app. Immutable Cabanon user IDs remain separate from login credentials.

## 2026-10-17 organization

- Sidebar: Welcome, user, System, Lang & Input, Sound, Devices, Apps, Internet, Modes, Visual, Shortcuts, Sharing, ?.
- Welcome combines the saved startup greeting/new-entry basename and Basic controls. Pin/unpin comes before each adjustable control and highlights the active word like Sound effects. Fixed user/settings/power/phone remain pinned but are omitted from this list.
- System combines Time (format, sync, single-click time zones), Power, Storage, automatic updates, history, reinstall and factory reset. Old time/power/cabanon/storage routes migrate to the matching new position. Recycle-bin settings route directly to Storage.
- Time-zone summary follows its label inline with a normal colon; list selection uses a single click.
- Lang & Input stores regional keyboard, input language and language-dependent input-method choices in the prototype. System language remains English. Devices shows six compact empty selects: Mouse, Keyboard, Display, Printer, Stylus, USB.
- Visual includes a resolution dropdown that always returns to 1920×1080; it does not change screen resolution. Right-click on desktop background directly opens Visual/Desktop, while object context menus and right-drag suppression remain unchanged.
- Storage shows a read-only disk-usage character gauge using the actual volume containing app data in Electron. Recycle-bin capacity is configured as a percentage; existing MB quota is converted on first disk read, preserving its value. Retention days, manual cache cleanup and daily cleanup time are saved. Automatic cleanup runs in the current Cabanon clock/time zone while the app runs, once per day, without shutdown; newly configured times already passed today start on the next day. Cache cleanup uses Electron's HTTP cache API and does not clear user files, chat data or localStorage. Actual Windows recycle-bin management is not implemented; retention applies to the prototype's recycle bin.
- About is labeled ?. Its cabanon title is 28px with a blank line, supplied text is preserved, the help-file link opens HELP, and the supplied signature/date (20226.10.17) align right.
- Redundant group headings are removed where a single row or action already states the same thing; grouped sections retain meaningful headings. Font uses its AAAA control without a duplicate Font and size heading.
- New disk/cache bridge handlers require fully restarting Electron after this source update.
