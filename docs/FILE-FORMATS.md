# Cabanon file formats

The user’s 2026-10-17 application table is the recognized-extension whitelist. TXT supports .txt; MARATHON also supports it. Support can overlap; the existing default .txt owner remains TXT. The settings default-owner map is separate from supported formats.

Recognized formats do not imply that unfinished readers, codecs or archive engines have been implemented. STUFF currently has the existing ZIP prototype. Atom is recorded as NEWS feed-format information, not an invented extension. μmail remains in the app catalog with no supplied extension. OURDESIGN is migrated to the supplied name OutDesign.

## Previously recognized but absent from the supplied table

.docx, .xlsx, .ppt, .jpg, .pdf, .png.

These files are retained, but their extensions now show the unknown-file SVG. Existing old-format new-file/demo entries are not silently renamed or removed. .skch files and their icon were explicitly removed separately. .help is the old extension already migrated to .help!.

## Matching and UI

Extension matching is case insensitive and matches .tar.gz as a complete extension. All file views use glyphFor; renaming between a known and an unknown extension changes the file SVG after save. File text is unchanged. Folder icons are independent of suffixes.

## Legacy filename migration

.wri → .md; .gri → .tsv; .ear → .mp3; .poi → .show.

Existing per-account filenames, content keys, archive references, recents, pins, desktop objects, folder ordering and settings references migrate together at load. File contents are preserved. Collisions keep both documents using the existing `name (1).extension` rule. Migration is idempotent. Seed files and New menus use the new extensions. μmail is a network email application and has no file extension.

No further graphical icons are retired by these four renames: document remains for .md/.show, grid remains for .tsv, headphones remains for .mp3. The .skch leaf was removed separately.
