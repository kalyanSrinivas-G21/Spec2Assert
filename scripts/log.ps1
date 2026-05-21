param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("STEP", "CMD", "PROBLEM", "FIX", "DECISION", "VERIFY", "PROMPT", "NOTE")]
    [string]$Tag,

    [Parameter(Mandatory=$true)]
    [string]$Message
)

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm")
$entry = "`n### $timestamp [$Tag] $Message`n"
Add-Content -Path "BUILD_LOG.md" -Value $entry
Write-Host "logged: [$Tag] $Message"
