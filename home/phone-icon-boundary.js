/* Phone icon artwork fits CARE's 36px outer square; canvas and hit areas stay intact. */
'use strict';
(()=>{
 const root=document.querySelector('#phone'),seen=new WeakSet();let pending=false;
 const selectors='.phone-scroll-endpoint svg,.phone-group-prefix svg,.phone-preview-icon svg,.phone-weather-condition svg,.quick-button svg,.quick-connection-icon svg,.quick-slider-thumb svg,.quick-home-timer svg';
 function fit(svg){
  if(seen.has(svg))return;
  if(['quick-calculator','pdf-astro','pdf-zip'].includes(svg.dataset.cbnIcon)){seen.add(svg);return;}
  if(svg.dataset.cbnIcon&&svg.closest('.quick-button,.quick-connection-icon')){seen.add(svg);return;}
  if(svg.closest('.quick-home-timer,.phone-weather-condition')||svg.dataset.pdfIcon==='group'||svg.dataset.phoneGroupShape)return;
  const rect=svg.getBoundingClientRect(),view=svg.viewBox.baseVal;
  if(!rect.width||!rect.height||!view.width||!view.height)return;
  const shapes=[...svg.querySelectorAll('path,rect,circle,ellipse,line,polyline,polygon')];
  const stroke=svg.closest('.phone-scroll-endpoint')?1:2;let outlined=false;
  for(const shape of shapes){if(getComputedStyle(shape).stroke!=='none'){outlined=true;shape.style.setProperty('stroke-width',(svg.hasAttribute('data-help-animation')&&shape.tagName==='rect'?1:stroke)+'px','important');shape.style.vectorEffect='non-scaling-stroke';}}
  let box;try{box=svg.getBBox();}catch{return;}
  if(!box.width||!box.height)return;
  const unit=Math.min(rect.width/view.width,rect.height/view.height),limit=Math.min(36,rect.width,rect.height)-(outlined?stroke:0);
  const ratio=Math.min(1,limit/(Math.max(box.width,box.height)*unit));
  if(ratio<.9999){const group=document.createElementNS('http://www.w3.org/2000/svg','g');const cx=view.x+view.width/2,cy=view.y+view.height/2;group.setAttribute('transform',`translate(${cx} ${cy}) scale(${ratio}) translate(${-box.x-box.width/2} ${-box.y-box.height/2})`);while(svg.firstChild)group.append(svg.firstChild);svg.append(group);}
  seen.add(svg);svg.dataset.careBoundary='36';
 }
 function update(){pending=false;root.querySelectorAll(selectors).forEach(fit);}
 function schedule(){if(!pending){pending=true;requestAnimationFrame(update);}}
 new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
 addEventListener('resize',schedule);document.fonts.ready.then(schedule);schedule();
})();
