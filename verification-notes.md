# Ghi nhận xác minh cập nhật Hệ Mặt Trời

- Màn làm bài ở desktop đã đặt bảng tính dưới vùng logo cố định và nút Cài đặt; hai điều khiển vẫn truy cập được, không chồng lên bảng.
- Nhãn mới **Học Bảng Nhân và Bảng Chia** hiển thị đúng trong bảng làm bài.
- Màn tổng kết hiển thị avatar Phi hành gia Trái Đất, số liệu lượt học, phần thưởng cao nhất, bộ sưu tập huy hiệu và nút lưu ảnh kỷ niệm đầy đủ.
- Các ảnh Sao Hỏa, Sao Mộc và Sao Thổ đang được tạo nền tảng và sẽ tự thay thế hình chờ qua các URL tài sản đã tích hợp.
- Ảnh kỷ niệm mới được tạo trực tiếp từ thẻ canvas riêng, không còn phụ thuộc việc chụp màn tổng kết; ảnh gồm avatar, số liệu, phần thưởng và huy hiệu của lượt học.
- PNG thực tế được xác nhận ở kích thước 1080 × 1350: tên ứng dụng không còn chồng lên hành tinh trang trí; ảnh giữ được tên học sinh, Phi hành gia Trái Đất, điểm, đúng/sai, thời gian, phần thưởng và bốn huy hiệu rõ ràng.

## Ghi nhận huy hiệu theo cấp và ảnh kỷ niệm cân đối

- Màn tổng kết Cấp 100 hiển thị rõ cả bốn mốc huy hiệu: Cấp 20, 60, 80 và 100; mỗi mốc có tên, trạng thái và mô tả riêng.
- Nút lưu ảnh kỷ niệm tạo PNG thành công từ tổng kết Cấp 100, sẵn sàng để kiểm tra bố cục thẻ mới.
- Trong phiên xem trước Cấp 100, nút lưu ảnh trở về trạng thái sẵn sàng sau thao tác; cần kiểm tra thêm tệp tải xuống qua luồng không bị giới hạn bởi giao diện xem trước.
- Console của trình duyệt không ghi nhận lỗi khi kiểm tra thao tác lưu ảnh trong phiên xem trước Cấp 100.
- Kiểm tra trạng thái sau 2,5 giây xác nhận thông báo lưu ảnh đã xuất hiện; hàm tạo PNG hoàn tất và nút trở về trạng thái sẵn sàng.
- PNG Cấp 100 đã được xem trực tiếp ở kích thước 1080 × 1440: vùng nhận diện được căn giữa, chân dung và số liệu cân bằng theo trục dọc, phần thưởng đủ nổi bật, và bốn huy hiệu Cấp 20/60/80/100 nằm gọn trong lưới 2×2.
