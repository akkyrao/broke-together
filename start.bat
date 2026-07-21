@echo off
title Broke Together - Startup Script

echo.
echo 🚀 Starting Broke Together Application...
echo ==================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Navigate to script directory
cd /d "%~dp0"

REM Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo 🔧 Starting both server and frontend...
echo 📍 Server will run on: http://localhost:5001
echo 📍 Frontend will run on: http://localhost:3000
echo.
echo Press Ctrl+C to stop both services
echo ==================================
echo.

REM Start both server and frontend using the dev script
npm run dev

pause