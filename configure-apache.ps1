# Apache Configuration Script for COSTAATT Document Upload System
# Run this script on the web server with Administrator privileges

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "COSTAATT Document Upload System" -ForegroundColor Cyan
Write-Host "Apache Configuration Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Red
    pause
    exit 1
}

$ApacheConfDir = "C:\Apache24\conf"
$ApacheVHostsFile = "$ApacheConfDir\extra\httpd-vhosts.conf"
$ApacheMainConf = "$ApacheConfDir\httpd.conf"
$DocumentRoot = "C:\COSTAATT\DocUpload\public"

Write-Host "Configuring Apache VirtualHosts..." -ForegroundColor Yellow
Write-Host "Apache Config Directory: $ApacheConfDir" -ForegroundColor Yellow
Write-Host "Document Root: $DocumentRoot" -ForegroundColor Yellow
Write-Host ""

try {
    # Check if Apache is installed
    if (-not (Test-Path $ApacheConfDir)) {
        Write-Host "✗ Apache not found at $ApacheConfDir" -ForegroundColor Red
        Write-Host "Please ensure Apache is installed and update the path in this script" -ForegroundColor Red
        pause
        exit 1
    }
    
    Write-Host "✓ Apache configuration directory found" -ForegroundColor Green
    
    # Create VirtualHosts configuration
    $VHostsConfig = @"
# COSTAATT Document Upload System VirtualHost Configuration
# Generated on $(Get-Date)

<VirtualHost *:80>
    ServerName docupload.costaatt.edu.tt
    ServerAlias docuplaod.costaatt.edu.tt
    DocumentRoot "$DocumentRoot"
    
    # Laravel URL Rewriting
    <Directory "$DocumentRoot">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^(.*)$ index.php [QSA,L]
    </Directory>
    
    # Security Headers
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    
    # Logging
    ErrorLog "C:/Apache24/logs/docupload-error.log"
    CustomLog "C:/Apache24/logs/docupload-access.log" common
</VirtualHost>
"@
    
    # Backup existing VirtualHosts file
    if (Test-Path $ApacheVHostsFile) {
        $BackupFile = "$ApacheVHostsFile.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Copy-Item $ApacheVHostsFile $BackupFile -Force
        Write-Host "✓ Created backup: $BackupFile" -ForegroundColor Green
    }
    
    # Write VirtualHosts configuration
    Set-Content $ApacheVHostsFile $VHostsConfig -Encoding UTF8
    Write-Host "✓ Created VirtualHosts configuration" -ForegroundColor Green
    
    # Check if httpd-vhosts.conf is included in main config
    $MainConfContent = Get-Content $ApacheMainConf -Raw
    if ($MainConfContent -notmatch "Include.*httpd-vhosts\.conf") {
        Write-Host "⚠ VirtualHosts include not found in main config" -ForegroundColor Yellow
        Write-Host "Adding Include directive..." -ForegroundColor Yellow
        
        # Add the include directive
        $IncludeLine = "Include conf/extra/httpd-vhosts.conf"
        Add-Content $ApacheMainConf "`n$IncludeLine"
        Write-Host "✓ Added VirtualHosts include directive" -ForegroundColor Green
    }
    else {
        Write-Host "✓ VirtualHosts include already configured" -ForegroundColor Green
    }
    
    # Check if required modules are loaded
    $RequiredModules = @("rewrite_module", "headers_module")
    foreach ($Module in $RequiredModules) {
        if ($MainConfContent -match "LoadModule.*$Module") {
            Write-Host "✓ Module $Module is loaded" -ForegroundColor Green
        }
        else {
            Write-Host "⚠ Module $Module may not be loaded" -ForegroundColor Yellow
            Write-Host "Please ensure LoadModule $Module is uncommented in httpd.conf" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "Apache configuration completed successfully!" -ForegroundColor Green
    
    # Test Apache configuration
    Write-Host ""
    Write-Host "Testing Apache configuration..." -ForegroundColor Yellow
    try {
        $TestResult = & "C:\Apache24\bin\httpd.exe" -t 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Apache configuration syntax is valid" -ForegroundColor Green
        }
        else {
            Write-Host "⚠ Apache configuration test failed:" -ForegroundColor Yellow
            Write-Host $TestResult -ForegroundColor White
        }
    }
    catch {
        Write-Host "⚠ Could not test Apache configuration (httpd.exe not found)" -ForegroundColor Yellow
    }
    
}
catch {
    Write-Host "✗ Error configuring Apache: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Apache Configuration Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run restart-apache.ps1 to restart Apache service" -ForegroundColor White
Write-Host "2. Test the URLs in a browser:" -ForegroundColor White
Write-Host "   - http://docupload.costaatt.edu.tt" -ForegroundColor White
Write-Host "   - http://docupload.costaatt.edu.tt/admin" -ForegroundColor White
Write-Host ""
pause
