@echo off
setlocal enabledelayedexpansion

echo ======================================================================
echo           CONTRACT VERIFIER - KHOI DONG HE THONG WEB VA DATABASE
echo ======================================================================

rem 1. Lay dia chi IP mang LAN cua may nay
set LAN_IP=127.0.0.1
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        if "!LAN_IP!"=="127.0.0.1" set LAN_IP=%%b
    )
)

echo [*] Dia chi IP LAN cua may nay: !LAN_IP!
echo.

rem 2. Kiem tra Docker Daemon
echo [*] Dang kiem tra Docker Desktop...
docker info >nul 2>&1
if !ERRORLEVEL! NEQ 0 goto docker_not_running

:docker_running
echo [OK] Docker daemon dang hoat dong.
echo.
echo Chon che do khoi dong:
echo   [1] Chay Web ket noi toi Database May Host (192.168.105.109) - Khuyen nghi
echo   [2] Chay Doc lap (Tu tao Database PostgreSQL rieng tren may nay)
echo.
set DOCKER_MODE=1
set /p DOCKER_MODE="Nhap lua chon [1 hoac 2, mac dinh 1]: "

if "!DOCKER_MODE!"=="2" goto run_full_docker

:run_app_only_docker
set HOST_IP=192.168.105.109
set /p INPUT_IP="Nhap IP may Host Database [Nhan Enter de dung !HOST_IP!]: "
if not "!INPUT_IP!"=="" set HOST_IP=!INPUT_IP!
echo.
echo [*] Dang khoi dong Web ket noi toi Database Host !HOST_IP!...
set DATABASE_URL=postgresql://admin:matkhau_xinfu@!HOST_IP!:5432/contract_verifier_db
docker compose -f docker-compose.app-only.yml up --build -d
goto check_docker_result

:run_full_docker
echo.
echo [*] Dang khoi dong Full Stack (DB rieng + Backend + Frontend)...
docker compose -f docker-compose.yml up --build -d
goto check_docker_result

:check_docker_result
if !ERRORLEVEL! EQU 0 goto show_success
echo.
echo [LOI] Khong the khoi dong Docker Compose.
pause
exit /b 1

:show_success
echo.
echo ======================================================================
echo  [THANH CONG] Toan bo he thong Web da hoat dong.
echo ======================================================================
echo.
echo  1. TRUY CAP TRUC TIEP TREN MAY NAY:
echo     - Giao dien Web:        http://localhost:3000
echo     - Admin Dashboard:     http://localhost:3000/admin
echo       (Tai khoan: admin@weeblegit.vn ^| Mat khau: Admin@123456)
echo     - Tai lieu API:        http://localhost:8000/docs
echo.
echo  2. TRUY CAP TU MAY KHAC / DIEN THOAI TRONG CUNG MANG LAN:
echo     - Giao dien Web:        http://!LAN_IP!:3000
echo     - Admin Dashboard:     http://!LAN_IP!:3000/admin
echo     - API Backend:         http://!LAN_IP!:8000/docs
echo ======================================================================
goto finish

:docker_not_running
echo.
echo [CHU Y] Docker Desktop chua bat hoac chua cai dat tren may nay.
echo [*] Ban co muon chay truc tiep bang Python + Node.js khong? [Y/N]
set /p RUN_LOCAL="> "
if /i not "!RUN_LOCAL!"=="Y" goto finish

echo.
echo [*] Tao thu muc luu tru file...
if not exist storage mkdir storage
if not exist secure_storage mkdir secure_storage

set HOST_IP=192.168.105.109
set /p INPUT_IP="Nhap IP may Host Database [Nhan Enter de dung !HOST_IP!]: "
if not "!INPUT_IP!"=="" set HOST_IP=!INPUT_IP!

echo [*] Dang khoi dong Backend FastAPI (Port 8000)...
start "Contract Verifier - Backend" cmd /k "set DATABASE_URL=postgresql://admin:matkhau_xinfu@!HOST_IP!:5432/contract_verifier_db& set CORS_ORIGINS=*& set STORAGE_ROOT=./storage& set SECURE_STORAGE_ROOT=./secure_storage& python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

echo [*] Dang khoi dong Frontend Next.js (Port 3000)...
cd frontend
start "Contract Verifier - Frontend" cmd /k "npx next dev -H 0.0.0.0 -p 3000"
cd ..

echo.
echo ======================================================================
echo  [THANH CONG] Da bat 2 cua so Backend ^& Frontend.
echo  - May nay: http://localhost:3000
echo  - May khac trong LAN: http://!LAN_IP!:3000
echo ======================================================================

:finish
echo.
pause
