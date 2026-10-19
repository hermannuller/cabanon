'use strict';
const typeBeforeDockGroups=windowType;windowType=function(key,win){if(key.startsWith('archive:'))return 'filetype:zip';if(key.startsWith('archive-content:'))return 'filetype:'+glyphFor(key.split(':').at(-1));return typeBeforeDockGroups(key,win);};
const taskBeforeCount=showTaskGroup;showTaskGroup=function(type,button){taskBeforeCount(type,button);const members=taskGroups().get(type)||[];taskPopup.dataset.groupType=type;const count=document.createElement('div');count.className='task-group-count';count.textContent=members.length+' '+(members.length===1?'window':'windows');taskPopup.prepend(count);placeHoverMenu(taskPopup,button);};
function closeDockGroup(type){const members=[...(taskGroups().get(type)||[])];taskPopup.hidden=true;for(const {win}of members)closeShortcutWindow(win);renderTaskbar();}
renderTaskbar();

function requestDockClose(type){
 const members=taskGroups().get(type)||[];taskPopup.hidden=true;closeContext();
 if(members.length>1)confirmRemoval('close all',()=>closeDockGroup(type));
 else if(members.length===1){closeShortcutWindow(members[0].win);renderTaskbar();}
}
window.addEventListener('pointerdown',event=>{
 if(event.button!==2)return;const button=event.target.closest('#taskbar>button[data-type]');if(!button)return;
 CabanonRightGesture.onRelease(button,event,()=>requestDockClose(button.dataset.type));
},true);
