web: node dist/main.js
worker: WORKER_MODE=true node dist/worker.js
release: npx prisma migrate deploy --schema=prisma/schema.prisma
