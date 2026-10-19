# RIVER prototype

Updated 2026-10-17. This is a local interaction prototype inside Cabanon HOME, not a network service.

## Agreed direction

- Bound to the Cabanon identity; no application login.
- Inherit the system palette and ordinary window controls. Supplied two-band logo is stored as a theme-colored SVG.
- Current typography: system small grid, 14px / 28px. ID, time and controls use JetBrains Mono; body text uses Inter, with Source Han fallback.
- A post is one selectable block, including its carried reposts. Left dragging selects text. Right dragging is the hidden block gesture.
- Homepage: original posts on the left, repost blocks on the right. Right dragging any homepage message fragment in either column, in any direction, opens its repost composer on release. There is no cross-column destination test or drag-to-open-original action; click the body for detail.
- At most three messages are carried in a block. A → AB → ABC → ACD by default. In the composer, optional carried messages may be unchecked; the directly reposted author's message is required. Hidden messages remain in the underlying ancestry and receive renewal.
- Reposting is the only content interaction. No likes, comments or bookmarks. Self-reposting is allowed and renews the chain.
- Clicking a message body opens that selected post above all its descendant reposts in a single-column detail view, without a selection box. Clicking the author opens a profile with ID, introduction, membership duration and authored posts. The prototype uses demonstration profile metadata.
- Each post has 365 lifetime segments. Theme light ink means alive; gray means spent. Publication time never changes when renewed.
- A repost renews every upstream post on that chain, including ancestry omitted from the three-message display. Other branches are unaffected.
- Expired posts disappear from views. An explicitly deleted upstream message should instead show an author-deleted marker; a deletion control is not yet exposed.
- Search supports normal text and strict remaining lifetime queries such as `-30d<`.
- Public composer opens by hovering/clicking a 56px square at the bottom right, 24px inset, with L5 background and a large dark cross. It grows with input up to the available height; closing keeps a local draft. Ctrl/Cmd+Enter sends or performs the over-limit canal handoff.
- `rive` is private messaging. Responsive list/chat layout, history search, local messages, local drafts, pin/mute/remove/block demonstrations and Cabanon file references are present. Group creation and contact sharing are explicit placeholders.
- Private-message forgetting is intentionally undecided and is not implemented.
- `canal` is permanent writing and reading. Its final layout is undecided; this preview implements an editable, automatically saved title/body draft reached through the public composer.

## Provisional choices for this preview

- Public feed merges below 800px; chat switches to full-width below 700px. Normal minimum width 500px, maximum 1000px; system maximize/snap is retained.
- Public authoring threshold is 1000 Unicode code points, including whitespace and excluding carried messages. Exactly 1000 can be sent; above 1000, `send` becomes `go to canal blog` and transfers the complete text to a local editable blog draft.
- Noon is fixed at Asia/Shanghai for reproducible local calculations. At each noon, an interval younger than 24 hours is skipped. A post at 12:01 remains at 365 the next noon and falls to 364 the following noon. Exact first-deduction semantics remain open to user refinement.
- Local persisted data is separate for each Cabanon user. Demonstration content is seeded only when no saved RIVER data exists.
- Lifetime is calculated from timestamps; no daily rewrite of every post is needed. Expiration currently hides content and does not physically purge browser storage.
- Followed-feed preview uses two sample accounts; follow management, a server, real recipients, real file transfer, moderation and canal publication are outside this preview.

## Validation

Local browser checks cover typography, ordinary posting, carry selection, three-message truncation, complete ancestry renewal, noon boundaries and expiry, both right-drag directions, flat original thread, lifetime search, profile, 500px layout, chat send and over-limit canal handoff. Visual previews are saved under `tmp/pdfs/river-*.png`.

## Revision: attachments and repost direction

- Homepage blocks show the current reposter first, followed by carried messages in reverse chain order. Each carried message has a standalone 28px `↘` row before its indented author/body.
- Original detail keeps the original first, then all reposts newest first, flat and indented. Its `↖` count/relationship indicators occupy standalone 28px rows.
- Each lifetime bar occupies one 28px grid row; its 2px segments are vertically centered. No additional blank row or inter-post margin follows it.
- Rive + opens an ordinary Cabanon file-selection window, with folder navigation, multiple selection, confirm and cancel. Confirm stages attachments in the current chat; send publishes them with optional text. Individual staged files can be removed.
- Internal file dragging into the chat stages the same attachment cards. The source files are neither moved nor edited. The prototype stores file snapshots in local message data; it does not perform network transfer or read arbitrary Windows files.
- Validated using actual pointer dragging from a HOUSE file window, as well as the picker, confirmation/cancellation, removing staged files, attachment-only sending and original-source preservation.

