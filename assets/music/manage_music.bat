@echo off
title Custom New Tab - Music Manager
:menu
cls
echo ===================================================
echo             CUSTOM NEW TAB MUSIC MANAGER
echo ===================================================
echo.
echo [1] Auto-Generate tracks.json from files
echo [2] Open tracks.json in Text Editor for manual edit
echo [3] Exit
echo.
echo ===================================================
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo Generating tracks...
    node "%~dp0generate_tracks.js"
    echo.
    pause
    goto menu
)
if "%choice%"=="2" (
    start "" "%~dp0tracks.json"
    goto menu
)
if "%choice%"=="3" (
    exit
)

echo Invalid choice. Please try again.
timeout /t 2 >nul
goto menu
