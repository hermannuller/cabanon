'use strict';
// Shortcut identity follows the original file across renames and moves.
const openBeforeDesktopShortcuts=openFile;
openFile=function(name,options={}){
 const canonical=fileCanonicalName(name,options.sourceList?.dataset.path||activeWindow?.dataset.fileBrowser);
 let entry=prefs.entries.find(item=>item.name===canonical),seen=new Set();
 if(!entry?.shortcut)return openBeforeDesktopShortcuts(name,options);
 while(entry?.shortcut){
  if(seen.has(entry.id)){warning('Shortcut target unavailable.');return;}
  seen.add(entry.id);entry=prefs.entries.find(item=>entry.targetId?item.id===entry.targetId:item.name===entry.target);
 }
 if(!entry){warning('Shortcut target unavailable.');return;}
 return openBeforeDesktopShortcuts(entry.name,options);
};
const createBeforeDesktopShortcuts=CabanonCreation.create;
CabanonCreation.create=function(path,options={}){
 if(path===NOW_PATH){warning('now holds shortcuts. Drag a file here.');return null;}
 return createBeforeDesktopShortcuts(path,options);
};
