@echo off
REM Composes the supergraph schema from all four subgraph SDLs using Rover CLI.
REM Run after any .graphql schema change.
REM Requires: rover CLI (npm install -g @apollo/rover)

set WORKSPACE_ROOT=%~dp0..\..
set APOLLO_CONFIG_HOME=%WORKSPACE_ROOT%\.nx\rover

set ROVER_CMD="%WORKSPACE_ROOT%\node_modules\.bin\rover.cmd"
if exist %ROVER_CMD% goto rover_found
where rover >nul 2>nul
if errorlevel 1 (
  echo ERROR: Rover CLI is required but was not found locally or on PATH. 1>&2
  echo Run npm install to restore workspace development dependencies. 1>&2
  exit /b 1
)
set ROVER_CMD=rover
:rover_found

echo Composing supergraph from %WORKSPACE_ROOT%\rover.yaml...
call %ROVER_CMD% supergraph compose --elv2-license accept --config "%WORKSPACE_ROOT%\rover.yaml" --output "%WORKSPACE_ROOT%\apps\gateway\supergraph.graphql"
if errorlevel 1 exit /b %errorlevel%

echo Supergraph written to apps\gateway\supergraph.graphql
