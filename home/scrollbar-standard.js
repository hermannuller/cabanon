'use strict';
const scrollportSelector='.help-topic-list,.help-page-paper,.help-save-list,.canal-shelf,.canal-outline,.canal-paper,.canal-paper>textarea,.canal-ideas>textarea,.canal-store-sidebar,.canal-store-scroll,.canal-dialog,.canal-book-detail,.canal-reader>aside,.canal-reader>article,#pinned,#folders,#flyout,#app-grid,#file-results,#taskbar,#task-popup,#context-menu,#sync-popover,.window-content,.house-file-list,.house-navigation,.tree-scroll-body,.quick-scroll-body,.code-surface,.help-reader nav,.help-reader article,.new-types,.header-new-menu,.pin-destinations,.wall-chooser-list,.river-main,.river-carry,.rive-list,.rive-messages,.rive-picker-list,.rive-attachments,.rive-reader-window .window-content,.rive-send>.rive-quote';
const registeredScrollports=new Set(),dirtyScrollports=new Set(),scrollportState=new WeakMap();
let scrollStandardPending=false;
function scheduleScrollport(node){if(!node?.isConnected)return;dirtyScrollports.add(node);if(scrollStandardPending)return;scrollStandardPending=true;requestAnimationFrame(()=>{scrollStandardPending=false;standardizeScrollports();});}
const scrollportResizeObserver=new ResizeObserver(entries=>entries.forEach(entry=>scheduleScrollport(entry.target)));
function registerScrollports(root){const nodes=[...(root.matches?.(scrollportSelector)?[root]:[]),...root.querySelectorAll(scrollportSelector)];for(const node of nodes){if(!registeredScrollports.has(node)){registeredScrollports.add(node);scrollportResizeObserver.observe(node);}scheduleScrollport(node);}}
function standardizeScrollports(){
 for(const node of [...dirtyScrollports]){
  dirtyScrollports.delete(node);
  if(!node.isConnected){scrollportResizeObserver.unobserve(node);registeredScrollports.delete(node);scrollportState.delete(node);continue;}
  const css=getComputedStyle(node),ox=css.overflowX,oy=css.overflowY;
  const scrollable=['auto','scroll'].includes(ox)||['auto','scroll'].includes(oy);
  if(node.classList.contains('standard-scrollport')!==scrollable)node.classList.toggle('standard-scrollport',scrollable);
  if(!scrollable){scrollportState.delete(node);continue;}
  const horizontal=['auto','scroll'].includes(ox)&&node.scrollWidth>node.clientWidth;
  const vertical=['auto','scroll'].includes(oy)&&node.scrollHeight>node.clientHeight;
  const prev=scrollportState.get(node);
  if(prev?.h===horizontal&&prev?.v===vertical)continue;
  scrollportState.set(node,{h:horizontal,v:vertical});
  for(const [property,value] of [['--scroll-end-y',horizontal?'-8px':'0px'],['--scroll-end-x',vertical?'-8px':'0px']])if(node.style.getPropertyValue(property)!==value)node.style.setProperty(property,value);
 }
}
new MutationObserver(records=>{for(const record of records){const node=record.target;if(node.closest?.('#drag-tether,#gesture-action-hint,.file-selection-frame'))continue;if(record.type==='childList'){for(const added of record.addedNodes)if(added.nodeType===1)registerScrollports(added);}}if(records.some(record=>record.removedNodes.length))for(const registered of registeredScrollports)if(!registered.isConnected){scrollportResizeObserver.unobserve(registered);registeredScrollports.delete(registered);dirtyScrollports.delete(registered);scrollportState.delete(registered);}}).observe($('#desktop'),{childList:true,subtree:true});
registerScrollports($('#desktop'));addEventListener('resize',()=>registeredScrollports.forEach(scheduleScrollport));
