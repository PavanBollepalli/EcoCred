@echo off
echo ============================================
echo   EcoCred Vision Backend - Setup ^& Start
echo ============================================
echo.

cd /d %~dp0

:: Check Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Python not found. Install Python 3.10+ first.
    pause
    exit /b 1
)

:: Create venv if not exists
if not exist "venv\Scripts\activate.bat" (
    echo Creating virtual environment...
    python -m venv venv
)

:: Activate venv
call venv\Scripts\activate.bat

:: Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

echo.
echo Starting EcoCred Vision Backend on http://localhost:8000 ...
echo API docs available at http://localhost:8000/docs
echo.
python main.py
