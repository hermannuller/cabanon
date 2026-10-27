'use strict';
window.CabanonCalculator=(()=>{
 const mathEngine=math.create();mathEngine.config({number:'BigNumber',precision:64});
 const profiles=new WeakMap(),repeatOps={add:'+',subtract:'−',multiply:'×',divide:'÷',pow:'^',nthRoot:'√'};
 // Only calculator tokens enter math.js; no JavaScript evaluation or arbitrary functions.
 function expression(source){const input=source.replaceAll('×','*').replaceAll('÷','/').replaceAll('−','-').replace(/\s/g,'');if(input.length>512)throw Error('Expression too long');const tokens=input.match(/(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|[()+\-*/^%√]/gi)||[];if(tokens.join('')!==input)throw Error('Invalid expression');let at=0;
  const peek=()=>tokens[at],take=()=>tokens[at++],begins=t=>!!t&&(/^(?:\d|\.)/.test(t)||t==='('||t==='√');
  function primary(){const t=take();if(t==='('){const v=sum();if(take()!==')')throw Error('Close parenthesis');return '('+v+')';}if(t&&/^(?:\d|\.)/.test(t))return t.startsWith('.')?'0'+t:t;throw Error('Enter a number');}
  function postfix(){let v=primary();while(peek()==='%'){take();v+='%';}return v;}
  function power(){let v=postfix();if(peek()==='^'){take();v='('+v+'^'+unary()+')';}else if(peek()==='√'){take();v='nthRoot('+v+','+(begins(peek())?unary():'2')+')';}return v;}
  function unary(){if(peek()==='+'||peek()==='-'){const op=take();return '('+op+unary()+')';}if(peek()==='√'){take();return 'sqrt('+unary()+')';}return power();}
  function product(){let v=unary();while(peek()==='*'||peek()==='/'||begins(peek())){const op=peek()==='*'||peek()==='/'?take():'*';v='('+v+op+unary()+')';}return v;}
  function sum(){let v=product();while(peek()==='+'||peek()==='-'){const op=take();v='('+v+op+product()+')';}return v;}
  const result=sum();if(at!==tokens.length)throw Error('Invalid expression');return result;
 }
 const finite=v=>mathEngine.isComplex(v)?Number.isFinite(v.re)&&Number.isFinite(v.im):mathEngine.isBigNumber(v)?v.isFinite():typeof v==='number'&&Number.isFinite(v);
 function format(v,precision=14){if(!finite(v))throw Error('Cannot divide by zero');return mathEngine.format(v,{precision,lowerExp:-9,upperExp:14});}
 const pack=v=>JSON.parse(JSON.stringify(v)),unpack=v=>mathEngine.reviver('',v);
 function strip(node){while(node?.isParenthesisNode)node=node.content;return node;}
 class Model{
  constructor(saved){this.reset();if(saved?.version===1){try{this.input=String(saved.input||'').slice(0,512);this.history=String(saved.history||'').slice(0,1024);this.result=String(saved.result||'0').slice(0,256);this.evaluated=!!saved.evaluated;this.error=String(saved.error||'');this.value=saved.value!==undefined?unpack(saved.value):null;this.repeat=saved.repeat&&repeatOps[saved.repeat.fn]?{fn:saved.repeat.fn,rhs:unpack(saved.repeat.rhs)}:null;}catch{this.reset();}}}
  reset(){this.input='';this.history='';this.result='0';this.value=null;this.repeat=null;this.evaluated=false;this.error='';}
  snapshot(){return {version:1,input:this.input,history:this.history,result:this.result,evaluated:this.evaluated,error:this.error,value:this.value===null?null:pack(this.value),repeat:this.repeat?{fn:this.repeat.fn,rhs:pack(this.repeat.rhs)}:null};}
  clear(all=false){if(all||this.evaluated||this.error)this.reset();else{this.input=Array.from(this.input).slice(0,-1).join('');this.history=this.input;this.result=this.input?this.operand():'0';this.repeat=null;}}
  operand(){const last=this.input.match(/(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i);if(last){const pos=last.index,negative=pos>0&&/[−-]/.test(this.input[pos-1])&&(pos===1||/[+−×÷^(√]/.test(this.input[pos-2]));return (negative?'−':'')+last[0];}return this.input==='−'?'−':this.result||'0';}
  press(key){if(key==='advanced')return;if(key==='clear'){this.clear();return;}if(key==='='){this.calculate();return;}if(this.error)this.reset();if(this.evaluated){if(['+','−','×','÷','^','√','%','±',')'].includes(key)){this.input=format(this.value,64).replaceAll('-','−');this.evaluated=false;this.repeat=null;}else this.reset();}
   if(key==='±'){const match=this.input.match(/(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i);if(match){const start=match.index;if(start>0&&/[−-]/.test(this.input[start-1])&&(start===1||/[+−×÷^(√]/.test(this.input[start-2])))this.input=this.input.slice(0,start-1)+match[0];else this.input=this.input.slice(0,start)+'−'+match[0];}else if(this.input.endsWith(')'))this.input='−('+this.input+')';else this.input+='−';}
   else if(/^\d$/.test(key)){if(/(?:^|[+−×÷^(√])0$/.test(this.input))this.input=this.input.slice(0,-1)+key;else this.input+=key;}
   else if(key==='.'){const token=this.input.match(/[\d.]*$/)?.[0]||'';if(token.includes('.'))return;this.input+=token?'.':'0.';}
   else if(['+','−','×','÷','^','√'].includes(key)){if(!this.input&&key!=='−'&&key!=='√')return;if(/[+−×÷^]$/.test(this.input)&&key!=='−'&&key!=='√')this.input=this.input.slice(0,-1)+key;else this.input+=key;}
   else if(key==='('){if(/[\d)%]$/.test(this.input))this.input+='×';this.input+='(';}
   else if(key===')'){if((this.input.match(/\(/g)||[]).length<=(this.input.match(/\)/g)||[]).length)return;this.input+=')';}
   else if(key==='%'){if(!/[\d)]$/.test(this.input))return;this.input+='%';}else return;
   this.input=this.input.slice(0,512);this.history=this.input;this.result=this.operand();
  }
  calculate(){if(!this.input&&!this.evaluated)return;try{if(this.evaluated){if(!this.repeat)return;const left=this.value,{fn,rhs}=this.repeat;this.value=mathEngine[fn](left,rhs);this.history=format(left)+repeatOps[fn]+format(rhs)+'=';}
    else{const source=this.input,tree=mathEngine.parse(expression(source)),node=strip(tree);this.value=tree.evaluate();this.repeat=null;if(node.isOperatorNode&&node.args.length===2&&repeatOps[node.fn])this.repeat={fn:node.fn,rhs:node.args[1].evaluate()};else if(node.isFunctionNode&&node.fn.name==='nthRoot')this.repeat={fn:'nthRoot',rhs:node.args[1].evaluate()};else if(node.isFunctionNode&&node.fn.name==='sqrt')this.repeat={fn:'nthRoot',rhs:mathEngine.bignumber(2)};this.history=source+'=';}
    this.result=format(this.value);this.evaluated=true;this.error='';
   }catch(error){this.error=error.message||'Invalid expression';this.result='Error';this.evaluated=true;this.repeat=null;}}
 }
 const clearSymbol='<svg viewBox="0 0 36 36" aria-hidden="true" style="fill:none;stroke:currentColor"><path d="M13 8H32V28H13L3 18ZM16 13L26 23M26 13L16 23"/></svg>';
 function mount(host,{profile={},saved,onChange=()=>{},onPaint=()=>{}}={}){let model=profiles.get(profile);if(!model){model=new Model(saved);profiles.set(profile,model);}host.replaceChildren();host.classList.add('cbn-calculator-host');host.parentElement.classList.add('cbn-calculator-surface');const view=document.createElement('section');view.className='cbn-calculator';view.tabIndex=0;view.setAttribute('aria-label','Calculator');const screen=document.createElement('div');screen.className='cbn-calc-screen';const history=document.createElement('div');history.className='cbn-calc-expression';const result=document.createElement('output');result.className='cbn-calc-result';result.setAttribute('aria-live','polite');screen.append(history,result);const keys=document.createElement('div');keys.className='cbn-calc-keys';let held=null;
  const measure=document.createElement('canvas').getContext('2d');let disposed=false;
  function fitResult(){if(disposed)return;const width=result.clientWidth;if(!width)return;measure.font='500 80px MiSans';const natural=measure.measureText(result.textContent).width;result.style.fontSize=Math.min(80,80*Math.max(1,width-2)/Math.max(1,natural))+'px';result.scrollLeft=0;}
  const resize=new ResizeObserver(fitResult);resize.observe(result);document.fonts.load('500 80px MiSans').then(fitResult);
  screen.title='Copy result';screen.onclick=async()=>{if(model.error)return;const text=model.result;try{await navigator.clipboard.writeText(text);}catch{const field=document.createElement('textarea');field.value=text;field.style.cssText='position:fixed;opacity:0;pointer-events:none';view.append(field);field.select();document.execCommand('copy');field.remove();view.focus({preventScroll:true});}};
  function paint(){history.textContent=model.history||'\u00a0';history.title=model.history;result.textContent=model.result;result.title=model.error||model.result;view.dataset.phase=model.evaluated?'calculated':'input';const clear=keys.querySelector('[data-calc-key=clear]');clear.innerHTML=model.evaluated?'AC':clearSymbol;clear.setAttribute('aria-label',model.evaluated?'All clear':'Delete last character');fitResult();history.scrollLeft=history.scrollWidth;onPaint(view);}
  function change(key){model.press(key);onChange(model.snapshot());paint();}
  for(const key of ['advanced','√','^','%','7','8','9','÷','4','5','6','×','1','2','3','−','±','0','.','+','clear','(',')','=']){const b=document.createElement('button');b.type='button';b.className='cbn-calc-key';b.dataset.calcKey=key;b.textContent=key==='advanced'?'f':key;b.setAttribute('aria-label',({advanced:'Advanced calculator','√':'Root','^':'Power','%':'Percent','±':'Change sign','÷':'Divide','×':'Multiply','−':'Subtract','+':'Add','=':'Equals'})[key]||key);if(key==='advanced'){b.classList.add('cbn-calc-advanced');b.setAttribute('aria-disabled','true');}
   if(key==='clear'){let press=null;b.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();b.setPointerCapture(e.pointerId);press={x:e.clientX,y:e.clientY,long:false,moved:false};held=setTimeout(()=>{if(!press||press.moved)return;press.long=true;model.clear(true);onChange(model.snapshot());paint();},500);};b.onpointermove=e=>{if(press&&Math.hypot(e.clientX-press.x,e.clientY-press.y)/(view.closest('#phone')?.getBoundingClientRect().width/414||1)>10){press.moved=true;clearTimeout(held);}};b.onpointerup=e=>{clearTimeout(held);if(press&&!press.long&&!press.moved)change('clear');press=null;if(b.hasPointerCapture(e.pointerId))b.releasePointerCapture(e.pointerId);};b.onpointercancel=()=>{clearTimeout(held);press=null;};b.onclick=e=>{if(e.detail===0)change('clear');};}
   else{b.onpointerdown=e=>e.preventDefault();b.onclick=()=>change(key);}keys.append(b);
  }
  view.append(screen,keys);host.append(view);view.onkeydown=e=>{if(e.altKey||e.ctrlKey||e.metaKey)return;const key=({'*':'×','/':'÷','-':'−',Enter:'=',Backspace:'clear',Delete:'clear'})[e.key]||e.key;if(/^\d$/.test(key)||['.','+','−','×','÷','^','√','%','(',')','=','clear'].includes(key)){e.preventDefault();change(key);}};paint();view.focus({preventScroll:true});return {model,destroy(){disposed=true;resize.disconnect();clearTimeout(held);host.parentElement?.classList.remove('cbn-calculator-surface');}};
 }
 return {mount,Model,expression,engine:mathEngine};
})();
