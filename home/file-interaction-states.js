'use strict';
let contextIconTarget=null,dragFolderTarget=null,dragFolderOriginal=null;
function clearContextIcon(){contextIconTarget?.classList.remove('context-icon-active');contextIconTarget=null;}
const iconContextMenu=showContext;
showContext=function(event,items){clearContextIcon();contextIconTarget=event.target.closest('[data-entry],[data-file],[data-folder],[data-search-file],[data-app],[data-archive-file]');contextIconTarget?.classList.add('context-icon-active');return iconContextMenu(event,items);};
const closeIconContext=closeContext;closeContext=function(){closeIconContext();clearContextIcon();};
new MutationObserver(()=>{if(context.hidden)clearContextIcon();}).observe(context,{attributes:true,attributeFilter:['hidden']});
function clearDropFolder(){if(dragFolderTarget&&dragFolderOriginal){const svg=dragFolderTarget.querySelector('svg');if(svg){svg.innerHTML=dragFolderOriginal.markup;svg.style.cssText=dragFolderOriginal.style;}dragFolderTarget.classList.remove('drag-folder-active');}dragFolderTarget=null;dragFolderOriginal=null;}
addEventListener('dragleave',event=>{if(dragFolderTarget&&!dragFolderTarget.contains(event.relatedTarget)&&dragFolderTarget.contains(event.target))clearDropFolder();},true);
addEventListener('drop',clearDropFolder,true);addEventListener('dragend',clearDropFolder,true);

