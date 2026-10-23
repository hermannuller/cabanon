'use strict';
// Loaded only by the local Phone route; Electron keeps its existing behavior.
(()=>{
 document.documentElement.classList.add('phone-web');
 const probe=document.createElement('div');probe.className='phone-web-safe-area';document.body.append(probe);
 window.CabanonPhoneWeb={viewport(){const s=getComputedStyle(probe),v=window.visualViewport,left=parseFloat(s.paddingLeft)||0,right=parseFloat(s.paddingRight)||0,top=parseFloat(s.paddingTop)||0,bottom=parseFloat(s.paddingBottom)||0;return{width:(v?.width||innerWidth)-left-right,height:(v?.height||innerHeight)-top-bottom,left:left+(v?.offsetLeft||0),top:top+(v?.offsetTop||0)};}};
 localStorage.setItem('cabanon-device-mode','phone');
 function resize(){window.dispatchEvent(new Event('resize'));}
 window.visualViewport?.addEventListener('resize',resize);
 window.visualViewport?.addEventListener('scroll',resize);
 document.addEventListener('DOMContentLoaded',()=>{window.CabanonPhone?.setMode('phone');const input=document.querySelector('.phone-search-input');if(input){input.readOnly=true;input.setAttribute('inputmode','none');}document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});document.addEventListener('selectionchange',()=>{if(!document.activeElement?.matches('input,textarea,[contenteditable="true"]'))window.getSelection()?.removeAllRanges();});});
})();
