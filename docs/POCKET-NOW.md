# Desktop pocket and now

The desktop has two protected, movable folder marks plus its optional existing pin.

- pocket (/house/pocket) contains real files. Existing left-move/right-copy drops onto the desktop or pocket keep their semantics.
- now (/house/now) holds shortcuts only. Left or right file/folder drops create one reference per original, with targetId and target path. The original is not moved or copied. Dropping the same original again is a no-op; same-name originals in different folders receive distinct numbered link names.
- Open a shortcut through the original application's normal open path. Moves and renames retain identity; removing the shortcut does not remove the original. New document creation in now is blocked.
- Both desktop folders are protected from rename, removal and file transfer. Each position is saved independently. Desktop folder marks open on double click.

Legacy /house/holle is migrated once to /house/pocket, retaining entry IDs, content, pins, history and folder preferences. Existing pocket/now conflicts are preserved under numbered names. Legacy spelling migration remains in file-storage.js and must not be globally replaced.

The supplied SVG provides the pocket square/flap/button and the inverted triangle for now. Assets are icons/os/hole.svg (stable icon key) and icons/os/now.svg.

On/off marks follow the same reference: on is a left L4 circle on L6; off is a right L2 circle on L3. Capsule inner height equals circle diameter, with an extra 2px border. A single state label appears to the right. Mixed read-only state remains accessible via aria-pressed=mixed.

Checks: tmp/pocket-now-toggle-check.cjs and the three FILE-POINTER-CONTRACT regressions.
