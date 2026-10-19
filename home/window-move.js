'use strict';
function startWindowMove(win,handle,event){
 if(win.classList.contains('maximized'))return;
 event.preventDefault();event.stopPropagation();focusWindow(win);
 const desktop=$('#desktop').getBoundingClientRect(),scale=desktop.width/1920;
 const clampX=x=>Math.max(desktop.left,Math.min(desktop.right,x)),clampY=y=>Math.max(desktop.top,Math.min(desktop.bottom,y));
 const start={x:clampX(event.clientX),y:clampY(event.clientY),left:win.offsetLeft,top:win.offsetTop};
 handle.setPointerCapture(event.pointerId);
 const move=event=>{win.style.left=start.left+(clampX(event.clientX)-start.x)/scale+'px';win.style.top=start.top+(clampY(event.clientY)-start.y)/scale+'px';};
 const finish=event=>{handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',finish);handle.removeEventListener('pointercancel',finish);if(handle.hasPointerCapture(event.pointerId))handle.releasePointerCapture(event.pointerId);};
 handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',finish);
}
function enableWindowMoving(win){
 const header=win.querySelector('.titlebar'),title=win.querySelector('.window-title');
 title.onpointerdown=event=>{if(event.button!==0||event.target.closest('svg'))return;startWindowMove(win,title,event);};
 if(!header.blankMoveReady){header.blankMoveReady=true;header.addEventListener('pointerdown',event=>{if(event.button!==0||win.classList.contains('code-mode')||event.target.closest('button,svg,input,textarea,.shortcut-icon'))return;event.stopImmediatePropagation();startWindowMove(win,header,event);},true);}
 if(!header.rightMoveReady){header.rightMoveReady=true;header.addEventListener('pointerdown',event=>{if(event.button!==2)return;event.stopImmediatePropagation();startWindowMove(win,header,event);},true);header.addEventListener('contextmenu',event=>event.preventDefault());}
}
const movableWindows=createWindow;createWindow=function(key,title,glyph,content){const win=movableWindows(key,title,glyph,content);enableWindowMoving(win);return win;};