## Current interaction revision: staircase and writing

These rules supersede the earlier carry checkboxes and ordinary arrow/count buttons.

- Homepage carried messages form a staircase, newest reposter first, at 0 / 20 / 40px indentation. Standalone `↘` rows sit at the corresponding parent level, 0 / 20px.
- Every visible message fragment has its own Repost action. With no descendant reposts it reads `Repost`; otherwise it reads `(N)` and changes to `Repost` on hover or keyboard focus. Clicking it targets exactly that fragment and retains its underlying ancestry automatically. No carry checkboxes remain.
- Original detail is single-column. The selected post is at the top with all its descendants underneath in reverse chronological order, flat and indented, with standalone `↖` relationship rows. Counts contain no arrow.
- Canal draft fields autosave per Cabanon identity. The handoff preserves the raw input, including whitespace; prior nonempty blog drafts are retained in local draft history before replacement. No canal publication flow is implied.
- Browser validation covers the button's exact 56px dimensions, L5 fill and bottom/right insets; staircase coordinates; counter hover; per-fragment targeting and ancestry; single-column detail; removal of selection boxes/checkboxes; textarea growth; 1000/1001 character boundaries; handoff and draft persistence after reload; attachment picker regression; and composer bounds at 500px.

## Homepage search removal

- Removed both wide and narrow homepage search fields and the hot-topic list. Both feed columns now start with posts. The existing top search destination remains available while the final search interaction is undecided; no new search overlay or persistent search bar is introduced.

## Writing entry position correction

- The 56px writing entry is at the lower left, 24px inset, superseding lower-right placement. The hover composer opens above it with an L5 light surface and L1 dark text/caret/buttons. Automatic growth and 1000-character canal handoff remain unchanged.

## Composer overlay and navigation revision

- The light composer replaces/overlays the lower-left 56px square at the same 24px bottom/left inset. The square is hidden while the composer is open and restored on close. Ordinary composition has no river heading; repost composition retains its target context.
- Navigation uses fixed slots: the feed mode gets 96px and the other icons 56px. Labels always reserve their line. Inactive labels are invisible, hover labels use L6, and selected labels use L5. Feed labels are flow/care or care/flow, with the first word emphasized and the other word/slash in L6.
- Flow uses the supplied band logo. Care uses two staggered rows containing eight squares. Switching mode changes the glyph and label content without changing any icon position or slot dimensions.

## Inline repost arrow and lifetime offset

- For carried homepage chains, the arrow belongs to the preceding fragment’s action: `↘Repost` / `↘(N)` on one line. The entire button including the arrow triggers that fragment’s repost. Separate ↘ rows are removed; staircase indentation remains.
- Lifetime segments move up 8px within their existing 28px row; the row and following-post positions remain unchanged.

## Identity link treatment

- Every clickable identity in public feeds, details, search results, carried posts and chat headers uses transparent background, L5 emphasis and an underline on hover/press/keyboard focus. Contact-list rows also remain transparent, with the ID alone underlined; timestamps and message previews do not receive an underline. Static profile headings remain text.

- Rive contact-list exception: the complete conversation row keeps its L3 hover/pressed/selected background; the ID retains L5 emphasis and underline. Other clickable identity labels remain transparent.

## Rive message grouping and connected rules

- Message rules use a single SVG path: a horizontal segment joined directly to a 13px by 13px, 45-degree tail. The outgoing path is mirrored. A ResizeObserver recalculates horizontal length without stretching the tail.
- Consecutive messages by the same side form a group. Only its last message has the tail; earlier messages retain only the shorter horizontal segment. A new message from that side updates the previous last message automatically; an opposite-side reply ends that group. Attachments use the same rule.
- Search determines grouping from original adjacency, not from adjacency of filtered matches, so hidden replies do not merge unrelated runs.


## Current Rive object gestures

