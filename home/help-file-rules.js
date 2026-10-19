'use strict';
function helpRuleSection(article,title,paragraphs,rows){const heading=document.createElement('h2');heading.textContent=title;article.append(heading);for(const text of paragraphs){const p=document.createElement('p');p.textContent=text;article.append(p);}if(rows){const table=document.createElement('table');table.className='help-rule-table';for(const cells of rows){const row=document.createElement('tr');for(const text of cells){const cell=document.createElement('td');cell.textContent=text;row.append(cell);}table.append(row);}article.append(table);}}
function renderRenameHelp(article){
 helpRuleSection(article,'Rename',[
  'Select files, then Ctrl+Enter. One file is renamed in place; Enter commits and Escape cancels. Multiple files open the batch window. Rules edit the base name; file extensions, including .tar.gz, remain unchanged.',
  'The left column contains rules, executed from top to bottom. + adds a rule; the up/down buttons beside find change its position. Editing a rule activates it. The right column previews original and resulting names. Changed results use L5; originals use L6. OK applies valid changes; cancel discards them.',
  'Hold a file icon in the right preview with the left mouse button and drag vertically to reorder the files. Text is not a reorder handle. The new order controls /q numbering and automatic duplicate suffixes. Reordering changes only this batch, not the folder’s sort order. Escape during dragging restores the previous order.'
 ]);
 helpRuleSection(article,'FIND: what to match',[
  'An empty find matches the whole base name. Ordinary text matches literally and is case-sensitive. A pattern is contiguous, including any spaces. Matches are found left to right without overlap: /n/n finds pairs of digits; /n /n finds digit–space–digit; /2?? finds the second nonoverlapping pair of characters.'
 ],[
  ['/n','One ASCII digit, 0–9'],['/a','One English letter, A–Z or a–z'],['/c','One CJK letter, including Chinese, kana and Hangul; not punctuation'],['/i','One legal character other than an ASCII digit, English letter or CJK letter; includes spaces and punctuation'],['/s','One ordinary space; a literal space also works'],['?','Any one character; use ?, not /?'],['/d','A valid calendar date: YYYY-MM-DD, YYYY.MM.DD, YYYY_MM_DD or YYYYMMDD. It does not read file metadata.'],['/Npattern','The Nth occurrence, starting at 1. /2ABC = second ABC; /2/n = second digit; /22/n = 22nd digit.'],['/N:digits','Use : when the literal pattern begins with a digit: /2:2026 = second occurrence of 2026.'],['\\pattern','Complement: characters outside the matched positions. \\/n = all nondigits; \\/2/n = everything except the second digit.'],['pattern|pattern','Union of independent patterns. /2/n|/a = second digit plus all English letters. Overlapping positions are processed once.']
 ]);
 helpRuleSection(article,'Actions: what to do',[],[
  ['↓ Replace','Replace the found range with the output. Empty output deletes the match. If FIND returns multiple ranges, remove those ranges and put the replacement once at the beginning of the base name.'],['+| Add before','Add output before each matched range. Empty FIND inserts at the beginning of the base name.'],['|+ Add after','Add output after each matched range. Empty FIND inserts at the end of the base name, before the extension.'],['AA','Convert matched text to uppercase.'],['aa','Convert matched text to lowercase.'],['Aa','Capitalize word initials and lowercase the remaining matched letters.'],['][ Merge','Merge adjacent repeated matching characters into one. It does not merge nonadjacent repetitions.']
 ]);
 helpRuleSection(article,'Output and sequence numbers',[
  'FIND instructions belong in find, not in output. For example, /n matches digits in find; entering /n as output does not generate digits and produces an invalid name. Output is ordinary literal text except for /q.',
  '/q generates 1, 2, 3… in the right-side file order. /q/q pads to at least two digits (01, 02…); /q/q/q pads to three digits (001…). Values longer than the padding are not truncated. Generated digits are protected from FIND in later rules.',
  'Example: find left empty, choose Replace, enter Photo_/q/q. The preview becomes Photo_01.txt, Photo_02.txt… with each original extension preserved. Drag the preview icons to change which file receives each number.',
  'Each rule uses the result of the preceding rule. No match leaves the current name unchanged. A valid preview is required before OK can apply the batch.'
 ]);
 helpRuleSection(article,'Valid names and duplicate results',[
  'Empty names and extension-only names are forbidden: please name it. Leading/trailing spaces are removed; interior spaces are preserved. Tab, newline, carriage return and Unicode line/paragraph separators are forbidden, even at the beginning or end.',
  'Forbidden filename characters: \\ / : * ? " < > | and control characters. Windows reserved device names and trailing dots are forbidden. Each filename component has a maximum of 255 UTF-8 bytes. Names are normalized to NFC; collisions use Unicode case folding.',
  'The same name may exist in different folders. In a batch, equal resulting names are allowed: conflicts within the destination folder automatically receive _1, _2, _3… before the extension. Existing files are never overwritten; occupied suffixes are skipped. The preview and OK use the same numbering rules.'
 ]);
}
const folderHelpBeforeMouseRules=renderFolderPointerHelp;
renderFolderPointerHelp=function(article){folderHelpBeforeMouseRules(article);
 helpRuleSection(article,'Mouse operations in folders',[],[
  ['Left click','Select the whole option, including padding. Shift selects a range; Ctrl toggles one file; Ctrl+Shift adds a range.'],['Right click','Selected or unselected file: the whole option, including blank padding. Only actual folder background opens the folder menu. Any key closes the menu; right-click modifiers do not add separate menu actions.'],['Left drag','Move/sort selected files. An already-selected L5 option is a full drag handle; otherwise start on its icon/name.'],['Right drag','Copy and keep originals. Same start/target hit areas as left dragging. Icon/name means a continuous full-height band from option left to the visible text/icon right edge; the width is limited, not the height. A moved right gesture never opens a context menu.'],['Left whitespace box','Select. Ctrl appends; after drawing a rectangle, Shift temporarily shears it with a fixed width. Releasing Shift restores the rectangle.'],['Alt + left whitespace box','Radial sweep: fixed origin, union of swept triangles. Retracing does not erase earlier area.'],['FROM + left whitespace box','Free lasso: follows the mouse trajectory and closes it to the starting point. It is not the radial triangle union. FROM takes priority over Alt.'],['Right whitespace box','Execute the chosen RIGHT! action on release: move into a new folder (>/), copy into one (+>/), move into a new ZIP (> zip), copy into one (+> zip), or delete. Ctrl appends the existing selection.'],['Shift + delete box','When RIGHT! uses delete, holding Shift changes it to burn with a red confirmation. Shift+Delete also burns selected files.'],['Folder / ZIP destination','Only the target icon/name is active. Its selected L5 padding never expands the destination. Background dropping/sorting remains separate.'],['Escape','Cancel a drag or selection and restore its previous state. Releasing afterward performs no action.']
 ]);
 helpRuleSection(article,'Navigation while dragging',[
  'Hover a valid target folder for one second to enter it; repeat to continue through folders. Hover ←, → or ↑ for one second to navigate without releasing. Invalid self/descendant targets cannot be entered.',
  'Drop on the new-folder or ZIP item in the top menu to move the files there; right dragging copies instead. Left drop on blank title-bar space opens batch Info; right drop on the title bar opens batch Rename. Other invalid buttons show X.',
  'Shape selection only examines the initially visible area. Scrolling is locked while selecting. Alt or FROM may be released after the shape starts without changing its mode or opening a sidebar. Plain Ctrl/Alt sidebar taps require a press–release sequence without any intervening mouse movement, click, wheel or other key.'
 ]);
};
const helpBeforeRenameRules=openHelp;
openHelp=function(){const win=helpBeforeRenameRules(),nav=win.querySelector('.help-reader nav'),article=win.querySelector('.help-reader article');if(![...nav.children].some(n=>n.dataset.renameHelp)){const button=document.createElement('button');button.dataset.renameHelp='true';button.textContent='Rename';button.onclick=()=>{for(const n of nav.children)n.setAttribute('aria-pressed',String(n===button));article.replaceChildren();renderRenameHelp(article);};nav.append(button);}return win;};
function riverHelpTopic(){return{id:'cabanon-river-repost-v1',title:'RIVER',text:[
 'RIVER — repost and dragging',
 '',
 'Click Repost to open the repost input as before.',
 '',
 'Hold the right mouse button on a post fragment and move it. In the two-column view, drag from left to right or from right to left to repost. Dragging within the original side shows a red X and releasing does nothing.',
 '',
 'Drag back to the original side if you change your mind. The hint returns to the red X; releasing cancels without opening a repost draft. Escape also cancels the drag.',
 '',
 'The big + is also a Repost destination in both two-column and single-column views. Hold the dragged post over + and release. The repost input opens and receives keyboard focus immediately, so you can start typing.',
 '',
 'In single-column view, use the big + or click Repost. A hidden column does not count as a destination.',
 '',
 'Dragging to the rive navigation icon uses Share; dragging to canal uses Pub. These targets keep their own actions. A right drag never opens the stationary copy / share / repost menu.',
 '',
 'The small icon in the RIVER title bar uses the flow/care flow shape. It remains static; FROM hover and DOCK focus retain their separate app-icon animation rules.'
 ].join('\n')};}
