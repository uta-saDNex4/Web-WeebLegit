@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ======================================================================
echo           CONTRACT VERIFIER - KHỞI ĐỘNG HỆ THỐNG WEB & DATABASE
echo ======================================================================

rem 1. Lấy địa chỉ IP mạng LAN của máy này để chia sẻ cho các máy khác
for /f "tokens=*" %%i in ('powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { `$_.IPAddress -match '^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)' } | Select-Object -First 1).IPAddress"') do set LAN_IP=%%i
if "%LAN_IP%"=="" set LAN_IP=127.0.0.1

echo [*] Địa chỉ IP LAN của máy này: %LAN_IP%
echo.

rem 2. Kiểm tra Docker Daemon
echo [*] Đang kiểm tra Docker...
docker info >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Docker daemon đang hoạt động!
    echo [*] Đang khởi động hệ thống bằng Docker Compose (DB + Backend + Frontend)...
    echo.
    docker compose up --build -d
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ======================================================================
        echo  [THÀNH CÔNG] Toàn bộ hệ thống Web & Database đã hoạt động!
        echo ======================================================================
        echo.
        echo  1. TRUY CẬP TRỰC TIẾP TRÊN MÁY NÀY:
        echo     - Giao diện Web:        http://localhost:3000
        echo     - Admin Dashboard:     http://localhost:3000/admin
        echo       (Tài khoản: admin@weeblegit.vn / Mật khẩu: Admin@123456)
        echo     - Tài liệu API:        http://localhost:8000/docs
        echo.
        echo  2. TRUY CẬP TỪ MÁY KHÁC / ĐIỆN THOẠI TRONG CÙNG MẠNG LAN:
        echo     - Giao diện Web:        http://%LAN_IP%:3000
        echo     - Admin Dashboard:     http://%LAN_IP%:3000/admin
        echo     - API Backend:         http://%LAN_IP%:8000/docs
        echo ======================================================================
        goto finish
    )
)

echo.
echo [CHÚ Ý] Docker Desktop chưa bật hoặc chưa cài đặt trên máy này!
echo [*] Bạn có muốn chạy trực tiếp bằng Python + Node.js không? (Y/N)
set /p RUN_LOCAL="> "
if /i "%RUN_LOCAL%"=="Y" (
    echo.
    echo [*] Tạo thư mục lưu trữ file...
    if not exist storage mkdir storage
    if not exist secure_storage mkdir secure_storage

    echo [*] Đang khởi động Backend FastAPI (Port 8000)...
    start "Contract Verifier - Backend" cmd /k "set DATABASE_URL=postgresql://admin:matkhau_xinfu@192.168.105.109:5432/contract_verifier_db&& set CORS_ORIGINS=*&& set STORAGE_ROOT=./storage&& set SECURE_STORAGE_ROOT=./secure_storage&& python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

    echo [*] Đang khởi động Frontend Next.js (Port 3000)...
    cd frontend
    start "Contract Verifier - Frontend" cmd /k "npx next dev -H 0.0.0.0 -p 3000"
    cd ..

    echo.
    echo ======================================================================
    echo  [THÀNH CÔNG] Đã bật 2 cửa sổ Backend & Frontend!
    echo  - Máy này: http://localhost:3000
    echo  - Máy khác trong LAN: http://%LAN_IP%:3000
    echo ======================================================================
)

:finish
pause
