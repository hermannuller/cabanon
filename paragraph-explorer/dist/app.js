const $=s=>document.querySelector(s),surface=$('#surface'),input=$('#input');
const types={docx:['W','#4779b8','#edf4fc','Word'],xlsx:['X','#388664','#edf7f0','Excel'],ppt:['P','#c88155','#fcf2ec','PowerPoint'],jpg:['▧','#9b77b7','#f5effa','照片'],pdf:['A','#c66e72','#fcf0f1','PDF 阅读器'],folder:['▰','#b7964e','#faf5e7','文件夹'],unknown:['?','#87928c','#f2f4f3','未知文件']};
let lastDown=null;let files=[],current='root',view='paragraph',anchor=null,focus=null,selected=new Set(),armed=false,clipboard=null,history=[],navHistory=[],dragIds=[],pointerDown=false,shiftGesture=false,sort='manual';
const uid=()=>crypto.randomUUID(),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ext=f=>f.folder?'folder':(f.saved||f.name).includes('.')?(f.saved||f.name).split('.').pop().toLowerCase():'unknown';
const icon=f=>{const t=types[ext(f)]||types.unknown;return `<span class="icon" data-icon="${f.id}" draggable="true" style="--ink:${t[1]};--tint:${t[2]}" title="${t[3]} · 拖动排列 / 段落中双击选主名">${t[0]}</span>`};
const visible=()=>files.filter(f=>f.parent===current&&f.name.toLowerCase().includes($('#search').value.toLowerCase()));
const find=id=>files.find(f=>f.id===id);
function save(){try{localStorage.setItem('paragraph-explorer-v1',JSON.stringify(files))}catch{}}
function snapshot(){history.push(JSON.stringify(files));if(history.length>100)history.shift()}
function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),2600)}
function generate(){snapshot();files=[];current='root';const names=['项目说明','会议记录','年度预算','品牌视觉','产品路线图','用户研究','现场照片','合同附件','工作计划','市场分析','设计规范','季度复盘','需求清单','活动方案','团队合影','财务报表','灵感收集','交付清单','调研报告','封面设计','产品介绍','测试记录','采购计划','参考资料','设计草稿'];for(let i=0;i<50;i++){const name=names[i%names.length]+(i>=25?'_第二版':'')+'.'+['docx','xlsx','ppt','jpg','pdf'][i%5];files.push({id:uid(),parent:'root',name,saved:name,size:Math.floor(35+Math.random()*8500),date:`2026-10-${String(1+Math.floor(Math.random()*12)).padStart(2,'0')}`,break:i===0?0:i%10===0?2:0})}clearSelection();save();render();toast('已生成 50 个模拟文件')}
function clearSelection(){selected.clear();anchor=focus=null;armed=false;shiftGesture=false}
function range(){if(!anchor||!focus)return null;const list=visible(),a=list.findIndex(f=>f.id===anchor.id),b=list.findIndex(f=>f.id===focus.id);if(a<0||b<0)return null;return {a,b,lo:Math.min(a,b),hi:Math.max(a,b),start:Math.min(anchor.pos,focus.pos),end:Math.max(anchor.pos,focus.pos)}}
function updateSelection(){selected.clear();const r=range();if(!r)return;if(r.a!==r.b){visible().slice(r.lo,r.hi+1).forEach(f=>selected.add(f.id))}else{const f=find(anchor.id);if(r.start===0&&r.end===f.name.length&&r.end>0)selected.add(f.id)}}
function caretAt(id,pos){return focus&&focus.id===id&&focus.pos===pos&&!selected.size&&anchor&&anchor.id===id&&anchor.pos===pos?'<span class="caret"></span>':''}
function render(){const list=visible(),r=range();surface.className=view;document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));$('#modehint').firstElementChild.textContent=view==='paragraph'?'¶ 段落模式':view==='list'?'☷ 列表模式':'☰ 详细信息';$('#sort').value=sort;
 if(view==='paragraph'){surface.innerHTML=list.length?list.map(f=>{let chars=[...f.name].map((c,p)=>`${caretAt(f.id,p)}<span class="char ${r&&r.a===r.b&&anchor.id===f.id&&p>=r.start&&p<r.end?'selected':''}" data-offset="${p}">${esc(c)}</span>`).join('');return `${f.break?`<span class="linebreak ${f.break===2?'double':''}"></span>`:''}<span class="file ${selected.has(f.id)?'chosen':''} ${armed&&selected.has(f.id)?'armed':''} ${clipboard?.cut&&clipboard.ids.includes(f.id)?'cut':''} ${f.error?'invalid':''}" data-id="${f.id}" title="${esc(f.error||'')}">${f.folder?'<span class="folderprefix">/</span>':''}<span class="name">${chars}${caretAt(f.id,f.name.length)}</span>${icon(f)}</span>${f===list.at(-1)&&f.trailingBreak?`<span class="linebreak ${f.trailingBreak===2?'double':''}"></span><span class="trailing-space">&#8203;</span>`:''}`}).join(''):'<div class="empty">这个文件夹还是空的。<br>右键新建文件夹，或粘贴文件到这里。</div>'}
 else if(view==='details'){surface.innerHTML=`<table class="details"><thead><tr><th>名称</th><th>修改日期</th><th>类型</th><th>大小</th></tr></thead><tbody>${list.map(f=>`<tr data-id="${f.id}" class="${selected.has(f.id)?'selected':''}"><td>${icon(f)}${f.folder?'/':''}${esc(f.name)}</td><td>${f.date}</td><td>${f.folder?'文件夹':ext(f).toUpperCase()+' 文件'}</td><td>${f.folder?'—':formatSize(f.size)}</td></tr>`).join('')}</tbody></table>`}
 else surface.innerHTML=`<div class="list-grid">${list.map(f=>`<div class="list-item ${selected.has(f.id)?'selected':''}" data-id="${f.id}">${icon(f)}${f.folder?'/':''}${esc(f.name)}</div>`).join('')}</div>`;
 $('#status').textContent=`${list.length} 个项目${selected.size?' · 已选 '+selected.size+' 个':''}`;$('#selectionstatus').textContent=clipboard?.cut?`已剪切 ${clipboard.ids.length} 个项目 · 选择位置粘贴`:view==='paragraph'?'自由排列 · 自动保存到此浏览器':'双击打开 · 右键管理文件';renderCrumbs()}
function formatSize(n){return n>1024?(n/1024).toFixed(1)+' MB':n+' KB'}
function renderCrumbs(){let chain=[],f=find(current);while(f){chain.unshift(f);f=find(f.parent)}$('#breadcrumbs').innerHTML=`<button data-dir="root">▧ 项目文件</button>`+chain.map(f=>`<span>›</span><button data-dir="${f.id}">${esc(f.name)}</button>`).join('')}
function commit(id){const f=find(id);if(!f||f.name===f.saved)return true;const error=!f.name.trim()?'名称不能为空':/[\\/:*?"<>|]/.test(f.name)||/[. ]$/.test(f.name)?'名称包含无效字符或以点、空格结尾':files.some(x=>x.id!==id&&x.parent===f.parent&&x.name.toLowerCase()===f.name.toLowerCase())?'同一文件夹已有这个名称':'';f.error=error;if(error){toast(error);return false}f.saved=f.name;save();return true}
function inSuffix(point){const f=point&&find(point.id);return f&&!f.folder&&f.name.lastIndexOf('.')>=0&&point.pos>f.name.lastIndexOf('.')}
function moveTo(p,extend=false){if(focus&&(focus.id!==p.id||inSuffix(focus)&&!inSuffix(p)))commit(focus.id);focus=p;if(!extend)anchor={...p};armed=false;updateSelection();render();input.focus({preventScroll:true})}
function pointFromEvent(e){const el=e.target.closest('[data-id]');if(!el)return null;const f=find(el.dataset.id),char=e.target.closest('[data-offset]');if(char){const box=char.getBoundingClientRect();return {id:f.id,pos:Number(char.dataset.offset)+(e.clientX>box.left+box.width/2?1:0)}}return {id:f.id,pos:e.target.closest('.folderprefix')?0:f.name.length}}
let pendingDrag=null,dropSlot=null;
function selectIcon(id){if(focus)commit(focus.id);if(!selected.has(id))selected=new Set([id]);armed=true;anchor=focus=null;render();input.focus()}
surface.addEventListener('pointerdown',e=>{
 if(e.button!==0)return;e.preventDefault();$('#context').hidden=true;
 const el=e.target.closest('[data-id]');if(!el){if(focus)commit(focus.id);clearSelection();render();return}
 const id=el.dataset.id,p=pointFromEvent(e),f=find(id),isIcon=!!e.target.closest('.icon');
 const offset=e.target.closest('[data-offset]');const suffix=!f.folder&&f.name.lastIndexOf('.')>=0&&offset&&Number(offset.dataset.offset)>=f.name.lastIndexOf('.');
 const now=Date.now();if(lastDown&&lastDown.id===id&&now-lastDown.time<350&&Math.abs(e.clientX-lastDown.x)<8&&Math.abs(e.clientY-lastDown.y)<8){lastDown=null;pendingDrag=null;pointerDown=false;if(view==='paragraph')selectBaseName(id);else openFile(id);return}
 lastDown={id,time:now,x:e.clientX,y:e.clientY};
 if(!e.shiftKey&&(isIcon||suffix||selected.has(id))){pendingDrag={id,p,isIcon,x:e.clientX,y:e.clientY,ids:selected.has(id)?[...selected]:[id]};input.focus();return}
 if(view!=='paragraph'){if(e.shiftKey&&focus){const list=visible(),a=list.findIndex(f=>f.id===focus.id),b=list.findIndex(f=>f.id===id);selected=new Set(list.slice(Math.min(a,b),Math.max(a,b)+1).map(f=>f.id))}else if(e.ctrlKey){selected.has(id)?selected.delete(id):selected.add(id)}else{selected=new Set([id]);focus={id,pos:0}}armed=true;render();input.focus();return}
 moveTo(p,e.shiftKey&&!!anchor);pointerDown=true;
});
function insertionSlot(x,y){
 const nodes=[...surface.querySelectorAll('.file')];if(!nodes.length)return null;
 let best=null,distance=Infinity;
 for(const n of nodes){const b=n.getBoundingClientRect();for(const after of [false,true]){const edge=after?b.right:b.left;const dy=y<b.top?b.top-y:y>b.bottom?y-b.bottom:0;const score=dy*dy*16+(x-edge)*(x-edge);if(score<distance){distance=score;best={id:n.dataset.id,after,x:edge,y:b.top,height:b.height}}}}
 return best;
}
function showDrop(slot){document.querySelector('#drop-marker')?.remove();if(!slot)return;const marker=document.createElement('div');marker.id='drop-marker';Object.assign(marker.style,{left:slot.x+'px',top:slot.y+'px',height:slot.height+'px'});document.body.appendChild(marker)}
window.addEventListener('pointermove',e=>{
 if(!(e.buttons&1))return;
 if(pendingDrag){if(Math.hypot(e.clientX-pendingDrag.x,e.clientY-pendingDrag.y)<5)return;
 if(!dragIds.length){lastDown=null;if(focus)commit(focus.id);dragIds=pendingDrag.ids;selected=new Set(dragIds);anchor=focus=null;render()}
 const b=surface.getBoundingClientRect();dropSlot=e.clientX>=b.left&&e.clientX<=b.right&&e.clientY>=b.top&&e.clientY<=b.bottom?insertionSlot(e.clientX,e.clientY):null;showDrop(dropSlot);return}
 if(!pointerDown)return;if(lastDown&&Math.abs(e.clientX-lastDown.x)+Math.abs(e.clientY-lastDown.y)>8)lastDown=null;
 const target=document.elementFromPoint(e.clientX,e.clientY);if(target){const p=pointFromEvent({target,clientX:e.clientX});if(p)moveTo(p,true)}
});
window.addEventListener('pointerup',()=>{
 pointerDown=false;if(pendingDrag){if(dragIds.length){if(dropSlot)reorderAt(dragIds,dropSlot)}else if(pendingDrag.isIcon)selectIcon(pendingDrag.id);else if(view==='paragraph')moveTo(pendingDrag.p);else{selected=new Set([pendingDrag.id]);armed=true;render()}}
 pendingDrag=null;dragIds=[];dropSlot=null;document.querySelector('#drop-marker')?.remove();
});
window.addEventListener('pointercancel',()=>{pendingDrag=null;dragIds=[];dropSlot=null;pointerDown=false;document.querySelector('#drop-marker')?.remove()});
function reorderAt(ids,slot){
 const list=files.filter(f=>f.parent===current),moving=list.filter(f=>ids.includes(f.id));if(!moving.length)return;
 const target=list.findIndex(f=>f.id===slot.id);if(target<0)return;
 const boundary=target+(slot.after?1:0),rest=list.filter(f=>!ids.includes(f.id));
 const index=list.slice(0,boundary).filter(f=>!ids.includes(f.id)).length;
 const ordered=[...rest.slice(0,index),...moving,...rest.slice(index)];
 if(ordered.every((f,i)=>f===list[i]))return;snapshot();
 // Preserve each paragraph boundary at the removal position, then insert only at a file boundary.
 for(let i=0;i<list.length;i++)if(ids.includes(list[i].id)&&list[i].break){const next=list.slice(i+1).find(f=>!ids.includes(f.id));if(next)next.break=Math.max(next.break||0,list[i].break)}
 moving.forEach(f=>f.break=0);
 const following=rest[index];if(following?.break){moving[0].break=following.break;following.break=0}
 let i=0;files=files.map(f=>f.parent===current?ordered[i++]:f);selected=new Set(ids);anchor=focus=null;sort='manual';save();render();
}

function selectBaseName(id){
 const f=find(id);if(!f)return;
 if(focus&&focus.id!==id)commit(focus.id);
 const dot=f.folder?-1:f.name.lastIndexOf('.');
 anchor={id,pos:0};focus={id,pos:dot>0?dot:f.name.length};armed=false;
 updateSelection();render();input.focus({preventScroll:true});
}
function openFile(id){if(!commit(id)){render();return}const f=find(id);if(f.folder){navigate(id);return}render();const t=types[ext(f)]||types.unknown;$('#overlay').innerHTML=`<div class="modal"><div class="app-symbol">${t[0]}</div><h2>软件运行中</h2><p>${esc(f.name)}<br>${t[3]} · 模拟打开</p><small>点击任意位置取消</small></div>`;$('#overlay').hidden=false;$('#overlay').onclick=()=>{$('#overlay').hidden=true;input.focus()}}
function navigate(id){if(focus&&!commit(focus.id))return;navHistory.push(current);current=id;$('#search').value='';clearSelection();render()}
function editText(text,back=false,forward=false){
 if(view!=='paragraph')return;
 if(selected.size&&(back||forward)){removeSelected();return}
 if(!focus)return;if(selected.size>1){toast('请先选择一个文件名编辑');return}
 let f=find(focus.id),r=range();if(!f)return;
 let start=r&&r.a===r.b?r.start:focus.pos,end=r&&r.a===r.b?r.end:focus.pos;
 if(start===end&&forward&&start===f.name.length){
  const list=visible(),next=list[list.findIndex(x=>x.id===f.id)+1];
  if(next?.break){snapshot();next.break--;save();render();return}
  if(!next){if(f.trailingBreak){snapshot();f.trailingBreak--;save();render()}return}
  commit(f.id);f=next;start=0;end=1;
 }
 else if(start===end&&forward)end=Math.min(f.name.length,end+1);
 snapshot();
 if(start===end&&back){if(start===0){if(f.break)f.break--;save();render();return}start--}
 f.name=f.name.slice(0,start)+text+f.name.slice(end);delete f.error;
 anchor=focus={id:f.id,pos:start+text.length};selected.clear();armed=false;
 if(!f.name.length){selected.add(f.id);removeSelected(false);return}
 render();
}

input.addEventListener('beforeinput',e=>{if(e.isComposing)return;if(e.inputType==='insertText'||e.inputType==='insertFromPaste'){e.preventDefault();editText(e.data||'')}else if(e.inputType==='deleteContentBackward'){e.preventDefault();editText('',true)}else if(e.inputType==='deleteContentForward'){e.preventDefault();editText('',false,true)}});
input.addEventListener('compositionend',e=>{editText(e.data);input.value=''});input.addEventListener('input',()=>{if(!input.isComposing)input.value=''});
document.addEventListener('keydown',e=>{if(!$('#overlay').hidden){if(e.key==='Escape')$('#overlay').hidden=true;return}if(e.isComposing)return;if(e.target===$('#search')||e.target.closest('#context'))return;const mod=e.ctrlKey||e.metaKey;if(mod&&['a','x','c','v','z'].includes(e.key.toLowerCase())){e.preventDefault();const k=e.key.toLowerCase();if(k==='a'){selected=new Set(visible().map(f=>f.id));anchor=focus=null;armed=false;render()}if(k==='x'||k==='c')copy(k==='x');if(k==='v')paste();if(k==='z')undo();return}if(e.key==='Escape'){if(focus){const f=find(focus.id);f.name=f.saved;delete f.error}clearSelection();$('#context').hidden=true;render();return}if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();if(armed||view!=='paragraph'){removeSelected();return}editText('',e.key==='Backspace',e.key==='Delete');return}if(e.key==='Enter'){e.preventDefault();if(view!=='paragraph'||selected.size){if(selected.size===1)openFile([...selected][0]);return}if(!focus)return;const f=find(focus.id);if(focus.pos===0){snapshot();f.break=Math.min(2,(f.break||0)+1);save();render()}else if(focus.pos===f.name.length){if(!commit(f.id)){render();return}snapshot();const list=visible(),next=list[list.findIndex(x=>x.id===f.id)+1];if(next){next.break=Math.min(2,(next.break||0)+1);anchor=focus={id:next.id,pos:0}}else{f.trailingBreak=Math.min(2,(f.trailingBreak||0)+1)}save();render()}else openFile(f.id);return}if(e.key==='F2'){e.preventDefault();rename();return}if(['ArrowLeft','ArrowRight','Home','End','ArrowUp','ArrowDown'].includes(e.key)&&view==='paragraph'){e.preventDefault();navigateCaret(e);return}});
function rowEdge(point,end){
 const nodes=[...surface.querySelectorAll('.file')];const here=nodes.find(n=>n.dataset.id===point.id);if(!here)return point;
 const top=here.getBoundingClientRect().top;const row=nodes.filter(n=>Math.abs(n.getBoundingClientRect().top-top)<3);
 const f=find((end?row.at(-1):row[0]).dataset.id);return {id:f.id,pos:end?f.name.length:0};
}
function navigateCaret(e){
 const list=visible();if(!list.length)return;const mod=e.ctrlKey||e.metaKey;
 if(!focus){const f=find([...selected][0])||list[0];anchor=focus={id:f.id,pos:0}}
 let p={...focus},f=find(p.id),idx=list.findIndex(x=>x.id===p.id);
 if(mod&&(e.key==='Home'||e.key==='End')){f=e.key==='Home'?list[0]:list.at(-1);p={id:f.id,pos:e.key==='Home'?0:f.name.length}}
 else if(e.key==='Home'||e.key==='End'||e.altKey&&['ArrowLeft','ArrowRight'].includes(e.key))p=rowEdge(p,e.key==='End'||e.key==='ArrowRight');
 else if(mod&&['ArrowLeft','ArrowRight'].includes(e.key)){const i=e.key==='ArrowRight'?Math.min(list.length-1,idx+1):p.pos>0?idx:Math.max(0,idx-1);p={id:list[i].id,pos:0}}
 else if(e.shiftKey&&anchor&&focus.id!==anchor.id&&['ArrowLeft','ArrowRight'].includes(e.key)){const dir=e.key==='ArrowRight'?1:-1,next=list[idx+dir];if(next)p={id:next.id,pos:next.id===anchor.id?anchor.pos:dir>0?0:next.name.length}}
 else if(e.key==='ArrowLeft'){if(p.pos>0)p.pos--;else if(idx>0)p={id:list[idx-1].id,pos:list[idx-1].name.length}}
 else if(e.key==='ArrowRight'){if(p.pos<f.name.length)p.pos++;else if(idx<list.length-1)p={id:list[idx+1].id,pos:0}}
 else {const next=list[idx+(e.key==='ArrowUp'?-1:1)];if(next)p={id:next.id,pos:Math.min(p.pos,next.name.length)}}
 moveTo(p,e.shiftKey);
}

function copy(cut){if(!selected.size){const r=range();if(r&&r.start!==r.end){clipboard={text:find(focus.id).name.slice(r.start,r.end)};if(cut)editText('');toast('已复制文字')}return}if(focus&&!commit(focus.id))return;clipboard={ids:[...selected],cut};toast(`已${cut?'剪切':'复制'} ${selected.size} 个项目`);render()}
function paste(){
 if(!clipboard)return;if(clipboard.text!==undefined){editText(clipboard.text);return}
 const target=focus?.id||[...selected][0],src=clipboard.ids.map(find).filter(Boolean);
 if(!src.length)return;
 if(src.some(f=>f.folder&&isDescendant(current,f.id))){toast('不能将文件夹放入自身');return}
 if(focus&&!commit(focus.id))return;
 const after=!!focus&&focus.id===target&&focus.pos===find(target)?.name.length;
 // Resolve the boundary before removing cut files, including when the target is itself cut.
 const siblings=files.filter(f=>f.parent===current),targetIndex=siblings.findIndex(f=>f.id===target);
 const next=targetIndex<0?null:siblings.slice(targetIndex+(after?1:0)).find(f=>!clipboard.cut||!clipboard.ids.includes(f.id));
 snapshot();let moved=[];
 for(const f of src){if(clipboard.cut){f.parent=current;moved.push(f)}else moved.push(cloneTree(f,current))}
 files=files.filter(f=>!moved.includes(f));
 const index=next?files.findIndex(f=>f.id===next.id):-1;
 files.splice(index<0?files.length:index,0,...moved);
 moved.forEach(f=>{f.name=uniqueName(f.name,f.id);f.saved=f.name;f.break=0});
 if(clipboard.cut)clipboard=null;clearSelection();selected=new Set(moved.map(f=>f.id));save();render();
}
function isDescendant(id,parent){while(id!=='root'){if(id===parent)return true;id=find(id)?.parent||'root'}return false}
function cloneTree(f,parent){const clone={...f,id:uid(),parent};const children=files.filter(x=>x.parent===f.id);files.push(clone);children.forEach(c=>cloneTree(c,clone.id));return clone}
function uniqueName(name,id){let candidate=name,n=1;while(files.some(f=>f.parent===current&&f.id!==id&&f.name===candidate)){const dot=name.lastIndexOf('.');candidate=dot>0?name.slice(0,dot)+` (${n++})`+name.slice(dot):name+` (${n++})`}return candidate}
function removeSelected(record=true){
 if(!selected.size)return;if(record)snapshot();const ids=[...selected],list=visible();
 const first=list.findIndex(f=>selected.has(f.id));
 const next=list.slice(first+1).find(f=>!selected.has(f.id));
 const previous=list.slice(0,first).reverse().find(f=>!selected.has(f.id));
 if(next&&list[first]?.break)next.break=Math.max(next.break||0,list[first].break);
 const removed=new Set(files.filter(f=>ids.some(id=>f.id===id||isDescendant(f.parent,id))).map(f=>f.id));
 files=files.filter(f=>!removed.has(f.id));clearSelection();
 if(next)anchor=focus={id:next.id,pos:0};else if(previous)anchor=focus={id:previous.id,pos:previous.name.length};
 save();render();toast('已删除 · Ctrl+Z 可撤销');
}

function undo(){if(!history.length)return;files=JSON.parse(history.pop());if(current!=='root'&&!find(current))current='root';clearSelection();save();render();toast('已撤销')}
function newFolder(){snapshot();const f={id:uid(),parent:current,name:uniqueName('新建文件夹'),folder:true,size:0,date:'2026-10-13',break:0};f.saved=f.name;files.push(f);save();clearSelection();if(view==='paragraph'){anchor={id:f.id,pos:0};focus={id:f.id,pos:f.name.length};updateSelection();render();input.focus();surface.scrollTop=surface.scrollHeight}else{selected.add(f.id);render();rename()}}
function rename(){const id=[...selected][0]||focus?.id;if(!id)return;const f=find(id);if(view==='paragraph'){anchor={id,pos:0};focus={id,pos:f.name.length};updateSelection();armed=false;render();input.focus();return}$('#overlay').innerHTML=`<form class="modal"><h2>重命名</h2><input id="renamefield" value="${esc(f.name)}"><button type="button" id="cancelrename">取消</button><button class="primary">保存</button></form>`;$('#overlay').hidden=false;$('#overlay').onclick=null;$('#cancelrename').onclick=()=>$('#overlay').hidden=true;$('#overlay form').onsubmit=e=>{e.preventDefault();snapshot();f.name=$('#renamefield').value;if(commit(id)){$('#overlay').hidden=true;render()}};$('#renamefield').select()}
surface.addEventListener('contextmenu',e=>{e.preventDefault();if(focus)commit(focus.id);const el=e.target.closest('[data-id]');if(el&&!selected.has(el.dataset.id)){selected=new Set([el.dataset.id]);anchor=focus=null;render()}const menu=$('#context');menu.innerHTML=`${el?'<button data-action="open">打开</button><button data-action="rename">重命名</button><hr><button data-action="cut">剪切</button><button data-action="copy">复制</button><button data-action="delete">删除</button><hr>':''}<button data-action="paste">粘贴</button><button data-action="folder">新建文件夹</button>`;menu.hidden=false;menu.style.left=Math.min(e.clientX,innerWidth-200)+'px';menu.style.top=Math.min(e.clientY,innerHeight-menu.offsetHeight-10)+'px'});
$('#context').onclick=e=>{const a=e.target.dataset.action;$('#context').hidden=true;({open:()=>openFile([...selected][0]),rename,cut:()=>copy(true),copy:()=>copy(false),delete:removeSelected,paste,folder:newFolder})[a]?.()};document.addEventListener('pointerdown',e=>{if(!e.target.closest('#context'))$('#context').hidden=true});
surface.addEventListener('dragstart',e=>e.preventDefault());
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{if(focus&&!commit(focus.id))return;view=b.dataset.view;clearSelection();render()});$('#regenerate').onclick=generate;$('#newfolder').onclick=newFolder;$('#cut').onclick=()=>copy(true);$('#paste').onclick=paste;$('#undo').onclick=undo;$('#home').onclick=()=>navigate('root');$('#up').onclick=$('#upnav').onclick=()=>navigate(find(current)?.parent||'root');$('#back').onclick=()=>{const prev=navHistory.pop();if(prev!==undefined){current=prev;clearSelection();render()}};$('#breadcrumbs').onclick=e=>{const b=e.target.closest('[data-dir]');if(b)navigate(b.dataset.dir)};$('#search').oninput=()=>{clearSelection();render()};$('#search').onfocus=()=>{if(focus)commit(focus.id)};
$('#sort').onchange=e=>{sort=e.target.value;if(sort==='manual')return;if(focus)commit(focus.id);snapshot();const list=files.filter(f=>f.parent===current);list.sort((a,b)=>sort==='size'?a.size-b.size:sort==='ext'?ext(a).localeCompare(ext(b)):String(a[sort]).localeCompare(String(b[sort]),'zh-CN'));list.forEach(f=>f.break=0);files=files.filter(f=>f.parent!==current).concat(list);clearSelection();save();render();toast('已重新排序并清除分段 · 可撤销')};
$('#help').onclick=()=>{$('#overlay').innerHTML='<div class="modal"><h2>把文件当作文字编辑</h2><ul><li>单击文字放置光标，直接输入修改名字。</li><li>后缀可编辑，光标离开后缀后更新图标。</li><li>拖选或 Shift + 左右键：跨文件自动整选。</li><li>Ctrl+A 全选，Ctrl+X / C / V 剪切复制粘贴。</li><li>文件开头或后缀末尾 Enter 分段，最多留一行空行。</li><li>双击选中主文件名，不含后缀；直接输入替换。</li><li>拖动后缀、图标或已选文件，吸附到文件之间。</li><li>清空名称即删除文件；Delete 可跨到下个文件删字。</li><li>Home / End 或 Alt+←→ 到视觉行首尾。</li><li>Ctrl+Home / End 到全文首尾；Ctrl+←→ 跳文件开头。</li><li>名称内部 Enter 或右键打开；文件夹以 / 开头。</li><li>主动排序会清除分段，可撤销。</li></ul><small>点击任意位置返回</small></div>';$('#overlay').hidden=false;$('#overlay').onclick=()=>$('#overlay').hidden=true};
window.addEventListener('beforeunload',()=>{files.forEach(f=>{if(!f.error)commit(f.id)});save()});
try{files=JSON.parse(localStorage.getItem('paragraph-explorer-v1')||'[]')}catch{}if(!files.length)generate();else render();


