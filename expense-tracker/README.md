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
npm run dev            # Chạy trên port 3000
```

### 4. Kiểm tra
- Frontend: http://localhost:3000  
- Health:   http://localhost:5000/api/health

