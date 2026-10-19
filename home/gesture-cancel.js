'use strict';
// Loaded before pointer handlers: cancellation belongs to the whole pointer session.
window.CabanonGestureCancel=(()=>{
 let session=null,blockedClick=false;
 const geometry=['left','top','width','height','--code-height'];
 function snapshot(event){if(![0,2].includes(event.button))return;blockedClick=false;const selection=getSelection();session={target:event.target,id:event.pointerId,button:event.button,x:event.clientX,y:event.clientY,moved:false,cancelled:false,rollbacks:[],ranges:selection?Array.from({length:selection.rangeCount},(_,i)=>selection.getRangeAt(i).cloneRange()):[],selected:[...document.querySelectorAll('.selected')],active:activeWindow,windows:[...windowMap.values()].map(win=>({win,values:geometry.map(key=>[key,win.style.getPropertyValue(key)]),max:win.classList.contains('maximized'),snap:win.dataset.snap,restore:win.restoreRect,snapRestore:win.snapRestoreRect,path:win.dataset.fileBrowser,history:typeof folderHistories!=='undefined'&&folderHistories.has(win)?structuredClone(folderHistories.get(win)):null,navigationWidth:win.navigationWidth,navigationStyle:win.querySelector('.house-navigation')?.style.getPropertyValue('--navigation-width')||'',codeManualHeight:win.codeManualHeight})),lists:typeof selectionState==='function'?[...document.querySelectorAll('.house-file-list')].map(list=>{const state=selectionState(list);return{list,win:list.closest('.window'),path:list.dataset.path,selected:new Set(state.selected),anchor:state.anchor,current:state.current,left:list.scrollLeft,top:list.scrollTop};}):[]};}
 function rollback(action){if(session&&!session.cancelled)session.rollbacks.push(action);}
 function cancel(){const r=session;if(!r||!r.moved)return false;if(r.cancelled)return true;r.cancelled=true;blockedClick=true;
  if(typeof sharedGesture!=='undefined')sharedGesture?.owner?.cancel?.();
  const captured=[...document.querySelectorAll('*')].filter(node=>node.hasPointerCapture?.(r.id));
  for(const node of captured.length?captured:[r.target]){node.dispatchEvent(new PointerEvent('pointercancel',{bubbles:true,pointerId:r.id,button:r.button,clientX:r.x,clientY:r.y}));node.onpointermove=null;if(node.hasPointerCapture?.(r.id))node.releasePointerCapture(r.id);}
  if(typeof pointerFileDrag!=='undefined'&&pointerFileDrag)cancelPointerFileDrag();
  if(typeof fileGesture!=='undefined'&&fileGesture){finishSelectionBox(null,true);fileGesture=null;}
  for(const action of r.rollbacks.reverse())action();
  for(const s of r.windows){const win=s.win;if(!win.isConnected)continue;if(s.path&&win.dataset.fileBrowser!==s.path)configureFolder(win,s.path);if(s.history)folderHistories.set(win,s.history);for(const[key,value]of s.values)win.style.setProperty(key,value);win.classList.toggle('maximized',s.max);if(s.snap)win.dataset.snap=s.snap;else delete win.dataset.snap;win.restoreRect=s.restore;win.snapRestoreRect=s.snapRestore;win.navigationWidth=s.navigationWidth;win.codeManualHeight=s.codeManualHeight;const nav=win.querySelector('.house-navigation');if(nav)nav.style.setProperty('--navigation-width',s.navigationStyle);if(win.resizeCode)win.resizeCode();}
  for(const s of r.lists){const list=s.win?.querySelector('.house-file-list')||s.list;if(!list?.isConnected||list.dataset.path!==s.path)continue;const state=selectionState(list);state.selected=new Set(s.selected);state.anchor=s.anchor;state.current=s.current;paintSelection(list);list.scrollLeft=s.left;list.scrollTop=s.top;const editor=typeof paragraphEditors!=='undefined'&&paragraphEditors.get(list);if(editor){editor.clear();editor.selected=new Set(editor.records.filter(record=>s.selected.has(record.source)).map(record=>record.id));editor.armed=editor.selected.size>0;editor.render();}}
  for(const node of document.querySelectorAll('.selected'))if(!node.closest('.house-file-list'))node.classList.toggle('selected',r.selected.includes(node));for(const node of r.selected)if(node.isConnected&&!node.closest('.house-file-list'))node.classList.add('selected');
  const selection=getSelection();selection?.removeAllRanges();for(const range of r.ranges)if(range.startContainer.isConnected&&range.endContainer.isConnected)selection.addRange(range);
  window.CabanonDragFeedback?.end();document.querySelector('.header-new-menu')?.remove();document.querySelectorAll('.file-selection-frame').forEach(el=>el.remove());if(r.active?.isConnected)focusWindow(r.active);return true;
 }
 addEventListener('pointerdown',snapshot,true);
 addEventListener('pointermove',event=>{if(!session)return;if(session.cancelled){event.preventDefault();event.stopImmediatePropagation();return;}if(Math.hypot(event.clientX-session.x,event.clientY-session.y)>=5)session.moved=true;},true);
 addEventListener('pointerup',event=>{const r=session;if(!r)return;if(r.cancelled){event.preventDefault();event.stopImmediatePropagation();}queueMicrotask(()=>{if(session===r)session=null;});},true);
 addEventListener('keydown',()=>{if(!session?.cancelled)blockedClick=false;},true);
 for(const type of ['click','contextmenu','dblclick'])addEventListener(type,event=>{if(blockedClick){event.preventDefault();event.stopImmediatePropagation();}},true);
 return{cancel,rollback};
})();
