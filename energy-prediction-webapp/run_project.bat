@echo off
REM Run both backend and frontend for the Energy Prediction Web Application.
SET SCRIPT_DIR=%~dp0

REM Launch backend in a new window
start "Backend" cmd /k "cd /d "%SCRIPT_DIR%backend" && if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat) && python app.py"

REM Launch frontend in a new window
start "Frontend" cmd /k "cd /d "%SCRIPT_DIR%frontend" && npm run dev -- --host 127.0.0.1"

exit /b
