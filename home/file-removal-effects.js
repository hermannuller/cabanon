'use strict';
const pendingFileRemovals=new Set(),fileRemovalEffects=new Set();
function cancelPendingFileRemovals(){if(!fileRemovalEffects.size)return false;for(const effect of fileRemovalEffects){effect.cancelled=true;for(const {animation}of effect.animations)animation.cancel();}return true;}
let removalMeasureCanvas;
const removalSegmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter(undefined,{granularity:'grapheme'}):null;
function performFileRemoval(names,action){
 const targets=new Set(names);if([...targets].some(name=>pendingFileRemovals.has(name)))return;
 const rows=[...document.querySelectorAll('.file[data-entry],.file[data-file],.file[data-search-file],.folder-row[data-folder]')].filter(row=>targets.has(row.dataset.entry||row.dataset.file||row.dataset.searchFile||row.dataset.folder));
 const animations=[],decorated=[];removalMeasureCanvas ||= document.createElement('canvas');const measure=removalMeasureCanvas.getContext('2d');
 for(const row of rows){const label=row.querySelector('.paragraph-name')||row.querySelector(':scope > span:last-of-type');if(!label||!row.getClientRects().length)continue;const bounds=row.getBoundingClientRect(),viewport=row.closest('.house-file-list,#file-results,#recent-files,#folders')?.getBoundingClientRect();if(viewport&&(bounds.bottom<=viewport.top||bounds.top>=viewport.bottom||bounds.right<=viewport.left||bounds.left>=viewport.right))continue;
  const text=label.textContent,chars=removalSegmenter?[...removalSegmenter.segment(text)].map(part=>part.segment):Array.from(text);if(!chars.length)continue;
  const style=getComputedStyle(label),width=label.getBoundingClientRect().width;measure.font=style.fontWeight+' '+style.fontSize+' '+style.fontFamily;const spacing=parseFloat(style.letterSpacing)||0,frames=[];
  for(let count=chars.length;count>=0;count--){const remaining=chars.slice(0,count).join(''),ink=count?measure.measureText(remaining).width+Math.max(0,count-1)*spacing:0;frames.push({clipPath:'inset(0 '+Math.max(0,width-Math.min(width,ink))+'px 0 0)',offset:(chars.length-count)/chars.length,easing:'steps(1,end)'});}
  row.classList.add('file-removing');decorated.push(row);const animation=label.animate(frames,{duration:chars.length*10,fill:'forwards'});animations.push({animation,row});
 }
 if(!animations.length)return action();
 const effect={animations,cancelled:false,profile:activeProfile};fileRemovalEffects.add(effect);
 for(const name of targets)pendingFileRemovals.add(name);
 const finished=animations.map(({animation,row})=>animation.finished.catch(()=>{}).then(()=>{if(!effect.cancelled)row.classList.add('file-delete-text-done');}));
 return Promise.all(finished).then(()=>{if(!effect.cancelled&&effect.profile===activeProfile)return action();}).finally(()=>{fileRemovalEffects.delete(effect);for(const name of targets)pendingFileRemovals.delete(name);for(const {animation}of animations)animation.cancel();for(const row of decorated)row.classList.remove('file-removing','file-delete-text-done');});
}

function animateCreatedFileName(name,options={}){
 const rows=options.rows||[...document.querySelectorAll('.house-file-list .file[data-entry]')].filter(row=>row.dataset.entry===name&&row.getClientRects().length);removalMeasureCanvas ||= document.createElement('canvas');const measure=removalMeasureCanvas.getContext('2d');
 for(const row of rows){const label=row.querySelector('.paragraph-name')||row.querySelector(':scope > span:last-of-type');if(!label)continue;const rect=row.getBoundingClientRect(),viewport=row.closest('.house-file-list,.wall-chooser-list,.rive-picker-list,#file-results,#files')?.getBoundingClientRect();if(viewport&&(rect.bottom<=viewport.top||rect.top>=viewport.bottom||rect.right<=viewport.left||rect.left>=viewport.right))continue;const text=label.textContent,chars=removalSegmenter?[...removalSegmenter.segment(text)].map(part=>part.segment):Array.from(text);if(!chars.length)continue;const style=getComputedStyle(label),width=label.getBoundingClientRect().width,spacing=parseFloat(style.letterSpacing)||0;measure.font=style.fontWeight+' '+style.fontSize+' '+style.fontFamily;const frames=[];for(let count=0;count<=chars.length;count++){const ink=count?measure.measureText(chars.slice(0,count).join('')).width+Math.max(0,count-1)*spacing:0;frames.push({clipPath:count===chars.length?'inset(0 0 0 0)':'inset(0 '+Math.max(0,width-Math.min(width,ink))+'px 0 0)',offset:count/chars.length,easing:'steps(1,end)'});}row.classList.add('file-creating');const animation=label.animate(frames,{duration:chars.length*20,fill:'both'});animation.currentTime=options.elapsed||0;animation.finished.catch(()=>{}).finally(()=>{animation.cancel();row.classList.remove('file-creating');});}
}
