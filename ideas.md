# Định hướng thiết kế — Phi Hành Tinh Phép Tính

## Ba hướng phong cách

### 1. Vườn Sao Kẹo Ngọt
**Giới thiệu rất ngắn:** Một không gian học tập như khu vườn sao pastel, nơi phép tính được biến thành hạt giống và huy hiệu. Cảm xúc nhẹ nhàng, vui vẻ, gần gũi với học sinh tiểu học.

**Xác suất:** 0.06

### 2. Phi Hành Tinh Phép Tính
**Giới thiệu rất ngắn:** Học sinh trở thành phi hành gia nhỏ, du hành qua bốn hành tinh để luyện các phép tính. Bố cục khám phá theo quỹ đạo tạo động lực chơi tiếp mà không gây áp lực.

**Xác suất:** 0.08

### 3. Góc Bàn Học Giấy Cắt
**Giới thiệu rất ngắn:** Một thế giới thủ công bằng giấy cắt, với các thẻ bài như dụng cụ học tập được xếp trên bàn. Cảm xúc ấm áp và chú trọng vào sự rõ ràng của bài toán.

**Xác suất:** 0.04

## Phương án được chọn: Phi Hành Tinh Phép Tính

### Design Movement

**Illustrated edutainment kết hợp buồng lái phiêu lưu 3D nhẹ.** Thiết kế lấy cảm hứng từ các trò chơi khám phá dành cho thiếu nhi, nhưng thể hiện như một quyển vở bài tập sống động: mỗi hành tinh tương ứng với một mạch phép tính, câu trả lời đúng tích điểm và các mốc điểm cao mở huy hiệu chủ đề trong lượt học.

### Core Principles

1. **Học là hành trình:** Học sinh luôn nhìn thấy mình đang ở đâu trên bản đồ bốn hành tinh và biết bước tiếp theo.
2. **Rõ ràng trước, vui vẻ sau:** Phép tính, lựa chọn đáp án và phản hồi luôn có độ tương phản cao, chữ lớn, câu lệnh ngắn.
3. **Khen đúng lúc:** Điểm lượt cập nhật rõ ràng sau mỗi đáp án; lời chúc mừng và hiệu ứng mở khóa chỉ xuất hiện khi đạt mốc huy hiệu có ý nghĩa.
4. **Không phạt lỗi sai:** Trả lời chưa đúng kích hoạt một gợi ý nhỏ và cho phép thử lại hoặc chuyển sang câu mới.

### Color Philosophy

Nền là **xanh chàm vũ trụ** sâu để tạo cảm giác khám phá và giúp các hành tinh pastel tỏa sáng rõ nét. Cam san hô là màu hành động để thu hút vào nút chính; vàng mơ biểu thị thành tích; xanh ngọc là tín hiệu an toàn cho đáp án đúng. Bảng câu hỏi dùng kem sáng để giữ trải nghiệm đọc dễ chịu trong mọi thời gian học.

### Layout Paradigm

Trang chơi được tổ chức như một **buồng lái mở ra bản đồ quỹ đạo**: dải điều khiển ngắn ở trên, không gian vũ trụ rộng làm sân khấu ở giữa, còn khối bài toán nằm như bảng điều khiển neo ở cạnh dưới. Trên màn hình nhỏ, bảng điều khiển chuyển xuống đáy để ngón tay dễ chạm.

### Signature Elements

1. **Đường quỹ đạo chấm sáng** nối bốn hành tinh Cộng, Trừ, Nhân, Chia.
2. **Robot Hana** hình quả cầu nhỏ có ăng-ten lá, dẫn dắt và phản hồi sau mỗi câu.
3. **Điểm mốc hành tinh** có bốn màu tương ứng với từng phép tính, đặt trên quỹ đạo để cho thấy nhiệm vụ hiện tại.

### Interaction Philosophy

