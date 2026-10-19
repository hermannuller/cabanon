# Cabanon UI 铁律

## SETTING — 2026-10-16 current revision

- All on/off controls always show literal `on/off`. The current word is L5; the other word and slash are L6. Toggle only swaps emphasis. Place the group before its option label with exactly four preserved text spaces and no additional flex gap. This applies to sound effects, Ethernet, automatic updates and the locally saved mobile else switch. Selection checkboxes, pin/unpin and the separately specified mode choices retain their own semantics.

- Acceptance revision: remove repeated section headings when an operational row already names the setting. Move explanatory gray paragraphs into HELP → Setting; else explanation belongs in HELP → else. Keep settings text concise.
- Time zone has a current country/city and GMT-offset summary on its right. The country/city list uses IANA metadata; Beijing maps to Asia/Shanghai. Searching filters only; double-click or Enter applies, clears the search and updates the summary. Single click does not apply.
- Save has one dirty-state rule across visible forms and WALL: no pending change means disabled gray text; edits enable it; successful saves disable it again. No “Saved” toast or success label. Save as remains a distinct operation.
- Theme and font DIY editors are fixed760×1008 windows with only × in the titlebar. Drafts apply only on confirmation; × discards them. AAAA displays36/28/20/14px letters. S/M/L/XL/XXL font sizes are12/14/16/18/21px; user’s latest instruction applies only font size, with existing strokes, padding, row geometry and icon sizes preserved.
- Setting Apps is an explicit exception to the ordinary strict content-hit rule: its entire row accepts context menus. Headers sort App/Installed/Size/Recently. Displayed metadata is demonstration data requested for testing.
- Shared targets are a dropdown with +/−; each has its own credentials. Connect/Connected and Disconnect are separate lines with mutually exclusive actionability. Target deletion requires yes/no and reauthentication. Shared // badges are idle L6 and follow hover/selection ink.

- Full agreed structure and placeholder boundaries: SETTING-SPEC.md. SETTING uses HELP-style left navigation/right details and a full-width40px search immediately below the titlebar. Search matches setting section/item titles only. About is last, plain text.
- The previous single-default-name Setting rule is superseded: Welcome as the first item under It's me saves on blur and supplies both startup greeting and new-entry base names. No Save/Enter is required for this field.
- Setting percentage controls use the From volume flyout's20 `▓`/`░` characters,5% per character. No native range slider. Brightness remains disabled until display integration exists.
- Preserve14px type,28px text line height,56px setting rows, the L palette,1px borders and common8px scrollbars. Theme/font changes are explicit user preferences. The font preview and RGB/HEX dialog require confirmation. App-extension modal × discards its draft.
- No Windows integration. Undecided settings remain labelled placeholders, particularly reinstall/reset, complete filename rules and mobile else. Sharing is clearly labelled local simulation; `//share` is account-local and Unshare retains original files.
- Time synchronization is labelled “Sync with internet”; it adjusts only the Cabanon clock and no longer depends on time.is. Failed or stale responses must not change the clock.

## 所有呼出菜单必须完整留在桌面可显示区域内

适用于右键菜单、悬停菜单、子菜单、系统icon弹出菜单、运行窗口列表、同步路径列表及拖拽浮动提示。

1. 以1920×1080逻辑桌面的四边作为边界，并随实际显示缩放计算。
2. 菜单不得越出任意一边，不得因贴边或贴角而被桌面裁切。
3. 优先遵守触发icon的相邻展开方向；空间不足时换方向或移位。完整可见优先于首选方向。
4. 子菜单必须单独计算边界，不能只检查父菜单。
5. 内容超过桌面可用高度或宽度时，限制菜单尺寸并在内部滚动；必须能访问全部内容。
6. 菜单内容变化、窗口移动/缩放、桌面缩放后重新计算。
7. 移向菜单及子菜单时保持可点击，不得因位置调整导致菜单立刻消失。
8. 后续新增菜单必须接入 `home/menu-bounds.js` 的统一边界处理，并验证四边和四角。

当前统一覆盖：`#flyout`、`#context-menu`、`.new-types`、`#sync-popover`、`#task-popup`、`#file-drop-hint`。

