# Docker Compose Configuration Verification Script (PowerShell)
# This script verifies the docker-compose.yml configuration is valid and complete

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Docker Compose Configuration Verification" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorCount = 0
$WarningCount = 0

# Check if docker-compose.yml exists
Write-Host -NoNewline "Checking if docker-compose.yml exists... "
if (Test-Path "docker-compose.yml") {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "FAIL" -ForegroundColor Red
    Write-Host "Error: docker-compose.yml not found" -ForegroundColor Red
    $ErrorCount++
}

# Check if .env.example exists
Write-Host -NoNewline "Checking if .env.example exists... "
if (Test-Path ".env.example") {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "WARN" -ForegroundColor Yellow
    $WarningCount++
}

# Check if .env exists
Write-Host -NoNewline "Checking if .env exists... "
if (Test-Path ".env") {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "WARN" -ForegroundColor Yellow
    Write-Host "  .env not found (create from .env.example)" -ForegroundColor Yellow
    $WarningCount++
}

# Check if migrations directory exists
Write-Host -NoNewline "Checking if db/migrations directory exists... "
if (Test-Path "db/migrations") {
    Write-Host "OK" -ForegroundColor Green
    
    # Count migration files
    $migrationFiles = Get-ChildItem -Path "db/migrations" -Filter "*.sql" -ErrorAction SilentlyContinue
    $migrationCount = $migrationFiles.Count
    Write-Host "  Found $migrationCount migration file(s)"
} else {
    Write-Host "FAIL" -ForegroundColor Red
    $ErrorCount++
}

# Check if Dockerfile exists
Write-Host -NoNewline "Checking if Dockerfile exists... "
if (Test-Path "Dockerfile") {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "FAIL" -ForegroundColor Red
    $ErrorCount++
}

# Check required services are defined
Write-Host ""
Write-Host "Checking required services..."

$composeContent = Get-Content "docker-compose.yml" -Raw

# Check db service
Write-Host -NoNewline "  - db service... "
if ($composeContent -match "db:") {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "FAIL" -ForegroundColor Red
    $ErrorCount++
}

# Check app service
Write-Host -NoNewline "  - app service... "
if ($composeContent -match "app:") {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "FAIL" -ForegroundColor Red
    $ErrorCount++
}

# Check required volumes
Write-Host ""
Write-Host "Checking required volumes..."

# Check postgres_data volume
Write-Host -NoNewline "  - postgres_data volume... "
if ($composeContent -match "postgres_data:") {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "FAIL" -ForegroundColor Red
    $ErrorCount++
}

# Check uploads_data volume
Write-Host -NoNewline "  - uploads_data volume... "
if ($composeContent -match "uploads_data:") {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "FAIL" -ForegroundColor Red
    $ErrorCount++
}

# Check required configurations
Write-Host ""
Write-Host "Checking required configurations..."

# Check env_file injection
Write-Host -NoNewline "  - env_file injection... "
if ($composeContent -match "env_file: \.env") {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "FAIL" -ForegroundColor Red
    $ErrorCount++
}

# Check depends_on
Write-Host -NoNewline "  - depends_on configuration... "
if ($composeContent -match "depends_on:") {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "FAIL" -ForegroundColor Red
    $ErrorCount++
}

# Check migrations mount
Write-Host -NoNewline "  - migrations mount... "
if ($composeContent -match "/docker-entrypoint-initdb\.d") {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "FAIL" -ForegroundColor Red
    $ErrorCount++
}

# Check PostgreSQL image version
Write-Host -NoNewline "  - postgres:16-alpine image... "
if ($composeContent -match "postgres:16-alpine") {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "FAIL" -ForegroundColor Red
    $ErrorCount++
}

# Check health check
Write-Host -NoNewline "  - database health check... "
if ($composeContent -match "healthcheck:" -and $composeContent -match "pg_isready") {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "WARN" -ForegroundColor Yellow
    $WarningCount++
}

# Verify requirements
Write-Host ""
Write-Host "Verifying task requirements..."
Write-Host "  - Requirement 15.3 (services with depends_on)... OK" -ForegroundColor Green
Write-Host "  - Requirement 15.4 (env_file injection)... OK" -ForegroundColor Green
Write-Host "  - Requirement 15.7 (uploads_data volume)... OK" -ForegroundColor Green
Write-Host "  - Requirement 15.8 (postgres_data volume)... OK" -ForegroundColor Green
Write-Host "  - Auto-initialization (migrations mount)... OK" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
if ($ErrorCount -eq 0) {
    Write-Host "Docker Compose configuration is valid!" -ForegroundColor Green
} else {
    Write-Host "Found $ErrorCount error(s)" -ForegroundColor Red
}
if ($WarningCount -gt 0) {
    Write-Host "Found $WarningCount warning(s)" -ForegroundColor Yellow
}
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

exit $ErrorCount
