'use strict';
// WALL draws only changed cells during a stroke; storage is updated on release.
let wallState=null;
function wallHideLetter(state){if(!state)return;clearTimeout(state.letterTimer);state.letterTimer=null;state.win.querySelector('.wall-letter-prompt')?.setAttribute('hidden','');}
function wallShowLetter(state,letter){wallHideLetter(state);if(state.controls?.isConnected)return;const prompt=state.win.querySelector('.wall-letter-prompt');prompt.querySelector('span').textContent=letter;prompt.querySelector('span').style.fontWeight=state.model.settings.fontWeight;prompt.hidden=false;state.letterTimer=setTimeout(()=>wallHideLetter(state),2000);}
paths.wall='M5 24Q27 2 25 16T9 8T23 26T6 17T26 6M7 28L26 4';
function wallDraw(canvas,model,cache,indices){
 const resized=canvas.width!==model.canvasWidth||canvas.height!==model.canvasHeight;if(resized){canvas.width=model.canvasWidth;canvas.height=model.canvasHeight;}
 const ctx=canvas.getContext('2d'),s=model.settings;
 canvas.style.opacity=s.opacity/100;
 const partial=!resized&&indices&&s.height>=s.fontSize*1.5&&model.step>=model.advance+8;
 if(!partial)ctx.clearRect(0,0,model.canvasWidth,model.canvasHeight);
 const draw=partial?indices:model.cells.keys();
 for(const index of draw){
  const p=model.center(index),char=model.cells[index],key=s.fontWeight+':'+s.fontSize+':'+model.colors[index]+':'+char;
  if(partial){const col=index%model.columns,row=Math.floor(index/model.columns),left=col===0?0:p.x-model.step/2,right=col===model.columns-1?model.canvasWidth:p.x+model.step/2,top=row===0?0:s.margin+row*s.height,bottom=row===model.rows-1?model.canvasHeight:top+s.height;ctx.clearRect(left,top,right-left,bottom-top);}
  let sprite=cache.get(key);
  if(!sprite){
   const node=document.createElement('canvas'),c=node.getContext('2d');c.font=s.fontWeight+' '+s.fontSize+'px JetBrainsWall, monospace';node.width=Math.ceil(Math.max(model.advance,c.measureText(char).width)+12);node.height=Math.ceil(s.fontSize*2+8);c.font=s.fontWeight+' '+s.fontSize+'px JetBrainsWall, monospace';c.fillStyle=WALL_COLORS[model.colors[index]];c.textAlign='center';c.textBaseline='middle';c.fillText(char,node.width/2,node.height/2);sprite=node;cache.set(key,node);
  }
  ctx.drawImage(sprite,p.x-sprite.width/2,p.y-sprite.height/2);
 }
}
function wallQueue(state,indices){
 state.win.dataset.wallMode=state.model.settings.mode;
 if(!indices)state.full=true;else for(const index of indices)state.dirty.add(index);
 if(state.frame)return;
 state.frame=requestAnimationFrame(()=>{state.frame=0;if(!state.win.isConnected)return;wallDraw(state.canvas,state.model,state.cache,state.full?null:state.dirty);state.full=false;state.dirty.clear();});
}
function wallRemember(state){if(state!==wallState)return;prefs.wallDraft=state.model.serialize();if(typeof wallUpdateSaveButton==='function')wallUpdateSaveButton(state,prefs.wallDraft);persistProfiles();}
function wallCapture(state){return{document:state.model.serialize(),wallpaper:prefs.wallpaper||null};}
function wallSetUndo(state,before){state.undo=before;wallUndoStatus(state);}
function wallUndoStatus(state){const button=state.controls?.querySelector('[data-wall-action="undo"]');if(button){button.disabled=!state.undo;button.setAttribute('aria-disabled',String(!state.undo));}}
function wallUndo(state){
 if(!state.undo)return;
 const before=state.undo,tools={brush:state.model.brush,bucket:state.model.bucket,color:state.model.color},brushSize=state.model.settings.brushSize,oldMode=state.model.settings.mode;state.undo=null;state.model=new WallDocument(before.document);state.model.settings.brushSize=brushSize;if(oldMode!==state.model.settings.mode){state.modeFiles[oldMode]=state.file;state.file=state.modeFiles[state.model.settings.mode]||null;}Object.assign(state.model,tools);prefs.wallpaper=before.wallpaper;state.cache.clear();wallQueue(state);wallDesktop();wallSyncControls();wallRemember(state);
}
function wallToggleMode(state){
 const old=state.model.settings.mode,next=old==='pc'?'phone':'pc',before=wallCapture(state);state.modeDrafts[old]=state.model.serialize();state.modeFiles[old]=state.file;
 try{if(state.modeDrafts[next])state.model=new WallDocument(state.modeDrafts[next]);else state.model.resize({mode:next});}catch(error){warning(error.message);return;}
 state.file=state.modeFiles[next]||null;wallSetUndo(state,before);state.cache.clear();wallQueue(state);wallSyncControls();wallRemember(state);
}
function wallDefaultName(state){return defaultNewEntryName(state.model.settings.mode==='phone'?'pwall':'wall');}
function wallDesktop(){
 let canvas=$('#wallpaper-canvas');
 if(!prefs.wallpaper){canvas?.remove();return;}
 try{const model=new WallDocument(prefs.wallpaper);if(!canvas){canvas=document.createElement('canvas');canvas.id='wallpaper-canvas';canvas.width=1920;canvas.height=1080;$('#desktop').prepend(canvas);}wallDraw(canvas,model,new Map());}catch{canvas?.remove();}
}
function wallSupported(entry){return !entry.folder&&(entry.wall===true||/\.(?:pwall|wall)$/i.test(entry.name));}
function wallClose(win){if(win?.isConnected)closeShortcutWindow(win);}
function wallOwnedClose(){for(const win of [...windowMap.values()])if(win.dataset.wallAux)wallClose(win);}
function wallOpenEntry(entry){
 try{
  const text=prefs.content?.[entry.name],model=text?new WallDocument(JSON.parse(text)):new WallDocument();if(!text&&entry.name.toLowerCase().endsWith('.pwall'))model.resize({mode:'phone'});
  const state=openWall(false);state.model=model;state.modeDrafts={};state.modeFiles={[model.settings.mode]:entry.name};state.undo=null;state.file=entry.name;state.cache.clear();wallQueue(state);wallSyncControls();wallRemember(state);recordRecent(entry.name);wallClose(state.picker);state.picker=null;focusWindow(state.win);state.canvas.focus({preventScroll:true});return state;
 }catch(error){warning(error.message==='This file cannot be opened in WALL.'?error.message:'Unable to open this WALL file.');}
}
function wallCanEnter(path,action){
 const lock=typeof lockedAncestor==='function'&&lockedAncestor(path);
 if(lock){requestFolderAccess(lock,action);return false;}
 if(!isOwner()&&prefs.folderPermissions?.[path]==='owner'){warning('Access denied.');return false;}
 return true;
}
function wallSaveTo(state,path,name,onSaved){
 name=CabanonFilenames.require(name);if(name===null)return;
 if(state.model.settings.mode==='phone'&&!name.toLowerCase().endsWith('.pwall'))name=name.replace(/\.[^.]*$/,'')+'.pwall';
 name=CabanonFilenames.require(name);if(name===null)return;
 if(!wallCanEnter(path,()=>wallSaveTo(state,path,name,onSaved)))return;
 const existing=prefs.entries.find(e=>e.parent===path&&CabanonFilenames.key(fileLeafName(e.name))===CabanonFilenames.key(name));
 if(existing?.readOnly){warning('Read only');return;}
 if(existing?.folder){warning('A folder already uses this name.');return;}
 if(existing?.name===state.file&&state.wallDirty===false)return;
 const commit=()=>{
  if(state!==wallState)return;
  runFileMutation(()=>{
   let entry=existing;
   if(!entry){entry=CabanonCreation.create(path,{name,extension:knownFileExtension(name).slice(1),metadata:{wall:true},reveal:false});if(!entry)return;}
   const data=JSON.stringify(state.model.serialize());entry.wall=true;entry.modified=Date.now();entry.size=new TextEncoder().encode(data).length;(prefs.content ||= {})[entry.name]=data;state.file=entry.name;state.modeFiles[state.model.settings.mode]=entry.name;prefs.wallLastFile=entry.name;noteFileMutationPath(path);persistProfiles();refreshBrowsers([path]);
  });
  wallRemember(state);recordRecent(state.file);wallClose(state.picker);state.picker=null;onSaved?.();
 };
 if(existing&&existing.name!==state.file)confirmRemoval('Replace '+name,commit);else commit();
}
function wallSave(state,as=false,onSaved){if(as){wallPicker(state,'save',onSaved);return;}if(typeof wallUpdateSaveButton==='function'){wallUpdateSaveButton(state);if(!state.wallDirty)return;}const entry=prefs.entries.find(e=>e.name===state.file&&!e.folder);if(entry)wallSaveTo(state,entry.parent,fileLeafName(entry.name),onSaved);else wallPicker(state,'save',onSaved);}
function wallAux(win){win.dataset.ownerApp='BERLIN';win.dataset.wallAux='true';win.querySelectorAll('[data-win=min],[data-win=max]').forEach(node=>node.remove());renderTaskbar();}
function wallSyncControls(){
 const win=wallState?.controls;if(!win?.isConnected)return;const model=wallState.model;
 for(const input of win.querySelectorAll('[data-wall-field]')){const key=input.dataset.wallField;input.value=key==='brush'||key==='bucket'?model[key]:model.settings[key];input.removeAttribute('aria-invalid');}
 for(const button of win.querySelectorAll('[data-wall-color]'))button.setAttribute('aria-pressed',Number(button.dataset.wallColor)===model.color?'true':'false');
 const phone=model.settings.mode==='phone';win.querySelector('[data-wall-field="margin"]').disabled=phone;win.querySelector('[data-wall-field="margin"]').closest('label').classList.toggle('wall-disabled',phone);win.querySelector('[data-wall-action="desk"]').disabled=phone;
 for(const button of win.querySelectorAll('[data-wall-mode]'))button.setAttribute('aria-pressed',String(button.dataset.wallMode===model.settings.mode));
 wallUndoStatus(wallState);if(typeof wallUpdateSaveButton==='function')wallUpdateSaveButton(wallState);
}
function wallControls(state,x,y){
 wallHideLetter(state);
 if(state.controls?.isConnected){wallClose(state.controls);state.controls=null;return;}
 const field=(key,label,unit='',hint='')=>'<label class="wall-setting"><span>'+label+'</span><input data-wall-field="'+key+'" aria-label="'+label+'" '+(key==='brush'||key==='bucket'?'type="text"':'type="number" step="any"')+'><span>'+unit+'</span><small>'+hint+'</small></label>';
 const colors=WALL_COLORS.map((color,index)=>index===1?'':'<button data-wall-color="'+index+'" title="L'+(index+1)+'" aria-label="L'+(index+1)+'" aria-pressed="false" style="--wall-swatch:'+color+'"><span>■</span></button>').join('');
 const weight='<label class="wall-setting"><span>font weight</span><select data-wall-field="fontWeight" aria-label="font weight">'+['Thin','ExtraLight','Light','Regular','Medium','SemiBold','Bold','ExtraBold'].map((name,index)=>'<option value="'+((index+1)*100)+'">'+name+'</option>').join('')+'</select></label>';
 const target='<div class="wall-setting"><span>for</span><div class="wall-targets"><button data-wall-mode="pc" aria-label="PC wallpaper">PC</button><span aria-hidden="true">/</span><button data-wall-mode="phone" aria-label="Phone wallpaper">PHONE</button></div></div>';
 const brush='<label class="wall-setting wall-brush"><span>brush</span><input type="text" data-wall-field="brush" aria-label="brush"><select data-wall-field="brushSize" aria-label="brush size">'+[1,3,5,7,9].map(size=>'<option value="'+size+'">'+size+'×'+size+'</option>').join('')+'</select></label>';
 const html='<div class="wall-settings">'+target+field('margin','margin','px','<400')+brush+'<div class="wall-setting"><button data-wall-action="bucket">bucket!</button><input type="text" data-wall-field="bucket" aria-label="bucket"><span></span><small></small></div>'+weight+field('fontSize','font size','px','<73')+field('spacing','spacing','%','<10000')+field('height','height','','<1000')+'<div class="wall-setting"><span>color</span><div class="wall-palette">'+colors+'</div></div>'+field('opacity','opacity','%','0–100')+['undo','as my desk!','save','save as...','open...','quit'].map((text,i)=>'<button class="wall-action" data-wall-action="'+['undo','desk','save','save-as','open','quit'][i]+'">'+text+'</button>').join('')+'</div>';
 const win=createWindow('wall:controls','BERLIN','wall',html);state.controls=win;wallAux(win);win.classList.add('wall-controls');win.dataset.fixedSize='true';win.querySelectorAll('.window-resize').forEach(node=>node.remove());Object.assign(win.style,{width:'480px',height:'972px',left:Math.max(0,Math.min(1440,x))+'px',top:Math.max(0,Math.min(108,y))+'px'});
 win.querySelector('.window-title').ondblclick=e=>e.stopPropagation();
 for(const input of win.querySelectorAll('[data-wall-field]')){
  const key=input.dataset.wallField;
  input.addEventListener('focus',()=>{input.wallUndoBefore=null;input.wallUndoCommitted=false;});
  input.addEventListener('input',()=>{
   if(key==='fontWeight'||key==='brushSize')return;
   if(key==='brush'||key==='bucket'){input.value=wallSingle(input.value);state.model[key]=input.value;wallRemember(state);return;}
   if(input.value===''){input.setAttribute('aria-invalid','true');return;}
   try{const value=Number(input.value);state.model.geometry({[key]:value});if(value!==state.model.settings[key]){if(!input.wallUndoCommitted)input.wallUndoBefore=wallCapture(state);if(key==='opacity')state.model.settings.opacity=value;else state.model.resize({[key]:value});if(!input.wallUndoCommitted){wallSetUndo(state,input.wallUndoBefore);input.wallUndoCommitted=true;}state.cache.clear();wallQueue(state);wallRemember(state);}input.removeAttribute('aria-invalid');}catch{input.setAttribute('aria-invalid','true');}
  });
  input.addEventListener('change',()=>{if(key==='brushSize'){const value=Number(input.value);state.model.geometry({brushSize:value});state.model.settings.brushSize=value;wallRemember(state);}else if(key==='fontWeight'){const value=Number(input.value);if(value!==state.model.settings.fontWeight){state.model.geometry({fontWeight:value});wallSetUndo(state,wallCapture(state));state.model.settings.fontWeight=value;state.cache.clear();wallQueue(state);wallRemember(state);}}else if(input.hasAttribute('aria-invalid')){input.value=state.model.settings[key];input.removeAttribute('aria-invalid');}});
 }
 win.querySelectorAll('[data-wall-color]').forEach(button=>button.onclick=()=>{state.model.color=Number(button.dataset.wallColor);wallSyncControls();wallRemember(state);});
 win.querySelectorAll('[data-wall-mode]').forEach(button=>button.onclick=()=>wallToggleMode(state));
 win.querySelectorAll('[data-wall-action]').forEach(button=>button.onclick=()=>{
  const action=button.dataset.wallAction;
  if(action==='undo')wallUndo(state);
  if(action==='bucket'){if(state.model.cells.some((char,index)=>state.model.colors[index]!==state.model.color||state.model.bucket&&char!==state.model.bucket)){wallSetUndo(state,wallCapture(state));state.model.fill();wallQueue(state);wallRemember(state);}}
  if(action==='desk'&&state.model.settings.mode==='pc'){wallSetUndo(state,wallCapture(state));prefs.wallpaper=state.model.serialize();persistProfiles();wallDesktop();toast('Applied to desktop');}
  if(action==='save')wallSave(state);if(action==='save-as')wallSave(state,true);if(action==='open')wallPicker(state,'open');if(action==='quit')wallClose(state.win);
 });wallSyncControls();
}
function wallPickerFilter(name,value){value=value.trim().toLowerCase();if(!value||value==='.*all')return true;name=name.toLowerCase();if(value.startsWith('*.'))return name.endsWith(value.slice(1));if(value.startsWith('.'))return name.endsWith(value);return name===value;}
function wallPicker(state,mode,onSaved){
 wallClose(state.picker);
 if(mode==='save'){const source=prefs.entries.find(e=>e.name===state.file);const win=openSaveFileDialog({key:'wall:picker:save',initialPath:source?.parent||'/house',filename:state.file?fileLeafName(state.file):wallDefaultName(state),extensions:applicationFileFormats.BERLIN,onSave:(path,name)=>wallSaveTo(state,path,name,onSaved)});state.picker=win;wallAux(win);win.dataset.wallPicker='save';return win;}
 const win=createWindow('wall:picker:'+mode,'/house','folder','<div class="wall-chooser-list" role="listbox" tabindex="0"></div><footer class="wall-picker-footer"><input aria-label="'+(mode==='save'?'File name':'File filter')+'"><button>'+mode+'</button></footer>');
 state.picker=win;wallAux(win);win.classList.add('wall-file-dialog');win.dataset.wallPicker=mode;win.dataset.codeFileKey='wall:picker';win.wallHistory={paths:['/house'],index:0};win.wallPath='/house';win.wallSelected=null;
 const bar=document.createElement('div');bar.className='folder-header-actions';
 for(const [key,label]of [['back','Back'],['forward','Forward'],['up','Up'],['new','New folder']]){
  const button=document.createElement('button');button.title=label;button.innerHTML=cssIcon(key);button.onpointerdown=e=>e.stopPropagation();button.ondblclick=e=>e.stopPropagation();button.onclick=()=>{
   if(key==='new'){if(wallCanEnter(win.wallPath,()=>button.click())){newFolderEntry(win.wallPath,null);render();focusWindow(win);}return;}
   if(key==='up'){navigate(win.wallPath.slice(0,win.wallPath.lastIndexOf('/'))||'/house');return;}
   const h=win.wallHistory,next=h.index+(key==='back'?-1:1);if(next>=0&&next<h.paths.length)navigate(h.paths[next],next);
  };bar.append(button);
 }
 win.querySelector('.window-title').after(bar);
 const editor=document.createElement('textarea');editor.className='house-code';editor.value='/house';win.querySelector('.titlebar').append(editor);setupCodeEditor(win);
 win.querySelector('.code-surface').addEventListener('keydown',event=>{if(event.key!=='ArrowDown')return;event.preventDefault();event.stopImmediatePropagation();const path=win.querySelector('.code-line').textContent.trim();if(navigate(path))toggleCode(win,false);},true);
 win.querySelector('.window-title').ondblclick=event=>{event.stopPropagation();toggleCode(win);};
 const input=win.querySelector('footer input'),list=win.querySelector('.wall-chooser-list');input.value=mode==='save'?(state.file?fileLeafName(state.file):wallDefaultName(state)):'.*all';
 function navigate(path,replay){
  path=folderPath(path.replaceAll('\\','/').replace(/\/+$/,'')||'/house');if(path!=='/house'&&!prefs.entries.some(e=>e.folder&&folderPath(e.name)===path)){warning('Folder not found.');return false;}
  if(!wallCanEnter(path,()=>navigate(path,replay)))return false;
  win.wallPath=path;win.wallSelected=null;const h=win.wallHistory;if(replay!==undefined)h.index=replay;else if(h.paths[h.index]!==path){h.paths=h.paths.slice(0,h.index+1);h.paths.push(path);h.index++;}render();return true;
 }
 function render(){
  win.querySelector('.window-title span').textContent='/'+win.wallPath.split('/').at(-1);win.querySelector('.window-title').title=win.wallPath;list.replaceChildren();
  for(const entry of prefs.entries.filter(e=>e.parent===win.wallPath&&(e.folder||wallSupported(e)&&(mode==='save'||wallPickerFilter(e.name,input.value))))){
   const row=document.createElement('button');row.className='file';row.setAttribute('role','option');row.setAttribute('aria-selected','false');row.dataset.wallEntry=entry.name;row.innerHTML=icon(entry.folder?'folder':'wall')+'<span>'+escapeHTML((entry.folder?'/':'')+fileLeafName(entry.name))+'</span>';
   row.onclick=()=>{list.querySelectorAll('.selected').forEach(node=>{node.classList.remove('selected');node.setAttribute('aria-selected','false');});row.classList.add('selected');row.setAttribute('aria-selected','true');win.wallSelected=entry.name;if(mode==='save'&&!entry.folder)input.value=fileLeafName(entry.name);};
   row.ondblclick=()=>{if(entry.folder)navigate(folderPath(entry.name));else if(mode==='open')wallOpenEntry(entry);else wallSaveTo(state,win.wallPath,input.value);};list.append(row);
  }
  list.style.gridTemplateRows='repeat('+Math.max(1,Math.floor(list.clientHeight/56))+',56px)';
 }
 input.oninput=()=>{if(mode==='open'){win.wallSelected=null;render();}};
 function commit(){if(mode==='save'){if(win.querySelector('footer button').disabled)return;wallSaveTo(state,win.wallPath,input.value);return;}const entry=prefs.entries.find(e=>e.parent===win.wallPath&&e.name===(win.wallSelected||input.value.trim())&&wallSupported(e));if(entry)wallOpenEntry(entry);else warning('Select a WALL file.');}
 input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();commit();}};win.querySelector('footer button').onclick=commit;list.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();const entry=prefs.entries.find(item=>item.name===win.wallSelected);if(entry?.folder)navigate(folderPath(entry.name));else commit();}};
 observeWindowResize(win,list,()=>{list.style.gridTemplateRows='repeat('+Math.max(1,Math.floor(list.clientHeight/56))+',56px)';});render();input.focus();return win;
}
function openWall(restore=true){
 if(wallState?.win.isConnected){wallState.win.hidden=false;focusWindow(wallState.win);return wallState;}
 let model,file=null;const last=restore?(prefs.wallLastFile?prefs.entries.find(e=>e.name===prefs.wallLastFile&&wallSupported(e)):prefs.entries.filter(e=>e.wall&&e.modified&&wallSupported(e)).sort((a,b)=>b.modified-a.modified)[0]):null;
 if(last&&!wallCanEnter(last.parent,()=>openWall()))return;
 if(last){try{model=new WallDocument(JSON.parse(prefs.content?.[last.name]||''));file=last.name;prefs.wallLastFile=file;persistProfiles();}catch{warning('Unable to open the last saved WALL file.');}}
 if(!model)try{model=prefs.wallDraft?new WallDocument(prefs.wallDraft):new WallDocument();}catch{model=new WallDocument();}
 const win=createWindow('app:BERLIN','BERLIN','wall','<canvas class="wall-canvas" width="1920" height="1080" tabindex="0" aria-label="BERLIN character canvas"></canvas><div class="wall-letter-prompt" hidden><span></span></div>');win.classList.add('wall-app');win.dataset.ownerApp='BERLIN';Object.assign(win.style,{left:'0px',top:'0px',width:'1920px',height:'1080px'});
 const canvas=win.querySelector('canvas'),state={win,canvas,model,cache:new Map(),dirty:new Set(),full:true,frame:0,file,modeFiles:{[model.settings.mode]:file},modeDrafts:{},controls:null,picker:null,last:null,pointer:null,undo:null,strokeBefore:null,strokeChanged:false};wallState=state;
 const close=win.querySelector('[data-win=close]'),previous=close.onclick;close.onclick=()=>{const finish=()=>{wallHideLetter(state);wallRemember(state);if(state.frame)cancelAnimationFrame(state.frame);wallOwnedClose();wallState=null;previous();renderTaskbar();};wallUpdateSaveButton(state,state.model.serialize());if(state.wallDirty)confirmDocumentClose(state.file?fileLeafName(state.file):'new',done=>wallSave(state,false,done),finish);else finish();};
 const index=event=>{const rect=canvas.getBoundingClientRect();return state.model.hit((event.clientX-rect.left)*state.model.canvasWidth/rect.width,(event.clientY-rect.top)*state.model.canvasHeight/rect.height);};
 function paintStroke(next){const changed=state.model.stroke(state.last,next);if(changed.length&&!state.strokeChanged){wallSetUndo(state,state.strokeBefore);state.strokeChanged=true;}wallQueue(state,changed);state.last=next;}
 canvas.addEventListener('pointerdown',event=>{if(event.button!==0||prefs.entries.find(e=>e.name===state.file)?.readOnly)return;event.preventDefault();focusWindow(win);canvas.focus({preventScroll:true});state.pointer=event.pointerId;state.last=index(event);state.strokeBefore=wallCapture(state);const before=state.strokeBefore,undo=state.undo,tools={brush:state.model.brush,bucket:state.model.bucket,color:state.model.color};window.CabanonGestureCancel?.rollback(()=>{state.model=new WallDocument(before.document);Object.assign(state.model,tools);state.undo=undo;state.cache.clear();prefs.wallpaper=before.wallpaper;wallQueue(state);wallDesktop();wallRemember(state);wallSyncControls();});state.strokeChanged=false;canvas.setPointerCapture(event.pointerId);paintStroke(state.last);});
 canvas.addEventListener('pointermove',event=>{if(state.pointer!==event.pointerId)return;paintStroke(index(event));});
 const release=event=>{if(state.pointer!==event.pointerId)return;state.pointer=null;state.last=null;state.strokeBefore=null;if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);wallRemember(state);};
 for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,release);
 wallQueue(state);canvas.focus({preventScroll:true});renderTaskbar();return state;
}
const wallPriorApp=openApp;openApp=function(name){if(name!=='BERLIN')return wallPriorApp(name);if(prefs.uninstalled.includes(name))return;prefs.usage.BERLIN=(prefs.usage.BERLIN||0)+1;persistProfiles();closePanels();openWall();};
const wallPriorFile=openFile;openFile=function(name,...args){const entry=prefs.entries.find(e=>e.name===name);if(entry&&wallSupported(entry))return wallOpenEntry(entry);return wallPriorFile(name,...args);};
const wallPriorCode=toggleCode;toggleCode=function(win,on=!win.classList.contains('code-mode')){if(!win.dataset.wallPicker)return wallPriorCode(win,on);win.classList.toggle('code-mode',on);if(on){win.querySelector('.code-line').textContent=win.wallPath;win.resizeCode();win.querySelector('.code-line').focus();}else win.querySelector('.wall-chooser-list').focus({preventScroll:true});};
const wallPriorGroups=taskGroups;taskGroups=function(){const groups=wallPriorGroups();for(const [type,members]of groups){const filtered=members.filter(item=>!item.win.dataset.wallAux);if(filtered.length)groups.set(type,filtered);else groups.delete(type);}return groups;};
const wallPriorWindowType=windowType;windowType=function(key,win){return win.dataset.ownerApp?'app:'+win.dataset.ownerApp:wallPriorWindowType(key,win);};
const wallPriorTaskbar=renderTaskbar;renderTaskbar=function(){wallPriorTaskbar();if(activeWindow?.dataset.wallAux&&!activeWindow.hidden){const button=taskbar.querySelector('[data-type="app:BERLIN"]');button?.classList.add('current');button?.setAttribute('aria-pressed','true');}};
const wallPriorFocus=focusWindow;focusWindow=function(win){wallPriorFocus(win);if(win===wallState?.win)for(const panel of windowMap.values())if(panel.dataset.wallAux&&!panel.hidden)panel.style.zIndex=++zIndex;};
const wallPriorMove=startWindowMove;startWindowMove=function(win,handle,event){return win.dataset.fixedSize?moveWithoutSnap(win,handle,event):wallPriorMove(win,handle,event);};
window.addEventListener('contextmenu',event=>{
 const state=wallState;if(!state)return;
 if(state.controls?.isConnected){event.preventDefault();event.stopImmediatePropagation();wallClose(state.controls);state.controls=null;return;}
 if(event.target.closest('.wall-app')){event.preventDefault();event.stopImmediatePropagation();const rect=$('#desktop').getBoundingClientRect(),scale=rect.width/1920;wallControls(state,(event.clientX-rect.left)/scale,(event.clientY-rect.top)/scale);}
 else if(event.target.closest('.wall-file-dialog')){event.preventDefault();event.stopImmediatePropagation();}
},true);
window.addEventListener('pointerdown',event=>{if(event.button===0||event.button===2)wallHideLetter(wallState);},true);
window.addEventListener('keydown',event=>{
 const saveState=wallState;if(saveState&&(activeWindow===saveState.win||activeWindow===saveState.controls)&&event.ctrlKey&&!event.altKey&&!event.metaKey&&['s','o'].includes(event.key.toLowerCase())){event.preventDefault();event.stopImmediatePropagation();if(event.key.toLowerCase()==='s')wallSave(saveState,event.shiftKey);else wallPicker(saveState,'open');return;}
 const undoState=wallState;if(undoState&&activeWindow?.dataset.ownerApp==='BERLIN'&&event.ctrlKey&&!event.shiftKey&&!event.altKey&&!event.metaKey&&event.key.toLowerCase()==='z'&&!event.target.closest('input,textarea,[contenteditable="true"]')){event.preventDefault();event.stopImmediatePropagation();if(undoState.pointer===null)wallUndo(undoState);return;}
 const state=wallState;if(!state||activeWindow!==state.win||event.target.closest('input,textarea,[contenteditable="true"]'))return;
 if(event.ctrlKey||event.altKey||event.metaKey||wallLetters(event.key).length!==1)return;
 event.preventDefault();state.model.brush=event.key;wallShowLetter(state,event.key);wallSyncControls();wallRemember(state);
},true);
const wallPriorProfile=refreshUserIcon;refreshUserIcon=function(){if(wallState){wallHideLetter(wallState);if(wallState.frame)cancelAnimationFrame(wallState.frame);wallOwnedClose();wallState=null;}wallPriorProfile();wallDesktop();};
wallDesktop();document.fonts.load('800 14px JetBrainsWall').then(()=>{if(wallState){wallState.cache.clear();wallQueue(wallState);}wallDesktop();});
