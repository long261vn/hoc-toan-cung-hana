# Kế hoạch cải tiến ưu tiên — Học Toán Cùng Hana

> **Mục tiêu:** Giải quyết ba điểm yếu có tác động lớn nhất: làm rõ hệ tiến độ–huy hiệu, giúp trẻ vào bài học nhanh hơn, và biến lỗi sai thành một thời điểm học trực quan với Robot Hana. Mọi thiết kế mới phải vừa trong khung nhìn điện thoại, không chồng lấn logo/Cài đặt/nút hành động và không yêu cầu cuộn để tìm thao tác chính.

## Nguyên tắc bắt buộc trước khi triển khai

| Quy tắc | Cách áp dụng cụ thể |
|---|---|
| **Một màn hình, một việc chính** | Mỗi trạng thái chỉ có một nút hành động nổi bật: Bắt đầu, Thử lại, Câu tiếp hoặc Quay lại học tiếp. |
| **Không che thanh nhận diện** | Vùng an toàn cố định: logo/Cài đặt ở trên; mọi thẻ, popup và nút Trở về bắt đầu dưới vùng này. |
| **Không cuộn để quyết định** | Trên 375×667, toàn bộ nội dung cần thiết và CTA chính phải thấy ngay. Nội dung phụ được chia thành các trang bấm qua lại trong cùng popup, không dùng trang cuộn. |
| **Không dạy bằng cách chỉ báo đúng/sai** | Lỗi sai phải dẫn đến một bước làm, một hình minh họa và một ví dụ tương tự; sau đó trẻ tự làm lại câu gốc. |
| **Không quay lại thưởng từng câu** | Điểm vẫn là đúng **+10**, sai **−2**; động lực dài hạn chỉ đến từ Cấp hành trình và bốn huy hiệu mốc. |

## 1. Làm rõ Cấp hành trình 1–100 và bốn huy hiệu

### Vấn đề hiện tại

Trẻ có thể thấy đồng thời **Cấp 10/100** và các huy hiệu ở Cấp 20/60/80/100 nhưng chưa hiểu hai nhãn này liên quan thế nào. Điều này làm mốc đầu tiên có vẻ xa và khiến phần thưởng bị hiểu nhầm là có ở mọi cấp.

### Phương án giao diện

| Vị trí | Nội dung mới | Quy tắc hiển thị |
|---|---|---|
| Dải nhiệm vụ khi học | `Cấp hành trình 10/100` và `Huy hiệu tiếp: Cấp 20` | Hai nhãn ngắn trên một hàng; tên huy hiệu không đủ chỗ sẽ dùng biểu tượng + `Cấp 20`. |
| Bảng điểm | Khối 1: `Hành trình 10/100`; khối 2: `Bộ sưu tập huy hiệu 0/4` | Tách bằng tiêu đề nhỏ, không lẫn trong cùng một thẻ. |
| Tổng kết | `Cấp hành trình cao nhất: 10/100`; bên dưới: `Còn 10 cấp để mở Người Mở Đường` | Nếu đã mở huy hiệu thì thay bằng tên huy hiệu mới nhất và hành tinh tương ứng. |
| Hướng dẫn | Một câu duy nhất: “Mỗi 10 điểm giúp bạn đi thêm 1 Cấp hành trình; các huy hiệu đặc biệt mở ở Cấp 20, 60, 80 và 100.” | Giữ nguyên quy tắc điểm +10/−2, không nhắc “quà sau mỗi câu”. |

### Bản đồ mốc trên điện thoại

Thay vì nhét một dải ngang dài, dùng **bốn ô huy hiệu 2×2** luôn nhìn thấy. Ô chưa mở có viền mờ, ô sắp tới có viền màu hành tinh và dòng “Còn X cấp”. Thanh `10/100` chỉ biểu diễn hành trình chung. Như vậy trẻ đọc được cả tiến độ gần lẫn mục tiêu lớn mà không phải kéo ngang hoặc kéo dọc.

### Tiêu chí hoàn thành

Một học sinh nhìn bảng điểm trong 5 giây phải trả lời được: “Mình đang ở Cấp mấy?”, “Huy hiệu gần nhất ở Cấp nào?” và “Cần thêm bao nhiêu điểm/cấp?”.

## 2. Rút ngắn đường vào bài học nhưng không làm mất lựa chọn dạng bài

### Luồng mới đề xuất

