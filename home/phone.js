'use strict';
(() => {
 const W=414,H=896,ROW=56,CELL=16.8,LEFT=10,COL=0,LABEL=380.4,TOP=56,VIEW=784,LIMIT=4,MOVE=8;
 function gridMiddle(height=page.clientHeight||VIEW){const rows=Math.max(1,Math.floor(height/ROW));return {line:rows*ROW/2,rowTop:Math.floor(rows/2)*ROW};}
 const MODE='cabanon-device-mode', widgets=new Set(['LINE','STOCKS','DATE','THEN','ASTRO','WEATHER','TIME']);
 const root=document.createElement('section');root.id='phone';root.hidden=true;root.setAttribute('aria-label','Cabanon Phone');
 root.innerHTML='<header class="phone-status"><time></time><span class="phone-battery"></span></header><main class="phone-page"></main><article class="phone-app" hidden></article><section class="phone-search" hidden><div class="phone-search-bar"><input class="phone-search-input" placeholder="Search" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"></div><div class="phone-search-results"></div><div class="phone-keyboard" hidden></div></section><footer class="phone-footer"><button class="phone-group-target" aria-label="Group or ungroup" hidden><span class="phone-group-mark" aria-hidden="true"></span></button><button class="phone-home" aria-label="Home"></button></footer>';
 document.body.append(root);
 const chevron=document.createElement('div');chevron.className='phone-chevron';chevron.setAttribute('aria-hidden','true');root.append(chevron);const reachBlank=document.createElement('button');reachBlank.className='phone-reach-blank';reachBlank.setAttribute('aria-label','Restore full screen');reachBlank.hidden=true;reachBlank.onclick=()=>restoreShift();root.append(reachBlank);
 root.querySelector('.phone-battery').outerHTML=icon('battery').replace('<svg ','<svg class="phone-battery" ');
 const page=root.querySelector('.phone-page'), appView=root.querySelector('.phone-app');
 let pullOffset=0,exitBusy=false;const pullSearchHint=document.createElement('div');pullSearchHint.className='phone-pull-search-hint';pullSearchHint.textContent='SEARCH';pullSearchHint.hidden=true;root.append(pullSearchHint);
 function paintPull(distance){const value=Math.max(0,Math.min(distance,gridMiddle().rowTop));root.classList.toggle('pulling',value>0);page.style.translate=value?'0 '+value+'px':'';pullOffset=value;pullSearchHint.hidden=value<=3*ROW;pullSearchHint.style.top=(TOP+Math.max(0,value-ROW)/2)+'px';if(value>0){showScrollIcon();paintScrollIcon();}else if(!scrollIcon.hidden)paintScrollIcon();}
 function resetPull(){paintPull(0);}
 const searchView=root.querySelector('.phone-search'), searchInput=root.querySelector('.phone-search-input'), searchResults=root.querySelector('.phone-search-results'), keyboard=root.querySelector('.phone-keyboard');
 let mode='pc',editing=false,scroll=0,gesture=null,f8=false,scale=1,restoreTimers=[],activeApp=null;
 let flow=null,flowSignature='',wheelTimer=null,bottomSnapFrame=null;
 let groupView=null,nameEntrance=null;
 const groupInset=()=>groupView?groupView.top+ROW:0;
 const contentHeight=()=>groupView?groupView.height-ROW:VIEW;
 function rowParts(id){return syncFlow().fragments(id).map(p=>({...p,top:p.top+groupInset()}));}
 let shifted=false;
 const SHIFT_Y=7*ROW+TOP;
 let searching=false,searchQuery='';
 const KEYBOARD_ROWS=[['Q','W','E','R','T','Y','U','I','O','P'],['A','S','D','F','G','H','J','K','L'],['⇧','Z','X','C','V','B','N','M','⌫'],['123','␣','⏎']];
 const selected=new Set(),groupTarget=root.querySelector('.phone-group-target');
 const dissolveButton=document.createElement('button');dissolveButton.className='phone-group-dissolve';dissolveButton.setAttribute('aria-label','Dissolve group');dissolveButton.hidden=true;dissolveButton.innerHTML='<svg data-phone-group-shape="rectangle" viewBox="0 0 36 56" aria-hidden="true"></svg>';dissolveButton.onclick=()=>dissolveGroups();root.querySelector('.phone-footer').append(dissolveButton);
 groupTarget.innerHTML='<svg data-phone-group-shape="diamond" viewBox="0 0 36 56" aria-hidden="true"></svg>';
 groupTarget.onclick=()=>{const chosen=items().filter(i=>selected.has(i.id));if(chosen.length&&chosen.every(i=>i.members)){dissolveGroups(chosen.map(i=>i.id));return;}if(chosen.length<2||chosen.some(i=>i.members))return;const g={dragIds:chosen.map(i=>i.id),floating:document.createElement('div'),lastPoint:{x:LEFT,y:VIEW/2},grab:{x:0,y:0}};transformGroup(g);clearTimeout(g.groupTimer);clearTimeout(g.enterGroupTimer);cancelAnimationFrame(g.edgeFrame);g.floating.remove();settle(true);};
 const sortButtons=[];
 for(const [key,first,last]of [['name','A','Z'],['installed','new','old'],['usage','often','rare']]){const button=document.createElement('button');button.className='phone-sort phone-sort-'+key;button.hidden=true;button.dataset.sort=key;button.innerHTML='<span class="phone-sort-words"><span>'+first+'</span><span>'+last+'</span></span><span class="phone-sort-arrow">↓</span>';button.setAttribute('aria-label','Sort by '+key);button.onclick=()=>sortHome(key);root.querySelector('.phone-footer').append(button);sortButtons.push(button);}
 function updateFooter(){root.classList.toggle('group-open',!!groupView);dissolveButton.hidden=!groupView;const entry=root.querySelector('.phone-quick-entry');if(entry)entry.setAttribute('aria-label',groupView?'Back to home':'Quick settings');const carried=gesture?.dragIds||[...selected];const carriedItems=carried.map(id=>state().items.find(i=>i.id===id)).filter(Boolean);const canGroup=carriedItems.length>1&&carriedItems.every(item=>!item.members),canUngroup=carriedItems.length>0&&carriedItems.every(item=>!!item.members);groupTarget.hidden=!editing||!(canGroup||canUngroup);groupTarget.setAttribute('aria-label',canUngroup?'Dissolve selected group':'Group selected apps');const mark=groupTarget.querySelector('svg');if(mark)mark.dataset.phoneGroupShape=canUngroup?'rectangle':'diamond';const bottom=!editing&&appView.hidden&&scroll>=maximumScroll()-.01;for(const button of sortButtons){button.hidden=!bottom;button.style.top=(-ROW)+'px';}}
 function sortHome(key){
  const previous=state().sort,direction=previous?.key===key?-previous.direction:1;state().sort={key,direction};
  const catalog=new Map(phoneApps().map(a=>[a.name,a]));
  const value=item=>key==='installed'?(item.createdAt||catalog.get(item.id)?.installed||0):(prefs.usage?.[item.id]||0);
  const ordered=items().filter(i=>!i.pinned).sort((a,b)=>direction*(key==='name'?name(a).localeCompare(name(b),'en',{numeric:true}):-(value(a)-value(b)))||name(a).localeCompare(name(b),'en',{numeric:true}));
  for(const [col,list]of [[0,ordered]]){let row=0;const pins=items().filter(i=>i.pinned&&i.col===col);for(const item of list){while(pins.some(pin=>row<pin.row+pin.size&&row+item.size>pin.row))row++;item.col=col;item.row=row;row+=item.size;}}
  scroll=maximumScroll();flow=null;selected.clear();settle(true);
  for(const button of sortButtons){button.setAttribute('aria-pressed',String(button.dataset.sort===key));button.querySelector('.phone-sort-arrow').textContent=button.dataset.sort===key&&direction<0?'↑':'↓';}
 }

 const scrollIcon=document.createElement('div');scrollIcon.className='phone-scroll-icon';scrollIcon.hidden=true;page.append(scrollIcon);let scrollIconTimer,scrollIconHideTimer;
 const iconCrossings=new Map(),iconPulses=new Map();let iconPulseFrame=null;
 function resetIconPulses(){cancelAnimationFrame(iconPulseFrame);iconPulseFrame=null;iconCrossings.clear();iconPulses.clear();}
 function pulseOpacity(key,now=performance.now()){const start=iconPulses.get(key);if(start===undefined)return 0;const elapsed=now-start;return elapsed<=10?1:Math.max(0,1-(elapsed-10)/1000);}
 function animateIconPulses(){
  iconPulseFrame=null;const now=performance.now();for(const mark of page.querySelectorAll('[data-icon-pulse-key]'))if(!editing)mark.style.opacity=String(Number(mark.dataset.iconOpacityBase||1)*pulseOpacity(mark.dataset.iconPulseKey,now));
  for(const [key,start]of iconPulses)if(now-start>=1010)iconPulses.delete(key);
  if(iconPulses.size)iconPulseFrame=requestAnimationFrame(animateIconPulses);
 }
 function sampleIconCrossings(layout,list,scope,base=0,background=false){
  const line=gridMiddle().line,shift=base+pullOffset;
  const covered=background&&groupView&&line>=groupView.top&&line<groupView.top+groupView.height;
  const fixed=layout.columns.some(c=>c.pins.some(p=>line>=p.y+shift&&line<p.y+shift+p.height));
  for(const item of list){const part=layout.fragments(item.id).find(p=>p.cutTop<=ROW/2&&p.cutBottom<ROW/2);if(!part)continue;
   const key=scope+':'+item.id,center=part.top+shift+ROW/2,previous=iconCrossings.get(key);iconCrossings.set(key,center);
   if(editing||covered||(!item.pinned&&fixed)||previous===undefined||previous===center)continue;
   if((previous<line&&center>=line)||(previous>line&&center<=line))iconPulses.set(key,performance.now());
  }
  if(iconPulses.size&&!iconPulseFrame)iconPulseFrame=requestAnimationFrame(animateIconPulses);
 }
 function paintIconPulse(mark,key,dim=1){mark.dataset.iconPulseKey=key;mark.dataset.iconOpacityBase=dim;mark.style.opacity=String(dim*(editing?1:pulseOpacity(key)));}
 function phoneHomeIcon(item){
  if(item?.members)return icon('pdf-group');
  if(item?.id==='FLASH')return customIconMarkup('quick-flashlight','outline');
  if(item?.id==='WEATHER'){const el=page.querySelector('[data-id="WEATHER"] [data-weather-symbol]');const condition=el?.dataset.weatherSymbol||prefs.infoWidgets?.records?.WEATHER?.[0]?.condition||'cloud';return icon('pdf-weather');}
  const app=phoneApps().find(a=>a.name===item?.id);
  if(!app||!app.glyph||app.glyph==='unfinished')return '<svg class="phone-placeholder-icon" viewBox="0 0 36 36" aria-hidden="true" style="fill:var(--l1);stroke:var(--l5);stroke-width:1"><rect x=".5" y=".5" width="35" height="35"/></svg>';
  if(['colors','pdf-colors'].includes(app.glyph))return icon('pdf-colors');
  return appIcon(app.glyph);
 }
 function paintScrollIcon(){
  const rows=[...page.querySelectorAll(':scope > .phone-container')].sort((a,b)=>parseFloat(a.style.top)-parseFloat(b.style.top));
  const list=items(),scope=groupView?'group:'+groupView.id:'home';sampleIconCrossings(syncFlow(),list,scope,groupInset());
  scrollIcon.replaceChildren();scrollIcon.dataset.reference=String(gridMiddle().line);scrollIcon.dataset.edge='flow';
  const measure=document.createElement('canvas').getContext('2d');measure.font='700 60px JetBrainsNL';
  scrollIcon.style.setProperty('--icon-backplate-width',Math.max(60,W-LEFT-measure.measureText('MMMMMMMMM').width)+'px');
  rows.forEach((el,i)=>{
   if(!editing&&el.querySelector('.quick-home-timer'))return;
   const item=items().find(item=>item.id===(el.dataset.id||el.dataset.sourceId)),mark=document.createElement('div');
   mark.className='phone-scroll-endpoint'+(item?.members?' phone-scroll-group':'');mark.dataset.app=el.dataset.id||el.dataset.sourceId;
   mark.innerHTML=phoneHomeIcon(item);mark.style.top=el.style.top;mark.style.clipPath=el.style.clipPath;
   mark.style.color='var(--l5)';paintIconPulse(mark,scope+':'+item.id);
   scrollIcon.append(mark);
  });
  scrollIcon.style.top='0px';page.append(scrollIcon);window.CabanonPhoneTypography?.alignBadges(page);
 }

 function showScrollIcon(){scrollIcon.hidden=false;scrollIcon.classList.remove('fading');clearTimeout(scrollIconTimer);clearTimeout(scrollIconHideTimer);}
 let iconPreviewAt=null,iconFrame=null;
 function stopIconPreview(){iconPreviewAt=null;cancelAnimationFrame(iconFrame);iconFrame=null;page.classList.remove('icon-preview');}
 function paintIconPreview(){
  if(iconPreviewAt===null)return;
  const elapsed=performance.now()-iconPreviewAt,step=Math.max(0,Math.floor((elapsed-1000)/FILE_REMOVAL_CHARACTER_MS));let longest=0;
  for(const el of page.children){const item=items().find(i=>i.id===el.dataset.id);if(!item)continue;const chars=typeof removalSegmenter!=='undefined'&&removalSegmenter?[...removalSegmenter.segment(name(item))].map(p=>p.segment):Array.from(name(item));longest=Math.max(longest,chars.length);el.querySelector('.phone-name').textContent=chars.slice(0,Math.max(0,chars.length-step)).join('');el.querySelector('.phone-preview-icon')?.classList.toggle('erased',step>chars.length);}
  if(elapsed>=1000+(longest+1)*FILE_REMOVAL_CHARACTER_MS){stopIconPreview();render();}
 }
 function previewIcons(){stopIconPreview();iconPreviewAt=performance.now();render();const tick=()=>{paintIconPreview();if(iconPreviewAt!==null)iconFrame=requestAnimationFrame(tick);};iconFrame=requestAnimationFrame(tick);}
 const phoneApps=()=>[...apps.filter(a=>!(prefs.uninstalled||[]).includes(a.name)),{name:'/HOUSE',glyph:'pdf-house',path:'/house'}];
 function state(){
  const s=prefs.phone ||= {items:[]};s.items ||= [];
  if(!s.restoreMarathonVersion){prefs.uninstalled=(prefs.uninstalled||[]).filter(id=>id!=='MARATHON');const old=s.items.find(i=>i.id==='MARATHON');if(old){old.removed=false;delete old.groupId;}for(const group of s.items)if(group.members)group.members=group.members.filter(id=>id!=='MARATHON');s.restoreMarathonVersion=1;}
  phoneApps().forEach((app,i)=>{if(s.items.some(item=>item.id===app.name))return;let col=Math.floor(i/15),row=i%15;if(col>1){const ends=[0,1].map(c=>Math.max(0,...s.items.filter(item=>!item.removed&&item.col===c).map(item=>item.row+item.size)));col=ends[0]<=ends[1]?0:1;row=ends[col];}s.items.push({id:app.name,col,row,size:1,pinned:false,removed:false});});
  for(const item of s.items)if(item.id==='WHERE'&&item.size>1)item.size=1;
  if(!s.singleColumnVersion){s.previousColumns=structuredClone(s.items);const preferred=['RIVER','THEN','TXT','Ur','POINT','/HOUSE','COLORS','WEATHER','TIME','DATE','STOCKS','MARATHON'];s.items.sort((a,b)=>{const ai=preferred.indexOf(a.id),bi=preferred.indexOf(b.id);return (ai<0?999:ai)-(bi<0?999:bi);});let row=0;for(const item of s.items){item.col=0;item.pinned=false;if(widgets.has(item.id))item.size=['WEATHER','DATE','ASTRO','THEN'].includes(item.id)?2:1;item.row=row;row+=item.size;}s.singleColumnVersion=1;}
  if(!s.compactInformationVersion){let row=0;for(const item of [...s.items].sort((a,b)=>a.row-b.row)){if(['WEATHER','TIME','DATE'].includes(item.id))item.size=1;item.row=row;row+=item.size;}s.compactInformationVersion=1;}
  if(!s.oneBoxVersion){let row=0;for(const item of [...s.items].sort((a,b)=>a.row-b.row)){item.size=1;item.row=row++;}s.oneBoxVersion=1;}
  for(const item of s.items){item.col=0;item.size=1;}
  // Only visible items own rows; hidden/grouped entries never reserve blank boxes.
  const visible=s.items.filter(item=>!item.removed&&!item.groupId&&(item.members||phoneApps().some(app=>app.name===item.id))).sort((a,b)=>a.row-b.row);
  const pins=visible.filter(item=>item.pinned).slice(0,LIMIT);
  for(const item of visible)if(item.pinned&&!pins.includes(item))item.pinned=false;
  // Every fixed app owns exactly one distinct on-screen grid slot, including legacy saves.
  const occupied=new Set();
  for(const item of pins){
   const wanted=Math.max(0,Math.min(VIEW/ROW-1,Math.round((item.pinTop??item.row*ROW)/ROW)));
   const slot=Array.from({length:VIEW/ROW},(_,i)=>i).filter(i=>!occupied.has(i)).sort((a,b)=>Math.abs(a-wanted)-Math.abs(b-wanted)||a-b)[0];
   item.pinTop=slot*ROW;occupied.add(slot);
  }
  visible.filter(item=>!item.pinned).forEach((item,row)=>{item.row=row;});
  return s;
 }
 function homeItems(all=state().items){return all.filter(i=>!i.removed&&!i.groupId&&(i.members||phoneApps().some(a=>a.name===i.id)));}
 function items(){const all=state().items;if(groupView){const group=all.find(i=>i.id===groupView.id);return (group?.members||[]).map(id=>all.find(i=>i.id===id)).filter(i=>i&&!i.removed).sort((a,b)=>a.row-b.row);}return all.filter(i=>!i.removed&&!i.groupId&&(i.members||phoneApps().some(a=>a.name===i.id)));}
 function name(item){return item.members?item.title:appLabel(item.id); }
 function paintName(label,item,homeName=false){
  const value=name(item);label.textContent=value;if(item.id==='/HOUSE'&&value.startsWith('/')){label.textContent='';const slash=document.createElement('span');slash.className='phone-house-slash';slash.dataset.phoneNameCell='';slash.setAttribute('aria-hidden','true');label.setAttribute('aria-label',value);label.append(slash,document.createTextNode(value.slice(1)));}
  if(groupView&&!homeName&&!item.members){
   const context=document.createElement('canvas').getContext('2d');context.font='700 60px JetBrainsNL';const cell=context.measureText('M').width,max=8,chars=Array.from(value);
   label.classList.add('phone-group-app-name');label.style.setProperty('--name-cell',cell+'px');
   if(chars.length>max){label.textContent=chars.slice(0,max-1).join('');const ellipsis=document.createElement('span');ellipsis.className='phone-name-ellipsis';ellipsis.textContent='...';label.append(ellipsis);label.title=value;label.setAttribute('aria-label',value);}
  }label.classList.toggle('group-name',!!item.members);if(item.members){const prefix=document.createElement('span');prefix.className='phone-group-prefix';prefix.dataset.phoneNameCell='';prefix.setAttribute('aria-hidden','true');prefix.innerHTML=icon('pdf-group');label.prepend(prefix);window.CabanonPhoneTypography?.alignBadges(label);}}
 function savePhone(){persistProfiles();if(typeof flushProfiles==='function')flushProfiles();}
 function used(){return items().filter(i=>i.pinned).reduce((sum,i)=>sum+i.size,0);}
 function point(e){const b=root.getBoundingClientRect();return{x:(e.clientX-b.left)/scale,y:(e.clientY-b.top)/scale-TOP-(shifted?SHIFT_Y:0)};}
 function layoutKey(list=items()){return (groupView?.id||'home')+':'+contentHeight()+':'+list.map(i=>[i.id,i.col,i.row,i.size,i.pinned,i.pinTop].join(':')).join('|');}
 function syncFlow(){const list=items(),signature=layoutKey(list);if(!flow||signature!==flowSignature){flow=new CabanonPhoneFlow(list,groupView?.inline?0:scroll,true,contentHeight());flowSignature=signature;}else{const offset=groupView?.inline?0:scroll;if(flow.offset!==offset)flow.move(offset-flow.offset);}return flow;}
 function paintFragment(el,part,base=groupInset(),height=contentHeight()){const top=part.top+base,cutTop=Math.max(part.cutTop,base-top),cutBottom=Math.max(part.cutBottom,top+ROW-(base+height));el.style.top=top+'px';el.style.clipPath='inset('+Math.min(ROW,Math.max(0,cutTop))+'px '+(el.classList.contains('selected')?'-24px':'0')+' '+Math.min(ROW,Math.max(0,cutBottom))+'px '+(el.classList.contains('selected')?'-10px':'0')+')';}
 function paintRow(el,item){const part=syncFlow().fragments(item.id)[0];if(part)paintFragment(el,part);}
 function paintPinLine(el,item){
  el.querySelector('.phone-pin-line')?.remove();if(!item.pinned)return;
  const host=el.querySelector(el.classList.contains('has-widget')?'.phone-widget':'.phone-name');if(!host)return;
  const box=el.getBoundingClientRect(),walker=document.createTreeWalker(host,NodeFilter.SHOW_TEXT);let left=Infinity,right=-Infinity;
  while(walker.nextNode()){const node=walker.currentNode;if(!node.textContent.trim()||node.parentElement.closest('svg,button'))continue;const style=getComputedStyle(node.parentElement);if(style.display==='none'||style.visibility==='hidden')continue;const range=document.createRange();range.selectNodeContents(node);for(const rect of range.getClientRects()){left=Math.min(left,rect.left);right=Math.max(right,rect.right);}}
  if(!Number.isFinite(left))return;const line=document.createElement('span');line.className='phone-pin-line';line.setAttribute('aria-hidden','true');const cap=LEFT+9*36;
  const x=0,end=Math.min((right-box.left)/scale,LABEL,cap-(LEFT+item.col*COL));line.style.left=x+'px';line.style.width=Math.max(0,end-x)+'px';el.append(line);
 }
 function paintRowCopies(){
  page.querySelectorAll('.phone-row-copy').forEach(el=>el.remove());
  const layout=syncFlow();
  for(const el of [...page.children]){const item=items().find(i=>i.id===el.dataset.id);if(!item||item.pinned)continue;
   for(const part of layout.fragments(item.id).slice(1)){
    const copy=el.cloneNode(true);copy.classList.add('phone-row-copy');delete copy.dataset.id;copy.dataset.sourceId=item.id;copy.setAttribute('aria-hidden','true');
    copy.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));paintFragment(copy,part);page.append(copy);
   }
  }
 }
 function visibleRow(item){return ((syncFlow().top(item.id)??item.row*ROW)+groupInset())/ROW;}
 function settle(commit=false,insertedColumn=-1){
  // Release always resolves the shared scroll phase onto the same 56px grid.
  scroll=Math.max(0,Math.min(maximumScroll(),Math.round(scroll/ROW)*ROW));
  const layout=syncFlow();
  if(commit){const order=items().filter(i=>!i.pinned).sort((a,b)=>layout.top(a.id)-layout.top(b.id));order.forEach((item,row)=>{item.row=row;});if(groupView){const group=state().items.find(i=>i.id===groupView.id);group.members=items().sort((a,b)=>a.row-b.row).map(i=>i.id);}
   flow=null;flowSignature='';savePhone();}
  render();
 }
 // Every membership/size/fixed-state change uses the same packer as release.
 // Preserve current screen positions before changing the saved home layout.
 function changeLayout(action){const previous=syncFlow(),positions=new Map(items().map(i=>[i.id,previous.top(i.id)]));action();const list=items();flow=new CabanonPhoneFlow(list.map(i=>({...i,row:i.pinned?i.row:((positions.get(i.id)??i.row*ROW-scroll)+scroll)/ROW})),scroll,true);flowSignature=layoutKey(list);settle(true);}
 function rectOverlap(a,b){return a.col===b.col&&a.row<b.row+b.size&&a.row+a.size>b.row;}
 function freePinned(item,col,row,size=item.size){return row>=0&&row+size<=LIMIT&&!items().some(other=>other!==item&&other.pinned&&rectOverlap({col,row,size},other));}
 function pinSpot(item,size=item.size){const row=Math.max(0,Math.min(LIMIT-size,Math.round(visibleRow(item))));if(freePinned(item,item.col,row,size))return{col:item.col,row};for(let r=0;r<=LIMIT-size;r++)for(let c=0;c<2;c++)if(freePinned(item,c,r,size))return{col:c,row:r};return null;}
 function closeMenu(){root.querySelector('.phone-menu')?.remove();}
 function closeDialog(){window.CabanonPhoneDialogs?.cancel();root.querySelector('.phone-dialog-shade')?.remove();}
 function notice(text,action,yes='yes'){closeMenu();closeDialog();render();CabanonPhoneDialogs.show({message:action?text.replace(/\?*$/,'?'):text,yes,onConfirm:action});}

 function capacity(){notice('pinned '+LIMIT+' is max, unpin some apps.');}
 function pin(item){
  closeMenu();if(!item.pinned&&used()>=LIMIT)return capacity();
  const list=items(),layout=syncFlow(),positions=new Map(list.map(i=>[i.id,layout.top(i.id)]));
  if(item.pinned){item.pinned=false;delete item.pinTop;}
  else{const wanted=positions.get(item.id),occupied=new Set(list.filter(i=>i.pinned).map(i=>i.pinTop/ROW));
   const slot=Array.from({length:contentHeight()/ROW},(_,i)=>i).filter(i=>!occupied.has(i)).sort((a,b)=>Math.abs(a*ROW-wanted)-Math.abs(b*ROW-wanted)||a-b)[0];
   item.pinTop=slot*ROW;item.pinned=true;
  }
  item.size=1;
  list.filter(i=>!i.pinned).sort((a,b)=>positions.get(a.id)-positions.get(b.id)).forEach((i,row)=>{i.row=row;});
  scroll=Math.max(0,Math.min(maximumScroll(),Math.round(scroll/ROW)*ROW));
  flow=null;flowSignature='';savePhone();render();
 }
 function widgetLimit(item){return 1;}
 function size(item,value){if(!item.pinned||!widgets.has(item.id)||value<1||value>widgetLimit(item))return;if(used()-item.size+value>LIMIT)return capacity();const spot=pinSpot(item,value);if(!spot)return capacity();changeLayout(()=>Object.assign(item,spot,{size:value}));}
 function paintWidgetSizes(el,item){
  el.replaceChildren();
  for(const [step,symbol,label]of [[-1,'−','Remove one entry'],[1,'+','Add one entry']]){
   const b=document.createElement('button');b.type='button';b.dataset.step=step;b.className='phone-size-button';b.setAttribute('aria-label',label);
   b.disabled=step<0?item.size<=1:item.size>=widgetLimit(item);
   b.onclick=()=>{size(item,item.size+step);if(el.isConnected)paintWidgetSizes(el,item);};el.append(b);
  }
 }

 function remove(item){if(!item.members&&!canRemoveApplication(item.id))return;closeMenu();notice("Remove '"+name(item)+"'?",()=>{if(!item.members){if(item.id!=='/HOUSE')uninstallApplication(item.id);return;}changeLayout(()=>{item.removed=true;item.pinned=false;});},'yes, remove');}
 function renameGroup(item){
  closeMenu();closeDialog();const shade=document.createElement('div');shade.className='phone-dialog-shade';
  const form=document.createElement('form');form.className='phone-rename phone-dialog phone-standard-dialog';form.setAttribute('aria-label','Rename group');
  const input=document.createElement('input');input.value=item.title;input.maxLength=9;input.setAttribute('aria-label','Group name');input.autocomplete='off';
  const error=document.createElement('p');error.setAttribute('role','status');
  const save=document.createElement('button');save.type='submit';save.className='phone-dialog-yes';save.textContent='yes, rename';const cancel=document.createElement('button');cancel.type='button';cancel.className='phone-dialog-cancel';cancel.textContent='cancel';cancel.onclick=closeDialog;
  const title=document.createElement('p');title.textContent='Rename group?';const actions=document.createElement('div');actions.className='phone-dialog-actions';actions.append(save,cancel);form.append(title,input,error,actions);shade.append(form);CabanonPhoneDialogs.adopt(shade);input.focus({preventScroll:true});input.select();
  form.onsubmit=e=>{e.preventDefault();const value=input.value;if(!validApplicationLabel(value)){error.textContent='Use 3–9 letters or numbers.';return;}if(state().items.some(i=>i!==item&&i.members&&!i.removed&&i.title.toLowerCase()===value.toLowerCase())){error.textContent='Name already exists.';return;}item.title=value;savePhone();closeDialog();render();};
 }
 function edit(){stopIconPreview();restoreShift();editing=true;closeMenu();render();}
 function positionMenu(){
  const el=root.querySelector('.phone-menu');if(!el)return;
  const item=items().find(i=>i.id===el.dataset.id);if(!item){closeMenu();return;}
  el.style.left=((1-item.col)*W/2)+'px';
  const top=TOP+visibleRow(item)*ROW+(shifted?SHIFT_Y:0);
  el.style.top=Math.max(TOP,Math.min(top,H-ROW-el.offsetHeight))+'px';
 }
 function supportsInfo(item){return !item.members&&(widgets.has(item.id)||['COLORS','COMPASS','TIMER','STOPWATCH'].includes(item.id));}
 function menu(item,p){closeMenu();const el=document.createElement('aside');el.className='phone-menu';el.dataset.id=item.id;for(const [label,fn]of [...(supportsInfo(item)?[[item.showInfo===false?'show info':'show name',()=>{item.showInfo=item.showInfo===false;closeMenu();savePhone();render();}]]:[]),...(item.members?[['rename',()=>renameGroup(item)]]:[]),['edit containers',edit]]){const b=document.createElement('button');b.textContent=label;if(label==='remove')b.className='remove';b.onclick=fn;el.append(b);}if(item.members||canRemoveApplication(item.id)){const b=document.createElement('button');b.textContent='remove';b.className='remove';b.onclick=()=>remove(item);el.append(b);}root.append(el);positionMenu();}
 function closeGroup(){if(!groupView)return;scroll=groupView.homeScroll;groupView=null;flow=null;selected.clear();render();}
 function dissolveGroups(groupIds=groupView?.id){
  const ids=[...new Set(Array.isArray(groupIds)?groupIds:[groupIds])].filter(Boolean);
  const groups=ids.map(id=>state().items.find(i=>i.id===id)).filter(i=>i?.members);if(!groups.length)return;
  closeMenu();closeDialog();
   const all=state().items;
   // Replace each group at its own list position, preserving every member and order.
   for(const id of ids){const target=all.find(i=>i.id===id);if(!target?.members)continue;
    const members=target.members.map(id=>all.find(i=>i.id===id)).filter(Boolean),parent=target.groupId?all.find(i=>i.id===target.groupId):null;
    if(parent){const index=parent.members.indexOf(id);parent.members.splice(Math.max(0,index),1,...members.map(i=>i.id));}
    const order=all.filter(i=>!i.removed&&!i.groupId&&i!==target&&!members.includes(i)).sort((a,b)=>a.row-b.row);
    for(const item of members){if(parent)item.groupId=parent.id;else delete item.groupId;item.pinned=false;delete item.pinTop;}
    order.splice(Math.max(0,Math.min(target.row,order.length)),0,...members);order.forEach((i,row)=>i.row=row);all.splice(all.indexOf(target),1);
   }
   selected.clear();if(groupView)closeGroup();else{flow=null;render();}savePhone();
 }
 function openGroup(group){
  if(groupView?.id===group.id){
   const height=Math.min(VIEW,Math.max(2,group.members.length+1)*ROW),wasInline=groupView.inline;
   groupView.height=height;groupView.top=Math.min(groupView.top,VIEW-height);groupView.initialTop=groupView.top;groupView.inline=height<VIEW;
   if(wasInline&&!groupView.inline){groupView.homeScroll=scroll;scroll=0;}
   group.members.forEach((id,row)=>{const item=state().items.find(i=>i.id===id);if(item){item.row=row;item.pinned=false;delete item.pinTop;}});
   flow=null;render();return;
  }
  if(groupView)closeGroup();
  const all=state().items,members=group.members.map(id=>all.find(i=>i.id===id)).filter(i=>i&&!i.removed);
  const anchor=Math.max(0,Math.min(VIEW-ROW,Math.round(visibleRow(group))*ROW));
  const height=Math.min(VIEW,Math.max(2,members.length+1)*ROW),top=height===VIEW?0:Math.min(anchor,VIEW-height);
  groupView={id:group.id,top,height,homeScroll:scroll,initialTop:top,inline:height<VIEW};
  members.forEach((item,row)=>{item.row=row;item.pinned=false;delete item.pinTop;});
  const occupied=new Set();for(const item of members.filter(i=>i.pinned)){while(occupied.has(item.pinTop)&&item.pinTop<height-2*ROW)item.pinTop+=ROW;if(occupied.has(item.pinTop))item.pinned=false;else occupied.add(item.pinTop);}
  scroll=groupView.inline?groupView.homeScroll:0;flow=null;selected.clear();appView.hidden=true;activeApp=null;render();
 }
 function leaveGroup(item){
  if(!groupView)return;const context=groupView,all=state().items,group=all.find(i=>i.id===context.id);
  group.members=group.members.filter(id=>id!==item.id);delete item.groupId;item.pinned=false;delete item.pinTop;
  const others=all.filter(i=>!i.removed&&!i.groupId&&i!==item).sort((a,b)=>a.row-b.row),index=others.indexOf(group);others.splice(Math.max(0,index+1),0,item);others.forEach((i,row)=>i.row=row);
  if(!group.members.length){all.splice(all.indexOf(group),1);closeGroup();}
  else{group.members.forEach((id,row)=>{const member=all.find(i=>i.id===id);if(member)member.row=row;});flow=null;render();}
  selected.delete(item.id);savePhone();
 }
 function paintGroupBackground(){
  const bg=document.createElement('div');bg.className='phone-group-bg';bg.dataset.scrollOffset=groupView.homeScroll;page.append(bg);
  const list=homeItems(),layout=new CabanonPhoneFlow(list,groupView.homeScroll,true,VIEW),rows=[];
  for(const item of list){const source=createPhoneRow(item,true);
   for(const [index,part]of layout.fragments(item.id).entries()){
    const el=index?source.cloneNode(true):source;el.dataset.homeId=item.id;if(index)el.classList.add('phone-row-copy');
    el.classList.toggle('phone-active-group-source',item.id===groupView.id);el.style.opacity=item.id===groupView.id?'.2':'.5';
    paintFragment(el,part,0,VIEW);bg.append(el);paintPinLine(el,item);rows.push(el);
   }
  }
  rows.sort((a,b)=>parseFloat(a.style.top)-parseFloat(b.style.top));sampleIconCrossings(layout,list,'home',0,true);
  const icons=document.createElement('div');icons.className='phone-background-icons';icons.hidden=scrollIcon.hidden&&!editing;
  rows.forEach((el,index)=>{const item=list.find(i=>i.id===el.dataset.id);if(!item||(!editing&&el.querySelector('.quick-home-timer')))return;const mark=document.createElement('div');mark.className='phone-scroll-endpoint';mark.dataset.app=item.id;mark.style.cssText='left:auto;right:0;width:80px;pointer-events:none;top:'+el.style.top;mark.style.clipPath=el.style.clipPath;const dim=item.id===groupView.id?.2:.5;mark.style.setProperty('--home-dim',dim);paintIconPulse(mark,'home:'+item.id,dim);mark.innerHTML=phoneHomeIcon(item);icons.append(mark);});bg.append(icons);
 }
 function paintGroupFrame(){if(!groupView)return;if(groupView.inline){groupView.homeScroll=scroll;groupView.top=groupView.initialTop;}
  const {top,height}=groupView;paintGroupBackground();
  const surface=document.createElement('div');surface.className='phone-group-surface';surface.style.top=top+'px';surface.style.height=height+'px';page.append(surface);
  const header=document.createElement('button');header.className='phone-group-title';header.setAttribute('aria-label','Close group');header.style.top=top+'px';const label=document.createElement('span');label.className='phone-name';paintName(label,state().items.find(i=>i.id===groupView.id));header.append(label);header.onclick=()=>closeGroup();page.append(header);
 }
 function createPhoneRow(item,background=false){
   const el=document.createElement('div');el.className='phone-container'+(item.pinned?' pinned':'')+(selected.has(item.id)?' selected':'');el.dataset.id=item.id;el.dataset.col=item.col;el.style.left=(LEFT+item.col*COL)+'px';el.style.setProperty('--rows',item.size);el.style.setProperty('--pin-inset',(LEFT+item.col*COL-item.col*W/2)+'px');el.style.setProperty('--selection-inset',(LEFT+item.col*COL-item.col*W/2)+'px');
   const label=document.createElement('span');label.className='phone-name';paintName(label,item,background);el.append(label);if(iconPreviewAt!==null){const mark=document.createElement('span');mark.className='phone-preview-icon';mark.innerHTML=item.members?'<span class="phone-group-mark"></span>':appIcon(phoneApps().find(a=>a.name===item.id)?.glyph||'folder');el.append(mark);}
   if(item.id==='RIVER'&&!state().homeHintsDismissed){const count=document.createElement('span');count.className='phone-river-count';count.dataset.phoneNameBadge='';count.textContent='99';count.setAttribute('aria-hidden','true');el.append(count);}
   const content=item.showInfo===false?'':(window.CabanonQuick?.homeMarkup(item.id)||CabanonWidgets.markup(item));
   if(content){el.classList.add('has-widget');const body=document.createElement('div');body.className='phone-widget';body.innerHTML=content;window.CabanonPhoneTypography?.layout(body,item.id);window.CabanonPhoneTypography?.prune(body);el.append(body);el.setAttribute('aria-label',name(item));}
  el.classList.toggle('phone-functional-row',!!el.querySelector('.quick-home-timer'));
  return el;
 }
 function stopNameEntrance(){
  const state=nameEntrance;if(!state)return;nameEntrance=null;state.timers.forEach(clearTimeout);state.animations.forEach(a=>a.cancel());for(const entry of state.runs||[])if(entry.run.isConnected)entry.run.replaceWith(entry.node);
  root.classList.remove('phone-name-entering','phone-name-icons-flash');root.dataset.nameRevealStage='idle';
 }
 function revealInfoText(body,state,delay){
  const walker=document.createTreeWalker(body,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())if(walker.currentNode.textContent.trim()&&!walker.currentNode.parentElement.closest('svg,button'))nodes.push(walker.currentNode);
  const rows=new Map();let longest=0;
  for(const node of nodes){const parent=node.parentElement,style=getComputedStyle(parent);if(style.visibility==='hidden'||style.display==='none')continue;
   const row=parent.closest('.phone-feed-line,.phone-widget-lines > div,.phone-widget-row')||body,rate=parseFloat(style.fontSize)<=14?2:1;
   let ticks=rows.get(row)||0;const run=document.createElement('span');run.className='phone-reveal-run';run.dataset.revealRate=rate;
   const chars=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(node.textContent)].map(s=>s.segment):Array.from(node.textContent);
   for(const char of chars){ticks+=1/rate;const glyph=document.createElement('span');glyph.className='phone-reveal-char';glyph.textContent=char;run.append(glyph);
    state.animations.push(glyph.animate([{visibility:'hidden'},{visibility:'visible'}],{delay:delay+Math.ceil(ticks-1e-9)*10,duration:0,fill:'backwards'}));
   }
   node.replaceWith(run);state.runs.push({node,run});rows.set(row,ticks);longest=Math.max(longest,Math.ceil(ticks));
  }
  return longest;
 }
 function startNameEntrance(curtain=false){
  stopNameEntrance();if(mode!=='phone'||!appView.hidden||searching)return;
  const state=nameEntrance={timers:[],animations:[],runs:[]},delay=curtain?20:0;
  const later=(fn,ms)=>state.timers.push(setTimeout(()=>{if(nameEntrance===state)fn();},ms));
  scrollIcon.hidden=false;scrollIcon.classList.remove('fading');clearTimeout(scrollIconTimer);clearTimeout(scrollIconHideTimer);paintScrollIcon();
  page.querySelectorAll('.phone-background-icons').forEach(el=>el.hidden=false);root.classList.add('phone-name-entering');root.dataset.nameRevealStage=curtain?'curtain':'names';
  const surface=page.querySelector('.phone-group-surface');if(curtain&&surface){surface.style.transformOrigin='top';state.animations.push(surface.animate([{transform:'scaleY(0)'},{transform:'scaleY(1)'}],{duration:20,fill:'backwards'}));later(()=>root.dataset.nameRevealStage='names',20);}
  let longest=1;
  for(const label of page.querySelectorAll(':scope > .phone-container:not(.phone-row-copy) > .phone-name,:scope > .phone-group-title > .phone-name')){
   if(getComputedStyle(label).visibility==='hidden')continue;
   const ellipsis=label.querySelector('.phone-name-ellipsis'),count=Math.max(1,Array.from(label.textContent).length+label.querySelectorAll('[data-phone-name-cell]').length-(ellipsis?2:0));longest=Math.max(longest,count);
   const width=label.getBoundingClientRect().width/scale,padding=parseFloat(getComputedStyle(label).paddingLeft)||0;
   state.animations.push(label.animate([{clipPath:'inset(0 '+Math.max(0,width-padding)+'px 0 0)'},{clipPath:'inset(0 0 0 0)'}],{delay,duration:count*10,easing:'steps('+count+', end)',fill:'backwards'}));
  }
  for(const body of page.querySelectorAll(':scope > .phone-container > .phone-widget'))longest=Math.max(longest,revealInfoText(body,state,delay));
  const reveal=delay+longest*10;root.dataset.nameRevealDelay=delay;root.dataset.nameRevealLetters=longest;root.dataset.nameRevealFlashAt=reveal;root.dataset.nameRevealFadeMs='1000';
  later(()=>{root.classList.remove('phone-name-entering');root.classList.add('phone-name-icons-flash');root.dataset.nameRevealStage='icons';},reveal);
  later(()=>{
   if(editing){stopNameEntrance();return;}root.dataset.nameRevealStage='fading';
   for(const el of [scrollIcon,...page.querySelectorAll('.phone-background-icons')])state.animations.push(el.animate([{opacity:1},{opacity:0}],{duration:1000,easing:'linear',fill:'forwards'}));
   later(()=>{scrollIcon.hidden=true;page.querySelectorAll('.phone-background-icons').forEach(el=>el.hidden=true);stopNameEntrance();},1000);
  },reveal+10);
 }
 function render(){
  stopNameEntrance();restoreTimers.forEach(clearTimeout);restoreTimers=[];page.classList.toggle('editing',editing);if(editing){scrollIcon.hidden=false;scrollIcon.classList.remove('fading');clearTimeout(scrollIconTimer);clearTimeout(scrollIconHideTimer);}page.classList.toggle('icon-preview',iconPreviewAt!==null);updateFooter();page.replaceChildren();paintGroupFrame();
  for(const item of items()){
   const el=createPhoneRow(item),label=el.querySelector('.phone-name');
   paintRow(el,item);page.append(el);paintPinLine(el,item);el.style.setProperty('--label-width',(label.getBoundingClientRect().right-el.getBoundingClientRect().left)/scale+'px');
  }
  if(iconPreviewAt!==null)paintIconPreview();
  paintRowCopies();page.append(scrollIcon);paintScrollIcon();window.CabanonPhoneTypography?.alignBadges(root);positionMenu();
 }
 function fit(){const v=window.CabanonPhoneWeb?.viewport()||{width:innerWidth,height:innerHeight,left:0,top:0};scale=Math.min(v.width/W,v.height/H);root.style.transform=`translate(-50%,-50%) scale(${scale})`;root.style.left=(v.left+v.width/2)+'px';root.style.top=(v.top+v.height/2)+'px';}
 function applyShift(){root.classList.toggle('shifted',shifted);fit();root.style.setProperty('--reach-offset',SHIFT_Y+'px');reachBlank.hidden=!shifted;}
 function doShift(){shifted=true;applyShift();}
 function restoreShift(){if(!shifted)return;shifted=false;applyShift();}
 function focusSearch(){if(!searching||exitBusy)return;searchInput.focus({preventScroll:true});root.scrollLeft=0;searchView.scrollLeft=0;}
 function openSearch(){stopNameEntrance();resetPull();clearTimeout(wheelTimer);shiftState=0;numeric=false;inputTools.hidden=false;searching=true;searchQuery='';searchInput.value='';searchView.hidden=false;keyboard.hidden=false;renderKeyboard();renderSearchResults();setTimeout(focusSearch,50);}
 function closeSearch(){stopKeyboardEntrance();resetPull();keyboard.querySelectorAll('.phone-key-preview').forEach(e=>e.remove());inputTools.hidden=true;recognition?.stop();searching=false;searchView.hidden=true;searchInput.blur();}
 let shiftState=0,numeric=false,inputLanguage='en-US',recognition=null;
 const inputTools=document.createElement('div');inputTools.className='phone-input-tools';inputTools.hidden=true;inputTools.innerHTML='<button class="phone-language" aria-label="Switch language"><i class="key-symbol symbol-globe"></i></button><button class="phone-voice" aria-label="Voice input"><i class="key-symbol symbol-mic"></i></button>';root.querySelector('.phone-footer').append(inputTools);
 inputTools.querySelector('.phone-language').onclick=()=>{inputLanguage=inputLanguage==='en-US'?'zh-CN':'en-US';searchInput.lang=inputLanguage;searchInput.placeholder=inputLanguage==='zh-CN'?'搜索':'Search';focusSearch();};
 inputTools.querySelector('.phone-voice').onclick=()=>{const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Speech){searchInput.placeholder='Voice input unavailable';return;}if(recognition){recognition.stop();return;}recognition=new Speech();recognition.lang=inputLanguage;recognition.onresult=e=>{searchInput.value+=e.results[0][0].transcript;renderSearchResults();};recognition.onerror=()=>{searchInput.placeholder='Voice input unavailable';};recognition.onend=()=>{recognition=null;inputTools.querySelector('.phone-voice').classList.remove('recording');};inputTools.querySelector('.phone-voice').classList.add('recording');recognition.start();};

 let keyboardEntrance=null;

 function stopKeyboardEntrance(){if(!keyboardEntrance)return;clearTimeout(keyboardEntrance.timer);(keyboardEntrance.frames||[]).forEach(cancelAnimationFrame);keyboardEntrance.animations.forEach(a=>a.cancel());inputTools.querySelectorAll('button').forEach(e=>e.style.visibility='');keyboard.querySelectorAll('.phone-key-ink').forEach(e=>e.replaceWith(...e.childNodes));keyboardEntrance=null;keyboard.dataset.revealStage='idle';}
 function startKeyboardEntrance(){
  stopKeyboardEntrance();const state=keyboardEntrance={animations:[],timer:null,frames:[],plans:[]},base=20,finish=base+100;
  const reveal=(el,delay)=>{el.style.visibility='hidden';state.plans.push({el,delay});};
  keyboard.dataset.revealStage='gray';keyboard.dataset.revealFinishMs=finish;
  for(const row of keyboard.children){let letter=0;for(const button of row.children){const ink=document.createElement('span');ink.className='phone-key-ink';ink.append(...button.childNodes);button.append(ink);const isLetter=/^[A-Z]$/.test(button.dataset.key);reveal(ink,isLetter?base+(++letter)*10:finish);}}
  for(const button of inputTools.querySelectorAll('button'))reveal(button,finish);
  // Give the blank gray keyboard a painted frame before starting its shared clock.
  state.frames.push(requestAnimationFrame(()=>{if(keyboardEntrance!==state)return;state.frames.push(requestAnimationFrame(()=>{if(keyboardEntrance!==state)return;const start=document.timeline.currentTime;keyboard.dataset.revealStage='letters';
   for(const {el,delay}of state.plans){const animation=el.animate([{visibility:'hidden'},{visibility:'visible'}],{delay,duration:0,fill:'forwards'});animation.startTime=start;state.animations.push(animation);}
   state.timer=setTimeout(()=>{if(keyboardEntrance!==state)return;stopKeyboardEntrance();keyboard.dataset.revealStage='ready';},finish+20);
  }));}));
 }
 function paintShift(){keyboard.classList.toggle('uppercase',shiftState>0);keyboard.classList.toggle('caps-lock',shiftState===2);const button=keyboard.querySelector('[data-key="⇧"]');if(button){button.setAttribute('aria-pressed',String(shiftState>0));button.setAttribute('aria-label',shiftState===2?'Caps lock':shiftState===1?'Shift once':'Shift');}}
 function renderKeyboard(){
  stopKeyboardEntrance();keyboard.replaceChildren();
  const rows=numeric?[Array.from('1234567890'),Array.from('-/:;()&@+'),['⇧','.',',','?','!',String.fromCharCode(39),String.fromCharCode(34),'=','⌫'],['ABC','␣','⏎']]:KEYBOARD_ROWS;
  for(const row of rows){
   const rowEl=document.createElement('div');rowEl.className='phone-keyboard-row';
   for(const key of row){
    const btn=document.createElement('button');btn.className='phone-key';btn.textContent=key||'';
    if(key==='␣')btn.classList.add('key-space');
    else if(key==='⌫')btn.classList.add('key-back');
    else if(key==='123')btn.classList.add('key-fn');
    else if(key==='⏎')btn.classList.add('key-fn');
    btn.dataset.key=key;btn.setAttribute('aria-label',({'⇧':'Shift','⌫':'Delete','␣':'Space','⏎':'Enter'})[key]||key);
    const symbol=({'⇧':'shift','⌫':'delete','␣':'space','⏎':'enter'})[key];if(symbol){btn.textContent='';const mark=document.createElement('i');mark.className='key-symbol symbol-'+symbol;btn.append(mark);}
    btn.onpointerdown=e=>{e.preventDefault();if(key.length===1&&!symbol){const popup=document.createElement('span');popup.className='phone-key-preview';popup.textContent=key;btn.append(popup);}btn.setPointerCapture(e.pointerId);};
    const clear=()=>btn.querySelector('.phone-key-preview')?.remove();btn.onpointerup=clear;btn.onpointercancel=clear;btn.onlostpointercapture=clear;
    btn.onclick=()=>handleKey(key);
    rowEl.append(btn);
   }
   keyboard.append(rowEl);
  }
  paintShift();
 }
 function handleKey(key){
  if(!key)return;
  if(key==='⌫'){searchInput.value=Array.from(searchInput.value).slice(0,-1).join('');}
  else if(key==='␣'){searchInput.value+=' ';}
  else if(key==='⇧'){shiftState=(shiftState+1)%3;paintShift();return;}
  else if(key==='123'||key==='ABC'){numeric=!numeric;renderKeyboard();return;}
  else if(key==='⏎'){searchResults.querySelector('button')?.click();return;}
  else{searchInput.value+=shiftState?key:key.toLowerCase();if(shiftState===1&&/^[a-z]$/i.test(key)){shiftState=0;paintShift();}}
  searchInput.dispatchEvent(new Event('input',{bubbles:true}));
 }
 function renderSearchResults(){
  const q=searchInput.value.toLowerCase().trim();
  searchQuery=q;
  const results=phoneApps().filter(app=>appLabel(app.name).toLowerCase().includes(q)).sort((a,b)=>appLabel(a.name).localeCompare(appLabel(b.name),'en',{numeric:true}));
  searchResults.replaceChildren();
  if(!q){searchResults.innerHTML='<p class="phone-search-hint">Type to search apps</p>';return;}
  if(results.length===0){searchResults.innerHTML='<p class="phone-search-hint">No results</p>';return;}
  for(const app of results){
   const btn=document.createElement('button');btn.className='phone-search-result';
   btn.innerHTML=appIcon(app.glyph)+'<span>'+escapeHTML(appLabel(app.name))+'</span>';
   btn.onclick=()=>{closeSearch();open({id:app.name,members:false});};
   searchResults.append(btn);
  }
 }
 searchInput.addEventListener('input',renderSearchResults);
 searchInput.addEventListener('pointerdown',()=>{if(searching)setTimeout(focusSearch,50);});
 // Blank taps dismiss search; scrolls and keyboard/result gestures remain intact.
 let searchBlankPress=null;
 root.addEventListener('pointerdown',e=>{
  searchBlankPress=null;
  if(!searching||e.button!==0||e.target.closest('.phone-search-result,.phone-keyboard,.phone-search-bar,.phone-input-tools,.phone-home,.phone-dialog-shade'))return;
  searchBlankPress={id:e.pointerId,x:e.clientX,y:e.clientY};
 },true);
 root.addEventListener('pointerup',e=>{
  const press=searchBlankPress;searchBlankPress=null;
  if(!searching||!press||press.id!==e.pointerId||Math.hypot(e.clientX-press.x,e.clientY-press.y)/scale>MOVE)return;
  e.preventDefault();e.stopImmediatePropagation();homeTap();
 },true);
 root.addEventListener('pointercancel',()=>searchBlankPress=null,true);
 function clearGesture(){resetPull();if(!gesture)return;const g=gesture;clearTimeout(g.long);clearTimeout(g.edit);gesture=null;if(g.kind==='swipe')restore(g);if(g.kind==='move'){endDrag(g,true);render();}}
 function home(){resetIconPulses();window.CabanonQuick?.close();cancelAnimationFrame(bottomSnapFrame);bottomSnapFrame=null;clearTimeout(scrollIconTimer);clearTimeout(scrollIconHideTimer);scrollIcon.hidden=true;stopIconPreview();clearGesture();groupView=null;closeMenu();closeDialog();closeSearch();restoreShift();editing=false;selected.clear();scroll=0;flow=null;activeApp=null;appView.hidden=true;render();}


 function visiblePhoneSurface(){const quick=root.querySelector('.phone-quick'),tool=root.querySelector('.phone-tool');return tool&&!tool.hidden?tool:quick&&!quick.hidden?quick:searching?searchView:!appView.hidden?appView:page;}
 function exitHome(next,direction='right',slide=false){
  if(exitBusy)return;if(mode!=='phone'){next();return;}stopNameEntrance();stopKeyboardEntrance();clearTimeout(wheelTimer);
  const source=visiblePhoneSurface(),clone=source.cloneNode(true);clone.classList.add('phone-exit-copy');clone.setAttribute('aria-hidden','true');root.append(clone);
  const fromPull=pullOffset;exitBusy=true;root.classList.add('phone-page-exiting');pullSearchHint.hidden=true;
  const duration=slide?Math.max(120,(VIEW+ROW-fromPull)/1.8):200;root.dataset.homeExitDirection=slide?'down':direction;
  const sign=direction==='left'?1:-1,animations=[];
  if(slide){source.style.visibility='hidden';animations.push(clone.animate([{transform:'translateY(0)'},{transform:'translateY('+(VIEW+ROW-fromPull)+'px)'}],{duration,easing:'linear',fill:'forwards'}));setTimeout(()=>{clone.remove();source.style.visibility='';root.classList.remove('phone-page-exiting');exitBusy=false;resetPull();next();focusSearch();},duration);return;}
  next();const target=visiblePhoneSurface();if(source!==target)source.style.visibility='hidden';
  animations.push(clone.animate([{transform:'translateX(0)'},{transform:'translateX('+(sign*W)+'px)'}],{duration,easing:'ease-out',fill:'forwards'}));
  animations.push(target.animate([{transform:'translateX('+(-sign*W)+'px)'},{transform:'translateX(0)'}],{duration,easing:'ease-out',fill:'both'}));
  if(target===searchView&&!inputTools.hidden)animations.push(inputTools.animate([{transform:'translateX('+(-sign*W)+'px)'},{transform:'translateX(0)'}],{duration,easing:'ease-out',fill:'both'}));
  root.dataset.pageTransition='sliding';
  Promise.all(animations.map(a=>a.finished.catch(()=>{}))).then(()=>{clone.remove();source.style.visibility='';animations.forEach(a=>a.cancel());root.classList.remove('phone-page-exiting');root.dataset.pageTransition='idle';exitBusy=false;focusSearch();});
 }
 function quickTap(){const q=root.querySelector('.phone-quick'),t=root.querySelector('.phone-tool');if(q&&!q.hidden&&(!t||t.hidden))return;exitHome(()=>window.CabanonQuick?.open(),'left');}
 function activateTask(id){stopNameEntrance();closeMenu();closeDialog();closeSearch();restoreShift();window.CabanonQuick?.close();groupView=null;editing=false;selected.clear();activeApp=null;appView.getAnimations().forEach(a=>a.cancel());return open({id},false);}
 function searchTap(){if(searching){focusSearch();return;}exitHome(()=>{home();openSearch();},'right');}
 function homeTap(){const quick=root.querySelector('.phone-quick');if(searching){exitHome(home,'left');return;}if(quick&&!quick.hidden){exitHome(home,'right');return;}if(groupView)closeGroup();else home();}

 function setMode(value){window.CabanonPhoneMultitask?.dismiss();stopIconPreview();clearGesture();closeMenu();closeDialog();closeSearch();restoreShift();f8=false;mode=value==='phone'?'phone':'pc';localStorage.setItem(MODE,mode);document.body.classList.toggle('phone-mode',mode==='phone');root.hidden=mode!=='phone';if(mode==='phone'){fit();render();}else fitDesktop();}
 function open(item,animate=true){stopNameEntrance();if(item.members){openGroup(item);return;}if(groupView)closeGroup();if(window.CabanonQuick?.openApp(item.id))return;queueMicrotask(()=>{window.CabanonPhoneMultitask?.record(item,appView);if(animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches){appView.getAnimations().forEach(a=>a.cancel());appView.animate([{translate:'414px 0'},{translate:'0 0'}],{duration:180,easing:'ease-out'});}});restoreShift();stopIconPreview();prefs.usage ||= {};prefs.usage[item.id]=(prefs.usage[item.id]||0)+1;savePhone();for(const button of sortButtons)button.hidden=true;activeApp=item.id;editing=false;selected.clear();groupTarget.hidden=true;closeMenu();appView.replaceChildren();if(item.members){const title=document.createElement('h1');paintName(title,item);appView.append(title);for(const id of item.members){const member=state().items.find(i=>i.id===id);if(!member||member.removed||(prefs.uninstalled||[]).includes(member.id))continue;const button=document.createElement('button');button.className='phone-group-member phone-name';paintName(button,member);button.onclick=()=>open(member);appView.append(button);}appView.hidden=false;return;}const h=document.createElement('h1');h.textContent=name(item);const p=document.createElement('p');p.textContent='A small place for your thoughts. Take a moment, look around, and let the day unfold.\n\nThis is '+name(item)+'.';appView.append(h,p);appView.hidden=false;}
 function hit(p){const ordered=[...items().filter(i=>!i.pinned),...items().filter(i=>i.pinned)].reverse();return ordered.find(item=>p.x>=LEFT+item.col*COL&&p.x<LEFT+item.col*COL+LABEL&&rowParts(item.id).some(part=>p.y>=part.top+part.cutTop&&p.y<part.top+item.size*ROW-part.cutBottom));}
 function editingTextHit(item,p){return textHit(item,p);}
 function textHit(item,p){if(!item)return false;const el=[...page.children].find(el=>el.dataset.id===item.id);if(!el)return false;const base=page.getBoundingClientRect();return rowParts(item.id).some(part=>p.y>=part.top+part.cutTop&&p.y<part.top+ROW-part.cutBottom)&&base.left+p.x*scale<rowTextRight(el);}
 function restore(g){
  g.el?.querySelector('.phone-swipe')?.remove();const label=g.el?.querySelector('.phone-name');if(!label)return;
  label.style.transform='';label.style.clipPath='';g.el.classList.remove('widget-swiping');
 }
 function swipe(g,dx){
  if(dx<0&&!g.item.members&&!canRemoveApplication(g.item.id)){g.swipeReady=false;restore(g);return;}
  g.el.classList.add('widget-swiping');
  const label=g.el.querySelector('.phone-name'),right=dx>0,word=right?(groupView?'leave':(g.item.pinned?'unpin':'pin')):'remove';
  // Keep the authored nodes intact: symbols and letters occupy the same mono cells.
  const style=getComputedStyle(label),context=document.createElement('canvas').getContext('2d');context.font=style.fontWeight+' '+style.fontSize+' '+style.fontFamily;
  const cell=context.measureText('M').width,prefix=label.querySelectorAll('[data-phone-name-cell]').length,ellipsis=label.querySelector('.phone-name-ellipsis');
  const length=Array.from(label.textContent).length+prefix-(ellipsis?Array.from(ellipsis.textContent).length-1:0);
  const steps=Math.floor((Math.abs(dx)+1e-6)/CELL),padding=Math.max(0,4-length),shift=right?0:Math.min(padding,steps),erased=Math.min(length,Math.max(0,steps-shift)),cut=erased*cell;
  label.style.transform=shift?'translateX('+(-shift*CELL)+'px)':'';
  label.style.clipPath=right?'inset(0 0 0 '+(cut+(erased?parseFloat(style.paddingLeft)||0:0))+'px)':'inset(0 '+cut+'px 0 0)';
  let action=g.el.querySelector('.phone-swipe');if(!action){action=document.createElement('span');action.className='phone-swipe';g.el.append(action);}
  action.classList.toggle('remove',!right);
  const shown=Math.min(6,steps*2);
  action.textContent=right?word.slice(0,shown):word.slice(word.length-shown);
  g.swipeReady=steps>=3;g.swipeRight=right;
 }
 function beginDrag(g){
  g.beforeGroupView=groupView?structuredClone(groupView):null;g.beforeItems=structuredClone(state().items);g.beforeFlow=syncFlow().snapshot();g.beforeScroll=scroll;g.beforeSelection=[...selected];
  if(!selected.has(g.item.id)){selected.clear();selected.add(g.item.id);}
  if(g.outsideId){selected.clear();selected.add(g.outsideId);}
  g.dragIds=(g.outsideId?[state().items.find(i=>i.id===g.outsideId)]:items()).filter(i=>selected.has(i.id)).sort((a,b)=>visibleRow(a)-visibleRow(b)||a.col-b.col).map(i=>i.id);
  g.grab={x:g.start.x-(LEFT+g.item.col*COL),y:g.start.y-(g.outsideId?parseFloat(g.el.style.top):visibleRow(g.item)*ROW)};
  g.floating=document.createElement('div');g.floating.className='phone-drag-list';g.floating.dataset.col=g.item.col;g.floating.style.setProperty('--selection-inset',(LEFT+g.item.col*COL-g.item.col*W/2)+'px');root.append(g.floating);paintDrag(g);
 }
 function paintDrag(g){
  updateFooter();
  g.floating.replaceChildren();for(const id of g.dragIds){const item=state().items.find(i=>i.id===id);const label=document.createElement('div');label.className='phone-name';paintName(label,item);g.floating.append(label);}
  for(const el of page.querySelectorAll('.phone-container'))el.classList.toggle('drag-source',g.dragIds.includes(el.dataset.id));
 }
 function moveDrag(g,p){
  g.lastPoint=p;if(p.y>=0&&p.y<VIEW)g.dropPoint=p;
  g.floating.style.left=(p.x-g.grab.x)+'px';g.floating.style.setProperty('--selection-inset',(p.x-g.grab.x)+'px');g.floating.style.top=(TOP+p.y-g.grab.y)+'px';
  updateDragEdge(g,p);updateGroupHover(g,p);
  const r=groupTarget.getBoundingClientRect(),b=root.getBoundingClientRect();
  const over=!groupTarget.hidden&&p.x>=(r.left-b.left)/scale&&p.x<(r.right-b.left)/scale&&p.y>=(r.top-b.top)/scale-TOP&&p.y<(r.bottom-b.top)/scale-TOP;
  if(!over){clearTimeout(g.groupTimer);g.groupTimer=null;g.groupLatched=false;groupTarget.classList.remove('hovering');}
  else if(!g.groupTimer&&!g.groupLatched){groupTarget.classList.add('hovering');g.groupTimer=setTimeout(()=>{g.groupTimer=null;if(gesture!==g)return;g.groupLatched=true;const chosen=g.dragIds.map(id=>state().items.find(i=>i.id===id));if(chosen.length&&chosen.every(i=>i?.members)){endDrag(g,false);g.done=true;gesture=null;dissolveGroups(chosen.map(i=>i.id));}else transformGroup(g);groupTarget.classList.remove('hovering');},500);}
 }
 function updateDragEdge(g,p){
  const top=groupInset(),bottom=top+contentHeight();
  g.edge=p.y<top+ROW/2?-1:p.y>=bottom-ROW/2?1:0;
  if(!g.edge){cancelAnimationFrame(g.edgeFrame);g.edgeFrame=null;g.edgeTime=null;return;}
  if(g.edgeFrame)return;
  const tick=now=>{g.edgeFrame=null;if(gesture!==g||!g.edge)return;const elapsed=Math.min(40,now-(g.edgeTime||now));g.edgeTime=now;scrollTo(scroll+g.edge*elapsed*.28);paintDrag(g);g.edgeFrame=requestAnimationFrame(tick);};g.edgeFrame=requestAnimationFrame(tick);
 }
 function updateGroupHover(g,p){
  const target=groupView&&g.outsideId&&p.y>=groupView.top&&p.y<groupView.top+groupView.height?state().items.find(i=>i.id===groupView.id):!groupView?hit(p):null;
  const valid=target?.members&&!g.dragIds.includes(target.id)&&g.dragIds.every(id=>!state().items.find(i=>i.id===id)?.members);
  const id=valid?target.id:null;if(g.hoverGroup===id)return;
  clearTimeout(g.enterGroupTimer);page.querySelectorAll('.group-drop-hover').forEach(e=>e.classList.remove('group-drop-hover'));g.hoverGroup=id;
  if(!id)return;page.querySelector('[data-id="'+id+'"]')?.classList.add('group-drop-hover');
  g.enterGroupTimer=setTimeout(()=>{if(gesture!==g||g.hoverGroup!==id)return;
   const all=state().items,group=all.find(i=>i.id===id);
   for(const dragId of g.dragIds){const item=all.find(i=>i.id===dragId);if(!item)continue;if(item.groupId){const old=all.find(i=>i.id===item.groupId);if(old)old.members=old.members.filter(id=>id!==dragId);}item.groupId=id;item.pinned=false;delete item.pinTop;if(!group.members.includes(dragId))group.members.push(dragId);}
   cancelAnimationFrame(g.edgeFrame);g.edgeFrame=null;g.edge=0;g.outsideId=null;openGroup(group);g.enteredGroup=true;selected.clear();g.dragIds.forEach(id=>selected.add(id));paintDrag(g);moveDrag(g,g.lastPoint);
  },500);
 }
 function transformGroup(g){
  const all=state().items,parent=groupView?state().items.find(i=>i.id===groupView.id):null,layout=syncFlow(),positions=new Map(items().map(i=>[i.id,layout.top(i.id)])),chosen=g.dragIds.map(id=>all.find(i=>i.id===id)).filter(Boolean),anchor=chosen[0];if(!anchor||(chosen.length>1&&chosen.some(item=>item.members)))return;
  if(chosen.length===1&&anchor.members){
   g.dragIds=[...anchor.members];if(parent){const index=parent.members.indexOf(anchor.id);parent.members.splice(index,1,...g.dragIds);}for(const [index,id]of g.dragIds.entries()){const item=all.find(i=>i.id===id);if(parent)item.groupId=parent.id;else delete item.groupId;item.col=anchor.col;item.row=anchor.row+index;positions.set(id,(positions.get(anchor.id)||0)+index*ROW);}
   all.splice(all.indexOf(anchor),1);
  }else{
   const titles=new Set(all.filter(i=>i.members&&!i.removed).map(i=>i.title));let n=0,title='NEW';while(titles.has(title))title='NEW'+(++n);
   const group={id:'group:'+crypto.randomUUID(),title,createdAt:Date.now(),members:[...g.dragIds],col:anchor.col,row:anchor.row,size:1,pinned:false,removed:false};
   if(parent){const index=Math.min(...g.dragIds.map(id=>parent.members.indexOf(id)).filter(i=>i>=0));parent.members=parent.members.filter(id=>!g.dragIds.includes(id));parent.members.splice(Number.isFinite(index)?index:parent.members.length,0,group.id);group.groupId=parent.id;}for(const item of chosen)item.groupId=group.id;all.push(group);positions.set(group.id,positions.get(anchor.id)||0);g.dragIds=[group.id];
  }
  selected.clear();g.dragIds.forEach(id=>selected.add(id));
  flow=new CabanonPhoneFlow(items().map(i=>({...i,row:i.pinned?i.row:((positions.get(i.id)??i.row*ROW-scroll)+scroll)/ROW})),scroll,true,contentHeight());flowSignature=layoutKey();
  render();paintDrag(g);moveDrag(g,g.lastPoint);
 }
 function endDrag(g,cancel){
  clearTimeout(g.groupTimer);clearTimeout(g.enterGroupTimer);cancelAnimationFrame(g.edgeFrame);g.edge=0;g.floating?.remove();groupTarget.classList.remove('hovering');
  if(cancel&&g.beforeItems){groupView=g.beforeGroupView;prefs.phone.items=g.beforeItems;scroll=g.beforeScroll;flow=new CabanonPhoneFlow([],0,true);flow.restore(g.beforeFlow);flowSignature=layoutKey();selected.clear();g.beforeSelection.forEach(id=>selected.add(id));}
 }
 function homeScrollLimit(pull=false){const list=homeItems(),pins=list.filter(i=>i.pinned).length,moving=list.filter(i=>!i.pinned),normal=Math.max(0,...moving.map(i=>(i.row+i.size)*ROW-VIEW+(3+pins)*ROW));return pull?Math.max(normal,...moving.map(i=>i.row*ROW-(gridMiddle().rowTop-ROW))):normal;}
 function maximumScroll(){if(groupView&&!groupView.inline)return Math.max(0,items().length*ROW-contentHeight());return homeScrollLimit();}
 function maximumPullScroll(){if(groupView&&!groupView.inline)return maximumScroll();return homeScrollLimit(true);}
 function snapBottom(){cancelAnimationFrame(bottomSnapFrame);const from=scroll,to=maximumScroll(),started=performance.now(),duration=320;const tick=now=>{const progress=Math.min(1,(now-started)/duration),eased=1-Math.pow(1-progress,3);scrollTo(from+(to-from)*eased);if(progress<1)bottomSnapFrame=requestAnimationFrame(tick);else{bottomSnapFrame=null;render();}};bottomSnapFrame=requestAnimationFrame(tick);}
 function scrollTo(value){showScrollIcon();scroll=Math.max(0,Math.min(maximumPullScroll(),value));if(groupView?.inline){render();return;}syncFlow();for(const el of page.children){const item=items().find(i=>i.id===el.dataset.id);if(item)paintRow(el,item);}paintRowCopies();updateFooter();paintScrollIcon();}
 window.addEventListener('wheel',e=>{
  if(e.target.closest('.phone-quick,.phone-tool'))return;
  if(mode!=='phone'||!page.contains(e.target)||!appView.hidden||root.querySelector('.phone-dialog-shade,.phone-menu'))return;
  e.preventDefault();e.stopImmediatePropagation();
  stopNameEntrance();cancelAnimationFrame(bottomSnapFrame);bottomSnapFrame=null;
  const delta=e.deltaY*(e.deltaMode===1?ROW:e.deltaMode===2?VIEW:1/scale);
  const g=gesture,old=scroll,raw=scroll-pullOffset+delta;
  if(!groupView&&!editing&&!searching&&raw<0){scrollTo(0);paintPull(-raw);}else{resetPull();scrollTo(raw);}
  if(g){g.scroll+=scroll-old;clearTimeout(g.long);clearTimeout(g.edit);
  }
  clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>{wheelTimer=null;if(mode==='phone'&&!gesture){resetPull();settle();}},160);
 },{capture:true,passive:false});
 function armGroupEntry(g){
  if(!editing||!g.item?.members)return false;
  g.long=setTimeout(()=>{if(gesture!==g||g.kind||g.done||(g.maxDistance||0)>10)return;g.longFired=true;g.done=true;selected.clear();openGroup(g.item);},500);return true;
 }

 // Side-page navigation starts only on blank space, never on text or controls.
 let sideSwipe=null,suppressSideClickUntil=0;
 window.addEventListener('click',e=>{if(performance.now()<suppressSideClickUntil&&root.contains(e.target)){e.preventDefault();e.stopImmediatePropagation();}},true);

 function visibleTextRight(host){let right=-Infinity;if(!host)return right;const walker=document.createTreeWalker(host,NodeFilter.SHOW_TEXT);while(walker.nextNode()){const node=walker.currentNode;if(!node.textContent.trim()||node.parentElement.closest('svg'))continue;const button=node.parentElement.closest('button');if(button&&host.contains(button)&&host.closest('.phone-widget'))continue;const style=getComputedStyle(node.parentElement);if(style.visibility==='hidden'||style.display==='none')continue;const range=document.createRange();range.setStart(node,0);range.setEnd(node,node.textContent.trimEnd().length);for(const rect of range.getClientRects()){let left=rect.left,end=rect.right;for(let el=node.parentElement;el&&el!==root;el=el.parentElement){if(/hidden|clip|auto|scroll/.test(getComputedStyle(el).overflowX)){const clip=el.getBoundingClientRect();left=Math.max(left,clip.left);end=Math.min(end,clip.right);}}if(end>left)right=Math.max(right,end);}}return right;}
 function rowTextRight(row){const label=row.querySelector(':scope>.phone-name');if(label&&getComputedStyle(label).visibility==='visible')return visibleTextRight(label);const music=row.querySelector('.phone-colors-playing');if(music&&getComputedStyle(music).visibility==='visible')return music.getBoundingClientRect().right;return visibleTextRight(row.querySelector('.phone-widget')||row);}
 function textAtPoint(surface,x,y){
  if(surface===page){const hitRows=[...page.querySelectorAll('.phone-container,.phone-group-title')].filter(row=>{const r=row.getBoundingClientRect(),cuts=(getComputedStyle(row).clipPath.match(/inset\(([^)]+)\)/)?.[1]||'0 0 0 0').split(/\s+/).map(parseFloat);return y>=r.top+(cuts[0]||0)*scale&&y<r.bottom+(0-(cuts[2]??cuts[0]??0))*scale;}).sort((a,b)=>Number(b.parentElement===page)-Number(a.parentElement===page)||Number(b.classList.contains('pinned'))-Number(a.classList.contains('pinned')));const row=hitRows[0];return !!row&&x<rowTextRight(row);}
  const row=document.elementsFromPoint(x,y).find(el=>surface.contains(el)&&el.matches('.phone-search-result,.phone-keyboard-row,.phone-search-hint'));return row?x<visibleTextRight(row):false;
 }
 window.addEventListener('pointerdown',e=>{
  sideSwipe=null;if(mode!=='phone'||exitBusy||editing||e.button!==0||!root.contains(e.target))return;
  const quick=root.querySelector('.phone-quick'),inQuick=quick&&!quick.hidden&&quick.contains(e.target);
  if(e.target.closest('input,select,textarea,a,[contenteditable=true],.phone-footer,.phone-dialog-shade,.phone-menu,.phone-tool,.phone-app,.quick-picker'))return;
  if(!inQuick&&e.target.closest('[role=slider]'))return;
  const surface=searching?searchView:inQuick?quick:appView.hidden?page:null;if(!surface||!surface.contains(e.target)||(!inQuick&&textAtPoint(surface,e.clientX,e.clientY)))return;
  sideSwipe={id:e.pointerId,x:e.clientX,y:e.clientY,surface,kind:searching?'search':surface===quick?'quick':'home',horizontal:false};
 },true);
 window.addEventListener('pointermove',e=>{const g=sideSwipe;if(!g||g.id!==e.pointerId)return;if(editing){sideSwipe=null;return;}const dx=(e.clientX-g.x)/scale,dy=(e.clientY-g.y)/scale;g.direction ||= CabanonGestures.axis(dx,dy);if(!g.direction)return;if(g.direction==='vertical'){sideSwipe=null;return;}if(!g.horizontal){if(Math.abs(dx)<16)return;g.horizontal=true;clearGesture();root.setPointerCapture(e.pointerId);}e.preventDefault();e.stopImmediatePropagation();},true);
 window.addEventListener('pointerup',e=>{const g=sideSwipe;sideSwipe=null;if(!g||g.id!==e.pointerId||!g.horizontal)return;e.preventDefault();e.stopImmediatePropagation();searchBlankPress=null;const dx=(e.clientX-g.x)/scale;if(Math.abs(dx)<16)return;suppressSideClickUntil=performance.now()+240;const names=['quick','home','search'],next=names[(names.indexOf(g.kind)+(dx<0?1:2))%3],action=next==='quick'?()=>window.CabanonQuick?.open():next==='search'?()=>{home();openSearch();}:home;exitHome(action,dx<0?'right':'left');},true);
 window.addEventListener('pointercancel',()=>{sideSwipe=null;},true);
 // Physical coordinates are converted to phone logical points before recognition.
 window.addEventListener('pointerdown',e=>{
  if(mode!=='phone'||!root.contains(e.target))return;if(exitBusy){e.preventDefault();e.stopImmediatePropagation();return;}
  stopNameEntrance();cancelAnimationFrame(bottomSnapFrame);bottomSnapFrame=null;
  if(e.button!==0){e.preventDefault();e.stopImmediatePropagation();return;}
  if(e.target.closest('.phone-group-title'))return;
  const outside=e.target.closest('.phone-group-bg .phone-container');if(outside){e.preventDefault();e.stopImmediatePropagation();clearGesture();const item=state().items.find(i=>i.id===outside.dataset.id),isText=editing&&!!e.target.closest('.phone-name,.phone-widget');gesture={pointer:e.pointerId,start:point(e),item,text:isText,el:outside,scroll,flow:syncFlow().snapshot(),kind:null,done:false,longFired:false,outsideId:outside.dataset.id};root.setPointerCapture(e.pointerId);if(!armGroupEntry(gesture)&&!editing){const g=gesture;g.long=setTimeout(()=>{if(gesture!==g||g.kind)return;g.longFired=true;edit();},500);}return;}
  if(e.target.closest('.phone-quick,.phone-tool,.phone-quick-entry,[data-countdown-action],[data-stopwatch-action],[data-colors-action],.phone-menu,.phone-dialog-shade,.phone-footer,.phone-app,.phone-search,.phone-chevron,.phone-reach-blank,.phone-multitask'))return;
  e.preventDefault();e.stopImmediatePropagation();clearGesture();const p=point(e);if(p.y<0||p.y>=VIEW)return;
  if(root.querySelector('.phone-dialog-shade'))return;if(root.querySelector('.phone-menu')){closeMenu();return;}
  const item=hit(p),isText=editing?editingTextHit(item,p):textHit(item,p),g=gesture={pointer:e.pointerId,start:p,item,text:isText,scroll,flow:syncFlow().snapshot(),kind:null,done:false,longFired:false,origin:item?{col:item.col,row:item.row}:null,el:item?[...page.children].find(el=>el.dataset.id===item.id):null};
  root.setPointerCapture(e.pointerId);
  if(!armGroupEntry(g)&&!editing){g.long=setTimeout(()=>{if(gesture!==g||g.kind||g.done||(g.maxDistance||0)>10)return;g.longFired=true;if(isText){menu(item,p);g.edit=setTimeout(()=>{if(gesture===g&&!g.kind&&!g.done){edit();g.el=[...page.children].find(el=>el.dataset.id===item.id);}},1000);}else edit();},500);}
 },true);
 window.addEventListener('pointermove',e=>{
  const g=gesture;if(!g||e.pointerId!==g.pointer||mode!=='phone')return;e.preventDefault();e.stopImmediatePropagation();if(g.done)return;
  const p=point(e),dx=p.x-g.start.x,dy=p.y-g.start.y,distance=Math.hypot(dx,dy);g.maxDistance=Math.max(g.maxDistance||0,distance);
  if(g.maxDistance>10){clearTimeout(g.long);clearTimeout(g.edit);}
  if(!g.kind){g.direction ||= CabanonGestures.axis(dx,dy);if(!g.direction)return;if(g.longFired&&!editing)return;const horizontal=g.direction==='horizontal';g.kind=editing&&g.text&&g.item?(groupView&&!g.outsideId&&dx>0&&horizontal?'swipe':'move'):g.text&&horizontal?'swipe':horizontal?'ignore':'scroll';closeMenu();}
  if(g.kind==='move'){if(!g.dragIds)beginDrag(g);moveDrag(g,p);}
  if(g.kind==='swipe')swipe(g,dx);
  if(g.kind==='scroll'){const raw=g.scroll-dy;if(!groupView&&!editing&&appView.hidden&&!searching&&raw<0){scrollTo(0);paintPull(-raw);}else{resetPull();scrollTo(raw);}}
 },true);
 function finishBackgroundDrag(g,p){
  const list=state().items.filter(i=>!i.removed&&!i.groupId),offset=groupView.homeScroll;
  let layout=new CabanonPhoneFlow(list,offset,true,VIEW);
  const pins=list.filter(i=>g.dragIds.includes(i.id)&&i.pinned),occupied=new Set(list.filter(i=>i.pinned&&!g.dragIds.includes(i.id)).map(i=>i.pinTop/ROW));
  for(const [index,item]of pins.entries()){const wanted=Math.round((p.y-g.grab.y)/ROW)+index,slot=Array.from({length:VIEW/ROW},(_,i)=>i).filter(i=>!occupied.has(i)).sort((a,b)=>Math.abs(a-wanted)-Math.abs(b-wanted)||a-b)[0];item.pinTop=slot*ROW;occupied.add(slot);}
  if(pins.length)layout=new CabanonPhoneFlow(list,offset,true,VIEW);
  const moving=g.dragIds.filter(id=>!list.find(i=>i.id===id)?.pinned),targets=list.filter(i=>!g.dragIds.includes(i.id)),target=targets.find(i=>p.y>=layout.top(i.id)&&p.y<layout.top(i.id)+ROW)||targets.sort((a,b)=>Math.abs(p.y-layout.top(a.id)-ROW/2)-Math.abs(p.y-layout.top(b.id)-ROW/2))[0];
  if(moving.length)layout.insert(moving,0,target?.id,target?p.y>=layout.top(target.id)+ROW/2:false);
  list.filter(i=>!i.pinned).sort((a,b)=>layout.top(a.id)-layout.top(b.id)).forEach((item,row)=>item.row=row);
  savePhone();render();
 }
 function finish(e,cancel=false){const g=gesture;if(!g||e.pointerId!==g.pointer)return;e.preventDefault();e.stopImmediatePropagation();if(!cancel&&g.kind==='scroll'&&pullOffset>3*ROW&&!groupView&&!editing){clearTimeout(g.long);clearTimeout(g.edit);gesture=null;exitHome(()=>{home();openSearch();},'right',true);return;}resetPull();clearTimeout(g.long);clearTimeout(g.edit);gesture=null;if(g.kind==='move')endDrag(g,cancel);if(g.done)return;if(cancel){if(g.kind==='move'){render();return;}scroll=g.scroll;if(g.kind==='scroll')flow.restore(g.flow);render();return;}if(g.kind==='swipe'){if(g.swipeReady){g.swipeRight?(groupView?leaveGroup(g.item):pin(g.item)):remove(g.item);}else restore(g);return;}if(g.kind==='move'){
   if(g.outsideId&&groupView){finishBackgroundDrag(g,point(e));return;}
   const released=point(e),globalPoint=released.y>=VIEW?(g.dropPoint||g.start):released,p={...globalPoint,y:globalPoint.y-groupInset()},col=0;
   const list=items(),pinned=list.filter(i=>g.dragIds.includes(i.id)&&i.pinned),occupied=new Set(list.filter(i=>i.pinned&&!g.dragIds.includes(i.id)).map(i=>i.pinTop/ROW));
   for(const [index,item]of pinned.entries()){
    const slots=Array.from({length:contentHeight()/ROW},(_,i)=>i).filter(i=>!occupied.has(i));const wanted=Math.round((p.y-g.grab.y)/ROW)+index;
    const slot=slots.sort((a,b)=>Math.abs(a-wanted)-Math.abs(b-wanted)||a-b)[0];item.pinTop=slot*ROW;occupied.add(slot);
   }
   if(pinned.length){flow=null;flowSignature='';}
   const layout=syncFlow(),movingIds=g.dragIds.filter(id=>!list.find(i=>i.id===id)?.pinned),candidates=list.filter(i=>!g.dragIds.includes(i.id));
   const covering=candidates.filter(i=>p.y>=layout.top(i.id)&&p.y<layout.top(i.id)+ROW),target=covering[0]||candidates.sort((a,b)=>Math.abs(p.y-layout.top(a.id)-ROW/2)-Math.abs(p.y-layout.top(b.id)-ROW/2))[0];
   if(movingIds.length){layout.insert(movingIds,col,target?.id,target?p.y>=layout.top(target.id)+ROW/2:false);for(const item of list)if(!item.pinned)item.row=(layout.top(item.id)+scroll)/ROW;}
   if(groupView){const group=state().items.find(i=>i.id===groupView.id);group.members=list.sort((a,b)=>a.row-b.row).map(i=>i.id);}
   flowSignature=layoutKey();settle(true);return;
  }if(g.kind==='scroll'){settle();return;}if(g.kind||g.longFired||(g.maxDistance||0)>10)return;if(g.outsideId){const item=state().items.find(i=>i.id===g.outsideId);if(editing){selected.has(g.outsideId)?selected.delete(g.outsideId):selected.add(g.outsideId);render();}else{closeGroup();if(item)open(item);}return;}if(editing){if(!g.text){editing=false;selected.clear();settle();}else if(g.item.members){selected.has(g.item.id)?selected.delete(g.item.id):selected.add(g.item.id);render();}else{selected.has(g.item.id)?selected.delete(g.item.id):selected.add(g.item.id);render();}}else if(g.text)open(g.item);
 }
 window.addEventListener('pointerup',e=>finish(e),true);window.addEventListener('pointercancel',e=>finish(e,true),true);
 page.addEventListener('dblclick',e=>{if(!editing)return;const el=e.target.closest('.phone-container'),item=items().find(i=>i.id===el?.dataset.id);if(item?.members)openGroup(item);});
 root.addEventListener('contextmenu',e=>{e.preventDefault();e.stopImmediatePropagation();});
 // Three short Home-line taps only dismiss Home indicators, never message read state.
 let footerPress=null,homeLineTaps=[];
 function homeLineTap(){const quick=root.querySelector('.phone-quick'),plain=appView.hidden&&!searching&&!groupView&&!editing&&(!quick||quick.hidden)&&!root.classList.contains('multitasking');if(plain){const now=performance.now();homeLineTaps=homeLineTaps.filter(t=>now-t<=1500);homeLineTaps.push(now);if(homeLineTaps.length===3){state().homeHintsDismissed=true;savePhone();homeLineTaps=[];}}else homeLineTaps=[];homeTap();}

 root.querySelector('.phone-home').addEventListener('pointerdown',e=>{if(e.button!==0)return;footerPress={id:e.pointerId,x:e.clientX,y:e.clientY,at:performance.now(),max:0};e.currentTarget.setPointerCapture(e.pointerId);});
 root.querySelector('.phone-home').addEventListener('pointermove',e=>{if(footerPress?.id===e.pointerId)footerPress.max=Math.max(footerPress.max,Math.hypot(e.clientX-footerPress.x,e.clientY-footerPress.y)/scale);});
 root.querySelector('.phone-home').addEventListener('pointerup',e=>{const g=footerPress;footerPress=null;if(!g||g.id!==e.pointerId)return;const dx=e.clientX-g.x,dy=e.clientY-g.y,dist=Math.hypot(dx,dy)/scale,duration=performance.now()-g.at;if(duration<500&&dist<=10&&g.max<=10){homeLineTap();return;}if(!searching&&!shifted&&!editing&&appView.hidden&&dy>0&&CabanonGestures.axis(dx/scale,dy/scale)==='vertical'&&!root.querySelector('.phone-dialog-shade,.phone-menu'))doShift();});
 root.querySelector('.phone-home').addEventListener('pointercancel',()=>footerPress=null);
 chevron.addEventListener('pointerdown',e=>{if(shifted&&e.button===0){e.preventDefault();e.stopImmediatePropagation();restoreShift();}},true);
 
 window.addEventListener('keydown',e=>{if(e.key==='F8'){f8=true;e.preventDefault();e.stopImmediatePropagation();}else if(f8&&['F1','F2'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)setMode(e.key==='F1'?'pc':'phone');}else if(mode==='phone'&&e.key==='Escape'){if(searching)homeTap();else if(shifted)restoreShift();else{clearGesture();closeMenu();closeDialog();}}},true);
 window.addEventListener('keyup',e=>{if(e.key==='F8'){f8=false;e.preventDefault();}},true);
 window.addEventListener('blur',()=>{f8=false;footerPress=null;clearGesture();if(mode==='phone')render();});
 window.addEventListener('cabanon-device-mode',e=>setMode(e.detail));window.addEventListener('resize',fit);
 function clock(){root.querySelector('time').textContent=new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});if(mode==='phone'&&!gesture&&!exitBusy&&!nameEntrance&&appView.hidden&&iconPreviewAt===null)render();}clock();setInterval(clock,10000);setInterval(()=>{if(!root.classList.contains('phone-name-entering'))CabanonPhoneWidgets.updateTime(root);for(const el of page.querySelectorAll(':scope > .phone-container.pinned')){const item=items().find(i=>i.id===el.dataset.id);if(item)paintPinLine(el,item);}},1000);
 window.CabanonPhone={setMode,home,homeTap,exitHome,quickTap,searchTap,activateTask,render,open,closeGroup,search(){home();openSearch();},get activeGroup(){return groupView?.id||null;},get activeApp(){return window.CabanonQuick?.activeApp||activeApp;},get mode(){return mode;},get editing(){return editing;},get scroll(){return scroll;},get used(){return used();},get items(){return items();}};
 setMode(localStorage.getItem(MODE));
 document.fonts.ready.then(()=>{if(mode==='phone'&&!gesture&&!exitBusy&&!nameEntrance)render();});
})();
