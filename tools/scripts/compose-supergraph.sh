#!/usr/bin/env bash
# Composes the supergraph schema from all four subgraph SDLs using Rover CLI.
# Run after any .graphql schema change.
# Requires: rover CLI (npm install -g @apollo/rover)
set -e

WORKSPACE_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUTPUT="$WORKSPACE_ROOT/apps/gateway/supergraph.graphql"

echo "Composing supergraph from $WORKSPACE_ROOT/rover.yaml..."
rover supergraph compose \
  --config "$WORKSPACE_ROOT/rover.yaml" \
  --output "$OUTPUT"

echo "Supergraph written to $OUTPUT"
