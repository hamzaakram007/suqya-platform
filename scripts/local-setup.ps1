# Suqya local development bootstrap (Windows PowerShell)
# Prerequisites: Node 20+, Docker Desktop

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

Write-Host "==> Starting Postgres + Redis..."
docker compose -f infra/docker/docker-compose.yml up -d

Write-Host "==> Installing dependencies..."
npm install

Write-Host "==> Prisma generate + migrate + seed..."
npm run db:generate
npm run db:migrate
npm run db:seed

Write-Host "==> Building and testing API..."
npm run build -w @suqya/api
npm test -w @suqya/api

Write-Host ""
Write-Host "Local setup complete. Start services:"
Write-Host "  npm run dev:api       # :4000"
Write-Host "  npm run dev:admin     # :3000"
Write-Host "  npm run dev:supplier  # :3001"
Write-Host ""
Write-Host "Dev logins (OTP 123456, tenant default-tenant):"
Write-Host "  Admin:    +966501234567"
Write-Host "  Supplier: +966502345678"
Write-Host "  Driver:   +966503456789"
Write-Host "  Customer: +966504567890"
