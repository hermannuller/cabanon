@echo off
cd /d "%~dp0"
rem Launch Electron directly. `start` goes through ShellExecute, which makes
rem Windows reputation-check the unsigned Electron binary and can show a
rem "cannot verify the publisher" prompt. CreateProcess skips that check.
if exist "node_modules\electron\dist\electron.exe" (
  "node_modules\electron\dist\electron.exe" .
) else if exist "..\..\blind\node_modules\electron\dist\electron.exe" (
  "..\..\blind\node_modules\electron\dist\electron.exe" .
) else (
  echo Electron not found. Run npm install in this folder, then open start.cmd again.
  pause
)
