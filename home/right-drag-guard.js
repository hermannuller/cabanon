
'use strict';
// Registered before application handlers: dragging and context-clicking are exclusive.
(()=>{let gesture=null;
 function onRelease(node,event,action){event.preventDefault();event.stopPropagation();node.setPointerCapture(event.pointerId);let done=false;const finish=e=>{if(done)return;done=true;node.removeEventListener('pointerup',finish);node.removeEventListener('pointercancel',finish);removeEventListener('blur',finish);if(node.hasPointerCapture(event.pointerId))node.releasePointerCapture(event.pointerId);if(e.type!=='pointerup'||gesture?.moved)return;if(gesture)gesture.handled=true;action(e);};node.addEventListener('pointerup',finish);node.addEventListener('pointercancel',finish);addEventListener('blur',finish);}
 window.CabanonRightGesture={onRelease,suppress:()=>!!gesture?.moved,menuShown:()=>{if(gesture)gesture.handled=true;}};
 addEventListener('pointerdown',e=>{gesture=e.button===2?{x:e.clientX,y:e.clientY,moved:false}:null;},true);
 addEventListener('pointermove',e=>{if(!gesture||!(e.buttons&2))return;if(Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>=6){gesture.moved=true;if(typeof closeContext==='function')closeContext();}},true);
 addEventListener('contextmenu',e=>{if(gesture?.moved){e.preventDefault();e.stopImmediatePropagation();if(typeof closeContext==='function')closeContext();return;}if(gesture?.handled||e.target.closest('.river-app [data-post],.rive-message,.pending-quote')){e.preventDefault();e.stopImmediatePropagation();}},true);
 addEventListener('blur',()=>{gesture=null;});
})();
