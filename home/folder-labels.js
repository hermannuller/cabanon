'use strict';
function shortFolderLabels(root=document){
 [...(root.matches?.('[data-entry],[data-folder],[data-search-file],[data-file-open]')?[root]:[]),...root.querySelectorAll('[data-entry],[data-folder],[data-search-file],[data-file-open]')].forEach(button=>{
  if(button.classList.contains('paragraph-file'))return;
  const path=button.dataset.entry||button.dataset.folder||button.dataset.searchFile||button.dataset.fileOpen;
  if(!path?.startsWith('/'))return;
  const label=button.querySelector(':scope > span:last-child');if(!label||label.classList.contains('shortcut-icon'))return;
  const name=(fileIsFolder(path)?'/':'')+path.split('/').filter(Boolean).at(-1);if(label.textContent!==name)label.textContent=name;if(button.title!==path)button.title=path;
 });
 [...(root.matches?.('.house-navigation [data-nav]:not(.tree-line)')?[root]:[]),...root.querySelectorAll('.house-navigation [data-nav]:not(.tree-line)')].forEach(button=>{const path=button.dataset.nav;const name=(fileIsFolder(path)?'/':'')+path.split('/').filter(Boolean).at(-1);if(button.textContent!==name)button.textContent=name;if(button.title!==path)button.title=path;});
}
new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1)shortFolderLabels(node);}).observe($('#desktop'),{childList:true,subtree:true});shortFolderLabels();

