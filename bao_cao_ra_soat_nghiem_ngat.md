# Báo cáo rà soát nghiêm ngặt

## Phi Hành Tinh Phép Tính — Toán lớp 3

**Phạm vi rà soát:** Luồng học, toán học, trạng thái React, bảng nhân–chia, song ngữ, âm thanh, ảnh kỷ niệm, giao diện desktop/mobile, WebGL, khả năng tiếp cận, hiệu năng và bộ kiểm thử.

**Kết luận ngắn:** Ứng dụng đã có nền tảng tốt, phần lõi câu hỏi đáng tin cậy và giao diện thân thiện. Tuy nhiên, chưa nên xem là hoàn thiện: còn **hai lỗi hành vi rõ ràng**, vài điểm làm kết quả Bài kiểm tra thiếu ý nghĩa, một lỗi phản hồi lưu ảnh, cùng các rủi ro hiệu năng và khả năng bảo trì cần xử lý theo thứ tự ưu tiên.

> Không phát hiện lỗi P0 làm toàn bộ ứng dụng không thể sử dụng. Tuy vậy, hai lỗi P1 dưới đây ảnh hưởng trực tiếp đến trải nghiệm học bảng nhân–chia và độ tin cậy của trạng thái giao diện.

## 1. Kết quả kiểm thử đã đạt

| Hạng mục | Kết quả | Bằng chứng |
|---|---:|---|
| Tính đúng đáp án | Đạt | 30.000 câu Cộng/Trừ/Nhân/Chia, tìm thành phần và bảng nhân–chia có đáp án hợp lệ. |
| Khớp biểu thức và đáp án khi render | Đạt | 128 luồng giao diện liên tiếp xác nhận biểu thức và bốn lựa chọn đúng. |
| Điểm, thu gọn thanh đầu và nút Menu | Đạt | Điểm cập nhật 0 → 10; menu tự thu gọn rồi mở lại đúng. |
| Phản hồi English | Đạt | Đúng/sai, gợi ý và nút tiếp tục hiển thị bằng English trong kiểm thử độc lập. |
| Đổi ngôn ngữ | Đạt | VIE/ENG đổi qua lại đúng ở các màn đã kiểm tra. |
| Âm thanh và thanh trượt | Đạt ở mức tự động | Công tắc, mức mặc định 50%, hai thanh trượt và trạng thái lưu cục bộ đều hoạt động. |
| WebGL và nền dự phòng | Đạt trong môi trường rà soát | Babylon khởi tạo không có lỗi console; chế độ 2D dự phòng vẫn hiển thị được. |
| Tổng kết English | Đạt | Không thấy chuỗi tiếng Việt còn sót trong tiêu đề, thống kê, phần thưởng và nút thao tác. |

## 2. Phát hiện cần sửa trước

