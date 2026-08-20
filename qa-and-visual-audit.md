# Rà soát QA và đồ họa — Học Toán Cùng Hana

| Phạm vi | Vấn đề phát hiện | Mức độ | Hướng xử lý | Trạng thái |
| --- | --- | --- | --- | --- |
| Hồ sơ người chơi | Bộ avatar trước phụ thuộc các tài sản tạo ảnh không ổn định; ba lựa chọn có thể chỉ hiện hình chờ. Nhãn cũ còn khiến trẻ hiểu avatar là “bạn đồng hành”. | Cao | Thay bằng bốn avatar SVG nội bộ luôn hiển thị, bỏ tên cố định và dùng ngôn ngữ “avatar của bạn”. | Đã sửa |
| Hướng dẫn | Nội dung cũ chưa giải thích đủ luồng Luyện tập/Bài kiểm tra, 100 cấp, bốn huy hiệu và ảnh kỷ niệm. | Cao | Viết lại Hướng dẫn thành năm bước theo đúng luồng hiện tại và nêu rõ mốc điểm. | Đã sửa |
| Phần thưởng | Huy hiệu phải nhìn rõ là các mốc trong lộ trình 100 cấp, không phải điểm rời rạc. | Cao | Luôn hiển thị Cấp 20/60/80/100, phân biệt đã mở/chưa mở và cập nhật mô tả. | Đã sửa |
| Màn làm bài | Bảng câu hỏi rõ nhưng cảm giác như thẻ bài độc lập; thông tin nhiệm vụ, hành tinh phép tính và tiến độ chưa gắn thành một cụm điều khiển. | Trung bình | Đã thêm dải nhiệm vụ gọn tích hợp hành tinh phép tính, Hana và tiến độ 100 cấp, không làm mất diện tích câu hỏi. | Đã sửa |
| Nhận diện toàn app | Tên ứng dụng chính theo yêu cầu là **Học Toán Cùng Hana**; đề xuất dùng một thương hiệu khác sẽ gây mâu thuẫn với yêu cầu đã chốt. | Trung bình | Giữ logo phi thuyền + Học Toán Cùng Hana nhất quán, tăng tín hiệu quỹ đạo bốn phép tính ở profile, hướng dẫn, làm bài và tổng kết. | Đã sửa |
| Màu sắc và nhịp thị giác | Cam coral hiệu quả cho hành động chính nhưng cần hạn chế để không cạnh tranh với điểm, huy hiệu và lựa chọn nhiệm vụ. | Trung bình | Coral vẫn dành cho hành động khởi động/tiếp tục; xanh ngọc, tím và vàng mang vai trò hành tinh, trạng thái và phần thưởng. | Đã sửa |
| Mã dư thừa | Đã phát hiện các tài sản avatar bên ngoài, CSS ảnh avatar và nội dung cũ còn sót sau đổi thiết kế. | Trung bình | Đã dọn phụ thuộc ảnh ngoài, thay CSS bằng avatar SVG dùng chung, cập nhật khóa lưu trữ và dọn các quy tắc responsive mồ côi. | Đã sửa |

## Quyết định thiết kế áp dụng

Giao diện tiếp tục dùng nền không gian chàm, chữ thân thiện và các bảng màu kem để học sinh lớp 3 đọc rõ. Robot Hana vẫn là người hướng dẫn. Logo phi thuyền và tên **Học Toán Cùng Hana** là nhận diện sản phẩm theo yêu cầu đã chốt; bốn màu Cộng cam, Trừ tím, Nhân xanh ngọc và Chia vàng tạo thành ngôn ngữ điều hướng lặp lại ở các màn chính. Bảng làm bài được phát triển theo ý tưởng “buồng lái trên bản đồ quỹ đạo” nhưng giữ ưu tiên cho biểu thức, đáp án và vùng chạm.

## Kết quả QA đã xác nhận

Kiểm thử tự động đã xác nhận 30.000 câu hỏi sinh ra có đáp án hợp lệ, 120 cặp câu hỏi–đáp án hiển thị đúng qua các phép tính và dạng bài, phần bảng nhân–chia đổi bảng tạo câu hỏi mới đúng, khôi phục phiên giữ nguyên câu hỏi/điểm, English hiển thị hoàn chỉnh ở các luồng chính, và Bài kiểm tra tính giờ vẫn giữ đồng hồ/câu hỏi khi đổi ngôn ngữ qua Cài đặt. Trên điện thoại, chỉ còn một thanh hành động có Đổi nhiệm vụ và Kết thúc lượt ở dưới bảng bài tập.
