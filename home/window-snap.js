'use strict';
const snapPreview=document.createElement('div');snapPreview.id='window-snap-preview';snapPreview.hidden=true;snapPreview.setAttribute('aria-hidden','true');$('#desktop').append(snapPreview);
function snapTargetAt(x,y){
 if(x<0||y<0||x>1920||y>1080)return null;
 const left=x<=150,right=x>=1770,top=y<=150,bottom=y>=930;
 if((left||right)&&(top||bottom))return {left:left?0:960,top:top?0:504,width:960,height:504,type:'quarter'};
 if(y<=20)return {left:0,top:0,width:1920,height:1008,type:'max'};
 if(x<=20)return {left:0,top:0,width:960,height:1008,type:'half'};
 if(x>=1900)return {left:960,top:0,width:960,height:1008,type:'half'};
 if(y>=1060)return {left:0,top:504,width:1920,height:504,type:'half'};
 return null;
}
function paintSnapPreview(target,win){if(!target){snapPreview.hidden=true;return;}const first=snapPreview.hidden;snapPreview.hidden=false;if(first&&win){snapPreview.style.transition='none';Object.assign(snapPreview.style,{left:win.offsetLeft+'px',top:win.offsetTop+'px',width:win.offsetWidth+'px',height:win.offsetHeight+'px'});void snapPreview.offsetWidth;snapPreview.style.transition='';}Object.assign(snapPreview.style,{left:target.left+'px',top:target.top+'px',width:target.width+'px',height:target.height+'px'});}
const moveWithoutSnap=startWindowMove;
startWindowMove=function(win,handle,event){
 if(win.dataset.key==='app:CALC')return moveWithoutSnap(win,handle,event);
 if(win.classList.contains('maximized')||win.dataset.snap){
  event.preventDefault();event.stopPropagation();focusWindow(win);handle.setPointerCapture(event.pointerId);
  const desktop=$('#desktop').getBoundingClientRect(),scale=desktop.width/1920;
  const cursorX=(event.clientX-desktop.left)/scale,ratio=Math.max(0,Math.min(1,(cursorX-win.offsetLeft)/win.offsetWidth));
  const original=win.snapRestoreRect||win.restoreRect||{left:'360px',top:'110px',width:'900px',height:'650px'};
  const stop=()=>{handle.removeEventListener('pointermove',restore);handle.removeEventListener('pointerup',stop);handle.removeEventListener('pointercancel',stop);};
  const restore=move=>{
   if(Math.hypot(move.clientX-event.clientX,move.clientY-event.clientY)<=4)return;
   stop();const width=parseFloat(original.width)||900;
   win.classList.remove('maximized');delete win.dataset.snap;
   Object.assign(win.style,{width:original.width,height:original.height,left:(Math.max(0,Math.min(1920,(move.clientX-desktop.left)/scale))-width*ratio)+'px',top:(Math.max(0,Math.min(1080,(move.clientY-desktop.top)/scale))-Math.min(20,(event.clientY-desktop.top)/scale-win.offsetTop))+'px'});
   const continuation={clientX:move.clientX,clientY:move.clientY,pointerId:move.pointerId,button:event.button,preventDefault:()=>{},stopPropagation:()=>{}};
   startWindowMove(win,handle,continuation);
  };
  handle.addEventListener('pointermove',restore);handle.addEventListener('pointerup',stop);handle.addEventListener('pointercancel',stop);return;
 }
 const desktop=$('#desktop').getBoundingClientRect(),scale=desktop.width/1920;
 const originalRect={left:win.style.left,top:win.style.top,width:win.style.width,height:win.style.height};
 let target=null,moved=false;
 const preview=move=>{moved ||= Math.hypot(move.clientX-event.clientX,move.clientY-event.clientY)>4;target=moved?snapTargetAt((move.clientX-desktop.left)/scale,(move.clientY-desktop.top)/scale):null;paintSnapPreview(target,win);};
 const finish=up=>{handle.removeEventListener('pointermove',preview);handle.removeEventListener('pointerup',finish);handle.removeEventListener('pointercancel',cancel);paintSnapPreview(null);if(target&&up.type==='pointerup'){win.snapRestoreRect=originalRect;if(target.type==='max'){win.restoreRect=originalRect;win.classList.add('maximized');}Object.assign(win.style,{left:target.left+'px',top:target.top+'px',width:target.width+'px',height:target.height+'px'});win.dataset.snap=target.type;focusWindow(win);}};
 const cancel=()=>{target=null;finish({type:'pointercancel'});};
 moveWithoutSnap(win,handle,event);handle.addEventListener('pointermove',preview);handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',cancel);
};
