@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-tests.ps1" -Site public -Mode preview -Markers org_login -PreviewWait 3000 -SlowMo 750
