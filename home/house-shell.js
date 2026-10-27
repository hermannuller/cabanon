'use strict';
const WORK_HEIGHT=1008;
function toast(text){const node=document.createElement('div');node.className='shell-toast';node.textContent=text;$('#desktop').append(node);setTimeout(()=>node.remove(),1000);}
async function copyPathText(text){try{if(window.cabanon?.copyPath)await window.cabanon.copyPath(text);else await navigator.clipboard.writeText(text);toast('path copied');}catch{toast('Unable to copy path');}}
const shellCreate=createWindow;
createWindow=function(key,title,glyph,content){const win=shellCreate(key,title,glyph,content);const max=win.querySelector('[data-win=max]');if(max&&!max.shellBound){max.shellBound=true;const previous=max.onclick;max.onclick=()=>{previous();if(win.classList.contains('maximized'))win.style.height=WORK_HEIGHT+'px';};}return win;};
const folderOpenBase=openFolderBrowser;
function configureFolder(win,path){
 win.dataset.fileBrowser=path;win.querySelector('.window-title>span:last-child').textContent='/'+path.split('/').filter(Boolean).at(-1);win.querySelector('.window-title').title=path;win.setAttribute('aria-label',path);
 win.querySelector('.house-path')?.remove();win.querySelectorAll('.window-setting-link').forEach(node=>node.remove());
 const header=win.querySelector('.window-title');header.ondblclick=event=>{if(event.target.closest('svg'))return;event.stopPropagation();toggleCode(win);};
 const svg=header.querySelector('svg');svg.style.cursor='pointer';svg.onpointerdown=event=>event.stopPropagation();svg.onclick=event=>{event.stopPropagation();copyPathText(win.dataset.fileBrowser);};
 if(!win.querySelector('.code-exit')){const exit=document.createElement('button');exit.className='code-exit';exit.innerHTML=closeMark();exit.title='Exit code';exit.onclick=()=>toggleCode(win,false);win.querySelector('.titlebar').insertBefore(exit,win.querySelector('[data-win=min]'));}
 if(!win.querySelector('.house-code')){const editor=document.createElement('textarea');editor.className='house-code';editor.spellcheck=false;editor.setAttribute('aria-label','Folder code');win.querySelector('.titlebar').append(editor);}
 const list=win.querySelector('.house-file-list');list.dataset.path=path;drawBrowser(win,path);return win;
}
function toggleCode(win,on=!win.classList.contains('code-mode')){
 win.classList.toggle('code-mode',on);const editor=win.querySelector('.house-code');
 if(on){if(!editor.value)editor.value=win.dataset.fileBrowser+'\n';editor.focus();}
 if(!editor.codeDragBound){editor.codeDragBound=true;editor.addEventListener('pointerdown',event=>{
  if(event.button!==0||win.classList.contains('maximized'))return;
  const rect=editor.getBoundingClientRect(),scale=$('#desktop').getBoundingClientRect().width/1920,css=getComputedStyle(editor),line=Math.floor(((event.clientY-rect.top)/scale+editor.scrollTop)/28),text=editor.value.split('\n')[line]||'';
  const canvas=document.createElement('canvas'),measure=canvas.getContext('2d');measure.font=`${css.fontWeight} ${css.fontSize} ${css.fontFamily}`;
  const textRight=8+measure.measureText(text).width;
  if(text&&((event.clientX-rect.left)/scale)<textRight+6)return;
  event.preventDefault();focusWindow(win);const start={x:event.clientX,y:event.clientY,left:win.offsetLeft,top:win.offsetTop};editor.setPointerCapture(event.pointerId);
  editor.onpointermove=move=>{if(!editor.hasPointerCapture(move.pointerId))return;Object.assign(win.style,{left:Math.max(0,Math.min(1920-win.offsetWidth,start.left+(move.clientX-start.x)/scale))+'px',top:Math.max(0,Math.min(1038,start.top+(move.clientY-start.y)/scale))+'px'});};
  editor.onpointerup=up=>{editor.onpointermove=null;if(editor.hasPointerCapture(up.pointerId))editor.releasePointerCapture(up.pointerId);};
 });}
}
let folderWindowSequence=0;
openFolderBrowser=function(path,force=false){path=folderPath(path);if(!force){const existing=[...windowMap.values()].find(win=>win.dataset.fileBrowser===path);if(existing){existing.hidden=false;closePanels();focusWindow(existing);return configureFolder(existing,path);}}const key=path==='/house'&&!windowMap.has('house')?'house':'file:'+path+'#'+(++folderWindowSequence);const win=createWindow(key,'HOUSE '+path,'folder','<div class="house-file-list" tabindex="0" role="listbox" aria-multiselectable="true"></div><p class="muted house-empty" hidden>No files found.</p>');const observer=new ResizeObserver(()=>{const list=win.querySelector('.house-file-list');if(list)list.style.gridTemplateRows=`repeat(${Math.max(1,Math.floor(list.clientHeight/56))},56px)`;});observer.observe(win);win.fileResizeObserver=observer;return configureFolder(win,path);};
const shellOpenFile=openFile;
openFile=function(name,options={}){if(fileIsFolder(name)){if(options.sourceList&&!options.newWindow){const win=options.sourceList.closest('.window');if(win?.dataset.fileBrowser){configureFolder(win,folderPath(name));return win;}}return openFolderBrowser(name,Boolean(options.newWindow));}return shellOpenFile(name);};
const shellDrawBrowser=drawBrowser;
drawBrowser=function(win,path){shellDrawBrowser(win,path);win.querySelectorAll('.window-setting-link').forEach(node=>node.remove());};
// One taskbar icon for each application type; recycle bin has its own group.
function windowType(key,win){if(win.dataset.fileBrowser||key==='house'||key.startsWith('file:/'))return 'folder';if(key.startsWith('app:'))return key;if(key==='system:trash')return 'trash';if(key.startsWith('file:'))return 'filetype:'+glyphFor(key.slice(5));return key;}
const taskPopup=document.createElement('div');taskPopup.id='task-popup';taskPopup.hidden=true;$('#desktop').append(taskPopup);
function taskGroups(){const groups=new Map();windowMap.forEach((win,key)=>{const type=windowType(key,win);if(!groups.has(type))groups.set(type,[]);groups.get(type).push({win,key});});return groups;}
function showTaskGroup(type,button){const members=taskGroups().get(type)||[];taskPopup.replaceChildren();members.forEach(({win})=>{const item=document.createElement('button');item.textContent=win.dataset.fileBrowser||win.querySelector('.window-title>span:last-child')?.textContent||'';item.className=win===activeWindow?'chosen':'';item.onclick=()=>{win.hidden=false;closePanels();focusWindow(win);taskPopup.hidden=true;};taskPopup.append(item);});const rect=button.getBoundingClientRect(),desktop=$('#desktop').getBoundingClientRect(),scale=desktop.width/1920;taskPopup.style.left=(rect.left-desktop.left)/scale+'px';taskPopup.hidden=false;}
function dockApplication(item){const name=item.win.dataset.ownerApp||(item.key.startsWith('app:')?item.key.slice(4):null);return name?apps.find(app=>app.name===canonicalAppName(name)):null;}
function dockIconMarkup(item){if(item.win.dataset.fileBrowser||item.key==='house')return icon('house');const app=dockApplication(item);return app?appIcon(app.glyph):item.win.querySelector('.window-title > .app-motion,.window-title > .colors-icon,.window-title > svg')?.outerHTML||icon('text');}
renderTaskbar=function(){
 const groups=taskGroups();const signature=[...groups].map(([type,members])=>type+':'+members.map(item=>item.key+(item.win.querySelector('.window-title>span:last-child')?.textContent||'')+(dockApplication(item)?.glyph||item.win.querySelector('.window-title > .app-motion,.window-title > .colors-icon,.window-title > svg')?.outerHTML||'')).join(',')).join('|');
 if(taskbar.dataset.signature!==signature){taskbar.dataset.signature=signature;taskbar.replaceChildren();groups.forEach((members,type)=>{const button=document.createElement('button');button.dataset.type=type;button.title=type==='folder'?'Folders':members[0].win.querySelector('.window-title>span:last-child')?.textContent||'';button.innerHTML=dockIconMarkup(members[0]);button.onpointerenter=()=>showTaskGroup(type,button);button.onclick=()=>{const win=members.find(item=>item.win===activeWindow)?.win||members.at(-1).win;win.hidden=false;closePanels();focusWindow(win);};taskbar.append(button);});}
 for(const button of taskbar.children){const current=(groups.get(button.dataset.type)||[]).some(({win})=>win===activeWindow&&!win.hidden);button.classList.toggle('current',current);button.setAttribute('aria-pressed',current);}
};
taskbar.onpointerleave=event=>{if(!taskPopup.contains(event.relatedTarget))taskPopup.hidden=true;};taskPopup.onpointerleave=()=>taskPopup.hidden=true;
// Alt alone reveals folder navigation and actions.
let loneAlt=false;


