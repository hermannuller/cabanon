'use strict';
// Every moving item follows the finger exactly; only a pin crossing adds a jump.
(() => {
 const ROW=56,THRESHOLD=20.4,EPS=1e-6;
 class PhoneFlow {
  constructor(items,offset=0){this.offset=offset;this.columns=[0,1].map(col=>({pins:[],moving:[]}));
   for(const item of items){const c=this.columns[item.col];if(!c)continue;const record={id:item.id,y:item.row*ROW-(item.pinned?0:offset),height:item.size*ROW};(item.pinned?c.pins:c.moving).push(record);}
   for(const c of this.columns){c.pins.sort((a,b)=>a.y-b.y);const merged=[];for(const p of c.pins){const last=merged.at(-1);if(last&&p.y<=last.y+last.height+EPS)last.height=Math.max(last.y+last.height,p.y+p.height)-last.y;else merged.push({...p});}c.barriers=merged;}
  }
  top(id){for(const c of this.columns){const item=[...c.pins,...c.moving].find(i=>i.id===id);if(item)return item.y;}return null;}
  snapshot(){return JSON.parse(JSON.stringify({offset:this.offset,columns:this.columns}));}
  restore(s){this.offset=s.offset;this.columns=JSON.parse(JSON.stringify(s.columns));}
  insert(id,col,targetId,after){
   const ids=Array.isArray(id)?id:[id],records=new Map();
   for(const c of this.columns){for(const item of c.moving)if(ids.includes(item.id))records.set(item.id,item);c.moving=c.moving.filter(i=>!ids.includes(i.id));}
   const dragged=ids.map(id=>records.get(id)).filter(Boolean);if(!dragged.length)return;
   const c=this.columns[col],target=[...c.pins,...c.moving].find(i=>i.id===targetId);
   const ordered=[...c.moving].sort((a,b)=>a.y-b.y);
   if(!target){let y=ordered.length?ordered.at(-1).y+ordered.at(-1).height:0;for(const item of dragged){item.y=y;y+=item.height;}c.moving.push(...dragged);this.snap();return;}
   const boundary=target.y+(after?target.height:0),before=ordered.filter(i=>i.y<boundary),following=ordered.filter(i=>i.y>=boundary);
   const occupied=new Set();for(const pin of c.pins)for(let r=Math.floor(pin.y/ROW);r<Math.ceil((pin.y+pin.height)/ROW);r++)occupied.add(r);
   const fits=(r,h)=>Array.from({length:h},(_,n)=>r+n).every(n=>!occupied.has(n));
   if(c.pins.includes(target)&&!after)before.push(...dragged);else following.unshift(...dragged);
   let row=Math.round(boundary/ROW);
   for(const item of before.reverse()){const h=Math.ceil(item.height/ROW);row-=h;while(!fits(row,h))row--;item.y=row*ROW;}
   row=Math.round(boundary/ROW);
   for(const item of following){const h=Math.ceil(item.height/ROW);while(!fits(row,h))row++;item.y=row*ROW;row+=h;}
   c.moving.push(...dragged);this.snap(c.pins.includes(target)?col:-1);
  }
  snap(skipColumn=-1){
   for(const [col,c] of this.columns.entries()){
    if(col===skipColumn)continue;
    const sorted=[...c.moving].sort((a,b)=>a.y-b.y),occupied=new Set();
    for(const p of c.pins)for(let row=Math.floor(p.y/ROW);row<Math.ceil((p.y+p.height)/ROW);row++)occupied.add(row);
    // Keep the current viewport: only the half-visible top item decides which
    // item starts row zero. Earlier items remain above it, available on scroll.
    let first=sorted.findIndex(item=>item.y+item.height/2>=-EPS);
    if(first<0)first=sorted.length;
    let row=0;
    for(const item of sorted.slice(first)){
     const height=Math.max(1,Math.ceil(item.height/ROW));
     while(Array.from({length:height},(_,i)=>row+i).some(r=>occupied.has(r)))row++;
     item.y=row*ROW;row+=height;
    }
    row=0;
    for(const item of sorted.slice(0,first).reverse()){
     const height=Math.max(1,Math.ceil(item.height/ROW));row-=height;
     while(Array.from({length:height},(_,i)=>row+i).some(r=>occupied.has(r)))row--;
     item.y=row*ROW;
    }
   }
  }
  move(delta){if(!delta)return;this.offset+=delta;const direction=delta>0?-1:1;for(const c of this.columns)this.advance(c,Math.abs(delta),direction);}
  advance(c,distance,direction){
   // Down is the same algorithm under vertical reflection. No per-direction
   // animation, pause, cluster state, or changes to any neighboring item.
   for(const item of c.moving){
    let y=direction<0?item.y:-item.y-item.height;
    const pins=c.barriers.map(p=>({y:direction<0?p.y:-p.y-p.height,height:p.height}));
    let remaining=distance;
    while(remaining>EPS){
     let next=null;
     for(const pin of pins){
      const threshold=pin.y+pin.height-THRESHOLD;
      const travel=y>threshold?y-threshold:y>=pin.y-EPS?0:Infinity;
      if(travel<=remaining+EPS&&(!next||travel<next.travel))next={pin,travel};
     }
     if(!next){y-=remaining;break;}
     y-=next.travel+next.pin.height;
     remaining-=next.travel;
    }
    item.y=direction<0?y:-y-item.height;
   }
  }
 }
 if(typeof module!=='undefined'&&module.exports)module.exports=PhoneFlow;
 else window.CabanonPhoneFlow=PhoneFlow;
})();
