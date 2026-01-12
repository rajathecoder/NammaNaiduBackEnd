# PostgreSQL Connection Fixer Script
Write-Host "=== PostgreSQL Connection Diagnostic ===" -ForegroundColor Cyan

# Check if PostgreSQL is listening
Write-Host "`n1. Checking if PostgreSQL is listening on port 5432..." -ForegroundColor Yellow
$port5432 = netstat -ano | findstr :5432
if ($port5432) {
    Write-Host "   ✓ PostgreSQL is listening on port 5432" -ForegroundColor Green
    Write-Host "   $port5432" -ForegroundColor Gray
} else {
    Write-Host "   ✗ PostgreSQL is NOT listening on port 5432" -ForegroundColor Red
}

# Check all listening ports
Write-Host "`n2. Checking all PostgreSQL-related ports..." -ForegroundColor Yellow
$allPorts = netstat -ano | findstr LISTENING
$pgPorts = $allPorts | Select-String -Pattern "543[0-9]|15432"
if ($pgPorts) {
    Write-Host "   Found PostgreSQL ports:" -ForegroundColor Green
    $pgPorts | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
} else {
    Write-Host "   No PostgreSQL ports found" -ForegroundColor Red
}

# Check PostgreSQL service status
Write-Host "`n3. Checking PostgreSQL service..." -ForegroundColor Yellow
$pgService = Get-Service | Where-Object { $_.DisplayName -like "*PostgreSQL*" -or $_.Name -like "*postgres*" } | Select-Object -First 1
if ($pgService) {
    Write-Host "   Service: $($pgService.DisplayName)" -ForegroundColor Cyan
    Write-Host "   Status: $($pgService.Status)" -ForegroundColor $(if ($pgService.Status -eq 'Running') { 'Green' } else { 'Red' })
    
    if ($pgService.Status -ne 'Running') {
        Write-Host "   Attempting to start service..." -ForegroundColor Yellow
        try {
            Start-Service -Name $pgService.Name
            Write-Host "   ✓ Service started" -ForegroundColor Green
            Start-Sleep -Seconds 3
        } catch {
            Write-Host "   ✗ Failed to start: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "   Attempting to restart service..." -ForegroundColor Yellow
        try {
            Restart-Service -Name $pgService.Name -Force
            Write-Host "   ✓ Service restarted" -ForegroundColor Green
            Start-Sleep -Seconds 3
        } catch {
            Write-Host "   ✗ Failed to restart: $_" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   ✗ PostgreSQL service not found" -ForegroundColor Red
}

# Try to find PostgreSQL bin directory and test connection
Write-Host "`n4. Testing connection with psql (if available)..." -ForegroundColor Yellow
$pgPaths = @(
    "C:\Program Files\PostgreSQL\18\bin\psql.exe",
    "C:\Program Files\PostgreSQL\17\bin\psql.exe",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe"
)

$psqlFound = $false
foreach ($psqlPath in $pgPaths) {
    if (Test-Path $psqlPath) {
        Write-Host "   Found psql at: $psqlPath" -ForegroundColor Green
        $psqlFound = $true
        
        Write-Host "   Testing connection..." -ForegroundColor Yellow
        $env:PGPASSWORD = "Raja808"
        $result = & $psqlPath -h localhost -p 5432 -U postgres -d namanaidu -c "SELECT version();" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   Connection successful!" -ForegroundColor Green
        } else {
            Write-Host "   ✗ Connection failed" -ForegroundColor Red
            Write-Host "   Error: $result" -ForegroundColor Gray
        }
        break
    }
}

if (-not $psqlFound) {
    Write-Host "   psql not found in standard locations" -ForegroundColor Yellow
}

Write-Host "`n=== Recommendations ===" -ForegroundColor Cyan
Write-Host "1. Check pgAdmin connection properties:" -ForegroundColor White
Write-Host "   - Right-click 'PostgreSQL 18' -> Properties -> Connection tab" -ForegroundColor Gray
Write-Host "   - Note the Host and Port values" -ForegroundColor Gray
Write-Host "2. If port is different from 5432, update .env file" -ForegroundColor White
Write-Host "3. Check PostgreSQL configuration:" -ForegroundColor White
Write-Host "   - postgresql.conf: listen_addresses should include 'localhost'" -ForegroundColor Gray
Write-Host "   - pg_hba.conf: should allow local connections" -ForegroundColor Gray
Write-Host "4. Try restarting PostgreSQL service" -ForegroundColor White

Write-Host "`n=== Testing Node.js connection ===" -ForegroundColor Cyan
node test-db-connection.js

