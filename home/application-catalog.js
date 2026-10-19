 'use strict';
const catalogOpenApp=openApp;
openApp=function(name,...args){name=canonicalAppName(name);return catalogOpenApp(name,...args);};
for(const profile of Object.values(profiles))normalizeApplicationCatalog(profile);
persistProfiles();renderPins();renderAll();
