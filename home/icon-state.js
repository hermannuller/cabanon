'use strict';
function decoratePinnedIcons(root=document){
 prefs.pinnedFiles ||= [];
 const selector='[data-entry],[data-file],[data-folder],[data-search-file],[data-app]';
 const items=[...(root.matches?.(selector)?[root]:[]),...root.querySelectorAll(selector)];
 for(const item of items){
  const name=item.dataset.entry||item.dataset.file||item.dataset.folder||item.dataset.searchFile;
  const shortcutLocation=item.closest('#pinned,#folders,#files');
  const pinned=Boolean(!shortcutLocation&&item.dataset.app&&prefs.pins.includes(item.dataset.app));
  if(item.classList.contains('pinned-icon')!==pinned)item.classList.toggle('pinned-icon',pinned);
 }
}
const pinContext=showContext;showContext=function(event,items){const item=event.target.closest('[data-entry],[data-file],[data-search-file]');const name=item&&(item.dataset.entry||item.dataset.file||item.dataset.searchFile);if(name&&!fileIsFolder(name))items=items.map(action=>action[0]==='Pin'?['Pin',()=>{prefs.pinnedFiles ||= [];const list=item.closest('.house-file-list');const names=list&&selectionState(list).selected.has(name)?[...selectionState(list).selected]:[name];prefs.pinnedFiles=[...new Set([...prefs.pinnedFiles,...names])];action[1]();persistProfiles();decoratePinnedIcons();}]:action);pinContext(event,items);};
new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1)decoratePinnedIcons(node);}).observe($('#desktop'),{childList:true,subtree:true});
let pinStateSignature='';
const savePinIcons=persistProfiles;
persistProfiles=function(){savePinIcons();const signature=JSON.stringify([prefs.pins,prefs.folders,prefs.pinnedFiles]);if(signature!==pinStateSignature){pinStateSignature=signature;decoratePinnedIcons();}};
decoratePinnedIcons();
