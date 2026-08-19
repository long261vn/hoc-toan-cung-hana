# Cấu trúc kỹ thuật — Phi Hành Tinh Phép Tính

## Tầng hiển thị

React chỉ đảm nhiệm khung trình bày. `client/src/components/GameCanvas.tsx` chứa canvas Babylon cùng bảng điều khiển DOM dễ đọc, quản lý chế độ học, cấp độ, phản hồi và trạng thái điểm. Trạng thái `screen` kiểm soát ba lớp trải nghiệm: `welcome` (chào mừng), `menu` (chọn hoạt động) và `game` (màn chơi).

## Tầng gameplay

`client/src/game/scene.ts` tạo `Scene` mới, camera quỹ đạo, ánh sáng, nền sao, tàu thám hiểm và `SpaceMapWorld`. `SpaceMapWorld` sở hữu các mesh hành tinh/tinh thể, cập nhật chuyển động nhỏ mỗi frame và mở ra một `GameHandle` tối giản để giao diện chọn hành tinh, cập nhật năng lượng hoặc kích hoạt ăn mừng.

`client/src/game/quiz.ts` là mô-đun thuần TypeScript. Nó không phụ thuộc React hay Babylon, chịu trách nhiệm tạo phép cộng, trừ, nhân và chia theo ba mức, sinh đáp án nhiễu an toàn và gợi ý ngắn. Mô-đun cũng có `generateTableQuestion`, chỉ sinh câu thuộc các bảng 2–9 đã chọn, theo dạng nhân, chia hoặc hỗn hợp.

## Luồng trạng thái

Học sinh đi theo luồng `welcome` → `menu` → `game`. Menu chọn một trong sáu `ActivityId`: Cộng, Trừ, Nhân, Chia, Bảng cửu chương hoặc Bài kiểm tra. Sau đó `GameCanvas` tạo `QuizQuestion` → học sinh chọn đáp án → cập nhật phản hồi, điểm và tiến độ → gọi `GameHandle` để đồng bộ cảnh. Chế độ kiểm tra đếm 8 câu; các chế độ khác tạo chuyến luyện liên tục. Ở chế độ bảng cửu chương, `GameCanvas` nắm `tableKind` và `selectedTables`, rồi truyền chúng vào bộ sinh câu hỏi để tôn trọng chính xác lựa chọn một hoặc nhiều bảng. Không còn thành phần Bản đồ hành trình trong màn chơi.

## Kiểm chứng

Ảnh kiểm chứng sử dụng cờ `?demo`, tự chọn hành tinh Nhân và nạp sẵn năng lượng để khung hình luôn thể hiện trạng thái gameplay rõ ràng. Cờ `?tables` mở trực tiếp khu bảng cửu chương với ba bảng đã chọn; `?tables=divide` và `?tables=mixed` kiểm chứng riêng các luồng chia và hỗn hợp. Các cờ này chỉ phục vụ trình diễn; mọi thao tác học vẫn dùng nút thực trong giao diện.
