'use strict';
document.addEventListener('keydown',event=>{
 if($('#all-apps').hidden)return;
 const search=$('#search');if(event.target===search||event.ctrlKey||event.altKey||event.metaKey)return;
 if(event.key.length===1||event.key==='Process'||event.isComposing){search.focus();if(event.key.length===1&&!event.isComposing){event.preventDefault();const start=search.selectionStart??search.value.length,end=search.selectionEnd??start;search.setRangeText(event.key,start,end,'end');search.dispatchEvent(new Event('input',{bubbles:true}));}}
 else if(event.key==='Backspace'){event.preventDefault();search.focus();const start=search.selectionStart??search.value.length,end=search.selectionEnd??start;search.setRangeText('',start===end?Math.max(0,start-1):start,end,'end');search.dispatchEvent(new Event('input',{bubbles:true}));}
},true);
