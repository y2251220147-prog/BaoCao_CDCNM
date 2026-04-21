# Kiến Trúc Hệ Thống (Architecture & CI/CD Flow)

## 1. Thành phần kiến trúc tổng quan (Architecture Layers)
Hệ thống Expense Tracker được tổ chức thành 3 cụm container (services) giao tiếp với nhau qua Docker Network ảo nội bộ.

* **Layer 4 - Frontend (UI - React + Vite + Nginx)**
  - Chịu trách nhiệm hiển thị website.
  - Sau khi build, file định dạng static được phục vụ bởi web server Nginx.
  - Giao tiếp với API qua HTTP Request (Axios) từ Client Browser.
* **Layer 3 - Backend (Node.js + Express)**
  - Xử lý Business Logic, cung cấp RESTful APIs.
  - Sử dụng biến môi trường lấy thông số kết nối Database.
  - Có các middlewares phổ biến (cors, error handling).
* **Layer 2 - External Services (Database MySQL 8.0)**
  - Chạy instance MySQL DB để lưu trữ Data Persistence.
  - Data được bind mount qua Docker Volume `mysql_data`.
* **Layer 1 - Infrastructure**
  - Môi trường thực thi: WSL (Windows Subsystem for Linux) sử dụng Docker Engine để quản lý container.

## 2. Luồng CI/CD (CI/CD Workflow Flow)

**Công cụ sử dụng**: GitHub Actions.
**Events**: `push`, `pull_request`.
**Branches**: `main`, `dev`, `feature/*`.

**Quy trình Pipeline tự động (Workflow Job)**:
1. **Developer** `git push` một nhánh (ví dụ tính năng mới).
2. **GitHub Actions Runner** được kích hoạt tự động đồng thời thực hiện hai Jobs song song: `backend-ci` và `frontend-ci`.
3. **Backend CI**:
   - Checkout source code.
   - Cài môi trường `node:18`.
   - Chạy lệnh `npm install`.
   - Thực thi `npm run lint` & `npm run test` để kiểm tra chuẩn coding và test case.
4. **Frontend CI**:
   - Tương tự setup môi trường Node.js.
   - Chạy `lint`, chạy `test`.
   - Chạy Job quan trọng: `npm run build` để xác thực project không gặp lỗi đóng gói trước khi chuyển qua CD.
5. **Kết quả**:
   - Nếu *Pass*: Pull Request có thể được merge.
   - Nếu *Fail*: Có dấu X đỏ, quá trình tự động báo lỗi để Developer check lại, đạt chuẩn triết lý *"không bypass lỗi"*.