Mỗi thao tác phải giống việc điều khiển một chuyến bay nhỏ: chọn hoạt động để mở bài, chọn đáp án để ghi điểm, và nhận phản hồi ngay trên buồng lái. Các nút được thiết kế lớn, có biểu tượng cùng nhãn tiếng Việt; thao tác bàn phím số 1–4 cũng có thể chọn đáp án.

### Animation

Sao nền trôi rất chậm, hành tinh xoay nhẹ và đường quỹ đạo phát sáng khi hành tinh được chọn. Nút đáp án nảy xuống rất nhẹ khi bấm; đáp án đúng chỉ xác nhận điểm số, còn hiệu ứng mở khóa hành tinh dành riêng cho mốc huy hiệu. Chuyển động không thiết yếu sẽ tắt theo `prefers-reduced-motion`; không dùng hiệu ứng rung hoặc đếm giờ căng thẳng.

### Typography System

**Baloo 2** được dùng cho tiêu đề, số điểm và biểu thức toán để có nét tròn, thân thiện. **Be Vietnam Pro** dùng cho nhãn, hướng dẫn và nội dung dài để hỗ trợ dấu tiếng Việt rõ ràng. Tiêu đề bài học có cỡ lớn và đậm; biểu thức toán có khoảng cách thoáng, không nhồi chữ vào thẻ nhỏ.

### Brand Essence

**Phi Hành Tinh Phép Tính biến phép tính lớp 3 thành các chuyến khám phá ngắn, dễ hiểu và đáng mong đợi.**

Tính cách thương hiệu: **tò mò, khích lệ, sáng rõ**.

### Brand Voice

Giọng nói hồn nhiên, trực tiếp, động viên nỗ lực thay vì chấm điểm áp lực. Tiêu đề và nút bấm dùng động từ cụ thể, câu ngắn, tránh các lời mời chung chung.

> “Robot Hana còn một bước nữa để mở huy hiệu — bạn tính cùng Hana nhé!”

> “Chọn hành tinh để khởi động chuyến bay.”

### Wordmark & Logo

Biểu tượng là **một tên lửa hạt tròn nằm trong quỹ đạo hình dấu cộng**, phía sau có ba chấm sao; không có chữ trong biểu tượng. Wordmark đi kèm dùng nét chữ bo tròn, với dấu cộng thay cho chấm giữa hai từ khi cần dùng ở tiêu đề.

### Signature Brand Color

**Cam Sao Băng — #FF6B4A.** Màu này chỉ dùng cho hành động quan trọng, nút bắt đầu và các điểm cần hướng mắt của học sinh.

## Phạm vi học tập cho phiên bản đầu

Game tập trung vào mạch **Số và phép tính** của Toán lớp 3 theo Chương trình Giáo dục phổ thông 2018: đọc–viết và tính với số tự nhiên, cộng trừ, nhân chia trong phạm vi phù hợp, bảng nhân/chia và bài toán có lời văn ngắn. Vì hiện có nhiều bộ sách giáo khoa khác nhau cùng thực hiện một chương trình, trò chơi sẽ diễn đạt là **bám sát yêu cầu cốt lõi của chương trình Toán lớp 3**, không tuyên bố thuộc một cuốn sách giáo khoa duy nhất.

Các chế độ gồm **Luyện tập** theo chủ đề/cấp độ, **Thử thách** tổng hợp có nhịp độ nhẹ, và **Ôn theo hành trình** theo bốn hành tinh. Bài kiểm tra nhanh có 8 câu, bao quát phép tính đã chọn và tổng kết bằng phản hồi tích cực.

## Style Decisions

