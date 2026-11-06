'use strict';
// Pane-owned display and annotation state; no changes to the OSM snapshot.
window.CabanonWhereTools=(()=>{
 const layers=[['forest','Woodland'],['buildings','Buildings'],['roads','Roads'],['rails','Railways'],['subway','Subway'],['water','Water'],['text','All labels']];
 let popup=null,anchor=null;
 function node(tag,cls,text){const n=document.createElement(tag);n.className=cls||'';if(text!==undefined)n.textContent=text;return n;}
 function dismiss(){popup?.remove();popup=null;anchor?.setAttribute('aria-expanded','false');anchor=null;}
 function current(win){const state=window.CabanonWherePanes?.state(win);return state?CabanonWhere.session(state.active)?.tools():null;}
 function action(menu,label,fn){const b=node('button','',label);b.type='button';b.setAttribute('role','menuitem');b.onclick=fn;menu.append(b);return b;}
 function show(win,key,button,phoneTools=null){if(anchor===button){dismiss();return;}dismiss();anchor=button;button.setAttribute('aria-expanded','true');const tools=phoneTools||current(win),menu=node('div','where-menu');popup=menu;menu.setAttribute('role','menu');menu.setAttribute('aria-label',key);
  const run=fn=>()=>{dismiss();fn();};
  if(key==='file'){
   action(menu,'new window',run(()=>CabanonWhere.open(true)));
   action(menu,'new tag',run(()=>CabanonWherePanes.split(win)));
   action(menu,'close',run(()=>CabanonWherePanes.closePane(win)));
   action(menu,'quit',run(()=>closeDocumentWindows([...windowMap.values()].filter(w=>w.dataset.ownerApp==='WHERE'))));
  }else if(tools){
   const wrap=node('div','where-view-wrap');menu.append(wrap);const trigger=action(wrap,'view',()=>{sub.hidden=!sub.hidden;trigger.setAttribute('aria-expanded',String(!sub.hidden));});trigger.setAttribute('aria-haspopup','menu');trigger.setAttribute('aria-expanded','false');
   const sub=node('div','where-view-menu');sub.setAttribute('role','menu');sub.hidden=true;wrap.append(sub);
   const reveal=()=>{sub.hidden=false;trigger.setAttribute('aria-expanded','true');const r=sub.getBoundingClientRect();if(r.right>innerWidth)sub.classList.add('where-view-left');};wrap.onpointerenter=reveal;trigger.onfocus=reveal;
   const conceal=()=>{sub.hidden=true;trigger.setAttribute('aria-expanded','false');};wrap.onpointerleave=conceal;wrap.addEventListener('focusout',e=>{if(!wrap.contains(e.relatedTarget))conceal();});
   for(const [id,label]of layers){const b=action(sub,'',()=>{tools.toggle(id);paint();});b.setAttribute('role','menuitemcheckbox');const check=node('i','where-check'),text=node('span','',label);b.append(check,text);function paint(){b.setAttribute('aria-checked',String(tools.visible(id)));}paint();}
   for(const [id,label]of [['measure','Measure'],['pin','pin']]){const b=action(menu,label,run(()=>tools.setTool(id)));b.setAttribute('aria-pressed',String(tools.tool()===id));}
   action(menu,'help',run(()=>CabanonWhere.help()));
  }
  const surface=win?document.querySelector('#desktop'):document.body;surface.append(menu);const r=button.getBoundingClientRect(),d=surface.getBoundingClientRect(),scale=win?d.width/surface.offsetWidth:1;menu.style.left=Math.max(0,Math.min((win?surface.clientWidth:innerWidth)-menu.offsetWidth,(r.left-d.left)/scale))+'px';menu.style.top=Math.max(0,Math.min((win?surface.clientHeight:innerHeight)-menu.offsetHeight,(r.bottom-d.top)/scale))+'px';
 }
 function attach(win){if(win.querySelector('.where-header-actions'))return;const bar=node('div','folder-header-actions where-header-actions');for(const key of ['file','tool']){const b=node('button','',key);b.type='button';b.dataset.whereMenu=key;b.setAttribute('aria-haspopup','menu');b.setAttribute('aria-expanded','false');b.onpointerdown=e=>e.stopPropagation();b.ondblclick=e=>e.stopPropagation();b.onclick=()=>show(win,key,b);bar.append(b);}win.querySelector('.window-title').after(bar);}
 document.addEventListener('pointerdown',e=>{if(popup&&!popup.contains(e.target)&&!anchor?.contains(e.target))dismiss();},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&popup){dismiss();e.preventDefault();e.stopImmediatePropagation();}},true);
 function mount(root,map,state,save,status,help){
  const svg=map.root.querySelector('.map'),stage=map.root.querySelector('.map-stage'),NS='http://www.w3.org/2000/svg',abort=new AbortController(),signal=abort.signal;
  state.layers||={};state.annotations||={pins:[],measurements:[]};const annotations=state.annotations;annotations.pins||=[];annotations.measurements||=[];if(annotations.measure?.length>1)annotations.measurements.push({id:crypto.randomUUID(),points:annotations.measure});delete annotations.measure;
  let activeMeasure=null;const distanceLabels=new Map();let tool='',drawing=false,hover=null,editing=null,alive=true,ownPosition=state.location||null,locating=false,paintFrame=0;
  const overlay=document.createElementNS(NS,'svg');overlay.classList.add('where-annotation-layer');overlay.setAttribute('aria-hidden','true');const pins=node('div','where-pin-layer'),distances=node('div','where-distance-layer');stage.append(overlay,pins,distances);
  function svgNode(tag,attrs){const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);overlay.append(n);return n;}
  function applyLayers(){for(const [id]of layers){if(id==='text'){map.root.classList.toggle('where-no-text',state.layers.text===false);continue;}map.root.classList.toggle('where-hide-'+id,state.layers[id]===false);}}
  function snapshot(){return CabanonWhere.session(root.parentElement)?.getState()||structuredClone(state);}
  function local(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const m=svg.getScreenCTM();if(!m)return null;const q=p.matrixTransform(m.inverse());return map.unproject([q.x,q.y]);}
  function commit(){save();}
  function paint(){paintFrame=0;const box=svg.getAttribute('viewBox');if(!box)return;overlay.setAttribute('viewBox',box);overlay.replaceChildren();
   const visibleIds=new Set(),measurements=[...annotations.measurements,...(activeMeasure?[activeMeasure]:[])];
   for(const measurement of measurements){const route=measurement.points,coordinates=measurement===activeMeasure&&drawing&&hover&&route.length?[...route,hover]:route,screen=coordinates.map(p=>map.project(p)).filter(Boolean);if(!screen.length)continue;
    const id=measurement.id;visibleIds.add(id);svgNode('polyline',{points:screen.map(p=>p.join(',')).join(' '),fill:'none',stroke:'var(--l1)','stroke-width':6,'data-measurement':id});svgNode('polyline',{points:screen.map(p=>p.join(',')).join(' '),fill:'none',stroke:'var(--l8)','stroke-width':2,'data-measurement':id});for(const xy of route){const p=map.project(xy);if(p)svgNode('circle',{cx:p[0],cy:p[1],r:4,fill:'var(--l8)',stroke:'var(--l1)','stroke-width':2,'data-measurement':id});}
    let distance=distanceLabels.get(id);if(!distance){distance=node('div','where-distance');distance.dataset.measurement=id;distance.title='Right-click to remove this measurement';distance.addEventListener('pointerdown',e=>{e.stopPropagation();if(e.button===2)e.preventDefault();},{signal});distance.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();annotations.measurements=annotations.measurements.filter(m=>m.id!==id);if(activeMeasure?.id===id){activeMeasure=null;drawing=false;hover=null;}commit();paint();},{signal});distanceLabels.set(id,distance);distances.append(distance);}
    let meters=0;for(let i=1;i<coordinates.length;i++)meters+=d3.geoDistance(coordinates[i-1],coordinates[i])*6371008.8;const last=screen.at(-1);distance.textContent=meters>=1000?(meters/1000).toFixed(2)+' km':Math.round(meters)+' m';distance.style.left=Math.max(0,Math.min(svg.viewBox.baseVal.width-distance.offsetWidth,last[0]+10))+'px';distance.style.top=Math.max(0,Math.min(svg.viewBox.baseVal.height-24,last[1]-26))+'px';
   }
   for(const [id,label]of distanceLabels)if(!visibleIds.has(id)){label.remove();distanceLabels.delete(id);}
   for(const b of pins.querySelectorAll('.where-pin')){const p=annotations.pins.find(p=>p.id===b.dataset.pin);if(!p)continue;const xy=map.project(p.xy);if(xy){b.style.left=xy[0]+'px';b.style.top=xy[1]+'px';}}
   if(editing){const p=annotations.pins.find(p=>p.id===editing.id),xy=p&&map.project(p.xy);if(xy){const box=svg.viewBox.baseVal;editing.editor.style.left=Math.max(4,Math.min(box.width-editing.editor.offsetWidth-4,xy[0]+12))+'px';editing.editor.style.top=Math.max(4,Math.min(box.height-editing.editor.offsetHeight-4,xy[1]+12))+'px';}}
   if(ownPosition){const xy=map.project(ownPosition);if(xy)svgNode('circle',{cx:xy[0],cy:xy[1],r:7,fill:'var(--l6)',stroke:'var(--l4)','stroke-width':2});}
  }
  function schedule(){if(!paintFrame)paintFrame=requestAnimationFrame(paint);}
  function closeEditor(){if(!editing)return;const previous=editing;editing=null;const p=annotations.pins.find(p=>p.id===previous.id);if(p){p.note=previous.input.value;commit();}previous.editor.remove();refreshPins();}
  function editPin(pin){closeEditor();const editor=node('form','where-pin-editor'),input=node('input');input.type='text';input.maxLength=500;input.placeholder='Note';input.value=pin.note;input.setAttribute('aria-label','Pin note');const done=node('button','where-icon-button');done.type='submit';done.setAttribute('aria-label','Save note');done.innerHTML='<i class="where-check"></i>';const remove=node('button','where-icon-button');remove.type='button';remove.setAttribute('aria-label','Delete pin');remove.innerHTML='<i class="where-symbol close-symbol"></i>';editor.append(input,done,remove);stage.append(editor);editing={id:pin.id,editor,input};editor.onpointerdown=e=>e.stopPropagation();editor.onsubmit=e=>{e.preventDefault();closeEditor();};editor.onkeydown=e=>{e.stopPropagation();if(e.key==='Escape'){input.value=pin.note;closeEditor();e.preventDefault();}};remove.onclick=()=>{annotations.pins=annotations.pins.filter(p=>p.id!==pin.id);editing=null;editor.remove();refreshPins();commit();};paint();input.focus();}
  function refreshPins(){pins.replaceChildren();for(const p of annotations.pins){const b=node('button','where-pin');b.type='button';b.dataset.pin=p.id;b.title=p.note||'pin';b.setAttribute('aria-label',p.note||'pin');b.innerHTML='<i class="where-symbol pin-symbol"></i>';if(p.note)b.append(node('span','where-pin-note',p.note));b.onpointerdown=e=>e.stopPropagation();b.onclick=e=>{e.stopPropagation();editPin(p);};pins.append(b);}paint();}
  function finishMeasurement(){if(activeMeasure?.points.length>1)annotations.measurements.push(activeMeasure);activeMeasure=null;drawing=false;hover=null;commit();paint();}
  function setTool(next){closeEditor();if(drawing)finishMeasurement();tool=tool===next?'':next;root.dataset.tool=tool;svg.style.cursor=tool?'crosshair':'';}
  function stopMeasure(){activeMeasure=null;drawing=false;hover=null;tool='';root.dataset.tool='';svg.style.cursor='';commit();paint();}
  svg.addEventListener('pointerdown',e=>{if(!tool)return;e.preventDefault();e.stopImmediatePropagation();if(e.button===2){stopMeasure();return;}if(e.button!==0)return;const xy=local(e);if(!xy)return;if(tool==='pin'){const p={id:crypto.randomUUID(),xy,note:''};annotations.pins.push(p);refreshPins();commit();editPin(p);return;}if(e.detail>1)return;if(!drawing){activeMeasure={id:crypto.randomUUID(),points:[]};drawing=true;}const last=activeMeasure.points.at(-1);if(!last||d3.geoDistance(last,xy)>1e-10)activeMeasure.points.push(xy);hover=null;paint();},{capture:true,signal});
  svg.addEventListener('pointermove',e=>{if(tool!=='measure'||!drawing)return;hover=local(e);schedule();},{signal});
  svg.addEventListener('dblclick',e=>{if(tool!=='measure')return;e.preventDefault();e.stopImmediatePropagation();finishMeasurement();},{capture:true,signal});
  svg.addEventListener('contextmenu',e=>{e.preventDefault();if(tool==='measure')stopMeasure();},{signal});
  root.addEventListener('keydown',e=>{if(e.key==='Escape'&&tool){e.preventDefault();e.stopPropagation();stopMeasure();}},{capture:true,signal});
  root.addEventListener('pointerdown',e=>{if(editing&&!editing.editor.contains(e.target)&&!e.target.closest('.where-pin'))closeEditor();},{capture:true,signal});
  map.root.addEventListener('whereviewchange',()=>{applyLayers();if(annotations.pins.length||annotations.measurements.length||activeMeasure||ownPosition)schedule();},{signal});
  for(const b of map.root.querySelectorAll('[data-factor]')){b.textContent='';b.classList.add('where-icon-button');b.innerHTML='<i class="where-symbol '+(+b.dataset.factor>1?'plus-symbol':'minus-symbol')+'"></i>';}
  const location=node('button','where-icon-button');location.type='button';location.setAttribute('aria-label','My location');location.innerHTML='<i class="where-symbol location-symbol"></i>';map.root.querySelector('.zoom').prepend(location);const view=node('button','where-icon-button');view.type='button';view.setAttribute('aria-label','Map layers');view.innerHTML='<i class="where-symbol layers-symbol"></i>';view.onclick=()=>show(root.closest('.where-window'),'tool',view,api);map.root.querySelector('.zoom').prepend(view);
  location.onclick=()=>{if(locating)return;if(!navigator.geolocation){status('Geolocation is not supported in this environment.',true);return;}locating=true;location.disabled=true;location.setAttribute('aria-busy','true');navigator.geolocation.getCurrentPosition(result=>{if(!alive)return;locating=false;location.disabled=false;location.removeAttribute('aria-busy');const xy=[result.coords.longitude,result.coords.latitude];if(xy[0]<7.58||xy[0]>7.69||xy[1]<46.71||xy[1]>46.80){status('Your location is outside the offline Thun map.',true);return;}ownPosition=xy;state.location=xy;commit();map.focus([{xy}]);paint();status('');},error=>{if(!alive)return;locating=false;location.disabled=false;location.removeAttribute('aria-busy');status(error.code===1?'Location permission is denied.':error.code===3?'Location timed out. Please try again.':'Your location is currently unavailable.',true);},{enableHighAccuracy:true,timeout:12000,maximumAge:30000});};
  const api={snapshot,cancelActive(){if(editing){closeEditor();return true;}if(!tool)return false;stopMeasure();return true;},visible:id=>state.layers[id]!==false,toggle(id){state.layers[id]=state.layers[id]===false;applyLayers();commit();},setTool,tool:()=>tool,destroy(){alive=false;abort.abort();cancelAnimationFrame(paintFrame);closeEditor();overlay.remove();pins.remove();distances.remove();distanceLabels.clear();if(anchor&&(root.contains(anchor)||anchor.closest('.where-window')===root.closest('.where-window')))dismiss();}};
  // Phone shares actions, with the menu in its own search toolbar.
  if(root.closest('#phone')){const b=node('button','where-phone-tool','tool');b.type='button';b.setAttribute('aria-haspopup','menu');b.onclick=()=>show(null,'tool',b,api);root.querySelector('.where-search').append(b);}
  applyLayers();refreshPins();return api;
 }
 return{attach,mount,dismiss,dismissTransient(){if(popup){dismiss();return true;}if(current(activeWindow)?.cancelActive())return true;const pane=window.CabanonWherePanes?.state(activeWindow)?.active;return pane?.querySelector('.where-app')?.whereSearchUI?.cancelActive()||false;}};
})();
