'use strict';
let documentClosePromptSuppression=0;
function withoutDocumentClosePrompt(action){documentClosePromptSuppression++;try{return action();}finally{documentClosePromptSuppression--;}}
function confirmDocumentClose(filename,save,quit){
 if(documentClosePromptSuppression){quit();return;}
 const existing=document.querySelector('.save-close-prompt');if(existing){existing.querySelector('[data-close-choice=save]').focus();return;}const shade=document.createElement('div');shade.className='removal-confirmation save-close-prompt';shade.innerHTML='<div role="alertdialog" aria-modal="true" aria-label="Save before closing"><p>wanna save<br><span data-close-filename></span>?</p><div class="save-close-actions"><button data-close-choice="save">save</button><button data-close-choice="quit">quit</button><button data-close-choice="cancel">cancel</button></div></div>';shade.querySelector('[data-close-filename]').textContent='*'+(filename||'new');const dismiss=()=>shade.remove();const cancel=()=>{dismiss();window.dispatchEvent(new Event('document-close-cancel'));};shade.querySelector('[data-close-choice=save]').onclick=()=>{dismiss();save(quit);};shade.querySelector('[data-close-choice=quit]').onclick=()=>{dismiss();quit();};shade.querySelector('[data-close-choice=cancel]').onclick=cancel;shade.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();cancel();}if(e.key==='Enter'&&!e.target.matches('button')){e.preventDefault();shade.querySelector('[data-close-choice=save]').click();}});document.querySelector('#desktop').append(shade);shade.querySelector('[data-close-choice=save]').focus();
}


