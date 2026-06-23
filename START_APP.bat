@echo off
echo ========================================
echo   Starting Dream Wave AI - Full Stack
echo ========================================
echo.
echo Starting both Frontend and Backend servers...
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5001
echo.
echo Press Ctrl+C to stop both servers
echo.
cd /d "%~dp0"
if not exist "node_modules\concurrently" (
    echo ERROR: concurrently not found!
    echo Please run: npm install
    pause
    exit /b 1
)
call npm run dev
if %errorlevel% neq 0 (
    echo ERROR: Failed to start servers!
    pause
    exit /b 1
)
