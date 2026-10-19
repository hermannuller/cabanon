'use strict';
$('#file-search').setAttribute('aria-label','Search applications and files');
$('#file-search').oninput=()=>{
 initInteractionPrefs();const query=$('#file-search').value.trim().toLowerCase();$('#from').classList.toggle('searching-files',Boolean(query));const results=$('#file-results');results.hidden=!query;
 const parsed=fileSearchQuery(query),files=[...new Set([...prefs.files,...prefs.folders])].filter(name=>fileSearchMatch(name,parsed));
 const software=parsed.color?[]:apps.filter(app=>!prefs.uninstalled.includes(app.name)&&app.name.toLowerCase().includes(query));
 results.innerHTML=software.map(app=>`<button class="file search-software" data-app="${app.name}">${appIcon(app.glyph)}<span>${app.name}</span></button>`).join('')+files.map(name=>`<button class="file" data-search-file="${escapeHTML(name)}">${icon(glyphFor(name))}<span>${escapeHTML(name)}</span></button>`).join('')||'<p class="muted">No results found.</p>';
};
const priorOpenApp=openApp;
openApp=function(name){if(name!=='CALC'){priorOpenApp(name);return;}prefs.usage.CALC=(prefs.usage.CALC||0)+1;persistProfiles();openCalculator();};
function openCalculator(){
 const win=createWindow('app:CALC','CALC','calculator',`<div class="calculator"><div class="calc-history" aria-live="polite"></div><output class="calc-display" aria-live="polite">0</output><div class="calc-keys">${['AC','±','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','⌫','0','.','='].map(key=>`<button data-calc="${key}">${key}</button>`).join('')}</div></div>`);
 if(win.calcReady)return;win.calcReady=true;Object.assign(win.style,{width:'440px',height:'382px'});
 win.querySelector('[data-win=min]').remove();win.querySelector('[data-win=max]').remove();
 const title=win.querySelector('.window-title');title.ondblclick=null;
 let display='0',stored=null,operator=null,fresh=true,lastOperand=null,lastOperator=null;
 const output=win.querySelector('.calc-display'),history=win.querySelector('.calc-history');
 const show=value=>{display=String(value);output.textContent=display;};
 const calculate=(a,b,op)=>op==='+'?a+b:op==='−'?a-b:op==='×'?a*b:b===0?NaN:a/b;
 const rounded=value=>Number.isFinite(value)?Number(value.toPrecision(12)):'Error';
 function press(key){
  if(key==='AC'){stored=null;operator=null;fresh=true;lastOperand=null;lastOperator=null;history.textContent='';show('0');return;}
  if(/^\d$/.test(key)){if(fresh||display==='Error'){show(key);fresh=false;}else if(display.replace(/[-.]/g,'').length<14)show(display==='0'?key:display+key);return;}
  if(key==='.'){if(fresh||display==='Error'){show('0.');fresh=false;}else if(!display.includes('.'))show(display+'.');return;}
  if(display==='Error')return;
  if(key==='±'){show(Number(display)*-1);return;}
  if(key==='⌫'){if(!fresh)show(display.length>1&&display!=='-0'?display.slice(0,-1):'0');return;}
  if(key==='%'){show(rounded(operator&&['+','−'].includes(operator)?stored*Number(display)/100:Number(display)/100));return;}
  if(['+','−','×','÷'].includes(key)){if(operator&&!fresh)show(rounded(calculate(stored,Number(display),operator)));if(display==='Error'){stored=null;operator=null;return;}stored=Number(display);operator=key;fresh=true;lastOperator=null;history.textContent=`${display} ${key}`;return;}
  if(key==='='){const op=operator||lastOperator;if(!op)return;const right=operator?Number(display):lastOperand;const left=operator?stored:Number(display);history.textContent=`${left} ${op} ${right} =`;show(rounded(calculate(left,right,op)));lastOperand=right;lastOperator=op;stored=null;operator=null;fresh=true;}
 }
 win.querySelectorAll('[data-calc]').forEach(button=>button.onclick=()=>press(button.dataset.calc));
 win.tabIndex=0;win.addEventListener('keydown',event=>{if(event.altKey||event.ctrlKey||event.metaKey)return;const key=({'*':'×','/':'÷','-':'−','Enter':'=','Delete':'AC','Backspace':'⌫'})[event.key]||event.key;if(/^\d$/.test(key)||['.','+','−','×','÷','=','AC','⌫','%'].includes(key)){event.preventDefault();press(key);}});win.focus();
}
