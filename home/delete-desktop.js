'use strict';
function confirmRemoval(label,action){document.querySelector('.removal-confirmation')?.remove();const shade=document.createElement('div');shade.className='removal-confirmation';const clearAll=label==='Clear all desktop shortcuts';const message=clearAll?'you will clear all the links, are you sure?':label+'?';shade.innerHTML=`<div role="alertdialog" aria-modal="true"><p>${escapeHTML(message)}</p><div><button data-answer="yes">yes</button><button data-answer="no">no</button></div></div>`;shade.querySelector('[data-answer=yes]').onclick=()=>{shade.remove();action();};shade.querySelector('[data-answer=no]').onclick=()=>shade.remove();$('#desktop').append(shade);shade.querySelector('[data-answer=no]').focus();}
const contextWithConfirmation=showContext;
showContext=function(event,items){contextWithConfirmation(event,items);for(const button of context.querySelectorAll(':scope > button')){if(/^delete/i.test(button.textContent)){const action=button.onclick;button.onclick=()=>{const label=button.textContent;closeContext();confirmRemoval(label,action);};}const label=button.textContent.trim();if(/^[▦▤]\s*(List|Details)$/.test(label)){const list=label.endsWith('List');button.innerHTML=`<svg class="view-menu-icon" viewBox="0 0 32 32" aria-hidden="true"><path d="${list?'M3 7H13M19 7H29M3 16H13M19 16H29M3 25H13M19 25H29':'M3 7H29M3 16H29M3 25H29'}"/></svg><span>${list?'List':'Details'}</span>`;}}};
const desktopWithSort=renderDesktop;
renderDesktop=function(){desktopWithSort();const sorting=prefs.desktopSort;if(!sorting)return;const files=$('#files'),rows=[...files.children];const value=row=>{const name=row.dataset.file,entry=prefs.entries.find(e=>e.name===name);if(!entry)return name||'';return sorting.key==='name'?name.toLowerCase():sorting.key==='type'?entry.folder?'folder':name.split('.').at(-1):sorting.key==='date'?entryDate(entry):entrySize(entry);};rows.sort((a,b)=>{const av=value(a),bv=value(b);return (typeof av==='number'?av-bv:String(av).localeCompare(String(bv)))*(sorting.direction==='up'?-1:1);}).forEach(row=>files.append(row));};





