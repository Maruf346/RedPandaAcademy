# Redis Startup Script for Red Panda Academy Backend
# Run this script to start Redis for development

param(
    [string]$Method = "auto"  # auto, docker, wsl, native
)

$ErrorActionPreference = "Stop"

function Test-RedisRunning {
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $client.Connect("localhost", 6379)
        $client.Close()
        return $true
    } catch {
        return $false
    }
}

function Start-RedisDocker {
    Write-Host "Starting Redis via Docker..." -ForegroundColor Yellow
    try {
        docker run -d --name redis-rpa -p 6379:6379 redis:8-alpine 2>$null
        Start-Sleep -Seconds 3
        if (Test-RedisRunning) {
            Write-Host "✓ Redis started via Docker" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "Docker not available: $($_.Exception.Message)" -ForegroundColor Red
    }
    return $false
}

function Start-RedisWSL {
    Write-Host "Starting Redis via WSL..." -ForegroundColor Yellow
    try {
        wsl -d docker-desktop bash -c "sudo service redis-server start 2>/dev/null || redis-server --daemonize yes" 2>$null
        Start-Sleep -Seconds 3
        if (Test-RedisRunning) {
            Write-Host "✓ Redis started via WSL" -Foreground Green
            return $true
        }
    } catch {
        Write-Host "WSL not available: $($_.Exception.Message)" -ForegroundColor Red
    }
    return $false
}

function Start-RedisNative {
    Write-Host "Starting Redis natively..." -ForegroundColor Yellow
    
    # Check common installation paths
    $paths = @(
        "C:\Redis\redis-server.exe",
        "C:\Program Files\Redis\redis-server.exe",
        "C:\Program Files (x86)\Redis\redis-server.exe"
    )
    
    $redisExe = $null
    foreach ($path in $paths) {
        if (Test-Path $path) {
            $redisExe = $path
            break
        }
    }
    
    if ($redisExe) {
        try {
            Start-Process -FilePath $redisExe -ArgumentList "--port 6379 --daemonize no" -WindowStyle Hidden
            Start-Sleep -Seconds 3
            if (Test-RedisRunning) {
                Write-Host "✓ Redis started natively" -ForegroundColor Green
                return $true
            }
        } catch {
            Write-Host "Failed to start Redis natively: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "Redis not found in common paths" -ForegroundColor Yellow
        Write-Host "Install from: https://github.com/redis-windows/redis-windows/releases" -ForegroundColor Cyan
    }
    return $false
}

# Main execution
Write-Host "=== Redis Setup for Red Panda Academy ===" -ForegroundColor Cyan
Write-Host ""

if (Test-RedisRunning) {
    Write-Host "✓ Redis is already running on localhost:6379" -ForegroundColor Green
    exit 0
}

Write-Host "Redis is not running. Attempting to start..." -ForegroundColor Yellow
Write-Host ""

$started = $false

if ($Method -eq "auto" -or $Method -eq "docker") {
    $started = Start-RedisDocker
}

if (-not $started -and ($Method -eq "auto" -or $Method -eq "wsl")) {
    $started = Start-RedisWSL
}

if (-not $started -and ($Method -eq "auto" -or $Method -eq "native")) {
    $started = Start-RedisNative
}

if (-not $started) {
    Write-Host ""
    Write-Host "❌ Could not start Redis automatically." -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual setup options:" -ForegroundColor Yellow
    Write-Host "1. Docker: docker run -d --name redis -p 6379:6379 redis:8-alpine" -ForegroundColor White
    Write-Host "2. WSL: wsl -d docker-desktop sudo apt-get install redis-server && wsl -d docker-desktop sudo service redis-server start" -ForegroundColor White
    Write-Host "3. Native: Download from https://github.com/redis-windows/redis-windows/releases" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "=== Redis Setup Complete ===" -ForegroundColor Green
Write-Host "Redis is now available at localhost:6379" -ForegroundColor Green