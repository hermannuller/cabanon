'use strict';
// Capture before shortcut handlers that can consume keyboard or pointer events.
window.CabanonModifierTap=(()=>{
 const held=new Set();let candidate=null,buttons=0,released=null,allowed=false;
 function invalidate(){candidate=null;}
 addEventListener('keydown',event=>{if(!['Control','Alt'].includes(event.key)){invalidate();return;}if(event.repeat)return;const code=event.code||event.key,first=!held.size;held.add(code);const pure=event.key==='Control'?!event.altKey&&!event.shiftKey&&!event.metaKey:!event.ctrlKey&&!event.shiftKey&&!event.metaKey;candidate=first&&pure&&!buttons&&!window.CabanonFromKey?.held?{code,win:activeWindow}:null;},true);
 addEventListener('keyup',event=>{if(!['Control','Alt'].includes(event.key))return;held.delete(event.code||event.key);released=event;allowed=!held.size&&candidate?.code===(event.code||event.key)&&candidate.win===activeWindow;invalidate();},true);
 for(const type of ['pointermove','wheel','contextmenu','dragstart','touchstart'])addEventListener(type,invalidate,{capture:true,passive:true});
 addEventListener('pointerdown',event=>{buttons=event.buttons;invalidate();},true);
 addEventListener('pointerup',event=>{buttons=event.buttons;invalidate();},true);
 addEventListener('pointercancel',()=>{buttons=0;invalidate();},true);
 addEventListener('cabanon-from-key',invalidate,true);
 addEventListener('blur',()=>{held.clear();buttons=0;invalidate();},true);
 return{allowed:event=>released===event&&Boolean(allowed),get active(){return held.size>0||buttons>0;}};
})();
