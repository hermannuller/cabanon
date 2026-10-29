'use strict';
const fileSelections=new WeakMap();
let fileGesture=null,draggedFiles=null;
// A synchronous file operation commits one undo/save and one affected-directory refresh.
let fileMutation=null;
function noteFileMutationPath(path){if(fileMutation&&path)fileMutation.paths.add(path);}
function runFileMutation(action){
 if(fileMutation)return action();
 if(typeof flushFileUndo==='function')flushFileUndo();
 const saved={persistProfiles,refreshBrowsers,refreshFiles,renderDesktop,renderPins,pruneTrash};
 const state={paths:new Set(),names:new Set(prefs.entries.map(e=>e.name)),refresh:false,all:false,save:false,desktop:false,pins:false,search:false,prune:false};fileMutation=state;
 persistProfiles=()=>{state.save=true;};
 refreshBrowsers=paths=>{state.refresh=true;if(paths){for(const path of Array.isArray(paths)?paths:[paths])state.paths.add(path);}else if(!state.paths.size)state.all=true;};
 refreshFiles=()=>{state.search=true;refreshBrowsers();state.desktop=true;};
 renderDesktop=()=>{state.desktop=true;};renderPins=()=>{state.pins=true;};pruneTrash=()=>{state.prune=true;};
 try{return action();}finally{
  fileMutation=null;persistProfiles=saved.persistProfiles;refreshBrowsers=saved.refreshBrowsers;refreshFiles=saved.refreshFiles;renderDesktop=saved.renderDesktop;renderPins=saved.renderPins;pruneTrash=saved.pruneTrash;
  if(state.prune)pruneTrash();
  if(state.save){persistProfiles();if(typeof flushFileUndo==='function')flushFileUndo();}
  if(state.refresh)refreshBrowsers(state.all?undefined:[...state.paths]);
  if(state.desktop||state.refresh)renderDesktop();if(state.pins)renderPins();
  if(state.search&&!$('#from').hidden&&$('#file-search').value.trim())$('#file-search').oninput();
 }
}
function ensureEntries(){
 if(!prefs.entries){prefs.entries=prefs.files.map(name=>({name,parent:'/house',folder:fileIsFolder(name)}));}
 prefs.selectionContain ||= false;
}
function folderPath(name){return name==='/house'?name:name.startsWith('/house/')?name:'/house/'+name.replace(/^\//,'');}
function entriesForFolder(path){const entries=typeof settingIsShareRoot==='function'&&settingIsShareRoot(path)?settingShareEntries(path):prefs.entries.filter(entry=>entry.parent===path);return path==='/house'?entries.filter(entry=>entry.name!=='/house/holle'):entries;}
function listItems(list){return [...list.querySelectorAll('.file[data-file],.file[data-entry]')];}
function itemName(item){return item.dataset.file||item.dataset.entry;}
function selectionState(list){if(!fileSelections.has(list))fileSelections.set(list,{selected:new Set(),anchor:null,current:null});return fileSelections.get(list);}
function paintSelection(list){const state=selectionState(list);listItems(list).forEach(item=>{const selected=state.selected.has(itemName(item));if(item.classList.contains('selected')!==selected)item.classList.toggle('selected',selected);if(item.getAttribute('aria-selected')!==String(selected))item.setAttribute('aria-selected',selected);});}
function chooseItem(list,item,event){const state=selectionState(list),name=itemName(item);if(event.shiftKey&&state.anchor){const items=listItems(list);const start=items.findIndex(item=>itemName(item)===state.anchor),end=items.indexOf(item);if(!event.ctrlKey)state.selected.clear();for(let i=Math.min(Math.max(0,start),end);i<=Math.max(start,end);i++)state.selected.add(itemName(items[i]));}else if(event.ctrlKey){if(state.selected.has(name))state.selected.delete(name);else state.selected.add(name);state.anchor=name;}else{state.selected=new Set([name]);state.anchor=name;}state.current=name;paintSelection(list);list.focus({preventScroll:true});}
function findList(target){return target.closest('#files,.house-file-list');}
function fileRow(entry){return `<button class="file" data-entry="${escapeHTML(entry.name)}" ${entry.folder?'data-folder-target="'+escapeHTML(folderPath(entry.name))+'"':''}>${icon(glyphFor(entry.name))}<span>${escapeHTML(entry.name==='/house/holle'?'holle':fileLeafName(entry.name))}</span></button>`;}
function reconcileFileRows(list,rows){let cursor=list.firstElementChild;if(cursor?.classList.contains('details-head'))cursor=cursor.nextElementSibling;for(const row of rows){if(row===cursor)cursor=cursor.nextElementSibling;else list.insertBefore(row,cursor);} }
function drawBrowser(win,path){if(fileGesture?.list===win.querySelector('.house-file-list'))fileGesture.geometry=null;ensureEntries();const list=win.querySelector('.house-file-list');list.querySelector('.details-head')?.remove();list.dataset.path=path;const entries=entriesForFolder(path),existing=new Map([...list.children].filter(row=>row.dataset.entry).map(row=>[row.dataset.entry,row]));const rows=[];for(const entry of entries){const signature=JSON.stringify([entry.name,entry.folder,entry.shortcut,entry.target]);let row=existing.get(entry.name);existing.delete(entry.name);if(!row||row.dataset.rowSignature!==signature){const template=document.createElement('template');template.innerHTML=fileRow(entry);const replacement=template.content.firstElementChild;replacement.dataset.rowSignature=signature;if(row)row.replaceWith(replacement);row=replacement;}rows.push(row);}for(const row of existing.values())row.remove();for(const row of rows)if(row.parentElement!==list)list.append(row);win.querySelector('.house-empty').hidden=entries.length>0;const count=Math.max(1,Math.floor(list.clientHeight/56)),grid='repeat('+count+',56px)';if(list.style.gridTemplateRows!==grid)list.style.gridTemplateRows=grid;paintSelection(list);}
function openFolderBrowser(path){
 ensureEntries();path=folderPath(path);
 const key=path==='/house'?'house':'file:'+path;
 const win=createWindow(key,'HOUSE '+path,'folder',`<div class="house-path"><button class="house-up" title="Parent folder">↑</button><span>${escapeHTML(path)}</span></div><div class="house-file-list" tabindex="0" role="listbox" aria-multiselectable="true"></div><p class="muted house-empty" hidden>No files found.</p>`);
 win.dataset.fileBrowser=path;
 win.querySelector('.house-up').onclick=()=>openFolderBrowser(path==='/house'?'/house':path.slice(0,path.lastIndexOf('/'))||'/house');
 drawBrowser(win,path);if(!win.fileResizeObserver){win.fileResizeObserver=new ResizeObserver(()=>{const list=win.querySelector('.house-file-list');if(list)list.style.gridTemplateRows=`repeat(${Math.max(1,Math.floor(list.clientHeight/56))},56px)`;});win.fileResizeObserver.observe(win);}
 return win;
}
openHouse=function(){return openFolderBrowser('/house');};
const openContentFile=openFile;
openFile=function(name){ensureEntries();if(fileIsFolder(name))return openFolderBrowser(name);const entry=prefs.entries.find(item=>item.name===name);if(entry?.shortcut)return openContentFile(entry.target);return openContentFile(name);};
$('#files').tabIndex=0;$('#files').setAttribute('role','listbox');$('#files').setAttribute('aria-multiselectable','true');
function refreshBrowsers(paths){const targets=paths?new Set((Array.isArray(paths)?paths:[paths]).map(path=>typeof syncPath==='function'?syncPath(path):path)):null;for(const win of windowMap.values())if(win.dataset.fileBrowser&&(!targets||targets.has(typeof syncPath==='function'?syncPath(win.dataset.fileBrowser):win.dataset.fileBrowser)))drawBrowser(win,win.dataset.fileBrowser);}
function uniqueName(name,parent='/house',folder){const existing=prefs.entries.find(e=>e.name===name);folder=folder??existing?.folder??String(name).startsWith('/');const slash=name.lastIndexOf('/'),target=folder&&slash>=0?name.slice(0,slash):parent,leaf=fileLeafName(name);const key=value=>CabanonFilenames.key(value),occupied=candidate=>{const full=key(target+'/'+candidate);return prefs.entries.some(e=>key(e.parent+'/'+fileLeafName(e.name))===full)||fileMutation?.filenameScopes?.has(full);};const result=target+'/'+CabanonFilenames.unique(leaf,occupied,folder);if(fileMutation){fileMutation.names.add(result);(fileMutation.filenameScopes ||= new Set()).add(key(result));}return result;}

function relocateFolderReferences(oldPath,newPath,renamed){
 const path=value=>typeof value==='string'&&(value===oldPath||value.startsWith(oldPath+'/'))?newPath+value.slice(oldPath.length):value;
 prefs.folders=(prefs.folders||[]).map(name=>renamed.get(name)||path(name));for(const recent of prefs.recents||[])recent.name=renamed.get(recent.name)||path(recent.name);
 if(prefs.desktopItem)prefs.desktopItem.name=renamed.get(prefs.desktopItem.name)||path(prefs.desktopItem.name);
 for(const entry of prefs.entries)if(entry.shortcut&&entry.target)entry.target=renamed.get(entry.target)||path(entry.target);
 for(const key of ['folderViews','folderPermissions'])if(prefs[key]){const next={};for(const [name,value]of Object.entries(prefs[key])){if(key==='folderViews'&&value.manualOrder)value.manualOrder=value.manualOrder.map(item=>renamed.get(item)||item);next[path(name)]=value;}prefs[key]=next;}
 for(const group of prefs.syncGroups||[]){group.source=path(group.source);group.targets=group.targets.map(path);}
 for(const win of windowMap.values())if(win.dataset.fileBrowser&&path(win.dataset.fileBrowser)!==win.dataset.fileBrowser){configureFolder(win,path(win.dataset.fileBrowser));}
 renderPins();
}
function fileTransferAction(options={}){return options.action==='copy'||options.button===2?'copy':'move';}
function transferFiles(names,source,destination,options={}){
 ensureEntries();const action=fileTransferAction(options);if(destination===source&&action==='move')return;
 const target=destination;noteFileMutationPath(target);if(action==='move')noteFileMutationPath(source);
 const originals=names.map(name=>prefs.entries.find(entry=>entry.name===name&&entry.parent===source)).filter(Boolean);
 for(const entry of originals){const checks=entry.folder?[entry,...prefs.entries.filter(child=>child.parent===folderPath(entry.name)||child.parent.startsWith(folderPath(entry.name)+'/'))]:[entry];for(const item of checks)if(CabanonFilenames.require(item.name.split('/').at(-1),item.folder)===null)return;}

 for(const entry of originals){
  const path=entry.folder?folderPath(entry.name):null;if(path&&(target===path||target.startsWith(path+'/')))continue;
  const oldName=entry.name,newName=uniqueName(entry.folder?target+'/'+fileLeafName(entry.name):fileLeafName(entry.name),target,entry.folder),descendants=entry.folder?prefs.entries.filter(item=>item.parent===path||item.parent.startsWith(path+'/')):[];
  if(action==='move'){
   const renamed=new Map([[oldName,newName]]);entry.name=newName;entry.parent=target;
   for(const child of descendants){const prior=child.name;child.parent=newName+child.parent.slice(path.length);child.name=child.parent+'/'+fileLeafName(prior);renamed.set(prior,child.name);}
   CabanonStorage.moved(renamed);relocateFolderReferences(path||oldName,newName,renamed);
  }else{
   const contents=!entry.folder?prefs.content?.[oldName]:undefined;
   prefs.entries.push({...entry,id:(entry.folder?'folder:':'file:')+crypto.randomUUID(),name:newName,parent:target,contents:Array.isArray(entry.contents)?[...entry.contents]:entry.contents});prefs.files.push(newName);if(contents!==undefined)prefs.content[newName]=contents;
   for(const child of descendants){const childParent=newName+child.parent.slice(path.length),childName=uniqueName(child.folder?childParent+'/'+fileLeafName(child.name):fileLeafName(child.name),childParent,child.folder),content=!child.folder?prefs.content?.[child.name]:undefined;prefs.entries.push({...child,id:(child.folder?'folder:':'file:')+crypto.randomUUID(),name:childName,parent:childParent,contents:Array.isArray(child.contents)?[...child.contents]:child.contents});prefs.files.push(childName);if(content!==undefined)prefs.content[childName]=content;}
  }
 }
 refreshBrowsers(action==='move'?[source,target]:[target]);renderDesktop();persistProfiles();return action;
}
document.addEventListener('pointerdown',event=>{
 if(event.button!==0||event.target.closest('.details-head'))return;const list=findList(event.target);if(!list||list.dataset.view==='paragraph')return;
 const candidate=event.target.closest('.file'),item=candidate&&fileDragStartHit(event,candidate)?candidate:null,state=selectionState(list);
 const direct=Boolean(item);
 if(direct){fileGesture={list,item,x:event.clientX,y:event.clientY,mode:'item',moved:false,modifiers:{ctrlKey:event.ctrlKey,shiftKey:event.shiftKey}};if(list.id!=='files'){item.draggable=true;}}
 else beginFileSelectionBox(event,list,null,candidate);
},true);
// Pointer-down owns the gesture: selected L5 option or icon/name drags; unselected whitespace boxes.
function beginFileSelectionBox(event,list,onFinish,clickItem=null){
 const fromHeld=Boolean(event.metaKey||event.getModifierState?.('Meta')||window.CabanonFromKey?.held);
 event.preventDefault();const frame=document.createElement('div');frame.className='file-selection-frame';$('#desktop').append(frame);list.setPointerCapture(event.pointerId);
 fileGesture={list,item:clickItem,pointerId:event.pointerId,x:event.clientX,y:event.clientY,mode:'box',startAlt:event.altKey,startFrom:fromHeld,shapeLocked:event.button===0?(fromHeld?'lasso':event.altKey?'radial':null):null,moved:false,frame,original:new Set(event.ctrlKey?selectionState(list).selected:[]),modifiers:{ctrlKey:event.ctrlKey,shiftKey:event.shiftKey},button:event.button,onFinish};
}
function paintSelectionBox(gesture,event){
 if(fileGesture!==gesture||gesture.mode!=='box'||!gesture.list.isConnected)return;
 if(Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)<6&&!gesture.moved)return;gesture.moved=true;
 if(!gesture.geometry){const bounds=gesture.list.getBoundingClientRect(),header=gesture.list.querySelector('.details-head'),desktop=$('#desktop').getBoundingClientRect();gesture.geometry={viewport:{left:bounds.left,right:bounds.right,top:header?header.getBoundingClientRect().bottom:bounds.top,bottom:bounds.bottom},desktop,scale:desktop.width/1920,scrollLeft:gesture.list.scrollLeft,scrollTop:gesture.list.scrollTop,items:listItems(gesture.list).map(item=>({item,name:itemName(item),rect:item.getBoundingClientRect()})).filter(({item,rect:r})=>!item.hidden&&r.right>bounds.left&&r.left<bounds.right&&r.bottom>(header?header.getBoundingClientRect().bottom:bounds.top)&&r.top<bounds.bottom)};}
 const geometry=gesture.geometry,viewport=geometry.viewport,left=Math.max(viewport.left,Math.min(gesture.x,event.clientX)),right=Math.min(viewport.right,Math.max(gesture.x,event.clientX)),top=Math.max(viewport.top,Math.min(gesture.y,event.clientY)),bottom=Math.min(viewport.bottom,Math.max(gesture.y,event.clientY));
 const shaped=CabanonSelectionShapes.paint(gesture,event);gesture.lastSelectionPoint={clientX:event.clientX,clientY:event.clientY};
 if(!shaped)Object.assign(gesture.frame.style,{left:(left-geometry.desktop.left)/geometry.scale+'px',top:(top-geometry.desktop.top)/geometry.scale+'px',width:Math.max(0,right-left)/geometry.scale+'px',height:Math.max(0,bottom-top)/geometry.scale+'px'});
 const state=selectionState(gesture.list),previous=state.selected,next=new Set(gesture.original),dx=(gesture.list.scrollLeft-geometry.scrollLeft)*geometry.scale,dy=(gesture.list.scrollTop-geometry.scrollTop)*geometry.scale;
 for(const {name,rect:r}of geometry.items){const hit=shaped?CabanonSelectionShapes.hits(gesture,{left:r.left-dx,right:r.right-dx,top:r.top-dy,bottom:r.bottom-dy}):prefs.selectionContain?r.left-dx>=left&&r.right-dx<=right&&r.top-dy>=top&&r.bottom-dy<=bottom:r.left-dx<=right&&r.right-dx>=left&&r.top-dy<=bottom&&r.bottom-dy>=top;if(hit)next.add(name);}
 state.selected=next;if(gesture.button===2)updateRightBoxFeedback(gesture,event);for(const {item,name}of geometry.items){const selected=next.has(name);if(selected!==previous.has(name)){item.classList.toggle('selected',selected);item.setAttribute('aria-selected',String(selected));}}
}
function flushSelectionBox(gesture=fileGesture){if(gesture?.boxFrame)cancelAnimationFrame(gesture.boxFrame);if(gesture)gesture.boxFrame=0;if(gesture?.lastBoxEvent){const event=gesture.lastBoxEvent;gesture.lastBoxEvent=null;paintSelectionBox(gesture,event);}}
document.addEventListener('pointermove',event=>{const gesture=fileGesture;if(!gesture||gesture.mode!=='box')return;if(gesture.button===0&&(gesture.startAlt||gesture.startFrom)){gesture.selectionSamples ||= [];const samples=event.getCoalescedEvents?.()||[];for(const sample of samples.length?samples:[event])gesture.selectionSamples.push({clientX:sample.clientX,clientY:sample.clientY});}gesture.lastBoxEvent={clientX:event.clientX,clientY:event.clientY,shiftKey:event.shiftKey};if(!gesture.boxFrame)gesture.boxFrame=requestAnimationFrame(()=>flushSelectionBox(gesture));});
addEventListener('resize',()=>{if(fileGesture?.mode==='box')fileGesture.geometry=null;});

let suppressFileClick=false;
document.addEventListener('pointerup',event=>{if(!fileGesture)return;const gesture=fileGesture;gesture.frame?.remove();if(gesture.moved){suppressFileClick=true;setTimeout(()=>suppressFileClick=false,0);}else if(gesture.item)chooseItem(gesture.list,gesture.item,gesture.modifiers);else{selectionState(gesture.list).selected.clear();paintSelection(gesture.list);}fileGesture=null;});
document.addEventListener('click',event=>{if(event.target.closest('.details-head'))return;const list=findList(event.target);if(list){event.stopImmediatePropagation();if(suppressFileClick)event.preventDefault();}},true);
document.addEventListener('dblclick',event=>{const list=findList(event.target),item=event.target.closest('.file');if(list?.id==='files'){event.stopImmediatePropagation();return;}if(list&&item&&fileContentHit(event,item)&&list.dataset.view!=='paragraph'){event.stopImmediatePropagation();openFile(itemName(item),{newWindow:event.ctrlKey,sourceList:list});}},true);
document.addEventListener('keydown',event=>{
 const list=findList(event.target);if(!list||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;const items=listItems(list);if(!items.length)return;event.preventDefault();const state=selectionState(list);let index=Math.max(0,items.findIndex(item=>itemName(item)===state.current));const nextColumn=items.findIndex((item,i)=>i>0&&Math.abs(item.getBoundingClientRect().top-items[0].getBoundingClientRect().top)<1);const actualRows=nextColumn>0?nextColumn:items.length;
 if(event.ctrlKey){if(event.key==='ArrowUp')index=0;else if(event.key==='ArrowDown')index=items.length-1;else{const row=index%actualRows;index=event.key==='ArrowLeft'?row:row+Math.floor((items.length-1-row)/actualRows)*actualRows;}}
 else index=Math.max(0,Math.min(items.length-1,index+({ArrowUp:-1,ArrowDown:1,ArrowLeft:-actualRows,ArrowRight:actualRows}[event.key])));
 chooseItem(list,items[index],{ctrlKey:false,shiftKey:event.shiftKey});items[index].scrollIntoView({block:'nearest',inline:'nearest'});
});
document.addEventListener('dragstart',event=>{const list=findList(event.target),item=event.target.closest('.file');if(!list||!item||list.id==='files'){if(list)event.preventDefault();return;}const state=selectionState(list);if(!state.selected.has(itemName(item)))chooseItem(list,item,{ctrlKey:false,shiftKey:false});draggedFiles={names:[...state.selected],source:list.dataset.path,action:'move'};event.dataTransfer.setData('text/plain',JSON.stringify(draggedFiles));event.dataTransfer.effectAllowed='all';fileGesture?.frame?.remove();fileGesture=null;});
document.addEventListener('dragover',event=>{const list=event.target.closest('.house-file-list');if(!list||!draggedFiles)return;event.preventDefault();event.dataTransfer.dropEffect=draggedFiles.action||'move';});
document.addEventListener('drop',event=>{const list=event.target.closest('.house-file-list');if(!list||!draggedFiles)return;event.preventDefault();const folder=event.target.closest('[data-folder-target]');transferFiles(draggedFiles.names,draggedFiles.source,folder?.dataset.folderTarget||list.dataset.path,{action:draggedFiles.action||'move'});draggedFiles=null;});
document.addEventListener('dragend',()=>{draggedFiles=null;fileGesture=null;});
const settingsWithFiles=openSettings;openSettings=function(){settingsWithFiles();const win=windowMap.get('system:settings');if(!win.querySelector('#selection-contain')){const label=document.createElement('label');label.innerHTML=`<input id="selection-contain" type="checkbox" ${prefs.selectionContain?'checked':''}> Select only fully enclosed files`;label.querySelector('input').onchange=event=>{prefs.selectionContain=event.target.checked;persistProfiles();};win.querySelector('.window-content').prepend(label);}};
ensureEntries();
const deleteEntryFile=deleteFile;deleteFile=function(name){ensureEntries();const entry=prefs.entries.find(entry=>entry.name===name);if(!entry)return;noteFileMutationPath(entry.parent);prefs.entries=prefs.entries.filter(entry=>entry.name!==name);deleteEntryFile(name);};
const recentWithEntry=recordRecent;recordRecent=function(name){ensureEntries();if(!prefs.entries.some(entry=>entry.name===name))prefs.entries.push({name,parent:'/house',folder:false});recentWithEntry(name);};


