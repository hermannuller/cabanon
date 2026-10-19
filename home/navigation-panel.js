'use strict';
const insideNavigation=toggleFolderTools;
toggleFolderTools=function(win,mode='quick'){
 insideNavigation(win,mode);
 const nav=win.querySelector('.house-navigation');if(!nav)return;
 nav.querySelector('.navigation-label')?.remove();
 win.append(nav);nav.style.setProperty('--navigation-width',(win.navigationWidth||200)+'px');
 const edge=document.createElement('div');edge.className='navigation-resize';edge.setAttribute('aria-hidden','true');nav.append(edge);
  edge.onpointerdown=event=>{if(event.button!==0)return;event.preventDefault();event.stopPropagation();focusWindow(win);const start=event.clientX,width=win.navigationWidth||200,scale=$('#desktop').getBoundingClientRect().width/1920;edge.setPointerCapture(event.pointerId);edge.onpointermove=move=>{const delta=win.dataset.navigationMode==='quick'?move.clientX-start:start-move.clientX;win.navigationWidth=Math.max(120,Math.min(800,width+delta/scale));nav.style.setProperty('--navigation-width',win.navigationWidth+'px');};edge.onpointerup=()=>edge.onpointermove=null;edge.onpointercancel=()=>edge.onpointermove=null;};
};
