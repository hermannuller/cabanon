'use strict';
// Local prototype fixtures. A data provider can replace these with cached records;
// an explicit null/empty record means there is no content to display.
window.CabanonWidgets=(()=>{
 const supported=new Set(['NEWS','STOCKS','DATE','THEN','ASTRO','WEATHER','TIME']);
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function icon(type){
  const paths={rain:'<path d="M12 2C10 6 5 11 5 15a7 7 0 0 0 14 0c0-4-5-9-7-13Z"/>',humidity:'<path d="m8 3-6 4 3 5 3-2v11h8V10l3 2 3-5-6-4c0 5-8 5-8 0Z"/>',wind:'<path d="m4 20 14-14M8 6h10v10"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="4"/>',sun:'<path d="M2 19h20M6 18a6 6 0 0 1 12 0M12 2v4M3 7l3 3M21 7l-3 3"/>',station:'<path d="M3 3h5v18H3zM16 3h5v18h-5zM8 9h8v6H8zM12 6v12M9 21h6"/>',magnet:'<ellipse cx="12" cy="12" rx="4" ry="7"/><ellipse cx="12" cy="12" rx="9" ry="5"/><path d="M12 1v22"/>',cloud:'<path d="M6 19a4 4 0 0 1-1-8 7 7 0 0 1 13-2 5 5 0 0 1 0 10Z"/>'};
  return `<svg class="phone-widget-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${paths[type]||paths.sun}</svg>`;
 }
 function moon(phase){
  const p=((phase%1)+1)%1,wax=p<.5,cos=Math.cos(p*2*Math.PI),rx=Math.abs(cos)*9;
  const d=`M12 3A9 9 0 0 ${wax?1:0} 12 21A${rx||.001} 9 0 0 ${cos>=0?(wax?0:1):(wax?1:0)} 12 3Z`;
  return `<svg class="phone-widget-icon moon-phase" viewBox="0 0 24 24" aria-label="Moon phase"><circle cx="12" cy="12" r="9" fill="var(--l3)"/><path d="${d}" fill="currentColor"/><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1"/></svg>`;
 }
 const line=(a,b,cls='')=>`<div class="phone-widget-row ${cls}"><div class="phone-widget-lines"><div>${a}</div><div>${b}</div></div></div>`;
 const pair=(a,b)=>`<span class="phone-widget-pair"><span>${a}</span>  <span>${b}</span></span>`;
 const metric=(type,text)=>`<span class="phone-widget-metric">${icon(type)}${esc(text)}</span>`;
 function nowDate(){return new Date(Math.floor((Date.now()+(Number(prefs.settings?.clock?.offset)||0))/1000)*1000);}
 function timeText(){const c=prefs.settings?.clock||{};return nowDate().toLocaleTimeString(c.format==='12'?'en-US':'en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:c.format==='12',timeZone:c.zone});}
 function store(){
  if(!prefs.infoWidgets){prefs.infoWidgets={version:1,records:{}};const records=prefs.infoWidgets.records;
   Object.assign(records,prefs.phone?.widgetData||{});
   const oldDefaults={weather:['26°C','Sunny'],stocks:['STOCKS','No quote selected.'],news:['NEWS','No headline selected.']};
   for(const [key,v] of Object.entries(prefs.widgetData||{})){const id=key.toUpperCase(),d=oldDefaults[key];if(supported.has(id)&&!Object.hasOwn(records,id)&&v&&(v.value||v.detail)&&!(d&&v.value===d[0]&&v.detail===d[1])&&key!=='time')records[id]=[{title:v.value,detail:v.detail}];}
  }
  return prefs.infoWidgets.records;
 }
 function set(id,records){store()[id]=records;persistProfiles();window.dispatchEvent(new Event('cabanon-widgets-change'));}

 function updateTime(root){for(const el of root.querySelectorAll('.phone-live-time')){el.textContent=timeText();el.dateTime=new Date(Math.floor(nowDate().getTime()/1000)*1000).toISOString();}}
 function defaults(id){
  const now=nowDate(),zone={timeZone:prefs.settings?.clock?.zone},date=now.toLocaleDateString('en-CA',zone),day=now.toLocaleDateString('en-GB',{...zone,day:'2-digit'}),weekday=now.toLocaleDateString('en-GB',{...zone,weekday:'short'});
  if(id==='TIME')return [line('<time class="phone-widget-big phone-live-time" datetime="'+new Date(Math.floor(nowDate().getTime()/1000)*1000).toISOString()+'">'+timeText()+'</time>','','time-main')];
  if(id==='DATE')return [line(`<span class="phone-widget-big">${day}</span><span class="phone-widget-big">${weekday}</span>`,'','date-main'),line(esc(date),'GREGORIAN'),line(esc(new Intl.DateTimeFormat('en-US-u-ca-japanese',{...zone,era:'short',year:'numeric',month:'2-digit',day:'2-digit'}).format(now)),'JAPANESE'),line(esc(now.toLocaleDateString('en-GB',{...zone,month:'long'})),now.toLocaleDateString('en-GB',{...zone,year:'numeric'}))];
  if(id==='NEWS')return [['-2m-','King of Pop is died in his house last week…'],['-3m-','Trump wins.'],['-7h-','Dr Dre meets Eminem to talk about the new volume…'],['-1d-',"Eminem is on the James’ Show"]].map(([age,title])=>`<div class="phone-widget-row"><div class="phone-widget-news"><strong>${esc(age)}</strong> ${esc(title)}</div></div>`);
  if(id==='STOCKS')return [['NVDA','$221.97','+2.54%','5.50'],['APPL','$244.19','+1.54%','4.90'],['NVDA','$221.97','+2.54%','5.50'],['APPL','$244.19','+1.54%','4.90']].map(q=>line(pair(esc(q[0]),esc(q[1])),pair(esc(q[2]),esc(q[3]))));
  if(id==='THEN')return [['12:00–13:00','Clear house'],['15:03–22:00','Sleep'],['22:01–22:30','TV show'],['22:31–07:00','Sleep']].map(q=>line(esc(q[0]),esc(q[1])));
  if(id==='WEATHER')return [line(`<span class="phone-widget-big">25°C</span>${CabanonWeather.icon('cloud','phone-widget-icon')}`,'','weather-main'),line('30–22°',`${metric('rain','10%')}${metric('humidity','56%')}`),line(metric('wind','1m/s'),`${aqi(68)}${metric('eye','10km')}`),`<div class="phone-widget-row phone-widget-forecast">${['sun','cloud','rain'].map(t=>`<div>${CabanonWeather.icon(t,'phone-widget-icon')}<span>22°</span></div>`).join('')}</div>`];
  if(id==='ASTRO'){
   const phase=((now.getTime()-Date.UTC(2000,0,6,18,14))/86400000/29.530588853)%1;
   return [line(`${icon('sun')}<span>05:33<br>19:22</span>${moon(phase)}<span>05:33<br>--:--</span>`,'','sky-rise'),line(`${icon('station')}<span>next 19:36<br>5 min · 67°max</span>`,'','sky-detail'),line(`${icon('magnet')}<span>KP 2.0<br>G-STORM --</span>`,'','sky-detail')];
  }
  return [];
 }
 function aqi(value){const colors=['#00e400','#ffff00','#ff7e00','#ff0000','#8f3f97','#7e0023'],level=[50,100,150,200,300].findIndex(n=>value<=n);return `<span class="phone-widget-metric"><span class="phone-widget-aqi" style="background:${colors[level<0?5:level]}"></span>${esc(value)}</span>`;}
 function markup(item){
  const cache=store();
  if(!supported.has(item.id))return '';
  let rows;
  if(cache&&Object.hasOwn(cache,item.id)){
   const records=cache[item.id];
   rows=Array.isArray(records)?records.filter(r=>r&&(r.title||r.detail)).map(r=>line(esc(r.title),esc(r.detail))):[];
  }else rows=defaults(item.id);
  return rows.slice(0,item.size).join('');
 }
 return {supported,markup,updateTime,set,store};
})();
