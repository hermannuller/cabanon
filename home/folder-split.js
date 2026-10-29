'use strict';
// The active pane is first in DOM order so existing window-level folder commands
// keep addressing it. Explicit grid cells preserve physical pane positions.
const folderSplits=new WeakMap();
function folderPaneRoot(win){return folderSplits.get(win)?.active||win;}
function folderPaneMoveFirst(state,pane){if(state.body.firstElementChild!==pane)state.body.moveBefore(pane,state.body.firstElementChild);}
function folderPaneTitle(win){
 const state=folderSplits.get(win);if(!state)return;
 const label=win.querySelector('.window-title>span:last-child'),path=win.dataset.fileBrowser;
 label.textContent='/'+path.split('/').filter(Boolean).at(-1);label.title=path;
 win.querySelector('.window-title').title=path;win.setAttribute('aria-label',path);
 for(const pane of state.panes){const active=pane===state.active;pane.classList.toggle('folder-pane-current',active);const hint=pane.querySelector('.folder-pane-path');hint.textContent=pane.folderPath;hint.title=pane.folderPath;hint.hidden=active;}
}
function saveFolderPane(win,pane){
 pane.folderPath=win.dataset.fileBrowser;pane.folderHistory=folderHistories.get(win);
 pane.folderNavigation={mode:win.dataset.navigationMode,width:win.navigationWidth,expanded:win.treeExpanded};
 pane.classList.toggle('tools-open',win.classList.contains('tools-open'));
}
function activateFolderPane(win,pane,discard=false){
 const state=folderSplits.get(win);if(!state||state.active===pane)return;
 const editor=typeof paragraphEditors!=='undefined'&&paragraphEditors.get(state.active.querySelector('.house-file-list'));if(!discard&&editor&&!editor.commit())return;
 saveFolderPane(win,state.active);const previousNav=win.querySelector('.house-navigation');if(previousNav){state.active.folderNav=previousNav;previousNav.remove();}state.active=pane;folderPaneMoveFirst(state,pane);if(pane.folderNav)win.append(pane.folderNav);
 win.dataset.fileBrowser=pane.folderPath;
 if(pane.folderHistory)folderHistories.set(win,pane.folderHistory);else folderHistories.delete(win);
 const nav=pane.folderNavigation||{};if(nav.mode)win.dataset.navigationMode=nav.mode;else delete win.dataset.navigationMode;
 win.navigationWidth=nav.width;win.treeExpanded=nav.expanded;win.classList.toggle('tools-open',pane.classList.contains('tools-open'));
 win.querySelector('.folder-local-search')?.remove();document.querySelector('.header-new-menu')?.remove();
 folderPaneTitle(win);renderTaskbar();
}
// Capture before existing selection/paragraph handlers; a click keeps its original
// row and pointer target because moveBefore preserves DOM state and focus.
window.addEventListener('pointerdown',event=>{if(event.target.closest('.folder-pane-close'))return;const pane=event.target.closest('.folder-pane');if(pane)activateFolderPane(pane.closest('.window'),pane);},true);
window.addEventListener('focusin',event=>{if(event.target.closest('.folder-pane-close'))return;const pane=event.target.closest('.folder-pane');if(pane)activateFolderPane(pane.closest('.window'),pane);},true);
window.addEventListener('keydown',event=>{const divider=event.target.closest('.folder-pane-divider');if(divider&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key)){divider.onkeydown?.(event);event.stopImmediatePropagation();}},true);

