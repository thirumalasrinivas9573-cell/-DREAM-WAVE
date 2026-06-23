@echo off
echo ========================================
echo   Dream Wave AI - Development Servers
echo ========================================
echo.

echo [1/3] Starting Backend Server...
start "Dream Wave - Backend" cmd /k "cd /d "%~dp0server" && npm start"

echo [2/3] Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend Client...
start "Dream Wave - Frontend" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo ========================================
echo   Both servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:5001
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
echo (The servers will keep running)
pause >nul