菜单边界规则不限制普通窗口移动。窗口可移出桌面；顶部左键仅中间区域拖动，右键按住顶部任意区域拖动。icon及控制按钮保留左键功能。

## 拖动窗口的贴边布局

左右键拖动共享光标命中规则：上边最大化，左/右/下边各占半屏，四角150px范围占对应四分之一。角落优先于边缘。拖动时显示浅色矩形预览，松开应用，移离取消。布局以1920×1008工作区计算，保留底部72px。固定尺寸计算器维持固定，不吸附。不设置Win快捷键。

预览使用L3、50%不透明度，无边框。首次从当前窗口范围过渡到目标，切换目标范围也以100ms完成位置与尺寸动画。

最大化、半屏及四分之一布局后，按住顶部实际拖动超过4px即恢复贴边前尺寸并跟随光标；单击不恢复。左右键一致。再次进入顶部/边角命中区仍按贴边规则处理。

多屏环境中，拖动光标坐标必须限制在HOME逻辑桌面范围内。移到其他显示器时不再增加位移，防止窗口无限漂走；窗口本身仍可部分超出HOME边缘。

## 滚动条端点留距

所有竖向滚动条轨道上下各留8px，所有横向滚动条轨道左右各留8px，与侧边留距一致；不改变8px条宽及L3/L4颜色规则。

## 文件交互范围与icon状态

- 选择范围：鼠标抵达后显示灰色覆盖的完整区域。
- 文本范围：icon到文件名（包含后缀）的横向范围；像素高度与选择范围一致，只是宽度不同。
- 后续指令必须区分这两个范围。现有拖拽目标命中继续使用选择范围。
- 无论标记色为何，悬停及对应右键菜单保持打开期间，icon统一L5；移出/菜单关闭后恢复标记色。
- 文件拖到文件夹选择范围内，目标icon切为L5剪影；移离或完成/取消拖动后恢复勾线及通常颜色。

## 单实例启动

start.cmd和未来打包exe均由Electron主进程的单实例锁保护。重复启动退出第二个进程，恢复并聚焦已运行的HOME。开发/打包使用固定用户数据目录保持身份一致；自动测试显式指定独立目录。

永久滚动条标准：所有当前和未来的滚动容器都由 scrollbar-standard.js 统一识别。粗细8px，侧边和上下两端间距8px；横向两端与底边也为8px。滚动条使用L3，悬停／操作为L4，无箭头、无圆角。文件列表通过父容器8px留白实现边缘间距，避免重复叠加。8px已避开窗口缩放区，暂不增加为12px。

滚动条端点补充：8px从所属区域内边界计量，不包含窗口1px描边。容器的8px留白与轨道端点不得重复叠加；双向滚动时补偿交汇区。文件列表、所有软件及搜索结果的横向滚动条左端对齐条目的选择区域左边，不对齐icon轮廓。实测文件列表纵向顶端8px，底端至窗口内边8px，横向右端至窗口内边8px，左端与选择框偏差0px。
快捷方式右键不显示 Delete/Burn，仅用 Unpin 移除快捷方式；桌面、From 的 pin 文件夹、快捷导航与 link 对象均遵守。原文件／原文件夹即使被 pin，仍保留 Delete。文件条目整个选择区域右键均针对该对象，只有条目之外空白右键才打开视图菜单。

拖拽规则：桌面仅对快捷方式排序，不转移原文件。文件拖拽显示半透明完整条目，多选保持相对位置；白底操作提示使用L5底L1字，多选前缀x数量。L5、1px连线连接起点与鼠标尖端，松手消失。进入文件夹或ZIP必须命中icon至实际文本末尾的范围（高度仍为条目高度）；其余空白只显示 > 排序。排序保存手动顺序，主动选择排序条件后恢复对应排序。

