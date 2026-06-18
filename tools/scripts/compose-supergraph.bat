@echo off
REM Composes the supergraph schema from all four subgraph SDLs using Rover CLI.
REM Run after any .graphql schema change.
REM Requires: rover CLI (npm install -g @apollo/rover)

set WORKSPACE_ROOT=%~dp0..\..

echo Composing supergraph from %WORKSPACE_ROOT%\rover.yaml...
rover supergraph compose --config "%WORKSPACE_ROOT%\rover.yaml" --output "%WORKSPACE_ROOT%\apps\gateway\supergraph.graphql"

echo Supergraph written to apps\gateway\supergraph.graphql
