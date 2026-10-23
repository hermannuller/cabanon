'use strict';
Object.assign(paths,{
 ethernet:'M3 3h26v18H3zM8 3v7M13 3v7M19 3v7M24 3v7M11 21v8M21 21v8M11 29h10',
 wired:'M11 3v7M21 3v7M7 10h18v7l-6 6h-6l-6-6zM16 23v7',
 bluetooth:'M16 2v28l10-9-19-14M7 25L26 11 16 2',
 lock:'M7 14h18v16H7zM10 14V8a6 6 0 0 1 12 0v6M16 20v5',
 sleep:'M23 3A14 14 0 1 0 29 24 13 13 0 0 1 23 3',
 restart:'M27 10A12 12 0 1 0 28 22M27 2v8h-8',
 owner:'M10 8L8 2l5 3 3-4 3 4 5-3-2 6zM21 15a5 5 0 1 1-10 0 5 5 0 0 1 10 0M4 30q0-10 12-10t12 10z'
});
const isOwner=()=>activeProfile==='owner';
let activeProfile='owner';
let profiles={};
try{activeProfile=localStorage.getItem('cabanon-active-user')||'owner';profiles=JSON.parse(localStorage.getItem('cabanon-profiles'))||{};}catch{}
if(!profiles[activeProfile]&&!['owner','guest1','guest2'].includes(activeProfile))activeProfile='owner';
const newGuest=id=>({pins:[],folders:[],volume:60,network:'Ethernet',user:id,sort:'name',usage:{},recents:[],files:[]});
if(!profiles.owner)profiles.owner=activeProfile==='owner'?structuredClone(prefs):{...newGuest('MAIN'),pins:apps.map(app=>app.name),folders:['/cabanon','/jobs','/books']};
for(const [id,name]of [['guest1','GUEST 01'],['guest2','GUEST 02']])if(!profiles.owner.settings?.deletedGuests?.includes(id))profiles[id] ||= newGuest(name);
Object.values(profiles).forEach(normalizeApplicationCatalog);
// cabanon-home is always the latest saved state of the active profile.
profiles[activeProfile]=structuredClone(prefs);
if(!Array.isArray(prefs.recents))prefs.recents=isOwner()?sampleFiles.filter(name=>!fileIsFolder(name)).map((name,index)=>({name,lastUsed:Date.UTC(2026,9,13)-index*60000})):[];
if(!Array.isArray(prefs.files))prefs.files=isOwner()?[...sampleFiles]:[];
let profileSaveTimer=0;
const storedProfileValues=new Map(['cabanon-home','cabanon-profiles','cabanon-active-user'].map(key=>[key,localStorage.getItem(key)]));
function flushProfiles(){if(profileSaveTimer)clearTimeout(profileSaveTimer);profileSaveTimer=0;profiles[activeProfile]=prefs;const current=JSON.stringify(prefs);const all='{'+Object.entries(profiles).map(([id,profile])=>JSON.stringify(id)+':'+(profile===prefs?current:JSON.stringify(profile))).join(',')+'}';const values=[['cabanon-home',current],['cabanon-profiles',all],['cabanon-active-user',activeProfile]];for(const [key,value]of values)if(storedProfileValues.get(key)!==value){try{localStorage.setItem(key,value);storedProfileValues.set(key,value);}catch(error){console.error('Unable to save profile',error);}}}
function queueProfileSave(){profiles[activeProfile]=prefs;if(!profileSaveTimer)profileSaveTimer=setTimeout(flushProfiles,120);}
function persistProfiles(){queueProfileSave();}
addEventListener('pagehide',flushProfiles);addEventListener('beforeunload',flushProfiles);
function shortcutGlyph(name){return `<span class="shortcut-icon">${icon(name)}<svg class="shortcut-tag" viewBox="0 0 14 12" aria-hidden="true"><path d="M1 3h8l4 4-4 4H1zM4 6h4M6 4l2 2-2 2"/></svg></span>`;}
function renderDesktop(){
 $('#files').innerHTML=[...prefs.recents].filter(item=>!fileIsFolder(item.name)).sort((a,b)=>b.lastUsed-a.lastUsed||a.name.localeCompare(b.name)).map(item=>`<button class="file" data-file="${escapeHTML(item.name)}" title="${escapeHTML(item.name)}">${shortcutGlyph(glyphFor(item.name))}<span>${escapeHTML(item.name)}</span></button>`).join('');
}
function recordRecent(name){name=fileCanonicalName(name);if(fileIsFolder(name))return;prefs.recents=prefs.recents.filter(item=>item.name!==name);prefs.recents.unshift({name,lastUsed:Date.now()});if(!prefs.files.includes(name))prefs.files.push(name);persistProfiles();renderDesktop();}
const baseRenderPins=renderPins;
renderPins=function(){baseRenderPins();$('#pinned').querySelectorAll('[data-app]').forEach(button=>{const app=apps.find(app=>app.name===button.dataset.app);button.innerHTML=`${shortcutGlyph(app.glyph)}<span>${escapeHTML(appLabel(app.name))}</span>`;});$('#folders').querySelectorAll('[data-folder]').forEach(button=>{button.innerHTML=`${shortcutGlyph('folder')}<span>${escapeHTML(button.dataset.folder)}</span>`;});};
function refreshUserIcon(){const button=$('[data-system=user]');button.innerHTML=icon(isOwner()?'owner':'user');button.title=isOwner()?'Owner':'Guest';button.setAttribute('aria-label',button.title);}
function switchUser(target){
 if(target===activeProfile){openAccount();return;}
 const targetName=profiles[target].user;
 const dialog=createWindow('system:switch','SWITCH USER','user',`<h1>Switch user?</h1><p>Switch to ${escapeHTML(targetName)}?</p><button class="action" id="confirm-user">Switch</button><button class="action" id="cancel-user">Cancel</button>`);
 dialog.querySelector('#cancel-user').onclick=()=>dialog.querySelector('[data-win=close]').click();
 dialog.querySelector('#confirm-user').onclick=()=>{
  persistProfiles();activeProfile=target;prefs=structuredClone(profiles[target]);prefs.recents ||= [];prefs.files ||= [];prefs.usage ||= {};
  windowMap.forEach(win=>win.remove());windowMap.clear();activeWindow=null;
  $('#file-search').value='';$('#file-search').oninput();$('#search').value='';
  $('#from').style.width='700px';renderPins();refreshUserIcon();closePanels();persistProfiles();
 };
}
openUsers=function(){
 const win=createWindow('system:users','USERS',isOwner()?'owner':'user',`<h1>USERS</h1>${['owner','guest1','guest2'].map(id=>`<button class="user-row ${id===activeProfile?'current-user':''}" data-user="${id}">${icon(id==='owner'?'owner':'user')}<span>${escapeHTML(profiles[id].user)}<small>${id==='owner'?'Owner':'Guest'}${id===activeProfile?' · Current':''}</small></span></button>`).join('')}`);
 win.querySelectorAll('[data-user]').forEach(button=>button.onclick=()=>switchUser(button.dataset.user));
};
openAccount=function(){
 const win=createWindow('system:account','ACCOUNT',isOwner()?'owner':'user',`<h1>ACCOUNT</h1><p>${isOwner()?'Owner':'Guest'}</p><label>ID <input id="account-id" maxlength="32" value="${escapeHTML(prefs.user)}"></label><button class="action" id="save-id">Save ID</button><h2>Sign-in options</h2><button class="action" data-account="Sign out">Sign out</button><button class="action" data-account="Restore data">Restore data</button><p id="account-feedback" class="muted"></p>`);
 win.querySelector('#save-id').onclick=()=>{const value=win.querySelector('#account-id').value.trim();if(value){prefs.user=value;persistProfiles();win.querySelector('#account-feedback').textContent='ID saved.';}};
 win.querySelectorAll('[data-account]').forEach(button=>button.onclick=()=>{win.querySelector('#account-feedback').textContent=button.dataset.account+' is not available yet.';});
};
function openHouse(){
 createWindow('house','HOUSE','folder',`<h1>HOUSE</h1>${prefs.files.length?prefs.files.map(file=>`<button class="file" data-file-open="${escapeHTML(file)}">${icon(glyphFor(file))}<span>${escapeHTML(file)}</span></button>`).join(''):'<p class="muted">No files found.</p>'}`);
}
openFile=function(name){
 if(fileLeafName(name).toLowerCase()==='cabanon.help'){recordRecent('Cabanon.help');return openHelp();}
 if(fileIsFolder(name)){createWindow('file:'+name,'HOUSE '+name,'folder',`<h1>${escapeHTML(name)}</h1>${prefs.files.filter(file=>!fileIsFolder(file)).map(file=>`<button class="file" data-file-open="${escapeHTML(file)}">${icon(glyphFor(file))}<span>${escapeHTML(file)}</span></button>`).join('')||'<p class="muted">No files found.</p>'}`);return;}
 recordRecent(name);createWindow('file:'+name,fileLeafName(name),glyphFor(name),`<h1>${escapeHTML(fileLeafName(name))}</h1>`);
};
placeholder=function(title,description=''){return `<h1>${escapeHTML(title)}</h1>${description?`<p>${escapeHTML(description)}</p>`:''}`;};
openSystem=function(name){createWindow('system:'+name,name,name==='NETWORK'?'network':'phone',placeholder(name));};
$('#file-search').oninput=()=>{
 const query=$('#file-search').value.trim().toLowerCase();$('#from').classList.toggle('searching-files',Boolean(query));const results=$('#file-results');results.hidden=!query;
 const files=[...new Set([...prefs.files,...prefs.folders])].filter(name=>name.toLowerCase().includes(query));
 results.innerHTML=files.length?files.map(name=>`<button class="file" data-search-file="${escapeHTML(name)}">${icon(glyphFor(name))}<span>${escapeHTML(name)}</span></button>`).join(''):'<p class="muted">No files found.</p>';
};
powerAction=function(action){closePanels();$('#power-title').textContent=action;$('#power-screen').hidden=false;if(action==='Restart'){windowMap.forEach(win=>win.remove());windowMap.clear();activeWindow=null;}};
$('#power-screen p').textContent='';$('#resume').textContent='Return to Cabanon';$('#exit-prototype').textContent='Exit';
const englishLabels={network:'Network',volume:'Volume',desktop:'Desktop',folder:'House',settings:'Settings',phone:'Phone',user:'Users',power:'Power'};
Object.entries(englishLabels).forEach(([key,label])=>{const button=$(`[data-system=${key}]`);button.title=label;button.setAttribute('aria-label',label);});
const baseOpenSettings=openSettings;
openSettings=function(){baseOpenSettings();const win=windowMap.get('system:settings');const translations={'Pinned folders':'Pinned folders','One folder per line ':'One folder per line ','Save folders':'Save folders','Running windows':'Running windows','No other windows':'No other windows.','Fixed 1920 x 1080 canvas.':'Fixed 1920 × 1080 canvas.'};const walker=document.createTreeWalker(win,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){if(translations[node.nodeValue])node.nodeValue=translations[node.nodeValue];}};
// System text and labels are English; file names retain their own content.
persistProfiles();renderPins();refreshUserIcon();
