'use strict';
// Internal pointer dragging avoids Windows' non-customizable native no-drop cursor.
let pointerFileDrag=null;
function cancelPointerFileDrag(){clearTimeout(pointerFileDrag?.headerTimer);clearTimeout(pointerFileDrag?.folderTimer);pointerFileDrag=null;draggedFiles=null;dropHint.hidden=true;$('#desktop').classList.remove('file-pointer-drag');clearDropFolder();window.CabanonDragFeedback?.end();}
addEventListener('pointercancel',cancelPointerFileDrag,true);addEventListener('blur',cancelPointerFileDrag);
addEventListener('pointerdown',event=>{const list=event.target.closest('.house-file-list'),item=event.target.closest('[data-entry],[data-file]');if(![0,2].includes(event.button)||!list||!item||!fileDragStartHit(event,item)||list.dataset.view==='paragraph'&&event.button===0)return;pointerFileDrag={list,item,x:event.clientX,y:event.clientY,started:false,button:event.button,action:event.button===2?rightFilePreferences().drag:'move',pointerId:event.pointerId,transfer:new DataTransfer()};},true);
addEventListener('dragstart',event=>{if(pointerFileDrag)event.preventDefault();},true);
addEventListener('pointermove',event=>{
 const drag=pointerFileDrag;if(!drag)return;if(!(event.buttons&(drag.button===2?2:1))){cancelPointerFileDrag();return;}if(!drag.started&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)<6)return;
 if(!drag.started){closeContext();const state=selectionState(drag.list);if(!state.selected.has(itemName(drag.item)))chooseItem(drag.list,drag.item,{ctrlKey:false,shiftKey:false});draggedFiles={names:[...state.selected],source:drag.list.id==='files'?'@desktop':drag.list.dataset.path,action:drag.action};fileGesture?.frame?.remove();fileGesture=null;drag.started=true;$('#desktop').classList.add('file-pointer-drag');}
 drag.lastX=event.clientX;drag.lastY=event.clientY;updateDragFolderHover(drag,event);if(window.routeFileHeaderDrag?.(drag,event))return;
 if(drag.action==='delete'){window.CabanonDragFeedback?.present(event,dragSummary()+' > Delete');return;}
 const target=document.elementFromPoint(event.clientX,event.clientY),archive=target?.closest('.archive-list'),rive=target&&window.riveFileDropTarget?.(target),hit=target?dropTarget({target,clientX:event.clientX,clientY:event.clientY}):null;const blocked=archive?!canAddToArchive(archive.dataset.archive,draggedFiles.names):!rive&&(!hit||hit.blocked);drag.blocked=blocked;
 if(target){target.dispatchEvent(new DragEvent('dragover',{bubbles:true,cancelable:true,clientX:event.clientX,clientY:event.clientY,dataTransfer:drag.transfer}));}
 if(blocked)window.CabanonDragFeedback?.present(event,"   X   ");
},true);
addEventListener('pointerup',event=>{const drag=pointerFileDrag;if(!drag)return;clearTimeout(drag.headerTimer);clearTimeout(drag.folderTimer);pointerFileDrag=null;if(drag.started){const target=document.elementFromPoint(event.clientX,event.clientY);if(drag.specialDrop)drag.specialDrop();else if(drag.action==='delete')rightRemoveFiles([...draggedFiles.names]);else if(target&&!drag.blocked)target.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,clientX:event.clientX,clientY:event.clientY,dataTransfer:drag.transfer}));suppressFileClick=true;setTimeout(()=>suppressFileClick=false,0);window.dispatchEvent(new Event('dragend'));draggedFiles=null;dropHint.hidden=true;$('#desktop').classList.remove('file-pointer-drag');}},true);




const filePointerContext=showContext;showContext=function(event,...args){if(pointerFileDrag?.started||(suppressFileClick&&event.target.closest('.house-file-list'))){event.preventDefault();return;}return filePointerContext(event,...args);};

function updateDragFolderHover(drag,event){
 const target=document.elementFromPoint(event.clientX,event.clientY),row=target?.closest('.house-file-list [data-entry]'),entry=row&&prefs.entries.find(e=>e.name===row.dataset.entry),hit=target&&dropTarget({target,clientX:event.clientX,clientY:event.clientY}),path=entry?.folder&&!hit?.blocked&&!hit?.insert&&hit?.path===entry.name?entry.name:null;
 if(!path){clearTimeout(drag.folderTimer);drag.hoverPath=null;return;}
 if(drag.hoverPath===path)return;clearTimeout(drag.folderTimer);drag.hoverPath=path;
 drag.folderTimer=setTimeout(()=>{if(pointerFileDrag!==drag||drag.hoverPath!==path)return;const list=row.closest('.house-file-list'),win=list.closest('.window');if(!win)return;drag.hoverPath=null;drag.specialDrop=null;configureFolder(win,path);window.dispatchEvent(new PointerEvent('pointermove',{clientX:drag.lastX,clientY:drag.lastY,buttons:drag.button===2?2:1,pointerId:drag.pointerId||event.pointerId}));},1000);
}
