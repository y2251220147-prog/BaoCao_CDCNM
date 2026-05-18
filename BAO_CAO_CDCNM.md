# BÁO CÁO DỰ ÁN: HỆ THỐNG QUẢN LÝ CHI TIÊU CÁ NHÂN (EXPENSE TRACKER)

## CHƯƠNG 1: TỔNG QUAN

### 1.1. Mục tiêu
Đề tài hướng tới xây dựng một hệ thống quản lý chi tiêu cá nhân (Expense Tracker) hoàn chỉnh theo mô hình Fullstack, bao gồm Frontend (FE) + Backend (BE) + Database (DB), có thể vận hành ổn định trên môi trường phát triển (local) và sẵn sàng triển khai lên môi trường production.

Về mặt chuyên môn, mục tiêu của hệ thống gồm:
- Xây dựng giao diện người dùng trực quan để nhập, xem, chỉnh sửa và xoá các giao dịch chi tiêu.
- Xây dựng REST API backend có cấu trúc rõ ràng, có logging, xử lý lỗi, và hỗ trợ endpoint bắt buộc `GET /api/health`.
- Thiết kế cơ sở dữ liệu MySQL với schema rõ ràng; có script tạo bảng và dữ liệu mẫu phục vụ chạy thử.
- Triển khai dự án theo hướng DevOps:
  - Chuẩn hoá cấu hình môi trường bằng `.env` (không commit) và `.env.example` (commit).
  - Đóng gói hệ thống bằng Docker và chạy đa dịch vụ bằng `docker-compose`.
  - Thiết lập CI/CD với GitHub Actions để tự động kiểm tra chất lượng (lint/test/build) và chuẩn bị deploy (build & push Docker image).
  - Chuẩn bị cấu hình deploy thực tế (Render/Vercel).

Mục tiêu cuối cùng là tạo ra một hệ thống:
- Chạy được ở production
- Deploy lại được nhanh chóng
- Có khả năng debug theo từng layer, có log đủ để truy vết lỗi
- Đáp ứng checklist yêu cầu môn học.

### 1.2. Mô tả chức năng
Hệ thống Expense Tracker tập trung vào 3 nhóm nghiệp vụ chính: Giao dịch, Danh mục, Ngân sách, kèm theo health check để kiểm tra trạng thái hệ thống.

**(1) Quản lý giao dịch (Transactions) – CRUD + thống kê**
Người dùng có thể:
- Xem danh sách các giao dịch
- Xem chi tiết một giao dịch theo id
- Thêm mới giao dịch
- Sửa giao dịch
- Xoá giao dịch

Ngoài CRUD, hệ thống có các API hỗ trợ thống kê:
- Tổng hợp theo tháng (summary)
- Xu hướng (trends) để phục vụ hiển thị biểu đồ/đánh giá thói quen chi tiêu

**(2) Quản lý danh mục (Categories) – CRUD**
Hệ thống cho phép tạo danh mục để phân loại giao dịch (ví dụ: Ăn uống, Đi lại, Học tập…).
Chức năng chính:
- Xem danh sách danh mục
- Thêm danh mục
- Xoá danh mục

**(3) Quản lý ngân sách (Budgets) – CRUD**
Cho phép thiết lập ngân sách (ví dụ theo tháng hoặc theo nhóm).
Chức năng chính:
- Xem danh sách ngân sách
- Thiết lập/cập nhật ngân sách (upsert)
- Xoá ngân sách

**(4) Health Check**
Backend cung cấp endpoint bắt buộc để kiểm tra hệ thống: `GET /api/health`. Endpoint này dùng cho kiểm tra nhanh khi vận hành, CI/CD, hoặc khi deploy production.

### 1.3. Phạm vi
**Bao gồm:**
- Xây dựng FE/BE/DB đầy đủ theo mô hình client-server.
- Triển khai local bằng npm và bằng Docker Compose.
- CI/CD bằng GitHub Actions có các bước kiểm tra chất lượng.
- Chuẩn bị cấu hình deploy:
  - Backend trên Render (có `render.yaml`)
  - Frontend trên Vercel (có `vercel.json` và env mẫu)