function toggleFolderTools(win,mode='quick'){
 const same=win.dataset.navigationMode===mode;win.querySelector('.house-tools')?.remove();win.querySelector('.house-navigation')?.remove();win.classList.remove('tools-open');delete win.dataset.navigationMode;if(same)return;
 const nav=document.createElement('nav');nav.className='house-navigation';win.dataset.navigationMode=mode;
 const paths=mode==='quick'?prefs.folders.map(folderPath):[...new Set(['/house',...prefs.entries.filter(entry=>entry.folder).map(entry=>folderPath(entry.name)),...win.dataset.fileBrowser.split('/').filter(Boolean).map((_part,index,array)=>'/'+array.slice(0,index+1).join('/')).filter(path=>path.startsWith('/house'))])].sort();
 if(mode==='tree'){
  const nodes=new Map();nodes.set('/house',{path:'/house',name:'house',folder:true,children:[]});
  function addFolder(path){if(nodes.has(path))return nodes.get(path);const parent=path.slice(0,path.lastIndexOf('/'))||'/house';const node={path,name:path.split('/').at(-1),folder:true,children:[]};nodes.set(path,node);addFolder(parent).children.push(node);return node;}
  paths.filter(path=>path!=='/house').forEach(addFolder);
  prefs.entries.filter(entry=>!entry.folder).forEach(entry=>{const parent=nodes.get(entry.parent)||addFolder(entry.parent);parent.children.push({path:entry.name,name:entry.name,folder:false,children:[]});});
  const lines=[];
  function visit(node,prefix='',branch='',continuation=''){
   const active=node.folder&&node.path===win.dataset.fileBrowser;
   lines.push(`<button ${node.folder?'data-nav="'+escapeHTML(node.path)+'"':'data-tree-file="'+escapeHTML(node.name)+'"'} class="tree-line ${active?'chosen':''}" title="${escapeHTML(node.path)}"><span class="tree-branch">${escapeHTML(prefix+branch)}</span><span>${escapeHTML((node.folder?'/':'')+fileLeafName(node.name))}</span></button>`);
   const children=node.children.sort((a,b)=>Number(b.folder)-Number(a.folder)||a.name.localeCompare(b.name));
   children.forEach((child,index)=>{const last=index===children.length-1;visit(child,prefix+continuation,last?'└─ ':'├─ ',last?'   ':'│  ');});
  }
  visit(nodes.get('/house'));nav.innerHTML='<div class="navigation-label">tree</div>'+lines.join('');
 }else nav.innerHTML=paths.map(path=>`<button data-nav="${escapeHTML(path)}" class="${path===win.dataset.fileBrowser?'chosen':''}" title="${escapeHTML(path)}">${escapeHTML(path.replace(/^\/house(?=\/)/,''))}</button>`).join('')+(paths.length?'':'<p class="muted">No pinned folders.</p>');
 nav.onclick=event=>{const button=event.target.closest('[data-nav]');if(button){configureFolder(win,button.dataset.nav);nav.querySelectorAll('button').forEach(item=>item.classList.toggle('chosen',item===button));}};nav.ondblclick=event=>{const file=event.target.closest('[data-tree-file]');if(file)openFile(file.dataset.treeFile);};win.querySelector('.window-content').prepend(nav);
 win.classList.add('tools-open');
}
let loneCtrl=false;



