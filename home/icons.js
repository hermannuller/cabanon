'use strict';
const solidAppPaths={
 unfinished:'M2 2h28v28H2z',
 river:'M1 12h15V8h15v4H16v4H1zM1 20h15v-4h15v4H16v4H1z',
 blind:'M2 2h28v28H2zM7 15.5h18v1H7z',
 folder:'M2 5h11l4 4h13v20H2z',
 text:'M3 2h26v28H3zM7 8v3h18V8zM7 14v3h18v-3zM7 20v3h12v-3z',
 grid:'M2 2h28v28H2zM6 6v5h5V6zM14 6v5h4V6zM21 6v5h5V6zM6 14v4h5v-4zM14 14v4h4v-4zM21 14v4h5v-4zM6 21v5h5v-5zM14 21v5h4v-5zM21 21v5h5v-5z',
 chat:'M2 3h28v21H11l-9 7zM7 9v3h18V9zM7 16v3h12v-3z',
 headphones:'M2 16a14 14 0 0 1 28 0v13h-8V15h4a10 10 0 0 0-20 0h4v14H2z',
 radio:'M3 7L27 1l1 3L4 10zM2 12h28v18H2zM5 21a5 5 0 1 0 10 0 5 5 0 0 0-10 0M18 17v3h9v-3zM18 23v3h9v-3z',
 calculator:'M5 1h22v30H5zM9 5v7h14V5zM9 16v3h3v-3zM15 16v3h3v-3zM21 16v3h3v-3zM9 23v3h3v-3zM15 23v3h3v-3zM21 23v3h3v-3z',
 music:'M10 5l19-4v23c0 6-10 9-10 3 0-4 5-6 7-5V8L13 11v16c0 6-11 7-11 2 0-4 5-6 8-5z',
 globe:'M16 1a15 15 0 1 1 0 30 15 15 0 0 1 0-30M4 14h7l2-10a12 12 0 0 0-9 10M15 4l-1 10h4L17 4zM20 14h8A12 12 0 0 0 19 4zM4 18a12 12 0 0 0 9 10l-2-10zM14 18l1 10h2l1-10zM20 18l-1 10a12 12 0 0 0 9-10z',
 user:'M16 2a7 7 0 1 1 0 14 7 7 0 0 1 0-14M3 31c0-17 26-17 26 0z',
 zip:'M4 1h24v30H4zM14 1v4h4V1zM10 5v4h4V5zM14 9v4h4V9zM10 13v4h4v-4zM14 17v4h4v-4zM12 23v5h6v-5z'
};
function appIcon(glyph){const motion=motionAppIcon(glyph);if(motion)return motion;if(glyph==='colors')return '<span class="software-icon colors-icon" aria-hidden="true"></span>';const custom=customIconMarkup(glyph,'solid');if(!custom&&glyph==='wall')return '<svg class="software-icon" viewBox="0 0 32 32" aria-hidden="true" style="fill:none;stroke:currentColor;stroke-width:1.4"><path d="M3 23C28 1 2 2 22 26S32 8 9 6 2 29 28 13 12 1 7 23 30 28 24 4M2 13Q29 28 17 3Q4 1 29 24"/></svg>';return custom?custom.replace(/<svg\b/,'<svg class="software-icon"'):`<svg class="software-icon" viewBox="0 0 32 32" aria-hidden="true"><path fill-rule="evenodd" d="${solidAppPaths[glyph]||solidAppPaths.text}"/></svg>`;}
// The from panel contains direct controls; only desktop recent-file entries carry shortcut signs.
renderPins=function(){baseRenderPins();$('#pinned').querySelectorAll('[data-app]').forEach(button=>{const app=apps.find(item=>item.name===button.dataset.app);button.innerHTML=`${appIcon(app.glyph)}<span>${escapeHTML(appLabel(app.name))}</span>`;});};
const outlinedRenderAll=renderAll;
renderAll=function(){outlinedRenderAll();$('#app-grid').querySelectorAll('[data-app]').forEach(button=>{const app=apps.find(item=>item.name===button.dataset.app);button.innerHTML=`${appIcon(app.glyph)}<span>${escapeHTML(appLabel(app.name))}</span>`;});};
const standardCreateWindow=createWindow;
createWindow=function(key,title,glyph,content){const win=standardCreateWindow(key,title,glyph,content);if(key.startsWith('app:')){const app=apps.find(app=>app.name===canonicalAppName(key.slice(4))),mark=win.querySelector('.window-title > svg,.window-title > .colors-icon,.window-title > .app-motion');if(mark)mark.outerHTML=appIcon(app?.glyph||glyph);}return win;};
renderPins();renderDesktop();

