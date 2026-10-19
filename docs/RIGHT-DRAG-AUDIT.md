# Right-button drag audit

Scope: the current Cabanon desktop prototype source, 2026-10-17. This does not inventory Windows or other installed applications.

| Origin | Destination | Result | Implementation |
| --- | --- | --- | --- |
| Ordinary window titlebar | Desktop position / snap edge | Move window; snap where supported | home/window-move.js, home/window-snap.js |
| Code-mode header/editor surface | Desktop position | Move its window | home/code-editor.js |
| Any River homepage message fragment, either column | Any direction | Open repost composer for that fragment on release | home/river.js |
| Rive message or selected messages | Current chat input area | Stage a read-only quote with author, time and full text below the reply input | home/rive-interactions.js |
| Rive message or selected messages | Contact ID in chat list/header | Open a forwarding window, with editable comment above a read-only, truncated original preview; confirmation sends locally | home/rive-interactions.js |

These routes use one shared line and action-hint renderer in home/drag-tether.js. Left-button object drags use the same renderer. River homepage right drags show the Repost hint and line in any direction; the former cross-column actions are deleted.

Other currently implemented drags are left-button operations: file movement/copy/link/sort and attachment staging, desktop item movement, From app/folder/control/widget ordering, resize handles, adjustable percentage controls, and WALL drawing. Each is registered with the same feedback component. Paragraph-mode text selection is excluded until its actual object-reorder gesture starts.

Right-click tree expansion, ordinary context menus, empty-area selection rectangles, message-range selection and reader text selection are selection/click actions, not object dragging. They do not create a drag line.

Removed duplicate feedback implementations: River's separate drag hint and placement logic; file/archive/paragraph hint placement; the obsolete file preview/connector DOM and CSS. File targets retain their own action decisions, while feedback rendering, coordinates, theme, threshold and lifecycle are shared. There are no object-specific line-display preferences.

## File dragging update

Files/folders now add a seventh right-button route: copying into a target folder, including duplication inside the same folder. Left dragging always moves between folders and only sorts inside the same folder. Ctrl and Alt no longer select drag operations. The earlier paragraph stating all file dragging is left-button-only is superseded.

## Current routes, 2026-10-17

| Origin | Destination | Hint / outcome |
| --- | --- | --- |
| File/folder, including paragraph view | Valid directory or same-directory insertion | `+ summary > destination`; same-directory omits destination; creates copy |
| Any public River fragment, on home/detail/profile | Anywhere except special nav targets | Repost composer |
| Any public fragment or Rive message/pending quote | rive nav | Share; searchable multi-recipient forwarding dialog |
| Any public fragment or Rive message/pending quote | canal nav | Pub; quoted blog draft |
| Rive message/pending quote | Current input | Quote |
| Rive message/pending quote | Contact ID | Share; contact forwarding dialog |
| Pending quote | Chat messages or outside RIVER window | cancel quote |
| Invalid destination | — | Can't; L9 fill / L5 text / no icon |

Desktop movement uses Still here. From app/folder/system/widget reordering keeps the line with no hint content. These entries supersede earlier descriptions in this audit.

- Neutral right drags that stay within the originating Rive message or pending quote show no text hint and perform no action.

## Context-menu exclusion

All right-button routes are covered by `home/right-drag-guard.js`, registered before application handlers. Six pixels distinguish a drag from a click; after a drag, native/synthetic context-menu dispatch is suppressed, including after pointer release. File/paragraph copy, River Repost/Share/Pub, Rive Quote/Share/Pub/cancel quote, titlebar movement and code-mode movement share this guard. No-drag River/Rive clicks create their menus only on pointer release.
