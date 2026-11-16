@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Can cai Node.js 24 tu https://nodejs.org truoc khi chay.
 pause
 exit /b 1
)
node --input-type=module -e "import {DatabaseSync} from 'node:sqlite'" >nul 2>nul
if errorlevel 1 (
 echo Node.js hien tai chua ho tro SQLite. Hay cai Node.js 24.
 pause
 exit /b 1
)
set MOC_OPEN_BROWSER=1
node bootstrap.mjs
pause
