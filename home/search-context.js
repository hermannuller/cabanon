'use strict';
let replaySearchContext=false;
window.addEventListener('contextmenu',event=>{
 if(replaySearchContext||event.target.closest('#recent-files'))return;const row=event.target.closest('#file-results [data-search-file],#file-results [data-app],#recent-files [data-search-file]');if(!row||!(row.dataset.app?fileClickHit(event,row):fileContentHit(event,row)))return;
 event.preventDefault();event.stopImmediatePropagation();replaySearchContext=true;
 try{if(row.dataset.app){const clone=row.cloneNode(true);$('#app-grid').append(clone);const info={type:CTX.ALL_APP,name:row.dataset.app},resolver=resolveContext;resolveContext=()=>info;try{clone.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:event.clientX,clientY:event.clientY}));}finally{resolveContext=resolver;clone.remove();}clearContextIcon();contextIconTarget=row;row.classList.add('context-icon-active');return;}
 const entry=prefs.entries.find(entry=>entry.name===row.dataset.searchFile);if(!entry)return;const list=row.closest('#file-results,#recent-files');list.classList.add('house-file-list');list.dataset.path=entry.parent;row.dataset.entry=entry.name;chooseItem(list,row,{ctrlKey:false,shiftKey:false});
 const label=row.querySelector(':scope > span:last-child').getBoundingClientRect();row.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:label.left+1,clientY:event.clientY}));const desktop=$('#desktop').getBoundingClientRect(),scale=desktop.width/1920;context.style.left=(event.clientX-desktop.left)/scale+'px';context.style.top=(event.clientY-desktop.top)/scale+'px';fitMenuToDesktop(context);list.classList.remove('house-file-list');delete list.dataset.path;delete row.dataset.entry;
 }finally{replaySearchContext=false;}
},true);