- A message click selects it. Ctrl toggles selection, Shift selects a range, and a left swipe over messages selects a contiguous range. Starting in blank message space draws the ordinary rectangular marquee, without a drag tether.
- Right dragging a message or selected messages into the reply input stages a read-only full quote with original ID/time. The editable reply appears above it. Sending persists both the reply and quote locally.
- Right dragging onto a contact opens a normal forwarding window with an optional editable comment and a read-only original preview, clamped with an ellipsis when long. Confirm sends the complete original snapshot, not its truncated preview.
- Double-click opens a simple selectable reader for the entire contiguous same-author run. Its header contains Copy full text on the left and close on the right. Text, quoted text and file names are included in the full copy.
- Public posts regain gray hover, pressed/selected and dragging backgrounds with no outline frames. Their existing click-to-detail action remains.
- Final browser checks passed real left file dragging into chat, shared feedback singleton/absence of legacy layers, the homepage right-drag repost gesture, message multi-selection/marquee/range, quote send, forward confirmation/send, reader/copy, Escape cleanup, and Shift-click/Shift-arrow focus/selection without borders. No page errors were reported.
- Current right-button drag routes are inventoried in docs/RIGHT-DRAG-AUDIT.md.


## Detail context and expanded examples

- Each visible message fragment is an independent gray hover/selection/drag region, without outlines; its surrounding carried block does not highlight as one surface.
- Clicking C in a C/B/A carried block opens detail with the complete three-message context at the top. Clicking B opens its B/A context, and clicking A opens A. The established maximum-three display rule remains.
- Below the context are exactly the clicked message's descendant reposts, matching its displayed counter, newest first. Each lower entry displays only its own new message, avoiding recursively repeated contexts.
- Example revision 2 adds two short replies to every existing live seed/user post plus a deeper sample branch, once per local identity. Existing posts, drafts and messages are retained. Reloads do not append the examples repeatedly. New leaf replies may naturally have no reposts.
- Browser checks passed full C/B/A context, C count/list agreement, flat replies, independent fragment hover, B/A navigation and idempotent sample initialization.

## Lifetime visual samples and warning color

- Remaining lifetime at 30 days or less uses L9 red for alive segments; spent segments remain L6 gray. At 31 days and above alive segments use L5. Existing 2px height and 8px upward offset remain unchanged.
- Added seven standalone timestamp-based visual examples (365, 270, 180, 90, 30, 14, 3 days), once per local identity. Real posts and existing chains are unchanged. The 30-day sample is approximately 37px red out of a 451px bar (8.22%).

- Writing entry and both ordinary/repost composers now sit flush at the application content bottom-left corner (left 0, bottom 0), superseding the 24px inset.

## 2026-10-17: Share, Pub and cancellable quotes

- Right-drag any public fragment on home, detail or profile: default Repost; onto rive navigation Share; onto canal navigation Pub.
- Share opens a forwarding window with ID search, recent recipients in 28px lines (up to three visible rows), optional comment and a read-only original preview. IDs are selectable together; selected IDs use L5 plus underline. Searching/adding an ID selects it and replaces an unselected visible recent ID when the list is full. Confirmation sends to every chosen recipient in the local prototype.
- Pub switches to the canal blog draft with the selected fragment as a read-only quote. Existing draft title/body are retained.
- Pending Rive quotes can be selected (light background and top-right ×), cancelled with ×, or right-dragged back into the message area/outside the RIVER window to cancel (`cancel quote`). They can also be dragged to contacts, rive Share or canal Pub using the same routes as messages.
- Quote text and sender/time remain immutable. Reply text is written above it.

## 2026-10-17: direct text selection and message limits

- Carried River fragments and external references show the original publication date/time to the second, rather than relative age. Standalone timeline entries keep their relative timestamps.
- Rive text supports native left-button text selection and copying without opening the reader. Clicking still selects a message; double-clicking still opens the full-text reader. Blank-space marquee selection remains available.
- A message displays at most six 28px content lines. Overflow adds a red `[+]` at bottom-left; this marker follows ordinary message click/double-click behavior.
- Every sent message body has at most 1000 Unicode code points. Longer input splits at the last available whitespace within that limit, preserving the complete text; a run with no available whitespace splits at the limit. Attachments and quotes belong to the first part. This limit also applies to forwarding comments and group Share.
- Every message has its own 45-degree fold, including consecutive messages from the same side. Left folds align with the left edge of their message region; mirrored right folds align with its right edge. No continuation-only horizontal lines remain.
- Right-dragging within the originating Rive message/quote keeps the shared line with no content hint. This is a neutral gesture, not an invalid drop.
- The temporary canal cancel button sits at bottom-right and clears title, body and quote immediately, saving the empty draft.

- Latest adjustment: startup welcome survives mouse motion and scrolling; it dismisses only on keyboard or mouse-button press. River content has no shared 8px bottom/right gutter, so the writing button and composer meet the window interior bottom edge.

## Unified Share and context clicks

