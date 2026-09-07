# VoiceShield AI - Local PowerShell Runner
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       VoiceShield AI - Starting Local Services         " -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $rootDir

Write-Host "`n[1/3] Starting Backend FastAPI Server (Port 8000)..." -ForegroundColor Yellow
$env:PYTHONPATH = $rootDir
$backendPython = Join-Path $rootDir "backend\.venv\Scripts\python.exe"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\backend'; `$env:PYTHONPATH = '$rootDir'; & '$backendPython' -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

Start-Sleep -Seconds 3

Write-Host "[2/3] Starting Frontend Next.js Server (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\frontend'; bun run dev"

Start-Sleep -Seconds 2

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "  Services are running!" -ForegroundColor Green
Write-Host "  Frontend : http://localhost:3000" -ForegroundColor White
Write-Host "  Backend  : http://localhost:8000/docs" -ForegroundColor White
Write-Host "  Simulate : http://localhost:3000/simulate" -ForegroundColor White
Write-Host "  Detect   : http://localhost:3000/detect" -ForegroundColor White
Write-Host "  Verify   : http://localhost:3000/verify" -ForegroundColor White
Write-Host "========================================================`n" -ForegroundColor Green

Start-Process "http://localhost:3000/simulate"
