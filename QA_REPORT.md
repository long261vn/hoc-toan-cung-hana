# Báo cáo QA nghiêm ngặt — Học Toán Cùng Hana

## Phạm vi kiểm thử

Lượt QA này kiểm tra dữ liệu câu hỏi, hành vi thực hành và bài kiểm tra, bảng nhân/chia, gợi ý Hana, lưu phiên, lưu ảnh kỷ niệm, xác nhận điều hướng, chuyển đổi ngôn ngữ, âm thanh, WebGL dự phòng, giao diện desktop/điện thoại, khả năng đọc và build sản xuất.

## Tiêu chí chấp nhận

| Nhóm | Điều kiện đạt |
|---|---|
| Toán học | Biểu thức, đáp án, lựa chọn và ba bước gợi ý nhất quán với nhau. |
| Luồng học | Chuyển nhiệm vụ, kết thúc lượt, bảng nhân/chia, bài kiểm tra và khôi phục phiên hoạt động không mất dữ liệu ngoài ý muốn. |
| Giao diện | Không chồng lấn, có vùng chạm rõ, chữ dễ đọc trên 320px, 375px và desktop. |
| Âm thanh | Nhạc và hiệu ứng được bật sau thao tác đầu tiên, điều khiển tắt/mở và âm lượng hoạt động. |
| Chất lượng kỹ thuật | TypeScript, build sản xuất và các hồi quy tự động hoàn tất không lỗi. |

## Nhật ký kiểm thử và phát hiện

### Hồi quy chức năng và dữ liệu

| Hạng mục | Bằng chứng | Kết quả | Phân loại |
|---|---:|---|---|
| Tính đúng câu hỏi và gợi ý | `verify-quiz-answers` kiểm tra 30.000 câu | Đạt | Không phát hiện lỗi dữ liệu toán học. |
| Bài kiểm tra tính giờ | Hồi quy chọn cấp độ/thời gian, sai → Hana ba bước → thử lại → đúng → câu mới | Đạt sau khi cập nhật selector theo màn chọn Bài kiểm tra hiện tại | Kịch bản cũ, không phải lỗi sản phẩm. |
| Bảng nhân/chia, câu hiển thị, lưu phiên, xác nhận kết thúc, phản hồi đáp án, EN | Hồi quy tự động | Đạt | Không phát hiện lỗi mới. |
| Tóm tắt English | Nhãn hiện tại là `HIGHEST JOURNEY LEVEL` | Đạt sau cập nhật kỳ vọng | Kịch bản cũ, không phải lỗi sản phẩm. |
| Đổi ngôn ngữ | Mở Cài đặt → Tiếng Việt/English → khôi phục | Đạt | Kịch bản cũ vẫn tìm nút ngôn ngữ trực tiếp đã bị bỏ theo yêu cầu trước đó. |
| Âm thanh | Mở Cài đặt, âm lượng mặc định 50/50, tắt/bật, kéo Nhạc 100 và Hiệu ứng 0, chạm Bắt đầu | Đạt | Kịch bản cũ tìm nút âm thanh trực tiếp và thiết lập localStorage mâu thuẫn. |
| Ảnh kỷ niệm | Tạo PNG và ghi nhận tệp tải xuống | Đạt sau khi thêm giới hạn chờ phông chữ và chờ tệp theo trạng thái | Lỗi độ bền đã khắc phục. |

### Vấn đề giao diện đã xác minh

| Mức | Phát hiện | Cách khắc phục | Trạng thái |
|---|---|---|---|
| Trung bình | Trên 320×568, thanh Đổi nhiệm vụ/Kết thúc lượt có thể vượt đáy viewport khoảng 6px trong một trạng thái bài học. | Thêm breakpoint chiều cao thấp; chỉ thu gọn khoảng đệm và thanh thao tác, không giảm vùng chạm đáp án. | Đã khắc phục và hồi quy đạt. |
| Thấp | Một số hồi quy còn selector của menu tự ẩn, trang nhiệm vụ cũ và nhãn phần thưởng cũ. | Viết lại theo Cài đặt, màn chọn Bài kiểm tra, Cấp hành trình và yêu cầu đã bỏ menu tự ẩn. | Đã khắc phục. |
| Thấp | Tạo ảnh chờ `document.fonts.ready` không giới hạn, có thể khiến thiết bị mạng chậm chờ lâu. | Giới hạn chờ phông chữ 700ms trước khi vẽ canvas. | Đã khắc phục. |
| Thấp | Console báo thiếu mô tả ở một số `AlertDialog` vì mã định danh mô tả nội bộ bị ghi đè. | Gỡ thuộc tính `id`/`aria-describedby` tùy chỉnh để thành phần tự liên kết mô tả đúng chuẩn. | Đã khắc phục; xác nhận mở hộp thoại không sinh warning mới. |

### Kiểm tra trực quan và runtime

Các màn chào mừng, nhiệm vụ, bảng nhân/chia, thiết lập kiểm tra, gợi ý Hana, Cài đặt âm thanh và tổng kết đã được kiểm tra ở desktop, 375×812 và 320×568. Màn 320×568 giữ trọn thanh thao tác, biểu thức và bốn đáp án. Nền dự phòng CSS hiển thị ổn định khi ép `nowebgl`; màn nền WebGL tiêu chuẩn cũng tải không có lỗi console hoặc yêu cầu mạng thất bại trong lượt QA.

Kết quả rà soát nội dung English cho thấy headline tổng kết từng chèn tên người chơi vào giữa câu. Nội dung đã đổi thành lời khen ngắn “You did it! What a great learning flight!”, còn tên được giữ tại huy hiệu Player. Các lời chúc trong thẻ phần thưởng cũng không chèn tên vào nhãn.

## Kết quả chốt QA

Toàn bộ **18 hồi quy tự động** hiện có đã đạt, bao gồm câu hỏi–đáp án, nội dung hiển thị, bảng nhân/chia, bài kiểm tra tính giờ, gợi ý Hana, lưu phiên, xác nhận điều hướng, VIE/ENG, âm thanh, ảnh kỷ niệm và giao diện mobile. `pnpm check` và `pnpm build` đều hoàn tất thành công. Build vẫn phát cảnh báo thông tin về kích thước bundle Babylon.js lớn hơn 500kB sau minify; đây không phải lỗi chạy ứng dụng, nhưng là mục tối ưu hiệu năng có thể thực hiện ở một lượt riêng bằng cách tách chunk 3D.
