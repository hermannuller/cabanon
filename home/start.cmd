@echo off
cd /d "%~dp0"
if exist "node_modules\electron\dist\electron.exe" (
  start "" "node_modules\electron\dist\electron.exe" .
) else if exist "..\..\blind\node_modules\electron\dist\electron.exe" (
  start "" "..\..\blind\node_modules\electron\dist\electron.exe" .
) else (
  echo Electron not found. Run npm install in this folder, then open start.cmd again.
  pause
)
