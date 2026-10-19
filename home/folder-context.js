'use strict';
const markColors=['#10a53b','#ff880a','#c5173e','#ffb3c1','#08c5eb','#999efa'];
function fileSearchQuery(query){const text=query.trim().toLowerCase(),match=/^:([1-6])(?:\s+(.*))?$/.exec(text);return{color:match?markColors[Number(match[1])-1]:null,text:match?(match[2]||''):text};}
function fileSearchMatch(name,query){const parsed=typeof query==='string'?fileSearchQuery(query):query;return name.toLowerCase().includes(parsed.text)&&(!parsed.color||(fileIsFolder(name)?folderMark(name):prefs.marks?.[name])?.toLowerCase()===parsed.color);}
function refreshColorSearches(){const search=$('#file-search');if(!$('#from').hidden&&fileSearchQuery(search.value).color)search.oninput();for(const win of windowMap.values()){const local=win.querySelector('.folder-local-search');if(local&&!local.hidden&&fileSearchQuery(local.value).color)local.oninput();}}
function contextPrefs(){prefs.marks ||= {};prefs.folderViews ||= {};prefs.folderLocks ||= {};prefs.folderPermissions ||= {};}
contextPrefs();
// Icon/name is a continuous full-height band from option left to visible content right.
// Its width is narrower than the option, but its height is identical to the option.
function fileContentBounds(item){
 const row=item.getBoundingClientRect();let right=row.left;
 const mark=item.querySelector('svg,.software-icon,.colors-icon,.file-icon,.shortcut-icon');if(mark)right=Math.max(right,mark.getBoundingClientRect().right);
 const label=item.querySelector(':scope > span:not(.file-details):not(.shortcut-icon):not(.file-icon):not(.software-icon):not(.colors-icon)')||(!mark?item:null);
 if(label){const box=label.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(label);for(const text of range.getClientRects())if(text.width>0)right=Math.max(right,Math.min(box.right,text.right));}
 return {left:row.left,right:Math.min(row.right,right),top:row.top,bottom:row.bottom};
}
function fileContentHit(event,item){const r=fileContentBounds(item);return event.clientX>=r.left&&event.clientX<r.right&&event.clientY>=r.top&&event.clientY<r.bottom;}
// Stationary file menus use the whole folder option, whether selected or not.
function fileClickHit(event,item){
 if(item.matches('.house-file-list .file,[data-app],[data-setting-app],[data-setting-app] button')){const r=item.getBoundingClientRect();return event.clientX>=r.left&&event.clientX<r.right&&event.clientY>=r.top&&event.clientY<r.bottom;}
 return fileContentHit(event,item);
}
// Drag origins expand only for already-selected folder rows; drop/content hits never expand.
function fileDragStartHit(event,item){
 if(item.matches('.house-file-list .file.selected')){const r=item.getBoundingClientRect();if(event.clientX>=r.left&&event.clientX<r.right&&event.clientY>=r.top&&event.clientY<r.bottom)return true;}
 return fileContentHit(event,item);
}
function folderView(path){contextPrefs();return prefs.folderViews[path] ||= {mode:'list',sort:'name',direction:'down',pins:[]};}
function entrySize(entry){return entry.size??new TextEncoder().encode(prefs.content?.[entry.name]||'').length;}
function entryDate(entry){return entry.modified||entry.created||prefs.recents.find(item=>item.name===entry.name)?.lastUsed||Date.UTC(2026,9,13);}
const baseFolderDraw=drawBrowser;
drawBrowser=function(win,path){
 baseFolderDraw(win,path);const list=win.querySelector('.house-file-list'),view=folderView(path);list.dataset.view=view.mode;
 const entries=entriesForFolder(path);const byName=new Map(entries.map(entry=>[entry.name,entry]));
 const sortValues=new Map();const value=entry=>{if(sortValues.has(entry.name))return sortValues.get(entry.name);let result;switch(view.sort){case 'name':result=entry.name.split('/').at(-1).toLowerCase();break;case 'type':result=entry.folder?'/folder':entry.name.split('.').at(-1);break;case 'date':case 'modified':result=entryDate(entry);break;case 'size':result=entrySize(entry);break;case 'created':result=entry.created||Date.UTC(2026,9,13);break;case 'mark':result=prefs.marks[entry.name]||'';break;case 'dimensions':result=entry.dimensions||'';break;default:result=entry.name.split('.').at(-1);}sortValues.set(entry.name,result);return result;};
 const manualRanks=view.manualOrder?new Map(view.manualOrder.map((name,index)=>[name,index])):null;const rows=[...list.children].sort((a,b)=>{if(manualRanks)return (manualRanks.get(a.dataset.entry)??manualRanks.size)-(manualRanks.get(b.dataset.entry)??manualRanks.size);if(view.sort==='type'){const af=Boolean(byName.get(a.dataset.entry).folder),bf=Boolean(byName.get(b.dataset.entry).folder);if(af!==bf)return af?-1:1;}const av=value(byName.get(a.dataset.entry)),bv=value(byName.get(b.dataset.entry));return (typeof av==='number'?av-bv:String(av).localeCompare(String(bv)))*(view.direction==='down'?-1:1);});reconcileFileRows(list,rows);
 list.querySelector('.details-head')?.remove();
 for(const row of rows){const entry=byName.get(row.dataset.entry);if(view.mode==='details'){for(const [index,value]of [entry.folder?'/folder':entry.name.split('.').at(-1).toUpperCase(),new Date(entryDate(entry)).toISOString().slice(0,10),entry.folder?'—':entrySize(entry)+' B'].entries()){let cell=row.querySelector('.detail-column-'+(index+1));if(!cell){cell=document.createElement('div');cell.className='detail-cell detail-column-'+(index+1);row.append(cell);}if(cell.textContent!==value)cell.textContent=value;if(cell.title!==value)cell.title=value;}}else row.querySelectorAll('.detail-cell').forEach(cell=>cell.remove());}
 if(view.mode==='details')buildDetailsHeader(list,view);
 applyMarks(win);
};
function buildDetailsHeader(list,view){
 view.columns ||= [320,120,180,110];
 const apply=()=>{list.style.setProperty('--detail-width',view.columns.reduce((a,b)=>a+b,0)+'px');list.style.setProperty('--detail-grid',`56px ${view.columns[0]-56}px ${view.columns.slice(1).map(width=>width+'px').join(' ')}`);};apply();
 const header=document.createElement('div');header.className='details-head';
 ['Name','Type','Date','Size'].forEach((label,index)=>{const cell=document.createElement('div');cell.className='detail-heading';cell.title=label;const text=document.createElement('span');text.textContent=label+(view.headerSortActive&&view.sort===label.toLowerCase()?(view.direction==='down'?' ↓':' ↑'):'');cell.onclick=event=>{if(event.target.closest('.detail-divider'))return;if(!view.headerSortActive)view.sort='';view.headerSortActive=true;sortFolder(list.dataset.path,label.toLowerCase());};cell.append(text);const handle=document.createElement('i');handle.className='detail-divider';handle.setAttribute('role','separator');handle.setAttribute('aria-label','Resize '+label);handle.onpointerdown=event=>{if(event.button!==0)return;event.preventDefault();event.stopPropagation();handle.setPointerCapture(event.pointerId);const before=[...view.columns];window.CabanonGestureCancel?.rollback(()=>{view.columns=before;apply();persistProfiles();});const start=event.clientX,width=view.columns[index],scale=$('#desktop').getBoundingClientRect().width/1920;handle.onpointermove=move=>{view.columns[index]=Math.max(index===0?64:40,Math.round(width+(move.clientX-start)/scale));apply();};handle.onpointerup=()=>{handle.onpointermove=null;persistProfiles();};handle.onpointercancel=()=>{handle.onpointermove=null;persistProfiles();};};cell.append(handle);header.append(cell);});list.prepend(header);
}
function refreshFolderViews(path){refreshBrowsers(path);persistProfiles();}
function folderMark(path){return prefs.marks[path]||Object.entries(prefs.marks).find(([name])=>fileIsFolder(name)&&folderPath(name)===folderPath(path))?.[1];}
function applyMarks(root=document){
 contextPrefs();const selector='[data-entry],[data-file],[data-folder],[data-search-file],[data-archive-file]';
 const items=[...(root.matches?.(selector)?[root]:[]),...root.querySelectorAll(selector)];
 for(const item of items){const name=item.dataset.entry||item.dataset.file||item.dataset.folder||item.dataset.searchFile||item.dataset.archiveFile;if(!name)continue;const color=(fileIsFolder(name)?folderMark(name):prefs.marks[name])||'transparent';if(item.style.getPropertyValue('--file-mark')!==color)item.style.setProperty('--file-mark',color);if(item.classList.contains('has-file-mark')!==Boolean(color!=='transparent'))item.classList.toggle('has-file-mark',color!=='transparent');}
 const windows=[...(root.matches?.('.window[data-file-browser]')?[root]:[]),...root.querySelectorAll('.window[data-file-browser]')];for(const win of windows){const svg=win.querySelector('.window-title svg'),color=folderMark(win.dataset.fileBrowser)||'';if(svg&&svg.style.color!==color)svg.style.color=color;}
}
new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1)applyMarks(node);}).observe($('#desktop'),{childList:true,subtree:true});
function addMarkRow(names){const row=document.createElement('div');row.className='mark-swatches';[null,...markColors].forEach(color=>{const button=document.createElement('button');button.style.background=color||'var(--l3)';button.title=color||'Clear color';button.setAttribute('aria-label',color?'Mark '+color:'Clear color');if(!color)button.innerHTML=closeMark();button.onclick=()=>{contextPrefs();names.forEach(name=>{const key=fileIsFolder(name)?folderPath(name):name;if(fileIsFolder(name))Object.keys(prefs.marks).filter(alias=>alias.startsWith('/')&&folderPath(alias)===key).forEach(alias=>delete prefs.marks[alias]);if(color)prefs.marks[key]=color;else delete prefs.marks[key];});persistProfiles();applyMarks();};row.append(button);});context.append(row);}
const contextWithMarks=showContext;
showContext=function(event,items){
 contextPrefs();const row=event.target.closest('[data-entry],[data-file],[data-folder],[data-search-file],[data-archive-file]');const list=event.target.closest('.house-file-list');const name=row&&(row.dataset.entry||row.dataset.file||row.dataset.folder||row.dataset.searchFile||row.dataset.archiveFile);
 const locked=name&&fileIsFolder(name)?lockedAncestor(folderPath(name)):null;
 if(locked){contextWithMarks(event,[['Enter password',()=>requestFolderAccess(locked,()=>openFolderBrowser(name))]]);return;}
 contextWithMarks(event,items);if(name){const selection=list?selectionState(list).selected:null;addMarkRow(selection?.has(name)?[...selection]:[name]);}
};
function supportedSorts(path){const entries=entriesForFolder(path);return [{id:'name',label:'Name'},{id:'type',label:'Type'},{id:'date',label:'Date'},{id:'size',label:'Size'},{id:'extension',label:'Extension'},{id:'created',label:'Created'},{id:'modified',label:'Modified'},{id:'mark',label:'Mark'},...entries.some(entry=>/\.(png|jpe?g|webp|gif)$/i.test(entry.name))?[{id:'dimensions',label:'Image dimensions'}]:[]];}
function sortFolder(path,id){const view=folderView(path);view.direction=view.sort===id&&view.direction==='down'?'up':'down';view.sort=id;refreshFolderViews(path);}
function moreSorting(path){const view=folderView(path),sorts=supportedSorts(path);const win=freshWindow('sorting:'+path,'SORT OPTIONS','text',`<h1>Sort options</h1>${sorts.map(sort=>`<label><input type="checkbox" data-pin-sort="${sort.id}" ${view.pins.includes(sort.id)?'checked':''}> ${sort.label}</label>`).join('')}<button class="action" id="save-sort-pins">Pin to menu</button>`);win.querySelector('#save-sort-pins').onclick=()=>{view.pins=[...win.querySelectorAll('[data-pin-sort]:checked')].map(input=>input.dataset.pinSort);persistProfiles();win.querySelector('[data-win=close]').click();};}
function showNewTypes(button,path){let panel=context.querySelector('.new-types');if(panel)return;panel=document.createElement('div');panel.className='new-types';const types=[['Folder',null],['Text file','txt'],['Markdown','md'],['Table','tsv'],['Audio','mp3'],['ZIP archive','zip']];for(const [label,extension]of types){const item=document.createElement('button');item.textContent=label;item.onclick=()=>{closeContext();newFolderEntry(path,extension);};panel.append(item);}context.append(panel);panel.style.top=button.offsetTop+'px';}
let folderUndo=[],undoReplay=false;
function fileSnapshot(){return JSON.stringify({entries:prefs.entries,files:prefs.files,recents:prefs.recents,content:prefs.content,trash:prefs.trash,marks:prefs.marks,folderViews:prefs.folderViews,folders:prefs.folders,fromFilePins:prefs.fromFilePins,desktopItem:prefs.desktopItem,folderLocks:prefs.folderLocks,folderPermissions:prefs.folderPermissions,syncGroups:prefs.syncGroups,shareMappings:prefs.shareMappings||[],wallLastFile:prefs.wallLastFile||null});}
function restoreFileSnapshot(text){const modes=[...windowMap.values()].filter(win=>win.dataset.fileBrowser).map(win=>[syncPath(win.dataset.fileBrowser),folderView(syncPath(win.dataset.fileBrowser)).mode]);Object.assign(prefs,JSON.parse(text));for(const [path,mode]of modes)folderView(path).mode=mode;}
let lastFileSnapshot=fileSnapshot(),lastUndoUser=activeProfile;
const persistWithUndo=persistProfiles;
let fileUndoPending=false;
function flushFileUndo(){if(!fileUndoPending)return;fileUndoPending=false;const current=fileSnapshot();if(lastUndoUser!==activeProfile){folderUndo=[];lastUndoUser=activeProfile;lastFileSnapshot=current;}if(!undoReplay&&current!==lastFileSnapshot){folderUndo.push(lastFileSnapshot);if(folderUndo.length>30)folderUndo.shift();}lastFileSnapshot=current;}
persistProfiles=function(){if(!fileUndoPending){fileUndoPending=true;queueMicrotask(flushFileUndo);}persistWithUndo();};
function undoFolderOperation(){if(typeof cancelPendingFileRemovals==='function'&&cancelPendingFileRemovals())return;flushFileUndo();const previous=folderUndo.pop();if(!previous)return;undoReplay=true;restoreFileSnapshot(previous);lastFileSnapshot=fileSnapshot();refreshBrowsers();renderDesktop();applyMarks();persistProfiles();flushFileUndo();undoReplay=false;}