| Tình huống | Luồng hiện tại | Luồng đề xuất |
|---|---|---|
| Cộng, Trừ, Nhân, Chia | Luyện tập → chọn nhiệm vụ → chọn dạng bài → câu hỏi | Luyện tập → chạm thẻ nhiệm vụ → **vào ngay Bài bình thường**. |
| Muốn dạng khác | Phải qua toàn bộ màn chọn dạng bài trước khi làm câu đầu | Trong màn bài tập có nút pill `Bài bình thường ▾`; chạm vào mở **bảng chọn dạng bài thấp, không che câu hỏi**. |
| Bảng Nhân và Bảng Chia | Chọn nhiệm vụ → chọn bảng → câu hỏi | Giữ nguyên vì chọn bảng là điều kiện cần để tạo câu hỏi đúng. |
| Bài Kiểm Tra | Chọn Bài kiểm tra → cấp độ và thời gian → bắt đầu | Giữ nguyên vì đây là phần thiết lập trọng yếu. |

### Hành vi chi tiết

Khi trẻ chạm Cộng/Trừ/Nhân/Chia, game bắt đầu ngay với **Bài bình thường** và Cấp độ đang chọn gần nhất. Ở góc tiêu đề câu hỏi có pill `Bài bình thường ▾`. Chạm pill mở một bảng chọn gồm ba nút: **Bài bình thường**, **Tìm thành phần**, **Cả hai**. Chọn dạng khác sẽ tạo câu mới ngay, giữ nguyên điểm, thời gian và hoạt động hiện tại.

Để trẻ vẫn biết có lựa chọn nâng cao, dưới thẻ nhiệm vụ chỉ còn dòng cực ngắn “Bạn có thể đổi dạng bài bất cứ lúc nào.” Không thêm CTA lớn thứ hai; tránh khiến trẻ mới dùng phân vân.

### Ràng buộc bố cục

Bảng đổi dạng bài xuất hiện ngay dưới pill, có chiều cao tối đa ba nút, tự đóng sau khi chọn. Trên màn 375×667, bảng không được chạm logo/Cài đặt hoặc đẩy câu hỏi ra khỏi khung nhìn. Nếu không còn đủ chỗ ở dưới pill, bảng tự mở về phía dưới bên trong thẻ nhiệm vụ, không dùng popup toàn màn hình.

## 3. Cửa sổ Hana hướng dẫn trực quan sau khi chọn sai

### Quyết định trải nghiệm

Khi trẻ chọn sai, điểm bị trừ **một lần duy nhất −2**. Lưới đáp án khóa ngay và một cửa sổ mới hiện ra: **“Hana cùng bạn làm lại nhé”**. Đây là chế độ học, không phải thông báo lỗi. Trẻ không nhìn thấy đáp án đúng ngay; Hana giúp trẻ hiểu phương pháp, rồi đưa trẻ quay về tự làm lại chính câu đó.

### Cấu trúc cửa sổ Hana

| Khu vực | Nội dung | Giới hạn không cuộn |
|---|---|---|
| Đầu thẻ | Robot Hana, câu “Chưa sao đâu, mình xem cách làm nhé”, nút đóng `×` | Cao tối đa 76px. |
| Thanh bối cảnh | Câu gốc và đáp án trẻ vừa chọn, ví dụ `6 × 7 = ? • Bạn chọn 36` | Một dòng, cắt thông minh nếu biểu thức quá dài. |
| Bước làm | Tối đa 3 bước rất ngắn, chỉ hiện **một bước mỗi trang** | Có chỉ báo `1/3`, nút `Tiếp`/`Quay lại`; không có vùng cuộn. |
| Minh họa | Hình trực quan 80–108px gắn với bước đang xem | SVG/CSS nội bộ, không ảnh tải mạng; luôn vừa khung. |
| Bài mẫu | Một ví dụ dùng số khác, cùng phương pháp | Là **trang 4** khi cần, không xuất hiện đồng thời với 3 bước. |
| Chân thẻ | Nút nổi bật `Thử lại câu này` ở trang cuối | Luôn nằm sát đáy vùng an toàn. |

### Hình minh họa theo loại bài

| Dạng Toán | Minh họa trong cửa sổ Hana | Ví dụ bài mẫu |
|---|---|---|
| Cộng | Trục số hoặc các chấm tiến về phía trước | `24 + 3`: nhảy 3 bước từ 24. |
| Trừ | Trục số lùi hoặc nhóm chấm được lấy đi | `32 − 5`: lùi 5 bước từ 32. |
| Nhân | Các hàng bằng nhau; mỗi hàng có cùng số chấm | `3 × 4`: 3 hàng, mỗi hàng 4 chấm. |
| Chia | Chia đều chấm vào từng hộp | `12 ÷ 3`: 12 chấm vào 3 nhóm bằng nhau. |
| Tìm thành phần | Cân bằng phương trình có ô trống | `□ × 4 = 20`: chia 20 thành nhóm 4. |
| Bảng nhân/chia | Mảng chấm hoặc thẻ bảng cửu chương tương ứng | `6 × 4` hoặc `24 ÷ 6`. |