Details表头点击排序：首击↓降序，再击↑升序，仅当前排序列显示箭头；滚动条顶端避开52px表头，框选顶界也限制在表头下沿。Power菜单为lock、sleep、shut_d at...、shut down，最后一项立即退出HOME，定时项定时退出HOME。框选通过指针捕获保持连续，松手、取消、失焦、原窗口关闭、原生拖动结束均清理选择框。
当前文件窗口或桌面单选后 Enter 打开该对象；多选或没有选择时不打开。输入框和代码编辑区域保留原生 Enter 行为。HELP 中可编辑“打开单个选中的文件或文件夹”的快捷键。

拖拽性能修订：取消起点到鼠标的连线。拖拽浮层移动不触发全桌面滚动条扫描或菜单边界扫描；预览副本移除对象data标记，提示文本未变化时不重建文本。鼠标松开、取消或失焦均清理预览与拖拽状态。

拖拽简化：移除半透明条目预览，仅显示白底提示。单文件 .ext，多文件同后缀 xN .ext，不同后缀 xN；后接 >、+ archive.zip 或目标路径。无扩展名单文件显示名称。所有内置界面文案、HELP、提示、标题和辅助标签均使用英文；用户文件名和用户输入不翻译。

悬停浮窗统一规则：默认紧贴触发按钮右侧，顶部对齐。按桌面可用范围逐轴夹紧，只平移超出边界的距离，不翻到对角线；应用于电源等系统浮窗、新建子菜单、任务列表、同步文件夹浮窗。拖拽连线恢复为1px L5矩形，仅按动画帧更新transform；不参与全桌面滚动条或菜单扫描。左键松开、取消、失焦立即隐藏并取消未执行帧。

桌面固定画布使用overflow:clip，允许窗口部分越界，但不可因聚焦、scrollIntoView等操作滚动整个桌面。文件夹搜索框使用focus({preventScroll:true})。越界窗口搜索回归：桌面scrollLeft保持0，桌面文件位置不变。

From方块始终显示L5方块，不再在闲置状态显示时间或输入法；悬停和按下仍保持方块。
桌面空白右键增加Clear all...。红色YES/NO确认后清空桌面快捷方式与手动顺序，保留原文件及From的pin对象；NO不修改数据。
From最右侧新增Recent files，无标题，宽度280px，与文件夹列一致；14px字体、26px行距，不滚动，根据From可用高度截取完整条目，最近打开的文件靠前。支持点击打开及普通文件右键菜单。

Pin目标：文件／文件夹右键Pin >悬停显示here、from page、desktop；here创建本地link，from page加入From入口，desktop添加桌面快捷方式。桌面Delete移除快捷方式，保留原文件。原文件与文件夹取消Pin底色；所有软件中被Pin的软件使用icon前4×4px的L5小方块。文件列表Delete与Shift+Delete分别删除／Burn，红底L5字yes/no确认；软件不属于文件操作，只支持Uninstall。
From文件／文件夹条目改为普通52px行高，14px文字、26px文本行距；最近文件数量按可用高度除以52取整，无滚动条。

Ctrl目录树：默认仅展开当前文件夹祖先路径和当前文件夹，显示每层直接子项，无关分支折叠。重新呼出时当前文件夹定位至滚动内容顶端，固定头部显示house到当前位置路径；滚轮逐26px行移动。左键打开文件／进入目录，右键仅展开收起分支，不提供其他菜单。构建时只递归已展开分支，不先渲染完整旧树。
Ctrl树分支线条不可压缩，只截断文件名；Ctrl面板在左、Alt面板在右，外缘向内增加3px形成4px边线。原窗口顶部栏下的左键操作收起临时面板且操作本身继续。文件夹Type为/folder；Type排序时文件夹始终位于文件前。


## 2026-10-15: simplified desktop and grid
- Normal row grid: 56px; former 26px compact rows: 28px. Fonts and other existing special line heights stay unchanged.
- File/folder menus use Pin (From homepage) and To desk; no in-folder link creation or destination submenu.
- Desktop holds one movable reference, initially upper-left. Its menu contains only Open and Delete; Delete removes the reference only. Replacing a different item requires the red Yes/No confirmation.
- Recent activity appears in From only. Legacy in-folder shortcut records are retired without deleting their targets.

