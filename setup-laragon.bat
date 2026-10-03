@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0laragon-setup.ps1" %*
echo.
pause
