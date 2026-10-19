# canal prototype

## Entry and layout

RIVER navigation contains canal. Initial view contrasts the writing house on the left with the reading store on the right. Either side expands; the opposite side remains a 28px return strip. The writing house defaults to MOBY DICK HOUSE and may be renamed. Its work objects fill each bottom row left to right, then grow upward. A ResizeObserver recomputes columns from the available shelf width whenever the window or split changes, keeping card dimensions and gaps fixed. The house name is a transparent 36px background watermark behind the files; right-click blank house space to rename it. The round + creates an article.

The editor is centered at a maximum workspace width of 1180px; body text is capped at 680px. Smaller windows shrink naturally. The outline, text and private notes have independent scroll areas using the system scrollbars. The three environment circles use provisional existing-system light/dark/muted colors. The adjacent ··· opens a finite menu: Inter, JetBrains or installed iA Writer Duo S, and 14/16/18px. Preferences persist with the user's canal data.

## Writing and grouping

save records a saved point; local draft recovery also persists while typing. finish locks the completed text. unfinished must be clicked to edit it again. Notes remain private working materials. Reopening a referenced child invalidates finished status of its ancestor containers. It never mutates a published edition.

Ctrl/Shift-click selects multiple work objects. Right-drag uses the shared system tether and feedback; a moved right gesture never opens a context menu. Four or more finished articles create a book; two or more finished books create a series. Right-dragging onto a matching container adds references, leaving originals available. A series is the top level. The selection's make book/series action is an equivalent entry point. Work order is adjustable from arrange chapters while unfinished.

## Publication and reading

Publishing requires a finished valid work and creates a distinct edition. Only explicit public fields are copied: title, body, chapter hierarchy and public references. Private notes and editor metadata are not included. The work retains those notes. Later draft edits leave existing editions intact.

A small prototype publication dialog accepts title, description and a CP437-style character cover/color. This is a cover placeholder, not the final cover-design tool. The store has daily rotating featured content, search, categories, cart, library, details and chapter reading. Demonstration buy now adds a book to the local library and performs no payment. No remote publishing, commerce or server recommendation service is implemented.

## Demo and integration

Initial data includes 9 articles (one unfinished), 2 finished books, 1 finished series and 24 demo publications with reading chapters. Copy is generated demonstration prose. Demo data seeds only when canal data is absent. Existing user's draft text and imported quotes transfer into separate new articles. RIVER's >1000-character handoff and river/rive quote-to-canal entry remain supported.

## Verification

Browser checks cover visual layout, ordinary/maximized windows, font options, body-width cap, saved recovery, finish/unlock, 4/2 grouping thresholds, actual right-button drag feedback and menu suppression, immutable editions, private-note exclusion, library reading, and river long-text/quote integration.

## Fixed-card layout revision

Writing and reading house surfaces both use L2. Cards are fixed at 160 × 252px with zero grid gaps. Split view has exactly three 160px columns per side. In expanded views, only the number of fixed columns changes; card dimensions never stretch. The split FEATURE occupies one 480 × 252px row; recommendation height stays 252px in all modes. Existing writing icons remain 76 × 98px, store covers remain 86 × 116px, with the existing title and metadata fonts retained. Card padding/positions place both title areas at the same vertical offset.

The house's circular + entry is removed. New article remains available from the blank-house context menu and River handoff. Both panes have independent standard scrollbars with overscroll containment: writing opens anchored at the bottom and reveals further work upward; reading opens at the top and continues downward.

## MARATHON migration (2026-10-18)

Writing editor/actions now live in the separate MARATHON app. The canal house and new-work + launch that editor; reading/publication browsing remain in canal. See MARATHON-SPEC.md for shared persistence and cross-window quoting. The house uses L5/deep text again, its right return strip is dark L2, and the split divider is removed.
