'use strict';
function seedFolderContent(){ensureEntries();prefs.content ||= {};prefs.folderContentSeeded=true;persistProfiles();}
seedFolderContent();
const readerOpenFile=openFile;
openFile=function(name,options={}){
 if(fileIsFolder(name)||fileLeafName(name).toLowerCase()==='cabanon.help')return readerOpenFile(name,options);
 ensureEntries();const entry=prefs.entries.find(entry=>entry.name===name);if(entry?.shortcut)return openFile(entry.target,options);
 const win=readerOpenFile(name,options)||windowMap.get('file:'+name);
 if(win){if(prefs.content?.[name]===undefined){prefs.content ||= {};prefs.content[name]='';persistProfiles();}win.querySelector('.window-content').innerHTML=`<h1>${escapeHTML(fileLeafName(name))}</h1><article class="test-file-content">${escapeHTML(prefs.content[name])}</article>`;}
 return win;
};
const profileWithContent=refreshUserIcon;refreshUserIcon=function(){profileWithContent();seedFolderContent();};
