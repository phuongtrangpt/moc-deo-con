# Mốc Đèo Cón · Sổ quán

Phần mềm bán hàng cho quán ăn gia đình, chạy trên một máy Windows hoặc Linux/Pi, điện thoại và tablet cùng truy cập bằng trình duyệt.

## Chức năng

- Bàn ăn: trạng thái trống/đang phục vụ, gọi thêm món, chuyển/gộp bàn, đổi tên/thêm/ẩn bàn.
- Tại quầy và mang đi, món chính/topping, giá riêng theo khách quen.
- Thanh toán tiền mặt/chuyển khoản/kết hợp, bàn phím số, trả một phần và nợ lại.
- Sổ công nợ, thu nợ theo bill, ghi thu chi và chốt tiền mặt.
- Báo cáo ngày/tuần/tháng/khoảng ngày; CSV cho Excel.
- Bill 58 mm cho Xprinter XP-58IIH, QR MB có số tiền và mã bill.
- Tài khoản nhân viên, phân quyền chủ quán, nhật ký và kiểm tra xung đột nhiều thiết bị.
- Cập nhật online từ GitHub Releases, SHA-256 từng tệp, sao lưu và quay lui khi khởi động lỗi.

## Cài đặt nhanh

1. Cài [Node.js 24](https://nodejs.org).
2. Tải ZIP mới nhất ở [Releases](https://github.com/phuongtrangpt/moc-deo-con/releases/latest), giải nén vào thư mục cố định.
3. Windows chạy `CHAY_WINDOWS.bat`; Linux/Pi chạy `node bootstrap.mjs`.
4. Mở `http://localhost:8099`, tự đặt mật khẩu cho `admin`.
5. Điện thoại/tablet cùng mạng mở địa chỉ IP hiển thị trong cửa sổ máy chủ, cổng 8099.
6. Quản trị: nhập món, bàn, tài khoản MB, tên chủ tài khoản và thêm nhân viên.

Không có mật khẩu mặc định. Máy chủ phải luôn bật trong giờ bán hàng. Dữ liệu SQLite nằm trong `data`; không xóa hoặc ghi đè thư mục này.

## Nâng cấp

Từ v0.1 cần tải gói v0.2.0 một lần: dừng chương trình, sao lưu `data`, chép tệp chương trình mới và giữ nguyên `data`.

Từ v0.2.0 vào **Quản trị → Cập nhật → Kiểm tra bản mới → Cập nhật**. Xử lý hết đơn đang mở trước khi cài. Bản mới đặt trong `.versions`; `active.json` chọn phiên bản chạy. Không cần tải gói thủ công các lần sau. Các điện thoại tải lại giao diện khi máy chủ đổi phiên bản.

Sao lưu đầy đủ: dừng phần mềm rồi chép toàn bộ `data` ra ổ khác. Xem `local/HUONG_DAN.txt` về khôi phục và Docker.

## Phát triển / phát hành

```sh
npm ci
npm run build
npm test
npm run release:bundle
```

Đổi `lib/version.ts` và phiên bản `package.json` khi phát hành. Push tag `vX.Y.Z` trùng phiên bản đó để GitHub Actions kiểm tra và tạo Release với ZIP cài đặt và `moc-deo-con-update.json` dùng cho cập nhật online. Không đưa `data`, `.versions`, phiên đăng nhập hoặc mật khẩu lên kho mã.

Kho mã này chứa bộ chạy local; cấu hình triển khai cloud riêng không được đưa vào đây.

## Phạm vi

Chưa có kho/giá vốn, tự đối soát ngân hàng, hoàn tiền hoặc ảnh hóa đơn. Chênh lệch thu chi không phải lợi nhuận theo giá vốn. QR ảnh cần Internet. In qua trình duyệt trên Windows cắm USB; chưa có agent in thẳng từ điện thoại ra USB. Chưa thử trên máy in và Pi 3 thật. Chỉ dùng HTTP trong LAN tin cậy; truy cập từ xa cần HTTPS/VPN.
