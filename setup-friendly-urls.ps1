# Master Setup Script for COSTAATT Document Upload System Friendly URLs
# This script orchestrates the entire setup process
# Run this script on the web server with Administrator privileges

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "COSTAATT Document Upload System" -ForegroundColor Cyan
Write-Host "Friendly URLs Setup - Master Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Red
    pause
    exit 1
}

Write-Host "This script will set up friendly URLs for the COSTAATT Document Upload System." -ForegroundColor Yellow
Write-Host "Target URLs:" -ForegroundColor Yellow
Write-Host "• Student Portal: http://docupload.costaatt.edu.tt" -ForegroundColor White
Write-Host "• Admin Portal: http://docupload.costaatt.edu.tt/admin" -ForegroundColor White
Write-Host ""

$Continue = Read-Host "Do you want to continue? (Y/N)"
if ($Continue -ne "Y" -and $Continue -ne "y") {
    Write-Host "Setup cancelled by user." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Starting setup process..." -ForegroundColor Green
Write-Host ""

# Step 1: Configure hosts file
Write-Host "[1/4] Configuring hosts file..." -ForegroundColor Cyan
try {
    if (Test-Path ".\configure-hosts.ps1") {
        & ".\configure-hosts.ps1"
        Write-Host "✓ Hosts file configuration completed" -ForegroundColor Green
    }
    else {
        Write-Host "⚠ configure-hosts.ps1 not found, skipping hosts file setup" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "✗ Error configuring hosts file: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Step 2: Configure Apache
Write-Host "[2/4] Configuring Apache VirtualHosts..." -ForegroundColor Cyan
try {
    if (Test-Path ".\configure-apache.ps1") {
        & ".\configure-apache.ps1"
        Write-Host "✓ Apache configuration completed" -ForegroundColor Green
    }
    else {
        Write-Host "⚠ configure-apache.ps1 not found, skipping Apache configuration" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "✗ Error configuring Apache: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Step 3: Restart Apache
Write-Host "[3/4] Restarting Apache service..." -ForegroundColor Cyan
try {
    if (Test-Path ".\restart-apache.ps1") {
        & ".\restart-apache.ps1"
        Write-Host "✓ Apache restart completed" -ForegroundColor Green
    }
    else {
        Write-Host "⚠ restart-apache.ps1 not found, restarting Apache manually..." -ForegroundColor Yellow
        Restart-Service -Name "Apache2.4" -Force
        Write-Host "✓ Apache service restarted" -ForegroundColor Green
    }
}
catch {
    Write-Host "✗ Error restarting Apache: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Step 4: Final verification
Write-Host "[4/4] Performing final verification..." -ForegroundColor Cyan

# Test hostname resolution
Write-Host "Testing hostname resolution..." -ForegroundColor Yellow
try {
    $Result1 = [System.Net.Dns]::GetHostAddresses("docupload.costaatt.edu.tt")
    Write-Host "✓ docupload.costaatt.edu.tt resolves to: $($Result1[0].IPAddressToString)" -ForegroundColor Green
}
catch {
    Write-Host "✗ Could not resolve docupload.costaatt.edu.tt" -ForegroundColor Red
}

try {
    $Result2 = [System.Net.Dns]::GetHostAddresses("docuplaod.costaatt.edu.tt")
    Write-Host "✓ docuplaod.costaatt.edu.tt resolves to: $($Result2[0].IPAddressToString)" -ForegroundColor Green
}
catch {
    Write-Host "✗ Could not resolve docuplaod.costaatt.edu.tt" -ForegroundColor Red
}

# Test Apache service
Write-Host "Checking Apache service status..." -ForegroundColor Yellow
$ServiceStatus = Get-Service -Name "Apache2.4" -ErrorAction SilentlyContinue
if ($ServiceStatus -and $ServiceStatus.Status -eq "Running") {
    Write-Host "✓ Apache service is running" -ForegroundColor Green
}
else {
    Write-Host "✗ Apache service is not running" -ForegroundColor Red
}

# Test port 80
Write-Host "Checking if Apache is listening on port 80..." -ForegroundColor Yellow
$Port80 = Get-NetTCPConnection -LocalPort 80 -ErrorAction SilentlyContinue
if ($Port80) {
    Write-Host "✓ Apache is listening on port 80" -ForegroundColor Green
}
else {
    Write-Host "✗ Apache is not listening on port 80" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your friendly URLs are now ready:" -ForegroundColor Green
Write-Host "• Student Portal: http://docupload.costaatt.edu.tt" -ForegroundColor White
Write-Host "• Admin Portal: http://docupload.costaatt.edu.tt/admin" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open the URLs above in your browser to test" -ForegroundColor White
Write-Host "2. If DNS is not working, run configure-dns.ps1 on your DNS server" -ForegroundColor White
Write-Host "3. For SSL setup, use the SSL configuration files when ready" -ForegroundColor White
Write-Host ""
Write-Host "Troubleshooting:" -ForegroundColor Yellow
Write-Host "• Check Apache logs: C:\Apache24\logs\docupload-error.log" -ForegroundColor White
Write-Host "• Verify hosts file: C:\Windows\System32\drivers\etc\hosts" -ForegroundColor White
Write-Host "• Test with: ping docupload.costaatt.edu.tt" -ForegroundColor White
Write-Host ""
pause
