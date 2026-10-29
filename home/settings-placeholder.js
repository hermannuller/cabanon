'use strict';
function showSettingPlaceholder(key){
 const win=createWindow(key,'SETTING','settings','<h1>SETTING</h1>');
 win.querySelector('.window-content').innerHTML='<h1>SETTING</h1>';
 return win;
}
openSettings=function(){const win=showSettingPlaceholder('system:settings');win.querySelector('.window-content').innerHTML='<h1>SETTING</h1><label>Welcome<input id="new-file-base-name" value="'+escapeHTML(welcomeText())+'" autocomplete="off"></label><button class="action" id="save-new-file-name">Save</button>';const field=win.querySelector('#new-file-base-name');win.querySelector('#save-new-file-name').onclick=()=>{const value=field.value.trim().replace(/\.+$/,'');if(!value||/[\/\x00-\x1f]/.test(value)){warning('Enter a valid file name.');return;}prefs.newEntryBaseName=value;persistProfiles();field.value=value;};field.onkeydown=event=>{if(event.key==='Enter')win.querySelector('#save-new-file-name').click();};return win;};
openSpecificSettings=function(kind){return showSettingPlaceholder('setting:'+kind);};
openWidgetSettings=function(){return showSettingPlaceholder('widget-settings');};
