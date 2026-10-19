# Standard file saving dialog

All current and future applications saving Cabanon files must use `openSaveFileDialog` from `home/save-file-dialog.js` for first Save and Save As. Do not implement an application-specific location/name picker. MARATHON's CANAL workflow is excluded pending its own design.

- BERLIN folder structure: folder icon/current folder in title, back/forward/up/new-folder controls, editable path through the shared title code mode, scrolling 56px icon/name file rows.
- Default size 760 × 560; resizable, with a close control. No minimize/maximize controls.
- Footer: filename input, lowercase `save`, `cancel`; neutral background and hover-only button backgrounds.
- Show folders for navigation and only the requesting application's supported file extensions, supplied via `applicationFileFormats`.
- Select rows with left click; Ctrl toggles and Shift selects a range; Ctrl+A selects all visible entries.
- Delete acts only while the file list has focus, deleting selected files/folders to the existing recycle bin. It must not delete text while a filename/path input is focused. Block read-only entries and folders containing read-only descendants. No permanent-delete shortcut in this dialog.
- Enter on a folder navigates; Enter on a file submits its name. Escape/cancel closes without saving.
- Application callback owns extension completion, name validation, collision confirmation, read-only overwrite protection and content serialization. Cancelling or failing must not mark the source saved.
- Existing-file Save writes directly; Save As and first Save use this dialog. `saved` remains lowercase, disabled and L6 when content and encoding match the saved document.
- Internal saving and external import/export remain distinct. Native browser/OS download dialogs are outside this component.