let folderPaneSwapGesture=null;
function folderPaneSwapTarget(gesture,event){
 return gesture.state?.panes.find(pane=>{if(pane===gesture.pane)return false;const rect=pane.getBoundingClientRect();return event.clientX>=rect.left&&event.clientX<rect.right&&event.clientY>=rect.top&&event.clientY<rect.bottom;})||null;
}
function folderPaneDropTarget(gesture,event){
 const hit=document.elementFromPoint(event.clientX,event.clientY),win=hit?.closest('.window');
 if(win?.dataset.fileBrowser&&hit.closest('.folder-pane-close,.titlebar [data-win=close]'))return {type:'close'};
 if(win===gesture.win){const pane=folderPaneSwapTarget(gesture,event);return pane?{type:'swap',pane}:{type:'none'};}
 if(win?.dataset.fileBrowser&&win.querySelector('.house-file-list'))return {type:(folderSplits.get(win)?.panes.length||1)<4?'join':'blocked',win};
 const rect=gesture.win.getBoundingClientRect();
 if(!win&&event.clientX>=rect.left&&event.clientX<rect.right&&event.clientY>=rect.top&&event.clientY<rect.bottom)return {type:'none'};
 return {type:gesture.button===2?'close':'detach'};
}
function restoreFolderPaneGesture(gesture){
 const selection=selectionState(gesture.list);selection.selected=new Set(gesture.selected);selection.anchor=gesture.anchor;selection.current=gesture.current;paintSelection(gesture.list);
 gesture.list.scrollLeft=gesture.scrollLeft;gesture.list.scrollTop=gesture.scrollTop;
 const editor=typeof paragraphEditors!=='undefined'&&paragraphEditors.get(gesture.list);
 if(editor&&gesture.paragraph){editor.selected=new Set(gesture.paragraph.selected);editor.anchor=gesture.paragraph.anchor;editor.focus=gesture.paragraph.focus;editor.armed=gesture.paragraph.armed;editor.render();}
}
function finishFolderPaneSwap(cancel=false){
 const gesture=folderPaneSwapGesture;if(!gesture)return;folderPaneSwapGesture=null;
 if(!gesture.swapping)return;
 CabanonDragFeedback.end(gesture);
 dropHint.classList.remove('folder-pane-close-hint');
 restoreFolderPaneGesture(gesture);
 if(!cancel&&gesture.win.isConnected&&(folderSplits.get(gesture.win)||null)===gesture.state){
  const drop=gesture.drop;
  if(drop?.type==='close'){if(gesture.state)closeFolderPane(gesture.win,gesture.pane,{immediate:true});else withoutDocumentClosePrompt(()=>closeShortcutWindow(gesture.win));return;}
  if(drop?.type==='join'||drop?.type==='detach'){transferFolderPane(gesture,drop);return;}
  if(drop?.type!=='swap')return;
  const panes=gesture.state.panes,from=panes.indexOf(gesture.pane),to=panes.indexOf(gesture.valid);
  if(from>=0&&to>=0){[panes[from],panes[to]]=[panes[to],panes[from]];layoutFolderPanes(gesture.state);}
 }
}
window.addEventListener('pointerdown',event=>{
 finishFolderPaneSwap(true);if(![0,2].includes(event.button)||event.target.closest('.details-head,.folder-pane-divider,.window-resize,.navigation-resize,.house-navigation,.code-surface,input,textarea,[contenteditable="true"],button:not(.file)'))return;
 const pane=event.target.closest('.folder-pane'),win=event.target.closest('.window'),list=event.target.closest('.house-file-list')||pane?.querySelector('.house-file-list')||(event.target.closest('.window-content')?win?.querySelector('.house-file-list'):null),state=win&&folderSplits.get(win)||null;if(!win?.dataset.fileBrowser||!list||document.body.classList.contains('phone-mode'))return;
 const row=event.target.closest('.file');if(row&&fileDragStartHit(event,row))return;
 const selection=selectionState(list),editor=typeof paragraphEditors!=='undefined'&&paragraphEditors.get(list);folderPaneSwapGesture={win,state,pane,list,x:event.clientX,y:event.clientY,pointerId:event.pointerId,button:event.button,selected:new Set(selection.selected),anchor:selection.anchor,current:selection.current,scrollLeft:list.scrollLeft,scrollTop:list.scrollTop,paragraph:editor?{selected:new Set(editor.selected),anchor:editor.anchor&&{...editor.anchor},focus:editor.focus&&{...editor.focus},armed:editor.armed}:null,swapping:false,valid:false,cancel:()=>finishFolderPaneSwap(true)};
},true);
window.addEventListener('pointermove',event=>{
 const gesture=folderPaneSwapGesture;if(!gesture||gesture.pointerId!==event.pointerId)return;
 if(!(event.buttons&(gesture.button===2?2:1))){finishFolderPaneSwap(true);return;}
 const drop=folderPaneDropTarget(gesture,event),valid=drop.type==='swap'?drop.pane:null;
 if(!gesture.swapping){if(drop.type==='none'||Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)<6)return;
  finishSelectionBox(null,true);cancelPointerFileDrag();if(typeof finishParagraphGesture==='function')finishParagraphGesture(null,true);gesture.swapping=true;
  restoreFolderPaneGesture(gesture);
  CabanonGestureCancel.rollback(()=>finishFolderPaneSwap(true));CabanonDragFeedback.begin(gesture,{clientX:gesture.x,clientY:gesture.y});
 }
 gesture.valid=valid;gesture.drop=drop;gesture.releasePoint={clientX:event.clientX,clientY:event.clientY};dropHint.classList.toggle('folder-pane-close-hint',drop.type==='close');CabanonDragFeedback.update(gesture,event,drop.type==='close'?'close':drop.type==='swap'?'←→ windows':drop.type==='join'?'+ windows':drop.type==='detach'?'window':drop.type==='blocked'?'   X   ':'');event.preventDefault();event.stopImmediatePropagation();
},true);
window.addEventListener('pointerup',event=>{const gesture=folderPaneSwapGesture;if(!gesture||gesture.pointerId!==event.pointerId)return;if(!gesture.swapping){folderPaneSwapGesture=null;return;}gesture.drop=folderPaneDropTarget(gesture,event);gesture.valid=gesture.drop.type==='swap'?gesture.drop.pane:null;gesture.releasePoint={clientX:event.clientX,clientY:event.clientY};finishFolderPaneSwap();event.preventDefault();event.stopImmediatePropagation();},true);
window.addEventListener('pointercancel',()=>finishFolderPaneSwap(true),true);
window.addEventListener('blur',()=>finishFolderPaneSwap(true));
window.addEventListener('keydown',event=>{if(event.key!=='Escape'||!folderPaneSwapGesture)return;const swapping=folderPaneSwapGesture.swapping;finishFolderPaneSwap(true);if(swapping){event.preventDefault();event.stopImmediatePropagation();}},true);

