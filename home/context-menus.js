'use strict';
// Central context-menu registry. Replaces the scattered showContext wrappers.
// Loaded last so this showContext is the final one.

// ── Context types ──────────────────────────────────────────────────────────
const CTX = {
  DESKTOP_LINK: 1, DESKTOP_BG: 2, FOLDER_BG: 3,
  FROM_APP: 4, FROM_FOLDER: 5,
  FILE: 6, FILES: 7, FOLDER: 8, FOLDERS: 9,
  ALL_APP: 10, FILE_LINK: 11, FOLDER_LINK: 12,
  ZIP: 13, ZIP_LINK: 14,
  TRASH: 15, DOCK: 16, WIDGET: 17, ARCHIVE: 18, NAV: 19, FROM_FILE: 20,
};

// ── Resolver ───────────────────────────────────────────────────────────────
const fileContextRows='[data-entry],[data-file],[data-folder],[data-search-file],[data-archive-file],[data-app]';
function resolveContext(event) {
  const t = event.target;
  const row=t.closest(fileContextRows);
  if(row&&!fileClickHit(event,row)){
    const win=row.closest('.window[data-file-browser]');
    if(win&&row.closest('.house-file-list'))return{type:CTX.FOLDER_BG,path:win.dataset.fileBrowser};
    if(row.closest('#files'))return{type:CTX.DESKTOP_BG};
    return null;
  }
  // Trash icon
  if (t.closest('[data-system=trash]')) return { type: CTX.TRASH };
  // Dock / taskbar
  const dockBtn = t.closest('#taskbar [data-type]');
  if (dockBtn) return { type: CTX.DOCK, dockType: dockBtn.dataset.type };
  // Widget bar or system area background
  if (t.closest('#widgets')) return { type: CTX.WIDGET };
  const sys = t.closest('.system');
  if (sys && !t.closest('#system-icons, #all-toggle, .clock, .weather')) return { type: CTX.WIDGET };
  // Archive entry
  const archEntry = t.closest('[data-archive-file]');
  if (archEntry) return { type: CTX.ARCHIVE, name: archEntry.dataset.archiveFile };
  // Nav panel
  const navItem = t.closest('.house-navigation [data-nav],.house-navigation [data-tree-file]');
  if (navItem && !navItem.closest('.tree-scroll-body')&&fileContentHit(event,navItem)) return { type: CTX.NAV, nav: navItem.dataset.nav, treeFile: navItem.dataset.treeFile };
  // All-apps grid
  const appItem = t.closest('#app-grid [data-app]');
  if (appItem) return { type: CTX.ALL_APP, name: appItem.dataset.app };
  // From panel — apps
  const fromApp = t.closest('#pinned [data-app]');
  if (fromApp) return { type: CTX.FROM_APP, name: fromApp.dataset.app };
  const fromFile = t.closest('#recent-files [data-search-file]');
  if (fromFile) return { type: CTX.FROM_FILE, name: fromFile.dataset.searchFile };
  // From panel — folders
  const fromFolder = t.closest('#folders [data-folder]');
  if (fromFolder) return { type: CTX.FROM_FOLDER, name: fromFolder.dataset.folder };
  // Desktop file links
  const deskFile = t.closest('#files [data-file]');
  if (deskFile) return { type: CTX.DESKTOP_LINK, name: deskFile.dataset.file };
  // Desktop background
  if (t.closest('#desktop') && !t.closest('.window') && !t.closest('#from') && !t.closest('#all-apps') && !t.closest('#taskbar') && !t.closest('#home-status')) return { type: CTX.DESKTOP_BG };
  // Folder window entries
  const entryEl = t.closest('[data-entry]');
  if (entryEl) {
    const list = entryEl.closest('.house-file-list');
    if (!list) return { type: CTX.FILE, names: [entryEl.dataset.entry], list };
    const sel = selectionState(list);
    const clickedName = entryEl.dataset.entry;
    const names = sel.selected.has(clickedName) ? [...sel.selected] : [clickedName];
    const entriesByName = new Map(prefs.entries.map(entry => [entry.name, entry]));
    const entries = names.map(name => entriesByName.get(name)).filter(Boolean);
    if (!entries.length) return { type: CTX.FILE, names: [clickedName], list };
    const allFolders = entries.every(e => e.folder);
    const allFiles = entries.every(e => !e.folder);
    const allShortcuts = entries.every(e => e.shortcut);
    const allZips = entries.every(e => !e.folder && (e.name.endsWith('.zip') || (e.shortcut && e.target?.endsWith('.zip'))));
    const path = list.dataset.path;
    const info = { names, entries, list, path };
    if (allShortcuts && allZips) return { type: CTX.ZIP_LINK, ...info };
    if (allZips && allFiles) return { type: CTX.ZIP, ...info };
    if (allShortcuts && allFolders) return { type: CTX.FOLDER_LINK, ...info };
    if (allShortcuts && allFiles) return { type: CTX.FILE_LINK, ...info };
    if (allFolders && names.length > 1) return { type: CTX.FOLDERS, ...info };
    if (allFolders) return { type: CTX.FOLDER, ...info };
    if (allFiles && names.length > 1) return { type: CTX.FILES, ...info };
    if (allFiles) return { type: CTX.FILE, ...info };
    // Mixed selection — treat as files
    return { type: names.length > 1 ? CTX.FILES : CTX.FILE, ...info };
  }
  // Folder window background
  const folderWin = t.closest('.window[data-file-browser] .window-content');
  if (folderWin && !t.closest('input,textarea,button,.house-navigation,.details-head,.code-surface')) return { type: CTX.FOLDER_BG, path: folderWin.closest('.window').dataset.fileBrowser };
  return null;
}

