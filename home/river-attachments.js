'use strict';
// Cabanon file snapshots: picking or dropping never moves the source file.
function createRiveFiles(getState,refresh,persist){
 const E=escapeHTML;
 const pending=()=>{const s=getState();return(s.data.chatAttachments||={})[s.chat]||[];};
 const supported=name=>prefs.entries.find(e=>e.name===name&&!e.folder);
 function accessible(path,retry){const lock=typeof lockedAncestor==='function'&&lockedAncestor(path);if(lock){requestFolderAccess(lock,retry);return false;}if(!isOwner()&&prefs.folderPermissions?.[path]==='owner'){warning('Access denied.');return false;}return true;}
 function snapshot(entry){return{name:entry.name,size:entry.size||new TextEncoder().encode(prefs.content?.[entry.name]||'').length,content:prefs.content?.[entry.name]??null,glyph:glyphFor(entry.name)};}
 function stage(names){const s=getState();if(!s?.chat)return;const entries=names.map(supported);if(!entries.length||entries.some(e=>!e)){warning('Select Cabanon files, not folders.');return;}for(const e of entries)if(!accessible(e.parent,()=>stage(names)))return;const list=pending();for(const entry of entries)if(!list.some(f=>f.name===entry.name))list.push(snapshot(entry));s.data.chatAttachments[s.chat]=list;persist();refresh();s.win.querySelector('.rive-send textarea')?.focus();}
 function card(file,remove){return `<div class="rive-file-card">${icon(file.glyph||'text')}<span>${E(file.name.split('/').at(-1))}<small>${file.size} bytes</small></span>${remove?`<button data-remove-attachment="${E(file.name)}" aria-label="Remove attachment">${closeMark()}</button>`:''}</div>`;}
 function markup(){return pending().map(f=>card(f,true)).join('');}
 function remove(name){const s=getState();s.data.chatAttachments[s.chat]=pending().filter(f=>f.name!==name);persist();refresh();}
 function take(){const s=getState(),result=pending().map(f=>({...f}));delete(s.data.chatAttachments||{})[s.chat];return result;}
 function close(){const s=getState();if(s?.picker?.isConnected)s.picker.querySelector('[data-win=close]').click();if(s)s.picker=null;}
 function pick(){
  const s=getState();if(!s?.chat)return;if(s.picker?.isConnected){s.picker.hidden=false;focusWindow(s.picker);return;}
  const person=s.chat,selected=new Set(),win=createWindow('rive:attachments','Attach files','folder','<nav class="rive-picker-nav"><button data-file-up aria-label="Parent folder">↑</button><span></span></nav><div class="rive-picker-list" role="listbox" aria-label="Cabanon files" aria-multiselectable="true" tabindex="0"></div><footer class="rive-picker-footer"><span>0 selected</span><button data-file-cancel>cancel</button><button data-file-confirm disabled>confirm</button></footer>');
  s.picker=win;win.dataset.ownerApp='RIVER';win.classList.add('rive-file-picker');Object.assign(win.style,{width:'700px',height:'580px',left:'610px',top:'200px'});
  let path='/house';const list=win.querySelector('.rive-picker-list'),confirm=win.querySelector('[data-file-confirm]');
  function update(){confirm.disabled=selected.size===0;win.querySelector('.rive-picker-footer span').textContent=selected.size+' selected';for(const row of list.children){const on=selected.has(row.dataset.riveFile);row.classList.toggle('selected',on);row.setAttribute('aria-selected',String(on));}}
  function navigate(next){if(!accessible(next,()=>navigate(next)))return;path=next;render();}
  function render(){win.querySelector('.rive-picker-nav span').textContent=path;win.querySelector('[data-file-up]').disabled=path==='/house';list.replaceChildren();const entries=prefs.entries.filter(e=>e.parent===path).sort((a,b)=>Number(b.folder)-Number(a.folder)||a.name.localeCompare(b.name));for(const entry of entries){const row=document.createElement('button');row.className='rive-picker-row';row.dataset.riveFile=entry.name;row.setAttribute('role','option');row.innerHTML=icon(entry.folder?'folder':glyphFor(entry.name))+'<span>'+E(entry.name.split('/').at(-1))+'</span>';row.onclick=()=>{if(entry.folder)return;if(selected.has(entry.name))selected.delete(entry.name);else selected.add(entry.name);update();};row.ondblclick=()=>{if(entry.folder)navigate(folderPath(entry.name));};list.append(row);}if(!entries.length){const empty=document.createElement('div');empty.className='river-empty';empty.textContent='No files.';list.append(empty);}update();}
  win.querySelector('[data-file-up]').onclick=()=>navigate(path.slice(0,path.lastIndexOf('/'))||'/house');
  win.querySelector('[data-file-cancel]').onclick=close;
  confirm.onclick=()=>{if(!selected.size)return;if(getState()!==s||s.chat!==person){close();return;}const names=[...selected];close();stage(names);};
  win.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();focusWindow(s.win);}if(e.key==='Enter'&&!confirm.disabled){e.preventDefault();confirm.click();}});
  if(accessible(path,render))render();renderTaskbar();
 }
 function dropTarget(target){const s=getState();return !!(s?.win.isConnected&&s.page==='rive'&&s.chat&&s.win.contains(target)&&target.closest('.rive-chat')&&draggedFiles?.names?.length&&draggedFiles.names.every(supported));}
 function bind(app){
  app.addEventListener('dragover',e=>{if(!dropTarget(e.target))return;e.preventDefault();e.stopPropagation();e.dataTransfer.dropEffect='copy';CabanonDragFeedback.present(e,fileDragLabel('rive / '+getState().chat));app.querySelector('.rive-chat').classList.add('rive-drop-active');});
  app.addEventListener('dragleave',e=>{if(!app.querySelector('.rive-chat')?.contains(e.relatedTarget))app.querySelector('.rive-chat')?.classList.remove('rive-drop-active');});
  app.addEventListener('drop',e=>{if(!dropTarget(e.target))return;e.preventDefault();e.stopPropagation();const names=[...draggedFiles.names];stage(names);draggedFiles=null;dropHint.hidden=true;});
  const clear=()=>getState()?.win.querySelector('.rive-chat')?.classList.remove('rive-drop-active');addEventListener('dragend',clear);addEventListener('pointerup',clear);addEventListener('pointercancel',clear);addEventListener('blur',clear);
 }
 return{markup,card,stage,remove,take,pending,pick,close,dropTarget,bind};
}
