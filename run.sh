#!/bin/bash
set -e

echo "======================================================================"
echo "          CONTRACT VERIFIER - KHỞI ĐỘNG HỆ THỐNG WEB & DATABASE"
echo "======================================================================"

# 1. Lấy địa chỉ IP mạng LAN
LAN_IP=$(ip route get 1.2.3.4 2>/dev/null | awk '{print $7}' || hostname -I 2>/dev/null | awk '{print $1}' || echo "127.0.0.1")
echo "[*] Địa chỉ IP LAN của máy này: $LAN_IP"
echo ""

# 2. Khởi động Docker Compose
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    echo "[OK] Docker daemon đang hoạt động!"
    echo "[*] Đang khởi động hệ thống bằng Docker Compose..."
    docker compose up --build -d
    echo ""
    echo "======================================================================"
    echo " [THÀNH CÔNG] Toàn bộ hệ thống Web & Database đã hoạt động!"
    echo "======================================================================"
    echo " 1. Truy cập trên máy này: http://localhost:3000"
    echo " 2. Truy cập từ máy khác trong LAN: http://$LAN_IP:3000"
    echo " 3. Admin Dashboard: http://$LAN_IP:3000/admin (admin@weeblegit.vn / Admin@123456)"
    echo " 4. API Docs: http://$LAN_IP:8000/docs"
    echo "======================================================================"
else
    echo "[CHÚ Ý] Docker chưa bật. Đang khởi động trực tiếp..."
    mkdir -p storage secure_storage
    export DATABASE_URL=${DATABASE_URL:-"postgresql://admin:matkhau_xinfu@localhost:5432/contract_verifier_db"}
    export CORS_ORIGINS="*"
    export STORAGE_ROOT="./storage"
    export SECURE_STORAGE_ROOT="./secure_storage"

    python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
    cd frontend && npm run dev &
    wait
fi
