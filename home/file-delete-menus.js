'use strict';
const contextWithFileDelete=showContext;
showContext=function(event,items){
 contextWithFileDelete(event,items);
 const row=event.target.closest('[data-entry],[data-file],[data-folder],[data-search-file],[data-nav],[data-tree-file]');if(!row)return;
 const name=row.dataset.entry||row.dataset.file||row.dataset.folder||row.dataset.searchFile||row.dataset.nav||row.dataset.treeFile;
 const entry=prefs.entries.find(item=>item.name===name||(item.folder&&fileIsFolder(name)&&folderPath(item.name)===folderPath(name)));
 const shortcut=Boolean(row.closest('#files,#folders')||row.matches('[data-nav]:not(.tree-line)')||entry?.shortcut);
 if(shortcut){
  context.querySelectorAll(':scope > button').forEach(button=>{if(/^delete/i.test(button.textContent))button.remove();});
  if(![...context.children].some(button=>button.textContent.trim()==='Unpin')){const button=document.createElement('button');button.textContent='Unpin';button.setAttribute('role','menuitem');button.onclick=()=>{closeContext();if(row.closest('#files'))prefs.recents=prefs.recents.filter(item=>item.name!==name);else if(entry?.shortcut){prefs.entries=prefs.entries.filter(item=>item!==entry);prefs.files=prefs.files.filter(item=>item!==name);prefs.recents=prefs.recents.filter(item=>item.name!==name);}else prefs.folders=prefs.folders.filter(item=>folderPath(item)!==folderPath(name));persistProfiles();refreshBrowsers();renderDesktop();renderPins();};context.insertBefore(button,context.querySelector('.mark-swatches'));}
  return;
 }
 if(!entry||[...context.children].some(button=>/^(delete|enter password)/i.test(button.textContent)))return;
 const button=document.createElement('button');button.textContent='Delete';button.setAttribute('role','menuitem');button.onclick=()=>{closeContext();confirmRemoval('Delete',()=>{if(entry.folder)folderDelete([entry.name],false);else deleteFile(entry.name);});};context.insertBefore(button,context.querySelector('.mark-swatches'));
};
const deleteWithShortcuts=deleteFile;
deleteFile=function(name){
 const entry=prefs.entries.find(item=>item.name===name),removed=new Set([name]);
 const path=entry?.folder?folderPath(name):null;
 const pointsToRemoved=target=>removed.has(target)||(path&&target?.startsWith('/')&&(folderPath(target)===path||folderPath(target).startsWith(path+'/')));
 let changed=true;while(changed){changed=false;for(const item of prefs.entries)if(item.shortcut&&!removed.has(item.name)&&pointsToRemoved(item.target)){removed.add(item.name);changed=true;}}
 prefs.fromFilePins=(prefs.fromFilePins||[]).filter(file=>!pointsToRemoved(file));prefs.folders=prefs.folders.filter(folder=>!pointsToRemoved(folder));
 prefs.pinnedFiles=(prefs.pinnedFiles||[]).filter(file=>!pointsToRemoved(file));
 prefs.recents=prefs.recents.filter(item=>!pointsToRemoved(item.name));
 for(const link of removed)if(link!==name){prefs.entries=prefs.entries.filter(item=>item.name!==link);prefs.files=prefs.files.filter(file=>file!==link);}
 deleteWithShortcuts(name);renderPins();
};


