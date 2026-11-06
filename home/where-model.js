'use strict';
// WHERE's language and local road router are shared by PC and Phone.
window.CabanonWhereModel=(()=>{
 const normalize=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 const categories={酒店:'hotel',旅馆:'hotel',hotel:'hotel',青旅:'hostel',hostel:'hostel',咖啡馆:'cafe',咖啡:'cafe',cafe:'cafe',餐厅:'restaurant',restaurant:'restaurant',医院:'hospital',hospital:'hospital',学校:'school',school:'school',火车站:'rail',车站:'rail',station:'rail',药店:'pharmacy',pharmacy:'pharmacy',超市:'supermarket',supermarket:'supermarket',城堡:'castle',castle:'castle'};
 const modes={步行:'walk',walk:'walk',walking:'walk',骑行:'bike',bike:'bike',驾车:'car',开车:'car',car:'car',地铁:'subway',subway:'subway',公交:'transit',transit:'transit'};
 const kindNames={hotel:'酒店',hostel:'青旅',cafe:'咖啡馆',restaurant:'餐厅',hospital:'医院',school:'学校',rail:'火车站',pharmacy:'药店',supermarket:'超市',castle:'城堡',address:'地址',street:'街道',area:'区域'};
 function fail(message){throw Error(message);}
 function tokens(input){const out=[];let i=0;
  while(i<input.length){if(/\s/.test(input[i])){i++;continue;}if(input[i]==='"'){let value='';i++;while(i<input.length&&input[i]!=='"'){if(input[i]==='\\'&&['"','\\'].includes(input[i+1]))i++;value+=input[i++];}if(input[i]!=='"')fail('地点名称缺少结束引号。');i++;out.push({type:'text',value,quoted:true});continue;}
   const time=input.slice(i).match(/^\d{1,2}:\d{2}/);if(time){out.push({type:'text',value:time[0]});i+=time[0].length;continue;}
   // Read two-character comparisons as one token before interpreting route arrows.
   if('><=/*~&!:|()'.includes(input[i])){let value=input[i++];if('><'.includes(value)&&input[i]==='=')value+=input[i++];out.push({type:'op',value});continue;}
   const start=i;while(i<input.length&&!'"><=/*~&!:|()'.includes(input[i]))i++;const value=input.slice(start,i).trim();if(value)out.push({type:'text',value});
  }return out;
 }
 function parse(input){const ts=tokens(input.trim());if(!ts.length)return{stages:[]};const stages=[{op:null,value:'',conditions:[],excludes:[]}];let depth=0;
  for(let i=0;i<ts.length;i++){const t=ts[i],s=stages.at(-1);if(t.type==='text'){if(s.value)s.value+=' ';s.value+=t.value;continue;}
   if(t.value==='('){depth++;continue;}if(t.value===')'){if(--depth<0)fail('分组括号不匹配。');continue;}
   if(t.value===':'){const field=ts[++i];if(field?.type!=='text')fail(': 后面需要交通方式或条件。');const c={field:field.value,op:'=',value:null};if(!modes[normalize(field.value)]&&['=','<','<=','>','>='].includes(ts[i+1]?.value)){c.op=ts[++i].value;const v=ts[++i];if(v?.type!=='text')fail('比较符号后面需要条件值。');c.value=v.value;}else{c.value=c.field;c.field='mode';while(ts[i+1]?.value==='|'){i++;const v=ts[++i];if(v?.type!=='text')fail('| 后面需要另一种交通方式。');c.value+='|'+v.value;}}s.conditions.push(c);continue;}
   if(t.value==='!'){const v=ts[++i];if(v?.type!=='text')fail('! 后面需要排除的名称或类别。');s.excludes.push(v.value);continue;}
   if(['>','/','*','~','&'].includes(t.value)){if(!s.value.trim())fail('关系符号前面需要地点。');stages.push({op:t.value,value:'',conditions:[],excludes:[]});continue;}
   fail('这个位置不能使用 '+t.value+'。');
  }if(depth)fail('分组括号不匹配。');if(stages.some(s=>!s.value.trim()))fail('关系符号后面需要地点或类别。');return{stages};
 }
 function measure(value,kind){const m=String(value).match(/^\s*(\d+(?:\.\d+)?)\s*(分钟|分|min|小时|h|米|m|公里|km)?\s*$/i);if(!m)fail('无法识别条件值：'+value);const unit=m[2]?.toLowerCase();if(unit&&!(kind==='time'?['分钟','分','min','小时','h']:['米','m','公里','km']).includes(unit))fail(kind==='time'?'耗时请使用分钟或小时。':'距离请使用米或公里。');let n=+m[1];if(kind==='time')n*=unit==='小时'||unit==='h'?3600:60;else n*=unit==='公里'||unit==='km'?1000:1;return n;}
 function options(stages){const o={modes:['walk'],maxTime:Infinity,maxDistance:Infinity,timeStrict:false,distanceStrict:false,timeEqual:false,distanceEqual:false,excludes:stages.flatMap(s=>s.excludes)};
  for(const c of stages.flatMap(s=>s.conditions)){if(c.field==='mode'){o.modes=c.value.split('|').map(v=>modes[normalize(v)]||modes[v]||fail('未知交通方式：'+v));if(o.modes.some(m=>['subway','transit'].includes(m)))fail('图恩这一版尚未接入公共交通时刻表，暂不能计算公交或地铁路线。可使用 :步行、:骑行、:驾车。');}
   else if(['耗时','时长','time'].includes(c.field)){if(!['<','<=','='].includes(c.op))fail('第一版的耗时筛选请使用 <、<= 或 =。');o.maxTime=measure(c.value,'time');o.timeStrict=c.op==='<';o.timeEqual=c.op==='=';}
   else if(['距离','distance'].includes(c.field)){if(!['<','<=','='].includes(c.op))fail('第一版的距离筛选请使用 <、<= 或 =。');o.maxDistance=measure(c.value,'distance');o.distanceStrict=c.op==='<';o.distanceEqual=c.op==='=';}
   else if(c.field==='换乘'&&c.value==='0'&&c.op==='=')continue;
   else fail('条件「'+c.field+'」已记录在 map spells，第一版还不支持执行。');
  }return o;
 }
 function within(route,o){return(o.timeEqual?Math.round(route.seconds)===o.maxTime:o.timeStrict?route.seconds<o.maxTime:route.seconds<=o.maxTime)&&(o.distanceEqual?Math.round(route.distance)===o.maxDistance:o.distanceStrict?route.distance<o.maxDistance:route.distance<=o.maxDistance);}
 function distance(a,b){const rad=Math.PI/180,x=(b[0]-a[0])*rad*Math.cos((a[1]+b[1])*rad/2),y=(b[1]-a[1])*rad;return Math.hypot(x,y)*6371008.8;}
 class Heap{constructor(){this.a=[];}push(item){let i=this.a.length;this.a.push(item);while(i>0){const p=(i-1)>>1;if(this.a[p][0]<=item[0])break;this.a[i]=this.a[p];i=p;}this.a[i]=item;}pop(){const top=this.a[0],last=this.a.pop();if(this.a.length){let i=0;while(i*2+1<this.a.length){let j=i*2+1;if(j+1<this.a.length&&this.a[j+1][0]<this.a[j][0])j++;if(last[0]<=this.a[j][0])break;this.a[i]=this.a[j];i=j;}this.a[i]=last;}return top;}get length(){return this.a.length;}}
 class Router{
  constructor(network){this.nodes=[];this.edges=[];const ids=new Map();const node=(p,id)=>{const key=id===undefined?p.join(','):'node:'+id;if(!ids.has(key)){ids.set(key,this.nodes.length);this.nodes.push(p);this.edges.push([]);}return ids.get(key);};
   for(const w of network){const t=w.tags;if(['private','no'].includes(t.access)&&!['yes','designated','permissive'].includes(t.foot))continue;let speed=parseFloat(t.maxspeed);if(!Number.isFinite(speed))speed=/motorway/.test(t.highway)?100:/trunk/.test(t.highway)?80:/primary|secondary/.test(t.highway)?50:/living_street/.test(t.highway)?15:30;if(/mph/.test(t.maxspeed||''))speed*=1.609344;
    if(t.highway==='construction'||t.highway==='proposed'||t.highway==='raceway')continue;
    const walk=!['no','private'].includes(t.foot)&&(!/motorway|trunk/.test(t.highway)||['yes','designated'].includes(t.foot));const bike=!['no','private'].includes(t.bicycle)&&(!['private','no'].includes(t.access)||['yes','designated'].includes(t.bicycle))&&(!/motorway|trunk|pedestrian|steps/.test(t.highway)||['yes','designated'].includes(t.bicycle));const car=!['no','private'].includes(t.access)&&!['no','private'].includes(t.motor_vehicle)&&!['no','private'].includes(t.motorcar)&&!/footway|pedestrian|path|cycleway|steps|bridleway/.test(t.highway);const oneway=t.oneway==='-1'?-1:['yes','1','true'].includes(t.oneway)||t.junction==='roundabout'?1:0,bikeOneway=t['oneway:bicycle']==='no'?0:oneway;
    for(let i=1;i<w.points.length;i++){const a=node(w.points[i-1],w.nodes?.[i-1]),b=node(w.points[i],w.nodes?.[i]),length=distance(w.points[i-1],w.points[i]);if(!length)continue;const forward={to:b,length,speed,walk,bike:bike&&bikeOneway!==-1,car:car&&oneway!==-1},back={to:a,length,speed,walk,bike:bike&&bikeOneway!==1,car:car&&oneway!==1};this.edges[a].push(forward);this.edges[b].push(back);}
   }
  }
  nearest(p,mode){let best=-1,d=Infinity;for(let i=0;i<this.nodes.length;i++){if(!this.edges[i].some(e=>e[mode]))continue;const n=distance(p,this.nodes[i]);if(n<d){best=i;d=n;}}if(d>600||best<0)fail('地点距离当前可用路网过远，无法规划路线。');return{id:best,distance:d};}
  route(a,b,mode='walk'){const start=this.nearest(a,mode),end=this.nearest(b,mode),n=this.nodes.length,cost=new Float64Array(n).fill(Infinity),prev=new Int32Array(n).fill(-1),lengths=new Float64Array(n);const heap=new Heap();cost[start.id]=0;heap.push([0,start.id]);
   while(heap.length){const[c,u]=heap.pop();if(c!==cost[u])continue;if(u===end.id)break;for(const e of this.edges[u]){if(!e[mode])continue;const speed=mode==='walk'?1.4:mode==='bike'?4.2:e.speed/3.6,next=c+e.length/speed;if(next<cost[e.to]){cost[e.to]=next;prev[e.to]=u;lengths[e.to]=lengths[u]+e.length;heap.push([next,e.to]);}}}
   if(!Number.isFinite(cost[end.id]))fail('当前路网中没有符合交通方式的连通路线。');const ids=[];for(let u=end.id;u!==-1;u=prev[u]){ids.push(u);if(u===start.id)break;}ids.reverse();return{path:[a,...ids.map(i=>this.nodes[i]),b],distance:lengths[end.id]+start.distance+end.distance,seconds:cost[end.id]+(start.distance+end.distance)/1.4,mode,access:[start.distance,end.distance]};
  }
 }
 class Engine{
  constructor(data){this.data=data;this.places=data.search.map(p=>({...p,key:normalize(p.name)}));this.router=new Router(data.network);this.byId=new Map(this.places.map(p=>[p.id,p]));}
  suggest(q,limit=10){q=normalize(q);if(!q)return[];if(q==='图恩'||q==='thun')return this.places.filter(p=>p.kind==='area'||p.kind==='rail'&&p.name==='Thun').slice(0,limit);const cat=categories[q];return this.places.filter(p=>cat?p.kind===cat:p.key.includes(q)).sort((a,b)=>(a.key===q?-1:b.key===q?1:0)||a.name.localeCompare(b.name)).slice(0,limit);}
  resolve(value,binding){const q=normalize(value);if(binding&&normalize(binding.input)===q&&this.byId.has(binding.id))return this.byId.get(binding.id);if(['图恩','thun city','thun · 图恩'].includes(q))return this.byId.get('city:thun');if(['图恩车站','图恩火车站','thun station'].includes(q))return this.places.find(p=>p.kind==='rail'&&p.name==='Thun');if(['这里','here','当前位置'].includes(q)){if(!this.location)fail('第一版尚未接入当前位置。请直接输入图恩的地点名称或地址。');return{id:'here',name:'这里',kind:'location',xy:this.location};}const list=this.suggest(value,30),exact=list.filter(p=>p.key===q);if(exact.length===1)return exact[0];if(list.length===1)return list[0];if(!list.length)fail('图恩数据中没有找到「'+value+'」。可输入图恩、Thun、Spital Thun 或具体街道门牌。');const error=Error('请选择「'+value+'」对应的地点。');error.choices=list;error.term=value;throw error;}
  candidates(value,o){const key=normalize(value),cat=categories[key];let items=this.places.filter(p=>cat?p.kind===cat:p.key.includes(key));return items.filter(p=>!o.excludes.some(x=>p.kind===categories[normalize(x)]||p.key.includes(normalize(x))));}
  bestRoute(a,b,o){const found=[];for(const mode of o.modes){try{found.push(this.router.route(a.xy,b.xy,mode));}catch(error){if(o.modes.length===1)throw error;}}if(!found.length)fail('没有可用路线。');return found.sort((a,b)=>a.seconds-b.seconds)[0];}
  run(query,bindings={}){const parsed=parse(query),stages=parsed.stages;if(!stages.length)return{type:'empty',items:[]};const filters=options(stages),searchIndex=stages.findIndex(s=>['/','*','~'].includes(s.op));
   if(searchIndex<0&&stages.length===1){const bound=bindings[0]&&normalize(bindings[0].input)===normalize(stages[0].value)&&this.byId.get(bindings[0].id);const items=(bound?[bound]:this.suggest(stages[0].value,40)).filter(p=>!filters.excludes.some(x=>p.key.includes(normalize(x))||p.kind===categories[normalize(x)]));return{type:'places',items,description:items.length?'图恩 · '+items.length+' 个匹配':'没有匹配地点'};}
   if(searchIndex>=0&&searchIndex!==stages.length-1)fail('第一版请把类别搜索放在表达式末尾。');const originStages=searchIndex<0?stages:stages.slice(0,searchIndex),origins=originStages.map((s,i)=>{try{return this.resolve(s.value,bindings[i]);}catch(e){e.stageIndex=i;throw e;}}),meeting=originStages.some(s=>s.op==='&');
   if(originStages.some(s=>s.op==='&')&&originStages.some(s=>s.op==='>'))fail('请把多起点会合与顺序经过分开查询。');
   let legs=[];if(!meeting)for(let i=1;i<origins.length;i++){const local=options([{...originStages[i],excludes:[]}]);// Per-leg modes override the default, not the previous leg.
    const leg=this.bestRoute(origins[i-1],origins[i],local);if(!within(leg,local))fail('这一段路线不符合指定的时间或距离条件。');legs.push({...leg,from:origins[i-1],to:origins[i]});}
   if(searchIndex<0){if(meeting)fail('多个起点后面需要目的地类别，例如 (A & B) /酒店。会合按最慢一方耗时最少排序。');return{type:'route',items:[],origins,legs,description:'路网估算 · 不含实时路况；起终点接驳按步行计算'};}
   const search=stages[searchIndex],items=this.candidates(search.value,filters);if(!items.length)return{type:'places',items:[],description:'当前图恩快照中没有这类匹配地点。'};let found=[];
   if(meeting){if(search.op!=='/')fail('多个起点的第一版查询请使用 /目的地类别。');const perOrigin=originStages.map(s=>options([{...search,excludes:[]},{...s,excludes:[]}]));for(const p of items){try{const routes=origins.map((a,i)=>this.bestRoute(a,p,perOrigin[i]));if(routes.every((r,i)=>within(r,perOrigin[i])))found.push({...p,seconds:Math.max(...routes.map(r=>r.seconds)),routes});}catch{}}found.sort((a,b)=>a.seconds-b.seconds);return{type:'meeting',items:found,origins,legs:[],description:'多个起点 → 共同目的地 · 按最慢一方耗时最少排序 · 路网估算'};}
   const base=origins.at(-1);if(search.op==='/'){const radius=Number.isFinite(filters.maxDistance)?filters.maxDistance:1000;found=items.filter(p=>base.bounds?p.xy[0]>=base.bounds[0]&&p.xy[0]<=base.bounds[2]&&p.xy[1]>=base.bounds[1]&&p.xy[1]<=base.bounds[3]:distance(base.xy,p.xy)<=radius).map(p=>({...p,distance:distance(base.xy,p.xy)})).sort((a,b)=>a.distance-b.distance);if(Number.isFinite(filters.maxTime))fail('/ 搜索按区域或直线距离筛选。按交通时间筛选请使用 *。');return{type:'places',items:found,origins,legs,description:base.bounds?base.name+' 区域内':base.name+' 周边 '+Math.round(radius)+' 米（直线距离）'};}
   if(search.op==='*'){for(const p of items){try{const r=this.bestRoute(p,base,filters);if(within(r,filters))found.push({...p,seconds:r.seconds,distance:r.distance,routes:[r]});}catch{}}return{type:'accessible',items:found.sort((a,b)=>a.seconds-b.seconds),origins,legs,description:'候选地点 → '+base.name+' · 按预计耗时排序 · 路网估算'};}
   if(search.op==='~'){if(!legs.length)fail('~ 前面需要一条路线，例如 Thun > Spital Thun ~酒店。');const points=legs.flatMap(l=>l.path),radius=Number.isFinite(filters.maxDistance)?filters.maxDistance:200;found=items.map(p=>({...p,distance:nearLine(p.xy,points)})).filter(p=>p.distance<=radius).sort((a,b)=>a.distance-b.distance);if(Number.isFinite(filters.maxTime))fail('第一版沿途搜索使用 :距离 限定距路线的直线距离，尚不计算绕路耗时。');return{type:'along',items:found,origins,legs,description:'沿途 '+Math.round(radius)+' 米内（距路线直线距离）'};}
   return{type:'places',items:[]};
  }
 }
 function nearLine(p,line){let best=Infinity;const scale=Math.cos(p[1]*Math.PI/180);for(let i=1;i<line.length;i++){const a=[(line[i-1][0]-p[0])*scale,line[i-1][1]-p[1]],b=[(line[i][0]-p[0])*scale,line[i][1]-p[1]],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,-(a[0]*dx+a[1]*dy)/(dx*dx+dy*dy||1)));best=Math.min(best,Math.hypot(a[0]+t*dx,a[1]+t*dy)*111195);}return best;}
 return{parse,options,Engine,Router,distance,normalize,kindNames};
})();
