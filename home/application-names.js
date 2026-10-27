'use strict';
// The only editable source of application display names. Keys are stable IDs.
const applicationNames={MARATHON:'MARATHON',TXT:'TXT',POINT:'POINT',Ur:'SHEET',RIVER:'RIVER',THEN:'TODO',COLORS:'COLORS',EMPTY:'EMPTY',LINE:'LINE',ZIP:'ZIP',WALL:'WALL',CARE:'CONTACTS',DATE:'DATE',TYPE:'TYPE',WHERE:'WHERE',DIAL:'RADIO',WEATHER:'WEATHER',STOCKS:'STOCKS',CALC:'CALC',OutDesign:'UNDESIGN',HELP:'HELP',ASTRO:'ASTRO',TIME:'TIME','/HOUSE':'/HOUSE'};
function appLabel(id){return applicationNames[id]??id;}
// Only authored application UI prose uses this helper, never user documents.
function appText(text){return text.replace(/\b[A-Z][A-Z0-9]*\b/g,id=>appLabel(id));}

function validApplicationLabel(value){return /^[A-Za-z0-9]{3,9}$/.test(value);}
function setApplicationLabel(id,value){if(!Object.hasOwn(applicationNames,id)||id==='/HOUSE')throw Error('Unknown application');if(!validApplicationLabel(value))throw Error('Use 3–9 letters or numbers.');if(Object.entries(applicationNames).some(([other,label])=>other!==id&&label.toLowerCase()===value.toLowerCase()))throw Error('Name already exists.');applicationNames[id]=value;}
for(const [id,label]of Object.entries(applicationNames))if(id!=='/HOUSE'&&!validApplicationLabel(label))throw Error('Invalid application name: '+id);

// Shared PC/Phone no-remove table. Add stable application IDs here.
const applicationNoRemove=Object.freeze({TIME:true,DATE:true});
function canRemoveApplication(id){return !applicationNoRemove[canonicalAppName(id)];}

// Authored PDF icon identities shared by PC and Phone; application IDs remain stable.
const applicationPdfIcons=Object.freeze({CARE:'contacts',ASTRO:'astro',ZIP:'zip',LINE:'line',RIVER:'river',THEN:'plan',TXT:'txt',Ur:'sheet',POINT:'point',COLORS:'colors',WEATHER:'weather',TIME:'time',DATE:'date',STOCKS:'stocks',MARATHON:'marathon',DIAL:'radio',TYPE:'translation',WHERE:'where',OutDesign:'outdesign','/HOUSE':'house'});

const quickToolApplications={"FLASH":["FLASH","flashlight"],"LEVEL":["LEVEL","level"],"SCAN":["SCAN","scan"],"STOPWATCH":["STOPWATCH","stopwatch"],"ALARM":["ALARM","alarm"],"TIMER":["TIMER","timer"],"COMPASS":["COMPASS","compass"],"TRANSL":["TRANSL","translation"],"WALLET":["WALLET","wallet"],"CAST":["CAST","cast"],"TELEPHONE":["PHONE","phone"],"MESSAGES":["MESSAGES","messages"],"ASSISTANT":["ASSISTANT","assistant"]};
Object.assign(applicationNames,Object.fromEntries(Object.entries(quickToolApplications).map(([id,v])=>[id,v[0]])));
