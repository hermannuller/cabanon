'use strict';
function fileCodePath(win,key){if(win.dataset.fileBrowser)return win.dataset.fileBrowser;let name=key.startsWith('archive:')?key.slice(8):key.startsWith('archive-content:')?key.split(':').at(-1):key.slice(5);const entry=prefs.entries?.find(entry=>entry.name===name);return (entry?.parent||'/house')+'/'+name;}
const filesWithCode=createWindow;
createWindow=function(key,title,glyph,content){const win=filesWithCode(key,title,glyph,content);if(key==='house'||key.startsWith('file:')||key.startsWith('archive:')||key.startsWith('archive-content:')){
 win.dataset.codeFileKey=key;
 if(!win.querySelector('.house-code')&&!win.querySelector('.code-surface')){const editor=document.createElement('textarea');editor.className='house-code';editor.value=fileCodePath(win,key);win.querySelector('.titlebar').append(editor);}
 win.querySelector('.window-title').ondblclick=event=>{event.preventDefault();event.stopPropagation();toggleCode(win);};
 }return win;};
const toggleFileCode=toggleCode;
toggleCode=function(win,on=!win.classList.contains('code-mode')){if(on&&!win.querySelector('.code-surface')){let editor=win.querySelector('.house-code');if(!editor){editor=document.createElement('textarea');editor.className='house-code';win.querySelector('.titlebar').append(editor);}editor.value=fileCodePath(win,win.dataset.codeFileKey||win.dataset.key);}toggleFileCode(win,on);win.querySelector('.code-exit')?.remove();};
