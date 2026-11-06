'use strict';
// Add available POIs from a local OSM file without replacing the reviewed geometry/network.
const fs=require('fs'),vm=require('vm'),zlib=require('zlib'),path=require('path'),kindOf=require('./where-poi-kinds.cjs');
const source=process.argv[2];if(!source)throw Error('Pass a local OSM JSON snapshot.');
const target=path.join(__dirname,'../home/where-data.js'),context={window:{}};vm.runInNewContext(fs.readFileSync(target,'utf8'),context);
const data=JSON.parse(zlib.gunzipSync(Buffer.from(context.window.CabanonWhereSnapshot,'base64'))),raw=JSON.parse(fs.readFileSync(source,'utf8')),seen=new Set(data.search.map(p=>p.id)),counts={};
for(const e of raw.elements){const id=e.type+'/'+e.id,t=e.tags||{},kind=kindOf(t);if(!kind||seen.has(id))continue;const points=e.geometry||e.members?.flatMap(m=>m.geometry||[])||[],xy=e.type==='node'?[e.lon,e.lat]:e.center?[e.center.lon,e.center.lat]:points.length?[points.reduce((n,p)=>n+p.lon,0)/points.length,points.reduce((n,p)=>n+p.lat,0)/points.length]:null;
 if(!xy||xy[0]<data.bounds[0]||xy[0]>data.bounds[2]||xy[1]<data.bounds[1]||xy[1]>data.bounds[3])continue;
 const name=t.name||t.brand||t.operator||({parking:'停车场',fuel:'加油站',charging:'充电站',bus:'公交站',subway:'地铁站',religion:'宗教场所',park:'公园'}[kind]);if(!name)continue;
 data.search.push({id,name,kind,xy,tags:Object.fromEntries(['amenity','tourism','leisure','shop','opening_hours','wheelchair','brand'].filter(k=>t[k]).map(k=>[k,t[k]]))});seen.add(id);counts[kind]=(counts[kind]||0)+1;
}
fs.writeFileSync(target,"'use strict';\n// OpenStreetMap contributors, ODbL 1.0. https://www.openstreetmap.org/copyright\n// Snapshot "+data.meta.timestamp+"; Thun and nearby streets.\nwindow.CabanonWhereSnapshot='"+zlib.gzipSync(JSON.stringify(data),{level:9}).toString('base64')+"';\n");console.log('Added local OSM POIs:',counts,'total',data.search.length);
