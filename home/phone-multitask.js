'use strict';
// Phone task previews keep task closing separate from app removal/uninstallation.
(()=>{
 const root=document.querySelector('#phone'),api=window.CabanonPhone;
 const W=414,CELL=16.8,ROW=42,ANCHOR=W/2,STEP=4*CELL;
 const tasks=new Map();let order=[],selected=0,offset=-CELL/2,visible=false,press=null,origin=null,cardDrift=0,restoring=false,exiting=false,exitAnimations=[],blockFooterClickUntil=0;
 const overlay=document.createElement('section');overlay.className='phone-multitask';overlay.hidden=true;overlay.setAttribute('aria-label','Multitasking');
 const cards=document.createElement('div');cards.className='phone-task-cards';
 const rail=document.createElement('div');rail.className='phone-task-rail';
 const axis=document.createElement('div');axis.className='phone-task-axis';const home=document.createElement('button');home.className='phone-task-home';home.setAttribute('aria-label','Return to home');let homePress=null;
 home.addEventListener('pointerdown',e=>{if(e.button!==0)return;homePress={id:e.pointerId,p:point(e),at:performance.now()};home.setPointerCapture(e.pointerId);});
 home.addEventListener('pointerup',e=>{const g=homePress;homePress=null;if(!g||g.id!==e.pointerId)return;const p=point(e);if(performance.now()-g.at<500&&Math.hypot(p.x-g.p.x,p.y-g.p.y)<=10){hide(false);api.homeTap();}});
 home.addEventListener('pointercancel',()=>homePress=null);
 const closeAll=document.createElement('button');closeAll.type='button';closeAll.className='phone-task-close-all';closeAll.setAttribute('aria-label','Close all apps');closeAll.innerHTML='<svg data-task-close-all viewBox="0 0 36 36" aria-hidden="true" style="fill:none;stroke:var(--l5);stroke-width:1"><path d="M7 5V31M14 5V31M21 5V31M28 5V31M2 27.2376L34 8.7624"/></svg>';closeAll.onclick=confirmCloseAll;
 overlay.append(cards,rail,axis,home,closeAll);root.append(overlay);
 const label=id=>appLabel(id).toUpperCase();
 function nameStarts(){const starts=[];let x=0;for(const id of order){starts.push(x);x+=Math.min(4,label(id).length)*CELL;}return starts;}
 function paintAxis(){if(!order.length){axis.hidden=true;return;}axis.hidden=false;const ctx=document.createElement('canvas').getContext('2d');ctx.font='800 28px JetBrains';const m=ctx.measureText(label(order[selected])),ascent=m.fontBoundingBoxAscent??22.4,descent=m.fontBoundingBoxDescent??5.6;const underline=(ROW-ascent-descent)/2+ascent+2;const rows=Math.min(3,order.length),top=overlay.clientHeight-56-rows*ROW;axis.style.top=(top+(selected%3)*ROW+underline)+'px';}
 const point=e=>{const r=root.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*W/r.width};};
 function record(item,view){if(item.members)return;tasks.set(item.id,{id:item.id,html:view.innerHTML});}
 function snapshot(id,kind){const task=tasks.get(id),card=document.createElement('article');card.className='phone-task-card '+kind;card.dataset.app=id;card.setAttribute('aria-label',label(id));const body=document.createElement('div');body.className='phone-task-body';body.innerHTML=task.html;body.inert=true;body.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));card.append(body);return card;}
 function animateCard(card,from,to){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;card.animate([{transform:'translateX('+from+'px)'},{transform:'translateX('+to+'px)'}],{duration:180,easing:'ease-out'});}
 function paintCards(direction=null,previous=null){cardDrift=0;const old=previous&&tasks.has(previous)?snapshot(previous,'departing'):null;const oldPreview=cards.querySelector('.next')?.dataset.app;cards.replaceChildren();if(!order.length){const empty=document.createElement('div');empty.className='phone-task-empty';empty.textContent='No open apps';cards.append(empty);return;}const main=snapshot(order[selected],'current');cards.append(main);if(direction>=0&&previous){if(old){old.className='phone-task-card next outgoing';cards.append(old);animateCard(old,-276,0);}if(oldPreview&&tasks.has(oldPreview)&&oldPreview!==previous){const departing=snapshot(oldPreview,'departing');departing.style.left='276px';departing.style.zIndex='4';cards.append(departing);animateCard(departing,0,414);setTimeout(()=>departing.remove(),190);}if(old)setTimeout(()=>old.remove(),190);}else{if(direction!==0)animateCard(main,direction<0?276:414,0);if(old){old.style.zIndex='0';cards.prepend(old);animateCard(old,0,-414);setTimeout(()=>old.remove(),190);}}
 if(order[selected+1]){const next=snapshot(order[selected+1],'next');cards.append(next);if(direction!==0)animateCard(next,direction>0?-276:131,0);}
 }
 function paintNames(){closeAll.disabled=!order.length;const starts=nameStarts();rail.replaceChildren();overlay.dataset.rows=Math.min(3,order.length);overlay.style.setProperty('--task-rows',Math.min(3,order.length));order.forEach((id,i)=>{const b=document.createElement('button');b.className='phone-task-name'+(i===selected?' current':'');b.dataset.app=id;b.textContent=label(id);b.style.left=(ANCHOR+starts[i]+offset)+'px';b.style.top=(i%3)*ROW+'px';b.style.setProperty('--task-row',i%3);b.setAttribute('aria-pressed',String(i===selected));rail.append(b);});paintAxis();}
 function select(index){const next=Math.max(0,Math.min(order.length-1,index));if(next!==selected){selected=next;paintCards();}paintNames();}
 function slide(dx){if(!order.length)return;const previous=order[selected],starts=nameStarts();const before=offset,last=order.at(-1),context=document.createElement('canvas').getContext('2d');context.font='800 28px JetBrains';const end=starts.at(-1)+context.measureText(label(last)).width-CELL/2;offset=Math.max(-end,Math.min(-CELL/2,offset+dx));const applied=offset-before;if(!applied)return;selected=0;while(selected<order.length-1&&starts[selected+1]+offset<=-CELL/2)selected++;paintNames();if(cards.querySelector('.current')?.dataset.app!==order[selected])paintCards(dx,previous);else{const main=cards.querySelector('.current'),next=cards.querySelector('.next');cardDrift=Math.max(-131,Math.min(276,cardDrift+applied));const drift=cardDrift;if(main)main.style.translate=drift+'px 0';if(next)next.style.translate=drift+'px 0';}}
 function show(){if(visible)return;origin={id:api.activeApp};order=[...tasks.keys()].filter(id=>!(prefs.uninstalled||[]).includes(id)).sort((a,b)=>label(a).localeCompare(label(b),'en'));selected=0;offset=-CELL/2;visible=true;overlay.hidden=false;overlay.classList.add('entering');setTimeout(()=>overlay.classList.remove('entering'),240);root.classList.add('multitasking');paintNames();paintCards();}

 function activate(id){restoring=true;try{api.activateTask(id);}finally{restoring=false;}}
 function hide(commit,id=order[selected]){if(!visible)return;if(commit&&id){commitTask(id);return;}visible=false;exiting=false;if(root.querySelector('.phone-task-confirm'))CabanonPhoneDialogs.cancel();exitAnimations.forEach(a=>a.cancel());exitAnimations=[];overlay.classList.remove('leaving');overlay.hidden=true;root.classList.remove('multitasking');if(commit&&!id)api.home();}
 function commitTask(id){if(exiting||!tasks.has(id))return;exiting=true;press=null;overlay.classList.add('leaving');root.dataset.taskTransition='opening';activate(id);
  const duration=200;exitAnimations=[];
  for(const card of cards.querySelectorAll('.phone-task-card')){card.getAnimations().forEach(a=>a.cancel());if(card.dataset.app===id){card.style.visibility='hidden';continue;}exitAnimations.push(card.animate([{transform:'translateX(0)'},{transform:'translateX(414px)'}],{duration,easing:'ease-out',fill:'forwards'}));}
  const retreat=overlay.clientHeight-rail.offsetTop;for(const part of [rail,axis])exitAnimations.push(part.animate([{transform:'translateY(0)'},{transform:'translateY('+retreat+'px)'}],{duration,easing:'ease-out',fill:'forwards'}));
  Promise.all(exitAnimations.map(a=>a.finished.catch(()=>{}))).then(()=>{if(!exiting)return;hide(false);root.dataset.taskTransition='idle';});
 }
 function fastSwitch(dx){const ids=[...tasks.keys()].filter(id=>!(prefs.uninstalled||[]).includes(id));if(!ids.length)return;const current=visible?order[selected]:api.activeApp,index=ids.indexOf(current),next=index<0?ids.length-1:Math.max(0,Math.min(ids.length-1,index+(dx<0?1:-1))),id=ids[next];if(id===api.activeApp&&!visible)return;if(visible)hide(false);api.exitHome(()=>activate(id),dx<0?'right':'left');}
 window.addEventListener('click',e=>{if(performance.now()<blockFooterClickUntil&&root.contains(e.target)){e.preventDefault();e.stopImmediatePropagation();}},true);

 function confirmCloseAll(){if(!tasks.size||exiting||root.querySelector('.phone-task-confirm'))return;press=null;CabanonPhoneDialogs.show({message:'Close all apps?',yes:'yes, close all',kind:'phone-task-confirm',onConfirm:()=>{hide(false);tasks.clear();order=[];selected=0;offset=-CELL/2;cards.replaceChildren();rail.replaceChildren();api.home();},onCancel:()=>closeAll.focus({preventScroll:true})});}
 function closeTask(id){tasks.delete(id);const old=selected;order=order.filter(x=>x!==id);selected=Math.max(0,Math.min(old,order.length-1));offset=-(nameStarts()[selected]||0)-CELL/2;if(api.activeApp===id)api.home();paintNames();paintCards(0);}
 window.addEventListener('pointerdown',e=>{
  if(api.mode!=='phone'||e.button!==0||exiting)return;if(root.querySelector('.phone-task-confirm')){press=null;return;}const p=point(e);if(!root.contains(e.target))return;
  if(p.y>=840&&p.y<=896&&!root.querySelector('.phone-dialog-shade:not([hidden]),.phone-menu')){press={id:e.pointerId,start:p,last:p,kind:'footer',moved:false,alreadyVisible:visible};return;}
  if(visible&&e.target.closest('.phone-task-home')){press={id:e.pointerId,start:p,last:p,kind:'home',moved:false,alreadyVisible:true};return;}
  if(visible&&overlay.contains(e.target)){e.preventDefault();e.stopImmediatePropagation();const card=e.target.closest('.phone-task-card');press={id:e.pointerId,start:p,last:p,kind:card||cards.contains(e.target)?'card':'names',card,app:card?.dataset.app,name:e.target.closest('.phone-task-name')?.dataset.app,moved:false};root.setPointerCapture(e.pointerId);return;}
  if(e.target.closest('.phone-home')&&!root.querySelector('.phone-dialog-shade:not([hidden]),.phone-menu'))press={id:e.pointerId,start:p,last:p,kind:'home',moved:false};
 },true);
 window.addEventListener('pointermove',e=>{
  const g=press;if(!g||g.id!==e.pointerId||api.mode!=='phone'||g.cancelled)return;const p=point(e),totalX=p.x-g.start.x,totalY=p.y-g.start.y;g.maxDistance=Math.max(g.maxDistance||0,Math.hypot(totalX,totalY));
  g.direction ||= CabanonGestures.axis(totalX,totalY);if(!g.direction)return;
  if(g.kind==='footer'){if(g.direction==='horizontal'){g.kind='fast';g.moved=true;root.setPointerCapture(e.pointerId);}else if(g.start.x>=138&&g.start.x<=276&&totalY<0){g.kind='home';if(!visible){show();g.startedOverlay=true;}root.setPointerCapture(e.pointerId);}else{g.cancelled=true;return;}}
  if(g.kind==='fast'){e.preventDefault();e.stopImmediatePropagation();g.last=p;return;}
  if(g.kind==='home'&&!visible){if(g.direction==='horizontal'||(g.direction==='vertical'&&totalY<0)){show();root.setPointerCapture(e.pointerId);g.last=g.start;}else{g.cancelled=true;return;}}
  if(!visible){g.last=p;return;}e.preventDefault();e.stopImmediatePropagation();
  const dx=p.x-g.last.x;
  if(g.direction==='horizontal')slide(dx);
  else if(g.kind==='card'&&g.card)g.card.style.transform='translateY('+Math.min(0,totalY)+'px)';
  else if(g.kind==='home'&&g.alreadyVisible&&totalY>16){hide(false);g.cancelled=true;}
  g.moved ||= g.maxDistance>=8;g.last=p;

 },true);
 function finish(e,cancel=false){const g=press;if(!g||g.id!==e.pointerId)return;press=null;if(g.kind==='fast'){e.preventDefault();e.stopImmediatePropagation();blockFooterClickUntil=performance.now()+240;const dx=point(e).x-g.start.x;if(!cancel&&Math.abs(dx)>=16)fastSwitch(dx);return;}if(g.kind==='footer'){if(visible&&!cancel&&(g.maxDistance||0)<=10){e.preventDefault();e.stopImmediatePropagation();if(g.start.x<138){confirmCloseAll();return;}hide(false);if(g.start.x>=276)api.searchTap();else api.homeTap();}return;}if(g.kind==='home'&&!visible&&!g.cancelled)return;e.preventDefault();e.stopImmediatePropagation();if(cancel){if(g.kind==='home')hide(false);else if(g.card)g.card.style.transform='';return;}if(g.cancelled)return;if(g.kind==='home'&&!g.moved&&(g.maxDistance||0)<=10){hide(false);api.homeTap();return;}cardDrift=0;cards.querySelectorAll('.phone-task-card').forEach(c=>c.style.translate='');if(g.kind==='card'){const p=point(e);if(g.direction==='vertical'&&p.y-g.start.y<-56){closeTask(g.app);return;}if(g.card)g.card.style.transform='';if(!g.moved&&(g.maxDistance||0)<=10)hide(true,g.app||order[selected]);}else if(g.kind==='names'&&!g.moved&&(g.maxDistance||0)<=10){const id=g.name;if(id){selected=order.indexOf(id);offset=-(nameStarts()[selected]||0)-CELL/2;paintNames();paintCards();}}}
 window.addEventListener('pointerup',e=>finish(e),true);window.addEventListener('pointercancel',e=>finish(e,true),true);
 window.addEventListener('keydown',e=>{if(visible&&e.key==='Escape'){const confirm=root.querySelector('.phone-task-confirm');if(confirm){confirm.remove();press=null;e.preventDefault();e.stopImmediatePropagation();return;}hide(false);press=null;e.preventDefault();e.stopImmediatePropagation();}},true);
 window.addEventListener('blur',()=>{if(press){if(press.kind==='home')hide(false);else if(press.card)press.card.style.transform='';press=null;}});
 window.addEventListener('cabanon-device-mode',()=>{hide(false);press=null;});
 document.fonts.ready.then(()=>{if(visible)paintAxis();});
 window.CabanonPhoneMultitask={record,dismissConfirmation(){if(!root.querySelector('.phone-task-confirm'))return false;press=null;return CabanonPhoneDialogs.cancel();},dismiss(){hide(false);press=null;},get restoring(){return restoring;},get visible(){return visible;},get taskIds(){return [...tasks.keys()];}};
})();
