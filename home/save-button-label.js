'use strict';
function setFileSaveButton(button,saved){if(!button)return;button.textContent=saved?'saved':'save';button.disabled=!!saved;button.setAttribute('aria-disabled',String(!!saved));button.classList.toggle('save-clean',!!saved);}
