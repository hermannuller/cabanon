'use strict';
const customIconAssets={};
function readIconAsset(url){try{const request=new XMLHttpRequest();request.open('GET',url,false);request.send();return request.status===0||request.status===200?request.responseText:null;}catch{return null;}}
try{const manifest=JSON.parse(readIconAsset('icons/manifest.json')||'{}');for(const [key,file]of Object.entries(manifest)){const text=readIconAsset('icons/'+file);if(text&&/<svg\b/i.test(text))customIconAssets[key]=text;}}catch{}
function customIconMarkup(name,variant){return customIconAssets[name+'.'+variant]||null;}
function motionAppIcon(name){if(name==='river')return `<span class="software-icon app-motion app-motion--river" data-app-icon="river" aria-hidden="true"><span class="river-logo-track">${Array.from({length:8},(_,i)=>i-3).map(step=>[0,1].map(row=>`<i class="river-logo-bar" style="left:${step*150}%;top:${37.5-step*12.5+row*25}%"></i>`).join('')).join('')}</span></span>`;if(name==='empty')return `<span class="software-icon app-motion app-motion--empty" data-app-icon="empty" aria-hidden="true">${Array.from({length:4},(_,i)=>`<i class="empty-snow" style="${emptySnowStyle()};animation-delay:-${i*.85}s"></i>`).join('')}</span>`;return ['pnyx','dial'].includes(name)?`<span class="software-icon app-motion app-motion--${name}" data-app-icon="${name}" aria-hidden="true"></span>`:null;}

function emptySnowStyle(){return `--snow-x:${25+Math.random()*50}%;--snow-sway:${8+Math.random()*12}%;animation-duration:${3.2+Math.random()*2}s`;}
document.addEventListener('animationiteration',event=>{if(event.animationName!=='empty-snow-fall'||!event.target.matches('.empty-snow'))return;const dot=event.target;dot.style.setProperty('--snow-x',`${25+Math.random()*50}%`);dot.style.setProperty('--snow-sway',`${8+Math.random()*12}%`);});

// A focused in-app window is inactive while the whole desktop app loses OS focus.
addEventListener('blur',()=>document.documentElement.classList.add('cabanon-window-blurred'));
addEventListener('focus',()=>document.documentElement.classList.remove('cabanon-window-blurred'));
document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('cabanon-window-blurred',document.hidden||!document.hasFocus()));
