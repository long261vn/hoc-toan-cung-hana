# Xác minh phát hành Vercel

## Vấn đề tái hiện

URL gốc `https://hoc-toan-cung-hana.vercel.app/` từng phản hồi `content-type: application/javascript` và trả nội dung đã bundle của `server/_core/index.ts`. Vì vậy trình duyệt hiển thị mã máy chủ thay vì giao diện React của game.

## Nguyên nhân và khắc phục

Dự án kết hợp frontend Vite với máy chủ Express dành cho môi trường Manus. Vercel chưa có chỉ dẫn để chỉ dựng phần frontend nên đã nhận nhầm đầu ra máy chủ. Cấu hình mới bổ sung lệnh `pnpm build:static`, chỉ chạy `vite build`, và `vercel.json` buộc Vercel phát hành `dist/public`. Quy tắc rewrite đưa các đường dẫn SPA về `index.html`.

## Xác minh công khai

Sau khi đồng bộ cấu hình, URL gốc phản hồi HTML `200`, có phần tử `#root` và tải màn hình chào mừng **Học Toán Cùng Hana**. Thao tác **Bắt đầu** chuyển đúng tới màn nhập tên/chọn avatar. Console không có lỗi runtime.

Luồng `/ ?demo&nowebgl` (không có khoảng trắng trong URL thực tế) cũng tải được câu hỏi `4 × 3 = ?`; chọn `12` tăng điểm từ 0 lên 10 và hiện phản hồi đúng. Ở câu tiếp theo `2 × 5 = ?`, chọn `11` giảm điểm từ 10 xuống 8, hiện phản hồi sai cùng nút **Thử lại ngay** và **Xem gợi ý**. Điều này xác nhận dữ liệu câu hỏi, tương tác client và trạng thái lượt học hoạt động trên Vercel.

Deep link tổng kết `?summary&nowebgl` tải được thống kê, phần thưởng và bốn huy hiệu. Thao tác **Lưu ảnh kỷ niệm** hoàn tất với thông báo gửi ảnh vào mục Tải xuống; không phát sinh lỗi hiển thị hoặc runtime trong quá trình tạo PNG.

Trong Cài đặt, nhạc nền và hiệu ứng hiển thị lần lượt 18% và 70%, đồng thời nút nghe thử còn khả dụng. Chuyển sang English đổi toàn bộ màn chào mừng, nút và nhãn hành trình sang tiếng Anh. Truy cập trực tiếp `/luyen-tap?vercel-spa-refresh=1` vẫn tải ứng dụng React thay vì 404, xác nhận rewrite SPA hoạt động. Console không ghi nhận lỗi JavaScript hoặc tải tài nguyên trong các lượt kiểm tra này.

Chế độ Bài kiểm tra `?testgame&nowebgl` tải câu hỏi cộng, bốn đáp án và nhãn còn lại bằng tiếng Anh theo trạng thái ngôn ngữ đang chọn. Chọn đáp án đúng `22` cho `18 + 4 = ?` tạo phản hồi đúng cùng nút **Next question**, không có lỗi runtime. Đây là xác nhận riêng cho luồng Bài kiểm tra trên Vercel.

Trên chính bản Vercel, nút **Preview sound effect** tạo trạng thái `hanaLastEffect: correct`, `hanaEffectState: playing`, âm thanh tổng bật và hiệu ứng 70%. Tệp PNG tải từ màn tổng kết được tìm thấy tại thư mục Tải xuống, dung lượng khoảng 1 MB và mở đúng với nội dung tổng kết, số liệu, avatar, phần thưởng cùng bộ sưu tập huy hiệu. Không có lỗi console trong lượt kiểm tra cuối.

## Lưu ý vận hành

Vercel sẽ triển khai lại khi repository GitHub được liên kết nhận commit mới. Với bản game hiện tại, Vercel dùng bản frontend tĩnh; các API Express, đăng nhập và cơ sở dữ liệu Manus không được Vercel sử dụng bởi luồng chơi hiện có.
