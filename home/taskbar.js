'use strict';
const taskbar=document.createElement('nav');taskbar.id='taskbar';taskbar.setAttribute('aria-label','Open windows');$('#desktop').append(taskbar);
function renderTaskbar(){
 const keys=[...windowMap.keys()];
 const existing=[...taskbar.children].map(button=>button.dataset.window);
 if(keys.join('\n')!==existing.join('\n')){
  taskbar.replaceChildren();windowMap.forEach((win,key)=>{
   const button=document.createElement('button');button.dataset.window=key;button.title=win.querySelector('.window-title>span:last-child')?.textContent||'';button.setAttribute('aria-label',button.title);const svg=win.querySelector('.window-title > .app-motion,.window-title > .colors-icon,.window-title > svg');button.innerHTML=svg?svg.outerHTML:icon('text');
   button.onclick=()=>{closePanels();win.hidden=false;focusWindow(win);};taskbar.append(button);
  });
 }
 for(const button of taskbar.children){const win=windowMap.get(button.dataset.window);button.classList.toggle('current',win===activeWindow&&!win.hidden);button.setAttribute('aria-pressed',win===activeWindow&&!win.hidden);}
}
new MutationObserver(()=>renderTaskbar()).observe($('#windows'),{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']});
const focusWithTaskbar=focusWindow;focusWindow=function(win){focusWithTaskbar(win);renderTaskbar();};
const createWithTaskbar=createWindow;createWindow=function(key,title,glyph,content){const win=createWithTaskbar(key,title,glyph,content);renderTaskbar();return win;};
$('#all-apps header').addEventListener('click',event=>{if(!event.target.closest('input,#app-sort'))showFrom();});
$('#all-apps').addEventListener('click',event=>{const rect=$('#all-apps header').getBoundingClientRect();if(event.target===$('#all-apps')&&event.clientY<=rect.bottom)showFrom();});
renderTaskbar();
