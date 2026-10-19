'use strict';
const recentFilesPanel=document.createElement('section');recentFilesPanel.id='recent-files';recentFilesPanel.setAttribute('aria-label','Recent files');$('#folders').after(recentFilesPanel);
function renderFromRecents(){if($('#from').hidden)return;const available=new Set(prefs.entries.filter(entry=>!entry.folder).map(entry=>entry.name)),pinnedNames=new Set(prefs.fromFilePins||[]);const height=recentFilesPanel.clientHeight||Math.max(0,$('#from').clientHeight-32),limit=Math.floor(height/56);const pinned=(prefs.fromFilePins||[]).map(name=>({name,lastUsed:Number.MAX_SAFE_INTEGER}));const records=[...pinned,...prefs.recents.filter(record=>!pinnedNames.has(record.name))].filter(record=>available.has(record.name)).sort((a,b)=>b.lastUsed-a.lastUsed).slice(0,limit);const html=records.map(record=>`<button class="file recent-file" data-search-file="${escapeHTML(record.name)}" title="${escapeHTML(record.name)}">${icon(glyphFor(record.name))}<span>${escapeHTML(record.name)}</span></button>`).join('');if(recentFilesPanel.innerHTML!==html)recentFilesPanel.innerHTML=html;}
layoutPins=function(){const panel=$('#from'),height=600,rows=Math.max(1,Math.floor((height-32)/56)),columns=Math.max(1,Math.ceil($('#pinned').children.length/rows)),minimum=65+256+24+columns*280+560;panel.style.height=height+'px';panel.style.minHeight=height+'px';panel.style.maxHeight=height+'px';panel.style.minWidth=minimum+'px';panel.style.width=Math.min(1920,Math.max(minimum,parseFloat(panel.style.width)||minimum))+'px';panel.style.gridTemplateColumns='256px '+(24+columns*280)+'px 280px 280px';$('#pinned').style.gridTemplateRows='repeat('+rows+',56px)';$('#folders').style.maxHeight=(rows*56)+'px';recentFilesPanel.style.maxHeight=(rows*56)+'px';renderFromRecents();};
const pinsWithRecents=renderPins;renderPins=function(){pinsWithRecents();renderFromRecents();};
const showWithRecents=showFrom;showFrom=function(){showWithRecents();layoutPins();};
let recentRenderPending=false;
const persistWithRecents=persistProfiles;persistProfiles=function(){persistWithRecents();if(!$('#from').hidden&&!recentRenderPending){recentRenderPending=true;queueMicrotask(()=>{recentRenderPending=false;renderFromRecents();});}};
recentFilesPanel.onclick=event=>{const item=event.target.closest('[data-search-file]');if(item)openFile(item.dataset.searchFile);};
new ResizeObserver(renderFromRecents).observe(recentFilesPanel);
layoutPins();


