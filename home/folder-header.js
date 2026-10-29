'use strict';
function folderHeaderAction(win,key){
 rememberFolder(win,win.dataset.fileBrowser);const history=folderHistories.get(win);
 if(key==='up'){const path=win.dataset.fileBrowser;if(path!=='/house')configureFolder(win,path.slice(0,path.lastIndexOf('/'))||'/house');return;}
 const next=history.index+(key==='back'?-1:1);if(next<0||next>=history.paths.length)return;
 folderHistoryReplay=true;try{configureFolder(win,history.paths[next]);history.index=next;}finally{folderHistoryReplay=false;}
}
function attachFolderHeader(win){
 const title=win.querySelector('.window-title'),label=title.querySelector('span');title.style.minWidth='0';label.classList.add('folder-title-name');label.title=label.textContent;title.querySelector('svg').setAttribute('title',label.textContent);title.title=label.textContent;
 if(win.querySelector('.folder-header-actions'))return;
 const bar=document.createElement('div');bar.className='folder-header-actions';
 for(const [key,name]of [['back','Back'],['forward','Forward'],['up','Up'],['new','New'],['search','Search']]){
 const button=document.createElement('button');button.title=name;button.dataset.folderAction=key;button.innerHTML=cssIcon(key);button.onpointerdown=e=>{if(e.button===0)e.stopPropagation();};button.ondblclick=e=>e.stopPropagation();if(key==='new')button.onpointerenter=()=>showHeaderNew(win,button);button.onclick=()=>{if(key==='new'){showHeaderNew(win,button);return;}if(key!=='search'){folderHeaderAction(win,key);return;}let search=win.querySelector('.folder-local-search');if(!search){search=document.createElement('input');search.className='folder-local-search';search.placeholder='Search';search.setAttribute('aria-label','Search this folder');search.oninput=()=>{const parsed=fileSearchQuery(search.value);for(const row of folderPaneRoot(win).querySelectorAll('.house-file-list .file'))row.hidden=!fileSearchMatch(row.dataset.entry,parsed);};win.append(search);}else search.hidden=!search.hidden;if(!search.hidden){const scale=document.querySelector("#desktop").getBoundingClientRect().width/1920;search.style.left=(button.getBoundingClientRect().left-win.getBoundingClientRect().left)/scale+'px';search.focus({preventScroll:true});}};bar.append(button);
 }
 title.after(bar);
}
const headerFolderConfigure=configureFolder;configureFolder=function(win,path){const result=headerFolderConfigure(win,path);attachFolderHeader(win);const search=win.querySelector('.folder-local-search');if(search){search.value='';search.hidden=true;}return result;};
function unsyncFolder(path){
 const group=(prefs.syncGroups||[]).find(g=>[g.source,...g.targets].includes(path));if(!group)return;
 const source=group.source,entries=prefs.entries.filter(e=>e.parent===source||e.parent.startsWith(source+'/'));
 const materialize=target=>{for(const original of entries){const entry={...original,parent:target+original.parent.slice(source.length)};if(original.folder)entry.name=target+folderPath(original.name).slice(source.length);prefs.entries.push(entry);}};
 if(path===source){const next=group.targets[0];materialize(next);group.source=next;group.targets=group.targets.slice(1);if(!group.targets.length)prefs.syncGroups=prefs.syncGroups.filter(g=>g!==group);}else{materialize(path);group.targets=group.targets.filter(t=>t!==path);if(!group.targets.length)prefs.syncGroups=prefs.syncGroups.filter(g=>g!==group);}
 persistProfiles();refreshBrowsers();renderDesktop();decorateSyncFolders();syncPopover.hidden=true;
}


function showHeaderNew(win,button){
 document.querySelector('.header-new-menu')?.remove();const menu=document.createElement('div');menu.className='header-new-menu';
 for(const [suffix,glyph]of [['/','folder'],['.txt','text'],['.wall','wall'],['.help','help']]){const item=document.createElement('button');item.dataset.newExtension=suffix;item.dataset.newPath=win.dataset.fileBrowser;item.innerHTML=icon(glyph)+`<span>${suffix==='/'?suffix:suffix.slice(1)}</span>`;item.onclick=()=>{menu.remove();newFolderEntry(win.dataset.fileBrowser,suffix==='/'?null:suffix.slice(1));};menu.append(item);}
 $('#desktop').append(menu);const d=$('#desktop').getBoundingClientRect(),r=button.getBoundingClientRect(),scale=d.width/1920;menu.style.left=(r.left-d.left)/scale+'px';menu.style.top=(r.bottom-d.top)/scale+'px';fitMenuToDesktop(menu);
 let closeTimer;const cancelClose=()=>clearTimeout(closeTimer);const scheduleClose=()=>{cancelClose();closeTimer=setTimeout(()=>{if(!pointerFileDrag?.started&&!menu.matches(':hover')&&!button.matches(':hover'))menu.remove();},160);};button.onpointerenter=()=>{cancelClose();if(!menu.isConnected)showHeaderNew(win,button);};menu.onpointerenter=cancelClose;button.onpointerleave=scheduleClose;menu.onpointerleave=scheduleClose;
}




