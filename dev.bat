@echo off
title NextDestiny BattlePlanner - Dev Server
echo ============================================
echo   NextDestiny BattlePlanner - Dev Setup
echo ============================================
echo.

echo [1/6] Starting Docker containers...
docker compose up -d
echo       Done (%errorlevel%)
echo.

echo [2/6] Installing dependencies...
call pnpm install
echo       Done (%errorlevel%)
echo.

echo [3/6] Building packages...
call pnpm --filter @nd-battleplanner/shared build
echo       Shared done (%errorlevel%)
call pnpm install --frozen-lockfile 2>nul || call pnpm install
echo       Links refreshed
call pnpm --filter @nd-battleplanner/server build
echo       Server done (%errorlevel%)
echo.

echo [4/6] Generating database migrations...
call pnpm db:generate
echo       Done (%errorlevel%)
echo.

echo [5/6] Applying migrations and seeding...
call pnpm db:migrate
echo       Migrate done (%errorlevel%)
call pnpm db:seed:run
echo       Seed done (%errorlevel%)
echo.

echo [6/6] Starting dev server...
echo.
echo   Client: http://localhost:5173
echo   API:    http://localhost:3001
echo.
call pnpm dev
pause
