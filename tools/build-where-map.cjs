'use strict';
// Turn the reviewed inline map into a shared application component.
const fs=require('node:fs'),path=require('node:path');
const source=process.argv[2];if(!source)throw Error('Pass thun-map.html.');
const html=fs.readFileSync(source,'utf8').replaceAll('\r\n','\n'),home=path.join(__dirname,'..','home');
let markup=html.slice(0,html.indexOf('<style>')).replace('<div id="cbn-thun-map"','<div class="where-map"').replace(/ <header>.*?<\/header>\n/,'').replace('id="thun-water"','data-water-pattern id="thun-water"');
markup=markup.replace('class="north"','class="where-north"');
let css=html.match(/<style>([\s\S]*?)<\/style>/)[1].replaceAll('#cbn-thun-map','.where-map').replace(/--l1:[^;]+;--l2:[^;]+;--l2:[^;]+;--l4:[^;]+;--l6:[^;]+;/,'');
css=css.replaceAll('.north','.where-north');
css+='\n.where-map{display:flex;flex-direction:column;height:100%;min-height:0;font-family:JetBrains,SourceHan,monospace}.where-map .map-stage{flex:1;min-height:0}.where-map .map{height:100%}.where-map footer{padding:4px 12px}.where-map .map-status{padding:4px 12px}\n@media(max-width:480px){.where-map .map{height:100%}}\n';
fs.writeFileSync(path.join(home,'where-map.css'),css);
let body=html.slice(html.indexOf('(async()=>{')+'(async()=>{'.length,html.lastIndexOf('})().catch('));
body=body.replace("const root=document.getElementById('cbn-thun-map'),", "const root=host.querySelector('.where-map'),");
body=body.replace("function el(tag,attrs,parent=world){const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);parent.append(n);return n;}","function el(tag,attrs,parent=world){const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(attrs['stroke-width']!==undefined)n.style.setProperty('stroke-width',attrs['stroke-width'],'important');n.style.vectorEffect=attrs['vector-effect']||'none';parent.append(n);return n;}");
body=body.slice(0,body.indexOf(" const zipped="))+body.slice(body.indexOf(' let width='));
body=body.replace(' let width='," svg.style.fill='none';svg.style.stroke='none';for(const n of svg.querySelectorAll('[stroke-width]')){n.style.setProperty('stroke-width',n.getAttribute('stroke-width'),'important');n.style.vectorEffect=n.getAttribute('vector-effect')||'none';}\n let width=");
body=body.replace("root.querySelector('#thun-water')","root.querySelector('[data-water-pattern]')");
// The definition ID is instance-scoped; every paint reference must use that same ID.
body=body.replaceAll("'url(#thun-water)'","'url(#'+prefix+'water)'");
body=body.replace(/ const saved=.*?\n/,' const saved=options.view; if(saved&&saved.zoom>=1&&saved.zoom<=8){zoom=saved.zoom;if(Array.isArray(saved.pan))pan=saved.pan;}\n');
body=body.replace(/ function save\(\).*?\n/," function save(){options.onView?.({zoom,pan:[...pan]});}\n");
body=body.replace(/ window.addEventListener\('openai:set_globals'.*?\n/,'');
body=body.replace(' new ResizeObserver(scheduleBuild).observe(root.querySelector(\'.map-stage\'));'," const resizeObserver=new ResizeObserver(scheduleBuild);resizeObserver.observe(root.querySelector('.map-stage'));");
body=body.replace("let width=736", "let overlay={paths:[],points:[]},routeLayer;let width=736");
body=body.replace("  labels.replaceChildren();", "  routeLayer=el('g',{'data-layer':'selection'});labels.replaceChildren();");
body=body.replace("const occupied=[];for(const n of labels.children)", "renderOverlay();const occupied=[];for(const n of labels.children)");
body+=`
 function renderOverlay(){if(!routeLayer)return;routeLayer.replaceChildren();for(const coordinates of overlay.paths){const d=path({type:'LineString',coordinates});line(d,'var(--l1)',8,routeLayer,{'vector-effect':'non-scaling-stroke'});line(d,'var(--l4)',4,routeLayer,{'vector-effect':'non-scaling-stroke'});}for(const p of overlay.points){const xy=projection(p.xy);el('circle',{cx:xy[0],cy:xy[1],r:5/zoom,fill:'var(--l4)',stroke:'var(--l1)','stroke-width':2,'vector-effect':'non-scaling-stroke'},routeLayer);}}
 function focus(points){if(!projection||!points.length)return;const positions=points.map(p=>projection(p.xy)),xs=positions.map(p=>p[0]),ys=positions.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);zoom=points.length===1?Math.max(3,zoom):Math.max(1,Math.min(8,(width-100)/Math.max(1,maxX-minX),(height-140)/Math.max(1,maxY-minY)));pan=[width/2-(minX+maxX)*zoom/2,height/2-(minY+maxY)*zoom/2];update();save();}
 return {root,focus,show(paths=[],points=[],fit=true){overlay={paths,points};if(fit&&(points.length||paths.length))focus([...points,...paths.flatMap(p=>p.map(xy=>({xy})))]);else update();},clear(){overlay={paths:[],points:[]};update();},destroy(){resizeObserver.disconnect();cancelAnimationFrame(resizeFrame);root.remove();}};
`;
const code="'use strict';\nwindow.CabanonWhereMap=(()=>{let serial=0;const markup="+JSON.stringify(markup)+";return {mount(host,data,options={}){const prefix='where-'+(++serial)+'-';host.innerHTML=markup.replaceAll('thun-water',prefix+'water').replaceAll('thun-viewport',prefix+'viewport');"+body+"}};})();\n";
fs.writeFileSync(path.join(home,'where-map.js'),code);
console.log('Built shared WHERE map.');
