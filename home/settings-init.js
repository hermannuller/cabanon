'use strict';
settingPrefs();settingApplyAppearance();settingApplyControls();settingRefreshClock();settingDecorateShared();settingScheduleIdle();persistProfiles();
const settingsLaunchApp=openApp;openApp=function(name){if(prefs.uninstalled.includes(name))return;return settingsLaunchApp(name);};
function settingDeleteGuest(id){if(id==='owner'||id===activeProfile)return;profiles.owner.settings ||= {};profiles.owner.settings.deletedGuests=[...new Set([...(profiles.owner.settings.deletedGuests||[]),id])];delete profiles[id];}
const settingsRefreshUser=refreshUserIcon;refreshUserIcon=function(){settingsRefreshUser();settingPrefs();settingApplyAppearance();settingApplyControls();settingRefreshClock();settingDecorateShared();settingScheduleIdle();};
// Routes from the existing system flyouts use the same sectioned reader.
const settingOpenSystem=openSystem;openSystem=function(name){const route={NETWORK:'internet',VOLUME:'volume',INPUT:'language',USER:'me',SETTING:'me'};return route[name]?openSettings(route[name]):settingOpenSystem(name);};
// Reinstall/reset data policy is not final. Keep the entry points, without guessing destructive behavior.
if(sessionStorage.getItem('cabanon-signed-out'))settingSignOut();else{settingWelcome();for(const name of settingPrefs().startup||[])if(!prefs.uninstalled.includes(name))openApp(name);}
