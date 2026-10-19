'use strict';
function copySelectedFiles(list,cut){
 const names=[...selectionState(list).selected],entries=new Map(prefs.entries.map(entry=>[entry.name,entry]));fileClipboard=names.map(name=>entries.get(name)).filter(Boolean).map(entry=>({name:entry.name,parent:entry.parent}));folderCut=cut;
}
function pasteSelectedFiles(path){
 if(!fileClipboard.length)return;
 return runFileMutation(()=>{const groups=new Map(),cut=folderCut;for(const item of fileClipboard){if(!groups.has(item.parent))groups.set(item.parent,[]);groups.get(item.parent).push(item.name);}for(const [parent,names]of groups)transferFiles(names,parent,path,cut?{action:'move'}:{action:'copy'});if(cut){fileClipboard=[];folderCut=false;}});
}

document.addEventListener('keydown',event=>{
 if(!event.ctrlKey||event.altKey||event.metaKey||!['z','x','c','v'].includes(event.key.toLowerCase())||event.target.closest('input,textarea,[contenteditable="true"]'))return;
 const list=findList(event.target)||activeWindow?.querySelector('.house-file-list');if(!list)return;
 const key=event.key.toLowerCase();event.preventDefault();event.stopImmediatePropagation();loneCtrl=false;
 if(key==='z')undoFolderOperation();else if(key==='v'){if(list.dataset.path)pasteSelectedFiles(list.dataset.path);}else copySelectedFiles(list,key==='x');
},true);
// Copying contents and moving entries are a single undoable operation.
const transferWithSingleUndo=transferFiles;
transferFiles=function(...args){return runFileMutation(()=>transferWithSingleUndo(...args));};
