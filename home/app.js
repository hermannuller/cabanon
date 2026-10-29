'use strict';
const $ = selector => document.querySelector(selector);
const paths = {
 unknown:'M4 3H28V29H4zM11 11Q11 6 17 7Q23 8 20 13L16 17V20M16 24h.1',
 unfinished:'M2 2h28v28H2z',
 river:'M1 12h15V8h15v4H16v4H1zM1 20h15v-4h15v4H16v4H1z',
 network:'M3 4a21 21 0 0 1 21 21M3 12a13 13 0 0 1 13 13M3 20a5 5 0 0 1 5 5M3 25h1',
 volume:'M3 11h5l7-6v22l-7-6H3zM20 10q8 6 0 12M23 5q14 11 0 22',
 desktop:'M3 4h26v18H3zM10 28h12M16 22v6',
 folder:'M2 8V5h11l4 4h13v19H2z',
 settings:'M13 2h6l1 5 4 2 4-2 3 5-4 3v4l4 3-3 5-4-2-4 2-1 5h-6l-1-5-4-2-4 2-3-5 4-3v-4l-4-3 3-5 4 2 4-2zM21 17a5 5 0 1 1-10 0 5 5 0 0 1 10 0',
 phone:'M8 2h16v28H8zM16 24v3',
 user:'M22 9a6 6 0 1 1-12 0 6 6 0 0 1 12 0M4 30q0-13 12-13t12 13z',
 power:'M16 2v14M9 6a12 12 0 1 0 14 0',
 headphones:'M3 20v-6a13 13 0 0 1 26 0v6M3 16h6v13H3zM23 16h6v13h-6z',
 radio:'M3 11h26v18H3zM5 6l22-4M16 17h10M16 23h10M12 21a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
 text:'M3 3h26v26H3zM7 9h18M7 15h18M7 21h12',
 grid:'M3 3h26v26H3zM11 3v26M21 3v26M3 11h26M3 21h26',
 globe:'M29 16a13 13 0 1 1-26 0 13 13 0 0 1 26 0M3 16h26M16 3q-12 13 0 26M16 3q12 13 0 26',
 dots:'M5 4h2v2H5zM15 4h2v2h-2zM25 4h2v2h-2zM5 14h2v2H5zM15 14h2v2h-2zM25 14h2v2h-2zM5 24h2v2H5zM15 24h2v2h-2zM25 24h2v2h-2z',
 calculator:'M5 2h22v28H5zM9 6h14v6H9zM10 17h1M16 17h1M22 17h1M10 23h1M16 23h1M22 23h1',
 music:'M11 24V6l17-3v18M11 24q-8-6-8 0t8 0M28 21q-8-6-8 0t8 0',
 chat:'M2 3h28v20H11l-9 7zM7 9h18M7 16h12',
 zip:'M4 2h24v28H4zM14 2v4h4v4h-4v4h4v4h-4v4h4v6h-4'
};
const icon = name => motionAppIcon(name)||(name==='colors'?'<span class="colors-icon" aria-hidden="true"></span>':customIconMarkup(name==='volume'&&typeof prefs!=='undefined'&&prefs.volume===0?'mute':name,'outline')||`<svg viewBox="0 0 32 32" aria-hidden="true"><path d="${paths[name] || paths.text}"/></svg>`);
const apps = [
 ['MARATHON','text'],['TXT','text'],['POINT','text'],['Ur','text'],['RIVER','river'],['THEN','text'],['COLORS','text'],['EMPTY','unfinished'],['LINE','blind'],['ZIP','zip'],['WALL','wall'],['CARE','user'],['DATE','text'],['TYPE','text'],['WHERE','globe'],['DIAL','text'],['WEATHER','text'],['STOCKS','text'],['CALC','calculator'],['OutDesign','text'],['HELP','help'],['ASTRO','unfinished'],['TIME','unfinished']
].map(([name,glyph])=>({name,glyph:({MARATHON:'marathon',LINE:'blind',POINT:'pnyx',DIAL:'dial',Ur:'ur',WALL:'wall',WHERE:'where',EMPTY:'empty','HELP':'help-app'})[name]||(name==='COLORS'?'colors':['MARATHON','RIVER','ZIP','WALL','CALC','HELP','TXT'].includes(name)?glyph:'unfinished'),implemented:['MARATHON','RIVER','ZIP','WALL','CALC','HELP','TXT'].includes(name)}));
for(const app of apps)if(applicationPdfIcons[app.name])app.glyph='pdf-'+applicationPdfIcons[app.name];
for(const [id,definition]of Object.entries(quickToolApplications))if(!apps.some(app=>app.name===id))apps.push({name:id,glyph:'quick-'+definition[1],implemented:true});
const appNameMigration=Object.freeze({NEWS:'LINE',CALQ:'CALC',WALL:'WALL',ART:'WALL',HELP:'HELP','HELP!':'HELP','HELP！':'HELP',ZIP:'ZIP',MAP:'WHERE',OURDESIGN:'OutDesign',PEOPLE:'CARE'});
// Legacy display names from older profiles; canonical names live in application-names.js.
const renamedApplications=Object.freeze({BERLIN:'WALL',BLIND:'LINE',STUFF:'ZIP',OUTSIDE:'WEATHER',PNYX:'POINT'});
function canonicalAppName(name){return Object.keys(applicationNames).find(id=>appLabel(id).toLowerCase()===String(name).toLowerCase())||renamedApplications[String(name).toUpperCase()]||appNameMigration[name]||apps.find(app=>app.name.toLowerCase()===String(name).toLowerCase())?.name||name;}
function removeSketchFiles(profile){
 const sketch=value=>typeof value==='string'&&!value.startsWith('/')&&/\.skch$/i.test(value);
 const prune=(value,key='')=>{if(Array.isArray(value))return value.filter(item=>!sketch(item)).map(item=>prune(item)).filter(item=>item!==undefined);if(value&&typeof value==='object'){if(value.folder!==true&&['name','source','target','file'].some(field=>sketch(value[field])))return undefined;const result={};for(const [field,item]of Object.entries(value)){if(sketch(field))continue;if(field==='content'){result[field]=Object.fromEntries(Object.entries(item||{}).filter(([name])=>!sketch(name)));continue;}result[field]=['text','body','description'].includes(field)?item:prune(item,field);}return result;}return value;};
 const cleaned=prune(profile);for(const key of Object.keys(profile))delete profile[key];Object.assign(profile,cleaned);if(profile.settings?.extensions)for(const [name,extensions]of Object.entries(profile.settings.extensions))profile.settings.extensions[name]=extensions.filter(ext=>ext.toLowerCase()!=='.skch');
}
function migrateLegacyFileExtensions(profile){
 if(profile.legacyFileExtensionsVersion===1)return;
 const extensions={wri:'md',gri:'tsv',ear:'mp3',poi:'show'},names=new Set(),skip=new Set(['text','body','description','value']);
 const refs=new Set(['files','contents','fromFilePins','pinnedFiles','desktopLinks','desktopOrder','manualOrder','names']);
 const collect=(value,key='')=>{if(Array.isArray(value)){for(const item of value){if(typeof item==='string'&&refs.has(key))names.add(item);else collect(item,key);}return;}if(!value||typeof value!=='object')return;for(const field of ['name','source','target','file'])if(value.folder!==true&&typeof value[field]==='string')names.add(value[field]);for(const [field,item]of Object.entries(value)){if(skip.has(field))continue;if(field==='content'){if(item&&typeof item==='object')for(const name of Object.keys(item))names.add(name);continue;}collect(item,field);}};
 collect(profile);const occupied=new Set([...names].map(name=>name.toLowerCase())),renames=new Map();
 for(const name of names){if(name.startsWith('/'))continue;const match=/\.(wri|gri|ear|poi)$/i.exec(name);if(!match)continue;const base=name.slice(0,-match[0].length),extension='.'+extensions[match[1].toLowerCase()];let next=base+extension,index=1;while(occupied.has(next.toLowerCase()))next=base+'_'+index+++extension;occupied.add(next.toLowerCase());renames.set(name,next);}
 const mapped=value=>renames.get(value)||value;
 const walk=(value,key='')=>{if(typeof value==='string')return mapped(value);if(Array.isArray(value))return value.map(item=>walk(item,key));if(value&&typeof value==='object'){const result={};for(const [field,item]of Object.entries(value)){if(field==='content'){result[field]=item&&typeof item==='object'?Object.fromEntries(Object.entries(item).map(([name,content])=>[mapped(name),content])):item;continue;}if(field==='extensions'){result[field]=Object.fromEntries(Object.entries(item||{}).map(([app,formats])=>[app,[...new Set(formats.map(format=>format.replace(/\.(wri|gri|ear|poi)$/i,(_,ext)=>'.'+extensions[ext.toLowerCase()])))]]));continue;}result[mapped(field)]=skip.has(field)?item:walk(item,field);}return result;}return value;};
 const migrated=walk(profile);for(const key of Object.keys(profile))delete profile[key];Object.assign(profile,migrated);profile.legacyFileExtensionsVersion=1;
}
function migrateHelpExtension(profile){
 if(profile.helpExtensionVersion===1)return;const oldName=/\.help[!！]$/i,map=new Map(),occupied=new Set((profile.entries||[]).map(e=>String(e.name).toLowerCase()));
 const collect=value=>{if(typeof value==='string'){if(oldName.test(value)&&!map.has(value)){const base=value.replace(oldName,''),ext='.help';let next=base+ext,n=1;while(occupied.has(next.toLowerCase()))next=base+'_'+n+++ext;occupied.add(next.toLowerCase());map.set(value,next);}return;}if(Array.isArray(value)){for(const item of value)collect(item);return;}if(value&&typeof value==='object')for(const [key,item]of Object.entries(value))if(!['content','document','text','body','description'].includes(key))collect(item);};collect(profile.entries||[]);collect(profile);
 const walk=value=>{if(typeof value==='string')return map.get(value)||value;if(Array.isArray(value))return value.map(walk);if(value&&typeof value==='object'){const result={};for(const [key,item]of Object.entries(value)){if(key==='content'){result[key]=Object.fromEntries(Object.entries(item||{}).map(([id,text])=>[map.get(id)||id,text]));}else result[map.get(key)||key]=['document','text','body','description'].includes(key)?item:walk(item);}return result;}return value;};
 const migrated=walk(profile);for(const key of Object.keys(profile))delete profile[key];Object.assign(profile,migrated);if(profile.settings?.extensions)for(const key of Object.keys(profile.settings.extensions))profile.settings.extensions[key]=profile.settings.extensions[key].map(ext=>oldName.test(ext)?'.help':ext);profile.helpExtensionVersion=1;
}
function normalizeApplicationCatalog(profile){
 migrateHelpExtension(profile);
 migrateLegacyFileExtensions(profile);
 removeSketchFiles(profile);
 const names=new Set(apps.map(app=>app.name));const list=values=>[...new Set((values||[]).map(canonicalAppName))].filter(name=>names.has(name));
 profile.uninstalled=list(profile.uninstalled);profile.pins=list(profile.pins).filter(id=>!profile.uninstalled.includes(id));
 if(profile.phone?.items){
  const removed=new Set(profile.phone.items.filter(item=>!item.members&&item.id!=='/HOUSE'&&!names.has(canonicalAppName(item.id))).map(item=>item.id));
  let changed=true;while(changed){changed=false;for(const item of profile.phone.items){
   if(!item.members||removed.has(item.id))continue;
   item.members=item.members.filter(id=>!removed.has(id)&&(names.has(canonicalAppName(id))||id==='/HOUSE'||profile.phone.items.some(other=>other.id===id&&other.members)));
   if(!item.members.length){removed.add(item.id);changed=true;}
  }}
  profile.phone.items=profile.phone.items.filter(item=>!removed.has(item.id));
  for(const item of profile.phone.items){item.id=canonicalAppName(item.id);if(item.members)item.members=[...new Set(item.members.map(canonicalAppName))];}
  profile.phone.items=profile.phone.items.filter((item,index,all)=>all.findIndex(other=>other.id===item.id)===index);
  if(profile.phone.widgetData)for(const id of Object.keys(profile.phone.widgetData))if(!names.has(canonicalAppName(id)))delete profile.phone.widgetData[id];
 }
 const usage={};for(const [oldName,count]of Object.entries(profile.usage||{})){const name=canonicalAppName(oldName);if(names.has(name))usage[name]=(usage[name]||0)+(Number(count)||0);}profile.usage=usage;
 const settings=profile.settings;if(settings){settings.startup=list(settings.startup);for(const record of settings.appTime||[])record.name=canonicalAppName(record.name);settings.appTime=(settings.appTime||[]).filter(record=>names.has(record.name));if(settings.extensions){const map={};for(const [key,values]of Object.entries(settings.extensions)){const name=canonicalAppName(key);if(names.has(name))map[name]=[...new Set([...(map[name]||[]),...values.map(value=>value==='.help'?'.help':value)])];}if(profile.appCatalogVersion!==2&&map.MARATHON?.includes('.txt')){map.MARATHON=map.MARATHON.filter(value=>value!=='.txt');map.TXT=[...new Set([...(map.TXT||[]),'.txt'])];}settings.extensions=map;}}

 profile.appCatalogVersion=2;
}
apps.forEach((app,index)=>{app.installed=Date.UTC(2026,9,16)+index*86400000;app.baseUsage=0;});
const sampleFiles = ['/cabanon','/samura','/Helllooo','/books','/jobs','/archive','/desktop','/projects'];
// Supported formats are independent of the single default app selected in Setting.
const applicationFileFormats=Object.freeze({MARATHON:['.txt','.md','.html'],TXT:['.txt'],POINT:['.show'],Ur:['.tsv'],RIVER:[],THEN:['.plan'],COLORS:['.mp3','.flac','.wav','.srt','.vtt','.lrc'],EMPTY:['.mp3','.flac','.wav','.srt','.vtt','.lrc'],LINE:['.html'],ZIP:['.zip','.7z','.tar.gz','.bz2','.xz','.rar'],WALL:['.wall','.pwall'],CARE:['.vcf'],DATE:['.ics'],TYPE:['.ttf','.otf','.woff2'],WHERE:[],DIAL:[],WEATHER:[],LINE:['.rss','.xml'],STOCKS:[],CALC:[],OutDesign:['.out'],'HELP':['.help'],ASTRO:[]});
const knownFileExtensions=Object.freeze([...new Set(Object.values(applicationFileFormats).flat())].sort((a,b)=>b.length-a.length));
function knownFileExtension(name){const lower=String(name).toLowerCase();return knownFileExtensions.find(extension=>lower.endsWith(extension))||'';}
function fileIsFolder(name){const entry=prefs.entries?.find(e=>e.name===name);return entry?!!entry.folder:String(name).startsWith('/');}
function fileLeafName(name){return String(name).split('/').at(-1);}
const glyphFor = name => {if(name==='/house/hole')return 'hole';if(fileIsFolder(name))return 'folder';const extension=knownFileExtension(name);if(!extension)return 'unknown';if(extension==='.txt')return 'txt-file';if(extension==='.help')return 'help';if(['.wall','.pwall'].includes(extension))return 'wall';if(applicationFileFormats.ZIP.includes(extension))return 'zip';if(['.mp3','.flac','.wav'].includes(extension))return 'headphones';if(extension==='.tsv')return 'grid';return 'text';};
const escapeHTML = text => String(text).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let prefs = { pins:apps.map(app=>app.name), folders:['/cabanon','/jobs','/books','/some','/samura','/Helllooo'], volume:60, network:'Ethernet', user:'MAIN' };
try { const saved=JSON.parse(localStorage.getItem('cabanon-home')); if(saved) prefs={...prefs,...saved}; } catch {}
function save(){if(typeof queueProfileSave==='function')queueProfileSave();else try{localStorage.setItem('cabanon-home',JSON.stringify(prefs));}catch{}}
normalizeApplicationCatalog(prefs);
if(!['name','installed','usage'].includes(prefs.sort))prefs.sort='name';
if(!prefs.usage||typeof prefs.usage!=='object')prefs.usage={};
let activeWindow=null,zIndex=10;
const windowMap=new Map();
let flyoutSource=null;
function fitDesktop(){ $('#desktop').style.transform=`scale(${Math.min(innerWidth/1920,innerHeight/1080)})`; }
addEventListener('resize',fitDesktop);fitDesktop();
function closePanels(){ $('#from').hidden=true;$('#all-apps').hidden=true;$('#flyout').hidden=true;flyoutSource=null;$('#start').setAttribute('aria-expanded','false'); }
function showFrom(){ $('#all-apps').hidden=true;$('#from').hidden=false;$('#start').setAttribute('aria-expanded','true'); }
$('#start').onclick=()=>{ if($('#from').hidden)showFrom();else closePanels(); };
$('#all-toggle').innerHTML=icon('dots');
$('#all-toggle').onclick=()=>{ $('#from').hidden=true;$('#flyout').hidden=true;$('#all-apps').hidden=false;$('#search').value='';renderAll();$('#search').focus(); };
$('#all-back').onclick=showFrom;
function renderAll(){const query=$('#search').value.toLowerCase();const visible=apps.filter(app=>appLabel(app.name).toLowerCase().includes(query)).sort((a,b)=>{const alphabetical=appLabel(a.name).localeCompare(appLabel(b.name),'en');if(prefs.sort==='installed')return b.installed-a.installed||alphabetical;if(prefs.sort==='usage')return (b.baseUsage+(prefs.usage[b.name]||0))-(a.baseUsage+(prefs.usage[a.name]||0))||alphabetical;return alphabetical;});$('#app-grid').innerHTML=visible.map(app=>`<button class="app-row" data-app="${app.name}">${icon(app.glyph)}<span>${escapeHTML(appLabel(app.name))}</span></button>`).join('');$('#app-grid').scrollLeft=0;$('#no-results').hidden=visible.length>0;$('#app-sort').querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',button.dataset.sort===prefs.sort));}
$('#app-sort [data-sort=name]').innerHTML='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 13L7 3l4 10M4 9h6M3 20h8L3 29h8M22 3v26M17 24l5 5 5-5"/></svg>';
$('#app-sort [data-sort=installed]').innerHTML='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M12 3a11 11 0 1 0 11 11M12 7v8l5 3M25 2v15M21 13l4 4 4-4"/></svg>';
$('#app-sort [data-sort=usage]').innerHTML='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 6h18M3 15h13M3 24h8M26 3v26M22 25l4 4 4-4"/></svg>';
$('#app-sort').onclick=event=>{const button=event.target.closest('[data-sort]');if(button){prefs.sort=button.dataset.sort;save();renderAll();}};
$('#search').oninput=()=>renderAll();
[['name','A','Z'],['installed','new','old'],['usage','often','rare']].forEach(([mode,top,bottom])=>{$(`#app-sort [data-sort=${mode}]`).innerHTML=`<span class="sort-words"><span>${top}</span><span>${bottom}</span></span><span class="sort-arrow">↓</span>`;});
$('#file-search').oninput=()=>{
 const query=$('#file-search').value.trim().toLowerCase();
 $('#from').classList.toggle('searching-files',Boolean(query));
 const results=$('#file-results');results.hidden=!query;
 const files=[...new Set([...sampleFiles,...prefs.folders])].filter(name=>name.toLowerCase().includes(query));
 results.innerHTML=files.length?files.map(name=>`<button class="file" data-search-file="${escapeHTML(name)}">${icon(glyphFor(name))}<span>${escapeHTML(name)}</span></button>`).join(''):'<p class="muted">No files found.</p>';
};
$('#file-results').onclick=event=>{const file=event.target.closest('[data-search-file]');if(file)openFile(file.dataset.searchFile);};
$('#app-grid').addEventListener('wheel',event=>{const grid=$('#app-grid');if(grid.scrollWidth>grid.clientWidth&&Math.abs(event.deltaY)>Math.abs(event.deltaX)){event.preventDefault();grid.scrollLeft+=event.deltaY;}},{passive:false});
function layoutPins(){
 const panel=$('#from');
 const height=Math.max(parseFloat(panel.style.height)||548,parseFloat(panel.style.minHeight)||548);
 const rows=Math.max(8,Math.floor((height-80)/56));
 const columns=Math.max(1,Math.ceil($('#pinned').children.length/rows));
 const minWidth=180+columns*280+240;
 panel.style.minWidth=`${minWidth}px`;
 panel.style.width=`${Math.max(minWidth,parseFloat(panel.style.width)||700)}px`;
 panel.style.gridTemplateColumns=`180px ${columns*280}px minmax(240px,1fr)`;
 $('#pinned').style.gridTemplateRows=`repeat(${rows},56px)`;
}
function renderPins(){ $('#pinned').innerHTML=prefs.pins.map(name=>apps.find(app=>app.name===name)).filter(Boolean).map(app=>`<button class="app-row" data-app="${app.name}">${icon(app.glyph)}<span>${escapeHTML(appLabel(app.name))}</span></button>`).join('');$('#folders').innerHTML=prefs.folders.map(name=>`<button class="folder-row" data-folder="${escapeHTML(name)}">${icon('folder')}<span>${escapeHTML(name)}</span></button>`).join('');layoutPins(); }
renderPins();
$('#files').innerHTML=sampleFiles.map(name=>`<button class="file" data-file="${escapeHTML(name)}">${icon(glyphFor(name))}<span>${escapeHTML(name)}</span></button>`).join('');
$('#files').onclick=event=>{const item=event.target.closest('[data-file]');document.querySelectorAll('#files .selected').forEach(node=>node.classList.remove('selected'));if(item)item.classList.add('selected');closePanels();};
$('#files').ondblclick=event=>{const item=event.target.closest('[data-file]');if(item)openFile(item.dataset.file);};
function updateTime(){const now=new Date();$('#time').textContent=now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});$('#date').textContent=`${String(now.getFullYear()).slice(2)}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;$('#weekday').textContent=now.toLocaleDateString('en-US',{weekday:'long'});}
updateTime();
const systemItems=[['network','Network'],['volume','Volume'],['desktop','on the wall'],['folder','File manager'],['settings','Settings'],['phone','Phone'],['user','Users'],['power','Power']];
$('#system-icons').innerHTML=systemItems.map(([name,title])=>`<button class="icon-button" data-system="${name}" aria-label="${title}" title="${title}">${icon(name==='folder'?'house':name)}</button>`).join('');
function showFlyout(kind,button){
 const fly=$('#flyout');flyoutSource=kind;fly.hidden=false;
 if(kind==='network'){
  fly.innerHTML=`${['Ethernet','Homie705','Fabira 44','HKNH','Holt112'].map(name=>`<button class="${prefs.network===name?'chosen':''}" aria-pressed="${prefs.network===name}" data-network="${name}">${icon(name==='Ethernet'?'ethernet':'network')}<span>${name}</span></button>`).join('')}<button data-open="NETWORK">Network settings →</button>`;
 }else if(kind==='volume'){
  const outputs=['Headphone Realtek 23026','SONOS KV455','Norik Display'];
  fly.innerHTML=`<div class="volume-row">${icon('volume')}<div id="volume-shade" role="slider" tabindex="0" aria-label="Volume" aria-valuemin="0" aria-valuemax="100"></div><span id="volume-percent"></span></div>${outputs.map((name,index)=>`<button data-output="${name}" class="${(prefs.output||outputs[0])===name?'chosen':''}" aria-pressed="${(prefs.output||outputs[0])===name}" title="${['Wired','Bluetooth','Device'][index]}">${icon(['wired','bluetooth','desktop'][index])}<span>${name}</span></button>`).join('')}`;
  const shade=$('#volume-shade');
  const paint=()=>{const steps=Math.max(0,Math.min(20,Math.round(prefs.volume/5)));prefs.volume=steps*5;shade.textContent='▓'.repeat(steps)+'░'.repeat(20-steps);shade.setAttribute('aria-valuenow',prefs.volume);$('#volume-percent').textContent=prefs.volume+'%';const volumeButton=$('[data-system=volume]');if(volumeButton)volumeButton.innerHTML=icon('volume');const volumeMark=shade.parentElement.querySelector('svg');if(volumeMark)volumeMark.outerHTML=icon('volume');};
  const change=event=>{const rect=shade.getBoundingClientRect();prefs.volume=Math.max(0,Math.min(20,Math.round((event.clientX-rect.left)/rect.width*20)))*5;paint();save();};
  paint();
  shade.onpointerdown=event=>{if(event.button!==0)return;event.preventDefault();const before=prefs.volume;window.CabanonGestureCancel?.rollback(()=>{prefs.volume=before;paint();save();});shade.setPointerCapture(event.pointerId);change(event);};
  shade.onpointermove=event=>{if(shade.hasPointerCapture(event.pointerId))change(event);};
  shade.onpointerup=event=>{if(shade.hasPointerCapture(event.pointerId)){change(event);shade.releasePointerCapture(event.pointerId);}};
 }else if(kind==='phone'){
  fly.innerHTML='<button data-open="SMS">SMS</button><button data-open="CALL">CALL</button><button data-open="SEND">SEND</button>';
 }else if(kind==='power'){
  fly.innerHTML=[['Lock','lock'],['Sleep','sleep'],['Shut down','power'],['Restart','restart']].map(([action,glyph])=>`<button data-power="${action}">${icon(glyph)}<span>${action}</span></button>`).join('');
 }
}
$('#flyout').addEventListener('click',event=>{const output=event.target.closest('[data-output]');if(output){prefs.output=output.dataset.output;save();$('#flyout').querySelectorAll('[data-output]').forEach(button=>{const chosen=button===output;button.classList.toggle('chosen',chosen);button.setAttribute('aria-pressed',chosen);});}});
$('#system-icons').addEventListener('pointerover',event=>{const button=event.target.closest('[data-system]');if(button&&['network','volume','phone'].includes(button.dataset.system)&&flyoutSource!==button.dataset.system)showFlyout(button.dataset.system,button);});
function positionFlyout(button){
 const fly=$('#flyout'),panel=$('#from');
 if(fly.hidden)return;
 const scale=$('#desktop').getBoundingClientRect().width/1920;
 const origin=panel.getBoundingClientRect(),anchor=button.getBoundingClientRect();
 const top=(anchor.top-origin.top)/scale;
 const bottom=(anchor.bottom-origin.top)/scale;
 fly.style.left=`${(anchor.right-origin.left)/scale}px`;
 fly.style.top=`${top+fly.offsetHeight<=panel.clientHeight?top:bottom-fly.offsetHeight}px`;
}
const originalShowFlyout=showFlyout;
showFlyout=function(kind,button){originalShowFlyout(kind,button);positionFlyout(button);};
new ResizeObserver(()=>{if(flyoutSource){const button=document.querySelector(`[data-system="${flyoutSource}"]`);if(button)positionFlyout(button);}}).observe($('#from'));
$('#system-icons').onclick=event=>{const button=event.target.closest('[data-system]');if(!button)return;const kind=button.dataset.system;if(kind==='desktop'){closePanels();windowMap.forEach(win=>win.hidden=true);activeWindow=null;}else if(kind==='folder')openFolderBrowser('/house');else if(kind==='settings')openSettings();else if(kind==='network')openSystem('NETWORK');else if(kind==='phone')openSystem('PHONE');else if(kind==='user')openUsers();else showFlyout(kind,button);};
$('#flyout').onpointerleave=()=>{$('#flyout').hidden=true;flyoutSource=null;};
$('#system-icons').addEventListener('pointerleave',event=>{if(!$('#flyout').contains(event.relatedTarget)){$('#flyout').hidden=true;flyoutSource=null;}});
document.addEventListener('click',event=>{const app=event.target.closest('[data-app]');if(app)openApp(app.dataset.app);const folder=event.target.closest('[data-folder]');if(folder)openFile(folder.dataset.folder);const network=event.target.closest('[data-network]');if(network){prefs.network=network.dataset.network;save();showFlyout('network',document.querySelector('[data-system=network]'));}const system=event.target.closest('[data-open]');if(system)openSystem(system.dataset.open);const power=event.target.closest('[data-power]');if(power)powerAction(power.dataset.power);if(event.target===$('#desktop'))closePanels();});
function focusWindow(win){win.style.zIndex=++zIndex;document.querySelectorAll('.window').forEach(node=>node.classList.remove('active'));win.classList.add('active');activeWindow=win;}
function observeWindowResize(win,node,callback){const observer=new ResizeObserver(callback);(win.ownedResizeObservers ||= new Set()).add(observer);observer.observe(node);return observer;}
function disposeWindowResources(win){win.fileResizeObserver?.disconnect();for(const observer of win.ownedResizeObservers||[])observer.disconnect();win.ownedResizeObservers?.clear();win.resizeCode=null;}
new MutationObserver(records=>{for(const record of records)for(const node of record.removedNodes){if(node.nodeType!==1||node.isConnected)continue;if(node.matches('.window'))disposeWindowResources(node);if(node.treeResizeObserver)node.treeResizeObserver.disconnect();for(const body of node.querySelectorAll('.tree-scroll-body'))body.treeResizeObserver?.disconnect();}}).observe($('#windows'),{childList:true,subtree:true});
function createWindow(key,title,glyph,content){if(key.startsWith('app:'))title=appLabel(key.slice(4));if(key.startsWith('app:'))title=appLabel(key.slice(4));closePanels();if(windowMap.has(key)){const existing=windowMap.get(key);existing.hidden=false;focusWindow(existing);return existing;}const win=document.createElement('section');win.className='window';win.dataset.key=key;win.setAttribute('aria-label',title);const offset=windowMap.size%7;Object.assign(win.style,{left:`${360+offset*44}px`,top:`${110+offset*38}px`,width:'900px',height:'650px'});win.innerHTML=`<header class="titlebar"><div class="window-title">${icon(glyph)}<span>${escapeHTML(title)}</span></div><button data-win="min" aria-label="Minimize">−</button><button data-win="max" aria-label="Maximize">□</button><button class="close" data-win="close" aria-label="Close">×</button></header><div class="window-content">${content}</div>`;$('#windows').append(win);windowMap.set(key,win);focusWindow(win);win.addEventListener('pointerdown',()=>focusWindow(win));win.querySelector('[data-win=close]').onclick=()=>{windowMap.delete(key);win.remove();if(activeWindow===win)activeWindow=null;};win.querySelector('[data-win=min]').onclick=()=>{win.hidden=true;activeWindow=null;};win.querySelector('[data-win=max]').onclick=()=>{if(win.classList.contains('maximized')){Object.assign(win.style,win.restoreRect);win.classList.remove('maximized');}else{win.restoreRect={left:win.style.left,top:win.style.top,width:win.style.width,height:win.style.height};Object.assign(win.style,{left:'0px',top:'0px',width:'1920px',height:'1080px'});win.classList.add('maximized');}};const handle=win.querySelector('.window-title');handle.ondblclick=()=>win.querySelector('[data-win=max]').click();handle.onpointerdown=event=>{if(win.classList.contains('maximized'))return;const scale=$('#desktop').getBoundingClientRect().width/1920;const x=event.clientX,y=event.clientY,left=parseFloat(win.style.left),top=parseFloat(win.style.top);handle.setPointerCapture(event.pointerId);handle.onpointermove=move=>{win.style.left=`${Math.max(0,Math.min(1920-win.offsetWidth,left+(move.clientX-x)/scale))}px`;win.style.top=`${Math.max(0,Math.min(1038,top+(move.clientY-y)/scale))}px`;};handle.onpointerup=()=>{handle.onpointermove=null;};};return win;}
function placeholder(title,description='Application content will be added later.'){return `<h1>${escapeHTML(title)}</h1><p>${escapeHTML(description)}</p><p class="muted">Cabanon OS Prototype</p>`;}
function openApp(name){const app=apps.find(item=>item.name===name);if(!app||prefs.uninstalled.includes(name))return;prefs.usage[name]=(prefs.usage[name]||0)+1;save();createWindow('app:'+name,name,app?.glyph||'text',placeholder(appLabel(name)));}
function openFile(name){if(name.startsWith('/')){createWindow('file:'+name,'FILE '+name,'folder',`<h1>${escapeHTML(name)}</h1><p class="muted">Folder preview</p>${sampleFiles.slice(1,12).map(file=>`<button class="file" data-file-open="${escapeHTML(file)}">${icon(glyphFor(file))}<span>${escapeHTML(file)}</span></button>`).join('')}`);}else createWindow('file:'+name,name,glyphFor(name),placeholder(name,'File preview.'));}
document.addEventListener('dblclick',event=>{const file=event.target.closest('[data-file-open]');if(file)openFile(file.dataset.fileOpen);});
function openSystem(name){createWindow('system:'+name,name,name==='NETWORK'?'network':'phone',placeholder(name,name==='NETWORK'?`Current connection: ${prefs.network}.`:'No content yet.'));}
function openUsers(){const win=createWindow('system:users','USER','user',`<h1>USER</h1><button class="action" id="main-user">${escapeHTML(prefs.user)} →</button><p class="muted">Owner</p>`);win.querySelector('#main-user').onclick=()=>openAccount();}
function openAccount(){const win=createWindow('system:account','ACCOUNT','user',`<h1>ACCOUNT</h1><label>ID <input id="account-id" maxlength="32" value="${escapeHTML(prefs.user)}"></label><button class="action" id="save-id">Save ID</button><h2>Sign-in options</h2><p class="muted">Settings will be added later.</p><button class="action" data-account="Sign out">Sign out</button><button class="action" data-account="Restore data">Restore data</button><p id="account-feedback" class="muted"></p>`);win.querySelector('#save-id').onclick=()=>{const value=win.querySelector('#account-id').value.trim();if(value){prefs.user=value;save();win.querySelector('#account-feedback').textContent='ID saved.';}};win.querySelectorAll('[data-account]').forEach(button=>button.onclick=()=>{win.querySelector('#account-feedback').textContent=button.dataset.account+': Not available yet.';});}
function openSettings(){const win=createWindow('system:settings','SETTING','settings',`<h1>SETTING</h1><h2>HOME · pinned applications</h2><div class="pin-options">${apps.map(app=>`<label><input type="checkbox" data-pin="${app.name}" ${prefs.pins.includes(app.name)?'checked':''}> ${escapeHTML(appLabel(app.name))}</label>`).join('')}</div><h2>Pinned folders</h2><label>One folder per line <textarea id="folder-input" rows="5" spellcheck="false"></textarea></label><button class="action" id="save-folders">Save folders</button><h2>Running windows</h2><div class="running-list" id="running-list"></div><h2>DISPLAY</h2><p>1920 × 1080 · JetBrains Mono / Inter</p><p class="muted">Fixed 1920 x 1080 canvas.</p>`);win.querySelectorAll('[data-pin]').forEach(input=>input.onchange=()=>{prefs.pins=apps.filter(app=>win.querySelector(`[data-pin="${app.name}"]`).checked).map(app=>app.name);save();renderPins();});win.querySelector('#folder-input').value=prefs.folders.join('\n');win.querySelector('#save-folders').onclick=()=>{prefs.folders=win.querySelector('#folder-input').value.split('\n').map(x=>x.trim()).filter(Boolean);save();renderPins();};const list=win.querySelector('#running-list');list.replaceChildren();windowMap.forEach((item,key)=>{if(item===win)return;const button=document.createElement('button');button.textContent=(item.hidden?'○ ':'● ')+item.querySelector('.window-title span').textContent;button.onclick=()=>{item.hidden=false;closePanels();focusWindow(item);};list.append(button);});if(!list.children.length)list.textContent='No other windows';}
function powerAction(action){closePanels();$('#power-title').textContent=action;$('#power-screen').hidden=false;if(action==='Restart'){windowMap.forEach(win=>win.remove());windowMap.clear();activeWindow=null;}}
$('#resume').onclick=()=>{$('#power-screen').hidden=true;};
$('#exit-prototype').onclick=()=>{if(window.cabanon)window.cabanon.close();else window.close();};
document.querySelectorAll('[data-resize]').forEach(handle=>{handle.onpointerdown=event=>{const panel=$('#from'),scale=$('#desktop').getBoundingClientRect().width/1920,x=event.clientX,y=event.clientY,width=panel.offsetWidth,height=panel.offsetHeight;const before=panel.style.width;window.CabanonGestureCancel?.rollback(()=>{panel.style.width=before;layoutPins();});handle.onpointercancel=()=>handle.onpointermove=null;handle.setPointerCapture(event.pointerId);handle.onpointermove=move=>{if(handle.dataset.resize!=='north')panel.style.width=`${Math.max(parseFloat(panel.style.minWidth)||700,Math.min(1920,width+(move.clientX-x)/scale))}px`;layoutPins();};handle.onpointerup=()=>{handle.onpointermove=null;};};});


