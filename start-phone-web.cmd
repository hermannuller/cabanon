@echo off
cd /d "%~dp0"
node serve-phone.cjs --background
pause
