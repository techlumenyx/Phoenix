param(
  [string]$MongoUri = $env:MONGO_URI,
  [string]$OutputRoot = (Join-Path $PSScriptRoot '..\..\backups')
)

$ErrorActionPreference = 'Stop'
if (-not $MongoUri) { throw 'MONGO_URI is required.' }
if (-not (Get-Command mongodump -ErrorAction SilentlyContinue)) { throw 'mongodump is required. Install MongoDB Database Tools.' }

$workspace = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$resolvedRoot = [System.IO.Path]::GetFullPath($OutputRoot)
if (-not $resolvedRoot.StartsWith($workspace, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Backup output must remain inside the workspace: $workspace"
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$destination = Join-Path $resolvedRoot "cl-admin-$timestamp"
New-Item -ItemType Directory -Force -Path $destination | Out-Null
mongodump --uri=$MongoUri --db=cl_admin --out=$destination
if ($LASTEXITCODE -ne 0) { throw "mongodump failed with exit code $LASTEXITCODE" }

$archive = Join-Path $resolvedRoot "cl-admin-$timestamp.zip"
Compress-Archive -Path (Join-Path $destination 'cl_admin') -DestinationPath $archive -CompressionLevel Optimal
$checksum = (Get-FileHash -Algorithm SHA256 -LiteralPath $archive).Hash
Set-Content -LiteralPath "$archive.sha256" -Value "$checksum  $([System.IO.Path]::GetFileName($archive))" -Encoding ascii
Write-Host "Admin backup created: $archive"
Write-Host "SHA256: $checksum"
