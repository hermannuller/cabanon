# MARATHON writing workspace

## Division of responsibility

canal remains the writing-house list, file-like grouping and publication/reading area. Its new-work + and existing work entries open app:MARATHON. MARATHON contains the writing editor, title/body, notes, chapter ordering, writing environments, typography, save, finish/unfinished and publication dialog. The editor no longer appears inside RIVER. Returning to the house or completing publication focuses canal in RIVER. Work, notes, article/book/series references, typography and existing editions are shared, never copied into an unrelated draft store.

The house is restored to L5 with dark L2 text; both its fixed 160×252 card geometry and responsive column count remain unchanged. The split divider is removed. The expanded writing-side return strip uses L2. Reading/store and FEATURE styles remain as previously specified.

## Editing and references

MARATHON's body is an editable document with independent text and immutable quote blocks. Right-dragging a River fragment or rive message onto the MARATHON body inserts a quotation at the last writing caret; otherwise it appends. Every quotation records full text, author ID and exact Shanghai date/time. Existing text before and after the caret is retained. Shared drag feedback says Quote, and dragged right-button release never opens a context menu. Finished work is read-only and refuses quote drops until unfinished is chosen.

River long-post handoff and Pub imports open MARATHON and convert their references to the same block model. .md/.html files whose default owner is MARATHON open in the writing workspace and write body changes back to the original file. Opening MARATHON again resumes its existing window/current work. Closing and reopening restores blocks and notes.

Local persistence uses the existing per-user river workspace record, with live shared objects when both applications are open. Profile switching closes the editor; saved work stays with its original user. Publication uses a strict public snapshot including paragraph/quotation blocks but excluding private notes, editor fields and source filenames. Editing work does not mutate old editions.

## COLORS

COLORS uses a CSS-only solid square in From, All Apps, search, its title bar and taskbar. A 48-second linear closed-loop color animation transitions gradually without a jump at the repeat boundary. No SVG is added. Reduced-motion preference disables animation.

## Checks

Browser verification covers canal-to-MARATHON entry, actual River/rive right-button drags across neighboring windows, cursor-middle insertion, source metadata, finished locking, private-note exclusion, publication immutability, close/reopen persistence, long draft and Pub imports, original Markdown file write-back, CSS COLORS across From/taskbar, and regressions for chat menus and CSS navigation/window controls.
