@echo off
title NextDestiny BattlePlanner - Dev Server
echo ============================================
echo   NextDestiny BattlePlanner - Dev Setup
echo ============================================
echo.

echo [1/6] Starting Docker containers...
docker compose up -d
if errorlevel 1 (
    echo ERROR: Docker failed. Is Docker Desktop running?
    pause
    exit /b 1
)

echo.
echo [2/6] Installing dependencies...
call pnpm install
if errorlevel 1 (
    echo ERROR: pnpm install failed.
    pause
    exit /b 1
)

echo.
echo [3/6] Building shared package...
call pnpm --filter @nd-battleplanner/shared build
if errorlevel 1 (
    echo ERROR: Shared build failed.
    pause
    exit /b 1
)

echo.
echo [4/6] Generating database migrations...
call pnpm db:generate
if errorlevel 1 (
    echo ERROR: Migration generation failed.
    pause
    exit /b 1
)

echo.
echo [5/6] Applying migrations and seeding...
call pnpm db:migrate
if errorlevel 1 (
    echo ERROR: Migration failed.
    pause
    exit /b 1
)

echo Waiting for database to settle...
timeout /t 3 /nobreak >nul

echo Seeding...
if exist seed.log del seed.log
start "Seeding DB" /wait dev-seed.bat
if exist seed.log (
    type seed.log
    del seed.log
) else (
    echo WARNING: Seed produced no output — may have crashed.
)
echo.

echo [6/6] Starting dev server...
echo.
echo   Client: http://localhost:5173
echo   API:    http://localhost:3001
echo.
call pnpm dev
pause