- Robot Hana luôn xuất hiện trực tiếp ở khu vực nhiệm vụ, là nguồn của lời gợi ý và phản hồi, thay vì chỉ được nhắc trong câu chữ.
- Mỗi hành tinh có bộ nhận diện xuyên suốt gồm màu pastel, ký hiệu phép tính và điểm đánh dấu quỹ đạo riêng: cam/dấu cộng cho Cộng, tím/dấu trừ cho Trừ, xanh ngọc/dấu nhân cho Nhân và vàng/dấu chia cho Chia.
- Biểu tượng tên lửa trong quỹ đạo-dấu-cộng được trình bày ở kích thước đủ lớn cùng wordmark và dùng làm favicon; khối biểu tượng có phương án hiển thị dự phòng để không thành ô vuông tối khi ảnh đang tải.
- Trò chơi mở đầu bằng một màn hình chào mừng ít lựa chọn, ưu tiên hai nút lớn “Bắt đầu” và “Hướng dẫn”; chỉ sau khi bấm Bắt đầu, học sinh mới nhìn thấy menu hoạt động.
- Menu hoạt động dùng bốn thẻ trực quan có màu và biểu tượng riêng cho Ôn theo hành trình, Luyện từng phép, Bảng cửu chương và Bài kiểm tra. Mỗi thẻ nêu một câu ngắn giải thích để trẻ chọn đúng nhu cầu.
- Trong màn chơi luôn có nút Menu rõ ràng ở đầu trang để trẻ đổi hoạt động mà không cần dựa vào trình duyệt.
- Menu sáu hoạt động không dùng lại Bản đồ hành trình; thay vào đó, mỗi thẻ có màu và ký hiệu phép tính riêng để giữ cảm giác phiêu lưu mà vẫn rõ ràng cho học sinh lớp 3.
- Các màn chính dùng quỹ đạo chấm sáng, hành tinh màu theo phép tính và lời dẫn của Hana như tín hiệu hành trình trang trí; không đưa lại Bản đồ hành trình hoặc lộ trình bắt buộc vì không phù hợp yêu cầu sản phẩm.
- Màn chơi luôn có quỹ đạo và các điểm mốc hành tinh theo phép tính hiện tại, để vùng vũ trụ là sân khấu của nhiệm vụ thay vì chỉ là nền trống.
- Hệ thành tích dùng điểm lượt cùng bốn huy hiệu mốc Cấp 20/60/80/100; không dùng lại thuật ngữ, biểu tượng hoặc cơ chế Tinh thể–năng lượng cũ, cũng không chúc mừng phần thưởng sau từng câu đúng.
- Màn chào mừng và tổng kết luôn dùng quỹ đạo chấm với đủ bốn điểm mốc Cộng, Trừ, Nhân, Chia như một phần của bố cục chính; đó là dấu hiệu cho biết đây là hành trình của Hana, không chỉ là một giao diện có nền không gian.
- “Phi Hành Tinh Phép Tính” là wordmark riêng và giữ nguyên khi đổi giao diện English; nội dung hỗ trợ vẫn chuyển ngữ đầy đủ, nhưng tên thương hiệu không bị thay bằng một nhãn chung chung.
- Hành trình 100 cấp vẫn được giữ trong tổng kết như một cách ghi nhận mốc hành trình cao nhất; trong lúc học, giao diện chỉ ưu tiên điểm hiện tại và bốn huy hiệu mốc để không làm phân tán sự tập trung.
- Màn chào mừng trình bày quỹ đạo bốn hành tinh như sân khấu nhiệm vụ chính. Các hành tinh lớn luôn có màu và ký hiệu phép tính: cam cộng, tím trừ, xanh ngọc nhân, vàng chia.
- Wordmark **Phi Hành Tinh Phép Tính** là neo nhận diện ở cả thanh đầu và vùng hero; Hana là người hướng dẫn của thương hiệu, không thay thế tên game bằng một khẩu hiệu chung chung.

### Bổ sung sau đánh giá đồ họa

