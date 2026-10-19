'use strict';
const {randomUUID}=require('node:crypto');
const sources=['https://www.cloudflare.com/cdn-cgi/trace','https://www.microsoft.com/en-us/'];
// Read fresh HTTPS server dates; never change the operating-system clock.
async function syncInternetTime(fetchTime=globalThis.fetch,now=Date.now){
 for(const source of sources){
  try{
   const url=new URL(source);url.searchParams.set('cabanon-time',randomUUID());
   const started=now();
   const response=await fetchTime(url.href,{method:'HEAD',cache:'no-store',headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(5000),redirect:'error'});
   const finished=now(),server=Date.parse(response.headers.get('date')),age=Number(response.headers.get('age')||0);
   if(!response.ok||!Number.isFinite(server)||!Number.isFinite(age)||age!==0||finished<started||finished-started>6000)continue;
   // HTTP dates have one-second precision. Use the middle of that second.
   return {ok:true,offset:server+500-(started+finished)/2,source:new URL(source).hostname};
  }catch{}
 }
 return {ok:false,error:'Internet time is unavailable. Check your connection and try again.'};
}
module.exports={syncInternetTime};
