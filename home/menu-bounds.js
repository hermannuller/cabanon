'use strict';
const boundedMenuSelector='#flyout,#context-menu,.new-types,#sync-popover,#task-popup,.rive-menu';
function fitMenuToDesktop(menu){
 if(menu.hidden||!menu.getClientRects().length)return;
 const desktop=$('#desktop').getBoundingClientRect(),scale=desktop.width/1920;
 const set=(property,value)=>{if(menu.style[property]!==value)menu.style[property]=value;};
 set('maxWidth','1912px');set('maxHeight','1072px');set('boxSizing','border-box');
 const translation=(menu.style.translate||'0px 0px').split(/\s+/).map(parseFloat);const tx=translation[0]||0,ty=translation[1]||0;
 const rect=menu.getBoundingClientRect();const left=(rect.left-desktop.left)/scale-tx,top=(rect.top-desktop.top)/scale-ty,width=rect.width/scale,height=rect.height/scale;
 const targetLeft=Math.max(4,Math.min(1920-4-width,left)),targetTop=Math.max(4,Math.min(1080-4-height,top));
 const round=value=>Math.round(value*1000)/1000;
 set('translate',`${round(targetLeft-left)}px ${round(targetTop-top)}px`);
 set('overflowY',height>=1071.5&&menu.scrollHeight>menu.clientHeight+1?'auto':'visible');
 set('overflowX',width>=1911.5&&menu.scrollWidth>menu.clientWidth+1?'auto':'visible');
}
let fittingMenus=false;
function fitAllMenus(){if(fittingMenus)return;fittingMenus=true;try{document.querySelectorAll(boundedMenuSelector).forEach(fitMenuToDesktop);}finally{fittingMenus=false;}}
const menuResizeObserver=new ResizeObserver(entries=>entries.forEach(entry=>fitMenuToDesktop(entry.target)));
const trackedMenus=new Set();
function trackMenus(){document.querySelectorAll(boundedMenuSelector).forEach(menu=>{if(!trackedMenus.has(menu)){trackedMenus.add(menu);menuResizeObserver.observe(menu);}});fitAllMenus();}
new MutationObserver(records=>{const changed=new Set();for(const record of records){if(record.target.closest?.('#drag-tether,#gesture-action-hint,.file-selection-frame'))continue;const menu=record.target.closest?.(boundedMenuSelector);if(menu)changed.add(menu);for(const node of record.addedNodes||[])if(node.nodeType===1){if(node.matches(boundedMenuSelector))changed.add(node);node.querySelectorAll(boundedMenuSelector).forEach(item=>changed.add(item));}}if(records.some(record=>record.removedNodes?.length))for(const menu of trackedMenus)if(!menu.isConnected){menuResizeObserver.unobserve(menu);trackedMenus.delete(menu);}for(const menu of changed){if(!menu.isConnected)continue;if(!trackedMenus.has(menu)){trackedMenus.add(menu);menuResizeObserver.observe(menu);}fitMenuToDesktop(menu);}}).observe($('#desktop'),{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','style','class']});
addEventListener('resize',fitAllMenus);
for(const name of ['showContext','showFlyout','showSyncPaths','showTaskGroup','showNewTypes']){
 const original=window[name];if(typeof original==='function')window[name]=function(...args){const result=original(...args);trackMenus();return result;};
}
trackMenus();



