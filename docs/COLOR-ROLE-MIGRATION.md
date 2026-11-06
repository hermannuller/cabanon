# Color numbering, schema 3

Current roles: L1–L6 stay as in schema 2; L7 is warning (schema 2 L8), L8 is the former code color now reserved for file/folder marks (schema 2 L7), and L9–L11 remain extra marks. Code has its own independent black/green palette. The following table records the historical schema 1 → 2 step.

L2 and the former L3 were confirmed to share the original L2 surface. The redundant role is now removed. Colors and interaction behavior stay the same.

| Schema 1 role | Schema 2 role | Meaning |
| --- | --- | --- |
| L1 | L1 | Base background |
| L2, L3 | L2 | Panels, menus, fields and title surfaces |
| L4 | L3 | Borders and weak structure |
| L5 | L4 | Primary text and current/enabled state |
| L6 | L5 | Secondary text and other/disabled state |
| L7 | L6 | Hover and selected background |
| L8 | L7 | Code text and numbering |
| L9 | L8 | Errors and close feedback |
| L10 | L9 | Pink mark |
| L11 | L10 | Cyan mark |
| L12 | L11 | Purple mark |

The theme editor separates seven interface roles (L1–L7) from four extra file/folder marks (L8–L11). CSS exposes `--l1` through `--l11`; semantic keys `--green`, `--orange`, `--red` and mark identity keys stay stable.

`home/color-role-migration.js` loads before `app.js` and profile initialization. It prepares all old `cabanon-home`, `cabanon-profiles` and `cabanon-river:*` records, saves their original raw strings under `cabanon-color-role-backup-v3:<timestamp>`, then writes migrated data. A failed write rolls back completed writes. Malformed records are retained unchanged.

Schema 1 migration first discards legacy `l3` and shifts subsequent numbered palette keys; schema 2 → 3 swaps only L7/L8 numbered palette keys and cover references. Semantic keys and mark identities remain stable. Cover migration changes only structured `cover.color` references. User text, document content, names, paths and file mark identities are untouched. `colorRoleVersion: 3` prevents repeated conversion. Fresh profiles and RIVER/CANAL data carry that version immediately.

Historical backups, screenshots and the legacy map in the migration module intentionally retain their original numbering. They are not current palette definitions.

Validation includes inactive user profiles, custom/DIY palettes, covers, backup fidelity, reload idempotence, rollback after a write failure, theme editing/save/reload, and pixel-identical dark/soft screenshots for the earlier panel merge. Schema 3 additionally verifies warning/mark aliases and code independence across all themes.
