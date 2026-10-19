'use strict';
function finishSelectionBox(event,cancel=false){const gesture=fileGesture;if(gesture?.mode==='box'){
 if(!cancel)flushSelectionBox(gesture);else if(gesture.boxFrame)cancelAnimationFrame(gesture.boxFrame);
 gesture.frame?.remove();
 if(!cancel&&!gesture.moved&&gesture.button===0){if(gesture.item)chooseItem(gesture.list,gesture.item,gesture.modifiers);else{selectionState(gesture.list).selected.clear();paintSelection(gesture.list);}}
 if(gesture.moved){suppressFileClick=true;setTimeout(()=>suppressFileClick=false,0);}
 fileGesture=null;gesture.onFinish?.(cancel,event,gesture);if(gesture.list.hasPointerCapture(gesture.pointerId))gesture.list.releasePointerCapture(gesture.pointerId);
 }document.querySelectorAll('.file-selection-frame').forEach(frame=>frame.remove());}
window.addEventListener('pointerup',event=>finishSelectionBox(event),true);
window.addEventListener('pointercancel',event=>finishSelectionBox(event,true),true);
window.addEventListener('dragend',event=>finishSelectionBox(event,true),true);
window.addEventListener('pointerdown',event=>{if(event.button===0)finishSelectionBox(event,true);},true);
window.addEventListener('blur',event=>finishSelectionBox(event,true));
window.addEventListener('keydown',event=>{if(event.key==='Escape')finishSelectionBox(event,true);},true);
document.addEventListener('lostpointercapture',event=>{if(fileGesture?.mode==='box'&&fileGesture.pointerId===event.pointerId)finishSelectionBox(event,true);},true);
new MutationObserver(()=>{if(fileGesture?.mode==='box'&&!fileGesture.list.isConnected)finishSelectionBox(null,true);}).observe($('#windows'),{childList:true,subtree:true});