| Mức độ | Phát hiện | Bằng chứng tái hiện | Ảnh hưởng | Khuyến nghị cụ thể |
|---|---|---|---|---|
| **P1** | **Chọn lại cùng một bảng không tạo câu hỏi mới.** | Chọn bảng 2 → Bỏ Chọn Tất Cả → chọn lại bảng 2. Biểu thức trước/sau đều là `2 × 9 = ?`. | Trái yêu cầu đổi lựa chọn bảng phải sinh câu hỏi và đáp án mới; học sinh có thể gặp lại đúng câu vừa bỏ. | Khi `selectedTables` rỗng, đặt lại `lastTableSelectionRef.current`; bổ sung test chọn–bỏ–chọn lại. |
| **P1** | **Bộ dịch DOM vẫn có thể ghi đè văn bản React động.** | Lưu ảnh thành công nhưng dòng trạng thái vẫn là “Hana đang tạo ảnh kỷ niệm...”. | Làm học sinh tưởng thao tác bị treo, rồi bấm lặp lại hoặc rời màn. Đây là cùng một dạng lỗi từng xuất hiện ở điểm và nhãn bảng. | Bảo vệ `image-save-status` bằng `data-dynamic-text`; về dài hạn thay bộ dịch DOM bằng dictionary/React i18n. |
| **P2** | **Thông điệp đầu bảng nhân–chia không phản ánh cấu hình thực.** | Chọn 3 bảng, chế độ Cả nhân và chia; English vẫn ghi “Start the 2 multiplication table.” | Học sinh nhận chỉ dẫn sai về nhiệm vụ đang làm. | Sinh câu mô tả từ `selectedTables` + `tableKind`, ví dụ: “Đang luyện 3 bảng, cả nhân và chia.” |
| **P2** | **Lưu ảnh chậm và phản hồi trạng thái không đúng.** | PNG chỉ xuất hiện sau khoảng 8 giây trong chẩn đoán headless; nút được mở lại nhưng status không chuyển sang thành công. | Chờ lâu, trạng thái mâu thuẫn, dễ tạo cảm giác lỗi. | Hiển thị tiến trình rõ ràng, cập nhật trạng thái thành công, đặt timeout/fallback và đo trên điện thoại thật. |
| **P2** | **Bài kiểm tra cho phép làm lại đến đúng.** | Nhánh sai chỉ mở Thử lại; câu chỉ chuyển sau đáp án đúng. | Học sinh vẫn có thể đạt 8/8 sau nhiều lần sai; kết quả không còn là phép đánh giá một lần. | Chọn một chính sách rõ ràng: bài kiểm tra nghiêm túc thì khóa đáp án và chuyển câu; ôn tập thì đổi tên thành “Thử thách luyện tập”. |
| **P2** | **Có thể đổi cấp độ giữa bài kiểm tra.** | Đổi cấp độ đặt lại bước/câu đúng nhưng không đặt lại điểm phiên. | Kết quả khó hiểu, không công bằng giữa các lượt. | Chọn cấp độ trước khi bắt đầu; khóa trong bài hoặc hiển thị hộp xác nhận để tạo lượt kiểm tra mới. |
| **P2** | **Nút chọn bảng quá nhỏ trên điện thoại.** | Select all/Clear all cao 14 px; nút số cao 34 px. | Không phù hợp vận động tinh của trẻ 8–9 tuổi; tăng khả năng chạm nhầm. | Đưa mọi nút chạm quan trọng lên tối thiểu 44 × 44 px, tăng khoảng cách giữa Select all/Clear all. |
| **P2** | **Không có khôi phục phiên đang học.** | Điểm, câu hiện tại, thời gian và bảng đã chọn chỉ nằm trong state. | Tải lại trang/đóng tab làm mất tiến độ chưa tổng kết. | Lưu phiên nháp vào localStorage theo phiên bản; khi mở lại hỏi “Tiếp tục lượt học trước?” hoặc “Bắt đầu lượt mới”. |
| **P2** | **Đồng hồ tính cả thời gian ở nền.** | Dùng `Date.now() - sessionStartedAt`; không có xử lý `visibilitychange`. | Tổng thời gian học bị phóng đại khi trẻ rời tab. | Tạm dừng/chỉ cộng thời gian khi trang visible hoặc khi game ở màn bài tập. |
| **P2** | **Bundle đầu trang còn lớn cho điện thoại.** | JavaScript chính 2.13 MB, khoảng 542 KB gzip; CSS 177 KB. | Chậm mở lần đầu trên mạng yếu, đặc biệt vì Babylon tải cùng ứng dụng học chữ/số. | Lazy-load Babylon và âm thanh sau màn chào mừng; tách `GameCanvas`, scene 3D và CSS theo màn. |

## 3. Các điểm cần cải thiện về chất lượng phát hành

