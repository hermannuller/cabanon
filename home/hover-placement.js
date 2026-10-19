'use strict';
const hoverMenuAnchors=new WeakMap();
function placeHoverMenu(menu,button){
 if(!menu||!button?.isConnected||menu.hidden)return;hoverMenuAnchors.set(menu,button);
 const desktop=$('#desktop'),bounds=desktop.getBoundingClientRect(),scale=bounds.width/1920;
 const set=(key,value)=>{if(menu.style[key]!==value)menu.style[key]=value;};
 set('maxWidth',desktop.clientWidth+'px');set('maxHeight',desktop.clientHeight+'px');set('translate','none');set('right','auto');set('bottom','auto');
 const anchor=button.getBoundingClientRect(),dock=menu===taskPopup;const x=Math.max(0,Math.min(desktop.clientWidth-menu.offsetWidth,((dock?anchor.left:anchor.right)-bounds.left)/scale)),y=Math.max(0,Math.min(desktop.clientHeight-menu.offsetHeight,(anchor.top-bounds.top)/scale-(dock?menu.offsetHeight:0)));
 const parent=menu.offsetParent||desktop,origin=parent.getBoundingClientRect();
 set('left',((bounds.left-origin.left)/scale+x-parent.clientLeft+parent.scrollLeft)+'px');set('top',((bounds.top-origin.top)/scale+y-parent.clientTop+parent.scrollTop)+'px');
 set('overflowY',menu.scrollHeight>menu.clientHeight?'auto':'visible');
}
const fitBeforeAnchors=fitMenuToDesktop;fitMenuToDesktop=function(menu){const anchor=hoverMenuAnchors.get(menu);if(anchor?.isConnected)return placeHoverMenu(menu,anchor);return fitBeforeAnchors(menu);};
positionFlyout=function(button){placeHoverMenu($('#flyout'),button);};
const flyoutWithAnchor=showFlyout;showFlyout=function(kind,button){const result=flyoutWithAnchor(kind,button);placeHoverMenu($('#flyout'),button);return result;};
const newWithAnchor=showNewTypes;showNewTypes=function(button,path){const result=newWithAnchor(button,path);placeHoverMenu(context.querySelector('.new-types'),button);return result;};
const headerNewWithAnchor=showHeaderNew;showHeaderNew=function(win,button){const result=headerNewWithAnchor(win,button);placeHoverMenu($('.header-new-menu'),button);return result;};
const taskWithAnchor=showTaskGroup;showTaskGroup=function(type,button){const result=taskWithAnchor(type,button);placeHoverMenu(taskPopup,button);return result;};
const syncWithAnchor=showSyncPaths;showSyncPaths=function(item,path){const result=syncWithAnchor(item,path);placeHoverMenu(syncPopover,item);return result;};
new ResizeObserver(()=>{for(const menu of document.querySelectorAll('#flyout,.new-types,.header-new-menu,#task-popup,#sync-popover')){const anchor=hoverMenuAnchors.get(menu);if(anchor)placeHoverMenu(menu,anchor);}}).observe($('#desktop'));
