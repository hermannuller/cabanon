'use strict';
// Shapes are clipped to the initial visible viewport; work is bounded by its pixels.
window.CabanonSelectionShapes=(()=>{
 function point(g,event){const v=g.geometry.viewport;return{x:Math.max(v.left,Math.min(v.right,event.clientX)),y:Math.max(v.top,Math.min(v.bottom,event.clientY))};}
 function init(g){const v=g.geometry.viewport,width=Math.max(1,Math.ceil(v.right-v.left)),height=Math.max(1,Math.ceil(v.bottom-v.top)),mask=document.createElement('canvas'),canvas=document.createElement('canvas');mask.width=canvas.width=width;mask.height=canvas.height=height;g.frame.replaceChildren(canvas);g.frame.classList.add('file-shape-frame');g.shapeMask=mask;g.shapeCanvas=canvas;g.shapeContext=mask.getContext('2d',{willReadFrequently:true});g.shapeContext.fillStyle='#fff';Object.assign(g.frame.style,{left:(v.left-g.geometry.desktop.left)/g.geometry.scale+'px',top:(v.top-g.geometry.desktop.top)/g.geometry.scale+'px',width:width/g.geometry.scale+'px',height:height/g.geometry.scale+'px'});canvas.style.width='100%';canvas.style.height='100%';}
 function polygon(g,points,clear=true){const c=g.shapeContext,v=g.geometry.viewport;if(clear)c.clearRect(0,0,g.shapeMask.width,g.shapeMask.height);if(points.length<3)return;c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x-v.left,p.y-v.top):c.moveTo(p.x-v.left,p.y-v.top));c.closePath();c.fill('evenodd');}
 function paint(g,event){const p=point(g,event),v=g.geometry.viewport,start={x:Math.max(v.left,Math.min(v.right,g.x)),y:Math.max(v.top,Math.min(v.bottom,g.y))};
  if(!g.shapeLocked&&g.button===0){g.shapeLocked=g.startFrom?'lasso':g.startAlt?'radial':null;}
  let kind=g.shapeLocked||'rectangle';
  if(kind==='rectangle'&&g.button===0&&event.shiftKey){if(!g.shear){const r=g.lastRectangle||{left:Math.min(start.x,p.x),right:Math.max(start.x,p.x),endX:p.x};g.shear={left:r.left,right:r.right,endX:r.endX};}kind='shear';}else if(!event.shiftKey)g.shear=null;
  g.selectionShape=kind;
  if(kind==='rectangle'){g.lastRectangle={left:Math.min(start.x,p.x),right:Math.max(start.x,p.x),endX:p.x};if(g.shapeMask){g.frame.replaceChildren();g.frame.classList.remove('file-shape-frame');g.shapeMask=g.shapeCanvas=g.shapeContext=null;}return null;}
  if(!g.shapeMask)init(g);
  if(kind==='shear'){const shift=p.x-g.shear.endX;polygon(g,[{x:g.shear.left,y:start.y},{x:g.shear.right,y:start.y},{x:g.shear.right+shift,y:p.y},{x:g.shear.left+shift,y:p.y}]);}
  const samples=(g.selectionSamples?.length?g.selectionSamples:[event]).map(sample=>point(g,sample));g.selectionSamples=[];
  if(kind==='lasso'){g.shapePoints ||= [start];for(const sample of samples){const last=g.shapePoints.at(-1);if(Math.hypot(sample.x-last.x,sample.y-last.y)>=1)g.shapePoints.push(sample);}polygon(g,g.shapePoints);}
  if(kind==='radial'){g.sweepPrevious ||= start;for(const sample of samples){polygon(g,[start,g.sweepPrevious,sample],false);g.sweepPrevious=sample;}}
  const c=g.shapeCanvas.getContext('2d');c.clearRect(0,0,g.shapeCanvas.width,g.shapeCanvas.height);c.drawImage(g.shapeMask,0,0);c.globalCompositeOperation='source-in';c.fillStyle='#41434288';c.fillRect(0,0,g.shapeCanvas.width,g.shapeCanvas.height);c.globalCompositeOperation='source-over';g.shapePixels=g.shapeContext.getImageData(0,0,g.shapeMask.width,g.shapeMask.height).data;return g;
 }
 function hits(g,rect){const v=g.geometry.viewport,w=g.shapeMask.width,h=g.shapeMask.height,full=prefs.selectionContain;if(full&&(rect.left<v.left||rect.right>v.right||rect.top<v.top||rect.bottom>v.bottom))return false;const left=Math.max(0,Math.floor(rect.left-v.left)),right=Math.min(w,Math.ceil(rect.right-v.left)),top=Math.max(0,Math.floor(rect.top-v.top)),bottom=Math.min(h,Math.ceil(rect.bottom-v.top));if(right<=left||bottom<=top)return false;for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){const inside=g.shapePixels[(y*w+x)*4+3]>=128;if(full&&!inside)return false;if(!full&&inside)return true;}return full;}
 function refreshShift(event){const g=typeof fileGesture!=='undefined'&&fileGesture;if(!g?.moved||g.button!==0||g.mode!=='box'||g.shapeLocked)return;flushSelectionBox(g);const last=g.lastSelectionPoint||{clientX:g.x,clientY:g.y};g.lastBoxEvent={...last,shiftKey:event.type==='keydown'};flushSelectionBox(g);}
 for(const type of ['keydown','keyup'])addEventListener(type,event=>{if(event.key==='Shift')refreshShift(event);},true);
 addEventListener('wheel',event=>{if(typeof fileGesture!=='undefined'&&fileGesture?.mode==='box'&&fileGesture.moved){event.preventDefault();event.stopImmediatePropagation();}},{capture:true,passive:false});
 return{paint,hits};
})();
window.CabanonFromKey=(()=>{
 let held=false,used=false;const otherKeys=new Set();
 function key(down){if(down){if(held)return;else{held=true;used=otherKeys.size>0||Boolean(window.CabanonModifierTap?.active);}}else{const toggle=held&&!used;held=false;if(toggle)document.getElementById('start')?.click();}}
 addEventListener('cabanon-from-key',event=>key(Boolean(event.detail.down)));
 addEventListener('keydown',event=>{if(event.key==='Meta'||event.key==='OS'){if(!event.repeat)key(true);return;}otherKeys.add(event.code||event.key);if(held)used=true;},true);
 addEventListener('keyup',event=>{otherKeys.delete(event.code||event.key);if(['Meta','OS'].includes(event.key))key(false);},true);
 for(const type of ['pointerdown','pointermove','wheel'])addEventListener(type,()=>{if(held)used=true;},{capture:true,passive:true});
 addEventListener('blur',()=>{held=false;used=true;otherKeys.clear();},true);
 return{get held(){return held;}};
})();
