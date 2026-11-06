'use strict';
// Import the reviewed Thun OSM snapshot. Pass the directory containing thun-data.json,
// thun-osm.json and d3.min.js. No network requests are made by the importer.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const kindOf=require('./where-poi-kinds.cjs');
const source=process.argv[2];if(!source)throw Error('Pass the Thun snapshot directory.');
const data=JSON.parse(fs.readFileSync(path.join(source,'thun-data.json'),'utf8'));
const raw=JSON.parse(fs.readFileSync(path.join(source,'thun-osm.json'),'utf8'));
if(process.argv[3]){const extra=JSON.parse(fs.readFileSync(process.argv[3],'utf8')),all=new Map(raw.elements.map(e=>[e.type+'/'+e.id,e]));for(const e of extra.elements)all.set(e.type+'/'+e.id,e);raw.elements=[...all.values()];}
data.bounds=[7.602,46.735,7.665,46.778];data.search=[];data.network=[];
const seen=new Set(),streets=new Map();
function xy(e){if(e.type==='node')return[e.lon,e.lat];const points=e.geometry||e.members?.flatMap(m=>m.geometry||[])||[];if(!points.length)return null;return[points.reduce((n,p)=>n+p.lon,0)/points.length,points.reduce((n,p)=>n+p.lat,0)/points.length];}
function add(p){if(!p.xy||!p.name||p.xy[0]<data.bounds[0]||p.xy[0]>data.bounds[2]||p.xy[1]<data.bounds[1]||p.xy[1]>data.bounds[3])return;const key=p.name+'|'+p.xy.map(x=>x.toFixed(4)).join(',');if(seen.has(key))return;seen.add(key);data.search.push(p);}
for(const p of data.places)add({...p,tags:{}});
for(const e of raw.elements){const t=e.tags||{},point=xy(e),id=e.type+'/'+e.id;
 if(e.type==='way'&&t.highway&&e.geometry?.length>1){data.network.push({nodes:e.nodes,points:e.geometry.map(p=>[+p.lon.toFixed(6),+p.lat.toFixed(6)]),tags:Object.fromEntries(['highway','oneway','oneway:bicycle','junction','area','access','foot','bicycle','motor_vehicle','motorcar','maxspeed'].filter(k=>t[k]!==undefined).map(k=>[k,t[k]]))});if(t.name){const s=streets.get(t.name)||[];s.push(...e.geometry.map(p=>[p.lon,p.lat]));streets.set(t.name,s);}}
 const kind=kindOf(t);
 if(t.name&&kind)add({id,name:t.name,kind,xy:point,tags:Object.fromEntries(['amenity','tourism','opening_hours','wheelchair','brand'].filter(k=>t[k]).map(k=>[k,t[k]]))});
 if(t['addr:street']&&t['addr:housenumber'])add({id:id+':address',name:t['addr:street']+' '+t['addr:housenumber'],kind:'address',xy:point,tags:{city:t['addr:city']||'',postcode:t['addr:postcode']||''}});
}
for(const[name,p]of streets)add({id:'street:'+name,name,kind:'street',xy:[p.reduce((n,a)=>n+a[0],0)/p.length,p.reduce((n,a)=>n+a[1],0)/p.length],tags:{}});
data.search.unshift({id:'city:thun',name:'Thun · 图恩',kind:'area',xy:[7.63,46.758],bounds:data.bounds,tags:{}});
const encoded=zlib.gzipSync(JSON.stringify(data),{level:9}).toString('base64');
const home=path.join(__dirname,'..','home');fs.mkdirSync(path.join(home,'vendor','d3'),{recursive:true});
fs.copyFileSync(path.join(source,'d3.min.js'),path.join(home,'vendor','d3','d3.min.js'));
fs.writeFileSync(path.join(home,'where-data.js'),"'use strict';\n// OpenStreetMap contributors, ODbL 1.0. https://www.openstreetmap.org/copyright\n// Snapshot "+data.meta.timestamp+"; Thun and nearby streets.\nwindow.CabanonWhereSnapshot='"+encoded+"';\n");
console.log('WHERE data:',data.search.length,'searchable places/addresses,',data.network.length,'road ways.');
