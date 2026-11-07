#!/usr/bin/env bash
# Wrapper — see scripts/smoke-tracking.mjs
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec node "$ROOT/scripts/smoke-tracking.mjs" "$@"
