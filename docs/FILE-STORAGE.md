# File storage and directory-scoped names

`file-storage.js` separates three concepts:

- The visible name is the last path component. It follows FILENAME-SPEC.md.
- `entry.name` is the qualified location path, used by rows, selection, folder operations and references. It is not a global leaf-name identity.
- `entry.id` owns the content. It remains stable on rename/move and changes on copy. Persisted content keys are IDs, not display names or paths.

Plain content objects expose non-enumerable path accessors for the existing readers. JSON serialization and structuredClone retain only the enumerable ID storage. Reattach accessors after profile cloning or undo. Bare-name compatibility resolves an explicit parent first, then a migrated legacy ID; it must not merge same-name files from different directories.

Collisions are checked within the target parent with NFC and pinned Unicode 15.0.0 case folding. Copy and automatic New numbering uses `_1`, `_2`, etc. Typed rename conflicts produce a warning. Folder trees, archive membership, pins, marks, recent entries, desktop objects, sharing references and paragraph order use qualified paths. Linked MARATHON articles use sourceId to continue editing the right file after it moves.

## Migration and recovery

Before the first identity migration, raw cabanon-home, cabanon-profiles and active account are captured in localStorage under `cabanon-file-storage-backup-v1`. Linked manuscript records that need migration receive a separate raw snapshot under `cabanon-file-storage-backup-river-v1:<user>`. Existing profiles are migrated independently, retaining content (including empty content), old references and visible names. Orphaned content is retained, not discarded. fileStorageVersion marks the new layout. Old ambiguous names have legacyFileIds for compatibility with existing references.

Deletion records retain entry metadata and ID for restoration. Restoring into a folder with a name collision applies the normal `_n` rule; another same-name file in another folder is unaffected. No binary ZIP engine is added by this migration.

## Verification

- tmp/scoped-files-check.cjs: independently edit/open same-name files; move collision; independent copy IDs; reload; delete/restore.
- tmp/scoped-file-migration-check.cjs: legacy profile/guest/content/empty file/archive/order/pins/desktop migration and snapshots; recursive folder copy and rename; persistence.
- tmp/scoped-file-editors-check.cjs: same-name MARATHON and BERLIN files; editor links after move; tree paths; account switching.
- tmp/filename-spec-check.cjs and tmp/filename-storage-boundaries-check.cjs: naming validation and file/folder collisions.
- Existing click/drag/box/context and right-action regression checks remain applicable.

Additional checks: tmp/scoped-file-pointer-check.cjs covers real cross-folder drag, collision numbering, target ordering and renamed preview reopening. tmp/scoped-file-linked-migration-check.cjs covers legacy MARATHON source migration when another same-name file is later created.
