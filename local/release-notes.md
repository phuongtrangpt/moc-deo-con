## Mốc Đèo Cón v0.2.0

- Quản lý bàn ăn, 10 bàn mặc định; thêm, đổi tên và tạm ẩn trong quản trị.
- Mở lại bàn để gọi thêm món; chuyển bàn, gộp đơn và giải phóng bàn khi thanh toán.
- Điện thoại: ẩn thanh điều hướng cố định, menu thu gọn, ưu tiên bàn/món và giỏ hàng dạng màn hình riêng.
- Bàn phím số thanh toán, 000, xóa, mệnh giá nhanh và tính tiền thừa/nợ lại.
- Cập nhật online từ GitHub với tiến trình tải, kiểm tra SHA-256, sao lưu và tự khởi động lại.
- Tự quay về bản cũ nếu bản mới không khởi động được.
- Giữ dữ liệu và tài khoản của v0.1; không có tài khoản/món/doanh thu mẫu trong gói.

### Cập nhật từ v0.1

Tải ZIP này một lần. Dừng chương trình, sao lưu thư mục `data`, chép tệp chương trình mới vào chỗ cũ và giữ nguyên `data`. Chạy `CHAY_WINDOWS.bat` mới. Các lần sau: **Quản trị → Cập nhật → Kiểm tra bản mới**.

### Chạy

Cài Node.js 24. Windows chạy `CHAY_WINDOWS.bat`; Linux/Pi chạy `node bootstrap.mjs`. Điện thoại cùng Wi-Fi dùng địa chỉ IP máy chủ và cổng 8099.

Bill qua trình duyệt Windows kết nối USB. Chưa có in USB tự động từ điện thoại; máy in và Pi thật cần thử tại quán. Bản local dùng HTTP trong LAN; truy cập từ xa cần HTTPS/VPN.
