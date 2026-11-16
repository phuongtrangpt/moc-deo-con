## Mốc Đèo Cón v0.2.1

- Đổi mật khẩu tại Quản trị → Đổi mật khẩu: xác nhận mật khẩu hiện tại, nhập lại mật khẩu mới; đăng xuất các phiên cũ trên thiết bị khác.
- Phân quyền riêng từng nhân viên tại Quản trị → Tài khoản → Chỉnh sửa: tạo đơn, thanh toán, sửa giá, khách hàng, nợ lại, xem/thu công nợ, ghi/xem thu chi, báo cáo, hủy đơn, chuyển/gộp bàn và quản lý thực đơn/bàn.
- Kiểm tra quyền ở máy chủ, lọc dữ liệu tài chính trước khi gửi xuống thiết bị. Quyền thay đổi có hiệu lực với phiên đang đăng nhập.
- Nút Lưu đơn lớn, đặt cạnh Thanh toán; vùng thao tác giữ ở cuối giỏ hàng trên điện thoại.
- Hiển thị phần trăm và dung lượng đã tải khi cập nhật, cùng trạng thái kiểm tra/cài đặt/khởi động lại.

### Cập nhật

Đang dùng v0.2.0: **Quản trị → Cập nhật → Kiểm tra bản mới → Cập nhật**. Xử lý hết đơn đang mở trước khi cài. Dữ liệu và tài khoản được giữ nguyên.

Đang dùng v0.1: tải ZIP một lần, dừng server, sao lưu `data`, chép tệp chương trình mới và giữ nguyên `data`. Chạy `CHAY_WINDOWS.bat` mới. Cần Node.js 24.

Mặc định nhân viên được tạo đơn, thanh toán, quản lý khách và chuyển/gộp bàn. Các quyền nhạy cảm cần chủ quán bật riêng. Quyền sửa giá cũ được chuyển sang từng tài khoản khi nâng cấp.
