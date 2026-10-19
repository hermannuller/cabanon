# User-created files and folders

All intentional new filesystem entries use CabanonCreation.create (file-creation.js). Folder New types and zipEntries both delegate to it; right-box ZIP therefore cannot have an independent Archive.zip naming path.

Automatic names are the trimmed/NFC Welcome base plus the chosen extension. Directory-scoped collisions use _1, _2, etc. All types use the shared filename validator and stable IDs. New blank file content is explicitly empty; blank archive contents are explicitly [], so readers do not invent demonstration content when opened. Packed ZIPs retain their selected-member list.

Creation reveals the new row in a matching open folder and schedules the shared 20ms-per-grapheme typing animation. A session-only registry follows new rows through layout and DOM replacement; offscreen rows animate when first shown. Paragraph view animates .paragraph-name only, never .paragraph-icon. No persisted timestamps make existing files reanimate on startup.

Copy/paste, move, restore, links and bundled seed installation are not user New. Preserve their names/identity behavior and do not apply this Welcome/typing policy to copies. BERLIN's first save default is Welcome-based; explicit Save As input is respected, and a newly saved entry uses the same creation animation.

Verification: tmp/new-entry-welcome-check.cjs exercises all New extensions/folders, packed ZIP, empty content/ZIP, paragraph typing, copy exclusion and BERLIN defaults. tmp/right-file-actions-check.cjs also checks the actual right-box ZIP name and typing effect in all three views. Existing storage and filename tests preserve independent copies, source IDs and naming validation.
