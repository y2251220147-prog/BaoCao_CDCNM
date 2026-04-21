# Hướng Dẫn Triển Khai Lên WSL (Deploy Guide)

WSL (Ubuntu) đóng vai trò như là máy chủ Linux thực thụ (VPS Linux cục bộ). Dưới đây là hướng dẫn từ số 0 để đưa ứng dụng lên hệ thống này bằng Docker.

## Yêu cầu môi trường
* Đã cài đặt WSL 2.
* Đã cài đặt Docker Engine và Docker Compose bên trong WSL.

## Các bước chạy lần đầu

1. **Chuẩn bị cấu hình (Environment Variables)**
   - Sao chép file `.env.example` ở backend và đổi thành `.env`:
     ```bash
     cd backend
     cp .env.example .env
     ```
   - *Lưu ý*: Cập nhật lại chuỗi `DB_PASSWORD` cho an toàn (ví dụ: `P@ssw0rd123`) trong `.env` và trong `docker-compose.yml`.

2. **Khởi động hệ thống bằng Docker Compose**
   - Đứng ở thư mục gốc của project (ngang hàng `docker-compose.yml`).
   - Chạy lệnh ngầm:
     ```bash
     docker compose up -d
     ```
   - Màn hình sẽ hiển thị việc build các image. 
     * Frontend image sẽ trải qua 2 Stage (cài dependencies Node, Build React, sau đó copy sang Nginx). Quá trình này giúp file size nhỏ gọn đi nhiều.
     * Cuối cùng 3 container `expense_mysql`, `expense_backend`, `expense_frontend` sẽ hiển thị `Started`.

3. **Kiểm tra hoạt động hệ thống**
   - **Frontend**: Mở trình duyệt tại địa chỉ `http://localhost:5173`.
   - **Backend API Health**: Gọi `http://localhost:5000/api/health`. Phản hồi trạng thái `status: "ok"` là đạt yêu cầu.
   - **Check log backend khi cần gỡ lỗi**: `docker logs expense_backend -f`.
   - **Check tình trạng container**: `docker ps`.

## Cập nhật (Redeploy) sau khi thay đổi code
Trường hợp mã code thêm API hoặc cập nhật giao diện, đây là luồng redeploy cơ bản:

1. Kéo mã nguồn mới về máy.
2. Build lại image không dùng cache và khởi động:
   ```bash
   docker compose up -d --build
   ```
3. Docker sẽ tự cấu hình huỷ bỏ container cũ và dựng container mới nhanh chóng. Database không bị mất vì đã cấu hình `volumes` mapping ở file compose.
