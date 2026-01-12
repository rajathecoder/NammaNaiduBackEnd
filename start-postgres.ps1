# PostgreSQL Service Starter Script
Write-Host "=== PostgreSQL Service Checker ===" -ForegroundColor Cyan

# Check for PostgreSQL services
$services = Get-Service | Where-Object { $_.DisplayName -like "*PostgreSQL*" -or $_.Name -like "*postgres*" }

if ($services.Count -eq 0) {
    Write-Host "`nNo PostgreSQL services found." -ForegroundColor Yellow
    Write-Host "`nTrying to find PostgreSQL installation..." -ForegroundColor Yellow
    
    # Check common installation paths
    $pgPaths = @(
        "C:\Program Files\PostgreSQL",
        "C:\Program Files (x86)\PostgreSQL"
    )
    
    foreach ($path in $pgPaths) {
        if (Test-Path $path) {
            Write-Host "Found PostgreSQL at: $path" -ForegroundColor Green
            $versions = Get-ChildItem $path -Directory -ErrorAction SilentlyContinue
            foreach ($version in $versions) {
                Write-Host "  Version: $($version.Name)" -ForegroundColor Cyan
                $binPath = Join-Path $version.FullName "bin\pg_ctl.exe"
                if (Test-Path $binPath) {
                    Write-Host "    Bin path: $binPath" -ForegroundColor Gray
                }
            }
        }
    }
    
    Write-Host "`nPlease start PostgreSQL manually:" -ForegroundColor Yellow
    Write-Host "1. Open Services (Win+R -> services.msc)" -ForegroundColor White
    Write-Host "2. Find 'postgresql-x64-XX' or 'PostgreSQL Server XX'" -ForegroundColor White
    Write-Host "3. Right-click -> Start" -ForegroundColor White
} else {
    Write-Host "`nFound PostgreSQL services:" -ForegroundColor Green
    foreach ($service in $services) {
        Write-Host "  Name: $($service.Name)" -ForegroundColor Cyan
        Write-Host "  Display: $($service.DisplayName)" -ForegroundColor Gray
        Write-Host "  Status: $($service.Status)" -ForegroundColor $(if ($service.Status -eq 'Running') { 'Green' } else { 'Red' })
        
        if ($service.Status -ne 'Running') {
            Write-Host "  Attempting to start..." -ForegroundColor Yellow
            try {
                Start-Service -Name $service.Name
                Write-Host "  ✓ Service started successfully!" -ForegroundColor Green
                Start-Sleep -Seconds 2
            } catch {
                Write-Host "  ✗ Failed to start: $_" -ForegroundColor Red
                Write-Host "  Try running PowerShell as Administrator" -ForegroundColor Yellow
            }
        }
    }
}

Write-Host "`n=== Connection Test ===" -ForegroundColor Cyan
Write-Host "Testing connection to PostgreSQL..." -ForegroundColor Yellow
node test-db-connection.js

