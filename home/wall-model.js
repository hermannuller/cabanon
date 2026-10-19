'use strict';
const WALL_COLORS=Object.freeze(['#0e100f','#1d1d1b','#282828','#414342','#fefbe3','#6d6d62','#10a53b','#ff880a','#c5173e','#ffb3c1','#08c5eb','#999efa']);
const wallSegmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter(undefined,{granularity:'grapheme'}):null;
function wallLetters(text){return wallSegmenter?[...wallSegmenter.segment(String(text))].map(part=>part.segment):Array.from(String(text));}
function wallSingle(text){return wallLetters(text)[0]||'';}
class WallDocument{
 constructor(source){
  this.settings={mode:'pc',brushSize:1,fontWeight:800,fontSize:14,margin:20,height:28,spacing:200,opacity:100};
  this.brush='A';this.bucket='';this.color=4;this.baseColor=4;this.advance=8.4;this.columns=0;this.rows=0;this.cells=[];this.colors=new Uint8Array();
  if(source)this.load(source);else this.resize({});
 }
 geometry(settings){
  const s=Object.assign({},this.settings,settings);
  for(const [key,min,max]of [['fontSize',1,72],['margin',0,399],['height',1,999],['spacing',1,9999],['opacity',0,100]]){const value=Number(s[key]);if(!Number.isFinite(value)||value<min||value>max)throw Error('Invalid '+key);s[key]=value;}
  s.fontWeight=Number(s.fontWeight);if(![100,200,300,400,500,600,700,800].includes(s.fontWeight))throw Error('Invalid fontWeight');
  s.brushSize=Number(s.brushSize);if(![1,3,5,7,9].includes(s.brushSize))throw Error('Invalid brushSize');
  if(!['pc','phone'].includes(s.mode))throw Error('Invalid mode');
  if(s.mode==='phone')s.margin=0;
  const canvasWidth=s.mode==='phone'?1080:1920,canvasHeight=s.mode==='phone'?2340:1080;
  const width=canvasWidth-2*s.margin,height=canvasHeight-2*s.margin,advance=s.fontSize*.6;
  const columns=Math.max(1,Math.floor(width/Math.max(1,advance*s.spacing/100))),rows=Math.floor(height/s.height);
  if(!rows)throw Error('Leave enough space for at least one row.');
  if(columns*rows>80000)throw Error('Increase height or spacing to use fewer characters.');
  return{settings:s,canvasWidth,canvasHeight,columns,rows,advance,step:columns>1?(width-advance)/(columns-1):width};
 }
 resize(settings){
  const g=this.geometry(settings),cells=new Array(g.columns*g.rows).fill('.'),colors=new Uint8Array(cells.length).fill(this.baseColor);
  for(let row=0;row<Math.min(this.rows,g.rows);row++)for(let col=0;col<Math.min(this.columns,g.columns);col++){const old=row*this.columns+col,next=row*g.columns+col;cells[next]=this.cells[old];colors[next]=this.colors[old];}
  Object.assign(this,g,{cells,colors});return this;
 }
 center(index){const row=Math.floor(index/this.columns),col=index%this.columns;return{x:this.settings.margin+(this.columns===1?(this.canvasWidth-2*this.settings.margin)/2:this.advance/2+col*this.step),y:this.settings.margin+(row+.5)*this.settings.height};}
 hit(x,y){const col=this.columns===1?0:Math.round((x-this.settings.margin-this.advance/2)/this.step),row=Math.floor((y-this.settings.margin)/this.settings.height);return Math.max(0,Math.min(this.rows-1,row))*this.columns+Math.max(0,Math.min(this.columns-1,col));}
 paint(index){const char=this.brush||this.cells[index];if(this.cells[index]===char&&this.colors[index]===this.color)return false;this.cells[index]=char;this.colors[index]=this.color;return true;}
 stamp(index,changed){const col=index%this.columns,row=Math.floor(index/this.columns),radius=(this.settings.brushSize-1)/2;for(let y=Math.max(0,row-radius);y<=Math.min(this.rows-1,row+radius);y++)for(let x=Math.max(0,col-radius);x<=Math.min(this.columns-1,col+radius);x++){const cell=y*this.columns+x;if(this.paint(cell))changed.add(cell);}}
 stroke(from,to){let x=from%this.columns,y=Math.floor(from/this.columns),endX=to%this.columns,endY=Math.floor(to/this.columns),dx=Math.abs(endX-x),dy=-Math.abs(endY-y),sx=x<endX?1:-1,sy=y<endY?1:-1,error=dx+dy;const changed=new Set();for(;;){this.stamp(y*this.columns+x,changed);if(x===endX&&y===endY)break;const e=2*error;if(e>=dy){error+=dy;x+=sx;}if(e<=dx){error+=dx;y+=sy;}}return[...changed];}
 fill(){this.colors.fill(this.color);this.baseColor=this.color;if(this.bucket)this.cells.fill(this.bucket);}
 serialize(){return{kind:'cabanon.wall',version:1,settings:Object.assign({},this.settings),columns:this.columns,rows:this.rows,cells:this.cells.slice(),colors:Array.from(this.colors),brush:this.brush,bucket:this.bucket,color:this.color,baseColor:this.baseColor};}
 load(source){
  if(!source||source.kind!=='cabanon.wall'||source.version!==1)throw Error('This file cannot be opened in WALL.');
  const g=this.geometry(source.settings||{}),count=g.columns*g.rows;
  if(source.columns!==g.columns||source.rows!==g.rows||!Array.isArray(source.cells)||!Array.isArray(source.colors)||source.cells.length!==count||source.colors.length!==count)throw Error('Invalid WALL document.');
  if(source.cells.some(char=>typeof char!=='string'||char.length>64||wallLetters(char).length!==1)||source.colors.some(color=>!Number.isInteger(color)||color<0||color>=WALL_COLORS.length))throw Error('Invalid WALL document.');
  Object.assign(this,g);this.cells=source.cells.slice();this.colors=Uint8Array.from(source.colors);this.brush=wallSingle(source.brush??'A');this.bucket=wallSingle(source.bucket??'');this.color=Number.isInteger(source.color)&&source.color>=0&&source.color<WALL_COLORS.length?source.color:4;this.baseColor=Number.isInteger(source.baseColor)&&source.baseColor>=0&&source.baseColor<WALL_COLORS.length?source.baseColor:5;return this;
 }
}
if(typeof module!=='undefined')module.exports={WallDocument,WALL_COLORS,wallSingle};
