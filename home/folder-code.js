'use strict';
// The second, empty code line accepts one typed > as a one-shot command.
window.CabanonFolderCode=(()=>{
 function plan(source){
  if(/[\x00-\x1f\u0085\u2028\u2029]/.test(String(source)))throw new Error(CabanonFilenames.message('characters'));
  const parts=String(source).split('^');
  if(parts.length>4)throw new Error('A folder group can contain at most 4 folders.');
  const entries=[...prefs.entries],result=[];
  for(const part of parts){
   let raw=part.trim(),create=false;
   if(raw.startsWith('*+')){create=true;raw=raw.slice(2).trim();}
   if(raw.startsWith('/'))raw=raw.slice(1);
   const names=raw.split('/');
   if(names.shift()!=='house'||names.some(name=>!name))throw new Error('Use a folder path such as house/book.');
   let path='/house',parent='/house',leaf='',found=null;
   for(let index=0;index<names.length;index++){
    const checked=CabanonFilenames.validate(names[index],true);
    if(checked.error)throw new Error(CabanonFilenames.message(checked.error));
    leaf=checked.name;parent=path;
    found=entries.find(entry=>entry.parent===syncPath(parent)&&CabanonFilenames.key(fileLeafName(entry.name))===CabanonFilenames.key(leaf));
    if(create&&index===names.length-1){
     const base=syncPath(parent);
     leaf=CabanonFilenames.unique(leaf,candidate=>entries.some(entry=>entry.parent===base&&CabanonFilenames.key(fileLeafName(entry.name))===CabanonFilenames.key(candidate)),true);
     path=base+'/'+leaf;
     entries.push({name:path,parent:base,folder:true});
    }else{
     if(!found?.folder)throw new Error('Folder not found: '+parent+'/'+leaf);
     path=found.name;
    }
   }
   if(create&&!names.length)throw new Error('Choose a new folder name inside house.');
   result.push({path,parent:syncPath(parent),name:leaf,create});
  }
  return result;
 }
 function keepEditor(win){
  toggleCode(win,true);
  const line=win.querySelectorAll('.code-line')[1];if(!line)return;
  line.focus({preventScroll:true});const range=document.createRange();range.selectNodeContents(line);range.collapse(false);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);
 }
 function execute(win,source){
  if(!win?.dataset.fileBrowser||!win.isConnected)return false;
  let commands;
  try{commands=plan(source);}catch(error){warning(error.message);return false;}
  // Validate access before any creation or changes to the pane group.
  for(const command of commands){
   const path=command.create?command.parent:command.path,locked=lockedAncestor(path);
   if(locked){requestFolderAccess(locked,()=>execute(win,source));return false;}
   if(!isOwner()&&prefs.folderPermissions[path]==='owner'){warning('Access denied');return false;}
   if(command.create&&prefs.entries.find(entry=>entry.name===path)?.readOnly){warning('Read only');return false;}
  }
  for(const editor of typeof paragraphLiveEditors!=='undefined'?paragraphLiveEditors:[])if(editor.win===win&&!editor.commit())return false;
  const paths=[];
  runFileMutation(()=>{
   for(const command of commands){
    const entry=command.create?CabanonCreation.create(command.parent,{name:command.name,folder:true,reveal:false}):null;
    paths.push(entry?entry.name:command.path);
   }
  });
  let state=folderSplits.get(win);
  while(state&&state.panes.length>paths.length){closeFolderPane(win,state.panes.at(-1));state=folderSplits.get(win);}
  if(paths.length===1)configureFolder(win,paths[0]);
  else{
   state=ensureFolderGroup(win);
   while(state.panes.length<paths.length)addFolderPane(win);
   for(const [index,pane]of state.panes.entries()){activateFolderPane(win,pane);configureFolder(win,paths[index]);}
   activateFolderPane(win,state.panes[0]);layoutFolderPanes(state,true);
  }
  focusWindow(win);keepEditor(win);renderTaskbar();return true;
 }
 return{plan,execute};
})();