- Trên mọi màn học, giao diện vận hành như một **buồng lái trên bản đồ quỹ đạo**: nhận diện hành tinh hiện tại, tín hiệu tiến độ/phần thưởng và lời dẫn Hana phải cùng thuộc một cụm thị giác, không rải rác như các thẻ biểu mẫu độc lập.
- Bốn màu hành tinh là ngôn ngữ điều hướng chính cho thẻ nhiệm vụ, lựa chọn và trạng thái đang chọn; mỗi bề mặt chọn nhiệm vụ cần mang ít nhất một dấu mốc quỹ đạo hoặc ký hiệu phép tính.
- Cam Sao Băng **#FF6B4A** chỉ dành cho hành động khởi động/tiếp tục quan trọng và điểm nhấn hành tinh Cộng; các mảng nhấn còn lại ưu tiên kem, tím, xanh ngọc và vàng để giao diện cân bằng hơn.
- Màn hồ sơ và tổng kết lặp lại bốn ký hiệu hành tinh như một vệt quỹ đạo ngắn, để avatar, thành tích và huy hiệu vẫn thuộc cùng một hành trình Cộng–Trừ–Nhân–Chia.
- Huy hiệu chủ đề chỉ xuất hiện như phần thưởng cho điểm số đạt được; mỗi thẻ dùng màu mốc riêng, mô tả ngắn và không cạnh tranh với nút hành động chính màu Cam Sao Băng.
- Nhận diện hiển thị chính thức ở mọi màn là **Học Toán Cùng Hana** / **Learn Math with Hana** theo yêu cầu sản phẩm. Tên “Phi Hành Tinh Phép Tính” chỉ mô tả hướng phong cách nội bộ, không thay thế tên ứng dụng đã chốt.
- Màn hồ sơ, Hướng dẫn, làm bài và tổng kết đều phải có logo phi thuyền cùng một dải quỹ đạo bốn phép tính. Trên màn làm bài, hành tinh phép tính hiện tại, Hana, điểm/phần thưởng và câu hỏi được gom thành cụm buồng lái rõ ràng.
- Mọi lớp phủ và cửa sổ xác nhận phải tôn trọng vùng an toàn phía trên của logo/Cài đặt; nội dung dài cuộn bên trong thẻ, không che thanh nhận diện cố định trên điện thoại.
- Wordmark **Học Toán Cùng Hana** cùng biểu tượng tên lửa–quỹ đạo luôn là neo nhận diện cố định trên các màn chính; nhãn nhiệm vụ chỉ là thông tin phụ của buồng lái.
- Trên màn học, dải hành tinh hiện tại, Hana, điểm, Cấp hành trình và huy hiệu tiếp theo cùng tạo thành một cụm buồng lái ngắn trước câu hỏi; nhãn phụ được rút gọn ở chiều rộng cực hẹp thay vì chồng lấn.
- Khi trả lời chưa đúng, phản hồi không dùng thẻ lỗi đỏ nội tuyến. Hana mở một cửa sổ kem dịu gồm tối đa ba gợi ý, minh họa đúng câu đang làm và thao tác “Thử lại câu này”; đáp án luôn giữ là dấu hỏi để khuyến khích tự suy nghĩ. Màu Cam Sao Băng chỉ dẫn đường đi tiếp, không biểu thị phạt lỗi.

### Bổ sung sau kiểm tra trực quan

- Wordmark **Học Toán Cùng Hana** cùng tên lửa–quỹ đạo xuất hiện ngay trong cụm buồng lái lúc học, ngoài logo cố định; đây là neo thương hiệu dễ nhớ, còn nhãn nhiệm vụ chỉ hỗ trợ ngữ cảnh.
- Hành tinh đang học được nhắc lại thành một chip lớn có màu pastel và ký hiệu phép tính rõ ràng; cam là Cộng, tím là Trừ, xanh ngọc là Nhân và vàng là Chia.
- Robot Hana xuất hiện như người bạn dẫn đường trong chính dải buồng lái, với lời hứa gợi ý từng bước thay vì chỉ là một biểu tượng nhỏ.