- Context-menu dismissal: except for mouse operations inside the context menu and its submenus, clicking anywhere or pressing any key closes the menu. Closing also clears its icon highlight. Capture-phase listeners enforce this even when other controls stop event propagation.


## Approved DTP layout, 2026-10-15
- Reference: cabanon-os-dtp尺寸详细.pdf; corrected search size is 270×40px.
- File/folder row 280×56px, icon selection square 56×56px, SVG maximum 40×40px with 8px inset. File text box 202×36px starting 64px from the row left. App text box 210×36px starting 70px from the row left. Fonts/colors remain unchanged.
- From: left inset 32px; control block 96px wide, 16px gap, widget block 152px wide, then 24px gap. App rows begin at x320; folders and files follow in 280px columns. Top inset 16px. Search occupies the top of the left block.
- Bottom 72px is reserved for the dock. Desktop item bounds and the visual density preview respect this area.
- Temporary desktop density preview shows 6×17 visual samples without creating files/references or changing history. Exit preview restores the one-item desktop; To desk also exits preview. Preview dismissal lasts for this app session.

- DTP revision: file/folder glyphs return to 24×24px, centered in the existing 56px icon selection area. Software and From basic-control glyphs stay 40×40px. Row/text geometry is retained.

- Dock glyphs align vertically with the From mark center, 36px above the desktop bottom.


## 2026-10-15 batch operations and selection
- Batch copy/paste/delete commits a single undo snapshot and refreshes only directories affected by the operation, including equivalent sync paths. File content is copied by exact source identity, not a filename-prefix guess.
- Saves coalesce undo preparation within the same task. Hidden From does not render recent files; visible saves schedule one recent refresh.
- Selection uses L5 icon/text and a text underline, with no selected-row gray fill. Hover behavior for other rows is unchanged.
- Deleted names disappear concurrently from the end, 10ms per grapheme. Each corresponding icon disappears when that name finishes; all affected rows retain their places until the full batch finishes, then one removal/reorder commits. Offscreen names do not animate. Undo during the effect cancels the pending deletion.
- Deletion animation clips the existing label through browser-managed keyframes; it never edits text or relayouts the folder on every character. Future font glyph icons can use the same icon state class.
- Window, code and tree size observers are disconnected on removal. Temporary menu/scroll observers are unregistered after removal.

- From right-side app/folder/file columns may extend 56px into the former bottom reserve, adding one complete row. Keep 16px bottom clearance. The basic-control/widget area and desktop dock reserve are unchanged.

- Left inset revision: desktop default item and density preview, All apps, and folder contents start at 40px. Folder content padding is 39px plus its 1px border. From is unchanged. Existing manually positioned desktop items retain their positions.


## From and Dock revision, 2026-10-15
- Main left inset is 32px: desktop default/preview and All apps; folder content uses 31px plus 1px border. Existing old default desktop x40 migrates to x32.
- From height is fixed at 600px; only the right edge resizes horizontally. Top/right edges have the same 1px L4 border as folder windows; no left/bottom border or thick edge hover.
- A 1px L4 vertical separator touches the search field's right edge (x302), beginning at search top and ending 16px above From bottom. Main From columns do not scroll.
- Dock icons other than From use L6 while inactive and L5 for the active group, including on hover. No rectangle underneath the active icon.

- Reopening start.cmd keeps one HOME instance. If local UI code changed, save pending data and reload without cache; if unchanged, only focus the existing window. No polling loop is used.


## From grid alignment, 2026-10-16
- From content moves down 10px (top inset 26px); From mark and outer frame stay fixed. Vertical separator and search results end 6px above the bottom.
- From software columns start at x312 (8px left of x320), then advance by 280px. Folder/file columns follow on the same grid as maximized folder content starting at x32.
- Separator shifts to x294. Search left stays x32, with width262px so its right edge continues to meet the separator. The widget column narrows by 8px to preserve the separator clearance; fonts and icon sizes remain unchanged.