**Không bao gồm:**
- Các tính năng nâng cao như xác thực người dùng (login), phân quyền, multi-user.
- Các yêu cầu về bảo mật nâng cao (WAF, rate-limit, audit log chuyên sâu) ngoài phạm vi môn học.
- Hệ thống giám sát (monitoring) chuyên nghiệp (Prometheus/Grafana) – không bắt buộc trong outline.

---

## CHƯƠNG 2: THIẾT KẾ HỆ THỐNG

### 2.1. Kiến trúc tổng thể (BẮT BUỘC)
Hệ thống được thiết kế theo kiến trúc 3 lớp rõ ràng, đúng flow yêu cầu:
**User → Frontend → Backend → Database**

- User thao tác trên giao diện web.
- Frontend (React + Vite) chịu trách nhiệm hiển thị UI, nhận input và gọi API.
- Backend (Node.js + Express) cung cấp REST API, xử lý nghiệp vụ, truy vấn cơ sở dữ liệu.
- Database (MySQL) lưu trữ dữ liệu giao dịch, danh mục, ngân sách.

> **Minh chứng:**
> 🖼️ `[CHÈN ẢNH: Sơ đồ kiến trúc tổng thể “User → FE → BE → DB”]`

Ngoài ra, khi chạy bằng Docker, các thành phần được triển khai thành các container độc lập và giao tiếp qua Docker network nội bộ:
- Frontend container gọi Backend theo cơ chế proxy/route (`/api`) hoặc theo `VITE_API_URL`.
- Backend container truy cập MySQL bằng hostname service (`mysql-db`).

### 2.2. Kiến trúc DevOps (BẮT BUỘC)
Hệ thống áp dụng tư duy DevOps ở mức phù hợp môn học: tự động hoá kiểm tra chất lượng và chuẩn hoá triển khai.

**Luồng DevOps tổng quát: Code → CI → (Build/Test/Lint) → (Deploy)**
- Code: developer push code lên GitHub hoặc tạo Pull Request.
- CI: GitHub Actions tự động chạy các job: Cài dependencies, Lint code, Chạy test, Build frontend.
- Deploy (khi push lên main): workflow thực hiện build & push Docker image lên Docker Hub thông qua secrets.

> **Minh chứng:**
> 🖼️ `[CHÈN ẢNH: sơ đồ CI/CD “Code → CI → Build → Deploy”]`

**Mô tả thực tế theo workflow:**
- Có file: `.github/workflows/ci.yml`
- Workflow chạy cho cả push và pull_request vào các nhánh chính.
- Tách 2 nhánh CI: `backend-ci` và `frontend-ci`
- Sau khi cả hai job pass, job deploy chạy khi điều kiện là push lên main.

> **Minh chứng pipeline chạy:**
> 🖼️ `[CHÈN ẢNH: GitHub Actions pipeline chạy thành công (màu xanh), hiển thị các job backend-ci, frontend-ci, deploy]`

### 2.3. API (BẮT BUỘC)

#### 2.3.1. Endpoint bắt buộc: Health Check
Backend có endpoint: `GET /api/health`
Endpoint này trả JSON thể hiện trạng thái dịch vụ, timestamp và thông tin service. Health check dùng để:
- Kiểm tra nhanh backend còn sống hay không
- Phục vụ verify khi deploy production
- Hỗ trợ debug khi xảy ra incident

> **Minh chứng /api/health:**
> 🖼️ `[CHÈN ẢNH: gọi GET /api/health trên browser/Postman/curl, trả status ok]`