// ── Shared helpers ─────────────────────────────────────────────────────────
const markSwatchList = [
  ['L7', '#10a53b'], ['L8', '#ff880a'], ['L9', '#c5173e'],
  ['L10', '#ffb3c1'], ['L11', '#08c5eb'], ['L12', '#999efa'],
];
function openInShell() { toast('Open in — not yet available'); }
function shareShell() { toast('Share — not yet available'); }
function pauseSyncShell(path) { toast('Pause sync — not yet available'); }
function showUnzipShell(entry) { toast('Unzip — not yet available'); }
function pasteItem(path) {return ['Paste',()=>pasteSelectedFiles(path),fileClipboard.length===0];}

// ── Link destinations flyout ───────────────────────────────────────────────
function showLinkDestinations(button, names) {
  const existing = document.querySelector('.pin-destinations');
  if (existing) existing.remove();
  const menu = document.createElement('div');
  menu.className = 'pin-destinations';
  for (const [label, dest] of [['here', 'here'], ['from page', 'from'], ['wall', 'desktop']]) {
    const item = document.createElement('button');
    item.textContent = label;
    item.onclick = () => { closeContext(); pinDestination(names, dest); };
    menu.append(item);
  }
  context.append(menu);
  placeFlyout(menu, button);
  button.onpointerleave = event => { if (!menu.contains(event.relatedTarget)) menu.remove(); };
  menu.onpointerleave = event => { if (!button.contains(event.relatedTarget)) menu.remove(); };
}

// ── Select flyout ──────────────────────────────────────────────────────────
function showSelectFlyout(button, list) {
  const existing = document.querySelector('.select-flyout');
  if (existing) existing.remove();
  const menu = document.createElement('div');
  menu.className = 'select-flyout';
  const state = selectionState(list);
  const allItems = listItems(list);
  const allSelected = state.selected.size === allItems.length && allItems.length > 0;
  if (!allSelected) {
    const btn = document.createElement('button');
    btn.textContent = 'All';
    btn.onclick = () => { allItems.forEach(item => state.selected.add(itemName(item))); paintSelection(list); menu.remove(); };
    menu.append(btn);
  }
  if (state.selected.size > 0) {
    const btn = document.createElement('button');
    btn.textContent = 'Invert';
    btn.onclick = () => { allItems.forEach(item => { const n = itemName(item); if (state.selected.has(n)) state.selected.delete(n); else state.selected.add(n); }); paintSelection(list); menu.remove(); };
    menu.append(btn);
    const btn2 = document.createElement('button');
    btn2.textContent = 'Deselect';
    btn2.onclick = () => { state.selected.clear(); state.anchor = state.current = null; paintSelection(list); menu.remove(); };
    menu.append(btn2);
  }
  context.append(menu);
  placeFlyout(menu, button);
  button.onpointerleave = event => { if (!menu.contains(event.relatedTarget)) menu.remove(); };
  menu.onpointerleave = event => { if (!button.contains(event.relatedTarget)) menu.remove(); };
}

