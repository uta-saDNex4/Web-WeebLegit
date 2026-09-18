# Web-Weebforce - Contract Verifier

Contract Verifier is a full-stack app for:

- uploading contract files
- verifying SHA-256 integrity
- managing contract clauses
- importing legal reference data and risk rules from Excel

This repo is designed to run with:

- PostgreSQL running in Docker on the host machine
- backend and frontend running in Docker containers
- optional data import from the `data/` folder

## Project Layout

```text
backend/                  FastAPI backend
frontend/                 React/Vinext frontend
data/                     Excel references and sample contracts
docker-compose.yml        Backend + frontend stack
.env.example              Environment template
```

## What Runs Automatically

- The backend creates the database schema on startup.
- No users, contracts, or verification logs are seeded automatically.
- Sample/reference data is imported only when you run the import job manually.

## Prerequisites

- Docker Desktop
- PostgreSQL container running on the host machine and exposed on port `5432`
- DBeaver or another DB client if you want to inspect the database

## Database Setup

Use PostgreSQL credentials that match your running container:

```text
Host: localhost
Port: 5432
User: admin
Password: matkhau_xinfu
Database: contract_verifier_db
```

The backend container must connect to the host machine through:

```text
postgresql://admin:matkhau_xinfu@host.docker.internal:5432/contract_verifier_db
```

## Quick Start (Bất kỳ máy nào cũng chạy được)

### Cách 1: Dùng script tự động 1-click (Khuyến nghị)

- **Trên Windows**: Nhấp đúp file `run.bat` hoặc mở cmd chạy `.\run.bat`
- **Trên Linux/macOS**: Chạy `./run.sh`

Script sẽ tự động:

1. Phát hiện địa chỉ IP mạng LAN của máy bạn để in ra màn hình.
2. Kiểm tra Docker: nếu có Docker sẽ tự động bật toàn bộ (PostgreSQL DB + Backend + Frontend).
3. Nếu Docker chưa bật, sẽ chuyển sang chế độ chạy trực tiếp (Python + Node.js).

### Cách 2: Dùng lệnh Docker Compose chuẩn

Nếu máy đã có Docker Desktop đang chạy, bạn chỉ cần gõ đúng 1 lệnh duy nhất tại thư mục dự án:

```bash
docker compose up --build -d
```

Compose sẽ tự động:

- Khởi động container PostgreSQL (`db`) và cấu hình sẵn database `contract_verifier_db`.
- Khởi động backend FastAPI (`backend`), tự tạo bảng (schema), tự tạo tài khoản Admin mặc định.
- Khởi động frontend Next.js (`frontend`).

### Cách 3: Nạp dữ liệu mẫu từ Excel (Tùy chọn)

Nếu bạn muốn nạp 250 quy tắc pháp lý, 250 điều khoản rủi ro và các hợp đồng mẫu từ thư mục `data/`:

```bash
docker compose --profile seed run --rm import-data
```

---

## Địa chỉ truy cập

### 1. Trên chính máy đang chạy:

- **Trang chủ Web**: [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)
  - Tài khoản Admin: `admin@weeblegit.vn`
  - Mật khẩu: `Admin@123456`
- **Tài liệu API (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Từ các máy khác trong cùng mạng LAN (Điện thoại, Laptop khác):

Chỉ cần thay `localhost` bằng địa chỉ IP LAN của máy đang chạy web (ví dụ `192.168.105.126`):

- **Trang chủ Web**: `http://<IP_MÁY_CHẠY>:3000` (ví dụ: `http://192.168.105.126:3000`)
- **Admin Dashboard**: `http://<IP_MÁY_CHẠY>:3000/admin`
- Frontend đã được cấu hình tự động nhận diện IP của máy chủ để gọi API backend `http://<IP_MÁY_CHẠY>:8000`, kèm header CORS và Private Network Access (PNA) cho các trình duyệt Chrome/Edge trên thiết bị khác.

The backend and importer both use `DATABASE_URL` from the environment, so they can connect to the PostgreSQL container already running on your host.

## Frontend Behavior

The frontend proxies API requests to the backend container, so you can use the app from a single origin in Docker.

If you run frontend and backend separately, set:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

If you run through Docker Compose, you can leave `NEXT_PUBLIC_API_BASE_URL` empty.

## Local Dev Without Docker

If you want to run only the backend locally:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install fastapi uvicorn sqlalchemy psycopg2-binary pandas openpyxl bcrypt python-multipart
uvicorn backend.main:app --reload
```

If you want to run only the frontend locally:

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint                                  | Purpose               |
| ------ | ----------------------------------------- | --------------------- |
| GET    | `/health`                                 | Health check          |
| POST   | `/api/users/register`                     | Register              |
| POST   | `/api/users/login`                        | Login                 |
| GET    | `/api/auth/me`                            | Current user          |
| POST   | `/api/contracts`                          | Upload contract       |
| GET    | `/api/contracts/{id}`                     | Get contract metadata |
| POST   | `/api/contracts/{id}/verify`              | Verify SHA-256        |
| POST   | `/api/contracts/{id}/clauses`             | Add clause            |
| PUT    | `/api/contracts/{id}/clauses/{clause_id}` | Update clause         |
| DELETE | `/api/contracts/{id}/clauses/{clause_id}` | Delete clause         |
| GET    | `/api/contracts/{id}/verifications`       | Verification history  |

## Data Files

The `data/` folder contains:

- `legal_references.xlsx`
- `risk_rules_master.xlsx`
- `test_set_labeled.xlsx`
- `sample_contracts/`

These files are reference/import data. They are not loaded automatically at startup.

## Notes

- Use `host.docker.internal` for backend container access to the host PostgreSQL container.
- DBeaver should still connect to `localhost:5432` because the database is published on the host.
- Keep `SECRET_KEY`, `DATABASE_URL`, and `CORS_ORIGINS` in `.env` for real deployments.
- Set `CORS_ORIGINS=*` if you want the API reachable from any browser origin on your LAN.
- The repo intentionally starts from an empty schema, not a preseeded database.
