param(
    [ValidateSet("all", "public", "admin")]
    [string]$Site = "all",

    [ValidateSet("cli", "preview")]
    [string]$Mode = "cli",

    [int]$PreviewWait = 3000,
    [int]$SlowMo = 500,
    [string]$Markers = ""
)

$ErrorActionPreference = "Stop"
$projectRoot = $PSScriptRoot
$logDirectory = Join-Path $projectRoot "logs"
New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = Join-Path $logDirectory "$timestamp-$Site-$Mode.log"
$pytestArguments = @("-m", "pytest", "--site", $Site, "-v", "--color=yes")

if ($Mode -eq "preview") {
    $pytestArguments += @(
        "--headed",
        "--slowmo", $SlowMo,
        "--preview-wait", $PreviewWait
    )
}

if ($Markers) {
    $pytestArguments += @("-m", $Markers)
}

Write-Host "Christian Listings automation" -ForegroundColor Cyan
Write-Host "Site: " -NoNewline -ForegroundColor DarkGray
Write-Host $Site -NoNewline -ForegroundColor Yellow
Write-Host " | Mode: " -NoNewline -ForegroundColor DarkGray
Write-Host $Mode -ForegroundColor Magenta
Write-Host "Log:  " -NoNewline -ForegroundColor DarkGray
Write-Host $logFile -ForegroundColor Blue
Write-Host ""

$ansiPattern = "$([char]27)\[[0-9;]*[A-Za-z]"
& python @pytestArguments 2>&1 | ForEach-Object {
    $line = $_.ToString()
    Write-Host $line
    ($line -replace $ansiPattern, "") | Add-Content -Path $logFile -Encoding utf8
}
$testExitCode = $LASTEXITCODE

Write-Host ""
if ($testExitCode -eq 0) {
    Write-Host "PASS  Tests completed successfully" -ForegroundColor Green
    Write-Host "Log saved to $logFile" -ForegroundColor DarkGray
} else {
    Write-Host "FAIL  Tests failed with exit code $testExitCode" -ForegroundColor Red
    Write-Host "Log saved to $logFile" -ForegroundColor DarkGray
}

exit $testExitCode