function placeFlyout(menu, anchor) { placeHoverMenu(menu, anchor); }

// ── Menu builders ──────────────────────────────────────────────────────────
const builders = {};

// 1. Desktop link
builders[CTX.DESKTOP_LINK] = (event, info) => {
  const name = info.name;
  const entry = prefs.entries.find(e => e.name === name);
  const items = [
    ['Open', () => openFile(name)],
    ['Open path', () => { if (entry?.shortcut) openFolderBrowser(entry.parent); else openFolderBrowser('/house'); }],
    ['Unlink', () => { prefs.recents = prefs.recents.filter(i => i.name !== name); if (entry?.shortcut) { prefs.entries = prefs.entries.filter(e => e !== entry); prefs.files = prefs.files.filter(f => f !== name); } persistProfiles(); refreshBrowsers(); renderDesktop(); }],
    ['Info', () => showInfo(name)],
  ];
  items._markNames = [name];
  return items;
};

// 2. Desktop background
builders[CTX.DESKTOP_BG] = () => {
  const sort = prefs.desktopSort;
  const dir = sort?.direction === 'up' ? ' \u2191' : ' \u2193';
  const items = [
    ['Paste', () => { if (fileClipboard.length) fileClipboard.forEach(entry => transferFiles([entry.name], entry.parent, '/house', { action: 'copy' })); }, fileClipboard.length === 0],
    ['New', (_event,button) => showNewTypes(button,'/house')],
    ['Name' + (sort?.key === 'name' ? dir : ''), () => toggleDesktopSort('name')],
    ['Type' + (sort?.key === 'type' ? dir : ''), () => toggleDesktopSort('type')],
    ['Date' + (sort?.key === 'date' ? dir : ''), () => toggleDesktopSort('date')],
    ['Size' + (sort?.key === 'size' ? dir : ''), () => toggleDesktopSort('size')],
    ['Clear all\u2026', () => confirmRemoval('Clear all wall shortcuts', () => { prefs.desktopLinks = []; prefs.desktopOrder = []; persistProfiles(); renderDesktop(); })],
    ['Display setting', () => openSpecificSettings('display')],
  ];
  return items;
};

function toggleDesktopSort(key) {
  const sort = prefs.desktopSort || {};
  if (sort.key === key) sort.direction = sort.direction === 'down' ? 'up' : 'down';
  else { sort.key = key; sort.direction = 'down'; }
  prefs.desktopSort = sort;
  persistProfiles(); renderDesktop();
}

// 3. Folder background
builders[CTX.FOLDER_BG] = (event, info) => {
  const path = info.path;
  const view = folderView(path);
  const items = [
    ['List', () => { view.mode = 'list'; refreshFolderViews(); }],
    ['Details', () => { view.mode = 'details'; refreshFolderViews(); }],
    ['¶', () => { view.mode = view.mode==='paragraph'?'list':'paragraph'; refreshFolderViews(); }],
    ['Name' + (view.sort === 'name' ? (view.dir === 'down' ? ' \u2193' : ' \u2191') : ''), () => sortFolder(path, 'name')],
    ['Type' + (view.sort === 'type' ? (view.dir === 'down' ? ' \u2193' : ' \u2191') : ''), () => sortFolder(path, 'type')],
    ['Date' + (view.sort === 'date' ? (view.dir === 'down' ? ' \u2193' : ' \u2191') : ''), () => sortFolder(path, 'date')],
    ['Size' + (view.sort === 'size' ? (view.dir === 'down' ? ' \u2193' : ' \u2191') : ''), () => sortFolder(path, 'size')],
    ['More\u2026', () => moreSorting(path)],
    pasteItem(path),
    ['Undo', () => undoFolderOperation()],
    ['New', (_event,button) => showNewTypes(button,path)],
    ['Info', () => folderInfo(path)],
  ];
  items._markNames = [path];
  return items;
};

// 4. From app
builders[CTX.FROM_APP] = (event, info) => {
  const name = info.name;
  const pinned = prefs.pins.includes(name);
  return [
    ['Open', () => openApp(name)],
    [pinned ? 'Unlink' : 'Link', () => { if (pinned) { prefs.pins = prefs.pins.filter(i => i !== name); } else { prefs.pins.push(name); } persistProfiles(); renderPins(); }],
    ['Info', () => showInfo(name)],
    ['Setting', () => openSpecificSettings(name)],
    ...(canRemoveApplication(name)?[['remove', () => { closePanels(); removeApplication(name); }]]:[]),
  ];
};

