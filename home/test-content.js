'use strict';
function seedFolderContent(){
 ensureEntries();prefs.content ||= {};
 if(!prefs.folderContentSeeded&&isOwner()){
  prefs.folderContentSeeded=true;
  const folders=prefs.entries.filter(entry=>entry.folder);
  for(const folder of folders){const parent=folderPath(folder.name),label=parent.split('/').at(-1);for(const [suffix,extension] of [['notes','txt'],['plan','md'],['budget','tsv'],['reading','txt'],['meeting','md'],['playlist','mp3'],['archive','zip']]){const name=uniqueName(label+'-'+suffix+'.'+extension,parent,false);prefs.entries.push({name,parent,folder:false});prefs.files.push(name);}}
 }
 for(const entry of prefs.entries.filter(entry=>!entry.folder)){
  if(fileLeafName(entry.name).toLowerCase()==='cabanon.help!'||prefs.content[entry.name]!==undefined)continue;
  const folder=entry.parent.split('/').at(-1);
  prefs.content[entry.name]=`Working notes\n\nThis document belongs to ${folder}. It is part of the Cabanon workspace.\n\nToday we reviewed the current ideas, arranged the next steps, and collected a few questions for later. The first task is to make the structure easy to understand. The second task is to keep the small details consistent.\n\nThings to try\n\nSelect this file together with another document. Copy it into a different folder, move it into a child folder, or create a shortcut. Open it again to check that its words have travelled with it.\n\nA quiet afternoon\n\nThe desk is clear except for a notebook and a cup of tea. Outside, the light is changing slowly. Someone has left a short list of places to visit: the library, the river, and the old workshop at the end of the street.\n\nNext steps\n\nRead the draft. Compare the alternatives. Save the useful parts. Return to the work tomorrow with fresh eyes.\n\nEnd of document.`;
 }
 persistProfiles();
}
seedFolderContent();
const readerOpenFile=openFile;
openFile=function(name,options={}){
 if(fileIsFolder(name)||fileLeafName(name).toLowerCase()==='cabanon.help!')return readerOpenFile(name,options);
 ensureEntries();const entry=prefs.entries.find(entry=>entry.name===name);if(entry?.shortcut)return openFile(entry.target,options);
 const win=readerOpenFile(name,options)||windowMap.get('file:'+name);
 if(win){if(prefs.content?.[name]===undefined){prefs.content ||= {};prefs.content[name]='A new document\n\nThere is room here for the next idea.\n\nThis file is ready for your interaction tests.';persistProfiles();}win.querySelector('.window-content').innerHTML=`<h1>${escapeHTML(fileLeafName(name))}</h1><article class="test-file-content">${escapeHTML(prefs.content[name])}</article>`;}
 return win;
};
const profileWithContent=refreshUserIcon;refreshUserIcon=function(){profileWithContent();seedFolderContent();};
