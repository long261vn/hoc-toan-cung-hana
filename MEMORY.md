# Memory

- Dự án dùng React 19, Vite, Tailwind 4 và `@babylonjs/core` 9.21.2.
- `GameCanvas` là nội dung duy nhất của route `/`; gameplay Babylon nằm trong `client/src/game` và không phụ thuộc React.
- Người dùng cần trải nghiệm tiếng Việt cho học sinh lớp 3 tại Việt Nam, ưu tiên cộng, trừ, nhân, chia; bộ câu hỏi tránh số âm và phép chia không nguyên.
- Nội dung gọi là bám yêu cầu cốt lõi của Chương trình GDPT 2018 lớp 3, không khẳng định thuộc một bộ sách giáo khoa duy nhất.
- Cờ `?demo` dành cho ảnh kiểm chứng: tự chọn hành tinh Nhân và nạp năng lượng mẫu.
- Khu Bảng cửu chương dùng các bảng 2–9. Học sinh chọn Bảng nhân, Bảng chia hoặc Hỗn hợp, sau đó chọn ít nhất một bảng; bộ sinh câu hỏi chỉ lấy nhân tử/chia số từ các bảng đó.
- Khi đổi hoạt động từ menu, tiến độ năng lượng, sao và trạng thái câu hỏi được đặt lại để không gây nhầm lẫn giữa các bài luyện. Canvas dùng `touch-action: none` để thao tác chạm không làm gián đoạn trò chơi trên điện thoại.
- Cờ `?tables` mở khu Bảng cửu chương với bảng 2, 4 và 6 được chọn để xác minh giao diện đa bảng.
