# DNS Configuration Script for COSTAATT Document Upload System
# Run this script on your internal DNS server with Administrator privileges

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "COSTAATT Document Upload System" -ForegroundColor Cyan
Write-Host "DNS Configuration Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Red
    pause
    exit 1
}

# DNS Server Configuration
$DNSZone = "costaatt.edu.tt"
$TargetIP = "10.2.1.27"

Write-Host "Configuring DNS records for zone: $DNSZone" -ForegroundColor Yellow
Write-Host "Target IP Address: $TargetIP" -ForegroundColor Yellow
Write-Host ""

try {
    # Check if DNS server role is installed
    $DNSRole = Get-WindowsFeature -Name DNS -ErrorAction SilentlyContinue
    if ($DNSRole -and $DNSRole.InstallState -eq "Installed") {
        Write-Host "✓ DNS Server role is installed" -ForegroundColor Green
        
        # Create A records
        Write-Host "Creating DNS A records..." -ForegroundColor Yellow
        
        # Main hostname
        try {
            Add-DnsServerResourceRecordA -Name "docupload" -ZoneName $DNSZone -IPv4Address $TargetIP -ErrorAction Stop
            Write-Host "✓ Created A record: docupload.costaatt.edu.tt → $TargetIP" -ForegroundColor Green
        }
        catch {
            Write-Host "⚠ A record for docupload.costaatt.edu.tt may already exist" -ForegroundColor Yellow
        }
        
        # Typo variation hostname
        try {
            Add-DnsServerResourceRecordA -Name "docuplaod" -ZoneName $DNSZone -IPv4Address $TargetIP -ErrorAction Stop
            Write-Host "✓ Created A record: docuplaod.costaatt.edu.tt → $TargetIP" -ForegroundColor Green
        }
        catch {
            Write-Host "⚠ A record for docuplaod.costaatt.edu.tt may already exist" -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "DNS configuration completed successfully!" -ForegroundColor Green
        
        # Verify DNS records
        Write-Host "Verifying DNS records..." -ForegroundColor Yellow
        try {
            $record1 = Resolve-DnsName "docupload.costaatt.edu.tt" -ErrorAction Stop
            Write-Host "✓ docupload.costaatt.edu.tt resolves to: $($record1[0].IPAddress)" -ForegroundColor Green
        }
        catch {
            Write-Host "⚠ Could not verify docupload.costaatt.edu.tt resolution" -ForegroundColor Yellow
        }
        
        try {
            $record2 = Resolve-DnsName "docuplaod.costaatt.edu.tt" -ErrorAction Stop
            Write-Host "✓ docuplaod.costaatt.edu.tt resolves to: $($record2[0].IPAddress)" -ForegroundColor Green
        }
        catch {
            Write-Host "⚠ Could not verify docuplaod.costaatt.edu.tt resolution" -ForegroundColor Yellow
        }
        
    }
    else {
        Write-Host "✗ DNS Server role is not installed on this machine" -ForegroundColor Red
        Write-Host "Please install the DNS Server role or run this script on your DNS server" -ForegroundColor Red
        Write-Host ""
        Write-Host "Alternative: Contact your Network Administrator to add these DNS records:" -ForegroundColor Yellow
        Write-Host "  docupload.costaatt.edu.tt → $TargetIP" -ForegroundColor White
        Write-Host "  docuplaod.costaatt.edu.tt → $TargetIP" -ForegroundColor White
    }
}
catch {
    Write-Host "✗ Error configuring DNS: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DNS Configuration Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run configure-hosts.ps1 on the web server" -ForegroundColor White
Write-Host "2. Run configure-apache.ps1 on the web server" -ForegroundColor White
Write-Host "3. Test the URLs in a browser" -ForegroundColor White
Write-Host ""
pause