async function hashPassword(value){const buffer=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(buffer)].map(byte=>byte.toString(16).padStart(2,'0')).join('');}
const unlockedFolders=new Set();
function requestFolderAccess(path,onSuccess){const win=freshWindow('unlock:'+path,'ENTER PASSWORD','lock',`<h1>Enter password</h1><p>${escapeHTML(path)}</p><input id="folder-password" type="password" aria-label="Folder password"><button class="action" id="unlock-folder">Open</button><p id="unlock-error" class="muted"></p>`);win.querySelector('#unlock-folder').onclick=async()=>{if(await hashPassword(win.querySelector('#folder-password').value)===prefs.folderLocks[path]){unlockedFolders.add(activeProfile+':'+path);win.querySelector('[data-win=close]').click();onSuccess();}else win.querySelector('#unlock-error').textContent='Incorrect password.';};}
function lockedAncestor(path){contextPrefs();return Object.keys(prefs.folderLocks).find(folder=>(path===folder||path.startsWith(folder+'/'))&&!unlockedFolders.has(activeProfile+':'+folder));}
const accessFolderOpen=openFolderBrowser;
openFolderBrowser=function(path,force=false){path=folderPath(path);const locked=lockedAncestor(path);if(locked){requestFolderAccess(locked,()=>openFolderBrowser(path,force));return;}if(!isOwner()&&prefs.folderPermissions[path]==='owner'){toast('Access denied');return;}return accessFolderOpen(path,force);};
const accessFolderConfigure=configureFolder;
configureFolder=function(win,path){const locked=lockedAncestor(path);if(locked){requestFolderAccess(locked,()=>configureFolder(win,path));return win;}return accessFolderConfigure(win,path);};
new MutationObserver(()=>{for(const id of unlockedFolders){const split=id.indexOf(':'),user=id.slice(0,split),path=id.slice(split+1);if(user!==activeProfile||![...windowMap.values()].some(win=>{const current=win.dataset.fileBrowser||(win.dataset.wallPicker?win.wallPath:null);return current===path||current?.startsWith(path+'/');}))unlockedFolders.delete(id);}}).observe($('#windows'),{childList:true,subtree:true});
function folderInfo(path){
 const files=prefs.entries.filter(entry=>!entry.folder&&(entry.parent===path||entry.parent.startsWith(path+'/'))),types=new Map();for(const entry of files){const type=entry.name.split('.').at(-1).toUpperCase(),value=types.get(type)||{count:0,size:0};value.count++;value.size+=entrySize(entry);types.set(type,value);}
 const win=freshWindow('folder-info:'+path,'FOLDER INFO','folder',`<h1>Folder info</h1><p>${escapeHTML(path)}</p><p>Files: ${files.length}</p><p>Total size: ${files.reduce((size,file)=>size+entrySize(file),0)} B</p><div class="folder-type-info">${[...types].map(([type,value])=>`<p>${escapeHTML(type)} · ${value.count} files · ${value.size} B</p>`).join('')}</div><h2>Access</h2><label>Password <input id="new-folder-password" type="password" placeholder="Leave blank to keep"></label><label><input id="clear-folder-password" type="checkbox"> Remove password</label><label>User permissions <select id="folder-permission"><option value="all">All users</option><option value="owner" ${prefs.folderPermissions[path]==='owner'?'selected':''}>Owner only</option></select></label><button class="action" id="save-folder-access">Save</button><p id="folder-info-feedback" class="muted"></p>`);
 win.querySelector('#save-folder-access').onclick=async()=>{const password=win.querySelector('#new-folder-password').value;if(win.querySelector('#clear-folder-password').checked)delete prefs.folderLocks[path];else if(password){prefs.folderLocks[path]=await hashPassword(password);unlockedFolders.add(activeProfile+':'+path);}prefs.folderPermissions[path]=win.querySelector('#folder-permission').value;persistProfiles();win.querySelector('#folder-info-feedback').textContent='';return true;};
}
applyMarks();




