#!/usr/bin/env bash
# Composes the supergraph schema from all four subgraph SDLs using Rover CLI.
# Run after any .graphql schema change.
# Requires: rover CLI (npm install -g @apollo/rover)
set -e

WORKSPACE_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUTPUT="$WORKSPACE_ROOT/apps/gateway/supergraph.graphql"
export APOLLO_CONFIG_HOME="$WORKSPACE_ROOT/.nx/rover"

if [[ -x "$WORKSPACE_ROOT/node_modules/.bin/rover" ]]; then
  ROVER="$WORKSPACE_ROOT/node_modules/.bin/rover"
elif command -v rover >/dev/null 2>&1; then
  ROVER="rover"
else
  echo "ERROR: Rover CLI is required but was not found locally or on PATH." >&2
  echo "Run npm install to restore workspace development dependencies." >&2
  exit 1
fi

echo "Composing supergraph from $WORKSPACE_ROOT/rover.yaml..."
"$ROVER" supergraph compose \
  --elv2-license accept \
  --config "$WORKSPACE_ROOT/rover.yaml" \
  --output "$OUTPUT"

echo "Supergraph written to $OUTPUT"
