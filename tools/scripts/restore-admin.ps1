param(
  [Parameter(Mandatory = $true)][string]$BackupDirectory,
  [string]$MongoUri = $env:MONGO_URI,
  [Parameter(Mandatory = $true)][string]$ConfirmRestore
)

$ErrorActionPreference = 'Stop'
if ($ConfirmRestore -ne 'RESTORE-cl_admin') { throw 'Pass -ConfirmRestore RESTORE-cl_admin to acknowledge replacement of cl_admin data.' }
if (-not $MongoUri) { throw 'MONGO_URI is required.' }
if (-not (Get-Command mongorestore -ErrorAction SilentlyContinue)) { throw 'mongorestore is required. Install MongoDB Database Tools.' }

$source = (Resolve-Path -LiteralPath $BackupDirectory).Path
$dbSource = if ((Split-Path $source -Leaf) -eq 'cl_admin') { $source } else { Join-Path $source 'cl_admin' }
if (-not (Test-Path -LiteralPath $dbSource -PathType Container)) { throw "cl_admin dump directory not found under $source" }

Write-Host 'Restoring cl_admin. The existing database will be replaced.'
mongorestore --uri=$MongoUri --db=cl_admin --drop $dbSource
if ($LASTEXITCODE -ne 0) { throw "mongorestore failed with exit code $LASTEXITCODE" }
Write-Host 'Restore completed. Run the admin acceptance checklist before reopening staff access.'