## 2026-10-16 selection and new-name reveal
- In folder contents, selected rows use an L5 filled rectangle with L2 text and icon; no underline. Desktop selection rules stay separate.
- New entries default to “Let there be light” plus their type suffix (folders have no suffix). Setting exposes only the new default base-name field and Save; Enter also saves. Duplicate names receive the existing numerical suffix convention.
- New entry icons appear immediately; names reveal from left to right at 20ms per grapheme through clipped-label keyframes. No repeated name edits, saves or folder sorts happen during the effect. New items are scrolled into the folder viewport without scrolling the desktop.

- 2026-10-16: New commands create their selected type immediately, without the NEW modal. Alt+N creates a folder directly. Retain configured default names, duplicate numbering and reveal animation. Remove the full-desktop density demo entirely; the desktop has only its one real reference.


## Application catalog, 2026-10-16
- Exactly these applications are registered: MAP, RIVER, EMPTY, MARATHON (writing), LOGIC (spreadsheets), AIR-EAR (former RADIO), WALL (drawing), BLIND, CALQ (calculator), HELP.
- Remove the bulk demonstration app-name generator and random base usage values. Unknown/retired application IDs do not open placeholder windows.
- Migrate old app pins/usage: CALC→CALQ, GRID→LOGIC, RADIO→AIR-EAR, ART→WALL. Remove retired software records. Preserve file/folder pins.
- BLIND uses a filled square with a thin center horizontal cut; WALL uses tangled strokes. RIVER/EMPTY retain provisional icons.
- Cabanon.help remains a single root help file and is available in pinned files. HELP and the help file open the same help reader. Lowercase legacy aliases normalize to the canonical filename.
- Checked catalog/launches, calculator/help/icon rendering, and persistence/user switching. Demonstration desktop-file auto-seeding was removed; existing user file/history records were not erased.

- From basic-control glyphs remain40×40px at the same centers; their hit/hover areas are56×56px.
- Details headers stay first and sticky, including after manual file ordering. Only the main folder sorter applies manual order; remove the obsolete second sort. Row reconciliation skips a leading header.

- From basic controls and All apps control move down 8px together with their 56px hit areas; glyph sizes stay 40px. Widget position stays unchanged: 16px below the search bottom, 6px clear of the right separator.

- From alignment revision: search right edge and separator x295 (search263px wide); basic controls and widgets shift right8px. Widget starts at x152 and is127px wide, leaving16px to the separator. Software Pin columns stay fixed.

## WALL — 2026-10-16

