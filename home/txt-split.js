'use strict';
// TXT window groups: 2-4 independent editors in one shared title bar.
const txtGroups=new WeakMap();
function txtPanes(win){return [...win.querySelectorAll('.txt-panes > .txt-pane')];}
function txtStates(win){return [...CabanonTXT.editors].filter(state=>state.win===win);}
function txtStateFor(win,pane){return txtStates(win).find(state=>state.pane===pane)||null;}
function txtLabel(state){
 const entry=CabanonTXT.entry(state);
 return entry?entry.name.split('/').at(-1):'new.txt';
}
function txtDirty(state){return (state.saved!==state.input.value||state.savedEncoding!==state.encoding)&&(state.saved!==undefined||state.input.value);}
function txtActivate(win,pane){
 const state=txtStateFor(win,pane);if(!state)return null;
 win.txtActive=state;
 for(const item of txtPanes(win))item.classList.toggle('txt-pane-current',item===pane);
 CabanonTXT.update(state);return state;
}
function txtBind(win){
 if(win.txtGroupBound)return;win.txtGroupBound=true;
 const close=win.querySelector('[data-win=close]');win.txtGroupClose=close.onclick;
 close.onclick=()=>txtCloseGroup(win);
 win.addEventListener('keydown',txtKeys);
 win.addEventListener('focusin',event=>{const pane=event.target.closest('.txt-pane');if(pane&&pane.closest('.txt-window')===win)txtActivate(win,pane);},true);
}
function txtPrepare(win){
 if(!win.querySelector('.txt-panes')){
  const content=win.querySelector('.window-content'),panes=document.createElement('div'),pane=document.createElement('div');
  panes.className='txt-panes';pane.className='txt-pane';
  const app=win.querySelector('.txt-app'),toolbar=win.querySelector('.titlebar > .txt-toolbar');
  if(toolbar)app.prepend(toolbar);
  pane.append(app);panes.append(pane);content.replaceChildren(panes);
  const state=txtStates(win)[0];if(state)state.pane=pane;
 }
 for(const state of txtStates(win))if(!state.pane)state.pane=txtPanes(win)[0];
 txtBind(win);return win;
}
function txtDivider(body,area){
 const divider=document.createElement('div');divider.className='folder-pane-divider';divider.style.gridArea=area;body.append(divider);return divider;
}
function txtLayout(win){
 const body=win.querySelector('.txt-panes');if(!body)return;
 const panes=txtPanes(win),count=panes.length;
 body.dataset.paneCount=String(count);
 body.querySelectorAll('.folder-pane-divider').forEach(node=>node.remove());
 for(const pane of panes){pane.style.gridArea='';pane.querySelectorAll(':scope > .folder-pane-close').forEach(button=>button.remove());}
 win.classList.toggle('txt-split',count>1);
 if(count<=1){body.style.gridTemplateColumns='minmax(0,1fr)';body.style.gridTemplateRows='minmax(0,1fr)';return;}
 body.style.gridTemplateColumns='minmax(0,1fr) 1px minmax(0,1fr)';
 body.style.gridTemplateRows=count===2?'minmax(0,1fr)':'minmax(0,1fr) 1px minmax(0,1fr)';
 const area=(pane,value)=>{pane.style.gridArea=value;};
 if(count===2){area(panes[0],'1/1/2/2');area(panes[1],'1/3/2/4');txtDivider(body,'1/2/2/3');}
 if(count===3){area(panes[0],'1/1/2/2');area(panes[1],'1/3/2/4');area(panes[2],'3/1/4/4');txtDivider(body,'1/2/2/3');txtDivider(body,'2/1/3/4');}
 if(count===4){area(panes[0],'1/1/2/2');area(panes[1],'1/3/2/4');area(panes[2],'3/1/4/2');area(panes[3],'3/3/4/4');txtDivider(body,'1/2/3/3');txtDivider(body,'2/1/3/4');}
 for(const pane of panes){
  const button=document.createElement('button');button.className='folder-pane-close txt-pane-close';button.textContent='×';button.title='Close pane';button.setAttribute('aria-label','Close pane');
  button.onclick=event=>{event.stopPropagation();txtClosePane(win,pane);};pane.append(button);
 }
}
function txtAddPane(win){
 txtPrepare(win);
 if(txtPanes(win).length>=4)return null;
 const temp=CabanonTXT.open(null,true),state=[...CabanonTXT.editors].find(item=>item.win===temp);
 if(!state)return null;
 const app=temp.querySelector('.txt-app'),toolbar=temp.querySelector('.titlebar > .txt-toolbar'),pane=document.createElement('div');
 pane.className='txt-pane';pane.append(app);if(toolbar)app.prepend(toolbar);
 win.querySelector('.txt-panes').append(pane);
 state.win=win;state.pane=pane;state.label=win.querySelector('.window-title>span');
 windowMap.delete(temp.dataset.key);temp.remove();
 txtLayout(win);txtActivate(win,pane);focusWindow(win);state.input.focus({preventScroll:true});renderTaskbar();
 return state;
}
function txtSplit(win){
 const count=txtPanes(win).length;
 if(count>=4){CabanonTXT.open(null,true);return;}
 txtAddPane(win);
}
function txtClosePane(win,pane,immediate=false){
 const state=txtStateFor(win,pane);if(!state)return;
 const remove=()=>{
  CabanonTXT.editors.delete(state);
  if(state.pane?.isConnected)state.pane.remove();
  if(!txtPanes(win).length){windowMap.delete(win.dataset.key);win.remove();renderTaskbar();return;}
  txtLayout(win);txtActivate(win,txtPanes(win)[0]);focusWindow(win);renderTaskbar();
 };
 if(!immediate&&txtDirty(state))confirmDocumentClose(txtLabel(state),done=>CabanonTXT.saveCurrent(state,done),remove);
 else remove();
}
function txtCloseGroup(win){
 const states=txtStates(win);let index=0;
 const step=()=>{
  const state=states[index++];
  if(!state){
   for(const item of states)CabanonTXT.editors.delete(item);
   windowMap.delete(win.dataset.key);win.remove();renderTaskbar();return;
  }
  if(txtDirty(state))confirmDocumentClose(txtLabel(state),done=>CabanonTXT.saveCurrent(state,done),step);
  else step();
 };
 step();
}
function txtKeys(event){
 const win=event.currentTarget,state=win.txtActive;if(!state)return;
 if(event.target.closest('input,textarea'))event.stopPropagation();
 if(event.ctrlKey||event.metaKey){const key=event.key.toLowerCase();
  if(key==='s'){event.preventDefault();event.shiftKey?CabanonTXT.saveAs(state):CabanonTXT.saveCurrent(state);}
  if(key==='o'){event.preventDefault();CabanonTXT.importText(state);}
  if(key==='f'||key==='h'){event.preventDefault();CabanonTXT.toggleFind(state,key==='h');}
 }
 if(event.key==='F3'){event.preventDefault();CabanonTXT.findNext(state,event.shiftKey);}
 if(event.key==='Escape'&&!state.find.hidden){state.find.hidden=true;state.input.focus();}
 if(event.key==='Enter'&&event.target===state.query){event.preventDefault();CabanonTXT.findNext(state,event.shiftKey);}
}
function txtShell(){
 const win=createWindow('txt:'+crypto.randomUUID(),'TXT','text','<div class="txt-panes"></div>');
 win.classList.add('txt-window');win.dataset.ownerApp='TXT';Object.assign(win.style,{width:'820px',height:'680px'});
 const spacer=document.createElement('span');spacer.className='txt-title-spacer';spacer.setAttribute('aria-hidden','true');win.querySelector('.window-title').after(spacer);
 txtBind(win);return win;
}
let txtPaneGesture=null;
function txtPaneDropTarget(gesture,event){
 const hit=document.elementFromPoint(event.clientX,event.clientY);
 if(hit?.closest('.titlebar [data-win=close],.folder-pane-close'))return{type:'close',label:'close'};
 const pane=hit?.closest('.txt-pane');
 if(pane){
  const win=pane.closest('.txt-window');
  if(win===gesture.win)return pane===gesture.pane?{type:'invalid',label:'   X   '}:{type:'swap',pane,label:'←→ windows'};
  if(txtStates(win).length<4)return{type:'join',win,pane,label:'+ windows'};
  return{type:'invalid',label:'   X   '};
 }
 if(!hit?.closest('.txt-window')&&!hit?.closest('.titlebar,#from,#taskbar'))return gesture.button===2?{type:'close',label:'close'}:{type:'detach',label:'window'};
 return{type:'invalid',label:'   X   '};
}
function txtPaneDown(event){
 const pane=event.target.closest('.txt-pane');if(!pane)return;
 const win=pane.closest('.txt-window');if(!win||!win.classList.contains('txt-window'))return;
 if(![0,2].includes(event.button)||txtPanes(win).length<2)return;
 const state=txtStateFor(win,pane);if(!state)return;
 const textarea=event.target.closest('textarea.txt-editor');
 if(textarea){if(!CabanonTXT.blankAt(state,event.clientX,event.clientY))return;}
 else if(event.target.closest('input,button,select,.txt-toolbar,.txt-status,.txt-find,.folder-pane-close,.folder-pane-divider,.titlebar,.window-resize'))return;
 else if(!event.target.closest('.txt-app,.txt-panes,.txt-pane'))return;
 event.preventDefault();event.stopPropagation();
 const gesture={win,pane,state,button:event.button,x:event.clientX,y:event.clientY,started:false,cancelled:false};
 txtPaneGesture=gesture;txtActivate(win,pane);
 const move=ev=>{
  if(txtPaneGesture!==gesture)return;
  if(!gesture.started&&Math.hypot(ev.clientX-gesture.x,ev.clientY-gesture.y)<6)return;
  if(!gesture.started){gesture.started=true;CabanonDragFeedback.begin(gesture,{clientX:gesture.x,clientY:gesture.y});}
  ev.preventDefault();CabanonDragFeedback.update(gesture,ev,txtPaneDropTarget(gesture,ev).label);
 };
 const cleanup=()=>{removeEventListener('pointermove',move,true);removeEventListener('pointerup',end,true);removeEventListener('pointercancel',cancel,true);removeEventListener('blur',cancel);txtPaneGesture=null;CabanonDragFeedback.end(gesture);};
 const cancel=()=>{if(txtPaneGesture!==gesture)return;gesture.cancelled=true;cleanup();};
 const end=ev=>{
  if(txtPaneGesture!==gesture)return;
  const target=txtPaneDropTarget(gesture,ev);cleanup();
  if(!gesture.started){state.input.focus();state.input.setSelectionRange(state.input.value.length,state.input.value.length);return;}
  if(ev.type!=='pointerup'||gesture.cancelled)return;
  if(target.type==='close'){txtClosePane(gesture.win,gesture.pane);return;}
  if(target.type==='swap'){
   const mark=document.createComment('');gesture.pane.before(mark);target.pane.before(gesture.pane);mark.before(target.pane);mark.remove();
   txtLayout(gesture.win);txtActivate(gesture.win,gesture.pane);return;
  }
  if(target.type==='join'){
   txtPrepare(target.win);target.win.querySelector('.txt-panes').append(gesture.pane);
   state.win=target.win;state.pane=gesture.pane;state.label=target.win.querySelector('.window-title>span');
   txtLayout(gesture.win);txtLayout(target.win);txtActivate(target.win,gesture.pane);if(txtPanes(gesture.win).length)txtActivate(gesture.win,txtPanes(gesture.win)[0]);focusWindow(target.win);renderTaskbar();return;
  }
  if(target.type==='detach'){
   if(txtPanes(gesture.win).length<=1)return;
   const shell=txtShell();shell.querySelector('.txt-panes').append(gesture.pane);
   state.win=shell;state.pane=gesture.pane;state.label=shell.querySelector('.window-title>span');
   txtLayout(gesture.win);txtLayout(shell);txtActivate(shell,gesture.pane);if(txtPanes(gesture.win).length)txtActivate(gesture.win,txtPanes(gesture.win)[0]);focusWindow(shell);renderTaskbar();
  }
 };
 CabanonGestureCancel.rollback(cancel);
 addEventListener('pointermove',move,true);addEventListener('pointerup',end,true);addEventListener('pointercancel',cancel,true);addEventListener('blur',cancel);
}
addEventListener('pointerdown',txtPaneDown,true);
const txtRunShortcutBeforeGroups=runShortcut;
runShortcut=function(id,event){
 const win=activeWindow;
 if(win?.classList.contains('txt-window')){
  if(id==='splitWindow'){txtSplit(win);return true;}
  if(id==='newWindow'){CabanonTXT.open(null,true);return true;}
 }
 return txtRunShortcutBeforeGroups(id,event);
};
const txtCloseWindowBeforeGroups=closeShortcutWindow;
closeShortcutWindow=function(win){
 if(win?.classList.contains('txt-window')){const panes=txtPanes(win);if(panes.length>1)txtClosePane(win,win.txtActive?.pane);else txtCloseGroup(win);return;}
 return txtCloseWindowBeforeGroups(win);
};
window.CabanonTxtSplit={activate:txtActivate,prepare:txtPrepare,addPane:txtAddPane,split:txtSplit};