window.addEventListener('DOMContentLoaded',()=>{
 const configure=configureFolder;
 configureFolder=function(win,path){const result=configure(win,path),state=folderSplits.get(win);if(state){saveFolderPane(win,state.active);folderPaneTitle(win);}return result;};
 const refresh=refreshBrowsers;
 refreshBrowsers=function(paths){
  refresh(paths);
  const targets=paths?new Set((Array.isArray(paths)?paths:[paths]).map(syncPath)):null;
  for(const win of windowMap.values()){
   const state=folderSplits.get(win);if(!state)continue;
   for(const pane of state.panes){if(pane===state.active||targets&&!targets.has(syncPath(pane.folderPath)))continue;
    const path=win.dataset.fileBrowser;
    try{folderPaneMoveFirst(state,pane);win.dataset.fileBrowser=pane.folderPath;drawBrowser(win,pane.folderPath);}
    finally{win.dataset.fileBrowser=path;folderPaneMoveFirst(state,state.active);}
   }
  }
 };
 const tools=toggleFolderTools;
 toggleFolderTools=function(win,...args){const result=tools(win,...args),state=folderSplits.get(win);if(state){state.active.folderNav=win.querySelector('.house-navigation');saveFolderPane(win,state.active);}return result;};
 const open=openFile;
 openFile=function(name,options={}){const pane=options.sourceList?.closest('.folder-pane');if(pane)activateFolderPane(pane.closest('.window'),pane);return open(name,options);};
 const closeShortcut=closeShortcutWindow;
 closeShortcutWindow=function(win){if(!folderSplits.has(win))return closeShortcut(win);closeFolderPane(win);if(win.isConnected){focusWindow(win);renderTaskbar();}};
 const closeDocuments=closeDocumentWindows;
 closeDocumentWindows=function(windows){for(const win of windows)while(folderSplits.has(win)){const before=folderSplits.get(win).panes.length;closeFolderPane(win);if(folderSplits.get(win)?.panes.length===before)break;}return closeDocuments(windows);};
 shortcutDefinitions.push(['splitWindow','Add folder to window group / open new window','CTRL+T']);
 const run=runShortcut;
 runShortcut=function(id,event){if(id!=='splitWindow')return run(id,event);const win=activeWindow;if(!win?.dataset.fileBrowser||win.hidden||document.body.classList.contains('phone-mode'))return false;if(!event.repeat){const state=folderSplits.get(win);if(state?.panes.length===4)openFolderBrowser(win.dataset.fileBrowser,true);else if(state)addFolderPane(win);else splitFolderWindow(win);}return true;};
});

