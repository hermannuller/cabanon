'use strict';
// Phone task previews keep task closing separate from app removal/uninstallation.
(()=>{
 const root=document.querySelector('#phone'),api=window.CabanonPhone;
 const W=393,CELL=16.8,ROW=42,ANCHOR=W/2,STEP=4*CELL;
 const tasks=new Map();let order=[],selected=0,offset=0,visible=false,press=null,origin=null,cardDrift=0;
 const overlay=document.createElement('section');overlay.className='phone-multitask';overlay.hidden=true;overlay.setAttribute('aria-label','Multitasking');
 const cards=document.createElement('div');cards.className='phone-task-cards';
 const rail=document.createElement('div');rail.className='phone-task-rail';
 const axis=document.createElement('div');axis.className='phone-task-axis';const home=document.createElement('button');home.className='phone-task-home';home.setAttribute('aria-label','Return to home');home.onclick=()=>{hide(false);api.home();};
 overlay.append(cards,rail,axis,home);root.append(overlay);
 const label=id=>appLabel(id).toUpperCase();
 function nameStarts(){const starts=[];let x=0;for(const id of order){starts.push(x);x+=Math.min(4,label(id).length)*CELL;}return starts;}
 function paintAxis(){if(!order.length){axis.hidden=true;return;}axis.hidden=false;const ctx=document.createElement('canvas').getContext('2d');ctx.font='800 28px JetBrains';const m=ctx.measureText(label(order[selected])),ascent=m.fontBoundingBoxAscent??22.4,descent=m.fontBoundingBoxDescent??5.6;const underline=(ROW-ascent-descent)/2+ascent+2;axis.style.top=(546+(selected%3)*ROW+underline)+'px';}
 const point=e=>{const r=root.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*W/r.width};};
 function record(item,view){if(item.members)return;tasks.set(item.id,{id:item.id,html:view.innerHTML});}
 function snapshot(id,kind){const task=tasks.get(id),card=document.createElement('article');card.className='phone-task-card '+kind;card.dataset.app=id;card.setAttribute('aria-label',label(id));const body=document.createElement('div');body.className='phone-task-body';body.innerHTML=task.html;body.inert=true;body.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));card.append(body);return card;}
 function animateCard(card,from,to){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;card.animate([{transform:'translateX('+from+'px)'},{transform:'translateX('+to+'px)'}],{duration:180,easing:'ease-out'});}
 function paintCards(direction=null,previous=null){cardDrift=0;const old=previous&&tasks.has(previous)?snapshot(previous,'departing'):null;const oldPreview=cards.querySelector('.next')?.dataset.app;cards.replaceChildren();if(!order.length){const empty=document.createElement('div');empty.className='phone-task-empty';empty.textContent='No open apps';cards.append(empty);return;}const main=snapshot(order[selected],'current');cards.append(main);if(direction>=0&&previous){if(old){old.className='phone-task-card next outgoing';cards.append(old);animateCard(old,-262,0);}if(oldPreview&&tasks.has(oldPreview)&&oldPreview!==previous){const departing=snapshot(oldPreview,'departing');departing.style.left='262px';departing.style.zIndex='4';cards.append(departing);animateCard(departing,0,393);setTimeout(()=>departing.remove(),190);}if(old)setTimeout(()=>old.remove(),190);}else{if(direction!==0)animateCard(main,direction<0?262:393,0);if(old){old.style.zIndex='0';cards.prepend(old);animateCard(old,0,-393);setTimeout(()=>old.remove(),190);}}
 if(order[selected+1]){const next=snapshot(order[selected+1],'next');cards.append(next);if(direction!==0)animateCard(next,direction>0?-262:131,0);}
 }
 function paintNames(){const starts=nameStarts();rail.replaceChildren();overlay.dataset.rows=Math.min(3,order.length);order.forEach((id,i)=>{const b=document.createElement('button');b.className='phone-task-name'+(i===selected?' current':'');b.dataset.app=id;b.textContent=label(id);b.style.left=(ANCHOR+starts[i]+offset)+'px';b.style.top=(i%3)*ROW+'px';b.style.setProperty('--task-row',i%3);b.setAttribute('aria-pressed',String(i===selected));rail.append(b);});paintAxis();}
 function select(index){const next=Math.max(0,Math.min(order.length-1,index));if(next!==selected){selected=next;paintCards();}paintNames();}
 function slide(dx){if(!order.length)return;const previous=order[selected],starts=nameStarts();offset=Math.max(-starts.at(-1),Math.min(0,offset+dx));selected=0;while(selected<order.length-1&&starts[selected+1]+offset<=0)selected++;paintNames();if(cards.querySelector('.current')?.dataset.app!==order[selected])paintCards(dx,previous);else{const main=cards.querySelector('.current'),next=cards.querySelector('.next');cardDrift=Math.max(-131,Math.min(262,cardDrift+dx));const drift=cardDrift;if(main)main.style.translate=drift+'px 0';if(next)next.style.translate=drift+'px 0';}}
 function show(){if(visible)return;origin={id:api.activeApp};order=[...tasks.keys()].filter(id=>!(prefs.uninstalled||[]).includes(id)).sort((a,b)=>label(a).localeCompare(label(b),'en'));selected=0;offset=0;visible=true;overlay.hidden=false;overlay.classList.add('entering');setTimeout(()=>overlay.classList.remove('entering'),240);root.classList.add('multitasking');paintNames();paintCards();}
 function hide(commit){if(!visible)return;const id=order[selected];visible=false;overlay.hidden=true;root.classList.remove('multitasking');if(commit&&id){api.home();api.open({id});}else if(commit&&!id)api.home();}
 function closeTask(id){tasks.delete(id);const old=selected;order=order.filter(x=>x!==id);selected=Math.max(0,Math.min(old,order.length-1));offset=-(nameStarts()[selected]||0);if(api.activeApp===id)api.home();paintNames();paintCards(0);}
 window.addEventListener('pointerdown',e=>{
  if(api.mode!=='phone'||e.button!==0)return;const p=point(e);
  if(visible&&e.target.closest('.phone-task-home')){press=null;return;}
  if(visible&&overlay.contains(e.target)){e.preventDefault();e.stopImmediatePropagation();const card=e.target.closest('.phone-task-card');press={id:e.pointerId,start:p,last:p,kind:card||cards.contains(e.target)?'card':'names',card,app:card?.dataset.app,name:e.target.closest('.phone-task-name')?.dataset.app,moved:false};root.setPointerCapture(e.pointerId);return;}
  if(e.target.closest('.phone-home')&&!root.querySelector('.phone-dialog-shade:not([hidden]),.phone-menu'))press={id:e.pointerId,start:p,last:p,kind:'home',moved:false};
 },true);
 window.addEventListener('pointermove',e=>{
  const g=press;if(!g||g.id!==e.pointerId||api.mode!=='phone'||g.cancelled)return;const p=point(e),dx=p.x-g.last.x,dy=p.y-g.start.y;
  if(g.kind==='home'&&!visible&&dy<-12){show();root.setPointerCapture(e.pointerId);}
  if(!visible){g.last=p;return;}e.preventDefault();e.stopImmediatePropagation();
  if(g.kind==='home'){if(p.y>=704&&dy>-8){hide(false);g.cancelled=true;}else slide(dx);}
  else if(g.kind==='names')slide(dx);
  else if(g.card){if(!g.direction&&Math.hypot(p.x-g.start.x,dy)>8)g.direction=Math.abs(dy)>Math.abs(p.x-g.start.x)?'vertical':'horizontal';if(g.direction==='vertical')g.card.style.transform='translateY('+Math.min(0,dy)+'px)';else if(g.direction==='horizontal')slide(dx);}
  g.moved ||= Math.hypot(p.x-g.start.x,dy)>8;g.last=p;
 },true);
 function finish(e,cancel=false){const g=press;if(!g||g.id!==e.pointerId)return;press=null;if(g.kind==='home'&&!visible&&!g.cancelled)return;e.preventDefault();e.stopImmediatePropagation();if(cancel){if(g.kind==='home')hide(false);else if(g.card)g.card.style.transform='';return;}if(g.cancelled)return;cardDrift=0;cards.querySelectorAll('.phone-task-card').forEach(c=>c.style.translate='');if(g.kind==='card'){const p=point(e);if(g.direction==='vertical'&&p.y-g.start.y<-56){closeTask(g.app);return;}if(g.card)g.card.style.transform='';if(!g.moved)hide(true);}else if(g.kind==='names'&&!g.moved){const id=g.name;if(id){selected=order.indexOf(id);offset=-(nameStarts()[selected]||0);paintNames();paintCards();}}}
 window.addEventListener('pointerup',e=>finish(e),true);window.addEventListener('pointercancel',e=>finish(e,true),true);
 window.addEventListener('keydown',e=>{if(visible&&e.key==='Escape'){hide(false);press=null;e.preventDefault();e.stopImmediatePropagation();}},true);
 window.addEventListener('blur',()=>{if(press){if(press.kind==='home')hide(false);else if(press.card)press.card.style.transform='';press=null;}});
 window.addEventListener('cabanon-device-mode',()=>{hide(false);press=null;});
 document.fonts.ready.then(()=>{if(visible)paintAxis();});
 window.CabanonPhoneMultitask={record,dismiss(){hide(false);press=null;},get visible(){return visible;},get taskIds(){return [...tasks.keys()];}};
})();