- Use the existing dark L palette, normal inputs, borders and typography. Reference screenshots describe behavior, not a replacement theme.
- Logical canvas1920×1080 covers desktop and dock. The Windows/From key brings From and dock above WALL. Closing WALL restores normal dock visibility.
- Default matrix uses English periods in bundled JetBrains Mono ExtraBold,14px font,28px row height. Margin and spacing determine capacity; remove overflowing rows/columns and fill newly available cells with periods. Every canvas point maps to a character, including the outer margin strips.
- Typing a character selects the brush and displays a large L5 square with dark text. Any left click dismisses the prompt. Left click/drag paints; strokes interpolate crossed cells.
- Right click opens a movable, fixed-size settings window. With settings open, another right click anywhere closes it. Settings remain above the canvas while painting.
- Settings use56px rows: brush, bucket, font size, margin, height, spacing, color, opacity. Brush/bucket accept one grapheme or empty; empty changes color only. Bucket applies globally; brush applies to touched cells.
- Shared current color defaults to L5. Exclude L2, the settings-window background. Swatches are14×14px, with an L5 period under the selected swatch. Opacity applies to the artwork, including the desktop version.
- “as my desk!” saves a noninteractive wallpaper snapshot below desktop objects, folders and From. Editing the canvas afterward does not alter that snapshot until reapplied.
- Save/Open use reduced movable/resizable folder windows, default /house. Back/forward/up/new-folder and close remain; search/minimize/maximize/context menus are absent. New creates a folder directly. Double-click titlebar enters the existing code style; ArrowDown navigates the entered folder path and exits.
- Footer height42px, text14px. Save defaults to newone.wall; extensions may be changed. Open defaults to .*all and shows only folders and supported WALL documents. Custom-extension WALL documents remain identifiable by their file metadata. Files use the same virtual HOME storage as existing documents.
- Save overwrites the current file; Save… chooses another location/name and confirms replacement of another file. Ctrl+S saves, Ctrl+Shift+S opens Save…, Ctrl+O opens Open. Closing retains a draft; explicit saved files and applied wallpaper survive restart.
- Rendering uses a canvas and cached glyph sprites, coalesced per frame. Store drafts on stroke release, not pointer movement. Settings/open/save do not add dock entries; they belong to WALL.
- WALL settings revision: all fourteen rows are consecutive56px rows, with no spacer rows. Bottom action text is right-aligned to the same label edge as brush/bucket. Order after opacity: undo, as my desk!, save, save…, open…, quit. Bucket's click area is40px high, matching its input.
- undo/Ctrl+Z restores only the most recent completed artwork operation: one click/continuous stroke, bucket fill, numeric setting edit, or applying desktop wallpaper. Repeated changes while editing one numeric field form one operation. A no-op stroke does not replace history. Undo is consumed once; opening another file clears it. Brush/bucket tool selection is retained. Text inputs keep their normal text-editing undo.
- WALL letter prompt appears only while settings are closed. Left/right mouse press dismisses it; otherwise it hides2 seconds after the latest typed character. Opening settings, closing WALL and switching users cancel its timer.
- Final settings order: margin, brush, bucket!, font size, spacing, height, color, opacity, undo, as my desk!, save, save…, open…, quit. Keep the existing continuous56px grid and right alignment.
- Add font weight immediately above font size. Dropdown: Thin100, ExtraLight200, Light300, Regular400, Medium500, SemiBold600, Bold700, ExtraBold800; default ExtraBold. The bundled JetBrains Mono variable font supplies the real100–800 range. Canvas, letter preview and applied wallpaper use the selected weight. Weight selection is one undoable operation and persists in WALL documents/drafts; older documents default to800. The panel now has fifteen56px rows.
- Save behavior revision: label “save as...” replaces “save...”. Save/Ctrl+S writes the current file directly without a chooser, including when a settings input has focus. With no current file yet, save directly to a collision-safe newone.wall under /house. Save as…/Ctrl+Shift+S opens the chooser and switches the current target after saving. Persist the last successfully saved filename; launching WALL reopens that saved file and its content instead of replacing it with an unsaved draft. Legacy installations infer the last saved WALL document from saved metadata when no remembered name exists. An unsaved draft is only a fallback when no saved file is available.
- Font size correction: hint <73; maximum accepted font size72px.
- Software glyphs in From pins/All apps and application dock entries are36×36px. From left basic controls and All apps launcher glyphs are36×36px. Preserve glyph centers, label positions and56×56px control hit areas. File/folder glyphs, the From mark and non-application dock glyphs retain their current sizes.
- Mandatory context-menu hit rule: only the icon box or the visible filename/text width identifies a file/folder/app. Project those widths through the selection row's height; padding, gaps and unused label width are background. Clip the text hit area at its visible ellipsis/column edge. Details Type/Date/Size cells are background. A row being selected (including multi-selection) does not expand this menu hit area.
- Enforce the rule in the central resolver, including file/folder windows in all three views, desktop, From pins/recents, search results, All apps and archive entries. Misses use the containing surface's existing blank-space menu (or no menu where none exists), without clicked-file highlighting, locked-folder prompts or file-specific passthrough actions. fileContentHit is independent of dragInsideContent; drag selection/insertion/entry rules remain unchanged. Verified with isolated actual pointer context-menu checks across these surfaces.
- Marked icons retain their assigned hue: idle ink is60% brightness; hovered, selected or context-active ink is100%. Use direct CSS color mixing rather than per-icon compositor filters. Unmarked icon rules are unchanged.
- From and folder-local search accept :1 through :6, corresponding left-to-right to the six mark colors (L7 green, L8 orange, L9 red, L10 pink, L11 cyan, L12 purple). Optional text after a space narrows the result, e.g. :1 notes. File/folder marks both match; software results are omitted for a color query. Updating a mark refreshes any active color filter.
- WALL target row “for” is first and displays PC / PHONE in14px text. PC is the initial target; clicking either label toggles target, with only the current one in L5. PC retains1920×1080. Phone is portrait9:19.5, stored at1080×2340 and fitted to the desktop preview. Phone margin is0 and its input/label are disabled gray. Phone as my desk! is disabled gray until a phone screen exists; it never changes PC wallpaper.
- Keep each target's current picture and saved-file target while switching within an editing session. Target switching is undoable. Save phone documents as .pwall (including Save as); PC remains .wall by default. Open accepts both formats and restores their saved target. Existing .wall files without target metadata remain PC.
- Final settings rows: for, margin, brush, bucket!, font weight, font size, spacing, height, color, opacity, undo, as my desk!, save, save as…, open…, quit all use56px. Right alignment and14px text remain unchanged. Fixed control panel480×972px.
- Brush size is a dropdown immediately to the right of the brush character input, in the same row. Choices only1×1,3×3,5×5,7×7,9×9; default1×1. Stamp a square centered on the character under the pointer, clip at the canvas edges, and interpolate stamps during drag. Empty brush still only changes color over the selected square. One entire stroke remains one undo step. Size is a tool setting (retained when undoing), saved with the WALL/pwall document; legacy documents default to1×1.

