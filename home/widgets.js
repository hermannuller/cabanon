'use strict';
const widgetBar=document.createElement('section');widgetBar.id='widgets';widgetBar.setAttribute('aria-label','Information widgets');$('.clock').hidden=true;$('.weather').hidden=true;$('.system').prepend(widgetBar);
function widgetPrefs(){prefs.widgets ||= ['time','weather'];prefs.widgetData ||= {time:{value:'',detail:''},weather:{value:'26°C',detail:'Sunny'},stocks:{value:'STOCKS',detail:'No quote selected.'},news:{value:'NEWS',detail:'No headline selected.'}};}
function widgetClockMarkup(clock){return `<span class="widget-value">${escapeHTML(clock.time)}</span><span class="widget-detail widget-clock-detail">${clock.period?`<span class="widget-period">${escapeHTML(clock.period)}</span>`:''}<span class="widget-calendar"><span>${escapeHTML(clock.date)}</span><span>${escapeHTML(clock.weekday)}</span></span></span>`;}
function renderWidgets(){
 widgetPrefs();
 const html=prefs.widgets.map(type=>{const data=prefs.widgetData[type];const now=new Date();const clock=type==='time'&&typeof settingClockParts==='function'?settingClockParts():null;const value=clock?clock.value:type==='time'?(data.value||now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})):data.value;const detail=clock?clock.detail:type==='time'?(data.detail||`${now.getFullYear().toString().slice(2)}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} ${now.toLocaleDateString('en-US',{weekday:'long'})}`):data.detail;if(clock)return `<button class="widget" data-widget="${type}">${widgetClockMarkup(clock)}</button>`;return `<button class="widget" data-widget="${type}"><span class="widget-value">${escapeHTML(value)}</span><span class="widget-detail">${escapeHTML(detail)}</span></button>`;}).join('');
 if(widgetBar.innerHTML!==html)widgetBar.innerHTML=html;
 const minHeight=Math.max(548,prefs.widgets.length*104+392);$('#from').style.minHeight=minHeight+'px';if((parseFloat($('#from').style.height)||548)<minHeight)$('#from').style.height=minHeight+'px';layoutPins();
}
function editWidget(type){widgetPrefs();const data=prefs.widgetData[type];const win=freshWindow('widget-edit:'+type,type.toUpperCase(),'text',`<h1>Edit ${type}</h1><label>${type==='time'?'Time (blank = local time)':'Value'}<input id="widget-value" value="${escapeHTML(data.value)}"></label><label>${type==='time'?'Date / day (blank = local date)':'Details'}<input id="widget-detail" value="${escapeHTML(data.detail)}"></label><button class="action" id="save-widget">Save</button><button class="action" id="widget-settings">Setting</button>`);win.querySelector('#save-widget').onclick=()=>{prefs.widgetData[type]={value:win.querySelector('#widget-value').value,detail:win.querySelector('#widget-detail').value};persistProfiles();renderWidgets();win.querySelector('[data-win=close]').click();};win.querySelector('#widget-settings').onclick=openWidgetSettings;}
function openWidgetSettings(){widgetPrefs();const win=freshWindow('widget-settings','WIDGET SETTING','settings',`<h1>Widget setting</h1>${['time','weather','stocks','news'].map(type=>`<label><input type="checkbox" data-widget-enable="${type}" ${prefs.widgets.includes(type)?'checked':''}> ${type[0].toUpperCase()+type.slice(1)}</label>`).join('')}<button class="action" id="save-widgets">Save</button>`);win.querySelector('#save-widgets').onclick=()=>{const selected=[...win.querySelectorAll('[data-widget-enable]:checked')].map(input=>input.dataset.widgetEnable);prefs.widgets=[...prefs.widgets.filter(type=>selected.includes(type)),...selected.filter(type=>!prefs.widgets.includes(type))];persistProfiles();renderWidgets();win.querySelector('[data-win=close]').click();};}
widgetBar.onclick=event=>{const button=event.target.closest('[data-widget]');if(button&&!widgetDragMoved)editWidget(button.dataset.widget);};
let widgetDrag=null,widgetDragMoved=false;
widgetBar.onpointerdown=event=>{const item=event.target.closest('[data-widget]');if(event.button===0&&item){widgetDrag={item,x:event.clientX,y:event.clientY,order:[...widgetBar.children]};widgetDragMoved=false;}};
document.addEventListener('pointermove',event=>{if(!widgetDrag||Math.hypot(event.clientX-widgetDrag.x,event.clientY-widgetDrag.y)<6)return;widgetDragMoved=true;widgetDrag.item.classList.add('dragging');const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-widget]');if(target&&target!==widgetDrag.item){const items=[...widgetBar.children];if(items.indexOf(target)>items.indexOf(widgetDrag.item))target.after(widgetDrag.item);else target.before(widgetDrag.item);}});
document.addEventListener('pointerup',event=>{if(!widgetDrag)return;widgetDrag.item.classList.remove('dragging');if(widgetDragMoved){const bounds=widgetBar.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)widgetDrag.order.forEach(item=>widgetBar.append(item));prefs.widgets=[...widgetBar.children].map(item=>item.dataset.widget);persistProfiles();}widgetDrag=null;setTimeout(()=>widgetDragMoved=false,0);});
const refreshWithWidgets=refreshUserIcon;refreshUserIcon=function(){refreshWithWidgets();renderWidgets();};
setInterval(()=>{
 if(widgetDrag||document.querySelector('#from').hidden)return;
 const timeButton=widgetBar.querySelector('[data-widget=time]');
 if(!timeButton)return;
 if(typeof settingRefreshClock==='function'){settingRefreshClock();return;}
 const data=prefs.widgetData?.time||{};
 const now=new Date();
 const value=data.value||now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
 const detail=data.detail||`${now.getFullYear().toString().slice(2)}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} ${now.toLocaleDateString('en-US',{weekday:'long'})}`;
 const valueEl=timeButton.querySelector('.widget-value'),detailEl=timeButton.querySelector('.widget-detail');
 if(valueEl&&valueEl.textContent!==value)valueEl.textContent=value;
 if(detailEl&&detailEl.textContent!==detail)detailEl.textContent=detail;
},60000);renderWidgets();
// All system icons, including trash and input, share one sortable grid.
$('#system-icons').prepend(...extras.children);
extras.hidden=true;
function ensureAllSystemOrder(){prefs.systemOrder=[...['trash','input'].filter(name=>!prefs.systemOrder.includes(name)),...prefs.systemOrder];applySystemOrder();}
ensureAllSystemOrder();
$('#system-icons').addEventListener('click',event=>{const button=event.target.closest('[data-system]');if(!button||!['trash','input'].includes(button.dataset.system))return;event.stopImmediatePropagation();if(button.dataset.system==='trash')openTrash();else showFlyout('input',button);},true);
$('#system-icons').addEventListener('pointerover',event=>{const button=event.target.closest('[data-system=input]');if(button&&flyoutSource!=='input')showFlyout('input',button);});
const refreshAllIcons=refreshUserIcon;refreshUserIcon=function(){refreshAllIcons();const names=prefs.systemOrder;if(!names.includes('trash')||!names.includes('input'))ensureAllSystemOrder();applySystemOrder();};


document.addEventListener('pointercancel',()=>{if(!widgetDrag)return;widgetDrag.order.forEach(item=>widgetBar.append(item));widgetDrag.item.classList.remove('dragging');widgetDrag=null;widgetDragMoved=false;});
