# Red Panda Academy Backend - Development Startup Script
# This script starts the Django development server with ASGI/WebSocket support

param(
    [switch]$Redis,      # Start Redis first
    [switch]$Celery,     # Start Celery worker
    [switch]$Beat,       # Start Celery beat (scheduler)
    [int]$Port = 8000    # Port to run on
)

$ErrorActionPreference = "Stop"

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Split-Path -Parent $ScriptDir

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Red Panda Academy Backend - Dev Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Start Redis if requested
if ($Redis) {
    Write-Host "[1/4] Starting Redis..." -ForegroundColor Yellow
    & "$ScriptDir\start-redis.ps1" -Method auto
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Warning: Redis startup failed, continuing anyway..." -ForegroundColor Yellow
    }
    Write-Host ""
} else {
    Write-Host "[1/4] Skipping Redis startup (use -Redis to enable)" -ForegroundColor DarkGray
    Write-Host ""
}

# Step 2: Run Django system checks
Write-Host "[2/4] Running Django system checks..." -Yellow
Set-Location $BackendDir
python manage.py check 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ System checks failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ System checks passed" -ForegroundColor Green
Write-Host ""

# Step 3: Apply migrations if needed
Write-Host "[3/4] Checking migrations..." -Yellow
$pending = python manage.py migrate --check 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Applying pending migrations..." -Yellow
    python manage.py migrate 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Migration failed!" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ Migrations up to date" -ForegroundColor Green
Write-Host ""

# Step 4: Start services
Write-Host "[4/4] Starting services..." -Yellow

# Start Celery worker if requested
if ($Celery) {
    Write-Host "  Starting Celery worker..." -Yellow
    $celeryJob = Start-Process -FilePath "celery" -ArgumentList "-A core.celery.app worker -l info" -WorkingDirectory $BackendDir -WindowStyle Normal -PassThru
    Write-Host "  ✓ Celery worker started (PID: $($celeryJob.Id))" -ForegroundColor Green
}

# Start Celery beat if requested
if ($Beat) {
    Write-Host "  Starting Celery beat scheduler..." -Yellow
    $beatJob = Start-Process -FilePath "celery" -ArgumentList "-A core.celery.app beat -l info" -WorkingDirectory $BackendDir -WindowStyle Normal -PassThru
    Write-Host "  ✓ Celery beat started (PID: $($beatJob.Id))" -ForegroundColor Green
}

# Start Django/ASGI development server
Write-Host "  Starting Django ASGI server on port $Port..." -Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Server starting..." -ForegroundColor Cyan
Write-Host "  API: http://localhost:$Port/api/" -ForegroundColor Cyan
Write-Host "  Admin: http://localhost:$Port/admin/" -ForegroundColor Cyan
Write-Host "  Docs: http://localhost:$Port/api/docs/" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start the ASGI server
python manage.py runserver_plus $Port 2>&1