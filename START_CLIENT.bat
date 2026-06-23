@echo off
echo ========================================
echo   Starting Dream Wave AI - Client Only
echo ========================================
echo.
echo Starting Vite development server...
echo Frontend will be available at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo.
cd /d "%~dp0client"
if %errorlevel% neq 0 (
    echo ERROR: Could not find client directory!
    pause
    exit /b 1
)
call npm run dev
if %errorlevel% neq 0 (
    echo ERROR: Failed to start client!
    pause
    exit /b 1
)
