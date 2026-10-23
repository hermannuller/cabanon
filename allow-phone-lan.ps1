$ErrorActionPreference='Stop'
$phoneIdentity=[Security.Principal.WindowsIdentity]::GetCurrent()
$phonePrincipal=New-Object Security.Principal.WindowsPrincipal($phoneIdentity)
if(-not $phonePrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)){
 Start-Process powershell.exe -Verb RunAs -WindowStyle Hidden -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',('"'+$PSCommandPath+'"'))
 exit
}
$phoneRule=Get-NetFirewallRule -DisplayName 'Cabanon Phone LAN 8787' -ErrorAction SilentlyContinue
if(-not $phoneRule){New-NetFirewallRule -DisplayName 'Cabanon Phone LAN 8787' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8787 -RemoteAddress LocalSubnet -Profile Private | Out-Null}
