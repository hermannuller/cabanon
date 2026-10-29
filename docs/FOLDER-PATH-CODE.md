# Folder title path commands

Double-click the folder title bar, including its name, to open the existing code editor. Folder title double-click now opens this editor instead of inline rename. File editor title rename remains available.

The first logical line lists one to four paths, separated by `^`. Paths may start with `house/` or `/house/`. A plain path opens an existing folder; `*+` before a path creates a folder through CabanonCreation.create, then opens the actual resulting path. New and existing folders may be mixed in one group. Normal filename validation, stable IDs and directory-scoped `_1` collision numbering apply. Parent folders must already exist or be created earlier in the same command.

Examples:

```text
house/book
house/book ^ house/notes
*+ house/01 ^ *+ house/02
*+ house/01 ^ house/book
```

Execution requires typing exactly one `>` into an entirely empty second logical line. A space or other character already on that line prevents execution; `>` in other lines, pasted commands, and later edits do not execute it again. Delete the second line's contents before typing another `>` to explicitly run again. The editor, command text and `>` remain visible after success. Group changes reuse the same window and existing 2/3/4-pane behavior.

Validate the entire command and access before creating any folders. A missing folder/parent, invalid name or unsupported group size leaves the existing group and entries unchanged. Commit pending paragraph edits before changing the group.

Verification: `tmp/folder-code-check.cjs` uses real double-click and keyboard input to check the trigger, navigation, creation, mixed groups, validation, and 4/2/1-pane transitions.
