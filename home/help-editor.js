'use strict';
// HELP documents contain named plain-text pages; editing saves a draft, Save writes a file.
(()=>{
 const legacyOpenHelp=openHelp,editors=new Map();
 const id=()=>crypto.randomUUID();
 let fileMenu=null,fileMenuAnchor=null;
 function dismissFileMenu(){if(!fileMenu)return false;fileMenu.remove();fileMenu=null;fileMenuAnchor?.setAttribute('aria-expanded','false');fileMenuAnchor=null;return true;}
 function updateTitle(state){const label=state.win.querySelector('.window-title>span'),name=filename(state);if(label&&!label.querySelector('input')){label.textContent=name;label.title=name;}state.win.setAttribute('aria-label',name);}
 function menuAction(parent,label,action,disabled=false){const button=document.createElement('button');button.type='button';button.textContent=label;button.disabled=disabled;button.setAttribute('role','menuitem');button.onpointerdown=event=>event.preventDefault();button.onclick=()=>{dismissFileMenu();action();};parent.append(button);return button;}
 function openFileDialog(state){commit(state);showPage(state);CabanonStorage.refresh();const win=freshWindow('help-open:'+id(),'open...','help-app','<form class="txt-option-dialog"></form>');win.classList.add('txt-open-dialog');win.dataset.helpOpen='true';Object.assign(win.style,{width:'700px',height:'560px'});const form=win.querySelector('form'),nav=document.createElement('div'),up=document.createElement('button'),label=document.createElement('span'),list=document.createElement('div'),open=document.createElement('button');let path=entryFor(state)?.parent||'/house',selected=null;up.type='button';up.textContent='↑';up.setAttribute('aria-label','Up');nav.append(up,label);list.className='txt-open-list';list.setAttribute('role','listbox');open.textContent='open';open.type='submit';form.append(nav,list,open);form.addEventListener('keydown',event=>event.stopPropagation());
  const choose=()=>{const entry=selected&&prefs.entries.find(e=>e.id===selected.id);if(!entry)return;closeShortcutWindow(win);recordRecent(entry.name);openDocument(entry);};
  const draw=()=>{label.textContent=path;selected=null;open.disabled=true;up.disabled=path==='/house';list.replaceChildren();for(const entry of entriesForFolder(path).filter(e=>e.folder||!e.shortcut&&knownFileExtension(e.name)==='.help')){const button=document.createElement('button');button.type='button';button.className='file';button.setAttribute('role','option');button.setAttribute('aria-selected','false');button.innerHTML=icon(entry.folder?'folder':'help-app')+'<span></span>';button.querySelector('span').textContent=(entry.folder?'/':'')+fileLeafName(entry.name);button.title=entry.name;button.onclick=()=>{if(entry.folder){if(wallCanEnter(entry.name,()=>{path=entry.name;draw();})){path=entry.name;draw();}return;}selected=entry;open.disabled=false;list.querySelectorAll('[role=option]').forEach(row=>row.setAttribute('aria-selected',String(row===button)));};button.ondblclick=()=>{if(!entry.folder){selected=entry;choose();}};list.append(button);}};
  up.onclick=()=>{path=path.slice(0,path.lastIndexOf('/'))||'/house';draw();};form.onsubmit=event=>{event.preventDefault();choose();};draw();
 }
 function showFileMenu(state,anchor){if(fileMenuAnchor===anchor){dismissFileMenu();return;}dismissFileMenu();window.CabanonTxtMenus?.dismiss();focusWindow(state.win);fileMenuAnchor=anchor;anchor.setAttribute('aria-expanded','true');fileMenu=document.createElement('div');fileMenu.className='txt-menu help-file-menu';fileMenu.setAttribute('role','menu');fileMenu.setAttribute('aria-label','file');
  menuAction(fileMenu,'new file',()=>{commit(state);openDocument(null,true);});menuAction(fileMenu,'open...',()=>openFileDialog(state));
  const wrap=document.createElement('div');wrap.className='txt-recent-wrap';fileMenu.append(wrap);const recent=menuAction(wrap,'recent >',()=>{});recent.setAttribute('aria-haspopup','menu');let sub=null;
  const showRecent=()=>{if(sub)return;sub=document.createElement('div');sub.className='txt-recent-menu';sub.setAttribute('role','menu');wrap.append(sub);const entries=[...(prefs.recents||[])].sort((a,b)=>b.lastUsed-a.lastUsed).map(r=>prefs.entries.find(e=>e.name===r.name&&!e.folder&&!e.shortcut&&knownFileExtension(e.name)==='.help')).filter(Boolean).filter((e,i,all)=>all.findIndex(other=>other.id===e.id)===i).slice(0,12);for(const entry of entries)menuAction(sub,fileLeafName(entry.name),()=>{commit(state);recordRecent(entry.name);openDocument(entry);}).title=entry.name;if(!entries.length)menuAction(sub,'no recent files',()=>{},true);if(sub.getBoundingClientRect().right>$('#desktop').getBoundingClientRect().right){sub.style.left='auto';sub.style.right='100%';}};
  recent.onclick=showRecent;recent.onfocus=showRecent;wrap.onpointerenter=showRecent;wrap.onpointerleave=()=>{sub?.remove();sub=null;};
  state.save=menuAction(fileMenu,'save',()=>saveCurrent(state));state.save.dataset.helpSaveCurrent='';updateSaved(state);menuAction(fileMenu,'save...',()=>saveDialog(state)).dataset.helpSaveAs='';menuAction(fileMenu,'close',()=>closeShortcutWindow(state.win));menuAction(fileMenu,'quit',()=>closeDocumentWindows([...editors.values()].filter(s=>s.user===prefs.user&&s.win.isConnected).map(s=>s.win)));
  const desktop=$('#desktop'),r=anchor.getBoundingClientRect(),d=desktop.getBoundingClientRect(),scale=d.width/desktop.offsetWidth;desktop.append(fileMenu);fileMenu.style.left=Math.max(0,Math.min(desktop.clientWidth-fileMenu.offsetWidth,(r.left-d.left)/scale))+'px';fileMenu.style.top=Math.max(0,Math.min(desktop.clientHeight-fileMenu.offsetHeight,(r.bottom-d.top)/scale))+'px';
 }
 document.addEventListener('pointerdown',event=>{if(fileMenu&&!fileMenu.contains(event.target)&&!fileMenuAnchor?.contains(event.target))dismissFileMenu();},true);
 addEventListener('blur',dismissFileMenu);addEventListener('resize',dismissFileMenu);
 function textTools(state){
  if(!state.document.sections.some(section=>section.id===state.selected))return null;
  if(!state.editor)beginText(state,true);if(!state.editor)return null;
  if(state.textTools?.input===state.editor.input)return state.textTools;
  state.find?.remove();const find=document.createElement('section');find.className='txt-find help-find';find.hidden=true;find.innerHTML='<div class="txt-find-row"><input data-query aria-label="Search"><button data-next>search</button></div><div class="txt-find-row" data-replace-row><input data-replacement aria-label="Replace with"><button data-replace-one>replace</button><button data-replace-all>all replace</button></div><div class="txt-find-feedback" role="status"></div>';state.paper.before(find);state.find=find;
  const section=state.editor.section,s={help:true,win:state.win,user:state.user,sourceId:state.sourceId,input:state.editor.input,find,query:find.querySelector('[data-query]'),replacement:find.querySelector('[data-replacement]'),replaceRow:find.querySelector('[data-replace-row]'),feedback:find.querySelector('.txt-find-feedback'),syntax:false,caseSensitive:false,onUpdate:()=>{section.text=s.input.value;draft(state);}};state.textTools=s;
  find.querySelector('[data-next]').onclick=()=>CabanonTXT.findNext(s);find.querySelector('[data-replace-one]').onclick=()=>CabanonTXT.replace(s);find.querySelector('[data-replace-all]').onclick=()=>CabanonTXT.replace(s,true);s.query.oninput=()=>CabanonTXT.changed(s);s.query.onkeydown=event=>{event.stopPropagation();if(event.key==='Enter'){event.preventDefault();CabanonTXT.findNext(s,event.shiftKey);}};s.input.oninput=()=>CabanonTXT.changed(s);s.input.readOnly=!editable(state);CabanonTxtMenus.applySettings(s);return s;
 }
 function plainArticle(article){const copy=article.cloneNode(true);for(const input of copy.querySelectorAll('input,select,textarea'))input.replaceWith(document.createTextNode(input.value));copy.style.cssText='position:fixed;left:-10000px;top:0;width:800px;opacity:0;pointer-events:none';document.body.append(copy);const text=copy.innerText||'';copy.remove();return text;}
 function seed(){const win=legacyOpenHelp(),nav=win.querySelector('.help-reader nav'),article=win.querySelector('.help-reader article'),sections=[];for(const button of [...nav.children]){button.click();sections.push({id:id(),title:button.textContent.trim(),text:plainArticle(article)});}const first=sections.find(s=>s.title==='Cabanon');if(first&&!first.text.trim())first.text='cabanon\n\nSelect a topic on the left. Double-click a topic to rename it. Double-click blank space in the page to edit plain text. Leaving the editor saves your draft. Use save to write the current file, or save... to save a copy at another path.';return {win,document:{format:'cabanon-help',version:1,sections}};}
 function decode(raw,fallback){if(!raw)return {format:'cabanon-help',version:1,sections:[]};try{const value=typeof raw==='string'?JSON.parse(raw):raw;if(value.format==='cabanon-help'&&Array.isArray(value.sections))return {format:'cabanon-help',version:1,sections:value.sections.map(s=>({id:typeof s.id==='string'?s.id:id(),title:String(s.title||'Untitled'),text:String(s.text||'')}))};}catch{}return {format:'cabanon-help',version:1,sections:[{id:id(),title:fallback,text:String(raw)}]};}
 const clone=value=>JSON.parse(JSON.stringify(value));
 function mapSpellsTopic(){return {id:'map-spells',title:'map spells',text:`map spells

MAP 单一搜索框语法约定。WHERE 第一版以图恩验证部分操作；以下完整设计并非全部已实现。
地点、地址、类别和条件值用文字；关系、操作和比较用符号。
比较符号只使用键盘字符 <、<=、=、>、>=；<= 和 >= 的两个字符必须连续输入，不替换成数学字形。比较写在 :条件名 后；条件之外的 > 表示路线。

关系与操作

>  前往、按顺序经过
A > B > C
从 A 出发，经过 B，抵达 C。

/  区域内搜索
A /酒店
搜索 A 区域内的酒店。

*  按交通可达性搜索
A *酒店 :地铁 :耗时<=30分钟
寻找按指定交通方式、在规定时间内能抵达 A 的酒店。抵达方向是酒店 → A。

~  沿路线搜索
A > B ~咖啡馆
搜索 A 到 B 沿途的咖啡馆。沿途范围、允许绕路时间需要条件或明确的默认规则。

&  多个出发点共同寻找目的地
A & B
A、B 是多个独立出发点；不表示先去 A 再去 B。
& 本身不代表方便、公平或最快。交通方式、各自耗时上限和结果排序需要另设条件或明确的默认规则。
可按总耗时最少，或按耗时最长的一方尽量快到达进行排序。耗时相近不能单独作为优化目标。

!  排除
A /酒店 !青旅
在结果中排除青旅。

:  引入条件
A > B :步行
步行从 A 到 B。
A > B :步行 > C :地铁
A 到 B 步行，B 到 C 使用地铁。
条件跟在它修饰的路线段或搜索操作后，持续到下一个关系操作；条件内部的比较符号不开始新路线。

=  等于、指定值
:换乘=0
不换乘。

<、<=  少于／不超过、早于／不晚于
:耗时<=30分钟
:到达<09:00

>、>=  多于／不少于、晚于／不早于
:出发>=18:00
地点之间的 > 表示路线；条件名后面的 > 表示比较。

|  或者、允许任选其一
:地铁|公交
允许地铁或公交。是否允许混合换乘需要明确约定。

组织语法

"…"  完整名称
"A&B Hotel"
引号内的符号是地点名称的一部分，不作为操作解析。
选定搜索结果后，地点作为完整对象处理，不再解析名称中的符号。

(…)  分组
(A & B)
把多个地点或条件组织成一组。

文字条件

步行、地铁、公交、驾车、酒店，以及出发、到达、耗时、换乘等名称保留文字。
时间必须标明比较对象：出发时间、到达时间或耗时，不能只写一个没有对象的时间。
地铁优先与只允许地铁是不同条件，执行规则需要明确；无符合条件的路线时不能悄悄换成其他方式。
输入符号可提供补全选项，并显示解析后的地点、路线段、条件及其作用范围。
营业、分类、排除项和交通时间等筛选，以数据与路线服务实际提供的能力为准。
`};}
 function updateMapSpellsHelp(model,entry){
  if(entry?.name?.toLowerCase()!=='/house/cabanon.help'||entry.readOnly||prefs.helpTopicUpdates?.mapSpells===3)return;
  const topic=mapSpellsTopic(),asciiRule='比较符号只使用键盘字符 <、<=、=、>、>=；<= 和 >= 的两个字符必须连续输入，不替换成数学字形。比较写在 :条件名 后；条件之外的 > 表示路线。',upgrade=sections=>{const existing=sections.find(s=>s.id===topic.id||s.title===topic.title);if(!existing){sections.push(clone(topic));return;}existing.text=existing.text.replace('MAP 单一搜索框语法约定。以下记录已讨论的设计，地图搜索与路线服务尚待接入。','MAP 单一搜索框语法约定。WHERE 第一版以图恩验证部分操作；以下完整设计并非全部已实现。');if(!existing.text.includes(asciiRule))existing.text+='\n\n'+asciiRule;};upgrade(model.sections);
  const raw=prefs.content[entry.name],stored=raw?decode(raw,'Cabanon'):clone(model);
  upgrade(stored.sections);
  prefs.content[entry.name]=JSON.stringify(stored);entry.modified=Date.now();
  (prefs.helpTopicUpdates||={}).mapSpells=3;
 }
 function entryFor(state){return prefs.entries.find(e=>e.id===state.sourceId);}
 function editable(state){return state.user===prefs.user&&!entryFor(state)?.readOnly;}
 function updateSaved(state){const model=clone(state.document);if(state.editor){const section=model.sections.find(s=>s.id===state.editor.section.id);if(section)section.text=state.editor.input.value;}if(state.rename){const section=model.sections.find(s=>s.id===state.rename.section.id);if(section)section.title=state.rename.input.value.trim();}setFileSaveButton(state.save,state.savedSignature===JSON.stringify(model));if(!editable(state))state.save.disabled=true;}
 function draft(state){if(state.user!==prefs.user)return;prefs.helpDrafts ||= {};prefs.helpDrafts[state.draftKey]={document:clone(state.document),selected:state.selected,sourceId:state.sourceId||null};updateSaved(state);persistProfiles();}
 function commit(state){if(state.editor){const {input,section}=state.editor;section.text=input.value;state.editor=null;draft(state);}if(state.rename){const {input,section}=state.rename;const title=input.value.trim();if(title)section.title=title;state.rename=null;draft(state);}}
 function showPage(state){state.find?.remove();state.find=null;state.textTools=null;state.paper.replaceChildren();const section=state.document.sections.find(s=>s.id===state.selected);if(!section)return;const pre=document.createElement('pre');pre.className='help-plain-text';pre.textContent=section.text;const settings=prefs.helpTextSettings;if(settings)Object.assign(pre.style,{fontFamily:settings.font+',SourceHan,sans-serif',fontSize:settings.size+'px',lineHeight:String(settings.line)});state.paper.append(pre);}
 function select(state,section){commit(state);state.selected=section.id;for(const button of state.list.children)button.setAttribute('aria-pressed',String(button.dataset.sectionId===state.selected));showPage(state);topicControls(state);draft(state);}
 function renderList(state){state.list.replaceChildren();for(const section of state.document.sections){const button=document.createElement('button');button.className='help-topic';button.dataset.sectionId=section.id;button.textContent=section.title;button.setAttribute('aria-pressed',String(section.id===state.selected));button.onclick=()=>{if(state.selected!==section.id)select(state,section);};button.ondblclick=event=>{event.preventDefault();renameSection(state,section,button);};state.list.append(button);}state.remove.disabled=!state.document.sections.length||!editable(state);state.add.disabled=!editable(state);topicControls(state);updateSaved(state);}
 function renameSection(state,section,button){if(!editable(state))return warning('Read only');commit(state);state.selected=section.id;showPage(state);const input=document.createElement('input');input.className='help-topic-name';input.setAttribute('aria-label','Topic name');input.value=section.title;state.rename={input,section};input.oninput=()=>updateSaved(state);button.replaceChildren(input);input.onpointerdown=e=>e.stopPropagation();input.onclick=e=>e.stopPropagation();input.ondblclick=e=>e.stopPropagation();input.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();input.blur();}if(e.key==='Escape'){e.preventDefault();state.rename=null;renderList(state);}};input.onblur=()=>{if(state.rename?.input!==input)return;if(!input.value.trim()){state.rename=null;renderList(state);warning('please name it.');return;}commit(state);renderList(state);};input.focus();input.select();}
 function beginText(state,allowReadOnly=false){if(state.editor)return;if(!allowReadOnly&&!editable(state))return warning('Read only');const section=state.document.sections.find(s=>s.id===state.selected);if(!section)return;commit(state);const input=document.createElement('textarea');input.className='help-text-editor';input.setAttribute('aria-label','Help page text');input.value=section.text;input.spellcheck=false;state.editor={input,section};input.oninput=()=>updateSaved(state);state.paper.replaceChildren(input);input.onblur=()=>{if(state.editor?.input!==input||state.textTools?.input===input)return;commit(state);showPage(state);};input.onkeydown=e=>{e.stopPropagation();};input.focus();input.setSelectionRange(input.value.length,input.value.length);}
 function blankPoint(event,paper){if(event.target.closest('button,input,textarea'))return false;const pre=paper.querySelector('pre');if(!pre||!pre.textContent)return true;const range=document.createRange();range.selectNodeContents(pre);return ![...range.getClientRects()].some(r=>event.clientX>=r.left&&event.clientX<r.right&&event.clientY>=r.top&&event.clientY<r.bottom);}
 function topicControls(state){const index=state.document.sections.findIndex(section=>section.id===state.selected),locked=!editable(state);state.up.disabled=locked||index<=0;state.down.disabled=locked||index<0||index>=state.document.sections.length-1;}
 function moveTopic(state,offset){if(!editable(state))return;commit(state);const sections=state.document.sections,index=sections.findIndex(section=>section.id===state.selected),next=index+offset;if(index<0||next<0||next>=sections.length)return;const [section]=sections.splice(index,1);sections.splice(next,0,section);draft(state);renderList(state);state.list.querySelector('[aria-pressed=true]')?.scrollIntoView({block:'nearest'});}
 function attachTopicDrag(state){
  let drag=null,frame=0,skipClick=false;
  function place(){if(!drag?.moved)return;const sections=state.document.sections,source=sections.find(section=>section.id===drag.id);if(!source)return;const others=sections.filter(section=>section!==source),rows=[...state.list.children].filter(row=>row.dataset.sectionId!==drag.id);let index=rows.findIndex(row=>{const r=row.getBoundingClientRect();return drag.y<r.top+r.height/2;});if(index<0)index=others.length;const next=[...others.slice(0,index),source,...others.slice(index)];if(next.some((section,i)=>section!==sections[i])){state.document.sections=next;const scroll=state.list.scrollTop;renderList(state);state.list.scrollTop=scroll;}state.list.querySelector(`[data-section-id="${drag.id}"]`)?.classList.add('help-topic-dragging');}
  function scroll(){if(!drag?.moved)return;const r=state.list.getBoundingClientRect(),delta=drag.y<r.top+28?-8:drag.y>r.bottom-28?8:0;if(delta){state.list.scrollTop+=delta;place();}frame=requestAnimationFrame(scroll);}
  function finish(cancel=false){const pending=drag;if(!pending)return;drag=null;cancelAnimationFrame(frame);frame=0;if(state.list.hasPointerCapture(pending.pointerId))state.list.releasePointerCapture(pending.pointerId);if(!pending.moved)return;skipClick=true;if(cancel){state.document.sections=pending.order;state.selected=pending.selected;state.list.scrollTop=pending.scroll;}draft(state);renderList(state);if(cancel)showPage(state);}
  state.list.addEventListener('pointerdown',event=>{skipClick=false;const row=event.target.closest('.help-topic');if(event.button!==0||!row||event.target.closest('input')||!editable(state))return;drag={id:row.dataset.sectionId,x:event.clientX,y:event.clientY,startY:event.clientY,pointerId:event.pointerId,moved:false,order:[...state.document.sections],selected:state.selected,scroll:state.list.scrollTop};CabanonGestureCancel.rollback(()=>finish(true));});
  state.list.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.pointerId)return;drag.y=event.clientY;if(!drag.moved){if(Math.hypot(event.clientX-drag.x,event.clientY-drag.startY)<6)return;commit(state);const section=state.document.sections.find(section=>section.id===drag.id);if(!section){finish(true);return;}drag.moved=true;select(state,section);state.list.setPointerCapture(event.pointerId);frame=requestAnimationFrame(scroll);}event.preventDefault();place();});
  state.list.addEventListener('pointerup',()=>finish());state.list.addEventListener('pointercancel',()=>finish(true));
  state.list.addEventListener('click',event=>{if(skipClick){event.preventDefault();event.stopImmediatePropagation();skipClick=false;}},true);
  addEventListener('blur',event=>{if(event.target===window)finish(true);});
 }
 function filename(state){return fileLeafName(entryFor(state)?.name||defaultNewEntryName('help'));}
 function saveCurrent(state,onSaved){commit(state);showPage(state);if(state.user!==prefs.user)return;const entry=entryFor(state);if(!entry)return saveDialog(state,onSaved);if(entry.readOnly)return warning('Read only');prefs.content[entry.name]=JSON.stringify(state.document);entry.modified=Date.now();updateTitle(state);state.savedSignature=JSON.stringify(state.document);draft(state);recordRecent(entry.name);refreshBrowsers(entry.parent);renderDesktop();onSaved?.();}
 function saveDialog(state,onSaved){commit(state);showPage(state);if(state.user!==prefs.user)return;const source=entryFor(state);let win;win=openSaveFileDialog({key:'help-save:'+state.draftKey,initialPath:source?.parent||'/house',filename:filename(state),extensions:applicationFileFormats['HELP'],onSave:(path,value)=>{const input={value};let name=CabanonFilenames.require(input.value,false);if(name===null)return;if(!name.toLowerCase().endsWith('.help'))name+='.help';name=CabanonFilenames.require(name,false);if(name===null)return;const full=path+'/'+name,target=prefs.entries.find(e=>e.parent===path&&CabanonFilenames.key(fileLeafName(e.name))===CabanonFilenames.key(name));if(target?.folder)return warning('A folder already has this name.');if(target?.readOnly)return warning('Read only');
   const write=()=>{if(state.user!==prefs.user)return;const content=JSON.stringify(state.document);const entry=target||CabanonCreation.create(path,{name,content,reveal:false});if(!entry)return;if(target){prefs.content[entry.name]=content;entry.modified=Date.now();}const oldKey=state.draftKey;state.sourceId=entry.id;state.draftKey=entry.id;prefs.helpDrafts ||= {};if(oldKey!==state.draftKey)delete prefs.helpDrafts[oldKey];updateTitle(state);state.win.dataset.sourceId=entry.id;state.savedSignature=JSON.stringify(state.document);draft(state);recordRecent(entry.name);refreshBrowsers(path);renderDesktop();win.querySelector('[data-win=close]').click();focusWindow(state.win);onSaved?.();};
   if(target&&target.id!==state.sourceId)confirmRemoval('replace '+fileLeafName(target.name),write);else write();
  }});win.dataset.helpSave='true';return win;}
 function updateRiverHelp(model,entry){
  if(entry?.name!=='/house/Cabanon.help'||entry.readOnly||prefs.helpTopicUpdates?.riverRepost===1)return;
  const topic=riverHelpTopic();if(!model.sections.some(s=>s.id===topic.id))model.sections.push(clone(topic));
  const raw=prefs.content[entry.name];if(raw){const stored=decode(raw,'Cabanon');if(!stored.sections.some(s=>s.id===topic.id))stored.sections.push(clone(topic));prefs.content[entry.name]=JSON.stringify(stored);entry.modified=Date.now();}
  (prefs.helpTopicUpdates||={}).riverRepost=1;
 }
 function updatePointerRangeHelp(model,entry){
  if(entry?.name!=='/house/Cabanon.help'||entry.readOnly||prefs.helpTopicUpdates?.pointerRanges===1)return;
  const topic=folderPointerHelpTopic();if(!model.sections.some(s=>s.id===topic.id))model.sections.push(clone(topic));
  const raw=prefs.content[entry.name];if(raw){const stored=decode(raw,'Cabanon');if(!stored.sections.some(s=>s.id===topic.id))stored.sections.push(clone(topic));prefs.content[entry.name]=JSON.stringify(stored);entry.modified=Date.now();}
  (prefs.helpTopicUpdates||={}).pointerRanges=1;
 }
 function openDocument(entry=null,isNew=false){CabanonStorage.refresh();const draftKey=isNew?'draft:'+id():entry?.id||'default',user=prefs.user;const existing=[...editors.values()].find(s=>s.user===user&&s.draftKey===draftKey&&s.win.isConnected);if(existing){existing.win.hidden=false;focusWindow(existing.win);return existing.win;}
  const saved=prefs.helpDrafts?.[draftKey];let model=saved?.document&&decode(saved.document,''),legacy;
  if(!model){const raw=entry?prefs.content[entry.name]:'';if(!isNew&&!raw&&fileLeafName(entry?.name||'Cabanon.help').toLowerCase()==='cabanon.help'){legacy=seed();model=legacy.document;}else model=decode(raw,entry?fileLeafName(entry.name):'Untitled');}
  if(!isNew){updateRiverHelp(model,entry);updatePointerRangeHelp(model,entry);updateMapSpellsHelp(model,entry);if(entry?.name==='/house/Cabanon.help'&&typeof crossAppDragHelpTopic==='function'){const topic=crossAppDragHelpTopic();if(!model.sections.some(s=>s.id===topic.id))model.sections.push(clone(topic));const extra='\n\nRIVER、rive、MARATHON → TXT\n按住右键拖到 TXT 正文区，会在当前光标位置插入 ID、时间和正文，全部是纯文本。MARATHON 有选区时拖选区，否则拖整篇。原文保留，可撤销；只读 TXT 不接收。';const existing=model.sections.find(s=>s.id===topic.id);if(existing&&!existing.text.includes('RIVER、rive、MARATHON → TXT'))existing.text+=extra;if(!entry.readOnly&&prefs.helpTopicUpdates?.crossAppDrag!==2){const raw=prefs.content[entry.name],stored=raw?decode(raw,'Cabanon'):clone(model);if(!stored.sections.some(s=>s.id===topic.id))stored.sections.push(clone(topic));const savedTopic=stored.sections.find(s=>s.id===topic.id);if(savedTopic&&!savedTopic.text.includes('RIVER、rive、MARATHON → TXT'))savedTopic.text+=extra;prefs.content[entry.name]=JSON.stringify(stored);entry.modified=Date.now();(prefs.helpTopicUpdates||={}).crossAppDrag=2;}}}
  if(isNew)model.sections=[{id:id(),title:'Untitled',text:''}];const key=isNew?'help-draft:'+draftKey:entry&&fileLeafName(entry.name).toLowerCase()!=='cabanon.help'?'help-file:'+entry.id:'app:HELP';const previous=editors.get(key);if(previous?.win.isConnected&&previous.user!==user)closeShortcutWindow(previous.win);
  const win=legacy?.win||createWindow(key,'HELP','help-app','');win.classList.add('help-editor-window');win.dataset.ownerApp='HELP';win.dataset.sourceId=entry?.id||'';const content=win.querySelector('.window-content');content.innerHTML='<div class="help-document"><aside class="help-topic-sidebar"><div class="help-topic-controls"><button data-topic-add aria-label="Add topic">+</button><button data-topic-remove aria-label="Remove topic">−</button><button data-topic-up aria-label="Move topic up">↑</button><button data-topic-down aria-label="Move topic down">↓</button></div><nav class="help-topic-list" aria-label="Help topics"></nav></aside><main class="help-page"><article class="help-page-paper"></article></main></div>';
  const state={win,user,sourceId:entry?.id||null,draftKey,document:model,selected:saved?.selected||model.sections[0]?.id,list:content.querySelector('nav'),paper:content.querySelector('article'),add:content.querySelector('[data-topic-add]'),remove:content.querySelector('[data-topic-remove]'),up:content.querySelector('[data-topic-up]'),down:content.querySelector('[data-topic-down]'),save:document.createElement('button')};if(!model.sections.some(s=>s.id===state.selected))state.selected=model.sections[0]?.id;editors.set(key,state);try{const stored=entry&&JSON.parse(prefs.content[entry.name]);if(stored?.format==='cabanon-help')state.savedSignature=JSON.stringify(decode(stored,''));}catch{}updateTitle(state);
  state.add.onclick=()=>{if(!editable(state))return;commit(state);const section={id:id(),title:'Untitled',text:''};state.document.sections.push(section);state.selected=section.id;draft(state);renderList(state);showPage(state);renameSection(state,section,state.list.lastElementChild);};state.remove.onclick=()=>{if(!editable(state))return;commit(state);const index=state.document.sections.findIndex(s=>s.id===state.selected);if(index<0)return;state.document.sections.splice(index,1);state.selected=state.document.sections[Math.min(index,state.document.sections.length-1)]?.id;draft(state);renderList(state);showPage(state);};
  state.up.onclick=()=>moveTopic(state,-1);state.down.onclick=()=>moveTopic(state,1);attachTopicDrag(state);
  state.paper.ondblclick=event=>{if(blankPoint(event,state.paper)){event.preventDefault();beginText(state);}};
  win.querySelector('.help-header-actions')?.remove();const actions=document.createElement('div');actions.className='folder-header-actions help-header-actions';const file=document.createElement('button');file.type='button';file.textContent='file';file.dataset.helpMenu='file';file.setAttribute('aria-haspopup','menu');file.setAttribute('aria-expanded','false');file.onpointerdown=event=>{event.preventDefault();event.stopPropagation();};file.ondblclick=event=>event.stopPropagation();file.onclick=()=>showFileMenu(state,file);const edit=document.createElement('button');edit.type='button';edit.textContent='edit';edit.dataset.helpMenu='edit';edit.setAttribute('aria-haspopup','menu');edit.setAttribute('aria-expanded','false');edit.onpointerdown=event=>{event.preventDefault();event.stopPropagation();};edit.ondblclick=event=>event.stopPropagation();edit.onclick=()=>{dismissFileMenu();const tools=textTools(state);if(tools)CabanonTxtMenus.showEdit(win,edit,tools);};actions.append(file,edit);win.querySelector('.window-title').after(actions);
  const close=win.querySelector('[data-win=close]'),previousClose=close.onclick;close.onclick=()=>{commit(state);const finish=()=>{dismissFileMenu();draft(state);editors.delete(key);previousClose();};if(editable(state)&&state.savedSignature!==JSON.stringify(state.document))confirmDocumentClose(entryFor(state)?fileLeafName(entryFor(state).name):'new.help',done=>saveCurrent(state,done),finish);else finish();};renderList(state);showPage(state);draft(state);renderTaskbar();focusWindow(win);return win;
 }
 openHelp=function(name){const entry=name?prefs.entries.find(e=>e.name===fileCanonicalName(name)):prefs.entries.find(e=>e.name==='/house/Cabanon.help');return openDocument(entry||null,false);};
 const priorOpenFile=openFile;openFile=function(name,options={}){const full=fileCanonicalName(name,options.sourceList?.dataset.path||activeWindow?.dataset.fileBrowser),entry=prefs.entries.find(e=>e.name===full);if(entry&&!entry.folder&&!entry.shortcut&&knownFileExtension(full)==='.help'){recordRecent(full);return openDocument(entry);}return priorOpenFile(name,options);};
 const priorWindowType=windowType;windowType=function(key,win){return win.dataset.ownerApp==='HELP'?'app:HELP':priorWindowType(key,win);};
 addEventListener('blur',()=>{for(const state of editors.values()){const editing=state.editor||state.rename;if(editing){commit(state);renderList(state);showPage(state);}}});
 addEventListener('beforeunload',()=>{for(const state of editors.values()){commit(state);draft(state);}});
 window.CabanonHelpEditor={newDocument:()=>openDocument(null,true),dismissFileMenu,applyTextSettings:()=>{for(const state of editors.values())if(state.textTools&&state.user===prefs.user)CabanonTxtMenus.applySettings(state.textTools);},dismissSearch:()=>{const state=[...editors.values()].find(s=>s.win===activeWindow);if(!state?.find||state.find.hidden)return false;state.find.hidden=true;state.textTools?.input.focus();return true;}};
})();