// 5. From folder
builders[CTX.FROM_FILE] = (event, info) => {
 const name=info.name;
 return [
  ['open',()=>openFile(name)],
  ['open path',()=>{const entry=renameSource(name);if(entry)openFolderBrowser(entry.parent);}],
  ['unpin',()=>{prefs.fromFilePins=(prefs.fromFilePins||[]).filter(n=>n!==name);prefs.recents=prefs.recents.filter(record=>record.name!==name);persistProfiles();renderPins();}],
  ['to wall',()=>toDesktop(name)],
  ['info',()=>showInfo(name)]
 ];
};
builders[CTX.FROM_FOLDER] = (event, info) => {
 const name=info.name;
 return [
  ['open',()=>openFile(name)],
  ['unpin',()=>{prefs.folders=prefs.folders.filter(n=>folderPath(n)!==folderPath(name));persistProfiles();renderPins();}],
  ['to wall',()=>toDesktop(name)],
  ['info',()=>showInfo(name)]
 ];
};

// 7. File (single)
builders[CTX.FILE] = (event, info) => {
  const { names, list, path } = info;
  const name = names[0];
  const items = [
    ['Open', () => openFile(name)],
    ['Open in\u2026', () => openInShell()],
    ['Select\u2026', (event, button) => showSelectFlyout(button, list)],
    ['Cut', () => { fileClipboard = names.map(n => ({ name: n, parent: path })); folderCut = true; }],
    ['Copy', () => { fileClipboard = names.map(n => ({ name: n, parent: path })); folderCut = false; }],
    pasteItem(path),
    ['Rename', () => renameEntries(names)],
    ['Share\u2026', () => shareShell(names)],
    ['Link', (event, button) => showLinkDestinations(button, names)],
    ['Unlink', () => unlinkAll(names)],
    ['Copy path', () => copyPathText(names.map(n => { const e = prefs.entries.find(i => i.name === n); return e?.folder ? folderPath(n) : e ? e.parent + '/' + n : n; }).join('\n'))],
    ['Zip', () => zipEntries(names, path)],
    ['Delete', () => { names.forEach(n => deleteFile(n)); }, false],
    ['Info', () => showInfo(name)],
  ];
  items._markNames = names;
  return items;
};

// 8. Multiple files
builders[CTX.FILES] = (event, info) => {
  const { names, list, path } = info;
  const items = [
    ['Open', () => { if (names.length > 10) { confirmRemoval('Open ' + names.length + ' files?', () => names.forEach(n => openFile(n))); } else names.forEach(n => openFile(n)); }],
    ['Open in\u2026', () => openInShell()],
    ['Select\u2026', (event, button) => showSelectFlyout(button, list)],
    ['Cut', () => { fileClipboard = names.map(n => ({ name: n, parent: path })); folderCut = true; }],
    ['Copy', () => { fileClipboard = names.map(n => ({ name: n, parent: path })); folderCut = false; }],
    pasteItem(path),
    ['Rename', () => renameEntries(names)],
    ['Share\u2026', () => shareShell(names)],
    ['Link', (event, button) => showLinkDestinations(button, names)],
    ['Unlink', () => unlinkAll(names)],
    ['Copy path', () => copyPathText(names.map(n => { const e = prefs.entries.find(i => i.name === n); return e ? e.parent + '/' + n : n; }).join('\n'))],
    ['Zip', () => zipEntries(names, path)],
    ['Delete', () => { names.forEach(n => deleteFile(n)); }, false],
    ['Info', () => showInfo(names)],
  ];
  items._markNames = names;
  return items;
};

