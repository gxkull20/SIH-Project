@echo off
title VoiceShield AI - Local Runner
color 0b
echo ========================================================
echo         VoiceShield AI - Starting Local Services
echo ========================================================
echo.
set ROOT_DIR=%~dp0
cd /d "%ROOT_DIR%"
echo [1/3] Starting Backend FastAPI Server (Port 8000)...
set "PYTHONPATH=%ROOT_DIR%"
start "VoiceShield Backend (FastAPI)" cmd /k "cd /d "%ROOT_DIR%backend" && "%ROOT_DIR%backend\.venv\Scripts\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
echo [2/3] Waiting for backend to initialize...
timeout /t 3 /nobreak >nul
echo [3/3] Starting Frontend Next.js Server (Port 3000)...
start "VoiceShield Frontend (Next.js)" cmd /k "cd /d "%ROOT_DIR%frontend" && bun run dev"
echo.
echo ========================================================
echo   Services are running!
echo   Frontend : http://localhost:3000
echo   Backend  : http://localhost:8000/docs
echo   Simulate : http://localhost:3000/simulate
echo   Detect   : http://localhost:3000/detect
echo   Verify   : http://localhost:3000/verify
echo ========================================================
echo.
echo Opening browser to http://localhost:3000/simulate ...
timeout /t 3 /nobreak >nul
start http://localhost:3000/simulate
pause