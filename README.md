# WeebLegit – Trợ lý Xác thực & Phân tích Hợp đồng Thông minh

Nền tảng hỗ trợ sinh viên và người đi làm rà soát, phát hiện rủi ro hợp đồng (thuê trọ, việc làm, thực tập, vay tiêu dùng, trả góp, khóa học, freelance) đối chiếu quy chuẩn pháp luật Việt Nam, xác thực tính toàn vẹn SHA-256 và hỗ trợ AI đàm phán hợp đồng.

---

## 🏗️ Kiến trúc Hệ thống & Database Tập trung

Hệ thống sử dụng mô hình **Database tập trung** để toàn bộ thành viên trong nhóm làm việc và kiểm thử đều dùng chung một nguồn dữ liệu:

- **Máy Host Database (`192.168.105.109:5432`)**: Container PostgreSQL đang mở sẵn trên máy Host, đã chứa đầy đủ dữ liệu thực tế:
  - 261 hợp đồng mẫu & kiểm thử
  - 250 căn cứ pháp lý chính thức (Bộ luật Dân sự 2015, Bộ luật Lao động 2019, Luật Căn cước 2023,...)
  - 250 quy tắc phát hiện rủi ro (Risk Rules)
  - Tài khoản Quản trị viên (Admin) và Audit Logs xác thực
- **Các máy khác trong mạng LAN**: Khi tải project về chỉ cần chạy Web (Backend + Frontend), hệ thống sẽ **tự động kết nối tới Database chung trên máy Host**, đảm bảo dữ liệu luôn đồng bộ và không bị phân mảnh.
- **Không cần chạy lệnh import hay seed lại dữ liệu** vì container Database đã có sẵn đầy đủ dữ liệu chuẩn.

---

## 🚀 Hướng dẫn Khởi động Dự án

### Cách 1: Khởi động 1-Click (Khuyến nghị cho mọi máy)

- **Trên Windows**: Nhấp đúp chuột vào file `run.bat` (hoặc mở PowerShell/CMD chạy `.\run.bat`)
- **Trên Linux / macOS**: Mở Terminal chạy `./run.sh`

Script sẽ tự động:

1. Nhận diện địa chỉ IP mạng LAN của máy bạn.
2. Kiểm tra Docker:
   - **Nhấn phím `1` (Mặc định - Khuyến nghị)**: Khởi động Web và kết nối tới Database chung của máy Host (`192.168.105.109:5432`).
   - **Nhấn phím `2`**: Khởi động Độc lập (tự tạo Database PostgreSQL riêng trên máy này nếu mang máy ra ngoài không có mạng LAN).
3. Nếu máy chưa bật Docker, script sẽ hỏi và tự động chuyển sang chế độ chạy trực tiếp bằng Python + Node.js.

---

### Cách 2: Dùng lệnh Docker Compose chuẩn

Mở terminal tại thư mục dự án và chạy:

#### ➤ Lựa chọn 1: Chạy Web và dùng chung Database máy Host

```bash
docker compose -f docker-compose.app-only.yml up --build -d
```

_(Lệnh này chỉ build Backend + Frontend trên máy bạn và trỏ thẳng vào Database máy Host, không tạo thêm container DB thừa)._

#### ➤ Lựa chọn 2: Chạy độc lập hoàn toàn (kèm container DB riêng)

```bash
docker compose up --build -d
```

---

### Cách 3: Truy cập trực tiếp qua Trình duyệt trong cùng mạng Wi-Fi / LAN

Nếu máy Host (`192.168.105.109`) hoặc một máy bất kỳ trong nhóm đã bật Web:

- Các thiết bị khác (điện thoại, tablet, laptop khác) trong cùng mạng Wi-Fi **KHÔNG CẦN cài đặt gì cả, KHÔNG CẦN Docker hay Git**.
- Chỉ cần mở trình duyệt và truy cập theo địa chỉ IP của máy đang bật web:
  - **Trang chủ Web**: `http://<IP_MÁY_CHẠY>:3000`
  - **Trang Nâng cấp Gói cước**: `http://<IP_MÁY_CHẠY>:3000/upgrade`
  - **Lịch sử Hợp đồng**: `http://<IP_MÁY_CHẠY>:3000/history`
  - **Hồ sơ & Lịch sử AI Chat**: `http://<IP_MÁY_CHẠY>:3000/profile`
  - **Admin Dashboard**: `http://<IP_MÁY_CHẠY>:3000/admin`
  - **Tài liệu API (Swagger UI)**: `http://<IP_MÁY_CHẠY>:8000/docs`