- Public River and private Rive sharing use one fixed 560×520 window named `share to`. It has only a close control; resize handles and minimize/maximize controls are removed. Double-clicking the title does not maximize it.
- Sharing to a contact uses this same searchable multi-recipient window, with that ID preselected using L5 and an underline. The separate single-contact forwarding window is removed.
- Releasing a right click on Rive messages shows `copy`, `share`, `repost`; on public River fragments it shows `copy`, `share`, `quote`. Copy copies original text; share opens the unified dialog; Rive repost prepares a public draft with an immutable quoted source; River quote prepares its existing repost draft.
- Right drag and context click are mutually exclusive. An early global guard suppresses context-menu events for completed right drags, including file/paragraph copying, messages, normal titlebars and code-mode window movement. A subsequent ordinary right click works normally.

## Corrected message menus and selected bubble

- Rive right click: `copy / share / quote`; quote stages the selected messages in the current chat input.
- River right click: `copy / share / repost`; repost opens the existing public repost composer. The previously reversed menu actions and private-to-public repost draft route are removed.
- Selected Rive messages hide the thin fold and use an L3 rectangular fill with a solid 14px 45-degree tail, without an outline. Left messages have a bottom-left tail; right messages mirror it at bottom-right. Deselecting restores the thin fold without changing layout.

## WYSIWYG repost composer and quiet quote selection

- Repost composer starts directly with a one-line, growing text input; no Repost/author heading or reserved header row. Below the input it previews the exact carried-fragment sequence for the new post, with dedicated downward-arrow rows and successive 20px indents. The maximum-three-message rule matches published posts, including carrying original plus immediate source for deeper chains. Preview metadata uses absolute timestamps.
- Source content is read-only and cannot navigate away from the draft. The close control is shown on composer hover without reserving a header row.
- Selecting a pending Rive quote uses L3 gray rather than inverted light fill; its top-right close control uses L5.

- Repost composer palette: immutable carried text/metadata/arrows use L6 gray; editable text, bottom separator and send use L1 dark ink on the L5 composer background.

- With a chat open, the contact list starts higher so its first ID shares the chat-header ID text baseline. Contact rows retain their existing 84px (3×28px) rhythm.

## Contact/chat split and independent scrolling

- A 1px L4 divider runs down the chat area's left edge from beneath the search area to the window bottom, meeting the header underline. Contact-row selection reaches that divider with no right padding.
- Contact and message lists have bounded, independent scroll regions with scroll chaining disabled. Contacts extend to the bottom of the window; their native scrollbar is hidden so the selection fill stays flush with the divider. Contact scroll position survives local rerenders.
- Left message previews prepend `Me: ` when the latest message was sent by the current user, including attachment/quote-only messages.

## Contact controls, profile privacy and history

- One contact menu is used by the chat-header ellipsis and by releasing a right click on a contact-list ID or chat-header ID. Order: profile, make group…, share, pin, chat only, mute, clear, remove, block. Active pin/chat only/mute use L5 and underline.
- Chat only is a per-recipient outgoing privacy setting. In the local prototype, switching to that recipient identity and opening the owner's profile shows only the owner ID and back arrow. Owner profile posts/description/join date/writing entry are hidden in that view. Blocking also restricts that recipient's profile view. This is prototype identity data, not a deployed server authorization layer.
- Profile and detail navigation keep a view history, including current chat, filters, thread and scroll positions. Back restores the previous Rive/River/detail view. The profile arrow has no River label.
- Right-click/release in the message-list background shows select all / clear. Select all uses the existing message selection set, so copying, sharing and multi-message quoting still work normally. Dragging instead of clicking does not open this menu.
- Clear removes all records in the targeted chat and its pending quote/selection, retains the contact and input text draft, and persists an empty array so examples are not recreated. Remove removes the contact without clearing its records. Block records the blocked ID and removes it from contacts.
- Clear, remove and block each use exactly one red system confirmation: `you will ACTION ID, are you sure?`, with yes/no. Cancellation makes no changes.
- Contact scrolling uses the same native standard scrollbar as other lists (8px thickness, 8px inset and track-end rule). Selected-row gray fill continues through the scroll gutter to the divider. This supersedes the earlier hidden-scrollbar rule.

- Both normal and repost composers place the close × at bottom-left in the same footer row as send at bottom-right. There is no reserved close-button row above the editor.

- Clearing an existing chat retains its contact and friendship settings. An empty chat preview displays a single hyphen (`-`); sending again starts fresh records in that same chat.