// 9. Folder (single)
builders[CTX.FOLDER] = (event, info) => {
  const { names, list, path } = info;
  const name = names[0];
  const folder = folderPath(name);
  const synced = typeof syncMembers === 'function' && syncMembers(folder).length > 0;
  const items = [
    ['Open', () => openFolderBrowser(folder)],
    ['Open+', () => openFolderBrowser(folder, true)],
    ['Select\u2026', (event, button) => showSelectFlyout(button, list)],
    ['Cut', () => { fileClipboard = names.map(n => ({ name: n, parent: path })); folderCut = true; }],
    ['Copy', () => { fileClipboard = names.map(n => ({ name: n, parent: path })); folderCut = false; }],
    pasteItem(folder),
    ['Rename', () => renameEntries(names)],
    ['Share\u2026', () => shareShell(names)],
    ['Link', (event, button) => showLinkDestinations(button, names)],
    ['Unlink', () => unlinkAll(names)],
    ['Copy path', () => copyPathText(folder)],
    ['Zip', () => zipEntries(names, path)],
    [synced ? 'Unsync' : 'Sync\u2026', () => synced ? unsyncFolder(folder) : configureSync(folder)],
    ...(synced ? [['Pause sync', () => pauseSyncShell(folder)]] : []),
    ['Delete', () => folderDelete([name], false), false],
    ['Info', () => showInfo(name)],
  ];
  items._markNames = names;
  return items;
};

// 10. Multiple folders
builders[CTX.FOLDERS] = (event, info) => {
  const { names, list, path } = info;
  const items = [
    ['Open', () => { if (names.length > 10) { confirmRemoval('Open ' + names.length + ' folders?', () => names.forEach(n => openFolderBrowser(folderPath(n)))); } else names.forEach(n => openFolderBrowser(folderPath(n))); }],
    ['Open+', () => names.forEach(n => openFolderBrowser(folderPath(n), true))],
    ['Select\u2026', (event, button) => showSelectFlyout(button, list)],
    ['Cut', () => { fileClipboard = names.map(n => ({ name: n, parent: path })); folderCut = true; }],
    ['Copy', () => { fileClipboard = names.map(n => ({ name: n, parent: path })); folderCut = false; }],
    pasteItem(path),
    ['Rename', () => renameEntries(names)],
    ['Share\u2026', () => shareShell(names)],
    ['Link', (event, button) => showLinkDestinations(button, names)],
    ['Unlink', () => unlinkAll(names)],
    ['Copy path', () => copyPathText(names.map(n => folderPath(n)).join('\n'))],
    ['Zip', () => zipEntries(names, path)],
    ['Sync\u2026', () => configureSync(folderPath(names[0]))],
    ['Delete', () => folderDelete(names, false), false],
    ['Info', () => showInfo(names)],
  ];
  items._markNames = names;
  return items;
};

// 11. All apps grid item
builders[CTX.ALL_APP] = (event, info) => {
  const name = info.name;
  const pinned = prefs.pins.includes(name);
  return [
    ['Open', () => { closePanels(); openApp(name); }],
    [pinned ? 'Unlink' : 'Link', () => { if (pinned) prefs.pins = prefs.pins.filter(i => i !== name); else prefs.pins.push(name); persistProfiles(); renderPins(); }],
    ['Info', () => showInfo(name)],
    ['Setting', () => openSpecificSettings(name)],
    ...(canRemoveApplication(name)?[['remove', () => { closePanels(); removeApplication(name); }]]:[]),
  ];
};

// 12. File link (shortcut to a file)
builders[CTX.FILE_LINK] = (event, info) => {
  const { names, list, path } = info;
  const name = names[0];
  const entry = prefs.entries.find(e => e.name === name);
  const target = entry?.target || name;
  const items = [
    ['Open', () => openFile(name)],
    ['Open path', () => { if (entry) openFolderBrowser(entry.parent); }],
    ['Select\u2026', (event, button) => showSelectFlyout(button, list)],
    ['Cut', () => { fileClipboard = names.map(n => ({ name: n, parent: path })); folderCut = true; }],
    ['Copy', () => { fileClipboard = names.map(n => ({ name: n, parent: path })); folderCut = false; }],
    pasteItem(path),
    ['Rename', () => renameEntries(names)],
    ['Unlink', () => unlinkAll(names)],
    ['Copy path', () => copyPathText(path + '/' + name)],
    ['Copy file path', () => copyPathText(target)],
    ['Delete', () => { names.forEach(n => deleteFile(n)); }, false],
    ['Info', () => showInfo(name)],
  ];
  items._markNames = names;
  return items;
};