## 2026-10-16 paragraph migration

- Folder background view entry is ¶. Full final interaction rules and source precedence are recorded in PARAGRAPH-MIGRATION.md.
- Paragraph filenames include editable suffixes, followed by a protected icon. The visible SVG ink starts8px after the filename end, including stroke extent. Keep14px text and56px rows.
- Preserve text/file selection, clipboard, bounded paragraph breaks, group drag ordering, undo and saved layout across view switches/restart. Ordinary List/Details and strict context-menu hit rules remain intact.

- Ctrl tree and Alt quick side panels use the ordinary folder's1px border and inherit its active/inactive border color. Remove the former inward3px thickening; keep panel placement and resize behavior.

ESC always invokes the current window's titlebar close action (including draft discard); it no longer clears the calculator or cancels paragraph edits. Ctrl+Z cancels an uncommitted paragraph filename before falling back to file undo. Ctrl+Q quits the current program's windows and returns to desktop; pending changes require the red yes/no prompt: Something unsaved, still leave? Other programs are hidden, not closed.


## 2026-10-17: unified dragging and frameless interaction states

- Every genuine object drag, with either mouse button, uses the shared CabanonDragFeedback renderer in home/drag-tether.js. There is exactly one origin-to-pointer line and one action hint. Rendering, clamping, color, threshold and cleanup are common; targets supply action labels only. No per-object line-display settings remain.
- Blank-space rectangular selection and text selection are selection gestures, not object drags. They do not draw a drag line. File/paragraph controls distinguish object movement from text-range selection.
- River homepage: right drag any message fragment in any direction to repost it. The shared line and Repost hint appear once the drag threshold is reached. No column/destination dependency or drag-to-open-original behavior remains.
- Hover and committed selection never add outline frames. Remove keyboard focus rings and dragging outlines, including Shift-click and Shift-arrow states. Existing gray hover surfaces and identity-link emphasis remain; structural window/input borders and the live selection marquee are distinct and remain where specified.
- Escape cancels an active shared drag before applying the existing close-window behavior.


## 2026-10-17: file drag buttons replace modifier actions

- Files and folders: left-button drag moves; right-button drag copies. This is independent of directory ancestry and Ctrl/Alt state.
- Within the source directory: left dragging changes manual order only; right dragging creates a new duplicate and inserts it at the drop position.
- Ctrl-drag, Alt-drag and Ctrl+Alt-drag behaviors are deleted from operation dispatch and synthetic drag events. Clipboard Cut/Copy/Paste retain their keyboard shortcuts and now pass explicit move/copy operations internally.
- Copies use uniqueName: suffix ` (1)`, ` (2)`, etc., immediately before the final extension; no extension means append the suffix. The first available positive integer is used. Copying an already numbered name nests the suffix, for example `notes (1) (1).txt`. File entry names are currently unique across the prototype, not only within one directory; folders use full-path names.
- Folder moves update descendant folder paths and directory references. A target folder-name collision uses the same suffix policy; no destination content is overwritten.

