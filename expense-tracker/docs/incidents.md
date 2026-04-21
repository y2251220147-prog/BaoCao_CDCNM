# Báo Cáo Sự Cố (Incident Reports)

Tài liệu này ghi chép lại các sự cố (incidents) đã xảy ra trong quá trình phát triển và triển khai hệ thống Expense Tracker, phân tích theo tư duy hệ thống (System Thinking - Layers).

---

## Incident 1: Lỗi Backend trả về HTTP 500 do mất kết nối Database
* **Hiện tượng**: Khi vào trang chủ Frontend, dữ liệu giao dịch không hiển thị. Bật Tab Network trong trình duyệt thấy API `/api/transactions` báo lỗi 500 Internal Server Error. Xem log container backend báo lỗi `ECONNREFUSED`.
* **Layer lỗi**: L2 (External - Database) & L3 (Backend).
* **Nguyên nhân**:
  - Container `backend` khởi động trước khi container `mysql-db` sẵn sàng nhận kết nối (MySQL startup mất nhiều thời gian hơn Node.js).
  - Hoặc thông tin biến môi trường `DB_HOST` cấu hình sai (VD: `localhost` thay vì tên trong docker-compose là `mysql-db`).
* **Cách Fix**:
  1. Đổi biến môi trường trong cấu hình Docker Compose của backend: `DB_HOST=mysql-db`.
  2. Bổ sung cơ chế auto-reconnect trong file `server.js` (hoặc cấu hình `pool` của MySQL2).
  3. Cấu hình `depends_on` trong `docker-compose.yml` để đảm bảo thứ tự.
* **Cách phòng tránh**: Setup liveness probe / healthcheck chuẩn cho Database và Backend chỉ connect khi DB healthy. Bắt `try/catch` ở Database connection layer thay vì crash server.

---

## Incident 2: Lỗi CORS khi Frontend gọi Backend từ IP khác
* **Hiện tượng**: Trang web tải giao diện bình thường nhưng gọi API bị trình duyệt chặn (Blocked by CORS policy). Lỗi màu đỏ trong Console.
* **Layer lỗi**: L4 (Frontend) - L3 (Backend) (Cross-Origin Policy).
* **Nguyên nhân**:
  - Backend sử dụng gói `cors` nhưng cấu hình `origin` chỉ cho phép `http://localhost:5173`.
  - Khi deploy production trên WSL hoặc máy chủ, đường dẫn truy cập từ người dùng có thể là IP thực của máy, dẫn đến không khớp origin.
* **Cách Fix**:
  1. Kiểm tra log cấu hình CORS.
  2. Truyền biến `CLIENT_URL` đúng với địa chỉ triển khai (Ví dụ: IP LAN `http://192.168.1.100` hoặc domain).
  3. Update tham số `origin: process.env.CLIENT_URL || '*'` trong cấu hình CORS backend và restart container.
* **Cách phòng tránh**: Quản lý whitelist CORS từ biến môi trường. Không nên mở `*` bừa bãi trong production.

---

## Incident 3: Frontend Undefined Route / Refresh báo lỗi 404
* **Hiện tượng**: Triển khai Frontend lên Nginx bằng file Docker, truy cập link trang chủ chạy bình thường, nhưng bấm Refresh (F5) trình duyệt tại đường dẫn `/budgets` thì gặp lỗi "404 Not Found" từ màn hình mặc định của Nginx.
* **Layer lỗi**: L4 (Frontend server - Nginx configuration).
* **Nguyên nhân**:
  - Ứng dụng dùng React Router DOM mã nguồn React hoạt động dưới chế độ Single Page Application (SPA).
  - Web Server (Nginx) cố gắng tìm file có tên `budgets.html` trên ổ đĩa và báo lỗi 404 vì file này không tồn tại.
* **Cách Fix**:
  - Đã thêm cấu hình `try_files $uri $uri/ /index.html;` vào file `nginx.conf` của Frontend. Mọi request không tìm thấy sẽ được trỏ về `index.html` của React.
* **Cách phòng tránh**: Luôn kiểm tra Nginx config kỹ càng khi đóng gói SPA và không chỉ test điều hướng click qua lại, mà phải test trực tiếp reload trang trên bất kỳ path nào.
