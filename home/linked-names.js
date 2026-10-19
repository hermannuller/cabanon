'use strict';
function renameSource(name){let entry=prefs.entries.find(e=>e.name===name||e.folder&&fileIsFolder(name)&&folderPath(e.name)===folderPath(name));const seen=new Set();while(entry?.shortcut&&!seen.has(entry)){seen.add(entry);entry=prefs.entries.find(e=>e.name===entry.target);}return entry;}
let renameFromShortcut=false;
const linkedNameContext=showContext;showContext=function(event,items){linkedNameContext(event,items);const row=event.target.closest('[data-file],[data-folder],[data-entry],[data-nav]');if(!row)return;const name=row.dataset.file||row.dataset.folder||row.dataset.entry||row.dataset.nav;const source=renameSource(name);if(!source)return;const shortcut=Boolean(row.closest('#files,#folders')||row.matches('[data-nav]:not(.tree-line)')||prefs.entries.find(e=>e.name===name)?.shortcut);let button=[...context.children].find(b=>b.textContent==='Rename');if(!button){button=document.createElement('button');button.textContent='Rename';context.insertBefore(button,context.querySelector('.mark-swatches'));}button.onclick=()=>{closeContext();renameFromShortcut=shortcut;try{const list=row.closest('.house-file-list'),selected=list&&selectionState(list).selected;renameEntries(selected?.has(name)?[...selected]:[name]);}finally{renameFromShortcut=false;}};};
const desktopLinkedLabels=renderDesktop;renderDesktop=function(){desktopLinkedLabels();for(const row of $('#files').querySelectorAll('[data-file]')){const name=renameSource(row.dataset.file)?.name||row.dataset.file;row.querySelector(':scope > span:last-child').textContent=name.split('/').at(-1)+'.link';}};
renderDesktop();



function automaticRenameValues(sources,values){
 const sourceSet=new Set(sources),occupied=new Map(),key=CabanonFilenames.key.bind(CabanonFilenames);
 const namesAt=parent=>{const scope=key(parent);if(!occupied.has(scope))occupied.set(scope,new Set());return occupied.get(scope);};
 for(const entry of prefs.entries)if(!sourceSet.has(entry))namesAt(entry.parent).add(key(fileLeafName(entry.name)));
 const keep=values.map((value,i)=>key(value)===key(fileLeafName(sources[i].name)));
 for(let i=0;i<sources.length;i++)if(keep[i])namesAt(sources[i].parent).add(key(values[i]));
 return values.map((value,i)=>{if(keep[i])return value;const used=namesAt(sources[i].parent),name=CabanonFilenames.unique(value,candidate=>used.has(key(candidate)),sources[i].folder);used.add(key(name));return name;});
}
function fileRenameChanges(sources,values){
 const plans=sources.map((entry,i)=>({entry,old:entry.name,leaf:values[i]}));
 const remap=name=>{if(!name)return name;const direct=plans.find(p=>p.old===name);if(direct)return remap(direct.entry.parent)+'/'+direct.leaf;const parent=plans.filter(p=>p.entry.folder&&name.startsWith(folderPath(p.old)+'/')).sort((a,b)=>b.old.length-a.old.length)[0];return parent?remap(parent.old)+name.slice(folderPath(parent.old).length):name;};
 const changes=prefs.entries.map(entry=>({entry,old:entry.name,name:entry.shortcut?remap(entry.parent)+'/'+remap(renameSource(entry.name)?.name||entry.target).split('/').at(-1)+'.link':remap(entry.name),parent:remap(entry.parent),target:remap(entry.target)}));
 return{changes,remap};
}
function commitFileRename(sources,values,options={}){
 if(sources.length!==values.length||sources.some(entry=>!prefs.entries.includes(entry)))return false;const checked=values.map((value,i)=>CabanonFilenames.require(value,sources[i].folder));if(checked.includes(null))return false;values=options.numberCollisions?automaticRenameValues(sources,checked):checked;
 const {changes,remap}=fileRenameChanges(sources,values);
 const scopedKeys=changes.map(c=>CabanonFilenames.key(c.parent)+'/'+CabanonFilenames.key(c.name.split('/').at(-1)));if(new Set(scopedKeys).size!==changes.length||new Set(changes.map(c=>CabanonFilenames.key(c.name))).size!==changes.length){warning('Name already exists');return false;}
 const byName=new Map(changes.map(c=>[c.old,c.name])),map=name=>byName.get(name)||remap(name);
 for(const change of changes){Object.assign(change.entry,{name:change.name,parent:change.parent});if(change.target)change.entry.target=change.target;if(Array.isArray(change.entry.contents)&&!change.entry.archiveSnapshots)change.entry.contents=change.entry.contents.map(remap);}
 if(prefs.desktopItem)prefs.desktopItem.name=map(prefs.desktopItem.name);prefs.fromFilePins=(prefs.fromFilePins||[]).map(map);prefs.desktopLinks=(prefs.desktopLinks||[]).map(map);prefs.files=prefs.files.map(map);prefs.folders=prefs.folders.map(map);prefs.pinnedFiles=(prefs.pinnedFiles||[]).map(map);prefs.recents.forEach(item=>item.name=map(item.name));
 for(const key of ['content','marks','folderViews','folderLocks','folderPermissions'])if(prefs[key])prefs[key]=Object.fromEntries(Object.entries(prefs[key]).map(([name,value])=>[map(name),value]));
 for(const group of prefs.syncGroups||[]){group.source=remap(group.source);group.targets=group.targets.map(remap);}
 if(typeof settingMapShareNames==='function')settingMapShareNames(map);
 fileClipboard.forEach(item=>{item.name=map(item.name);item.parent=remap(item.parent);});
 for(const other of windowMap.values())if(other.dataset.fileBrowser)configureFolder(other,remap(other.dataset.fileBrowser));
 CabanonStorage.moved(byName);persistProfiles();refreshBrowsers();renderDesktop();renderPins();return true;
}