> **Lưu ý mạng LAN**: Hệ thống đã được tích hợp sẵn cấu hình `0.0.0.0`, CORS (`Access-Control-Allow-Origin: *`), **Private Network Access (PNA)** và cơ chế Next.js Rewrite Proxy trong `frontend/next.config.mjs` kết hợp `frontend/src/lib/api.ts`. Bất kỳ thiết bị nào truy cập từ xa đều tự động định tuyến API qua cùng origin, không bị lỗi CORS hay gọi nhầm `localhost`.

---

### Cách 4: Truy cập từ KHÁC MẠNG (4G / 5G / Wi-Fi khác hoàn toàn qua Cloudflare Tunnel)

Khi máy bạn đang bật App nhưng muốn cho điện thoại dùng 4G/5G hoặc máy tính ở mạng Wi-Fi khác truy cập toàn bộ các trang (`/`, `/upgrade`, `/history`, `/profile`, `/admin`):

1. Mở PowerShell hoặc CMD tại thư mục gốc dự án (`Web-WeebLegit`) và chạy lệnh:

```powershell
.\cloudflared.exe tunnel --url http://localhost:3000
```

2. Sao chép đường dẫn HTTPS công khai do Cloudflare cấp (ví dụ: `https://xxxx-xxxx.trycloudflare.com`).
3. Nhờ cơ chế Next.js Rewrite Proxy, bạn **chỉ cần mở duy nhất 1 tunnel cho cổng `3000`** — toàn bộ lời gọi API `/api/*` ở tất cả các trang (`/`, `/upgrade`, `/history`, `/profile`, `/admin`) sẽ tự động đi qua tunnel này vào thẳng Backend `8000`.

---

## 🔑 Thông tin Đăng nhập & 3 Tài khoản Phân quyền Gói Upgrade (`Free` / `Medium` / `Pro`)

Hệ thống khởi tạo sẵn **tài khoản Admin** và **3 tài khoản riêng biệt đại diện cho 3 gói cước** để kiểm thử trực tiếp phân quyền tính năng:

| Gói / Vai trò | Nhãn hiển thị | Email đăng nhập | Mật khẩu mặc định | Quyền hạn & Giới hạn tính năng |
| :--- | :---: | :--- | :--- | :--- |
| **Gói Free** | `-free-` | `free@weeblegit.vn` | `User@123456` | • Chỉ chấm **1 hợp đồng / lần**<br>• Giới hạn **5 lượt / ngày** và **30 lượt / tháng**<br>• Chỉ xem điểm rủi ro tổng quát & mã SHA-256 (khóa phân tích chi tiết từng điều khoản & khóa so sánh hợp đồng)<br>• Tốc độ & giới hạn tần suất (Rate Limit) AI ở mức cơ bản |
| **Gói Medium** | `-medium-` | `medium@weeblegit.vn` | `User@123456` | • Gửi **nhiều hợp đồng cùng lúc** (Batch Upload tối đa 5 hợp đồng/lần)<br>• Mở khóa **đánh giá chi tiết từng điều khoản**, biểu đồ nhiệt & gợi ý đàm phán<br>• Mở khóa **so sánh các hợp đồng cùng loại** & đối chiếu giá thị trường<br>• Nới rộng hạn mức **25 lượt / ngày** & **200 lượt / tháng**, AI phân tích mức cao |
| **Gói Pro** | `-pro-` | `pro@weeblegit.vn` | `User@123456` | • **Loại bỏ mọi giới hạn** lượt phân tích ngày & tháng (`Unlimited`)<br>• Gửi nhiều hợp đồng cùng lúc, so sánh đa hợp đồng cùng loại<br>• AI phân tích chuyên sâu mức tối đa (Zero Rate-limit), xuất/in **Báo cáo Pháp lý PDF** |
| **Quản trị viên (Admin)** | `-pro/ad-` | `admin@weeblegit.vn` | `Admin@123456` | • Toàn quyền quản trị hệ thống tại `/admin` + đầy đủ tính năng không giới hạn của gói **Pro** |
| **Đăng ký mới** | `-free-` | Tự đăng ký trên Web | Tự tạo ($\ge 8$ ký tự) | • Mặc định khởi tạo ở gói **Free (`-free-`)** |

