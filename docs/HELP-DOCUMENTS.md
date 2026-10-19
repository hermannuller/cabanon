# Editable HELP documents

`home/help-editor.js` wraps the legacy HELP reader to preserve existing topics as plain text on first use. User editing does not execute HTML. The stored file is versioned JSON (`format: cabanon-help`, `version: 1`, `sections: [{id, title, text}]`); each page body and title are plain text. Legacy non-JSON content opens as one plain-text page.

Per-profile `prefs.helpDrafts` retains document edits and selected topics when editing loses focus or windows close. Existing files use their stable entry ID as the draft key. Untitled documents use temporary draft IDs. Draft persistence does not write source content. Left-side `save` writes the current source file by stable ID, or opens the picker for an untitled document. Right-aligned `save...` always selects a local folder and `.help!` name for Save As, uses shared filename validation and creation, and prompts before replacing another file. File overwrites honor read-only. Saving elsewhere preserves the original file. New documents default to the Welcome filename on first save.

Topic rows reach the left edge. Sidebar +/− adds/removes topics, topic double-click edits the name; page-whitespace double-click opens a plain textarea. Title + opens another document. All HELP windows are grouped as HELP! in DOCK. Local file opening resolves `.help!` by ID/path instead of always showing bundled help.

Verification: `tmp/help-editor-check.cjs` exercises seeded content, layout, topic actions, plaintext input, blur, save, reopen and New. `tmp/help-editor-storage-check.cjs` exercises window blur/reload, unsaved draft vs file content, independent same-name files, read-only protection/Save As and folder navigation.