### Luồng thao tác

1. Trẻ bấm đáp án sai.
2. Game giảm 2 điểm, phát hiệu ứng sai nhẹ và khóa câu hỏi.
3. Cửa sổ Hana hiện ở **Bước 1/3**, đồng hồ luyện tập tiếp tục đếm; trong Bài Kiểm Tra, đồng hồ **tạm dừng** để hướng dẫn không làm trẻ mất thời gian vô lý.
4. Trẻ bấm `Tiếp` để xem các bước và bài mẫu (nếu có).
5. Trẻ bấm `Thử lại câu này`; popup đóng, đồng hồ Bài Kiểm Tra chạy lại và lưới đáp án mở lại.
6. Nếu trẻ sai lại, Hana hiện phiên bản ngắn hơn: bước then chốt + minh họa + nút Thử lại. Điểm không bị trừ lặp lại cho cùng một câu sau lần sai đầu tiên.

### Tình huống bài kiểm tra

Để giữ tính công bằng, màn kiểm tra vẫn ghi số câu sai ngay khi trẻ trả lời sai. Hana có thể hiện hướng dẫn trực quan nhưng đồng hồ phải tạm dừng và tổng kết có dòng nhỏ `Hana đã hỗ trợ: X lần`. Nhờ đó phụ huynh/giáo viên biết đây là bài kiểm tra có hỗ trợ học tập, không phải bài kiểm tra nghiêm ngặt không gợi ý.

## Quy chuẩn không chồng lấn và không cuộn

| Hạng mục kiểm thử | Điều kiện phải đạt |
|---|---|
| Kích thước cơ sở | 320×568, 375×667, 375×812 và 1280×720; kiểm tra cả VIE và ENG. |
| Vùng an toàn | Popup bắt đầu dưới thanh logo/Cài đặt; không phần tử nào có `z-index` vượt thương hiệu cố định. |
| Cửa sổ Hana | Một trang hướng dẫn không cao quá `100svh − vùng an toàn trên − 16px`; nội dung chuyển bước bằng nút, không cuộn. |
| CTA chính | Trên mọi kích thước, nút `Thử lại câu này`/`Tiếp` hoặc `Quay lại học tiếp` hiện trong viewport khi popup mở. |
| Câu trả lời | Sau khi popup đóng, câu gốc, bốn đáp án và nút đổi/kết thúc lượt vẫn hiện trong cùng khung nhìn 375×812. |
| Chữ dài | Nhãn English/Vietnamese ngắt theo từ, tối đa hai dòng; không cắt giữa ký tự, không đè biểu tượng. |
| Giảm chuyển động | Khi thiết bị bật giảm chuyển động, cửa sổ và minh họa xuất hiện tức thì, không hiệu ứng quỹ đạo. |

## Lộ trình triển khai đề xuất

| Thứ tự | Hạng mục | Kết quả có thể kiểm chứng |
|---:|---|---|
| 1 | Chuẩn hóa dữ liệu `JourneyLevel`, `nextBadge`, `badgeProgress` và đổi toàn bộ nhãn cũ. | Bảng điểm/tổng kết/Hướng dẫn cùng dùng một nguồn dữ liệu và một ngôn ngữ. |
| 2 | Đưa Cộng–Trừ–Nhân–Chia vào thẳng bài bình thường; thêm pill đổi dạng bài trong màn học. | Từ Luyện tập đến câu đầu chỉ còn hai thao tác, nhưng vẫn đổi được dạng bài. |
| 3 | Tạo dữ liệu hướng dẫn trực quan theo từng operation/question kind và component `HanaLearningDialog`. | Mỗi đáp án sai mở một cửa sổ 3 bước + minh họa + ví dụ phù hợp. |
| 4 | Tích hợp pause/resume đồng hồ Bài Kiểm Tra, chống trừ điểm lặp, trợ năng bàn phím và giảm chuyển động. | Không mất thời gian bất công, không trừ điểm hai lần cho cùng lỗi. |
| 5 | Chụp kiểm thử mọi viewport, chạy TypeScript, bộ câu hỏi, timed test và hồi quy mobile. | Không chồng lấn, không cuộn để tìm CTA, không sai khớp câu hỏi–đáp án. |

## Tiêu chí nghiệm thu cuối cùng

Ứng dụng chỉ được coi là hoàn thành khi một học sinh mới có thể vào câu Cộng đầu tiên trong tối đa hai thao tác sau khi chọn Luyện tập; khi sai, học sinh nhìn được Hana, bước làm, hình minh họa và nút Thử lại mà không cuộn; và khi mở bảng điểm, học sinh nói đúng được cấp hành trình hiện tại, huy hiệu tiếp theo và số điểm còn cần để mở huy hiệu đó.
