'use strict';
const typeBeforeDockGroups=windowType;windowType=function(key,win){if(key.startsWith('archive:'))return 'filetype:zip';if(key.startsWith('archive-content:'))return 'filetype:'+glyphFor(key.split(':').at(-1));return typeBeforeDockGroups(key,win);};
function dockWindowItems(type){
 const result=[];
 for(const {win}of taskGroups().get(type)||[]){const state=folderSplits.get(win);
  if(state){for(const pane of state.panes)result.push({win,list:pane.querySelector('.house-file-list'),label:pane.folderPath,current:win===activeWindow&&!win.hidden&&state.active===pane});}
  else{const source=win.dataset.sourceId&&prefs.entries.find(entry=>entry.id===win.dataset.sourceId);result.push({win,list:win.dataset.fileBrowser?win.querySelector('.house-file-list'):null,label:win.dataset.fileBrowser||source?.name||win.querySelector('.window-title>span:last-child')?.textContent||'',current:win===activeWindow&&!win.hidden});}
 }
 return result;
}
function dockItemWindow(item){return item.list?item.list.closest('.window'):item.win;}
function activateDockItem(item){
 const win=dockItemWindow(item);if(!win?.isConnected)return null;
 const pane=item.list?.closest('.folder-pane'),state=folderSplits.get(win);if(pane&&state){activateFolderPane(win,pane);if(state.active!==pane)return null;}
 win.hidden=false;closePanels();focusWindow(win);return win;
}
function dockGroupButton(type){return [...taskbar.children].find(button=>button.dataset.type===type);}
function closeDockItem(item,type){
 const win=activateDockItem(item);if(!win)return;
 if(item.list&&folderSplits.has(win))closeFolderPane(win);else closeShortcutWindow(win);
 const anchor=dockGroupButton(type);if(anchor)showTaskGroup(type,anchor);else taskPopup.hidden=true;
}
showTaskGroup=function(type,button){
 if(!taskPopup.hidden&&taskPopup.dataset.mode==='close-all'&&taskPopup.dataset.groupType===type){placeHoverMenu(taskPopup,button);return;}
 const items=dockWindowItems(type);taskPopup.dockItems=items;taskPopup.replaceChildren();taskPopup.dataset.groupType=type;taskPopup.dataset.mode='windows';
 const count=document.createElement('div');count.className='task-group-count';count.textContent=items.length+' '+(items.length===1?'window':'windows');taskPopup.append(count);
 for(const item of items){
  const row=document.createElement('div');row.className='task-window-row';
  const open=document.createElement('button');open.className='task-window-open';open.classList.toggle('chosen',item.current);open.textContent=item.label;open.title=item.label;open.onclick=()=>{if(activateDockItem(item))taskPopup.hidden=true;};
  const close=document.createElement('button');close.className='task-window-close';close.textContent='×';close.title='Close '+item.label;close.setAttribute('aria-label',close.title);close.onclick=event=>{event.stopPropagation();closeDockItem(item,type);};
  row.append(open,close);taskPopup.append(row);
 }
 taskPopup.hidden=!items.length;placeHoverMenu(taskPopup,button);
};
function closeDockGroup(type){
 const members=[...(taskGroups().get(type)||[])];taskPopup.hidden=true;closeContext();window.dispatchEvent(new Event('document-close-cancel'));
 withoutDocumentClosePrompt(()=>{for(const {win}of members.reverse())if(win.isConnected){if(!closeFolderGroupImmediately(win))closeShortcutWindow(win);}});
 renderTaskbar();
}
const renderBeforeDockPaths=renderTaskbar;
renderTaskbar=function(){
 renderBeforeDockPaths();if(taskPopup.hidden)return;
 const type=taskPopup.dataset.groupType,anchor=dockGroupButton(type);if(!anchor){taskPopup.hidden=true;return;}
 if(taskPopup.dataset.mode==='windows'){const items=dockWindowItems(type),previous=taskPopup.dockItems||[];if(items.length!==previous.length||items.some((item,index)=>['win','list','label','current'].some(key=>item[key]!==previous[index][key])))showTaskGroup(type,anchor);}
 else placeHoverMenu(taskPopup,anchor);
};
renderTaskbar();

function requestDockClose(type){
 const anchor=dockGroupButton(type);if(!anchor)return;closeContext();taskPopup.replaceChildren();taskPopup.dataset.groupType=type;taskPopup.dataset.mode='close-all';
 const action=document.createElement('button');action.className='task-close-all';action.textContent='close all';action.onclick=()=>closeDockGroup(type);taskPopup.append(action);taskPopup.hidden=false;placeHoverMenu(taskPopup,anchor);
}
window.addEventListener('pointerdown',event=>{
 if(event.button!==2)return;const button=event.target.closest('#taskbar>button[data-type]');if(!button)return;
 CabanonRightGesture.onRelease(button,event,()=>requestDockClose(button.dataset.type));
},true);

