'use strict';
Object.assign(paths,{trash:'M5 8h22M11 8V3h10v5M8 8l2 22h12l2-22M13 12v13M19 12v13',input:'M3 5h26v22H3zM7 11h3M15 11h3M23 11h2M7 17h3M15 17h3M23 17h2M9 23h14',offline:'M3 4l26 25M5 11q11-8 22 1M9 18q7-5 14 1M14 26h4',update:'M25 9a11 11 0 1 0 1 14M25 2v7h-7'});
const inputMethods=[{id:'pinyin',name:'Microsoft Pinyin',short:'PY'},{id:'us',name:'US English',short:'EN'}];
function initInteractionPrefs(){prefs.systemOrder ||= ['network','volume','desktop','folder','settings','phone','user','power'];prefs.trash ||= [];prefs.uninstalled ||= [];prefs.input ||= {current:'pinyin',default:'pinyin',enabled:['pinyin','us'],width:'Half-width',language:'Chinese',showWidth:true,showLanguage:true};prefs.trashSettings ||= {days:30,maxMB:1024};}
paths.help='M5 2h16l6 6v22H5zM21 2v7h6M16 13v7M16 25h.1';
function ensureHelp(){if(isOwner()&&!prefs.helpSeeded){prefs.helpSeeded=true;if(!prefs.files.includes('Cabanon.help'))prefs.files.push('Cabanon.help');prefs.recents.unshift({name:'Cabanon.help',lastUsed:Date.now()});}}
ensureHelp();
initInteractionPrefs();
const status=document.createElement('div');status.id='home-status';status.innerHTML='<span id="status-extra"></span><span id="status-ime"></span><time id="status-time"></time>';$('#desktop').append(status);
const extras=document.createElement('nav');extras.id='extra-system';extras.innerHTML=`<button class="icon-button" data-system="trash" title="Recycle bin" aria-label="Recycle bin">${icon('trash')}</button><button class="icon-button" data-system="input" title="Input method" aria-label="Input method">${icon('input')}</button>`;$('.system').insertBefore(extras,$('#system-icons'));
function updateStatus(){initInteractionPrefs();const volume=$('[data-system=volume]');if(volume)volume.innerHTML=icon('volume');const markup=(prefs.network==='Offline'?icon('offline'):'')+(prefs.updateAvailable?icon('update'):'');const extra=$('#status-extra');if(extra.innerHTML!==markup)extra.innerHTML=markup;}
updateStatus();
function applySystemOrder(){initInteractionPrefs();prefs.systemOrder.forEach(name=>{const button=$(`[data-system="${name}"]`);if(button&&button.parentElement===$('#system-icons'))$('#system-icons').append(button);});}
const priorRefreshUser=refreshUserIcon;refreshUserIcon=function(){priorRefreshUser();initInteractionPrefs();ensureHelp();renderDesktop();applySystemOrder();updateStatus();};
function refreshFiles(){renderDesktop();$('#file-search').oninput();for(const win of windowMap.values()){if(!win.dataset.fileBrowser)continue;const list=win.querySelector('.house-file-list'),left=list.scrollLeft,top=list.scrollTop;drawBrowser(win,win.dataset.fileBrowser);list.scrollLeft=left;list.scrollTop=top;}}
function pruneTrash(){const limit=prefs.trashSettings.days*86400000;if(limit>0)prefs.trash=prefs.trash.filter(item=>Date.now()-item.deletedAt<limit);const max=prefs.trashSettings.maxMB*1024*1024;let total=prefs.trash.reduce((n,item)=>n+item.size,0),removed=0;while(total>max&&removed<prefs.trash.length)total-=prefs.trash[removed++].size;if(removed)prefs.trash.splice(0,removed);}
function deleteFile(name){initInteractionPrefs();prefs.trash.push({name,deletedAt:Date.now(),size:4096});prefs.files=prefs.files.filter(item=>item!==name);prefs.recents=prefs.recents.filter(item=>item.name!==name);const win=windowMap.get('file:'+name);if(win){win.remove();windowMap.delete('file:'+name);}pruneTrash();persistProfiles();refreshFiles();}
function freshWindow(key,title,glyph,content){const previous=windowMap.get(key);if(previous){previous.remove();windowMap.delete(key);}return createWindow(key,title,glyph,content);}
function openTrash(){initInteractionPrefs();pruneTrash();persistProfiles();const win=freshWindow('system:trash','RECYCLE BIN','trash',`<h1>RECYCLE BIN</h1>${prefs.trash.length?prefs.trash.map((item,index)=>`<div class="trash-row">${icon(glyphFor(item.name))}<span>${escapeHTML(item.name)}</span><button data-restore="${index}">Restore</button></div>`).join(''):'<p class="muted">No files found.</p>'}`);win.querySelectorAll('[data-restore]').forEach(button=>button.onclick=()=>{const [item]=prefs.trash.splice(Number(button.dataset.restore),1);if(!prefs.files.includes(item.name))prefs.files.push(item.name);persistProfiles();openTrash();});}
function openSpecificSettings(kind){
 initInteractionPrefs();
 const titles={network:'Internet setting',volume:'Volume setting',folder:'Folder setting',desktop:'Desktop setting',phone:'Phone setting',user:'User setting',power:'Power setting',trash:'Recycle bin setting',input:'Input method setting'};
 let content='';
 if(kind==='trash')content=`<label>Automatically delete after <input id="trash-days" type="number" min="0" max="3650" value="${prefs.trashSettings.days}"> days (0 = never)</label><label>Maximum space <input id="trash-space" type="number" min="1" max="1048576" value="${prefs.trashSettings.maxMB}"> MB</label>`;
 if(kind==='input')content=`<label>Default input method <select id="default-input">${inputMethods.map(method=>`<option value="${method.id}" ${prefs.input.default===method.id?'selected':''}>${method.name}</option>`).join('')}</select></label>${inputMethods.map(method=>`<label><input type="checkbox" data-enable-input="${method.id}" ${prefs.input.enabled.includes(method.id)?'checked':''}> ${method.name}</label>`).join('')}<label><input id="show-width" type="checkbox" ${prefs.input.showWidth?'checked':''}> Show full-width / half-width</label><label><input id="show-language" type="checkbox" ${prefs.input.showLanguage?'checked':''}> Show Chinese / English</label>`;
 if(kind==='network')content=`<label>Connection <select id="connection">${['Ethernet','Homie705','Fabira 44','HKNH','Holt112','Offline'].map(name=>`<option ${prefs.network===name?'selected':''}>${name}</option>`).join('')}</select></label>`;
 if(kind==='power')content=`<label><input type="checkbox" id="update-available" ${prefs.updateAvailable?'checked':''}> Update available</label>`;
 const title=titles[kind]||kind+' setting';
 const win=freshWindow('setting:'+kind,title,kind==='input'?'input':kind,`<h1>${escapeHTML(title)}</h1>${content||'<p class="muted">No options yet.</p>'}${content?'<button class="action" id="save-specific">Save</button><p class="muted" id="setting-feedback"></p>':''}`);
 if(content)win.querySelector('#save-specific').onclick=()=>{
  if(kind==='trash'){prefs.trashSettings={days:Math.max(0,Math.min(3650,Number(win.querySelector('#trash-days').value)||0)),maxMB:Math.max(1,Math.min(1048576,Number(win.querySelector('#trash-space').value)||1))};pruneTrash();}
  if(kind==='input'){const enabled=[...win.querySelectorAll('[data-enable-input]:checked')].map(input=>input.dataset.enableInput);const def=win.querySelector('#default-input').value;if(!enabled.includes(def))enabled.unshift(def);prefs.input={...prefs.input,enabled,default:def,current:enabled.includes(prefs.input.current)?prefs.input.current:def,showWidth:win.querySelector('#show-width').checked,showLanguage:win.querySelector('#show-language').checked};}
  if(kind==='network')prefs.network=win.querySelector('#connection').value;
  if(kind==='power')prefs.updateAvailable=win.querySelector('#update-available').checked;
  persistProfiles();updateStatus();win.querySelector('#setting-feedback').textContent='Saved.';
 };
}
const priorFlyout=showFlyout;
showFlyout=function(kind,button){
 initInteractionPrefs();
 if(kind==='input'){
  flyoutSource=kind;$('#flyout').hidden=false;
  $('#flyout').innerHTML=inputMethods.filter(method=>prefs.input.enabled.includes(method.id)).map(method=>`<button data-ime="${method.id}" class="${prefs.input.current===method.id?'chosen':''}">${method.name}</button>`).join('')+(prefs.input.showWidth?['Full-width','Half-width'].map(value=>`<button data-ime-width="${value}" class="${prefs.input.width===value?'chosen':''}">${value}</button>`).join(''):'')+(prefs.input.showLanguage?['Chinese','English'].map(value=>`<button data-ime-language="${value}" class="${prefs.input.language===value?'chosen':''}">${value}</button>`).join(''):'');
 }else priorFlyout(kind,button);
 if(kind!=='settings'){
  const setting=document.createElement('button');setting.className='menu-setting';setting.textContent=({network:'Internet',volume:'Volume',phone:'Phone',power:'Power',input:'Input method'}[kind]||kind)+' setting';setting.onclick=()=>openSpecificSettings(kind);$('#flyout').append(setting);
 }
 positionFlyout(button);
};
$('#flyout').addEventListener('click',event=>{const item=event.target.closest('[data-ime],[data-ime-width],[data-ime-language]');if(!item)return;if(item.dataset.ime)prefs.input.current=item.dataset.ime;if(item.dataset.imeWidth)prefs.input.width=item.dataset.imeWidth;if(item.dataset.imeLanguage)prefs.input.language=item.dataset.imeLanguage;persistProfiles();updateStatus();showFlyout('input',$('[data-system=input]'));});
extras.onpointerover=event=>{const button=event.target.closest('[data-system=input]');if(button&&flyoutSource!=='input')showFlyout('input',button);};
extras.onpointerleave=event=>{if(!$('#flyout').contains(event.relatedTarget)){$('#flyout').hidden=true;flyoutSource=null;}};
extras.onclick=event=>{const button=event.target.closest('[data-system]');if(!button)return;if(button.dataset.system==='trash')openTrash();else showFlyout('input',button);};
// Settings links also conclude window-based system lists.
const priorCreateWindow=createWindow;
createWindow=function(key,title,glyph,content){const win=priorCreateWindow(key,title,glyph,content);const kind=key==='house'||key.startsWith('file:/')?'folder':key==='system:users'?'user':key==='system:trash'?'trash':key==='system:NETWORK'?'network':key==='system:PHONE'?'phone':null;if(kind&&!win.querySelector('.window-setting-link')){const link=document.createElement('button');link.className='window-setting-link';link.textContent=({folder:'Folder',user:'User',trash:'Recycle bin',network:'Internet',phone:'Phone'}[kind])+' setting';link.onclick=()=>openSpecificSettings(kind);win.querySelector('.window-content').append(link);}return win;};
const context=document.createElement('div');context.id='context-menu';context.hidden=true;context.setAttribute('role','menu');$('#desktop').append(context);
function closeContext(){context.hidden=true;}
function showContext(event,items){event.preventDefault();context.replaceChildren();items.forEach(([label,action,danger])=>{const button=document.createElement('button');button.textContent=label;button.setAttribute('role','menuitem');if(danger)button.className='danger';button.onclick=()=>{closeContext();action();};context.append(button);});context.hidden=false;const rect=$('#desktop').getBoundingClientRect(),scale=rect.width/1920;context.style.left=Math.max(0,Math.min(1920-context.offsetWidth,(event.clientX-rect.left)/scale))+'px';context.style.top=Math.max(0,Math.min(1080-context.offsetHeight,(event.clientY-rect.top)/scale))+'px';}
document.addEventListener('pointerdown',event=>{if(!context.contains(event.target))closeContext();});
const priorClosePanels=closePanels;closePanels=function(){priorClosePanels();closeContext();};
// Prototype removal: confirmation only. Never mutate installation, layout or user data.
function uninstallApplication(name){name=canonicalAppName(name);if(!canRemoveApplication(name)||!apps.some(app=>app.name===name))return false;return true;}
function removeApplication(name){name=canonicalAppName(name);if(!canRemoveApplication(name))return;closePanels();confirmRemoval('remove '+appLabel(name),()=>uninstallApplication(name));document.querySelector('.removal-confirmation')?.classList.add('application-removal');}
// Pointer-based sorting: a short move remains a click; dragging suppresses the ensuing click.
let drag=null,suppressClick=false;
document.addEventListener('pointerdown',event=>{if(event.button!==0)return;const item=event.target.closest('#system-icons [data-system],#pinned [data-app],#folders [data-folder]');if(!item)return;drag={item,parent:item.parentElement,order:[...item.parentElement.children],x:event.clientX,y:event.clientY,moved:false};});
document.addEventListener('pointermove',event=>{if(!drag)return;if(!drag.moved&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)<6)return;drag.moved=true;drag.item.classList.add('dragging');$('#flyout').hidden=true;flyoutSource=null;const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('button');if(target&&target!==drag.item&&target.parentElement===drag.parent){const children=[...drag.parent.children];if(children.indexOf(target)>children.indexOf(drag.item))target.after(drag.item);else target.before(drag.item);}});
function finishDrag(event){if(!drag)return;if(event?.type==='pointercancel'){drag.order.forEach(node=>drag.parent.append(node));drag.item.classList.remove('dragging');drag=null;return;}drag.item.classList.remove('dragging');if(drag.moved){suppressClick=true;setTimeout(()=>suppressClick=false,0);if(drag.parent===$('#system-icons'))prefs.systemOrder=[...drag.parent.children].map(item=>item.dataset.system);if(drag.parent===$('#pinned'))prefs.pins=[...drag.parent.children].map(item=>item.dataset.app);if(drag.parent===$('#folders'))prefs.folders=[...drag.parent.children].map(item=>item.dataset.folder);persistProfiles();}drag=null;}
document.addEventListener('pointerup',finishDrag);document.addEventListener('pointercancel',finishDrag);document.addEventListener('click',event=>{if(suppressClick){event.preventDefault();event.stopImmediatePropagation();}},true);
const priorRenderAll=renderAll;renderAll=function(){initInteractionPrefs();priorRenderAll();$('#app-grid').querySelectorAll('[data-app]').forEach(button=>{if(prefs.uninstalled.includes(button.dataset.app))button.remove();});$('#no-results').hidden=$('#app-grid').children.length>0;};
// A plain road-sign outline identifies a shortcut.
shortcutGlyph=function(name){return `<span class="shortcut-icon">${icon(name)}<svg class="shortcut-tag" viewBox="0 0 14 12" aria-hidden="true"><path d="M1 2h8l4 4-4 4H1z"/></svg></span>`;};
applySystemOrder();pruneTrash();persistProfiles();renderPins();renderDesktop();updateStatus();
setInterval(()=>{initInteractionPrefs();const count=prefs.trash.length;pruneTrash();if(count!==prefs.trash.length)persistProfiles();},60000);


