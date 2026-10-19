'use strict';
// Shared CSS geometry. The surrounding buttons keep their existing hit areas.
function cssIcon(name,extra=''){return `<span class="css-icon css-icon--${name} ${extra}" aria-hidden="true"></span>`;}
function closeMark(){return `<span class="cabanon-close-mark" aria-hidden="true"><span class="cabanon-close-source">×</span>${cssIcon('close','cabanon-close-symbol')}</span>`;}
function updateWindowControls(win){
 win.querySelectorAll('.titlebar [data-win]').forEach(button=>{
  const type=button.dataset.win;
  const shape=type==='max'&&win.classList.contains('maximized')?'restore':type;
  if(button.dataset.shape===shape)return;
  button.dataset.shape=shape;
  button.innerHTML=cssIcon(shape,'window-control-symbol '+(shape==='close'?'cabanon-close-symbol':''));
  const label=shape==='restore'?'Restore':type==='max'?'Maximize':type==='min'?'Minimize':'Close';button.setAttribute('aria-label',label);button.title=label;
 });
}
const windowWithControls=createWindow;
createWindow=function(key,title,glyph,content){const win=windowWithControls(key,title,glyph,content);updateWindowControls(win);return win;};
new MutationObserver(records=>{for(const record of records){if(record.target.classList?.contains('window'))updateWindowControls(record.target);}}).observe($('#windows'),{subtree:true,attributes:true,attributeFilter:['class']});
