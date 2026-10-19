'use strict';
// Organize the existing settings without losing saved preferences or old entry points.
settingSections.splice(0,settingSections.length,
 ['welcome','Welcome',[['greeting','Welcome'],['controls','Basic controls']]],
 ['me','user',[['identity','Identity'],['login','Sign-in options'],['accounts','Accounts'],['else','else']]],
 ['system','System',[['time','Time'],['power','Power'],['storage','Storage'],['updates','Automatic updates'],['history','Update history'],['reinstall','Reinstall'],['factory','Factory reset']]],
 ['language','Lang & Input',[['system-language','System language'],['keyboard','Keyboard'],['input-language','Input language'],['input-method','Input method']]],
 ['volume','Sound',[['volume','Volume'],['source','Audio sources'],['sounds','Sound effects']]],
 ['devices','Devices',[['hardware','']]],
 ['apps','Apps',[['all-apps','All Apps'],['defaults','Default actions']]],
 ['internet','Internet',[['ethernet','Ethernet'],['wifi','Wi-Fi'],['hotspot','Personal hotspot']]],
 ['modes','Modes',[['silent','Silent'],['airplane','Airplane'],['night','Night']]],
 ['visual','Visual',[['wallpaper','Desktop'],['resolution','Resolution'],['brightness','Brightness'],['theme','Theme'],['font','Font and size']]],
 ['shortcuts','Shortcuts',[['scheme','Shortcut scheme']]],
 ['right','RIGHT!',[['drag','Drag'],['box','Box select']]],
 ['sharing','Sharing',[['connect','Connect to //share']]],
 ['about','?',[['about','']]]
);
function settingRoute(section,item){
 if(section==='time')return['system',item||'time'];
 if(section==='power')return['system',item==='screen'?'screen':'power'];
 if(section==='storage')return['system','storage'];
 if(section==='cabanon')return item==='controls'?['welcome','controls']:['system',item];
 if(section==='me'&&item==='welcome')return['welcome','greeting'];
 if(section==='devices')return['devices','hardware'];
 return[section,item];
}
const settingOpenBeforeOrganization=openSettings;
openSettings=function(section='welcome',item=null){return settingOpenBeforeOrganization(...settingRoute(section,item));};
const settingSpecificBeforeOrganization=openSpecificSettings;
openSpecificSettings=function(kind){if(kind==='trash')return openSettings('system','storage');if(kind==='desktop')return openSettings('visual','wallpaper');return settingSpecificBeforeOrganization(kind);};
settingNavigate=function(win,id,item){
 [id,item]=settingRoute(id,item);settingNavigateBeforeRevision(win,id,item);
 for(const block of win.querySelectorAll('article>.setting-item')){
  const heading=block.querySelector(':scope>h2');if(!heading)continue;
  const normalize=text=>text.toLowerCase().replace(/[^a-z0-9]/g,'');
  const title=normalize(heading.textContent),label=block.querySelector('.setting-row>span:first-child,.setting-switch-label');
  const buttons=block.querySelectorAll(':scope>button');
  if(win.dataset.settingSection==='visual'&&block.dataset.settingItem==='font'||!title||label&&normalize(label.textContent).replace(/s$/,'')===title.replace(/s$/,'')||buttons.length===1&&normalize(buttons[0].textContent).includes(title))heading.remove();
 }
 if(item)win.querySelector('article [data-setting-item="'+item+'"]')?.scrollIntoView({block:'start'});
};
const settingSearchTerms={
 'welcome:controls':'pin unpin basic controls',
 'system:time':'time format sync date timezone time zone',
 'system:power':'power energy saving screen turn off',
 'system:storage':'storage usage disk recycle bin percentage retention days cleanup cache schedule',
 'devices:hardware':'mouse keyboard display monitor printer stylus USB',
 'about:about':'about cabanon version help Zhuo Yu Shenzhen'
};
settingSearch=function(win){const query=win.querySelector('.setting-search').value.trim().toLowerCase();if(!query){settingNavigate(win,win.dataset.settingSection);return;}const article=win.querySelector('article');article.replaceChildren();let count=0;for(const [id,label,items]of settingSections)for(const [key,title]of items)if((label+' '+title+' '+(settingSearchTerms[id+':'+key]||'')).toLowerCase().includes(query)){const button=settingNode('button',label+(title?' / '+title:''),'setting-search-result');button.onclick=()=>{win.querySelector('.setting-search').value='';settingNavigate(win,id,key);};article.append(button);count++;}if(!count)article.append(settingNode('p','No settings found.','muted'));};
function settingSubsection(parent,key,title){const block=settingNode('div',undefined,'setting-subsection');block.dataset.settingItem=key;block.append(settingNode('h3',title));parent.append(block);return block;}
const settingRenderBeforeOrganization=renderSettingItem;
renderSettingItem=function(section,key,body){
 if(section==='welcome'){if(key==='greeting')return settingRenderBeforeOrganization('me','welcome',body);return settingPinControls(body);}
 if(section==='system'){
  if(key==='time'){const format=settingSubsection(body,'format','');format.firstChild.remove();settingRenderBeforeOrganization('time','format',format);const sync=settingSubsection(body,'sync','');sync.firstChild.remove();settingRenderBeforeOrganization('time','sync',sync);settingRenderTimeZones(settingSubsection(body,'timezone','Time zone'));return;}
  if(key==='power'){for(const part of ['basic','saving','screen']){const block=settingSubsection(body,part,'');block.firstChild.remove();settingRenderBeforeOrganization('power',part,block);}return;}
  if(key==='storage')return settingStorageItem(body);
  settingRenderBeforeOrganization('cabanon',key,body);for(const button of body.querySelectorAll('button'))button.textContent=button.textContent.replace(/Cabanon/g,'cabanon');return;
 }
 if(section==='language')return settingInputItem(key,body);
 if(section==='devices'){body.classList.add('setting-compact-options');const names=[['mouse','Mouse'],['keyboard','Keyboard'],['display','Display'],['printer','Printer'],['stylus','Stylus'],['usb','USB']];for(const [id,label]of names){const select=settingSelect([['','-']],'',()=>{});select.dataset.device=id;settingRow(body,label,select);}return;}
 if(section==='visual'&&key==='resolution'){const select=settingSelect(['1280x720','1366x768','1600x900','1920x1080','2560x1440','3840x2160'].map(id=>[id,id.replace('x',' × ')]),'1920x1080',()=>{select.value='1920x1080';});select.dataset.resolutionPreview='true';settingRow(body,'Resolution',select);return;}
 if(section==='about')return settingAbout(body);
 return settingRenderBeforeOrganization(section,key,body);
};
settingApplyControls=function(){const selected=prefs.settings?.controls,fixed=['user','settings','power','phone'];for(const button of $('#system-icons').children)button.hidden=!fixed.includes(button.dataset.system)&&!!selected&&!selected.includes(button.dataset.system);};
function settingPinControls(body){const fixed=['user','settings','power','phone'],s=settingPrefs(),sources=[...$('#system-icons').children];const grid=settingNode('div',undefined,'setting-control-list setting-pin-list');body.append(grid);
 for(const source of sources){const id=source.dataset.system;if(fixed.includes(id))continue;const row=settingNode('div',undefined,'setting-row setting-switch-row'),button=settingNode('button',undefined,'setting-text-toggle'),pin=settingNode('span','pin','setting-switch-on'),slash=settingNode('span','/','setting-switch-divider'),unpin=settingNode('span','unpin','setting-switch-off'),label=settingNode('span',undefined,'setting-switch-label');label.innerHTML=icon(id);label.append(document.createTextNode(source.title||id));button.append(pin,slash,unpin);button.type='button';button.setAttribute('aria-label','Pin '+(source.title||id));const selected=()=>new Set(s.controls||sources.map(n=>n.dataset.system));const paint=()=>{const value=selected().has(id);pin.classList.toggle('is-current',value);unpin.classList.toggle('is-current',!value);button.setAttribute('aria-pressed',String(value));};button.onclick=()=>{const values=selected();fixed.forEach(n=>values.add(n));values.has(id)?values.delete(id):values.add(id);if(values.size>16)return warning('Maximum 16 basic controls.');s.controls=[...values];persistProfiles();settingApplyControls();paint();};row.append(button,settingNode('span','    ','setting-switch-gap'),label);grid.append(row);paint();}
}
function settingInputItem(key,body){const s=settingPrefs();s.input ||= {keyboard:'us',language:'zh-CN',method:'pinyin'};body.classList.add('setting-compact-options');
 if(key==='system-language'){const select=settingSelect([['en','English']],'en',()=>{});select.disabled=true;settingRow(body,'System language',select);}
 if(key==='keyboard')settingRow(body,'Keyboard',settingSelect([['us','United States · US'],['uk','United Kingdom · UK'],['cn','China · US'],['jp','Japan · JIS'],['de','Germany · QWERTZ'],['fr','France · AZERTY']],s.input.keyboard,value=>{s.input.keyboard=value;prefs.input.keyboard=value;}));
 const languages=[['en','English'],['zh-CN','Chinese · Simplified'],['zh-TW','Chinese · Traditional'],['ja','Japanese'],['ko','Korean'],['fr','French'],['de','German']];
 const methods={en:[['us','English']], 'zh-CN':[['pinyin','Pinyin'],['wubi','Wubi']], 'zh-TW':[['bopomofo','Bopomofo'],['cangjie','Cangjie']],ja:[['romaji','Romaji'],['kana','Kana']],ko:[['hangul','Hangul']],fr:[['fr','French']],de:[['de','German']]};
 if(key==='input-language')settingRow(body,'Input language',settingSelect(languages,s.input.language,value=>{s.input.language=value;s.input.method=methods[value][0][0];prefs.input.language=languages.find(n=>n[0]===value)[1];prefs.input.current=s.input.method;if(!prefs.input.enabled.includes(s.input.method))prefs.input.enabled.push(s.input.method);settingNavigate(windowMap.get('system:settings'),'language','input-language');}));
 if(key==='input-method'){const options=methods[s.input.language]||methods.en;if(!options.some(n=>n[0]===s.input.method))s.input.method=options[0][0];settingRow(body,'Input method',settingSelect(options,s.input.method,value=>{s.input.method=value;prefs.input.current=value;if(!prefs.input.enabled.includes(value))prefs.input.enabled.push(value);}));}
}
function settingAbout(body){body.classList.add('setting-about');body.append(settingNode('h1','cabanon','setting-about-title'),settingNode('p','Version 0.1.0','setting-about-version'));
 body.append(settingNode('p','cabanon — yes, always in lowercase — is a three-in-one operating system for desktop, phone, and pad. It is based on my understanding  of typography, UX, the Internet, and human relationships.'));
 body.append(settingNode('p',"The project was inspired by Le Corbusier' s Cabanon de Vacances. And, fittingly, I designed the entire system in a space measuring just 2.3 × 2.6 m²."));
 const help=settingNode('p');help.append(document.createTextNode('If you find cabanon difficult to use, click '));const link=settingNode('button','the help file','setting-help-link');link.onclick=()=>openHelp();help.append(link,document.createTextNode('.'));body.append(help);
 const signature=settingNode('p','Zhuo Yu\nin Shenzhen\n20226.10.17','setting-about-signature');body.append(signature);
}
function settingStoragePrefs(){const s=settingPrefs();s.storage ||= {trashPercent:5,cleanupEnabled:false,cleanupTime:'03:00'};return s.storage;}
function settingStorageItem(body){const store=settingStoragePrefs();body.classList.add('setting-storage');const usage=settingSubsection(body,'usage','Usage'),slider=settingPercent(usage,'Disk usage',0,()=>{},true),output=slider.nextElementSibling;output.textContent='—';const capacity=settingNode('span','—','setting-storage-capacity');usage.append(capacity);
 if(window.cabanon?.storageUsage)window.cabanon.storageUsage().then(data=>{if(!data.ok||!body.isConnected||!data.total)return;const percent=Math.max(0,Math.min(100,data.used/data.total*100)),blocks=Math.round(percent/5);slider.textContent='▓'.repeat(blocks)+'░'.repeat(20-blocks);slider.setAttribute('aria-valuenow',String(Math.round(percent)));output.textContent=percent.toFixed(1)+'%';capacity.textContent=(data.used/1073741824).toFixed(1)+' / '+(data.total/1073741824).toFixed(1)+' GB';store.diskCapacity=data.total;if(!store.percentConfigured&&!store.percentInitialized){store.trashPercent=Math.max(0,Math.min(100,prefs.trashSettings.maxMB*1048576/data.total*100));store.percentInitialized=true;drawRecycleLimit();}}).catch(()=>{});
 const cleanup=settingSubsection(body,'cleanup','Cleanup'),recycleSlot=settingNode('div');cleanup.append(recycleSlot);function drawRecycleLimit(){recycleSlot.replaceChildren();const slider=settingPercent(recycleSlot,'Recycle bin limit',store.trashPercent,value=>{store.trashPercent=value;store.percentConfigured=true;store.retentionConfigured=true;if(store.diskCapacity)prefs.trashSettings.maxMB=Math.max(0,Math.round(store.diskCapacity/1048576*value/100));});slider.setAttribute('aria-valuenow',String(store.trashPercent));slider.nextElementSibling.textContent=(Number.isInteger(store.trashPercent)?store.trashPercent:store.trashPercent.toFixed(1))+'%';}drawRecycleLimit();
 const days=settingInput(prefs.trashSettings.days,(value,input)=>{const n=Number(value);if(!Number.isInteger(n)||n<0||n>3650){input.value=prefs.trashSettings.days;return false;}prefs.trashSettings.days=n;store.retentionConfigured=true;},'number');days.min='0';days.max='3650';const retention=settingRow(cleanup,'Keep deleted files',days);retention.append(settingNode('span','days · 0 = never'));
 settingTextToggle(cleanup,'Automatic cache cleanup',store.cleanupEnabled,value=>{store.cleanupEnabled=value;settingMarkCleanupSchedule();});const time=settingInput(store.cleanupTime,null,'time');time.onchange=()=>{store.cleanupTime=time.value||'03:00';settingMarkCleanupSchedule();persistProfiles();};settingRow(cleanup,'Clean cache at',time);
 const actions=settingNode('div',undefined,'setting-actions'),status=settingNode('span','','setting-status');const button=settingButton('Clean cache now',async()=>{button.disabled=true;status.textContent='Cleaning…';const ok=await settingCleanCache();status.textContent=ok?'Done':'Unavailable';button.disabled=false;},actions);actions.append(status);cleanup.append(actions,settingNode('p','Runs while cabanon is open; no shutdown.','muted'));
}
function settingCleanupClock(){const c=settingPrefs().clock,date=new Date(Date.now()+(Number(c.offset)||0)),parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:c.zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date).map(p=>[p.type,p.value]));return{day:parts.year+'-'+parts.month+'-'+parts.day,minutes:Number(parts.hour)*60+Number(parts.minute)};}
function settingMarkCleanupSchedule(){const store=settingStoragePrefs(),now=settingCleanupClock(),[h,m]=store.cleanupTime.split(':').map(Number);store.skipCleanupDay=now.minutes>=h*60+m?now.day:'';}
let settingCleanupBusy=false;
async function settingCleanCache(){if(!window.cabanon?.clearCache)return false;try{return!!(await window.cabanon.clearCache()).ok;}catch{return false;}}
async function settingRunStorageCleanup(){if(settingCleanupBusy)return;const store=settingPrefs().storage;if(!store)return;
 if(store.retentionConfigured){const count=prefs.trash.length;pruneTrash();if(count!==prefs.trash.length)persistProfiles();}
 if(!store.cleanupEnabled)return;const now=settingCleanupClock(),[h,m]=store.cleanupTime.split(':').map(Number);if(now.minutes<h*60+m||store.lastCleanupDay===now.day||store.skipCleanupDay===now.day)return;
 settingCleanupBusy=true;const profile=activeProfile;try{if(await settingCleanCache()&&profile===activeProfile){store.lastCleanupDay=now.day;store.lastCleanupAt=Date.now();persistProfiles();}}finally{settingCleanupBusy=false;}
}
setInterval(settingRunStorageCleanup,30000);
