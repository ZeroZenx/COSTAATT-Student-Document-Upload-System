# Apache Restart Script for COSTAATT Document Upload System
# Run this script on the web server with Administrator privileges

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "COSTAATT Document Upload System" -ForegroundColor Cyan
Write-Host "Apache Restart Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Red
    pause
    exit 1
}

Write-Host "Restarting Apache service..." -ForegroundColor Yellow
Write-Host ""

try {
    # Stop Apache service
    Write-Host "Stopping Apache service..." -ForegroundColor Yellow
    Stop-Service -Name "Apache2.4" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
    Write-Host "✓ Apache service stopped" -ForegroundColor Green
    
    # Start Apache service
    Write-Host "Starting Apache service..." -ForegroundColor Yellow
    Start-Service -Name "Apache2.4" -ErrorAction Stop
    Start-Sleep -Seconds 3
    
    # Check if service is running
    $ServiceStatus = Get-Service -Name "Apache2.4" -ErrorAction SilentlyContinue
    if ($ServiceStatus -and $ServiceStatus.Status -eq "Running") {
        Write-Host "✓ Apache service is running" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Apache service failed to start" -ForegroundColor Red
        Write-Host "Please check Apache error logs for details" -ForegroundColor Red
        Write-Host "Log location: C:\Apache24\logs\error.log" -ForegroundColor Yellow
        pause
        exit 1
    }
    
    # Test configuration
    Write-Host ""
    Write-Host "Testing Apache configuration..." -ForegroundColor Yellow
    try {
        $TestResult = & "C:\Apache24\bin\httpd.exe" -t 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Apache configuration is valid" -ForegroundColor Green
        }
        else {
            Write-Host "⚠ Apache configuration issues detected:" -ForegroundColor Yellow
            Write-Host $TestResult -ForegroundColor White
        }
    }
    catch {
        Write-Host "⚠ Could not test Apache configuration" -ForegroundColor Yellow
    }
    
    # Check if Apache is listening on port 80
    Write-Host ""
    Write-Host "Checking if Apache is listening on port 80..." -ForegroundColor Yellow
    $Port80 = Get-NetTCPConnection -LocalPort 80 -ErrorAction SilentlyContinue
    if ($Port80) {
        Write-Host "✓ Apache is listening on port 80" -ForegroundColor Green
    }
    else {
        Write-Host "⚠ Apache may not be listening on port 80" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Apache restart completed successfully!" -ForegroundColor Green
    
}
catch {
    Write-Host "✗ Error restarting Apache: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check Apache error logs for details" -ForegroundColor Red
    Write-Host "Log location: C:\Apache24\logs\error.log" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Apache Restart Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Testing hostname resolution..." -ForegroundColor Yellow
Write-Host ""

# Test hostname resolution
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

Write-Host ""
Write-Host "Ready to test URLs:" -ForegroundColor Yellow
Write-Host "• Student Portal: http://docupload.costaatt.edu.tt" -ForegroundColor White
Write-Host "• Admin Portal: http://docupload.costaatt.edu.tt/admin" -ForegroundColor White
Write-Host ""
Write-Host "Open these URLs in your browser to verify the setup!" -ForegroundColor Green
Write-Host ""
pause
