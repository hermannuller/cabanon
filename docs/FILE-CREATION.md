# User-created files and folders

All intentional new filesystem entries use CabanonCreation.create (file-creation.js). Folder New types and zipEntries both delegate to it; right-box ZIP therefore cannot have an independent Archive.zip naming path.

Automatic names use the fixed lowercase base new plus the chosen extension. Directory-scoped collisions use new_1, new_2, etc., before the extension (including compound extensions such as .tar.gz). Welcome text and legacy newEntryBaseName preferences no longer affect naming. All types use the shared filename validator and stable IDs. New blank file content is explicitly empty; blank archive contents are explicitly [], so readers do not invent demonstration content when opened. Packed ZIPs retain their selected-member list. Existing entries keep their names.

Creation reveals the new row in a matching open folder and schedules the shared 20ms-per-grapheme typing animation. A session-only registry follows new rows through layout and DOM replacement; offscreen rows animate when first shown. Paragraph view animates .paragraph-name only, never .paragraph-icon. No persisted timestamps make existing files reanimate on startup.

Copy/paste, move, restore, links and bundled seed installation are not user New. Preserve their names/identity behavior and do not apply this naming/typing policy to copies. First-Save and Save-As defaults use new plus the application extension; explicit user-supplied names are respected, and a newly saved entry uses the same creation animation.

Verification: tmp/new-names-thin-file-icons-check.cjs covers the fixed new base, collision numbering, compound extensions, preserved explicit/existing names, empty content/ZIPs, packed ZIPs, paragraph typing and Save-As defaults. This replaces the Welcome-name expectations in the legacy tmp/new-entry-welcome-check.cjs. tmp/right-file-actions-check.cjs checks right-box actions in all three views. Existing storage and filename tests preserve independent copies, source IDs and naming validation.
