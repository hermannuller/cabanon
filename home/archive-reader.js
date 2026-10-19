'use strict';
function openArchive(name,directory=null){
 ensureEntries();const entry=prefs.entries.find(item=>item.name===name);
 if(entry&&!Array.isArray(entry.contents)){entry.contents=prefs.entries.filter(item=>!item.folder&&item.parent===entry.parent&&item.name!==name&&!item.name.endsWith('.zip')).slice(0,5).map(item=>item.name);if(!entry.contents.length)entry.contents=['readme.txt','notes.txt','summary.md'];persistProfiles();}
 const snapshots=entry?.archiveSnapshots||[],contents=directory?snapshots.filter(s=>s.entry.parent===directory).map(s=>s.entry.name):entry?.contents||[];recordRecent(name);
 const key='archive:'+name;
 const existing=windowMap.get(key);
 const previousScroll=existing?.querySelector('.window-content').scrollTop||0;
 const content=`${directory?'<button data-archive-up>←</button>':''}<div class="archive-list" role="listbox" aria-label="Archive contents">${contents.map(file=>`<button class="archive-row" data-archive-file="${escapeHTML(file)}">${icon(glyphFor(file))}<span>${escapeHTML(fileLeafName(file))}</span></button>`).join('')||'<p class="muted">No files found.</p>'}</div>`;
 const win=existing||createWindow(key,fileLeafName(name),'zip',content);
 if(existing){existing.querySelector('.window-content').innerHTML=content;existing.hidden=false;}
 win.dataset.ownerApp='STUFF';win.querySelector('.window-content').scrollTop=previousScroll;
 const list=win.querySelector('.archive-list');list.dataset.archive=name;const up=win.querySelector('[data-archive-up]');if(up)up.onclick=()=>openArchive(name,entry.contents.includes(directory)?null:snapshots.find(s=>s.entry.name===directory)?.entry.parent);
 win.querySelectorAll('[data-archive-file]').forEach(button=>{button.onclick=()=>{win.querySelectorAll('.archive-row').forEach(item=>item.classList.toggle('selected',item===button));};button.ondblclick=()=>{const file=button.dataset.archiveFile,snapshot=snapshots.find(s=>s.entry.name===file);if(snapshot?.entry.folder){openArchive(name,file);return;}createWindow('archive-content:'+name+':'+file,fileLeafName(file),glyphFor(file),`<h1>${escapeHTML(fileLeafName(file))}</h1><article class="test-file-content">${escapeHTML(entry?.archiveSnapshots?.find(s=>s.entry.name===file)?.content??prefs.content?.[file]??'Archive document\n\nThis file is stored inside '+name+'.\n\nThe archive is read-only.')}</article>`);};});
 return win;
}
const regularFileReader=openFile;
openFile=function(name,options={}){if(name.toLowerCase().endsWith('.zip'))return openArchive(name);return regularFileReader(name,options);};
document.addEventListener('dragover',event=>{const list=event.target.closest('.archive-list');if(!list||!draggedFiles)return;event.preventDefault();event.stopImmediatePropagation();const allowed=canAddToArchive(list.dataset.archive,draggedFiles.names);event.dataTransfer.dropEffect=allowed?'copy':'none';window.CabanonDragFeedback?.present(event,allowed?fileDragLabel(list.dataset.archive):"   X   ");},true);
document.addEventListener('drop',event=>{const list=event.target.closest('.archive-list');if(!list||!draggedFiles)return;event.preventDefault();event.stopImmediatePropagation();const name=list.dataset.archive,entry=prefs.entries.find(item=>item.name===name);if(entry&&canAddToArchive(name,draggedFiles.names)){archiveFileBatch(name,draggedFiles.names,draggedFiles.action==='copy');openArchive(name);}draggedFiles=null;dropHint.hidden=true;},true);



function canAddToArchive(target,names){const entries=new Map(prefs.entries.map(e=>[e.name,e]));for(const name of names){const seen=new Set(),queue=[name];while(queue.length){const current=queue.pop();if(current===target)return false;if(seen.has(current))continue;seen.add(current);for(const child of entries.get(current)?.contents||[])queue.push(child);}}return true;}

const stuffPriorApp=openApp;openApp=function(name,...args){if(name==='STUFF'){if(prefs.uninstalled.includes(name))return;ensureEntries();prefs.usage[name]=(prefs.usage[name]||0)+1;persistProfiles();const win=createWindow('app:STUFF','STUFF','zip','<div class="archive-list"></div>');const list=win.querySelector('.archive-list');list.replaceChildren();for(const entry of prefs.entries.filter(entry=>!entry.folder&&/\.zip$/i.test(entry.name))){const button=document.createElement('button');button.className='archive-row';button.innerHTML=icon('zip')+'<span>'+escapeHTML(fileLeafName(entry.name))+'</span>';button.ondblclick=()=>openArchive(entry.name);list.append(button);}return win;}return stuffPriorApp(name,...args);};
