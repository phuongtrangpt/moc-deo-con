## Mốc Đèo Cón v0.2.2 — Sửa QR khi in bill

- Sửa QR bị ẩn sau khi đơn đã thanh toán đủ (trước đây tiền còn thiếu = 0 làm mất QR).
- Bill chưa trả dùng số tiền cần thanh toán; bill trả một phần dùng số còn nợ. Bill đã trả đủ vẫn giữ QR theo tổng bill, kèm nhãn ĐÃ THANH TOÁN và nhắc không chuyển tiền lại.
- Chờ ảnh QR tải đầy đủ mới cho in. Nếu lỗi mạng sẽ báo và có nút thử lại.
- Bill cũ chưa lưu tài khoản ngân hàng có thể dùng thông tin MB hiện được cấu hình.
- Thêm nút In bill / QR trước khi xác nhận thanh toán; khi quay lại vẫn giữ số tiền đã nhập.
- Chưa thử trực tiếp trên máy in vật lý. QR ảnh vẫn cần Internet để tải.

Cập nhật tại **Quản trị → Cập nhật → Kiểm tra bản mới → Cập nhật**. Dữ liệu và tài khoản được giữ nguyên.
