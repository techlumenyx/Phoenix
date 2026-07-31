@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-tests.ps1" -Site all -Mode preview -Markers account_creation -PreviewWait 3000 -SlowMo 750
