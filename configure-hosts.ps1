# Hosts File Configuration Script for COSTAATT Document Upload System
# Run this script on the web server with Administrator privileges

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "COSTAATT Document Upload System" -ForegroundColor Cyan
Write-Host "Hosts File Configuration Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Red
    pause
    exit 1
}

$HostsFile = "C:\Windows\System32\drivers\etc\hosts"
$TargetIP = "10.2.1.27"

Write-Host "Configuring hosts file: $HostsFile" -ForegroundColor Yellow
Write-Host "Target IP Address: $TargetIP" -ForegroundColor Yellow
Write-Host ""

try {
    # Backup the original hosts file
    $BackupFile = "$HostsFile.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $HostsFile $BackupFile -Force
    Write-Host "✓ Created backup: $BackupFile" -ForegroundColor Green
    
    # Read current hosts file
    $HostsContent = Get-Content $HostsFile -Raw
    
    # Define the entries to add
    $NewEntries = @(
        "",
        "# COSTAATT Document Upload System",
        "$TargetIP`tdocupload.costaatt.edu.tt",
        "$TargetIP`tdocuplaod.costaatt.edu.tt"
    )
    
    # Check if entries already exist
    if ($HostsContent -match "docupload\.costaatt\.edu\.tt") {
        Write-Host "⚠ COSTAATT entries already exist in hosts file" -ForegroundColor Yellow
        Write-Host "Removing old entries..." -ForegroundColor Yellow
        
        # Remove old entries
        $Lines = Get-Content $HostsFile
        $FilteredLines = $Lines | Where-Object { $_ -notmatch "docupload\.costaatt\.edu\.tt|docuplaod\.costaatt\.edu\.tt|# COSTAATT Document Upload System" }
        $FilteredLines | Set-Content $HostsFile
    }
    
    # Add new entries
    Add-Content $HostsFile $NewEntries
    Write-Host "✓ Added COSTAATT hostname entries" -ForegroundColor Green
    
    # Verify the entries
    Write-Host ""
    Write-Host "Verifying hosts file entries..." -ForegroundColor Yellow
    $UpdatedContent = Get-Content $HostsFile | Select-String "costaatt"
    if ($UpdatedContent) {
        Write-Host "✓ Hosts file entries confirmed:" -ForegroundColor Green
        $UpdatedContent | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
    }
    
    Write-Host ""
    Write-Host "Hosts file configuration completed successfully!" -ForegroundColor Green
    
    # Test resolution
    Write-Host ""
    Write-Host "Testing hostname resolution..." -ForegroundColor Yellow
    try {
        $Result1 = [System.Net.Dns]::GetHostAddresses("docupload.costaatt.edu.tt")
        Write-Host "✓ docupload.costaatt.edu.tt resolves to: $($Result1[0].IPAddressToString)" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠ Could not resolve docupload.costaatt.edu.tt" -ForegroundColor Yellow
    }
    
    try {
        $Result2 = [System.Net.Dns]::GetHostAddresses("docuplaod.costaatt.edu.tt")
        Write-Host "✓ docuplaod.costaatt.edu.tt resolves to: $($Result2[0].IPAddressToString)" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠ Could not resolve docuplaod.costaatt.edu.tt" -ForegroundColor Yellow
    }
    
}
catch {
    Write-Host "✗ Error configuring hosts file: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Hosts File Configuration Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run configure-apache.ps1 to configure Apache" -ForegroundColor White
Write-Host "2. Restart Apache service" -ForegroundColor White
Write-Host "3. Test URLs in browser" -ForegroundColor White
Write-Host ""
pause
