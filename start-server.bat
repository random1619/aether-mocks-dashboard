@echo off
title Aether Mocks Local Server
echo ===================================================
echo   Aether Mocks Dashboard Local Development Server
echo ===================================================
echo.
echo Starting Python HTTP Server on Port 8000...
echo.
echo URL: http://localhost:8000
echo.
echo Keep this window open while using the dashboard.
echo Press Ctrl+C inside this window to stop the server.
echo.
echo ===================================================
python -m http.server 8000 --directory public
pause
