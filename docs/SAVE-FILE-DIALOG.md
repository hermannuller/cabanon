# Standard file saving dialog

All current and future applications saving Cabanon files must use `openSaveFileDialog` from `home/save-file-dialog.js` for first Save and Save As. Do not implement an application-specific location/name picker. MARATHON's CANAL workflow is excluded pending its own design.

- BERLIN folder structure: folder icon/current folder in title, back/forward/up/new-folder controls, editable path through the shared title code mode, scrolling 56px icon/name file rows.
- Default size 760 × 560; resizable, with a close control. No minimize/maximize controls.
- Footer: filename input, lowercase `save`, `cancel`; neutral background and hover-only button backgrounds.
- Show folders for navigation and only the requesting application's supported file extensions, supplied via `applicationFileFormats`.
- Single selection only: left click or right click selects one entry; Ctrl/Shift clicks cannot extend selection and Ctrl+A does not select all files. Right-click an entry shows exactly lowercase `rename` and `delete`. Rename edits inline, validates through the shared filename/rename rules and preserves content identity; Enter commits and Escape cancels.
- Delete acts only while the file list has focus, deleting the selected file/folder to the existing recycle bin. It must not delete text while a filename/path input is focused. Block read-only entries and folders containing read-only descendants. No permanent-delete shortcut in this dialog.
- Enter on a folder navigates; Enter on a file submits its name. Escape/cancel closes without saving.
- Application callback owns extension completion, name validation, collision confirmation, read-only overwrite protection and content serialization. Cancelling or failing must not mark the source saved.
- Existing-file Save writes directly; Save As and first Save use this dialog. `saved` remains lowercase, disabled and L6 when content and encoding match the saved document.
- Internal saving and external import/export remain distinct. Native browser/OS download dialogs are outside this component.

## Closing unsaved editors

Use confirmDocumentClose from save-close-prompt.js. Show `wanna save` on the first line and the document name followed by `?` on the second. Actions are `save`, `quit`, `cancel`; default focus is `save`. Save completes the actual application save before closing; validation errors, write errors and cancelled location selection keep the editor open. Quit closes without writing the document; cancel and Escape keep editing. Unchanged documents close directly. This applies to editor windows, not the file-location picker.
