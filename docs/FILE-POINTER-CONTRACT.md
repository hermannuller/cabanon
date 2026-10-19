# File pointer hit contract

Folder clicks and drag starts deliberately have different hit areas. Preserve this distinction in list, details and paragraph views.

- Left-click selection and stationary right-click FILE menus accept the whole folder option rectangle, selected or not. Unselected right padding/detail columns are FILE menu hit areas when clicked, but remain box-selection origins when moved. Only true folder background opens the folder background menu.
- `fileContentHit` accepts a continuous rectangular icon/name band: same full height as the option, from the option left edge through the visible icon/name right edge. Top/bottom blanks and the icon/text gap inside this width count as content. Only the remaining width to the right is whitespace. Use it for drop destinations and content actions. `fileDragStartHit` adds the whole already-selected L5 folder option for both mouse-button drag starts and drag feedback. Never expand drop destinations.
- Pressing whitespace inside an option records that option for a possible click. Moving 6px or more starts a selection box if the option was unselected at pointerdown. If already selected, its entire L5 rectangle starts file dragging, just like the icon/name. The original pointerdown hit owns the gesture.
- The initial hit area owns the gesture. Crossing an icon/name during a box gesture must not turn it into a drag. Returning near the start after crossing the threshold must not turn it back into a click.
- Left stationary clicks select; right stationary clicks use the full option rectangle regardless of selection. A moved right gesture must not open a context menu or execute its stationary-click action.
- Keep double-click opening/editing behavior separate; it is not authorization to expand the drag hit area.

Regression checks: `tmp/file-click-drag-split-check.cjs` checks whole-option clicks and subthreshold jitter with both buttons in all three views. `tmp/file-hit-contract-check.cjs` checks whitespace boxes and icon dragging. `tmp/right-file-actions-check.cjs` checks ZIP, normal delete and context suppression. Run all three after relevant changes.

## RIGHT! actions (2026-10-18)

Right icon/name dragging always copies. Whitespace boxes have five per-profile choices: `>/` (folder move), `+>/` (folder copy), `> zip` (ZIP move), `+> zip` (ZIP copy), `delete`. The live hint includes current count and action until release. Release executes immediately except Shift+box-delete: red burn hint, then confirmation. Cancel/empty boxes do nothing. Stationary menus remain modifier-neutral and close on any key. Shift+Delete remains a Burn shortcut.

Folder header hover back/forward/up for one second navigates during dragging and retains source identity/count. New folder/ZIP menu targets move on left drag and copy on right drag. Left blank header drops open Info; right header drops open batch rename. Other left header buttons are invalid. Archives retain their own content snapshots before removing sources. New containers still use Welcome naming and typing.

Regression: tmp/right-file-actions-check.cjs checks all five actions in all three views, plus confirmed Shift burn. tmp/file-batch-tools-check.cjs checks collection content, Info, read-only, header navigation and rename. tmp/batch-rename-check.cjs checks grammar and atomic rename.

Regression: tmp/file-context-selected-area-check.cjs checks unselected padding as folder background, icon/name file menus, and full selected L5 row menus in list/details/paragraph views.

## Left selection shapes and pure modifier taps (2026-10-18)

Normal rectangle and Ctrl append retain their behavior. After drawing a rectangle, Shift fixes its width and origin horizontal edge while the cursor moves the opposite edge, forming a parallelogram. Releasing Shift restores a normal rectangle. Alt starts a radial sweep with a fixed origin; triangles between every adjacent trajectory sample accumulate into a union and reverse motion never erases it. FROM starts a closed free lasso. Alt/FROM choose the shape at the start; releasing the key does not switch modes. Ctrl can append independently, including with Alt. Mouse release commits, Escape restores the pre-gesture selection.

Only initially visible items and pixels are evaluated per frame. Shape masks are clipped to the initial viewport, and wheel scrolling is prevented during selection. Coalesced/pending points are retained rather than skipping the path between frames. Containment preference applies to the actual shape, not its bounding rectangle.

Control/Alt sidebars fire only on an isolated matching release. Any pointer movement, mouse press/release, wheel, other key, overlap (including AltGr), or focus loss invalidates the candidate for that whole sequence. Either release order after Ctrl+Alt is inert. There is no time limit for a stationary isolated hold. The Windows FROM helper emits down/up events while suppressing the host Start menu; renderer tracks whether the press was used for a gesture, so release does not open FROM afterward.

Checks: tmp/selection-shapes-check.cjs and tmp/check-windows-key.ps1 (compile only, no hook installed), plus the existing pointer and Escape checks.

Latest full-height content-band/menu table regression: tmp/full-height-file-hit-check.cjs. This overrides earlier screenshots/tests that treated text-top blank space as box whitespace or unselected option padding as a folder context menu.