// 13. Folder link (shortcut to a folder)
builders[CTX.FOLDER_LINK] = (event, info) => {
  const { names, list, path } = info;
  const name = names[0];
  const entry = prefs.entries.find(e => e.name === name);
  const target = entry?.target || name;
  const items = [
    ['Open', () => openFile(name)],
    ['Open path', () => { if (entry) openFolderBrowser(entry.parent); }],
    ['Select\u2026', (event, button) => showSelectFlyout(button, list)],
    ['Cut', () => { fileClipboard = names.map(n => ({ name: n, parent: path })); folderCut = true; }],
    ['Copy', () => { fileClipboard = names.map(n => ({ name: n, parent: path })); folderCut = false; }],
    pasteItem(path),
    ['Rename', () => renameEntries(names)],
    ['Unlink', () => unlinkAll(names)],
    ['Copy path', () => copyPathText(path + '/' + name)],
    ['Copy file path', () => copyPathText(target)],
    ['Delete', () => { names.forEach(n => deleteFile(n)); }, false],
    ['Info', () => showInfo(name)],
  ];
  items._markNames = names;
  return items;
};

// 14. ZIP file
builders[CTX.ZIP] = (event, info) => {
  const { names, list, path } = info;
  const name = names[0];
  const items = [
    ['Open', () => openFile(name)],
    ['Open in\u2026', () => openInShell()],
    ['Select\u2026', (event, button) => showSelectFlyout(button, list)],
    ['Cut', () => { fileClipboard = names.map(n => ({ name: n, parent: path })); folderCut = true; }],
    ['Copy', () => { fileClipboard = names.map(n => ({ name: n, parent: path })); folderCut = false; }],
    pasteItem(path),
    ['Rename', () => renameEntries(names)],
    ['Share\u2026', () => shareShell(names)],
    ['Link', (event, button) => showLinkDestinations(button, names)],
    ['Unlink', () => unlinkAll(names)],
    ['Copy path', () => copyPathText(path + '/' + name)],
    ['Zip', () => zipEntries(names, path)],
    ['Unzip >', () => showUnzipShell(prefs.entries.find(e => e.name === name))],
    ['Delete', () => { names.forEach(n => deleteFile(n)); }, false],
    ['Info', () => showInfo(name)],
  ];
  items._markNames = names;
  return items;
};

// 15. ZIP file link
builders[CTX.ZIP_LINK] = (event, info) => {
  const { names, list, path } = info;
  const name = names[0];
  const entry = prefs.entries.find(e => e.name === name);
  const target = entry?.target || name;
  const items = [
    ['Open', () => openFile(name)],
    ['Open path', () => { if (entry) openFolderBrowser(entry.parent); }],
    ['Select\u2026', (event, button) => showSelectFlyout(button, list)],
    ['Cut', () => { fileClipboard = names.map(n => ({ name: n, parent: path })); folderCut = true; }],
    ['Copy', () => { fileClipboard = names.map(n => ({ name: n, parent: path })); folderCut = false; }],
    pasteItem(path),
    ['Rename', () => renameEntries(names)],
    ['Unlink', () => unlinkAll(names)],
    ['Copy path', () => copyPathText(path + '/' + name)],
    ['Copy file path', () => copyPathText(target)],
    ['Unzip >', () => showUnzipShell(entry)],
    ['Delete', () => { names.forEach(n => deleteFile(n)); }, false],
    ['Info', () => showInfo(name)],
  ];
  items._markNames = names;
  return items;
};

// ── Non-file context builders ──────────────────────────────────────────────
builders[CTX.TRASH] = () => [
  ['Open', () => openTrash()],
  ['Setting', () => openSpecificSettings('trash')],
];
builders[CTX.DOCK] = (event, info) => { requestDockClose(info.dockType); return []; };
builders[CTX.WIDGET] = () => [
  ['Setting', () => openWidgetSettings()],
];
builders[CTX.ARCHIVE] = (event, info) => [
  ['Delete', () => {
    const win = info.name && document.querySelector('[data-archive-file="' + info.name + '"]')?.closest('.window');
    if (!win) return;
    const key = win.dataset.key;
    const entry = prefs.entries.find(e => key && e.name === key.replace(/^file:/, ''));
    if (entry?.contents) { entry.contents = entry.contents.filter(n => n !== info.name); persistProfiles(); }
  }, false],
];
builders[CTX.NAV] = (event, info) => [
  ['Open', () => {
    const win = event.target.closest('.window');
    if (info.nav) configureFolder(win, info.nav);
    else if (info.treeFile) openFile(info.treeFile);
  }],
];

