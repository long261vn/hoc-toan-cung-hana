# Xác nhận typography sau tinh chỉnh

Đã rà soát trực quan ở hai viewport **375 × 812** và **1280 × 720** cho các màn chào mừng, hồ sơ, chọn chế độ, danh sách nhiệm vụ, chọn dạng bài, thiết lập bài kiểm tra, bảng học và tổng kết kết quả thấp. Các heading, mô tả, nhãn nút và trạng thái mốc hành trình đều giữ cụm ý nghĩa; không còn trường hợp dòng mới chỉ có một từ đơn lẻ trong các vùng trọng yếu đã kiểm tra.

Các quy tắc `text-wrap: balance` áp dụng cho heading/nút quan trọng, trong khi `text-wrap: pretty` áp dụng cho mô tả và phản hồi. Nội dung có nguy cơ dài đã được rút gọn, gồm chú thích ảnh cá nhân và thông báo còn điểm để đạt Cấp hành trình 1. Gợi ý Hana được xác nhận bằng hồi quy trình duyệt; phản hồi sai và nút gợi ý hiển thị đúng ở desktop/mobile.

Đợt rà soát bổ sung đã kiểm tra ở cả hai viewport các lớp phủ nhiều chữ gồm Hướng dẫn, Điểm hiện tại, xác nhận kết thúc lượt, xác nhận về đầu và tổng kết bài kiểm tra hết giờ. Các tiêu đề, mô tả, thống kê và nút hành động đều giữ cụm từ có nghĩa; không xuất hiện dòng đơn lẻ ở các khu vực này. Chế độ xem trước `?testsummary` được thêm để kiểm tra trực tiếp typography của tổng kết bài kiểm tra mà không cần làm thay đổi dữ liệu học thật.

## Xác nhận line-box thực tế — 21/08/2026

Hồi quy `verify-overlay-typography.mjs` hiện đo hộp dòng của từng từ bằng Range API, thay vì chỉ dựa vào thuộc tính CSS. Kịch bản bao phủ 14 trạng thái quan trọng gồm các màn chính, Hướng dẫn, Điểm hiện tại, xác nhận kết thúc/quay về đầu, gợi ý Hana, tổng kết thường và tổng kết kiểm tra; mỗi trạng thái được kiểm tra tại **1280 × 720** và **375 × 812**, tổng cộng 28 lượt. Tất cả lượt kiểm tra đều đạt: không có từ tràn ngang và không có dòng cuối chỉ gồm một từ trong tiêu đề, mô tả hoặc nhãn hành động.

Rà soát trực quan toàn trang tại hai kích thước này cũng xác nhận màn chào mừng, hồ sơ/avatar, chọn kiểu học, thiết lập kiểm tra, bảng làm bài, gợi ý Hana và tổng kết vẫn có phân cấp rõ ràng, vùng chạm dễ nhận biết, không che logo/cài đặt và không có chồng lấn chữ. Trên điện thoại hẹp, hai nhóm điều khiển bài tập được xếp dọc để giữ nguyên các nhãn “Bài bình thường” và “Tìm thành phần”; danh sách huy hiệu của bảng điểm chuyển thành một cột để tên huy hiệu bốn từ không bị tách một từ cuối.
