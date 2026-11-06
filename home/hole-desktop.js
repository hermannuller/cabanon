'use strict';
// Two protected desktop folders: real files in pocket, references in now.
const HOLE_PATH='/house/pocket';
const HOLE_LABEL='pocket';
const NOW_PATH='/house/now';
const desktopProtectedPath=name=>[HOLE_PATH,NOW_PATH].includes(name);
function holeEnsure(){
 let entry=prefs.entries.find(item=>item.name===HOLE_PATH);
 if(!entry){
  entry={id:'folder:'+crypto.randomUUID(),name:HOLE_PATH,parent:'/house',folder:true};
  prefs.entries.push(entry);
 }else if(!entry.folder||entry.shortcut){
  entry.folder=true;delete entry.shortcut;delete entry.target;delete prefs.content[HOLE_PATH];
 }
 if(!prefs.files.includes(HOLE_PATH))prefs.files.push(HOLE_PATH);
 let now=prefs.entries.find(item=>item.name===NOW_PATH);
 if(!now){now={id:'folder:'+crypto.randomUUID(),name:NOW_PATH,parent:'/house',folder:true,desktopNow:true};prefs.entries.push(now);}
 if(!prefs.files.includes(NOW_PATH))prefs.files.push(NOW_PATH);
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
function nowRow(){
 const row=document.createElement('button');row.className='file';row.dataset.file=NOW_PATH;row.dataset.hole='true';row.dataset.now='true';row.title=NOW_PATH;
 const saved=prefs.nowPosition||{x:300,y:16};
 row.innerHTML=icon('now')+'<span>now</span>';row.style.left=Math.max(0,Math.min(1640,saved.x))+'px';row.style.top=Math.max(0,Math.min(1024,saved.y))+'px';return row;
}
function nowAddShortcuts(names){
 holeEnsure();let added=0;
 for(const name of names){
  const source=renameSource(name);if(!source||desktopProtectedPath(source.name))continue;
  if(prefs.entries.some(item=>item.parent===NOW_PATH&&item.shortcut&&(item.targetId===source.id||!item.targetId&&item.target===source.name)))continue;
  const path=uniqueName(fileLeafName(source.name)+'.link',NOW_PATH,false);
  prefs.entries.push({id:'file:'+crypto.randomUUID(),name:path,parent:NOW_PATH,folder:false,shortcut:true,target:source.name,targetId:source.id,readOnly:false});prefs.files.push(path);added++;
 }
 if(added){noteFileMutationPath(NOW_PATH);persistProfiles();refreshBrowsers(NOW_PATH);renderDesktop();}
 return added;
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
 const rows=[holeRow(),nowRow()];if(entry)rows.push(holePinRow(item,entry));
 files.replaceChildren(...rows);paintSelection(files);
}
renderDesktop=renderHoleDesktop;
function wallDesktopMenu(){
 const hidden=!!prefs.desktopHidden;
 const items=[
  ['Visual',()=>openSettings('visual','wallpaper')],
  ['open pocket',()=>openFolderBrowser(HOLE_PATH)],
  ['open now',()=>openFolderBrowser(NOW_PATH)],
  [hidden?'Show':'Hidden',()=>{prefs.desktopHidden=!hidden;persistProfiles();renderDesktop();}],
  ['return',()=>{prefs.holePosition={x:20,y:16};prefs.nowPosition={x:300,y:16};if(prefs.desktopItem){prefs.desktopItem.x=32;prefs.desktopItem.y=88;}persistProfiles();renderDesktop();}],
 ];
 if(prefs.desktopItem)items.push(['unpin',()=>clearDesktopItem()]);
 return items;
}
builders[CTX.DESKTOP_BG]=wallDesktopMenu;
builders[CTX.DESKTOP_LINK]=wallDesktopMenu;
const holeToDesktop=toDesktop;
toDesktop=function(name){const entry=renameSource(name);if(desktopProtectedPath(entry?.name))return;return holeToDesktop(name);};
const holeCommitRename=commitFileRename;
commitFileRename=function(sources,values,options={}){
 if((sources||[]).some(entry=>desktopProtectedPath(entry?.name))){warning('pocket and now cannot be renamed.');return false;}
 return holeCommitRename(sources,values,options);
};
const holeDeleteFile=deleteFile;
deleteFile=function(name){if(desktopProtectedPath(name))return;return holeDeleteFile(name);};
const holeFolderDelete=folderDelete;
folderDelete=function(names,burn){const rest=names.filter(name=>!desktopProtectedPath(folderPath(name)));if(rest.length)return holeFolderDelete(rest,burn);};
const holeRemoval=performFileRemoval;
performFileRemoval=function(names,action){
 const list=[...(names||[])];if(!list.some(desktopProtectedPath))return holeRemoval(list,action);
 const rest=list.filter(name=>!desktopProtectedPath(name));
 return rest.length?holeRemoval(rest,action):Promise.resolve();
};
const holeTransfer=transferFiles;
transferFiles=function(names,source,destination,options){
 if((names||[]).some(desktopProtectedPath)){warning('pocket and now cannot be moved.');return;}
 if(destination===NOW_PATH){nowAddShortcuts(names);return 'copy';}
 return holeTransfer(names,source,destination,options);
};
holeEnsure();holeNormalizePrefs();persistProfiles();renderDesktop();
