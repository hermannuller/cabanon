'use strict';
// Cut feedback follows clipboard membership, independently of file selection.
window.CabanonFileCut=(()=>{
 const selector='.file[data-entry],.file[data-file],.file[data-search-file],.file[data-save-entry],.file[data-wall-entry],.folder-row[data-folder]';
 let queued=false;
 function refresh(){
  queued=false;const names=new Set(folderCut?fileClipboard.map(item=>item.name):[]);
  for(const row of document.querySelectorAll(selector)){
   const name=row.dataset.entry||row.dataset.file||row.dataset.searchFile||row.dataset.saveEntry||row.dataset.wallEntry||row.dataset.folder;
   const cut=names.has(name);if(row.classList.contains('file-cut-pending')!==cut)row.classList.toggle('file-cut-pending',cut);
   // Replace the paragraph view's former static 40% opacity as well.
   if(row.classList.contains('paragraph-cut')&&!cut)row.classList.remove('paragraph-cut');
  }
 }
 // Wait until all handlers for the input event have updated the clipboard.
 function schedule(){if(queued)return;queued=true;requestAnimationFrame(refresh);}
 for(const type of ['keydown','keyup','click','pointerup','contextmenu','drop'])addEventListener(type,schedule,true);
 new MutationObserver(records=>{if(records.some(record=>record.type==='childList'||record.attributeName!=='class'||record.target.classList.contains('paragraph-file')))schedule();}).observe($('#desktop'),{subtree:true,childList:true,attributes:true,attributeFilter:['data-entry','data-file','data-folder','data-search-file','data-save-entry','data-wall-entry','class']});
 const copy=copySelectedFiles;copySelectedFiles=function(...args){try{return copy(...args);}finally{schedule();}};
 const paste=pasteSelectedFiles;pasteSelectedFiles=function(...args){try{return paste(...args);}finally{schedule();}};
 const moved=CabanonStorage.moved;CabanonStorage.moved=function(...args){try{return moved(...args);}finally{schedule();}};
 const switchProfile=switchUser;switchUser=function(...args){const user=prefs.user;const result=switchProfile(...args);if(prefs.user!==user){fileClipboard=[];folderCut=false;schedule();}return result;};
 refresh();return{refresh};
})();