---

## 📋 Danh mục API Chính (Backend FastAPI)

Tài liệu Swagger UI tương tác trực tiếp tại: `http://localhost:8000/docs`

| Phương thức | Endpoint                     | Chức năng                                             | Quyền hạn    |
| ----------- | ---------------------------- | ----------------------------------------------------- | ------------ |
| **GET**     | `/health`                    | Kiểm tra trạng thái hoạt động backend                 | Public       |
| **POST**    | `/api/auth/register`         | Đăng ký tài khoản người dùng mới                      | Public       |
| **POST**    | `/api/auth/login`            | Đăng nhập lấy Bearer JWT Token                        | Public       |
| **GET**     | `/api/auth/me`               | Lấy thông tin tài khoản hiện tại                      | Đã đăng nhập |
| **POST**    | `/api/contracts`             | Upload file hợp đồng và tính SHA-256                  | Đã đăng nhập |
| **GET**     | `/api/contracts`             | Lấy danh sách hợp đồng đã tải lên                     | Đã đăng nhập |
| **POST**    | `/api/contracts/{id}/verify` | Xác thực tính toàn vẹn SHA-256 constant-time          | Đã đăng nhập |
| **POST**    | `/api/ai/chat`               | Tương tác AI đa lượt & tạo kịch bản đàm phán hợp đồng | Đã đăng nhập |
| **GET**     | `/api/admin/stats`           | Thống kê tổng quan số liệu hệ thống                   | Admin        |
| **GET**     | `/api/admin/contracts`       | Xem tất cả hợp đồng của mọi người dùng                | Admin        |
| **GET**     | `/api/admin/users`           | Quản lý danh sách tài khoản & trạng thái active       | Admin        |
| **GET**     | `/api/admin/risk-rules`      | Xem danh mục 250 quy tắc rủi ro hợp đồng              | Admin        |
| **POST**    | `/api/admin/risk-rules`      | Tạo thêm quy tắc rủi ro mới                           | Admin        |
| **GET**     | `/api/admin/logs`            | Xem audit log lịch sử xác thực bất biến               | Admin        |

---

## 📁 Cấu trúc Thư mục

```text
Web-WeebLegit/
├── backend/                         # Backend FastAPI
│   ├── routers/                     # API routers (auth, contract, ai, admin)
│   ├── ai_engine.py                 # AI Engine (Gemini LLM + Vietnamese Legal Rules)
│   ├── database.py                  # Cấu hình SQLAlchemy + Retry + Admin init
│   ├── models.py                    # Database models (User, Contract, Clause, Rule, Log)
│   └── main.py                      # FastAPI entrypoint + PNA & CORS middleware
├── frontend/                        # Frontend Next.js 16 + React 19 + Tailwind
│   ├── src/app/                     # Next.js App Router (trang chủ & /admin)
│   ├── src/components/              # Components (Chatbox AI, Checker, Templates, Navbar)
│   ├── src/lib/api.ts               # Dynamic API client layer (tự nhận diện LAN IP)
│   └── src/data/                    # Dữ liệu 7 mẫu hợp đồng chuẩn & luật tham chiếu
├── data/                            # Thư mục dữ liệu tham chiếu gốc (Excel + mẫu)
├── docker-compose.yml               # Compose chạy độc lập (Full Stack gồm DB)
├── docker-compose.app-only.yml      # Compose chạy Web kết nối tới DB máy Host chung
├── run.bat                          # Script 1-click khởi động cho Windows
├── run.sh                           # Script 1-click khởi động cho Linux/macOS
└── README.md                        # Hướng dẫn chi tiết dự án
```

---

## 🛡️ Nguyên tắc Bảo mật & Dữ liệu

- Toàn bộ mã băm SHA-256 được tính toán theo luồng nhị phân trực tiếp từ byte file và so sánh theo cơ chế `constant-time`.
- Mật khẩu được mã hóa an toàn bằng thuật toán băm chuẩn (Argon2id / bcrypt).
- Bảng `verification_logs` hoạt động theo nguyên tắc audit log append-only để phục vụ giám sát và kiểm tra an toàn.
