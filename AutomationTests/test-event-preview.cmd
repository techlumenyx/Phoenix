@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-tests.ps1" -Site all -Mode preview -Markers event_creation -PreviewWait 3000 -SlowMo 750
