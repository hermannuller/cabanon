'use strict';
(() => {
 const W=393,H=760,ROW=56,CELL=16.8,LEFT=16.8,COL=184.8,LABEL=168,TOP=32,VIEW=672,LIMIT=12,MOVE=10;
 const SEARCH_DRAG=2*ROW;
 const MODE='cabanon-device-mode', widgets=new Set(['NEWS','STOCKS','DATE','THEN','ASTRO','WEATHER','TIME']);
 const root=document.createElement('section');root.id='phone';root.hidden=true;root.setAttribute('aria-label','Cabanon Phone');
 root.innerHTML='<header class="phone-status"><time></time><span class="phone-battery"></span></header><main class="phone-page"></main><article class="phone-app" hidden></article><section class="phone-search" hidden><div class="phone-search-bar"><input class="phone-search-input" placeholder="Search" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"></div><div class="phone-search-results"></div><div class="phone-keyboard" hidden></div></section><footer class="phone-footer"><button class="phone-group-target" aria-label="Group or ungroup" hidden><span class="phone-group-mark" aria-hidden="true"></span></button><button class="phone-home" aria-label="Home"></button></footer>';
 document.body.append(root);
 const chevron=document.createElement('div');chevron.className='phone-chevron';chevron.setAttribute('aria-hidden','true');root.append(chevron);const reachBlank=document.createElement('button');reachBlank.className='phone-reach-blank';reachBlank.setAttribute('aria-label','Restore full screen');reachBlank.hidden=true;reachBlank.onclick=()=>restoreShift();root.append(reachBlank);
 const page=root.querySelector('.phone-page'), appView=root.querySelector('.phone-app');
 const pullHint=document.createElement('div');pullHint.className='phone-pull-hint';pullHint.textContent='↓ Search';pullHint.hidden=true;root.append(pullHint);
 function paintPull(distance){const value=Math.max(0,Math.min(distance,SEARCH_DRAG+ROW));root.classList.toggle('pulling',value>0);page.style.translate=value?'0 '+value+'px':'';pullHint.hidden=!value;pullHint.style.height=value+'px';}
 function resetPull(){paintPull(0);wheelPull=0;}
 const searchView=root.querySelector('.phone-search'), searchInput=root.querySelector('.phone-search-input'), searchResults=root.querySelector('.phone-search-results'), keyboard=root.querySelector('.phone-keyboard');
 let mode='pc',editing=false,scroll=0,gesture=null,f8=false,scale=1,restoreTimers=[],activeApp=null;
 let flow=null,flowSignature='',wheelTimer=null;
 let shifted=false;
 const SHIFT_Y=7*ROW+TOP;
 let searching=false,searchQuery='';
 const KEYBOARD_ROWS=[['Q','W','E','R','T','Y','U','I','O','P'],['A','S','D','F','G','H','J','K','L'],['⇧','Z','X','C','V','B','N','M','⌫'],['123','␣','⏎']];
 const selected=new Set(),groupTarget=root.querySelector('.phone-group-target');
 const sortButtons=[];
 for(const [key,first,last]of [['name','A','Z'],['installed','new','old'],['usage','often','rare']]){const button=document.createElement('button');button.className='phone-sort phone-sort-'+key;button.hidden=true;button.dataset.sort=key;button.innerHTML='<span class="phone-sort-words"><span>'+first+'</span><span>'+last+'</span></span><span class="phone-sort-arrow">↓</span>';button.setAttribute('aria-label','Sort by '+key);button.onclick=()=>sortHome(key);root.querySelector('.phone-footer').append(button);sortButtons.push(button);}
 function updateFooter(){const carried=gesture?.dragIds||[...selected];groupTarget.hidden=!editing||!(carried.length>1||carried.some(id=>state().items.find(i=>i.id===id)?.members));const bottom=!editing&&appView.hidden&&scroll>=maximumScroll()-.01;for(const button of sortButtons)button.hidden=!bottom;}
 function sortHome(key){
  const previous=state().sort,direction=previous?.key===key?-previous.direction:1;state().sort={key,direction};
  const catalog=new Map(phoneApps().map(a=>[a.name,a]));
  const value=item=>key==='installed'?(item.createdAt||catalog.get(item.id)?.installed||0):(prefs.usage?.[item.id]||0);
  const ordered=items().filter(i=>!i.pinned).sort((a,b)=>direction*(key==='name'?name(a).localeCompare(name(b),'en',{numeric:true}):-(value(a)-value(b)))||name(a).localeCompare(name(b),'en',{numeric:true}));
  const split=Math.ceil(ordered.length/2);for(const [col,list]of [ordered.slice(0,split),ordered.slice(split)].entries()){let row=0;const pins=items().filter(i=>i.pinned&&i.col===col);for(const item of list){while(pins.some(pin=>row<pin.row+pin.size&&row+item.size>pin.row))row++;item.col=col;item.row=row;row+=item.size;}}
  scroll=maximumScroll();flow=null;selected.clear();settle(true);
  for(const button of sortButtons){button.setAttribute('aria-pressed',String(button.dataset.sort===key));button.querySelector('.phone-sort-arrow').textContent=button.dataset.sort===key&&direction<0?'↑':'↓';}
 }

 let iconPreviewAt=null,iconFrame=null;
 function stopIconPreview(){iconPreviewAt=null;cancelAnimationFrame(iconFrame);iconFrame=null;page.classList.remove('icon-preview');}
 function paintIconPreview(){
  if(iconPreviewAt===null)return;
  const elapsed=performance.now()-iconPreviewAt,step=Math.max(0,Math.floor((elapsed-1000)/FILE_REMOVAL_CHARACTER_MS));let longest=0;
  for(const el of page.children){const item=items().find(i=>i.id===el.dataset.id);if(!item)continue;const chars=typeof removalSegmenter!=='undefined'&&removalSegmenter?[...removalSegmenter.segment(name(item))].map(p=>p.segment):Array.from(name(item));longest=Math.max(longest,chars.length);el.querySelector('.phone-name').textContent=chars.slice(0,Math.max(0,chars.length-step)).join('');el.querySelector('.phone-preview-icon')?.classList.toggle('erased',step>chars.length);}
  if(elapsed>=1000+(longest+1)*FILE_REMOVAL_CHARACTER_MS){stopIconPreview();render();}
 }
 function previewIcons(){stopIconPreview();iconPreviewAt=performance.now();render();const tick=()=>{paintIconPreview();if(iconPreviewAt!==null)iconFrame=requestAnimationFrame(tick);};iconFrame=requestAnimationFrame(tick);}
 const phoneApps=()=>[...apps.filter(a=>!(prefs.uninstalled||[]).includes(a.name)),{name:'/HOUSE',glyph:'folder',path:'/house'}];
 function state(){
  const s=prefs.phone ||= {items:[]};s.items ||= [];
  phoneApps().forEach((app,i)=>{if(s.items.some(item=>item.id===app.name))return;let col=Math.floor(i/15),row=i%15;if(col>1){const ends=[0,1].map(c=>Math.max(0,...s.items.filter(item=>!item.removed&&item.col===c).map(item=>item.row+item.size)));col=ends[0]<=ends[1]?0:1;row=ends[col];}s.items.push({id:app.name,col,row,size:1,pinned:false,removed:false});});
  for(const item of s.items)if(item.id==='WHERE'&&item.size>1)item.size=1;
  return s;
 }
 function items(){return state().items.filter(i=>!i.removed&&!i.groupId&&(i.members||phoneApps().some(a=>a.name===i.id)));}
 function name(item){return item.members?item.title:appLabel(item.id); }
 function paintName(label,item){label.textContent=name(item);label.classList.toggle('group-name',!!item.members); }
 function savePhone(){persistProfiles();if(typeof flushProfiles==='function')flushProfiles();}
 function used(){return items().filter(i=>i.pinned).reduce((sum,i)=>sum+i.size,0);}
 function point(e){const b=root.getBoundingClientRect();return{x:(e.clientX-b.left)/scale,y:(e.clientY-b.top)/scale-TOP-(shifted?SHIFT_Y:0)};}
 function layoutKey(list=items()){return list.map(i=>[i.id,i.col,i.row,i.size,i.pinned].join(':')).join('|');}
 function syncFlow(){const list=items(),signature=layoutKey(list);if(!flow||signature!==flowSignature){flow=new CabanonPhoneFlow(list,scroll);flowSignature=signature;}else if(flow.offset!==scroll)flow.move(scroll-flow.offset);return flow;}
 function visibleRow(item){return (syncFlow().top(item.id)??item.row*ROW)/ROW;}
 function settle(commit=false,insertedColumn=-1){const layout=syncFlow();layout.snap(insertedColumn);if(commit){const homeLayout=new CabanonPhoneFlow(items());homeLayout.snap(insertedColumn);for(const item of items())if(!item.pinned)item.row=homeLayout.top(item.id)/ROW;flowSignature=layoutKey();savePhone();}render();}
 // Every membership/size/fixed-state change uses the same packer as release.
 // Preserve current screen positions before changing the saved home layout.
 function changeLayout(action){const previous=syncFlow(),positions=new Map(items().map(i=>[i.id,previous.top(i.id)]));action();const list=items();flow=new CabanonPhoneFlow(list.map(i=>({...i,row:i.pinned?i.row:((positions.get(i.id)??i.row*ROW-scroll)+scroll)/ROW})),scroll);flowSignature=layoutKey(list);settle(true);}
 function rectOverlap(a,b){return a.col===b.col&&a.row<b.row+b.size&&a.row+a.size>b.row;}
 function freePinned(item,col,row,size=item.size){return row>=0&&row+size<=LIMIT&&!items().some(other=>other!==item&&other.pinned&&rectOverlap({col,row,size},other));}
 function pinSpot(item,size=item.size){const row=Math.max(0,Math.min(LIMIT-size,Math.round(visibleRow(item))));if(freePinned(item,item.col,row,size))return{col:item.col,row};for(let r=0;r<=LIMIT-size;r++)for(let c=0;c<2;c++)if(freePinned(item,c,r,size))return{col:c,row:r};return null;}
 function closeMenu(){root.querySelector('.phone-menu')?.remove();}
 function closeDialog(){root.querySelector('.phone-dialog-shade')?.remove();}
 function notice(text,action){closeMenu();closeDialog();render();const shade=document.createElement('div');shade.className='phone-dialog-shade';shade.innerHTML='<div class="phone-dialog" role="alertdialog" aria-modal="true"><p></p><div></div></div>';shade.querySelector('p').textContent=text;const controls=shade.querySelector('div>div');for(const [label,fn]of action?[['yes',()=>{closeDialog();action();}],['no',closeDialog]]:[['ok',closeDialog]]){const b=document.createElement('button');b.textContent=label;b.onclick=fn;controls.append(b);}root.append(shade);}
 function capacity(){notice('pinned '+LIMIT+' is max, unpin some apps or make x2/x3/x4 be smaller.');}
 function pin(item){
  closeMenu();if(item.pinned){changeLayout(()=>{item.pinned=false;item.row+=Math.round(scroll/ROW);item.size=1;});return;}
  if(used()+item.size>LIMIT)return capacity();const spot=pinSpot(item);if(!spot)return capacity();changeLayout(()=>Object.assign(item,spot,{pinned:true}));
 }
 function widgetLimit(item){return item.id==='TIME'?1:item.id==='ASTRO'?3:4;}
 function size(item,value){if(!item.pinned||!widgets.has(item.id)||value<1||value>widgetLimit(item))return;if(used()-item.size+value>LIMIT)return capacity();const spot=pinSpot(item,value);if(!spot)return capacity();changeLayout(()=>Object.assign(item,spot,{size:value}));}
 function paintWidgetSizes(el,item){
  el.replaceChildren();
  for(const [step,symbol,label]of [[-1,'−','Remove one entry'],[1,'+','Add one entry']]){
   const b=document.createElement('button');b.type='button';b.dataset.step=step;b.className='phone-size-button';b.setAttribute('aria-label',label);
   b.disabled=step<0?item.size<=1:item.size>=widgetLimit(item);
   b.onclick=()=>{size(item,item.size+step);if(el.isConnected)paintWidgetSizes(el,item);};el.append(b);
  }
 }

 function remove(item){if(!item.members&&!canRemoveApplication(item.id))return;closeMenu();notice('remove '+name(item)+'?',()=>changeLayout(()=>{item.removed=true;item.pinned=false;if(!item.members&&item.id!=='/HOUSE')uninstallApplication(item.id);}));}
 function renameGroup(item){
  closeMenu();closeDialog();const shade=document.createElement('div');shade.className='phone-dialog-shade';
  const form=document.createElement('form');form.className='phone-rename';form.setAttribute('aria-label','Rename group');
  const input=document.createElement('input');input.value=item.title;input.maxLength=9;input.setAttribute('aria-label','Group name');input.autocomplete='off';
  const error=document.createElement('p');error.setAttribute('role','status');
  const save=document.createElement('button');save.type='submit';save.textContent='save';const cancel=document.createElement('button');cancel.type='button';cancel.textContent='cancel';cancel.onclick=closeDialog;
  form.append(input,error,save,cancel);shade.append(form);root.append(shade);input.focus();input.select();
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
 function menu(item,p){closeMenu();const el=document.createElement('aside');el.className='phone-menu';el.dataset.id=item.id;for(const [label,fn]of [...(item.members?[['rename',()=>renameGroup(item)]]:[]),['edit containers',edit],[item.pinned?'unpin':'pin',()=>pin(item)]]){const b=document.createElement('button');b.textContent=label;if(label==='remove')b.className='remove';b.onclick=fn;el.append(b);}if(item.pinned&&widgets.has(item.id)){const sizes=document.createElement('div');sizes.className='phone-sizes';paintWidgetSizes(sizes,item);el.append(sizes);}if(item.members||canRemoveApplication(item.id)){const b=document.createElement('button');b.textContent='remove';b.className='remove';b.onclick=()=>remove(item);el.append(b);}root.append(el);positionMenu();}
 function render(){
  restoreTimers.forEach(clearTimeout);restoreTimers=[];page.classList.toggle('editing',editing);page.classList.toggle('icon-preview',iconPreviewAt!==null);updateFooter();page.replaceChildren();
  for(const item of items()){
   const el=document.createElement('div');el.className='phone-container'+(item.pinned?' pinned':'')+(selected.has(item.id)?' selected':'');el.dataset.id=item.id;el.dataset.col=item.col;el.style.left=(LEFT+item.col*COL)+'px';el.style.top=(visibleRow(item)*ROW)+'px';el.style.setProperty('--rows',item.size);el.style.setProperty('--pin-inset',(LEFT+item.col*COL-item.col*W/2)+'px');el.style.setProperty('--selection-inset',(LEFT+item.col*COL-item.col*W/2)+'px');
   const label=document.createElement('span');label.className='phone-name';paintName(label,item);el.append(label);if(iconPreviewAt!==null){const mark=document.createElement('span');mark.className='phone-preview-icon';mark.innerHTML=item.members?'<span class="phone-group-mark"></span>':appIcon(phoneApps().find(a=>a.name===item.id)?.glyph||'folder');el.append(mark);}
   if(item.id==='RIVER'){const count=document.createElement('span');count.className='phone-river-count';count.textContent='99';count.setAttribute('aria-hidden','true');el.append(count);}
   const content=CabanonPhoneWidgets.markup(item,state().widgetData);
   if(content){el.classList.add('has-widget');const body=document.createElement('div');body.className='phone-widget';body.innerHTML=content;el.append(body);el.setAttribute('aria-label',name(item));}
   page.append(el);el.style.setProperty('--label-width',(label.getBoundingClientRect().right-el.getBoundingClientRect().left)/scale+'px');
  }
  if(iconPreviewAt!==null)paintIconPreview();
  positionMenu();
 }
 function fit(){scale=Math.min(innerWidth/W,innerHeight/H);root.style.transform=`translate(-50%,-50%) scale(${scale})`;root.style.top='50%';}
 function applyShift(){root.classList.toggle('shifted',shifted);root.style.top='50%';root.style.setProperty('--reach-offset',SHIFT_Y+'px');reachBlank.hidden=!shifted;}
 function doShift(){shifted=true;applyShift();}
 function restoreShift(){if(!shifted)return;shifted=false;applyShift();}
 function openSearch(){resetPull();clearTimeout(wheelTimer);shiftState=0;inputTools.hidden=false;searching=true;searchQuery='';searchInput.value='';searchView.hidden=false;keyboard.hidden=false;renderKeyboard();renderSearchResults();setTimeout(()=>{if(searching)searchInput.focus();},50);}
 function closeSearch(){resetPull();keyboard.querySelectorAll('.phone-key-preview').forEach(e=>e.remove());wheelPull=0;inputTools.hidden=true;recognition?.stop();searching=false;searchView.hidden=true;searchInput.blur();}
 let shiftState=0,numeric=false,inputLanguage='en-US',wheelPull=0,recognition=null;
 const inputTools=document.createElement('div');inputTools.className='phone-input-tools';inputTools.hidden=true;inputTools.innerHTML='<button class="phone-language" aria-label="Switch language"><i class="key-symbol symbol-globe"></i></button><button class="phone-voice" aria-label="Voice input"><i class="key-symbol symbol-mic"></i></button>';root.querySelector('.phone-footer').append(inputTools);
 inputTools.querySelector('.phone-language').onclick=()=>{inputLanguage=inputLanguage==='en-US'?'zh-CN':'en-US';searchInput.lang=inputLanguage;searchInput.placeholder=inputLanguage==='zh-CN'?'搜索':'Search';searchInput.focus();};
 inputTools.querySelector('.phone-voice').onclick=()=>{const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Speech){searchInput.placeholder='Voice input unavailable';return;}if(recognition){recognition.stop();return;}recognition=new Speech();recognition.lang=inputLanguage;recognition.onresult=e=>{searchInput.value+=e.results[0][0].transcript;renderSearchResults();};recognition.onerror=()=>{searchInput.placeholder='Voice input unavailable';};recognition.onend=()=>{recognition=null;inputTools.querySelector('.phone-voice').classList.remove('recording');};inputTools.querySelector('.phone-voice').classList.add('recording');recognition.start();};
 function paintShift(){keyboard.classList.toggle('uppercase',shiftState>0);keyboard.classList.toggle('caps-lock',shiftState===2);const button=keyboard.querySelector('[data-key="⇧"]');if(button){button.setAttribute('aria-pressed',String(shiftState>0));button.setAttribute('aria-label',shiftState===2?'Caps lock':shiftState===1?'Shift once':'Shift');}}
 function renderKeyboard(){
  keyboard.replaceChildren();
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
 searchInput.addEventListener('pointerdown',()=>{if(searching)setTimeout(()=>{if(searching)searchInput.focus();},50);});
 // Blank taps dismiss search; scrolls and keyboard/result gestures remain intact.
 let searchBlankPress=null;
 root.addEventListener('pointerdown',e=>{
  searchBlankPress=null;
  if(!searching||e.button!==0||e.target.closest('.phone-search-result,.phone-keyboard,.phone-search-bar,.phone-input-tools,.phone-home'))return;
  searchBlankPress={id:e.pointerId,x:e.clientX,y:e.clientY};
 },true);
 root.addEventListener('pointerup',e=>{
  const press=searchBlankPress;searchBlankPress=null;
  if(!searching||!press||press.id!==e.pointerId||Math.hypot(e.clientX-press.x,e.clientY-press.y)/scale>MOVE)return;
  e.preventDefault();e.stopImmediatePropagation();home();
 },true);
 root.addEventListener('pointercancel',()=>searchBlankPress=null,true);
 function clearGesture(){resetPull();if(!gesture)return;const g=gesture;clearTimeout(g.long);clearTimeout(g.edit);gesture=null;if(g.kind==='move'){endDrag(g,true);render();}}
 function home(){stopIconPreview();clearGesture();closeMenu();closeDialog();closeSearch();restoreShift();editing=false;selected.clear();scroll=0;flow=null;activeApp=null;appView.hidden=true;render();}
 function setMode(value){window.CabanonPhoneMultitask?.dismiss();stopIconPreview();clearGesture();closeMenu();closeDialog();closeSearch();restoreShift();f8=false;mode=value==='phone'?'phone':'pc';localStorage.setItem(MODE,mode);document.body.classList.toggle('phone-mode',mode==='phone');root.hidden=mode!=='phone';if(mode==='phone'){fit();render();}else fitDesktop();}
 function open(item){queueMicrotask(()=>{window.CabanonPhoneMultitask?.record(item,appView);if(!matchMedia('(prefers-reduced-motion: reduce)').matches){appView.getAnimations().forEach(a=>a.cancel());appView.animate([{translate:'393px 0'},{translate:'0 0'}],{duration:180,easing:'ease-out'});}});restoreShift();stopIconPreview();prefs.usage ||= {};prefs.usage[item.id]=(prefs.usage[item.id]||0)+1;savePhone();for(const button of sortButtons)button.hidden=true;activeApp=item.id;editing=false;selected.clear();groupTarget.hidden=true;closeMenu();appView.replaceChildren();if(item.members){const title=document.createElement('h1');paintName(title,item);appView.append(title);for(const id of item.members){const member=state().items.find(i=>i.id===id);if(!member||member.removed||(prefs.uninstalled||[]).includes(member.id))continue;const button=document.createElement('button');button.className='phone-group-member phone-name';paintName(button,member);button.onclick=()=>open(member);appView.append(button);}appView.hidden=false;return;}const h=document.createElement('h1');h.textContent=name(item);const p=document.createElement('p');p.textContent='A small place for your thoughts. Take a moment, look around, and let the day unfold.\n\nThis is '+name(item)+'.';appView.append(h,p);appView.hidden=false;}
 function hit(p){const ordered=[...items().filter(i=>!i.pinned),...items().filter(i=>i.pinned)].reverse();return ordered.find(item=>p.x>=LEFT+item.col*COL&&p.x<LEFT+item.col*COL+LABEL&&p.y>=visibleRow(item)*ROW&&p.y<(visibleRow(item)+item.size)*ROW);}
 function textHit(item,p){if(!item)return false;const el=[...page.children].find(el=>el.dataset.id===item.id),label=el?.querySelector('.phone-name');if(el?.classList.contains('has-widget')&&iconPreviewAt===null)return true;if(!label)return false;const width=Math.max(4*CELL,label.getBoundingClientRect().width/scale),start=LEFT+item.col*COL;return p.y>=visibleRow(item)*ROW&&p.y<visibleRow(item)*ROW+ROW&&p.x>=start&&p.x<start+width;}
 function restore(g){const label=g.el?.querySelector('.phone-name');g.el?.querySelector('.phone-swipe')?.remove();if(!label)return;label.style.transform='';g.el?.classList.remove('widget-swiping');const original=name(g.item),positions=[...original].map((_,i)=>i).filter(i=>label.textContent[i]!==original[i]);positions.forEach((position,index)=>restoreTimers.push(setTimeout(()=>{const chars=[...label.textContent];chars[position]=original[position];label.textContent=chars.join('');},(index+1)*20)));}
 function swipe(g,dx){
  if(dx<0&&!g.item.members&&!canRemoveApplication(g.item.id)){g.swipeReady=false;restore(g);return;}
  g.el.classList.add('widget-swiping');
  const label=g.el.querySelector('.phone-name'),text=name(g.item),right=dx>0,word=right?(g.item.pinned?'unpin ':'pin it'):'remove';
  const steps=Math.floor((Math.abs(dx)+1e-6)/CELL),padding=Math.max(0,4-text.length),shift=right?0:Math.min(padding,steps),erased=Math.min(text.length,Math.max(0,steps-shift));
  label.style.transform=shift?`translateX(${-shift*CELL}px)`:'';
  label.textContent=right?' '.repeat(erased)+text.slice(erased):text.slice(0,text.length-erased)+' '.repeat(erased);
  let action=g.el.querySelector('.phone-swipe');if(!action){action=document.createElement('span');action.className='phone-swipe';g.el.append(action);}
  action.classList.toggle('remove',!right);
  const shown=Math.min(6,steps*2);
  action.textContent=right?word.slice(0,shown):word.slice(word.length-shown);
  g.swipeReady=steps>=3;g.swipeRight=right;
 }
 function beginDrag(g){
  g.beforeItems=structuredClone(state().items);g.beforeFlow=syncFlow().snapshot();g.beforeScroll=scroll;g.beforeSelection=[...selected];
  if(!selected.has(g.item.id)){selected.clear();selected.add(g.item.id);}
  g.dragIds=items().filter(i=>selected.has(i.id)&&!i.pinned).sort((a,b)=>visibleRow(a)-visibleRow(b)||a.col-b.col).map(i=>i.id);
  g.grab={x:g.start.x-(LEFT+g.item.col*COL),y:g.start.y-visibleRow(g.item)*ROW};
  g.floating=document.createElement('div');g.floating.className='phone-drag-list';g.floating.dataset.col=g.item.col;g.floating.style.setProperty('--selection-inset',(LEFT+g.item.col*COL-g.item.col*W/2)+'px');root.append(g.floating);paintDrag(g);
 }
 function paintDrag(g){
  updateFooter();
  g.floating.replaceChildren();for(const id of g.dragIds){const item=state().items.find(i=>i.id===id);const label=document.createElement('div');label.className='phone-name';paintName(label,item);g.floating.append(label);}
  for(const el of page.children)el.classList.toggle('drag-source',g.dragIds.includes(el.dataset.id));
 }
 function moveDrag(g,p){
  g.lastPoint=p;if(p.y>=0&&p.y<VIEW)g.dropPoint=p;
  g.floating.style.left=(p.x-g.grab.x)+'px';g.floating.style.top=(TOP+p.y-g.grab.y)+'px';
  const r=groupTarget.getBoundingClientRect(),b=root.getBoundingClientRect();
  const over=!groupTarget.hidden&&p.x>=(r.left-b.left)/scale&&p.x<(r.right-b.left)/scale&&p.y>=(r.top-b.top)/scale-TOP&&p.y<(r.bottom-b.top)/scale-TOP;
  if(!over){clearTimeout(g.groupTimer);g.groupTimer=null;g.groupLatched=false;groupTarget.classList.remove('hovering');}
  else if(!g.groupTimer&&!g.groupLatched){groupTarget.classList.add('hovering');g.groupTimer=setTimeout(()=>{g.groupTimer=null;if(gesture!==g)return;g.groupLatched=true;transformGroup(g);groupTarget.classList.remove('hovering');},500);}
 }
 function transformGroup(g){
  const all=state().items,layout=syncFlow(),positions=new Map(items().map(i=>[i.id,layout.top(i.id)])),chosen=g.dragIds.map(id=>all.find(i=>i.id===id)),anchor=chosen[0];
  if(chosen.length===1&&anchor.members){
   g.dragIds=[...anchor.members];for(const [index,id]of g.dragIds.entries()){const item=all.find(i=>i.id===id);delete item.groupId;item.col=anchor.col;item.row=anchor.row+index;positions.set(id,(positions.get(anchor.id)||0)+index*ROW);}
   all.splice(all.indexOf(anchor),1);
  }else{
   const titles=new Set(all.filter(i=>i.members&&!i.removed).map(i=>i.title));let n=0,title='NEW';while(titles.has(title))title='NEW'+(++n);
   const group={id:'group:'+crypto.randomUUID(),title,createdAt:Date.now(),members:[...g.dragIds],col:anchor.col,row:anchor.row,size:1,pinned:false,removed:false};
   for(const item of chosen)item.groupId=group.id;all.push(group);positions.set(group.id,positions.get(anchor.id)||0);g.dragIds=[group.id];
  }
  selected.clear();g.dragIds.forEach(id=>selected.add(id));
  flow=new CabanonPhoneFlow(items().map(i=>({...i,row:i.pinned?i.row:((positions.get(i.id)??i.row*ROW-scroll)+scroll)/ROW})),scroll);flowSignature=layoutKey();
  render();paintDrag(g);moveDrag(g,g.lastPoint);
 }
 function endDrag(g,cancel){
  clearTimeout(g.groupTimer);g.floating?.remove();groupTarget.classList.remove('hovering');
  if(cancel&&g.beforeItems){state().items=g.beforeItems;scroll=g.beforeScroll;flow=new CabanonPhoneFlow([]);flow.restore(g.beforeFlow);flowSignature=layoutKey();selected.clear();g.beforeSelection.forEach(id=>selected.add(id));}
 }
 function maximumScroll(){return Math.max(0,...items().filter(i=>!i.pinned).map(i=>(i.row+i.size)*ROW-(VIEW-ROW*4)));}
 function scrollTo(value){scroll=Math.max(0,Math.min(maximumScroll(),value));syncFlow();for(const el of page.children){const item=items().find(i=>i.id===el.dataset.id);if(item)el.style.top=visibleRow(item)*ROW+'px';}updateFooter();}
 window.addEventListener('wheel',e=>{
  if(mode!=='phone'||!page.contains(e.target)||!appView.hidden||root.querySelector('.phone-dialog-shade,.phone-menu'))return;
  e.preventDefault();e.stopImmediatePropagation();
  const delta=e.deltaY*(e.deltaMode===1?ROW:e.deltaMode===2?VIEW:1/scale);
  if(!editing&&!searching&&scroll===0&&delta<0){wheelPull+=-delta;paintPull(wheelPull);clearTimeout(wheelTimer);if(wheelPull>SEARCH_DRAG){openSearch();return;}wheelTimer=setTimeout(()=>{wheelTimer=null;resetPull();},180);return;}else resetPull();
  const g=gesture,old=scroll;
  scrollTo(scroll+delta);
  if(g){g.scroll+=scroll-old;clearTimeout(g.long);clearTimeout(g.edit);
  }
  clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>{wheelTimer=null;if(mode==='phone'&&!gesture)settle();},160);
 },{capture:true,passive:false});
 // Physical coordinates are converted to phone logical points before recognition.
 window.addEventListener('pointerdown',e=>{
  if(mode!=='phone'||!root.contains(e.target))return;
  if(e.button!==0){e.preventDefault();e.stopImmediatePropagation();return;}
  if(e.target.closest('.phone-menu,.phone-dialog-shade,.phone-footer,.phone-app,.phone-search,.phone-chevron,.phone-reach-blank,.phone-multitask'))return;
  e.preventDefault();e.stopImmediatePropagation();clearGesture();const p=point(e);if(p.y<0||p.y>=VIEW)return;
  if(root.querySelector('.phone-dialog-shade'))return;if(root.querySelector('.phone-menu')){closeMenu();return;}
  const item=hit(p),isText=editing?!!item:textHit(item,p),g=gesture={pointer:e.pointerId,start:p,item,text:isText,scroll,flow:syncFlow().snapshot(),kind:null,done:false,longFired:false,origin:item?{col:item.col,row:item.row}:null,el:item?[...page.children].find(el=>el.dataset.id===item.id):null};
  root.setPointerCapture(e.pointerId);
  if(!editing){g.long=setTimeout(()=>{if(gesture!==g||g.kind||g.done)return;g.longFired=true;if(isText){menu(item,p);g.edit=setTimeout(()=>{if(gesture===g&&!g.kind&&!g.done){edit();g.el=[...page.children].find(el=>el.dataset.id===item.id);}},1000);}else edit();},500);}
 },true);
 window.addEventListener('pointermove',e=>{
  const g=gesture;if(!g||e.pointerId!==g.pointer||mode!=='phone')return;e.preventDefault();e.stopImmediatePropagation();if(g.done)return;
  const p=point(e),dx=p.x-g.start.x,dy=p.y-g.start.y;if(!g.kind&&Math.hypot(dx,dy)<=MOVE)return;
  clearTimeout(g.long);clearTimeout(g.edit);
  if(!g.kind){if(g.longFired&&!editing)return;g.kind=editing&&g.text&&g.item&&!g.item.pinned?'move':g.text&&Math.abs(dx)>Math.abs(dy)?'swipe':'scroll';if(editing&&g.item?.pinned&&g.text)g.kind='locked';closeMenu();}
  if(g.kind==='scroll'&&g.scroll===0&&!editing&&appView.hidden&&!searching){paintPull(Math.max(0,dy));if(dy>SEARCH_DRAG){openSearch();gesture=null;}if(dy>0)return;}
  if(g.kind==='move'){if(!g.dragIds)beginDrag(g);moveDrag(g,p);}
  if(g.kind==='swipe')swipe(g,dx);
  if(g.kind==='scroll')scrollTo(g.scroll-dy);
 },true);
 function finish(e,cancel=false){const g=gesture;if(!g||e.pointerId!==g.pointer)return;e.preventDefault();e.stopImmediatePropagation();resetPull();clearTimeout(g.long);clearTimeout(g.edit);gesture=null;if(g.kind==='move')endDrag(g,cancel);if(g.done)return;if(cancel){if(g.kind==='move'){render();return;}scroll=g.scroll;if(g.kind==='scroll')flow.restore(g.flow);render();return;}if(g.kind==='swipe'){if(g.swipeReady){g.swipeRight?pin(g.item):remove(g.item);}else restore(g);return;}if(g.kind==='move'){
   const released=point(e),p=released.y>=VIEW?(g.dropPoint||g.start):released,col=p.x<W/2?0:1,layout=syncFlow();
   const candidates=items().filter(i=>!g.dragIds.includes(i.id)&&i.col===col);
   const covering=candidates.filter(i=>p.y>=layout.top(i.id)&&p.y<layout.top(i.id)+i.size*ROW);
   const target=covering.find(i=>i.pinned)||covering[0]||candidates.sort((a,b)=>Math.abs(p.y-layout.top(a.id)-a.size*ROW/2)-Math.abs(p.y-layout.top(b.id)-b.size*ROW/2))[0];
   layout.insert(g.dragIds,col,target?.id,target?p.y>=layout.top(target.id)+target.size*ROW/2:false);
   for(const id of g.dragIds){const item=items().find(i=>i.id===id);if(item)item.col=col;}for(const item of items())if(!item.pinned)item.row=(layout.top(item.id)+scroll)/ROW;
   flowSignature=layoutKey();settle(true,target?.pinned?col:-1);return;
  }if(g.kind==='scroll'){settle();return;}if(g.kind||g.longFired)return;if(editing){if(!g.text){editing=false;selected.clear();settle();}else if(!g.item.pinned){selected.has(g.item.id)?selected.delete(g.item.id):selected.add(g.item.id);render();}}else if(g.text)open(g.item);
 }
 window.addEventListener('pointerup',e=>finish(e),true);window.addEventListener('pointercancel',e=>finish(e,true),true);
 root.addEventListener('contextmenu',e=>{e.preventDefault();e.stopImmediatePropagation();});
 // Footer side spaces deliberately have no action or gesture recognizer.
 let footerPress=null;
 root.querySelector('.phone-home').addEventListener('pointerdown',e=>{if(e.button!==0)return;footerPress={id:e.pointerId,x:e.clientX,y:e.clientY,at:performance.now()};e.currentTarget.setPointerCapture(e.pointerId);});
 root.querySelector('.phone-home').addEventListener('pointerup',e=>{const g=footerPress;footerPress=null;if(!g||g.id!==e.pointerId)return;const dx=e.clientX-g.x,dy=e.clientY-g.y,dist=Math.hypot(dx,dy)/scale,duration=performance.now()-g.at;if(duration<500&&dist<=MOVE){if(!searching&&!shifted&&!editing&&appView.hidden&&!root.querySelector('.phone-dialog-shade,.phone-menu'))previewIcons();else home();return;}if(!searching&&!shifted&&!editing&&appView.hidden&&dy/scale>MOVE&&dy>0&&Math.abs(dy)>Math.abs(dx)&&!root.querySelector('.phone-dialog-shade,.phone-menu'))doShift();});
 root.querySelector('.phone-home').addEventListener('pointercancel',()=>footerPress=null);
 chevron.addEventListener('pointerdown',e=>{if(shifted&&e.button===0){e.preventDefault();e.stopImmediatePropagation();restoreShift();}},true);
 
 window.addEventListener('keydown',e=>{if(e.key==='F8'){f8=true;e.preventDefault();e.stopImmediatePropagation();}else if(f8&&['F1','F2'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)setMode(e.key==='F1'?'pc':'phone');}else if(mode==='phone'&&e.key==='Escape'){if(searching)closeSearch();else if(shifted)restoreShift();else{clearGesture();closeMenu();closeDialog();}}},true);
 window.addEventListener('keyup',e=>{if(e.key==='F8'){f8=false;e.preventDefault();}},true);
 window.addEventListener('blur',()=>{f8=false;footerPress=null;clearGesture();if(mode==='phone')render();});
 window.addEventListener('cabanon-device-mode',e=>setMode(e.detail));window.addEventListener('resize',fit);
 function clock(){root.querySelector('time').textContent=new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});if(mode==='phone'&&!gesture&&appView.hidden&&iconPreviewAt===null)render();}clock();setInterval(clock,10000);setInterval(()=>CabanonPhoneWidgets.updateTime(root),1000);
 window.CabanonPhone={setMode,home,render,open,get activeApp(){return activeApp;},get mode(){return mode;},get editing(){return editing;},get scroll(){return scroll;},get used(){return used();},get items(){return items();}};
 setMode(localStorage.getItem(MODE));
})();
