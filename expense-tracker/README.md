# 💰 Expense Tracker

Ứng dụng quản lý chi tiêu cá nhân — **React + Node.js + Express + MySQL**

## Cấu trúc dự án

```
expense-tracker/
├── backend/                  ← Node.js + Express API
│   ├── server.js             ← Entry point, GET /api/health
│   ├── config/db.js          ← MySQL connection pool
│   ├── controllers/          ← Logic xử lý
│   ├── routes/               ← Định nghĩa endpoints
│   ├── middleware/           ← Error handler
│   └── .env.example
├── frontend/                 ← React + Vite
│   └── src/
│       ├── App.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Transactions.jsx
│       │   ├── Categories.jsx
│       │   ├── Budgets.jsx
│       │   └── HealthCheck.jsx
│       ├── components/
│       │   ├── Sidebar.jsx
│       │   ├── Modal.jsx
│       │   └── Toast.jsx
│       ├── services/api.js   ← Axios gọi backend
│       └── utils/helpers.js
└── database/schema.sql       ← Tạo bảng + dữ liệu mẫu
```

## API Endpoints

| Method | Endpoint                    | Mô tả              |
|--------|-----------------------------|--------------------|
| GET    | /api/health                 | Health check       |
| GET    | /api/transactions           | Danh sách giao dịch|
| POST   | /api/transactions           | Thêm giao dịch     |
| PUT    | /api/transactions/:id       | Sửa giao dịch      |
| DELETE | /api/transactions/:id       | Xóa giao dịch      |
| GET    | /api/transactions/summary   | Thống kê tháng     |
| GET    | /api/categories             | Danh sách danh mục |
| POST   | /api/categories             | Thêm danh mục      |
| DELETE | /api/categories/:id         | Xóa danh mục       |
| GET    | /api/budgets                | Danh sách ngân sách|
| POST   | /api/budgets                | Thiết lập ngân sách|
| DELETE | /api/budgets/:id            | Xóa ngân sách      |

## Cài đặt & Chạy

### 1. Database
```sql
-- Chạy file database/schema.sql trong MySQL
mysql -u root -p < database/schema.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env   # Điền DB_PASSWORD
npm install
npm run dev            # Chạy trên port 5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev            # Chạy trên port 5173
```

### 4. Kiểm tra
- Frontend: http://localhost:5173
- Health: http://localhost:5000/api/health

---

## 🐳 Triển khai với Docker (Khuyên dùng)

Dự án đã được cấu hình sẵn Docker để triển khai nhanh chóng và đồng bộ.

### Các bước thực hiện:
1. **Chuẩn bị file `.env`**: Tạo file `.env` tại thư mục gốc của project (đã được tạo sẵn với cấu hình mặc định).
2. **Khởi chạy Docker Compose**:
   ```bash
   docker compose up -d
   ```
3. **Truy cập**:
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5000`

---

## 📝 Quy chuẩn Commit (Commit Fit)

Để dự án chuyên nghiệp và dễ theo dõi, dự án áp dụng chuẩn **Conventional Commits**.

### Cấu trúc thông điệp:
`<type>: <mô tả ngắn bằng tiếng Việt hoặc tiếng Anh>`

### Các loại (Types) phổ biến:
- `feat`: Thêm tính năng mới.
- `fix`: Sửa lỗi.
- `docs`: Cập nhật tài liệu.
- `style`: Thay đổi giao diện, định dạng code (không đổi logic).
- `refactor`: Tối ưu hóa code.
- `chore`: Các thay đổi nhỏ khác (cập nhật thư viện, cấu hình build...).

**Ví dụ:** `feat: thêm chức năng lọc theo danh mục` hoặc `fix: sửa lỗi không hiển thị biểu đồ`.

> [!NOTE]
> Hệ thống sẽ tự động kiểm tra (Lint) khi bạn thực hiện lệnh `git commit`. Nếu thông điệp không đúng chuẩn, lệnh commit sẽ bị từ chối.