- Self-drop protection: every selected dragged item is excluded as a destination, for both buttons and both single/multi-selection. Protected self/descendant targets cannot fall back to insertion sorting. Folder drops into the folder itself or descendants are rejected. ZIP self-reference and indirect archive cycles are rejected both on file rows and in open archive windows, with mutation-side checks. Small drags inside the source label do nothing and display `Can't`.


## File drag hint format

- A single object shows its full basename, visually limited to 20 monospace letter widths; longer names end with literal `...` within that width.
- Multiple files with one shared extension: `.ext xN`; folders only: `/ xN`; mixed types: `xN`.
- The hint is `summary >   destination`. Right-button copying adds exactly `+ ` before the same summary. No Move/Copy words remain in file drag hints. Source and action descriptions come from one formatter for folder, ZIP, paragraph and attachment targets.
- Verified real left/right file drags, all summary categories, the 20-character-width cutoff, the copy prefix and unchanged move/copy behavior.

## 2026-10-17: welcome and unified drag feedback

- Startup welcome is a content-width, 28px-high L5 box with L1 text. It stays after typing completes, until any pointer/keyboard/wheel action. It never covers the full desktop.
- Invalid object drops show only `Can't`: L9 fill, L5 text, no border and no prohibition icon. Self and descendant targets remain invalid in paragraph mode for both buttons.
- Same-folder file sorting uses `summary >` with no directory. Right copying adds `+ `. Paragraph sorting retains horizontal insertion and paragraph-break handling.
- Selected/inverted option icons retain their original L6 or explicit file-mark color.
- Escape dismisses an open context menu before closing a window. Outside clicks, keys, wheel/scroll, drag starts and window blur dismiss the context menu.
- Moving the desktop object shows `Still here`. From app/folder/system/widget reordering has the shared line but no content hint.
- Element focus changes never cancel the shared line; actual window blur still cancels dragging.

- Latest adjustment: startup welcome survives mouse motion and scrolling; it dismisses only on keyboard or mouse-button press. River content has no shared 8px bottom/right gutter, so the writing button and composer meet the window interior bottom edge.

- Invalid drag hint now displays uppercase X with exactly three preserved spaces on each side (`   X   `); L9 background, L5 text and no border remain unchanged.

- Native text selection uses theme colors throughout the app: L5 fill/L1 text on dark surfaces; the light River composer reverses these to L1 fill/L5 text. Browser-default blue/white selection is replaced.

- Menu actions that own a complete confirmation flow can declare `managesConfirmation`, preventing a duplicate generic Clear/Delete confirmation. Other menu actions retain the existing automatic confirmation rules.

## Unified close mark size

- Every UI close/remove/clear-color × uses the titlebar's exact close path and 20×20px SVG geometry. Code-mode close marks use the same size.
- Text-based controls retain the original hidden glyph slot and place the SVG over its center, preserving button dimensions, inline width, line height, adjacent positions and inherited color/hover colors. Existing titlebar controls keep their centered flex layout.
- Covered: all window/dialog closes, code exit, both color-mark clear builders, River ordinary/repost drafts, Rive pending quotes and removable attachments. Mathematical multiplication symbols and prose retain their typography.

- The time widget keeps its 127px width and two 56px rows: HH:MM on top; large AM/PM below (12-hour mode only) beside left-aligned 12px date and weekday on separate lines. Calendar and period use the selected clock time zone. In 24-hour mode there is no period; the calendar remains two left-aligned lines.
- Invalid dragging now renders the shared 20px titlebar close SVG instead of the X letter, retaining three spaces on each side, L9 fill and L5 icon color.


## Save / saved — universal rule (2026-10-19)

Every current or future Save control follows the same lifecycle: successful save → label `saved`, L6 gray, disabled. Editing saved content → label `save`, enabled. Navigation and focus changes alone do not make a document dirty. Save failures and cancelled save/overwrite dialogs do not mark a document saved. Use `setFileSaveButton` in `home/save-button-label.js` with document-level change tracking.