function setFolderPaneRatio(state,axis,value){
 const size=axis==='x'?state.body.clientWidth:state.body.clientHeight,minimum=Math.min(.45,(axis==='x'?160:112)/Math.max(1,size));
 state[axis]=Math.max(minimum,Math.min(1-minimum,value));
 state.body.style.setProperty(axis==='x'?'--folder-split':'--folder-split-y',state[axis]*100+'%');
 (axis==='x'?state.divider:state.horizontalDivider).setAttribute('aria-valuenow',Math.round(state[axis]*100));
}
function layoutFolderPanes(state,reset=false){
 const count=state.panes.length;state.body.dataset.paneCount=count;
 state.panes.forEach((pane,index)=>{pane.style.gridColumn=count===3&&index===2?'1 / 4':String(index%2===0?1:3);pane.style.gridRow=String(index<2?1:3);});
 state.divider.style.gridRow=count===4?'1 / 4':'1';state.horizontalDivider.hidden=count===2;
 setFolderPaneRatio(state,'x',reset ? .5 : state.x);setFolderPaneRatio(state,'y',reset ? .5 : state.y);
}
function createFolderPaneDivider(win,state,axis){
 const divider=document.createElement('div');divider.className='folder-pane-divider folder-pane-divider-'+axis;divider.tabIndex=0;divider.setAttribute('role','separator');divider.setAttribute('aria-label',axis==='x'?'Resize folder columns':'Resize folder rows');divider.setAttribute('aria-orientation',axis==='x'?'vertical':'horizontal');
 divider.onpointerdown=event=>{if(event.button!==0)return;event.preventDefault();event.stopPropagation();focusWindow(win);const before=state[axis];CabanonGestureCancel.rollback(()=>setFolderPaneRatio(state,axis,before));divider.setPointerCapture(event.pointerId);divider.onpointermove=move=>{const rect=state.body.getBoundingClientRect();setFolderPaneRatio(state,axis,axis==='x'?(move.clientX-rect.left)/rect.width:(move.clientY-rect.top)/rect.height);};const end=()=>divider.onpointermove=null;divider.onpointerup=end;divider.onpointercancel=end;};
 divider.onkeydown=event=>{const keys=axis==='x'?['ArrowLeft','ArrowRight']:['ArrowUp','ArrowDown'];if(![...keys,'Home'].includes(event.key))return;event.preventDefault();event.stopPropagation();setFolderPaneRatio(state,axis,event.key==='Home'?.5:state[axis]+(event.key===keys[0]?-.05:.05));};
 return divider;
}
function attachFolderPaneClose(pane){
 const button=document.createElement('button');button.className='folder-pane-close';button.setAttribute('aria-label','Close folder pane');button.title='Close folder pane';button.innerHTML=cssIcon('close','window-control-symbol cabanon-close-symbol');button.onpointerdown=event=>event.stopPropagation();button.onclick=event=>{event.stopPropagation();closeFolderPane(pane.closest('.window'),pane);};pane.append(button);
}
function createFolderPane(){
 const pane=document.createElement('div');pane.className='folder-pane';pane.innerHTML='<div class="folder-pane-path"></div><div class="house-file-list" tabindex="0" role="listbox" aria-multiselectable="true"></div><p class="muted house-empty" hidden>No files found.</p>';attachFolderPaneClose(pane);return pane;
}
function addFolderPane(win){
 const state=folderSplits.get(win);if(!state||state.panes.length>=4)return;
 const editor=typeof paragraphEditors!=='undefined'&&paragraphEditors.get(state.active.querySelector('.house-file-list'));if(editor&&!editor.commit())return;
 const pane=createFolderPane();pane.folderPath=win.dataset.fileBrowser;pane.folderHistory={paths:[pane.folderPath],index:0};state.panes.push(pane);state.body.append(pane);state.observer.observe(pane);layoutFolderPanes(state,true);
 activateFolderPane(win,pane);drawBrowser(win,pane.folderPath);folderPaneTitle(win);pane.querySelector('.house-file-list').focus({preventScroll:true});
}
function ensureFolderGroup(win){
 if(!win?.isConnected)return null;
 if(folderSplits.has(win))return folderSplits.get(win);
 if(win.classList.contains('code-mode'))toggleCode(win,false);
 const editor=typeof paragraphEditors!=='undefined'&&paragraphEditors.get(win.querySelector('.house-file-list'));if(editor&&!editor.commit())return;
 const body=win.querySelector('.window-content'),left=document.createElement('div');left.className='folder-pane';for(const child of [...body.childNodes])left.append(child);
 const hint=document.createElement('div');hint.className='folder-pane-path';left.prepend(hint);attachFolderPaneClose(left);body.append(left);
 const state={body,panes:[left],active:left,x:.5,y:.5};folderSplits.set(win,state);win.classList.add('folder-split');saveFolderPane(win,left);
 state.divider=createFolderPaneDivider(win,state,'x');state.horizontalDivider=createFolderPaneDivider(win,state,'y');body.append(state.divider,state.horizontalDivider);
 const observer=new ResizeObserver(()=>{setFolderPaneRatio(state,'x',state.x);setFolderPaneRatio(state,'y',state.y);for(const pane of state.panes){const list=pane.querySelector('.house-file-list');list.style.gridTemplateRows=`repeat(${Math.max(1,Math.floor(list.clientHeight/56))},56px)`;}});observer.observe(body);observer.observe(left);(win.ownedResizeObservers ||= new Set()).add(observer);state.observer=observer;
 const close=win.querySelector('[data-win=close]'),closeWindow=close.onclick;state.closeWindow=closeWindow;close.setAttribute('aria-label','Close window group');close.title='Close window group';close.onclick=event=>{if(!folderSplits.has(win))return closeWindow(event);closeFolderGroupImmediately(win);const next=[...windowMap.values()].filter(w=>!w.hidden).at(-1);if(next)focusWindow(next);renderTaskbar();};
 return state;
}
function splitFolderWindow(win){
 if(ensureFolderGroup(win))addFolderPane(win);
}
function collapseFolderGroup(win,state){
 const remaining=state.panes[0];remaining.querySelector('.folder-pane-path').remove();remaining.querySelector('.folder-pane-close').remove();for(const child of [...remaining.childNodes])state.body.moveBefore(child,null);
 remaining.remove();state.divider.remove();state.horizontalDivider.remove();state.observer.disconnect();win.ownedResizeObservers.delete(state.observer);state.body.style.removeProperty('--folder-split');state.body.style.removeProperty('--folder-split-y');delete state.body.dataset.paneCount;win.classList.remove('folder-split');folderSplits.delete(win);const close=win.querySelector('[data-win=close]');close.onclick=state.closeWindow;close.setAttribute('aria-label','Close');close.title='Close';
}
function positionDetachedFolder(win,point){
 const rect=$('#desktop').getBoundingClientRect(),scale=rect.width/1920;
 win.style.left=Math.max(0,Math.min(1920-win.offsetWidth,(point.clientX-rect.left)/scale-40))+'px';
 win.style.top=Math.max(0,Math.min(WORK_HEIGHT-win.offsetHeight,(point.clientY-rect.top)/scale-24))+'px';
}
function destroyPaneNavigation(pane){
 const nav=pane.folderNav;if(!nav)return;
 for(const node of nav.querySelectorAll('.tree-scroll-body'))node.treeResizeObserver?.disconnect();nav.remove();pane.folderNav=null;
}
function transferFolderPane(gesture,drop){
 const source=gesture.win,sourceState=folderSplits.get(source);
 let target=drop.win;
 if(drop.type==='join'&&(!target?.isConnected||target.hidden||(folderSplits.get(target)?.panes.length||1)>=4))return;
 const sourceEditor=typeof paragraphEditors!=='undefined'&&paragraphEditors.get(gesture.list);
 const targetEditor=target&&typeof paragraphEditors!=='undefined'&&paragraphEditors.get(target.querySelector('.house-file-list'));
 if(sourceEditor&&!sourceEditor.commit()||targetEditor&&!targetEditor.commit())return;
 // A single folder window dragged into free space is already independent.
 if(drop.type==='detach'&&!sourceState){if(source.classList.contains('maximized'))source.querySelector('[data-win=max]').click();positionDetachedFolder(source,gesture.releasePoint);focusWindow(source);return;}
 const state=sourceState||ensureFolderGroup(source);if(!state)return;
 const pane=gesture.pane||state.active;if(!state.panes.includes(pane))return;
 if(drop.type==='detach')target=openFolderBrowser(pane.folderPath,true);
 const destination=ensureFolderGroup(target);if(!destination){if(!sourceState)collapseFolderGroup(source,state);return;}
 const placeholder=drop.type==='detach'?destination.active:null;
 const index=state.panes.indexOf(pane),survivors=state.panes.filter(item=>item!==pane);
 if(state.active!==pane){activateFolderPane(source,pane);if(state.active!==pane)return;}
 saveFolderPane(source,pane);
 if(survivors.length){activateFolderPane(source,survivors[Math.min(index,survivors.length-1)]);if(state.active===pane)return;}
 else{const nav=source.querySelector('.house-navigation');if(nav){pane.folderNav=nav;nav.remove();}}
 const navigation=pane.folderNavigation,navScroll=pane.folderNav?.querySelector('.tree-scroll-body,.quick-scroll-body')?.scrollTop||0;
 destroyPaneNavigation(pane);
 state.observer.unobserve(pane);
 for(const editor of typeof paragraphLiveEditors!=='undefined'?[...paragraphLiveEditors]:[])if(pane.contains(editor.list)){
  source.ownedResizeObservers?.delete(editor.resizeObserver);(target.ownedResizeObservers ||= new Set()).add(editor.resizeObserver);editor.win=target;
 }
 const scroll={left:gesture.list.scrollLeft,top:gesture.list.scrollTop};destination.body.moveBefore(pane,null);
 state.panes=survivors;
 if(placeholder){
  const list=placeholder.querySelector('.house-file-list'),editor=typeof paragraphEditors!=='undefined'&&paragraphEditors.get(list);if(editor){editor.destroy();paragraphEditors.delete(list);}
  destination.observer.unobserve(placeholder);placeholder.remove();destination.panes=[pane];
 }else destination.panes.push(pane);
 destination.observer.observe(pane);layoutFolderPanes(destination,true);activateFolderPane(target,pane);
 // Navigation callbacks close over their owner window, so rebuild this surface
 // against the destination while keeping its width, expanded nodes and scroll.
 if(navigation?.mode){
  delete target.dataset.navigationMode;target.classList.remove('tools-open');target.navigationWidth=navigation.width;toggleFolderTools(target,navigation.mode);
  if(navigation.mode==='tree'&&navigation.expanded){target.treeExpanded=new Set(navigation.expanded);drawFocusedTree(target,false);}
  const body=target.querySelector('.house-navigation .tree-scroll-body,.house-navigation .quick-scroll-body');if(body)body.scrollTop=navScroll;
 }
 if(!survivors.length){
  folderSplits.delete(source);windowMap.delete(source.dataset.key);disposeWindowResources(source);source.remove();
 }else if(survivors.length===1)collapseFolderGroup(source,state);else layoutFolderPanes(state,true);
 if(destination.panes.length===1)collapseFolderGroup(target,destination);
 if(drop.type==='detach')positionDetachedFolder(target,gesture.releasePoint);
 focusWindow(target);gesture.list.focus({preventScroll:true});gesture.list.scrollLeft=scroll.left;gesture.list.scrollTop=scroll.top;renderTaskbar();
}
function closeFolderGroupImmediately(win){
 const state=folderSplits.get(win);if(!state)return false;
 for(const editor of typeof paragraphLiveEditors!=='undefined'?[...paragraphLiveEditors]:[])if(editor.win===win){editor.working=true;editor.destroy();paragraphEditors.delete(editor.list);}
 for(const pane of state.panes)destroyPaneNavigation(pane);
 folderSplits.delete(win);state.closeWindow();return true;
}
function closeFolderPane(win,pane=null,options={}){
 const state=folderSplits.get(win);if(!state)return;
 const closing=pane||state.active,index=state.panes.indexOf(closing);if(index<0)return;
 const survivors=state.panes.filter(pane=>pane!==closing),remaining=survivors[Math.min(index,survivors.length-1)];
 const editor=typeof paragraphEditors!=='undefined'&&paragraphEditors.get(closing.querySelector('.house-file-list'));if(!options.immediate&&editor&&!editor.commit())return;
 if(state.active===closing){activateFolderPane(win,remaining,!!options.immediate);if(state.active!==remaining)return;}
 for(const e of typeof paragraphLiveEditors!=='undefined'?[...paragraphLiveEditors]:[])if(closing.contains(e.list)){if(options.immediate)e.working=true;e.destroy();paragraphEditors.delete(e.list);}
 state.observer.unobserve(closing);destroyPaneNavigation(closing);closing.remove();state.panes=survivors;
 if(survivors.length>1)layoutFolderPanes(state,true);
 else collapseFolderGroup(win,state);
 focusWindow(win);win.querySelector('.house-file-list').focus({preventScroll:true});renderTaskbar();
}
