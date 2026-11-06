'use strict';
// Schema 2 merges old L3 into L2. Schema 3 swaps warning/mark roles L7/L8.
// This file intentionally
// names the legacy keys: never run a source-wide role renumber over this map.
window.CabanonColorRoles=(()=>{
 const version=3;
 function role(number,from){if(from<2)number=number===3?2:number>3?number-1:number;if(from<3)number=number===7?8:number===8?7:number;return number;}
 function palette(source,from=1){if(!source||typeof source!=='object'||Array.isArray(source))return source;const result={};for(const [key,value]of Object.entries(source)){if(from<2&&key==='l3')continue;const match=/^l(1[012]|[1-9])$/.exec(key);result[match?'l'+role(Number(match[1]),from):key]=value;}return result;}
 function migrateSettings(settings,from=1){if(!settings||settings.colorRoleVersion>=version)return false;from=settings.colorRoleVersion||from;if(settings.themeDraft)settings.themeDraft=palette(settings.themeDraft,from);if(settings.themes&&typeof settings.themes==='object')for(const key of Object.keys(settings.themes))settings.themes[key]=palette(settings.themes[key],from);settings.colorRoleVersion=version;return true;}
 function covers(value,from){if(!value||typeof value!=='object'||value.colorRoleVersion>=version)return;from=value.colorRoleVersion||from;if(value.cover&&typeof value.cover==='object'&&typeof value.cover.color==='string')value.cover.color=value.cover.color.replace(/^--l(1[012]|[1-9])$/,(_,n)=>'--l'+role(Number(n),from));for(const [key,child]of Object.entries(value)){if(['body','text','content','notes','draft','helpDrafts','files'].includes(key))continue;if(child&&typeof child==='object')covers(child,from);}}
 function migrateProfile(profile){if(!profile||typeof profile!=='object'||profile.colorRoleVersion>=version)return false;migrateSettings(profile.settings,profile.colorRoleVersion||1);profile.colorRoleVersion=version;return true;}
 function migrateRiver(data){if(!data||typeof data!=='object'||data.colorRoleVersion>=version)return false;covers(data,data.colorRoleVersion||1);data.colorRoleVersion=version;return true;}
 function migrateStorage(storage=localStorage){const writes=[];for(let index=0;index<storage.length;index++){const key=storage.key(index);if(!['cabanon-home','cabanon-profiles'].includes(key)&&!key?.startsWith('cabanon-river:'))continue;const raw=storage.getItem(key);let value;try{value=JSON.parse(raw);}catch{continue;}let changed=false;if(key==='cabanon-profiles'&&value&&typeof value==='object'){for(const profile of Object.values(value))changed=migrateProfile(profile)||changed;}else changed=key.startsWith('cabanon-river:')?migrateRiver(value):migrateProfile(value);if(changed)writes.push({key,raw,next:JSON.stringify(value)});}
  if(!writes.length)return{changed:0};const backup='cabanon-color-role-backup-v3:'+Date.now();storage.setItem(backup,JSON.stringify({to:version,values:Object.fromEntries(writes.map(item=>[item.key,item.raw]))}));let done=0;try{for(const item of writes){storage.setItem(item.key,item.next);done++;}}catch(error){for(const item of writes.slice(0,done))storage.setItem(item.key,item.raw);throw error;}return{changed:writes.length,backup};
 }
 const api={version,palette,migrateSettings,migrateProfile,migrateRiver,migrateStorage};
 try{api.startup=migrateStorage();}catch(error){console.error('Color-role migration could not be saved; original data retained.',error);api.startup={error:true};}
 return api;
})();
