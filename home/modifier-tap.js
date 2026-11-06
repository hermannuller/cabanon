'use strict';
// Capture before shortcut handlers that can consume keyboard or pointer events.
window.CabanonModifierTap=(()=>{
 const held=new Set();let candidate=null,buttons=0,released=null,allowed=false;
 function invalidate(){candidate=null;}
 // Selection and scrolling are transient. Compare document/location state only
 // at input boundaries, so a failed drop or pointer motion is not an action.
 function actionState(){return JSON.stringify({entries:prefs.entries,files:prefs.files,folders:prefs.folders,desktopItem:prefs.desktopItem,windows:[...windowMap].map(([key,win])=>[key,win.hidden,win.dataset.fileBrowser,win.dataset.navigationMode,...['left','top','width','height'].map(property=>win.style[property])])});}
 function checkAction(){if(candidate&&(candidate.state!==actionState()||(typeof pendingFileRemovals!=='undefined'&&pendingFileRemovals.size)))invalidate();}
 addEventListener('keydown',event=>{if(!['Control','Alt'].includes(event.key)){invalidate();return;}if(event.repeat)return;const code=event.code||event.key,first=!held.size;held.add(code);const pure=event.key==='Control'?!event.altKey&&!event.shiftKey&&!event.metaKey:!event.ctrlKey&&!event.shiftKey&&!event.metaKey;candidate=first&&pure&&!window.CabanonFromKey?.held?{code,win:activeWindow,state:actionState()}:null;},true);
 addEventListener('keyup',event=>{if(!['Control','Alt'].includes(event.key))return;checkAction();held.delete(event.code||event.key);released=event;allowed=!held.size&&!buttons&&candidate?.code===(event.code||event.key)&&candidate.win===activeWindow;invalidate();},true);
 addEventListener('pointerdown',event=>{buttons=event.buttons;},true);
 addEventListener('pointerup',event=>{buttons=event.buttons;queueMicrotask(checkAction);},true);
 for(const type of ['click','dblclick','drop'])addEventListener(type,()=>queueMicrotask(checkAction),true);
 addEventListener('contextmenu',invalidate,true);
 addEventListener('pointercancel',()=>{buttons=0;invalidate();},true);
 addEventListener('cabanon-from-key',invalidate,true);
 addEventListener('blur',event=>{if(event.target!==window)return;held.clear();buttons=0;invalidate();},true);
 return{allowed:event=>released===event&&Boolean(allowed),get active(){return held.size>0||buttons>0;}};
})();
