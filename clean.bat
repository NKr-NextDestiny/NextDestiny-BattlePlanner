@echo off
title NextDestiny BattlePlanner - Clean
echo ============================================
echo   NextDestiny BattlePlanner - Clean
echo ============================================
echo.
echo   [1] Clean DATA only (reset database, keep code + deps)
echo   [2] Clean EVERYTHING (database + node_modules + builds)
echo   [3] Cancel
echo.

:menu
set /p choice="Select option (1-3): "

if "%choice%"=="1" goto cleandata
if "%choice%"=="2" goto cleanall
if "%choice%"=="3" goto cancel
echo Invalid choice. Enter 1, 2, or 3.
goto menu

:cleandata
echo.
echo WARNING: This will DELETE all database data (users, battleplans, teams, everything).
set /p confirm="Are you sure? (y/n): "
if /i not "%confirm%"=="y" goto cancel

echo.
echo Stopping containers and deleting volumes...
docker compose down -v

echo.
echo ============================================
echo   Data deleted!
echo   Run dev.bat to set up again.
echo ============================================
pause
exit /b 0

:cleanall
echo.
echo WARNING: This will DELETE ALL data AND remove node_modules + build artifacts.
set /p confirm="Are you sure? (y/n): "
if /i not "%confirm%"=="y" goto cancel

set /p confirm2="Are you REALLY sure? This cannot be undone. (y/n): "
if /i not "%confirm2%"=="y" goto cancel

echo.
echo Stopping containers and deleting volumes...
docker compose down -v

echo Removing node_modules...
if exist node_modules rd /s /q node_modules
if exist packages\shared\node_modules rd /s /q packages\shared\node_modules
if exist packages\shared\dist rd /s /q packages\shared\dist
if exist packages\server\node_modules rd /s /q packages\server\node_modules
if exist packages\server\dist rd /s /q packages\server\dist
if exist packages\server\drizzle rd /s /q packages\server\drizzle
if exist packages\client\node_modules rd /s /q packages\client\node_modules
if exist packages\client\dist rd /s /q packages\client\dist

echo Removing lockfile...
if exist pnpm-lock.yaml del pnpm-lock.yaml

echo.
echo ============================================
echo   Full clean complete!
echo   Run dev.bat to set up again.
echo ============================================
pause
exit /b 0

:cancel
echo Cancelled.
pause
exit /b 0