// ── Unlink helper ──────────────────────────────────────────────────────────
function unlinkAll(names) {
  const targets = new Set();
  for (const name of names) {
    const entry = prefs.entries.find(e => e.name === name);
    if (entry?.shortcut) targets.add(entry.target);
    else targets.add(name);
  }
  prefs.entries = prefs.entries.filter(e => !e.shortcut || !targets.has(e.target));
  prefs.files = prefs.files.filter(n => { const e = prefs.entries.find(x => x.name === n); return !e?.shortcut || targets.has(e.target) ? false : true; });
  prefs.desktopLinks = (prefs.desktopLinks || []).filter(n => !targets.has(n));
  prefs.fromFilePins = (prefs.fromFilePins || []).filter(n => !targets.has(n));
  prefs.folders = prefs.folders.filter(n => !targets.has(n));
  persistProfiles(); refreshBrowsers(); renderDesktop(); renderPins();
}

// ── Info window helper ─────────────────────────────────────────────────────
function showInfo(name) {
  const entry = prefs.entries.find(e => e.name === name);
  const app = apps.find(a => a.name === name);
  let content = '<h1>' + escapeHTML(name.split('/').at(-1)) + '</h1>';
  if (app) {
    content += '<p>License: Prototype</p><p>Size: 4 MB</p><p>Installed: ' + new Date(app.installed).toISOString().slice(0, 10) + '</p>';
  } else if (entry) {
    const size = typeof entrySize === 'function' ? entrySize(entry) : 0;
    const date = typeof entryDate === 'function' ? entryDate(entry) : null;
    if (date) content += '<p>Created: ' + new Date(date).toISOString().slice(0, 10) + '</p>';
    content += '<p>Size: ' + size + ' bytes</p>';
    if (entry.folder) {
      const children = prefs.entries.filter(e => e.parent === folderPath(entry.name) || e.parent.startsWith(folderPath(entry.name) + '/'));
      const byType = {};
      children.filter(c => !c.folder).forEach(c => { const ext = c.name.split('.').at(-1) || '?'; byType[ext] = (byType[ext] || 0) + 1; });
      content += '<p>Contains: ' + children.length + ' items</p>';
      if (Object.keys(byType).length) content += '<p>' + Object.entries(byType).map(([ext, count]) => count + ' .' + ext).join(', ') + '</p>';
    }
  }
  freshWindow('info:' + name, 'INFO', 'text', content);
}

// ── Post-processing: confirmation wrapping ─────────────────────────────────
function batchContextMutation(action) {return runFileMutation(action);}

function wrapConfirmation(items, names=[]) {
  return items.map(([label, action, danger, hidden]) => {
    if (/^(delete|clear)/i.test(label) && typeof action === 'function' && !action.managesConfirmation) {
      const original = action;
      if(/^delete$/i.test(label)&&names.length)action=()=>rightRemoveFiles(names);
      else action = () => confirmRemoval(label, /^delete/i.test(label)?()=>performFileRemoval(names,()=>batchContextMutation(original)):original);
    }
    return [label, action, danger, hidden];
  });
}

// ── Post-processing: mark swatches ─────────────────────────────────────────
function appendMarkSwatches(items, names) {
  if (!names || !names.length) return items;
  const row = document.createElement('div');
  row.className = 'mark-swatches';
  for (const [label, color] of markSwatchList) {
    const btn = document.createElement('button');
    btn.style.background = color;
    btn.title = label;
    btn.setAttribute('aria-label', 'Mark ' + label);
    btn.onclick = () => { closeContext(); applyMark(names, color); };
    row.append(btn);
  }
  const clearBtn = document.createElement('button');
  clearBtn.innerHTML = closeMark();
  clearBtn.setAttribute('aria-label','Clear color');
  clearBtn.onclick = () => { closeContext(); applyMark(names, null); };
  row.append(clearBtn);
  items._markRow = row;
  return items;
}

function applyMark(names, color) {
  prefs.marks ||= {};
  for (const name of names) {
    const key = fileIsFolder(name) ? folderPath(name) : name;
    if (fileIsFolder(name)) Object.keys(prefs.marks).filter(alias => alias.startsWith('/') && folderPath(alias) === key).forEach(alias => delete prefs.marks[alias]);
    if (color) prefs.marks[key] = color;
    else delete prefs.marks[key];
  }
  persistProfiles();
  if (typeof applyMarks === 'function') applyMarks();
  refreshColorSearches();
}

