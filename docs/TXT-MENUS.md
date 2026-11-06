# TXT menus

2026-11-05: the title bar contains `file` and `edit` in the former + and search positions. Save controls no longer appear in the document/status bar.

File order: new file / new tag / open... / recent > / save / save... / close / quit.

- new file opens an empty TXT window. new tag adds an independent pane, using the existing Ctrl+T policy (up to four panes, then a new window).
- open... browses folders for existing TXT files. recent opens a hover submenu of up to twelve surviving recent TXT files, newest first.
- save / save... use existing save and Save As flows. A successfully saved, unchanged document shows disabled `saved` in place of save.
- close closes the current pane/window; quit closes every TXT window for the current user. Both retain the save / quit / cancel prompt and stop on cancellation or unsuccessful save.

Edit order: search / exchange / turn to / +date & time / select all / copy / cut / paste / delete / undo / redo / setting / hide Status bar (or show Status bar).

- search opens find only; exchange opens find and replace. turn to accepts a logical line number. Date/time inserts local `YYYY-MM-DD HH:mm:ss` at the caret, replacing selected text.
- Native text history and the system clipboard serve editing actions. Read-only documents disable content changes.
- setting stores font, font size, line-height multiplier and default encoding for the current user. Appearance applies to open editors; default encoding applies to new blank documents, without changing existing files' encoding. Defaults: Inter, 16px, 1.75, UTF-8.
- The optional full-width L2 status bar displays line/column, character count and current encoding. Its visibility persists for the current user. All commands live in the menus.
- Escape dismisses an open menu or search panel before the existing window-close behavior.
- The focused pane uses L1/L4; other panes use L2/L5. Theme values follow dark/soft and other selected themes.
