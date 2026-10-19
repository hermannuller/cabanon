'use strict';
function currentSelectionList(event){if(event.target.closest('input,textarea,[contenteditable="true"]'))return null;if(event.target.closest('#files'))return $('#files');if(activeWindow&&!activeWindow.hidden)return activeWindow.querySelector('.house-file-list');return event.target.closest('#files');}
function selectCurrentFiles(list,invert=false){const items=listItems(list).filter(item=>!item.hidden),state=selectionState(list),previous=state.selected;state.selected=new Set(items.map(itemName).filter(name=>!invert||!previous.has(name)));paintSelection(list);list.focus({preventScroll:true});}
shortcutDefinitions.push(['selectAll','Select all files in current window','CTRL+A']);
shortcutDefinitions.push(['openSelected','Open selected file or folder','ENTER']);
const runBeforeSelection=runShortcut;runShortcut=function(id,event){if(!['selectAll','openSelected'].includes(id))return runBeforeSelection(id,event);const list=currentSelectionList(event);if(!list)return false;if(id==='openSelected'){const selected=[...selectionState(list).selected];if(selected.length===1){const row=listItems(list).find(item=>itemName(item)===selected[0]&&!item.hidden);if(row)openFile(selected[0],{sourceList:list});}return true;}selectCurrentFiles(list);return true;};
let inverseSelectionGesture=null;
window.addEventListener('keydown',event=>{
 if(fileGesture?.mode==='box'&&fileGesture.moved){inverseSelectionGesture=null;return;}
 if(event.key==='Shift'&&event.ctrlKey&&!event.altKey&&!event.metaKey&&!event.repeat){const list=currentSelectionList(event);inverseSelectionGesture=list?{list,win:activeWindow}:null;loneCtrl=false;loneShortcutModifier=null;}
 else if(!['Shift','Control'].includes(event.key))inverseSelectionGesture=null;
},true);
window.addEventListener('pointerdown',()=>inverseSelectionGesture=null,true);
window.addEventListener('keyup',event=>{if(event.key!=='Shift')return;if(fileGesture?.mode==='box'&&fileGesture.moved){inverseSelectionGesture=null;return;}const pending=inverseSelectionGesture;inverseSelectionGesture=null;if(!pending||!event.ctrlKey||pending.win!==activeWindow||pending.list!==currentSelectionList(event))return;event.preventDefault();selectCurrentFiles(pending.list,true);loneCtrl=false;loneShortcutModifier=null;},true);
addEventListener('blur',()=>inverseSelectionGesture=null);
