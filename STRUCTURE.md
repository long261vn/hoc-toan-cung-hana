# Cấu trúc kỹ thuật — Phi Hành Tinh Phép Tính

## Tầng hiển thị

React chỉ đảm nhiệm khung trình bày. `client/src/components/GameCanvas.tsx` chứa canvas Babylon cùng bảng điều khiển DOM dễ đọc, quản lý chế độ học, cấp độ, phản hồi và trạng thái điểm.

## Tầng gameplay

`client/src/game/scene.ts` tạo `Scene` mới, camera quỹ đạo, ánh sáng, nền sao, tàu thám hiểm và `SpaceMapWorld`. `SpaceMapWorld` sở hữu các mesh hành tinh/tinh thể, cập nhật chuyển động nhỏ mỗi frame và mở ra một `GameHandle` tối giản để giao diện chọn hành tinh, cập nhật năng lượng hoặc kích hoạt ăn mừng.

`client/src/game/quiz.ts` là mô-đun thuần TypeScript. Nó không phụ thuộc React hay Babylon, chịu trách nhiệm tạo phép cộng, trừ, nhân và chia theo ba mức, sinh đáp án nhiễu an toàn và gợi ý ngắn.

## Luồng trạng thái

`GameCanvas` → tạo `QuizQuestion` → học sinh chọn đáp án → cập nhật phản hồi, điểm và tiến độ → gọi `GameHandle` để đồng bộ cảnh. Chế độ kiểm tra đếm 8 câu; các chế độ khác tạo chuyến luyện liên tục.

## Kiểm chứng

Ảnh kiểm chứng sử dụng cờ `?demo`, tự chọn hành tinh Nhân và nạp sẵn năng lượng để khung hình luôn thể hiện trạng thái gameplay rõ ràng. Cờ này chỉ phục vụ trình diễn; mọi thao tác học vẫn dùng nút thực trong giao diện.

