'use strict';
// COLORS alone follows playback, never hover or window focus. No player is invented here.
window.CabanonColorsPlayback=(()=>{
 let playerPlaying=false;const media=new Set();
 function update(){for(const node of media)if(!node.isConnected||node.paused||node.ended)media.delete(node);document.documentElement.classList.toggle('colors-playing',playerPlaying||media.size>0);}
 function owns(node){return node instanceof HTMLMediaElement&&!!node.closest('[data-colors-player],.window[data-key="app:COLORS"],.window[data-owner-app="COLORS"]');}
 for(const type of ['playing','pause','ended','emptied','error'])document.addEventListener(type,event=>{const node=event.target;if(!owns(node)&&!media.has(node))return;if(type==='playing')media.add(node);else media.delete(node);update();},true);
 new MutationObserver(()=>{if(media.size)update();}).observe(document.getElementById('windows'),{childList:true,subtree:true});
 addEventListener('cabanon-colors-playback',event=>{playerPlaying=event.detail?.playing===true;update();});
 update();return{setPlaying(value){playerPlaying=value===true;update();},get playing(){return document.documentElement.classList.contains('colors-playing');}};
})();
