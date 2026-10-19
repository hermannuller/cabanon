'use strict';
// A fixed Shanghai noon boundary, independent of the device's current time zone.
const RiverModel=(()=>{
 const DAY=86400000,NOON=4*3600000;
 const boundary=t=>Math.floor((t-NOON)/DAY)*DAY+NOON;
 const expiry=t=>boundary(t+DAY)+365*DAY;
 const remaining=(post,now=Date.now())=>Math.max(0,Math.min(365,Math.ceil((expiry(post.renewed)-boundary(now))/DAY)));
 const words=text=>(text.trim().match(/\S+/gu)||[]).length;
 function chain(posts,id){const result=[],seen=new Set();while(id&&!seen.has(id)){seen.add(id);const post=posts.find(p=>p.id===id);if(!post)break;result.unshift(post);id=post.parent;}return result;}
 function repost(posts,id,author,text,keep,now=Date.now()){
  const upstream=chain(posts,id);if(!upstream.length)throw Error('Post unavailable.');
  upstream.forEach(p=>p.renewed=now);
  const post={id:'p'+now+'-'+Math.random().toString(36).slice(2,7),author,text,created:now,renewed:now,parent:id,root:upstream[0].id,keep};posts.unshift(post);return post;
 }
 function seed(now=Date.now()){
  const p=(id,author,text,days,life,parent=null,keep)=>({id,author,text,created:now-days*DAY,renewed:now-(365-life)*DAY,parent,root:parent?'a':id,keep});
  return [p('a','mira_field','The city feels completely different after midnight.\n#Same-streets',82,362),p('b','archivezero',"Same streets, fewer explanations. I think that is what I like about walking home late.",12,362,'a',['a']),p('c','paperengine','There is a whole other city in the hours we usually sleep through.',3,362,'b',['a','b']),p('d','northwindow','Spent three hours fixing a bug that turned out to be one missing comma. Excellent use of a Thursday.',1,364),p('e','paperengine','Small tools are underrated. I would rather have five things that work perfectly than fifty things I barely understand.',160,231),p('f','sundayradio','Rain all afternoon. Made coffee, opened a book, accidentally had a decent day.',6,359),p('g','loworbit_', 'Every interface eventually becomes a negotiation between what the designer wants and what the user refuses to learn.',350,23),p('h','mira_field','A small collection of things I almost forgot: the sound of the station, a yellow window, the way you said see you tomorrow.',360,12),p('i','archivezero','Not everything needs to become something. Some days it is enough to notice.',190,184),p('j','northwindow','Leaving a little room for whatever happens next.',14,351)];
 }
 function addExamples(posts,now=Date.now()){
  const base=posts.filter(p=>!p.id.startsWith('demo2-')&&!p.deleted&&remaining(p,now)>0),authors=['northwindow','paperengine','sundayradio','archivezero','mira_field'],lines=['Soft light. Late train.','Still thinking about this.','A small thing, worth keeping.','Same here. One more thought.'];let tick=0;
  for(const [i,parent]of base.entries())for(let n=0;n<2;n++){const id='demo2-'+parent.id+'-'+n;if(posts.some(p=>p.id===id))continue;const child=repost(posts,parent.id,authors[(i+n)%authors.length],lines[(i+n)%lines.length],undefined,now+tick++);child.id=id;}
  const branch=posts.find(p=>p.id==='demo2-c-0')||posts.find(p=>p.id.startsWith('demo2-'));if(branch)for(let n=0;n<2;n++){const id='demo2-branch-'+n;if(posts.some(p=>p.id===id))continue;const child=repost(posts,branch.id,authors[n],'Another small echo. '+(n+1),undefined,now+tick++);child.id=id;}
 }
 function addLifetimeExamples(posts,now=Date.now()){
  for(const days of [365,270,180,90,30,14,3]){const id='life-preview-'+days;if(posts.some(p=>p.id===id))continue;const renewed=boundary(now)-(366-days)*DAY;posts.push({id,author:'mira_field',text:days===30?'Thirty days left. A little red line.':days+' days left. A small note in the river.',created:renewed-DAY,renewed});}
 }
 return {DAY,boundary,expiry,remaining,words,chain,repost,seed,addExamples,addLifetimeExamples};
})();
