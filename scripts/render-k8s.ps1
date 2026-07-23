# Substitute AWS account ID in K8s manifests.
# Usage: $env:AWS_ACCOUNT_ID="123456789012"; .\scripts\render-k8s.ps1

param(
  [string]$AccountId = $env:AWS_ACCOUNT_ID
)

if (-not $AccountId) {
  Write-Error "Set AWS_ACCOUNT_ID env var or pass -AccountId"
  exit 1
}

$files = Get-ChildItem -Path "$PSScriptRoot\..\infra\k8s" -Filter "*.yaml" -Recurse
foreach ($file in $files) {
  $content = Get-Content $file.FullName -Raw
  if ($content -match 'ACCOUNT_ID') {
    $updated = $content -replace 'ACCOUNT_ID', $AccountId
    Set-Content -Path $file.FullName -Value $updated -NoNewline
    Write-Host "Updated $($file.Name)"
  }
}

Write-Host "Done. ACCOUNT_ID -> $AccountId"
