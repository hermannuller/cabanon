'use strict';
const beforeResizeWindow=createWindow;
createWindow=function(key,title,glyph,content){
 const win=beforeResizeWindow(key,title,glyph,content);
 if(key==='app:CALC'||win.querySelector('.window-resize'))return win;
 for(const direction of ['n','s','w','e','nw','ne','sw','se']){
  const handle=document.createElement('div');handle.className='window-resize resize-'+direction;handle.setAttribute('aria-hidden','true');win.append(handle);
  handle.onpointerdown=event=>{
   if(event.button!==0||win.classList.contains('maximized'))return;
   event.preventDefault();event.stopPropagation();focusWindow(win);
   const scale=$('#desktop').getBoundingClientRect().width/1920;
   const start={x:event.clientX,y:event.clientY,left:win.offsetLeft,top:win.offsetTop,width:win.offsetWidth,height:win.offsetHeight};
   const css=getComputedStyle(win),minWidth=parseFloat(css.minWidth)||380,minHeight=parseFloat(css.minHeight)||260;
   handle.setPointerCapture(event.pointerId);handle.classList.add('resizing');
   handle.onpointermove=move=>{
    const dx=(move.clientX-start.x)/scale,dy=(move.clientY-start.y)/scale;
    let left=start.left,top=start.top,right=start.left+start.width,bottom=start.top+start.height;
    if(direction.includes('w'))left=Math.max(0,Math.min(right-minWidth,start.left+dx));
    if(direction.includes('e'))right=Math.min(1920,Math.max(left+minWidth,right+dx));
    if(direction.includes('n'))top=Math.max(0,Math.min(bottom-minHeight,start.top+dy));
    if(direction.includes('s'))bottom=Math.min(1080,Math.max(top+minHeight,bottom+dy));
    Object.assign(win.style,{left:left+'px',top:top+'px',width:right-left+'px',height:bottom-top+'px'});
   };
   const finish=()=>{handle.onpointermove=null;handle.classList.remove('resizing');};handle.onpointerup=finish;handle.onpointercancel=finish;
  };
 }
 return win;
};
