'use strict';
// Registered before configurable shortcuts so Escape and Ctrl+Q have one meaning.
const exitDrafts=new WeakMap();
function exitDraftSignature(win){return JSON.stringify([...win.querySelectorAll('input:not(.setting-search),textarea,select,.setting-swatch')].map(node=>[node.type,node.type==='checkbox'?node.checked:node.value,node.style.backgroundColor]));}
new MutationObserver(()=>{for(const win of windowMap.values())if(!exitDrafts.has(win))exitDrafts.set(win,exitDraftSignature(win));}).observe($('#windows'),{childList:true,subtree:true});
function exitHasUnsaved(win){
 if(typeof wallState!=='undefined'&&wallState?.win===win){wallUpdateSaveButton(wallState,wallState.model.serialize());if(wallState.wallDirty)return true;}
 if(typeof paragraphLiveEditors!=='undefined')for(const editor of paragraphLiveEditors)if(editor.win===win&&editor.records.some(record=>record.name!==record.saved))return true;
 if([...win.querySelectorAll('button')].some(button=>!button.disabled&&(/^(save|save id|save changes)$/i.test(button.textContent.trim()))))return true;
 return !!win.querySelector('.setting-dialog')&&exitDrafts.has(win)&&exitDrafts.get(win)!==exitDraftSignature(win);
}
function exitProgramType(win){const key=win.dataset.key;return key.startsWith('wall:')||win.dataset.ownerApp==='BERLIN'?'app:BERLIN':key.startsWith('setting-dialog:')?'system:settings':windowType(key,win);}
function quitCurrentProgram(){
 const current=activeWindow;if(!current||current.hidden)return;
 const type=exitProgramType(current);
 const targets=[...windowMap.values()].filter(win=>exitProgramType(win)===type);
 // Close one document at a time through its own save/quit/cancel flow.
 // Auxiliary BERLIN windows are closed by their owning document.
 closeDocumentWindows(targets);
}
function closeDocumentWindows(targets){
 window.dispatchEvent(new Event('document-close-cancel'));
 const queue=targets.filter(win=>!win.dataset.wallAux).reverse();
 let observer=null,stopped=false;
 const stop=()=>{stopped=true;observer?.disconnect();window.removeEventListener('document-close-cancel',stop);};
 const next=()=>{if(stopped)return;const win=queue.shift();if(!win){stop();closePanels();renderTaskbar();return;}if(!win.isConnected){next();return;}
 observer=new MutationObserver(()=>{if(!win.isConnected){observer.disconnect();next();}});
 observer.observe($('#windows'),{childList:true,subtree:true});
 closeShortcutWindow(win);
 if(!win.isConnected){observer.disconnect();next();}
 };
 window.addEventListener('document-close-cancel',stop);next();
}
window.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&event.target.matches('.save-entry-rename,.title-name-input'))return;
 window.dismissWelcome?.();
 const escape=event.key==='Escape'&&!event.ctrlKey&&!event.altKey&&!event.metaKey;
 const menuWasOpen=!context.hidden;if(menuWasOpen)closeContext();if(escape&&menuWasOpen){event.preventDefault();event.stopImmediatePropagation();return;}
 const quit=event.ctrlKey&&!event.altKey&&!event.metaKey&&!event.shiftKey&&event.key.toLowerCase()==='q';
 if(!escape&&!quit)return;
 event.preventDefault();event.stopImmediatePropagation();if(event.repeat)return;
 if(escape&&window.CabanonDragFeedback?.cancelActive())return;
 if(quit){if(!document.querySelector('.removal-confirmation'))quitCurrentProgram();return;}
 const confirmation=document.querySelector('.removal-confirmation');if(confirmation){confirmation.querySelector('[data-close-choice=cancel],[data-answer=no]')?.click();return;}
 const win=activeWindow;if(win&&!win.hidden)closeShortcutWindow(win);
},true);


