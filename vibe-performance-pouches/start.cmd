@echo off
REM ============================================================
REM  VIBE Performance Pouches - launch the 3D site in a browser
REM  Double-click this file. No Node/Python required.
REM ============================================================

set PORT=4321

echo Starting VIBE static server on http://localhost:%PORT%/ ...

REM Start the static server in its own window (keeps running until you close it)
start "VIBE server (close to stop)" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port %PORT%

REM Give the listener a moment to bind, then open the default browser
timeout /t 1 /nobreak >nul
start "" "http://localhost:%PORT%/"

echo.
echo VIBE is now open in your browser.
echo To stop the site, close the "VIBE server" window that opened.
