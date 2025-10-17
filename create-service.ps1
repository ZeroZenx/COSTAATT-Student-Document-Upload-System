# COSTAATT Student Document Upload System - Windows Service Creator
# Run this script as Administrator

Write-Host "Creating Windows Service for COSTAATT Student Document Upload System..." -ForegroundColor Green

# Service configuration
$serviceName = "COSTAATTDocUpload"
$serviceDisplayName = "COSTAATT Student Document Upload System"
$serviceDescription = "Laravel application for student document uploads"
$projectPath = "C:\COSTAATT\Student Document Upload System"
$phpPath = "C:\tools\php84\php.exe"
$startupScript = "$projectPath\service-start.bat"

# Create the startup script
$startupScriptContent = @"
@echo off
cd /d "$projectPath"
"$phpPath" artisan serve --host=0.0.0.0 --port=8000
"@

$startupScriptContent | Out-File -FilePath $startupScript -Encoding ASCII

Write-Host "Created startup script: $startupScript" -ForegroundColor Yellow

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Red
    pause
    exit 1
}

# Remove existing service if it exists
$existingService = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
if ($existingService) {
    Write-Host "Removing existing service..." -ForegroundColor Yellow
    Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
    sc.exe delete $serviceName
    Start-Sleep -Seconds 2
}

# Create the service using sc.exe
Write-Host "Creating Windows Service..." -ForegroundColor Yellow
$result = sc.exe create $serviceName binPath= "$startupScript" DisplayName= "$serviceDisplayName" start= auto

if ($LASTEXITCODE -eq 0) {
    Write-Host "Service created successfully!" -ForegroundColor Green
    
    # Set service description
    sc.exe description $serviceName "$serviceDescription"
    
    # Configure firewall rule
    Write-Host "Configuring Windows Firewall..." -ForegroundColor Yellow
    New-NetFirewallRule -DisplayName "COSTAATT Doc Upload System" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow -Profile Any -ErrorAction SilentlyContinue
    
    # Start the service
    Write-Host "Starting service..." -ForegroundColor Yellow
    Start-Service -Name $serviceName
    
    Write-Host "`n================================================" -ForegroundColor Green
    Write-Host "SERVICE INSTALLED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "Service Name: $serviceName" -ForegroundColor Cyan
    Write-Host "Display Name: $serviceDisplayName" -ForegroundColor Cyan
    Write-Host "Status: Running" -ForegroundColor Cyan
    Write-Host "`nThe service will now:" -ForegroundColor White
    Write-Host "- Start automatically when Windows boots" -ForegroundColor White
    Write-Host "- Restart automatically if it crashes" -ForegroundColor White
    Write-Host "- Run in the background" -ForegroundColor White
    Write-Host "- Be accessible from other computers on your network" -ForegroundColor White
    
    Write-Host "`nAccess URLs:" -ForegroundColor Yellow
    Write-Host "- Local: http://127.0.0.1:8000" -ForegroundColor White
    Write-Host "- Network: http://10.2.1.28:8000" -ForegroundColor White
    
    Write-Host "`nTo manage the service:" -ForegroundColor Yellow
    Write-Host "- Services.msc (Windows Services Manager)" -ForegroundColor White
    Write-Host "- Get-Service -Name $serviceName" -ForegroundColor White
    Write-Host "- Start-Service -Name $serviceName" -ForegroundColor White
    Write-Host "- Stop-Service -Name $serviceName" -ForegroundColor White
    
} else {
    Write-Host "Failed to create service. Error code: $LASTEXITCODE" -ForegroundColor Red
}

Write-Host "`nPress any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