function folderPointerHelpTopic(){return{id:'cabanon-folder-pointer-ranges-v1',title:'选择与拖拽范围',text:[
 '文件夹：选择与拖拽范围',
 '',
 '以下规则适用于文件夹的列表、详细信息和段落视图，左右键使用同一套范围定义。',
 '',
 '什么是“图标文字区域”？',
 '它是一个连续矩形，不是图标和文字笔画的实际轮廓。高度与整个选项框相同；宽度从选项框左边缘开始，到可见文件名或图标的最右端为止。',
 '这个矩形内，文字上方和下方的空白、图标与文字之间的空隙，都算点击到图标文字区域。它与整个选项框只有宽度区别，高度相同。',
 '文字右端之外、仍在选项框内的部分才是“选项内空白”。文件名越短，右侧越容易找到框选起点。段落视图的选项宽度可能正好容纳文字和图标，此时应在选项之间或文件夹背景开始框选。',
 '',
 '操作范围表',
 '',
 '1. 左键单击选择',
 '未选中：整个选项框。',
 '已选中的 L5 选项：整个选项框。',
 '',
 '2. 右键单击文件菜单',
 '未选中：整个选项框，包括文件名右侧的空白。',
 '已选中的 L5 选项：整个 L5 区域。',
 '',
 '3. 左键按住移动',
 '未选中：从图标文字区域起拖。',
 '已选中的 L5 选项：整个 L5 区域都能起拖。',
 '',
 '4. 右键按住移动',
 '未选中：从图标文字区域起拖。',
 '已选中的 L5 选项：整个 L5 区域都能起拖。',
 '',
 '5. 左右键框选起点',
 '未选中：选项内图标文字区域右侧的空白，或文件夹真正的空白背景。',
 '已选中的 L5 选项：L5 内不框选，移动会拖拽选中的文件。要框选，请从 L5 之外的空白开始。',
 '',
 '6. 拖入文件夹／ZIP 的行为目标',
 '无论目标是否选中：仅目标的图标文字区域有效。',
 '即使目标显示 L5 底色，文件名右侧的 L5 空白也不是进入文件夹或加入 ZIP 的目标。这里说的是放下鼠标的位置，不是拖拽起点。',
 '',
 '点击与移动分开判断',
 '按下时记录位置，移动达到 6px 才进入拖拽或框选；未达到阈值按单击处理。起点决定本次操作，划过其他文件不会把框选改成拖拽。',
 '因此，在未选中选项右侧空白处，右键单击会打开文件菜单；按住移动则开始框选。这两个行为并不冲突。',
 '左键拖拽用于移动／排序，右键拖拽用于复制。右键一旦拖动，松开不再弹出文件菜单。',
 '拖拽或框选期间按 Esc 取消；松开鼠标不执行操作。文件夹背景放置、排序、顶部按钮目标继续遵循各自原有规则。'
 ].join('\n')};}
