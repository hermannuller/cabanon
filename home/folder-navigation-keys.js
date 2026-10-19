'use strict';
const folderHistories=new WeakMap();
let folderHistoryReplay=false;
function rememberFolder(win,path){
 if(!win?.dataset.fileBrowser||folderHistoryReplay)return;
 let history=folderHistories.get(win);
 if(!history){history={paths:[path],index:0};folderHistories.set(win,history);return;}
 if(history.paths[history.index]===path)return;
 history.paths=history.paths.slice(0,history.index+1);history.paths.push(path);history.index++;
}
const configureWithHistory=configureFolder;
configureFolder=function(win,path){
 if(win.dataset.fileBrowser)rememberFolder(win,win.dataset.fileBrowser);
 const result=configureWithHistory(win,path);
 if(win.dataset.fileBrowser===path)rememberFolder(win,path);
 return result;
};
document.addEventListener('keydown',event=>{
 if(!event.altKey||event.ctrlKey||event.metaKey||!['ArrowLeft','ArrowRight','ArrowUp'].includes(event.key))return;
 const win=activeWindow;if(!win?.dataset.fileBrowser)return;
 event.preventDefault();event.stopImmediatePropagation();loneAlt=false;
 rememberFolder(win,win.dataset.fileBrowser);
 const history=folderHistories.get(win);
 if(event.key==='ArrowUp'){
  const current=win.dataset.fileBrowser;if(current==='/house')return;
  configureFolder(win,current.slice(0,current.lastIndexOf('/'))||'/house');return;
 }
 const next=history.index+(event.key==='ArrowLeft'?-1:1);
 if(next<0||next>=history.paths.length)return;
 folderHistoryReplay=true;
 try{configureFolder(win,history.paths[next]);if(win.dataset.fileBrowser===history.paths[next])history.index=next;}finally{folderHistoryReplay=false;}
},true);
