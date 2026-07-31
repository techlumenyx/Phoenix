@echo off
set "TARGET=%~1"
if "%TARGET%"=="" set "TARGET=all"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-tests.ps1" -Site "%TARGET%" -Mode preview
