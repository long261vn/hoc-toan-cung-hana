# Game Plan: Phi Hành Tinh Phép Tính

## Risk Tasks

### 1. Vòng đời Babylon trong React 19
- **Why isolated:** React StrictMode có thể gắn và tháo component hai lần trong môi trường phát triển, dễ tạo hai engine trên cùng một canvas.
- **Approach:** `GameCanvas` khởi tạo `Engine` duy nhất sau một cờ ref, nhận `GameHandle` từ `createGameScene`, dừng render loop và dispose engine, scene, event listener khi tháo component.
- **Verify:** Canvas có cảnh vũ trụ sau khi tải lại trang; thay đổi kích thước cửa sổ vẫn hiển thị đúng; không có lỗi WebGL/canvas trong console.

### 2. Đồng bộ câu hỏi với trạng thái hành tinh
- **Why isolated:** Trạng thái bài toán nằm ở giao diện DOM, còn hành tinh và năng lượng nằm trong Babylon; nếu không có một giao diện điều khiển rõ ràng, phản hồi đúng/sai dễ lệch với cảnh.
- **Approach:** Bộ tạo câu hỏi thuần TypeScript phát ra `QuizQuestion`; `GameCanvas` là cầu nối UI, gọi các phương thức tường minh `setActivePlanet`, `setEnergy` và `celebrate` trên `GameHandle`.
- **Verify:** Đổi phép tính sẽ làm hành tinh được chọn phát sáng; chọn đáp án đúng tăng năng lượng và làm tinh thể hiện ra; câu mới vẫn tương ứng phép tính đang chọn.

## Main Build

Xây dựng bản đồ bốn hành tinh Cộng, Trừ, Nhân, Chia; bảng điều khiển tạo câu hỏi theo ba cấp độ; ba chế độ gồm ôn theo hành trình, luyện từng phép và bài kiểm tra 8 câu. Mọi bài toán đều là số tự nhiên, phép chia có kết quả nguyên, không tạo bài trừ cho kết quả âm.

- **Assets needed:** ảnh nền vũ trụ 16:9, linh vật Robot Mít PNG trong suốt, biểu tượng tên lửa PNG trong suốt, sheet bốn hành tinh, ảnh tham chiếu giao diện.
- **Verify:**
  - Hành tinh xoay nhẹ và có trạng thái nổi bật khi chọn; canvas không che bảng câu hỏi.
  - Chọn đáp án hiển thị phản hồi đúng/sai rõ ràng, có gợi ý không trừng phạt.
  - Chế độ bài kiểm tra kết thúc sau 8 câu và cho điểm sao.
  - Các nút, nhãn và biểu thức đọc tốt trên máy tính lẫn điện thoại; không tràn nội dung.
  - Không có placeholder, texture thiếu hoặc lỗi console trong khi chạy.
  - Ảnh màn hình khớp tinh thần tham chiếu: nền chàm, vật thể pastel, cam Sao Băng làm điểm nhấn, mật độ hình ảnh thoáng.

