const fs=require('fs');const file='dist/app.js';let s=fs.readFileSync(file,'utf8');
function section(start,end,value){const a=s.indexOf(start),b=s.indexOf(end,a);if(a<0||b<0)throw Error(start);s=s.slice(0,a)+value+'\n'+s.slice(b)}
section('function editText(',"input.addEventListener('beforeinput'",`function editText(text,back=false,forward=false){
 if(view!=='paragraph')return;
 if(selected.size&&(back||forward)){removeSelected();return}
 if(!focus)return;if(selected.size>1){toast('请先选择一个文件名编辑');return}
 let f=find(focus.id),r=range();if(!f)return;
 let start=r&&r.a===r.b?r.start:focus.pos,end=r&&r.a===r.b?r.end:focus.pos;
 if(start===end&&forward&&start===f.name.length){const list=visible(),next=list[list.findIndex(x=>x.id===f.id)+1];if(!next)return;commit(f.id);f=next;start=0;end=1}
 else if(start===end&&forward)end=Math.min(f.name.length,end+1);
 snapshot();
 if(start===end&&back){if(start===0){if(f.break)f.break--;save();render();return}start--}
 f.name=f.name.slice(0,start)+text+f.name.slice(end);delete f.error;
 anchor=focus={id:f.id,pos:start+text.length};selected.clear();armed=false;
 if(!f.name.length){selected.add(f.id);removeSelected(false);return}
 render();
}
`);
section('function removeSelected()', 'function undo()',`function removeSelected(record=true){
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
`);
const navStart="if(['ArrowLeft','ArrowRight','Home','End','ArrowUp','ArrowDown'].includes(e.key)&&view==='paragraph')";
section(navStart,'function copy(cut)',`${navStart}{e.preventDefault();navigateCaret(e);return}});
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
`);
section("surface.addEventListener('pointerdown'",'function openFile(id)',`let pendingDrag=null,dropSlot=null;
function selectIcon(id){if(focus)commit(focus.id);if(!selected.has(id))selected=new Set([id]);armed=true;anchor=focus=null;render();input.focus()}
surface.addEventListener('pointerdown',e=>{
 if(e.button!==0)return;e.preventDefault();$('#context').hidden=true;
 const el=e.target.closest('[data-id]');if(!el){if(focus)commit(focus.id);clearSelection();render();return}
 const id=el.dataset.id,p=pointFromEvent(e),f=find(id),isIcon=!!e.target.closest('.icon');
 const offset=e.target.closest('[data-offset]');const suffix=!f.folder&&f.name.lastIndexOf('.')>=0&&offset&&Number(offset.dataset.offset)>=f.name.lastIndexOf('.');
 const now=Date.now();if(lastDown&&lastDown.id===id&&now-lastDown.time<350&&Math.abs(e.clientX-lastDown.x)<8&&Math.abs(e.clientY-lastDown.y)<8){lastDown=null;openFile(id);return}
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
`);
section("surface.addEventListener('dragstart'", "document.querySelectorAll('[data-view]')", "surface.addEventListener('dragstart',e=>e.preventDefault());");
s=s.replace("if(e.target===$('#search')", "if(e.isComposing)return;if(e.target===$('#search')");
s=s.replace('拖动图标调整顺序；图标本身不能编辑。','拖动后缀、图标或已选文件，吸附到文件之间。');
s=s.replace('点击图标后 Delete 删除；Ctrl+Z 撤销。','清空名称即删除文件；Delete 可跨到下个文件删字。');
s=s.replace('<li>文件夹以 / 开头，双击进入。</li>','<li>Home / End 或 Alt+←→ 到视觉行首尾。</li><li>Ctrl+Home / End 到全文首尾；Ctrl+←→ 跳文件开头。</li><li>Ctrl+Z 撤销；文件夹以 / 开头，双击进入。</li>');
fs.writeFileSync(file,s);
fs.appendFileSync('dist/style.css','\n/* The caret paints outside layout; moving it never changes text advance. */\n.caret{width:0!important;min-width:0;border:0!important;overflow:visible;pointer-events:none}.caret::after{content:"";position:absolute;left:0;top:0;height:18px;width:1.5px;background:#257d65}.name{font-variant-ligatures:none}.char{font-variant-ligatures:none}#drop-marker{position:fixed;width:2px;background:#398b77;pointer-events:none;z-index:25;border-radius:2px}.chosen{cursor:grab}\n');