| Mức độ | Điểm chưa hoàn hảo | Nhận xét khó tính | Hướng cải thiện |
|---|---|---|---|
| **P2** | Bộ kiểm thử không tự đủ điều kiện chạy | `verify-quiz-answers.mjs` cần sẵn tệp `/tmp/hana-quiz-validation/quiz.js` nhưng không tự biên dịch. | Tạo một lệnh `pnpm test:quiz` tự biên dịch rồi chạy; không dựa vào tệp tạm có từ phiên trước. |
| **P2** | Test giao diện không độc lập | Một số script kế thừa `localStorage` của script trước, rồi lỗi vì ngôn ngữ English còn lưu. | Mỗi test phải tạo context/profile riêng, đặt rõ localStorage và ngôn ngữ đầu vào, không so sánh cứng chuỗi Việt nếu test không ép tiếng Việt. |
| **P2** | Test xác nhận kết thúc lượt đã lỗi thời | Script tìm các lớp `.mobile-end-session`, `.end-session-footer`, `.mission-end-button` đã bị bỏ khi UI thay đổi. | Cập nhật test theo `.session-end-button`; ưu tiên `data-testid` ổn định thay cho class trang trí. |
| **P3** | Deep link ngôn ngữ không đối xứng | `?lang=en` ép English, nhưng `?lang=vi` không ép Vietnamese nếu localStorage là English. | Parse tham số `lang` có cả `vi` và `en`, để deep link/demo/test xác định được trạng thái. |
| **P3** | Nhận diện mobile bị rút gọn quá mức | Thanh làm bài chỉ ghi “Phi Hành Tinh”, không còn “Phép Tính”. | Giữ wordmark đủ hai dòng nhưng gọn hơn, hoặc dùng tooltip/aria-label đầy đủ; cân bằng với yêu cầu ưu tiên bảng tính. |
| **P3** | Component và CSS quá tập trung | `GameCanvas.tsx` khoảng 86 KB, `index.css` khoảng 100 KB. | Tách `GameHeader`, `ExerciseConsole`, `TablePicker`, `SummaryScreen`, `EndSessionDialog`; tách CSS theo màn/khối. |
| **P3** | Hệ song ngữ dựa trên thay đổi text node | Cách này đã gây ít nhất một lỗi trạng thái và làm test mong manh. | Chuyển dần sang object bản dịch có kiểu TypeScript; mọi chuỗi động đi qua hàm `t(key, vars)`. |

## 4. Ưu tiên triển khai đề xuất

| Sprint | Nội dung | Mục tiêu nghiệm thu |
|---|---|---|
| **1 — Sửa chính xác** | Làm mới câu khi chọn lại bảng; sửa status lưu ảnh; sửa mô tả bảng nhân–chia. | Có test tái hiện xanh; nhãn thành công ảnh đổi đúng; nội dung mô tả luôn khớp chọn bảng/chế độ. |
| **2 — Đáng tin cho học sinh** | Làm rõ chế độ Bài kiểm tra; khóa/confirm đổi cấp độ; tăng vùng chạm. | Không thể đạt 8/8 nhờ làm lại sai; mọi nút bảng có vùng chạm ≥44 px. |
| **3 — Ổn định và giữ tiến độ** | Lưu/khôi phục phiên; dừng timer khi ẩn tab; cô lập bộ kiểm thử. | Reload không làm mất lượt đang học; tổng thời gian hợp lý; test chạy được theo bất kỳ thứ tự nào. |
| **4 — Hiệu năng và kiến trúc** | Tách tải Babylon, CSS, màn lớn và thay i18n DOM bằng React i18n. | Bundle ban đầu giảm rõ rệt; không phát sinh lỗi text động sau khi đổi ngôn ngữ. |

## 5. Giới hạn của đợt rà soát

Đợt rà soát đã dùng Chromium headless, ảnh chụp desktop/mobile, kiểm thử tự động và đọc mã nguồn. Âm thanh thực tế, hành vi chia sẻ tệp gốc và tốc độ tải trên điện thoại vật lý/mạng 3G chưa được đánh giá bằng thiết bị thật. Kết quả lưu ảnh xác nhận PNG có được tải sau khoảng 8 giây trong môi trường kiểm thử, nhưng trải nghiệm này cần được kiểm tra lại trên Android/iOS trước khi phát hành rộng rãi.

## Kết luận

Phần đáng tin nhất của ứng dụng là **logic toán học và luồng làm câu hỏi cơ bản**. Phần cần thận trọng nhất là **trạng thái UI động, trải nghiệm bảng nhân–chia và độ tin cậy của bộ kiểm thử**. Nếu chỉ chọn ba việc để làm ngay, nên ưu tiên: **(1)** sửa chọn lại bảng, **(2)** sửa phản hồi lưu ảnh và chuyển dần khỏi dịch DOM trực tiếp, **(3)** xác định lại quy tắc của Bài kiểm tra.
