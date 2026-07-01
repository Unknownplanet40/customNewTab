@echo off
title Custom New Tab - Dynamic Wallpaper Manager
:menu
cls
echo ===================================================
echo       CUSTOM NEW TAB DYNAMIC WALLPAPER MANAGER
echo ===================================================
echo.
echo [1] Auto-Generate folders.json from folders
echo [2] Open folders.json in Text Editor for manual edit
echo [3] Exit
echo.
echo ===================================================
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo Generating folders...
    node "%~dp0generate_wallpapers.js"
    echo.
    pause
    goto menu
)
if "%choice%"=="2" (
    start "" "%~dp0folders.json"
    goto menu
)
if "%choice%"=="3" (
    exit
)

echo Invalid choice. Please try again.
timeout /t 2 >nul
goto menu
