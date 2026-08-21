# Rà soát thiết kế mobile — Học Toán Cùng Hana

## Phạm vi và cách kiểm tra

Đã đối chiếu luồng chào mừng, tạo hồ sơ/avatar, làm bài, bảng nhân–chia, tổng kết, bộ sưu tập huy hiệu và ảnh PNG kỷ niệm ở hai kích thước thực tế: **375 × 812 px** và **320 × 568 px**. Ảnh kỷ niệm được xuất thật qua nút lưu ảnh; tệp kiểm tra có kích thước **1080 × 1440 px**, định dạng PNG RGBA.

> Tiêu chí đánh giá là: học sinh 8–9 tuổi nhận ra việc cần làm trong vài giây; văn bản chủ đạo dễ đọc; vùng chạm rõ; không có thành phần trang trí lấn át bài toán; và các nút quan trọng không bị đẩy quá xa khỏi vùng nhìn đầu tiên.

## Phát hiện theo màn hình

| Khu vực | Điểm đang tốt | Điểm cần cải thiện | Mức ưu tiên |
|---|---|---|---|
| Chào mừng | Robot Hana, tiêu đề, hai nút chính và hành trình bốn phép tạo nhận diện vui, rõ. | Dải “Hành trình 4 hành tinh” và các nhãn phép tính quá nhỏ trên 320 px; phần minh họa nền cạnh tranh nhẹ với dòng giới thiệu. | Trung bình |
| Hồ sơ/avatar | Bốn avatar phân biệt tốt; hành động tải ảnh tách riêng, lớn và dễ hiểu; trường tên rõ. | Dòng mô tả bên dưới tiêu đề avatar có cỡ nhỏ; trang có nhiều yếu tố trang trí cùng lúc quanh vùng chọn nhân vật. | Thấp |
| Làm bài | Biểu thức và bốn đáp án có tương phản tốt; hai nút điều hướng cuối màn dễ nhận ra. | Thanh tiến độ trống chiếm diện tích; Điểm hiện tại, Loại bài tập và Mức độ khó quá nhỏ/dày ở 320 px; tên dạng bài bị xuống 2–3 dòng nên khó quét. | Cao |
| Bảng nhân–chia | Các trạng thái chọn bảng thể hiện bằng màu và bố cục lưới hợp lý; câu hỏi vẫn nổi bật. | Tiêu đề dài, ba nút loại luyện và hai hành động Chọn/Bỏ chọn bị dồn ngang; “Bỏ Chọn Tất Cả” vỡ dòng, tạo cảm giác bảng điều khiển chật. | Cao |
| Tổng kết | Tiêu đề, số liệu chính, phần thưởng cao nhất và trạng thái khóa huy hiệu có thứ bậc rõ; màu sắc nhất quán. | Trên 320 × 568 px, nút Lưu ảnh/Chơi lượt mới nằm sau bốn thẻ huy hiệu; cần cuộn dài mới chạm được. Huy hiệu khóa vẫn có phần mô tả khá dài và biểu tượng khóa nhỏ. | Cao |
| PNG kỷ niệm | Độ phân giải 1080 × 1440 phù hợp lưu/chia sẻ; phân vùng tên, số liệu, quà và huy hiệu rõ; bảng màu giữ đúng thương hiệu. | Tên phần thưởng lặp “Level 10” trong cùng một dòng; cụm huy hiệu ở nửa dưới khá nhỏ khi gửi qua ứng dụng chat; avatar ảnh tùy chọn cần được crop/preview rõ để không gây bất ngờ khi ảnh nguồn phức tạp. | Trung bình |

## Nhận định tổng thể

Sản phẩm đã có **nhận diện mạnh, màu sắc nhất quán và luồng chính dễ hiểu**. Mức độ hoàn thiện trên màn 375 px là tốt. Tuy nhiên, tại 320 × 568 px, bảng làm bài và bảng nhân–chia đang cố hiển thị quá nhiều điều khiển đồng thời; điều này làm cỡ chữ điều khiển giảm mạnh, giảm sự tập trung vào phép tính. Màn tổng kết có nội dung đẹp nhưng chưa ưu tiên hành động “Lưu ảnh” cho người dùng điện thoại.

## Hướng chỉnh sửa đề xuất

1. Tại màn làm bài, thu gọn thanh tiến độ thành một dòng thông tin có ý nghĩa; chuyển Loại bài tập và Mức độ khó vào một nút “Tùy chỉnh” mở bảng đáy khi cần. Mục tiêu là giữ biểu thức, bốn đáp án và hai nút cuối ở cỡ chạm thoải mái.
2. Tại bảng nhân–chia, rút gọn nhãn hành động thành “Chọn hết” và “Bỏ hết”, đồng thời dùng một hàng chọn chế độ có biểu tượng; chỉ hiện câu hỏi sau khi trẻ đóng phần cấu hình hoặc bấm nút “Bắt đầu luyện”.
3. Tại tổng kết, dùng thanh hành động dính đáy chỉ gồm “Lưu ảnh” và “Lượt mới”; phần huy hiệu tiếp tục cuộn bên dưới. Tăng cỡ biểu tượng khóa và giảm mô tả huy hiệu khóa còn một dòng.
4. Tại ảnh kỷ niệm, bỏ thông tin cấp lặp, tăng khoảng 12–16% kích thước vùng huy hiệu và thêm preview crop tròn trước khi học sinh xác nhận ảnh đại diện.
