'use strict';
// The wall holds exactly one protected temp folder and one optional pin.
const HOLE_PATH='/house/holle';
const HOLE_LABEL='holle';
function holeEnsure(){
 let entry=prefs.entries.find(item=>item.name===HOLE_PATH);
 if(!entry){
  entry={id:'folder:'+crypto.randomUUID(),name:HOLE_PATH,parent:'/house',folder:true};
  prefs.entries.push(entry);
 }else if(!entry.folder||entry.shortcut){
  entry.folder=true;delete entry.shortcut;delete entry.target;delete prefs.content[HOLE_PATH];
 }
 if(!prefs.files.includes(HOLE_PATH))prefs.files.push(HOLE_PATH);
 return entry;
}
function holeNormalizePrefs(){
 if((prefs.desktopLinks||[]).length||(prefs.desktopOrder||[]).length||prefs.desktopSort){prefs.desktopLinks=[];prefs.desktopOrder=[];delete prefs.desktopSort;}
}
function holePlacement(){
 const saved=prefs.holePosition||{};
 return {x:Math.max(0,Math.min(1640,Number.isFinite(saved.x)?saved.x:20)),y:Math.max(0,Math.min(1024,Number.isFinite(saved.y)?saved.y:16))};
}
function holeRow(){
 const row=document.createElement('button');row.className='file';row.dataset.file=HOLE_PATH;row.dataset.hole='true';row.title=HOLE_PATH;
 const place=holePlacement();
 row.innerHTML=icon('hole')+'<span>'+escapeHTML(HOLE_LABEL)+'</span>';row.style.left=place.x+'px';row.style.top=place.y+'px';return row;
}
function holePinRow(item,entry){
 const row=document.createElement('button');row.className='file';row.dataset.file=entry.name;row.title=entry.name;
 row.innerHTML=icon(glyphFor(entry.name))+'<span>'+escapeHTML(entry.name.split('/').at(-1))+'</span>';
 if(!Number.isFinite(item.x)||item.x<0)item.x=20;if(!Number.isFinite(item.y)||item.y<72)item.y=88;
 row.style.left=Math.max(0,Math.min(1640,item.x))+'px';row.style.top=Math.max(0,Math.min(952,item.y))+'px';return row;
}
function renderHoleDesktop(){
 migrateSingleDesktop();holeEnsure();holeNormalizePrefs();
 const files=$('#files');
 const item=prefs.desktopItem,entry=item&&prefs.entries.find(candidate=>candidate.name===item.name&&candidate.name!==HOLE_PATH);
 if(item&&!entry)prefs.desktopItem=null;
 if(prefs.desktopHidden){files.hidden=true;files.replaceChildren();paintSelection(files);return;}
 files.hidden=false;
 const rows=[holeRow()];if(entry)rows.push(holePinRow(item,entry));
 files.replaceChildren(...rows);paintSelection(files);
}
renderDesktop=renderHoleDesktop;
function wallDesktopMenu(){
 const hidden=!!prefs.desktopHidden;
 const items=[
  ['Setting wall',()=>openSettings('visual','wallpaper')],
  ['open holle',()=>openFolderBrowser(HOLE_PATH)],
  [hidden?'Show':'Hidden',()=>{prefs.desktopHidden=!hidden;persistProfiles();renderDesktop();}],
  ['return',()=>{prefs.holePosition={x:20,y:16};if(prefs.desktopItem){prefs.desktopItem.x=32;prefs.desktopItem.y=88;}persistProfiles();renderDesktop();}],
 ];
 if(prefs.desktopItem)items.push(['unpin',()=>clearDesktopItem()]);
 return items;
}
builders[CTX.DESKTOP_BG]=wallDesktopMenu;
builders[CTX.DESKTOP_LINK]=wallDesktopMenu;
const holeToDesktop=toDesktop;
toDesktop=function(name){const entry=renameSource(name);if(entry?.name===HOLE_PATH)return;return holeToDesktop(name);};
const holeCommitRename=commitFileRename;
commitFileRename=function(sources,values,options={}){
 if((sources||[]).some(entry=>entry?.name===HOLE_PATH)){warning(HOLE_LABEL+' cannot be renamed.');return false;}
 return holeCommitRename(sources,values,options);
};
const holeDeleteFile=deleteFile;
deleteFile=function(name){if(name===HOLE_PATH)return;return holeDeleteFile(name);};
const holeFolderDelete=folderDelete;
folderDelete=function(names,burn){const rest=names.filter(name=>folderPath(name)!==HOLE_PATH);if(rest.length)return holeFolderDelete(rest,burn);};
const holeRemoval=performFileRemoval;
performFileRemoval=function(names,action){
 const list=[...(names||[])];if(!list.includes(HOLE_PATH))return holeRemoval(list,action);
 const rest=list.filter(name=>name!==HOLE_PATH);
 return rest.length?holeRemoval(rest,action):Promise.resolve();
};
const holeTransfer=transferFiles;
transferFiles=function(names,source,destination,options){
 if((names||[]).includes(HOLE_PATH)){warning(HOLE_LABEL+' cannot be moved.');return;}
 return holeTransfer(names,source,destination,options);
};
holeEnsure();holeNormalizePrefs();persistProfiles();renderDesktop();