// ── The new showContext ────────────────────────────────────────────────────
const _priorShowContext = showContext;
showContext = function(event, passthroughItems) {
  if(window.CabanonRightGesture?.suppress()){event.preventDefault();closeContext();return;}
  event.preventDefault();
  let resolved = resolveContext(event);
  if(resolved?.type===CTX.DESKTOP_BG){closeContext();openSettings('visual','wallpaper');return;}
  const pointerRow=event.target.closest(fileContextRows),onContent=!pointerRow||fileClickHit(event,pointerRow);
  if(!onContent)passthroughItems=null;
  // Locked folder check — override with password prompt
  const targetEl = onContent?event.target.closest('[data-entry],[data-file],[data-folder],[data-search-file],[data-archive-file]'):null;
  const targetName = targetEl && (targetEl.dataset.entry || targetEl.dataset.file || targetEl.dataset.folder || targetEl.dataset.searchFile || targetEl.dataset.archiveFile);
  const locked = typeof lockedAncestor === 'function' && targetName&&fileIsFolder(targetName) ? lockedAncestor(folderPath(targetName)) : null;
  if (locked) {
    passthroughItems = [['Enter password', () => requestFolderAccess(locked, () => openFolderBrowser(targetName))]];
    resolved = null;
  }
  let items = passthroughItems;
  if (resolved && builders[resolved.type]) {
    items = builders[resolved.type](event, resolved);
  }
  if (!items || !items.length) { closeContext(); return; }
  if(resolved&&resolved.type!==CTX.DESKTOP_LINK&&resolved.type!==CTX.DESKTOP_BG&&typeof simplifyFileActions==='function')items=simplifyFileActions(items,resolved);
  const markNames = items._markNames;
  // Filter hidden items (4th element = true means hidden)
  items = items.filter(([,,,hidden]) => !hidden);
  // Wrap danger actions with confirmation
  if(resolved?.type!==CTX.DESKTOP_LINK)items = wrapConfirmation(items,resolved?.names||(resolved?.name?[resolved.name]:[]));
  // Append mark swatches if applicable
  if (markNames && markNames.length) items = appendMarkSwatches(items, markNames);
  // Render the menu
  const rect = $('#desktop').getBoundingClientRect();
  const scale = rect.width / 1920;
  context.replaceChildren();
  items.forEach(([label, action, danger]) => {
    const button = document.createElement('button');
    button.textContent = label;
    button.setAttribute('role', 'menuitem');
    if (danger) button.className = 'danger';
    if(label==='remove'&&(resolved?.type===CTX.FROM_APP||resolved?.type===CTX.ALL_APP))button.classList.add('application-remove');
    if (typeof action === 'function') {
      button.onclick = clickEvent => { const submenu = label==='New' || label.startsWith('Select') || (label === 'Link' && resolved?.names); if (!submenu) closeContext(); action(clickEvent, button); };
    }
    context.append(button);
  });
  // Append mark row if present
  if (items._markRow) context.append(items._markRow);
  context.hidden = false;
  context.style.left = Math.max(0, Math.min(1920 - context.offsetWidth, (event.clientX - rect.left) / scale)) + 'px';
  context.style.top = Math.max(0, Math.min(1080 - context.offsetHeight, (event.clientY - rect.top) / scale)) + 'px';
  // Icon highlighting
  const target = event.target.closest('[data-entry],[data-file],[data-folder],[data-app],[data-archive-file],[data-system]');
  clearContextIcon();
  if (target&&onContent&&resolved?.type!==CTX.FOLDER_BG&&resolved?.type!==CTX.DESKTOP_BG) {
    contextIconTarget = target;
    target.classList.add('context-icon-active');
  }
};

// Close context on outside click (keep existing behavior)
window.addEventListener('pointerdown', event => {
  if (!context.hidden && !context.contains(event.target)) closeContext();
}, true);
window.addEventListener('keydown', event => {
  if (!context.hidden) { closeContext(); event.preventDefault(); event.stopImmediatePropagation(); }
}, true);

// ── Catch-all contextmenu listener ────────────────────────────────────────
document.addEventListener('contextmenu', event => {
  showContext(event, null);
}, true);

for(const type of ['wheel','scroll','dragstart'])window.addEventListener(type,event=>{if(!context.hidden&&!context.contains(event.target))closeContext();},{capture:true,passive:true});

window.addEventListener('blur',()=>{if(!context.hidden)closeContext();});