#### 2.3.2. Danh sách API chính
**Transactions**
- `GET /api/transactions`
- `GET /api/transactions/:id`
- `POST /api/transactions`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`
- `GET /api/transactions/summary`
- `GET /api/transactions/trends`

**Categories**
- `GET /api/categories`
- `POST /api/categories`
- `DELETE /api/categories/:id`

**Budgets**
- `GET /api/budgets`
- `POST /api/budgets`
- `DELETE /api/budgets/:id`

---

## CHƯƠNG 3: TRIỂN KHAI HỆ THỐNG

### 3.1. Backend (BẮT BUỘC)
Backend được xây dựng bằng Node.js + Express, tổ chức theo hướng tách lớp rõ ràng:
- `routes/`: định nghĩa endpoint
- `controllers/`: xử lý logic nghiệp vụ
- `config/db.js`: cấu hình kết nối MySQL (connection pool)
- `middleware/`: xử lý lỗi và các middleware khác

**Công nghệ sử dụng:**
- Express: định nghĩa REST API
- mysql2/promise: thao tác MySQL theo dạng async/await
- dotenv: đọc biến môi trường, hỗ trợ chạy local và production
- cors: giới hạn nguồn gọi API theo CLIENT_URL
- morgan: logging request để debug
- ESLint: kiểm soát chất lượng code
- Test framework: chạy được qua npm test (được CI gọi)

**Kết nối Database:** Kết nối được cấu hình dựa trên env:
`DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME`
Khi backend khởi động, hệ thống thử kết nối DB và log kết quả, giúp phát hiện nhanh lỗi (Sai mật khẩu, DB chưa chạy, Sai host/port, Network trong Docker chưa đúng).

> **Minh chứng backend chạy local:**
> 🖼️ `[CHÈN ẢNH: terminal chạy backend, log “Server running …” và “Health check …”]`
> 🖼️ `[CHÈN ẢNH: gọi API bằng Postman]`

### 3.2. Frontend (BẮT BUỘC)
Frontend dùng React + Vite, chia theo các trang (pages) và component tái sử dụng.

**Công nghệ sử dụng:**
- React: xây dựng UI
- Vite: bundler nhanh, hỗ trợ env `import.meta.env`
- Axios: gọi API backend
- ESLint: kiểm tra chuẩn code, hạn chế lỗi console

**Tích hợp API backend:** Frontend tạo một axios instance với baseURL:
- Ưu tiên `VITE_API_URL` (khi deploy hoặc cấu hình runtime)
- Fallback `/api` (khi chạy Docker + Nginx proxy)
Thiết kế này giúp đáp ứng yêu cầu “Không hardcode API URL” và linh hoạt khi đổi môi trường.

> **Minh chứng frontend chạy OK + không lỗi console:**
> 🖼️ `[CHÈN ẢNH: UI chạy trên browser]`
> 🖼️ `[CHÈN ẢNH: DevTools Console không có lỗi]`
> 🖼️ `[CHÈN ẢNH: Network tab hiển thị request gọi API thành công]`

### 3.3. Environment (RẤT QUAN TRỌNG)
Dự án tuân thủ nguyên tắc:
- `.env` không commit lên Git
- `.env.example` phải commit để người khác có thể cấu hình chạy lại

Trong repo có các file env mẫu:
- `.env.example` ở cấp `expense-tracker/`
- `.env.example` cho backend
- `.env.example` và `.env.production.example` cho frontend

Các biến quan trọng:
- Backend: `DB_*`, `PORT`, `CLIENT_URL`, `NODE_ENV`
- Frontend: `VITE_API_URL` (trỏ về backend)

**Cam kết không hardcode:** Không hardcode DB/URL trong code; mọi thứ lấy từ env hoặc default hợp lý. Docker Compose truyền env cho backend và build-arg cho frontend.

> **Minh chứng không commit .env:**
> 🖼️ `[CHÈN ẢNH: .gitignore / hoặc danh sách file repo không có .env]`
> 🖼️ `[CHÈN ẢNH: file .env.example]`

### 3.4. Docker (BẮT BUỘC – 20 ĐIỂM)
Hệ thống được Docker hoá theo mô hình multi-service bằng `docker-compose.yml`, gồm 3 services:
1. **mysql-db**
   - MySQL 8.0
   - Khởi tạo schema tự động thông qua mount `schema.sql`
   - Có volume lưu dữ liệu
2. **backend**
   - Build image từ Dockerfile backend
   - Nhận env runtime để kết nối DB và phục vụ API
   - Phụ thuộc vào `mysql-db`
3. **frontend**
   - Build frontend thành static assets
   - Serve bằng Nginx (port container 80)
   - Có thể cấu hình gọi backend qua `/api` hoặc `VITE_API_URL`

**Lệnh chạy bắt buộc:** `docker compose up -d`

> **Minh chứng Docker:**
> 🖼️ `[CHÈN ẢNH: chạy docker compose up -d thành công]`
> 🖼️ `[CHÈN ẢNH: docker ps hiển thị 3 container running]`
> 🖼️ `[CHÈN ẢNH: logs backend (docker logs expense_backend)]`
> 🖼️ `[CHÈN ẢNH: logs mysql (docker logs expense_mysql)]`
> 🖼️ `[CHÈN ẢNH: logs frontend (docker logs expense_frontend)]`

### 3.5. Git & Branching
Dự án tổ chức nhánh theo hướng làm việc nhóm:
- Có nhánh `main` để tổng hợp phiên bản ổn định.
- Có nhánh phát triển `develop` (vai trò tương đương nhánh dev trong yêu cầu).
- Có nhiều nhánh dạng feature như `feature-*` phục vụ phát triển tính năng độc lập.
- Lịch sử commit có nhiều lần cập nhật, thể hiện quá trình phát triển và sửa lỗi (CI/CD, Docker, deploy config…).

> **Minh chứng lịch sử commit:**
> 🖼️ `[CHÈN ẢNH: danh sách commit trên GitHub (không phải 1 commit duy nhất)]`
> 🖼️ `[CHÈN ẢNH: danh sách branch hiển thị main/develop/feature-*]`

### 3.6. CI — Continuous Integration (15 ĐIỂM)
Hệ thống dùng GitHub Actions để tự động kiểm tra trước khi tích hợp code.
**Yêu cầu pipeline:** install, lint, test, build

**Mô hình chạy:**
- **Backend job:** `npm install`, `npm run lint`, `npm test`
- **Frontend job:** `npm install --legacy-peer-deps`, fix permissions (đảm bảo runner chạy được các binary), `npm run lint`, `npm test`, `npm run build`

Pipeline được thiết kế để fail ngay khi có lỗi lint/test/build, đảm bảo không “bypass”.

> **Minh chứng CI pass:**
> 🖼️ `[CHÈN ẢNH: workflow run pass trên GitHub Actions]`
> 🖼️ `[CHÈN ẢNH: chi tiết từng bước install/lint/test/build]`

---

## CHƯƠNG 4: DEPLOY (15 ĐIỂM)

### 4.1. Môi trường triển khai
Dự án chuẩn bị sẵn nhiều phương án deploy:
- **Render:** deploy backend Node service bằng `render.yaml`
- **Vercel:** deploy frontend React/Vite (có cấu hình trong thư mục frontend)
- **VPS:** deploy bằng Docker Compose

### 4.2. Quy trình deploy
**Bước 1: Deploy backend**
- Tạo service trên Render, kết nối repository.
- Render đọc cấu hình `render.yaml`, build và start backend.
- Khai báo env `DB_*` và `CLIENT_URL` trên dashboard Render.

**Bước 2: Deploy frontend**
- Import project lên Vercel.
- Set env `VITE_API_URL` trỏ tới URL backend Render.
- Deploy và lấy URL public.

**Bước 3: Kiểm tra sau deploy**
- Kiểm tra backend: `/api/health`
- Kiểm tra frontend load, thao tác CRUD, không lỗi console.

### 4.3. Minh chứng deploy (BẮT BUỘC)
- **URL public:**
  - Backend: `[ĐIỀN URL BACKEND…]`
  - Frontend: `[ĐIỀN URL FRONTEND…]`

> **Screenshot hệ thống chạy online:**
> 🖼️ `[CHÈN ẢNH: trang frontend online]`
> 🖼️ `[CHÈN ẢNH: gọi /api/health online]`
> 🖼️ `[CHÈN ẢNH: thao tác CRUD online]`

---

## CHƯƠNG 5: LOGGING & DEBUG (10 ĐIỂM)

### 5.1. Logging
Hệ thống triển khai logging ở nhiều cấp:
- **Backend logging:** Dùng `morgan('dev')` để log request (method, path, status, time).
- **Docker logging:** Khi chạy container, toàn bộ stdout/stderr của service có thể xem bằng `docker logs`. Đây là nguồn log quan trọng khi debug production/VPS.
- **Deploy logging:** Render cung cấp build log và runtime log. Vercel cung cấp build log, và log theo môi trường (tuỳ cấu hình).

> **Minh chứng logging:**
> 🖼️ `[CHÈN ẢNH: backend log khi gọi API]`
> 🖼️ `[CHÈN ẢNH: docker logs]`
> 🖼️ `[CHÈN ẢNH: render/vercel logs]`

### 5.2. Debug theo layer (L4 → L1)
Để đảm bảo khả năng vận hành và xử lý sự cố, quá trình debug được chia theo layer:
- **L4 – Frontend:** Kiểm tra Console (lỗi JS, lỗi CORS). Kiểm tra Network: request có gửi đúng endpoint không, status code. Kiểm tra env `VITE_API_URL` và cấu hình build.
- **L3 – Backend:** Kiểm tra log morgan để biết request có vào server hay không. Kiểm tra error handler (500/400). Test nhanh bằng `/api/health` và các endpoint CRUD.
- **L2 – Database:** Kiểm tra MySQL container hoặc MySQL service chạy chưa. Kiểm tra schema đã init chưa. Test query và kiểm tra quyền truy cập.
- **L1 – Infrastructure:** Kiểm tra port mapping, firewall, domain/HTTPS, network Docker. Kiểm tra biến môi trường trên Render/Vercel. Kiểm tra service restart policy, health status.

### 5.3. INCIDENT (BẮT BUỘC ≥ 3 lỗi)

#### Incident 1:
- **Hiện tượng:** CI frontend fail, không chạy được một số lệnh build/test do lỗi permission của binary trong `node_modules/.bin`.
- **Log:** 
  ```log
  [CHÈN LOG THỰC TẾ TỪ GITHUB ACTIONS…]
  ```
- **Layer:** L3 (CI environment/build)
- **Nguyên nhân:** Quyền thực thi của file binary trong môi trường runner Linux không đúng hoặc bị hạn chế.
- **Cách fix:** Thêm bước cấp quyền `chmod -R +x node_modules/.bin` trong CI YAML.
- **Cách phòng tránh:** Chuẩn hoá lệnh install (ưu tiên `npm ci` nếu phù hợp), kiểm tra pipeline trên Linux từ sớm.
> **Hình minh họa:** 🖼️ `[CHÈN ẢNH: step fail trước fix + pass sau fix]`

#### Incident 2:
- **Hiện tượng:** Lỗi build CI và cấu hình dự án khi cập nhật hoặc chạy ESLint phiên bản mới (ESLint 9). Gây conflict dependency giữa `@eslint/js` và phiên bản eslint chung, báo lỗi về quy tắc không hợp lệ (`no-unassigned-vars`).
- **Log:**
  ```log
  [CHÈN LOG THỰC TẾ…]
  ```
- **Layer:** L3 (CI/build runtime)
- **Nguyên nhân:** Quá trình chuyển đổi từ hệ thống legacy `.eslintrc` sang định dạng cấu hình mới `eslint.config.mjs` (flat config) gặp xung đột, kèm theo peer dependency bị giới hạn nghiêm ngặt ở các module đi kèm.
- **Cách fix:** Loại bỏ quy tắc cấu hình sai (như `no-unassigned-vars` không tồn tại ở chuẩn mới), giải quyết peer dependency bằng cách sử dụng cờ `--legacy-peer-deps` trong npm hoặc đồng bộ version.
- **Cách phòng tránh:** Đọc kỹ changelog khi migrate phiên bản major của thư viện lõi; Pin Node version nhất quán (local/CI/Docker).
> **Hình minh họa:** 🖼️ `[CHÈN ẢNH: log lỗi + cấu hình node-version 20]`

#### Incident 3:
- **Hiện tượng:** Deploy backend trên Render fail do cấu hình build/start không thể kết nối tới cơ sở dữ liệu production (Railway MySQL), hoặc thiếu biến môi trường cần thiết.
- **Log:**
  ```log
  [CHÈN LOG THỰC TẾ TỪ RENDER / DOCKER COMPOSE LOCAL…]
  ```
- **Layer:** L1 (deploy platform) + L3 (backend runtime)
- **Nguyên nhân:** Backend bị khởi động thiếu các biến cấu hình kết nối DB (như `DB_HOST`, `DB_PASSWORD`), hoặc bị từ chối kết nối do public network setting. Biến `.env` bị bỏ qua trong môi trường chạy.
- **Cách fix:** Sử dụng `render.yaml` chuẩn hoá cấu hình và khai báo biến môi trường `sync: false` để nhập thủ công trên Render; điều chỉnh các file `docker-compose.yml` để nhúng tường minh biến hoặc load từ file `.env` root.
- **Cách phòng tránh:** Luôn có file cấu hình deploy, checklist env trước khi deploy; test kết nối DB bằng client tool trước khi gắn app.
> **Hình minh họa:** 🖼️ `[CHÈN ẢNH: Render build log / Docker log lỗi kết nối + service running sau khi fix]`

---

## CHƯƠNG 6: KẾT QUẢ

### 6.1. Mô tả hệ thống sau khi hoàn thành
Sau khi hoàn thành, hệ thống Expense Tracker đáp ứng đầy đủ yêu cầu về:
- Kiến trúc FE/BE/DB rõ ràng
- REST API phục vụ CRUD và thống kê
- Có health check theo yêu cầu
- Có thể chạy local bằng npm hoặc dựng nhanh bằng Docker
- Có CI pipeline tự động kiểm tra chất lượng
- Có khả năng triển khai thực tế lên Render/Vercel/VPS

### 6.2. Minh hoạ kết quả (BẮT BUỘC)
**UI:**
> 🖼️ `[CHÈN ẢNH: Dashboard]`
> 🖼️ `[CHÈN ẢNH: Transactions]`
> 🖼️ `[CHÈN ẢNH: Categories]`
> 🖼️ `[CHÈN ẢNH: Budgets]`

**Docker running:**
> 🖼️ `[CHÈN ẢNH: docker ps]`

**CI/CD pass:**
> 🖼️ `[CHÈN ẢNH: GitHub Actions pass]`

**Deploy:**
> 🖼️ `[CHÈN ẢNH: Frontend online]`
> 🖼️ `[CHÈN ẢNH: /api/health online]`
> 🖼️ `[CHÈN ẢNH: thao tác CRUD online]`

### 6.3. Đánh giá
**Điểm mạnh:**
- Triển khai theo hướng thực tế: có Docker, CI/CD, và cấu hình deploy.
- Tổ chức code tách lớp giúp dễ bảo trì và debug.
- Cấu hình env mẫu rõ ràng, hạn chế hardcode.

**Điểm hạn chế:**
- Phần minh chứng cần chạy thật để chụp đủ theo checklist.
- Tên nhánh phát triển dùng `develop` (tương đương dev), nếu giảng viên yêu cầu đúng tên dev thì cần tạo thêm nhánh.

---

## CHƯƠNG 7: KẾT LUẬN

### 7.1. Kết quả đạt được
Đề tài đã hoàn thành một hệ thống quản lý chi tiêu đáp ứng các tiêu chí môn học:
- Chạy được production (có cấu hình deploy + env tách bạch)
- Deploy lại được (có `.env.example`, `docker-compose`, CI)
- Debug được theo layer (có logging, có health check, có docker logs/deploy logs)

### 7.2. Ưu điểm / Hạn chế
**Ưu điểm:**
- Fullstack rõ ràng FE/BE/DB.
- Có Docker + Compose.
- Có CI/CD pipeline đầy đủ lint/test/build và deploy job.
- Không hardcode cấu hình nhạy cảm.

**Hạn chế:**
- Cần hoàn thiện đầy đủ minh chứng ảnh chụp và URL deploy để “đủ điểm” theo rubric.
- Nên chuẩn hoá lại mô hình branch để khớp tuyệt đối với yêu cầu (`main/dev/feature/*`).

---

## CHECKLIST (đối chiếu yêu cầu)
- [ ] **Frontend load OK** — `[CHÈN ẢNH…]`
- [ ] **Không lỗi console** — `[CHÈN ẢNH…]`
- [ ] **API /api/health OK** — `[CHÈN ẢNH…]`
- [ ] **Docker chạy OK** — `[CHÈN ẢNH…]`
- [ ] **Container running** — `[CHÈN ẢNH…]`
- [ ] **CI/CD pass** — `[CHÈN ẢNH…]`
- [ ] **Deploy có URL** — `[ĐIỀN URL…]` + `[CHÈN ẢNH…]`
- [ ] **Không hardcode config** — (mô tả ở mục 3.3)
- [ ] **Có ≥ 3 incident** — (mục 5.3 - thay log/ảnh thật)
