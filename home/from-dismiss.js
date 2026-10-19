'use strict';
window.addEventListener('contextmenu',event=>{if(!event.target.closest('#start'))return;event.preventDefault();event.stopImmediatePropagation();closeContext();},true);
window.addEventListener('contextmenu',event=>{if(!event.target.closest('#system-icons'))return;event.preventDefault();event.stopImmediatePropagation();closeContext();openSettings('welcome','greeting');},true);
function dismissFrom(){ $('#from').hidden=true;$('#flyout').hidden=true;flyoutSource=null;$('#start').setAttribute('aria-expanded','false'); }
document.addEventListener('click',event=>{
 if($('#from').hidden||event.target.closest('#start'))return;
 if(event.target.closest('#from,#context-menu'))return;
 queueMicrotask(dismissFrom);
},true);
document.addEventListener('pointerdown',event=>{if(!$('#from').hidden&&!event.target.closest('#from,#start,#context-menu'))dismissFrom();},true);
document.addEventListener('keydown',event=>{
 if($('#from').hidden)return;
 const search=$('#file-search');
 const editing=event.target===search;
 if(['Control','Alt','Meta','Shift'].includes(event.key))return;
 if(event.ctrlKey||event.altKey||event.metaKey||/^F\d+$/.test(event.key)||event.key==='Escape'){
  // Preserve clipboard and selection shortcuts when already editing the search field.
  if(editing&&event.ctrlKey&&!event.altKey&&!event.metaKey&&['a','c','v','x','z','y'].includes(event.key.toLowerCase()))return;
  dismissFrom();return;
 }
 if(event.key.length===1||event.key==='Process'||event.isComposing){
  if(!editing){search.focus();if(event.key.length===1&&!event.isComposing){event.preventDefault();const start=search.selectionStart??search.value.length,end=search.selectionEnd??start;search.setRangeText(event.key,start,end,'end');search.dispatchEvent(new Event('input',{bubbles:true}));}}
 }else if(event.key==='Backspace'&&!editing){event.preventDefault();search.focus();const start=search.selectionStart??search.value.length,end=search.selectionEnd??start;search.setRangeText('',start===end?Math.max(0,start-1):start,end,'end');search.dispatchEvent(new Event('input',{bubbles:true}));}
},true);