// Shared validation: an extension alone is not a file name.
function hasFileBaseName(name,folder=false){return CabanonFilenames.validate(name,folder).error!=='name';}
function pleaseNameIt(){const existing=document.querySelector('.name-required-popup');if(existing)return existing;const popup=warning('please name it.');popup.classList.add('name-required-popup');return popup;}
function newEntryBaseName(){return prefs.newEntryBaseName??'Let there be light';}
function defaultNewEntryName(extension='txt'){return CabanonFilenames.normalize(newEntryBaseName())+(extension?'.'+extension.replace(/^\./,''):'');}
function newFolderEntry(path,extension='txt'){return CabanonCreation.create(path,{folder:extension===null,extension})?.name;}

let fileClipboard=[];
function zipEntries(names,path){return CabanonCreation.create(path,{extension:'zip',contents:names})?.name;}
function renameEntries(names){const win=freshWindow('rename-files','RENAME','text',`<h1>Rename</h1>${names.map((name,index)=>`<label>${escapeHTML(name)}<input data-rename="${index}" value="${escapeHTML(name.split('/').at(-1))}"></label>`).join('')}<button class="action" id="rename-save">Save</button>`);win.querySelector('#rename-save').onclick=()=>{const values=[...win.querySelectorAll('[data-rename]')].map((input,index)=>CabanonFilenames.require(input.value,prefs.entries.find(e=>e.name===names[index])?.folder));if(values.some(name=>name===null))return;if(values.some(name=>name.includes('/'))||new Set(values).size!==values.length){toast('Invalid names');return;}const plans=names.map((name,index)=>{const entry=prefs.entries.find(item=>item.name===name);return {entry,old:name,name:entry.parent+'/'+values[index]};});if(plans.some(plan=>prefs.entries.some(entry=>CabanonFilenames.key(entry.name)===CabanonFilenames.key(plan.name)&&!names.includes(entry.name)))){toast('Name already exists');return;}for(const plan of plans){if(plan.entry.folder){const old=folderPath(plan.old);prefs.entries.forEach(entry=>{if(entry.parent===old||entry.parent.startsWith(old+'/'))entry.parent=plan.name+entry.parent.slice(old.length);});}plan.entry.name=plan.name;prefs.files=prefs.files.map(name=>name===plan.old?plan.name:name);prefs.recents.forEach(item=>{if(item.name===plan.old)item.name=plan.name;});}refreshBrowsers();renderDesktop();persistProfiles();win.querySelector('[data-win=close]').click();};}
const dropHint=document.createElement('div');dropHint.id='gesture-action-hint';dropHint.hidden=true;$('#desktop').append(dropHint);
function invalidFolderDrop(path){return(draggedFiles?.names||[]).some(name=>{const entry=prefs.entries.find(e=>e.name===name);if(!entry?.folder)return false;const root=folderPath(name);return path===root||path.startsWith(root+'/');});}
function dropTarget(event){const list=event.target.closest('.house-file-list');if(!list)return null;const blocked={list,blocked:true,protected:true,label:"   X   "};if(invalidFolderDrop(list.dataset.path))return blocked;const item=event.target.closest('[data-entry]');if(!item)return {list,path:list.dataset.path,label:'→ /'+list.dataset.path.split('/').at(-1)};const entry=prefs.entries.find(entry=>entry.name===item.dataset.entry);if(entry&&(draggedFiles?.names||[]).includes(entry.name))return blocked;if(entry?.folder){const path=folderPath(entry.name);return invalidFolderDrop(path)?blocked:{list,path,label:'→ /'+entry.name.split('/').at(-1)};}if(entry?.name.toLowerCase().endsWith('.zip'))return canAddToArchive(entry.name,draggedFiles?.names||[])?{list,zip:entry,label:'+ '+fileLeafName(entry.name)}:blocked;return {list,blocked:true,label:"   X   "};}
document.addEventListener('dragover',event=>{if(!draggedFiles)return;const target=dropTarget(event);if(!target){window.CabanonDragFeedback?.hideHint();return;}event.preventDefault();event.stopImmediatePropagation();window.CabanonDragFeedback?.present(event,target.blocked?"   X   ":fileDragLabel(target.zip?.name||(target.path===draggedFiles.source?'':target.path)));event.dataTransfer.dropEffect=target.blocked?'none':draggedFiles.action||'move';},true);
document.addEventListener('drop',event=>{if(!draggedFiles)return;const target=dropTarget(event);dropHint.hidden=true;if(!target)return;event.preventDefault();event.stopImmediatePropagation();if(!target.blocked){if(target.zip){archiveFileBatch(target.zip.name,draggedFiles.names,draggedFiles.action==='copy');}else transferFiles(draggedFiles.names,draggedFiles.source,target.path,{action:draggedFiles.action||'move'});}draggedFiles=null;},true);
document.addEventListener('dragend',()=>dropHint.hidden=true);
renderTaskbar();
document.addEventListener('wheel',event=>{const region=event.target.closest('.house-navigation,.house-file-list');if(!region)return;event.preventDefault();event.stopPropagation();if(region.classList.contains('house-navigation')){const tree=region.querySelector('.tree-scroll-body');if(tree)tree.scrollTop+=Math.sign(event.deltaY)*28;else region.scrollTop+=event.deltaY;}else if(Math.abs(event.deltaX)>Math.abs(event.deltaY))region.scrollLeft+=event.deltaX;else if(region.scrollHeight>region.clientHeight+1)region.scrollTop+=event.deltaY;else region.scrollLeft+=event.deltaY;},{passive:false,capture:true});





