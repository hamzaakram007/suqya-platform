#!/bin/sh
set -eu

SCHEMA="${PRISMA_SCHEMA:-prisma/schema.prisma}"

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
  echo "[entrypoint] Running prisma migrate deploy..."
  npx prisma migrate deploy --schema="$SCHEMA"
fi

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "[entrypoint] Running prisma seed..."
  if command -v ts-node >/dev/null 2>&1 && [ -f prisma/seed.ts ]; then
    npx ts-node prisma/seed.ts
  elif [ -f dist/prisma/seed.js ]; then
    node dist/prisma/seed.js
  else
    echo "[entrypoint] Seed requested but no seed runner available; skipping"
  fi
fi

if [ "${WORKER_MODE:-false}" = "true" ]; then
  echo "[entrypoint] Starting BullMQ worker..."
  exec node dist/worker.js
fi

echo "[entrypoint] Starting Suqya API..."
exec node dist/main.js
