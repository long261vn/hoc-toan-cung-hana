# Hồ sơ rà soát nghiêm ngặt — Phi Hành Tinh Phép Tính

## Phạm vi

Đợt rà soát đánh giá luồng học, tính đúng câu hỏi và đáp án, chuyển trạng thái, song ngữ, âm thanh, ảnh kỷ niệm, khả năng dùng bằng bàn phím, giao diện desktop/mobile, hiệu năng tải và khả năng phục hồi khi WebGL không có.

## Tiêu chí nghiệm thu

| Nhóm | Tiêu chí kiểm tra |
|---|---|
| Luồng học | Không có ngõ cụt; chuyển màn, đổi nhiệm vụ và kết thúc lượt giữ hoặc đặt lại trạng thái đúng theo chủ ý. |
| Toán học | Câu hỏi, đáp án, gợi ý và lựa chọn luôn nhất quán; không lặp trong cửa sổ yêu cầu. |
| Trạng thái | Điểm, đúng/sai, chọn bảng, phần thưởng, ngôn ngữ và hộp thoại phản ánh dữ liệu hiện hành. |
| Trải nghiệm | Nội dung đọc được, điều khiển chạm được và bảng tính là trọng tâm trên desktop/mobile. |
| Khả năng tiếp cận | Bàn phím, tiêu điểm, nhãn điều khiển và hành vi hộp thoại không làm học sinh bị kẹt. |
| Hiệu năng | Bản dựng thành công, tài nguyên hợp lệ, WebGL có dự phòng và không có lỗi console nghiêm trọng. |

## Nhật ký bằng chứng

| Hạng mục | Bằng chứng | Kết quả |
|---|---|---|
| Đáp án Toán học | Biên dịch độc lập `quiz.ts`, chạy `verify-quiz-answers.mjs` | Đạt: 30.000 câu Cộng/Trừ/Nhân/Chia, tìm thành phần và bảng nhân–chia có đáp án hợp lệ. |
| Tính tiện dụng của kiểm thử | Chạy trực tiếp `verify-quiz-answers.mjs` | Cần cải thiện: kiểm thử phụ thuộc tệp tạm `/tmp/hana-quiz-validation/quiz.js` nhưng không tự biên dịch tệp đó. |
| Bộ kiểm thử giao diện | Chạy 10 script bằng một Chromium chung | 6/10 đạt: thu gọn menu, phản hồi English, đổi ngôn ngữ, điều khiển mobile, khớp biểu thức–đáp án, âm thanh. |
| Độ độc lập của kiểm thử | Chuỗi kiểm thử giữ nguyên `localStorage` giữa các script | Cần cải thiện: kiểm thử bảng nhân–chia mong tiếng Việt nhưng gặp “No table selected” sau test English; test phản hồi không tự đặt lại ngôn ngữ trước khi tìm màn chọn dạng bài. |
| Đồng bộ kiểm thử với giao diện | Script xác nhận kết thúc tìm lớp nút mobile cũ | Cần cải thiện: script chưa được cập nhật sau khi cụm điều khiển chuyển xuống cuối bảng. |
| Lưu ảnh kỷ niệm | Kiểm thử chạy trong Chromium headless dùng chung | Chưa kết luận: script không thấy PNG tải xuống; cần tái hiện độc lập vì luồng tải phụ thuộc môi trường trình duyệt/headless. |
| Kiểm thử phản hồi sau đáp án | Chạy lại với hồ sơ Chromium mới | Đạt khi độc lập; lỗi trong bộ chạy nối tiếp là do thứ tự bản dịch/nội dung chưa được chờ ổn định. |
| Kiểm thử bảng nhân–chia | Chạy sau kiểm thử English trong cùng hồ sơ | Cần cải thiện: test không tự đặt ngôn ngữ, nên so sánh cứng “Chưa chọn bảng” và thất bại khi giao diện hợp lệ hiển thị “No table selected”. |
| Lưu ảnh kỷ niệm | Hồ sơ trình duyệt mới, theo dõi 3/8/15 giây | PNG xuất hiện sau khoảng 8 giây. Tuy vậy, nhãn trạng thái vẫn mắc ở “Hana đang tạo ảnh kỷ niệm...” sau khi tệp đã tải xong; đây là lỗi phản hồi giao diện thực tế. |
| Bộ dịch giao diện | Rà soát `localizeVisibleText()` và vùng `imageSaveStatus` | Nguyên nhân có khả năng cao: bộ dịch đi qua mọi text node không nằm trong `[data-dynamic-text]`, trong khi `image-save-status` là nội dung thay đổi trạng thái nhưng chưa có thuộc tính bảo vệ. |
| Rà soát ảnh desktop/mobile | 8 trạng thái chính: chào mừng, hồ sơ, menu, chọn dạng, làm bài, bảng nhân–chia, tổng kết, xác nhận | Các màn chính không có chồng lấn hoặc chữ vỡ rõ rệt; bảng tính được ưu tiên tốt sau lần tinh giản gần đây. |
| Hiển thị thương hiệu trên mobile | Màn làm bài và bảng nhân–chia ở 390 px | Thanh gọn chỉ hiển thị “Phi Hành Tinh”, không có “Phép Tính”; đây là đánh đổi do yêu cầu thu gọn nhưng làm giảm khả năng nhận diện đầy đủ. |
| Vùng chạm bảng nhân–chia | Màn 390 px với các lệnh “Chọn Tất Cả/Bỏ Chọn Tất Cả” | Hai lệnh dạng chữ nhỏ và sát nhau; cần đo/đảm bảo vùng chạm tối thiểu 44 px để phù hợp trẻ em. |
| Chọn lại cùng bảng | Chọn bảng 2 → Bỏ Chọn Tất Cả → chọn lại bảng 2 | Lỗi tái hiện: biểu thức trước/sau đều là `2 × 9 = ?`. Bộ nhớ `lastTableSelectionRef` không được xóa khi không còn bảng nào, nên hiệu ứng bỏ qua việc sinh câu hỏi mới. Điều này trái yêu cầu đổi lựa chọn bảng phải tạo câu và đáp án mới. |
| Ngữ cảnh bảng nhân–chia | Bản English với 3 bảng chọn và chế độ cả nhân/chia | Lỗi nội dung: tiêu đề phụ vẫn ghi “Start the 2 multiplication table.” dù đang chọn 3 bảng và chế độ trộn. Trạng thái “3 tables selected”, câu hỏi và các nhãn khác đều đúng. |
| Màn tổng kết English | Bản English, chụp trực tiếp trong trình duyệt | Đạt: toàn bộ tiêu đề, thống kê, phần thưởng, nút lưu ảnh và chơi lại đều bằng English; không thấy chuỗi tiếng Việt còn sót. |
| Vùng chạm điều khiển bảng | Đo `getBoundingClientRect()` tại màn Times Tables | Hai lệnh Select all/Clear all cao 14 px, các nút bảng số cao 34 px; đều dưới khuyến nghị 44 px cho thao tác chạm. Cụm đổi/kết thúc nhiệm vụ cao 43 px, gần đạt. |
| Ưu tiên ngôn ngữ theo URL | Mở `?lang=vi` sau khi localStorage đang là English | URL không thể buộc quay lại Vietnamese vì chỉ có điều kiện `lang=en` hoặc ngôn ngữ đã lưu là English. Đây là hạn chế cho demo/deep link và làm kiểm thử không độc lập. |
| Runtime và mạng | Tail log console, mạng và dev server sau các luồng kiểm tra | Không thấy lỗi console hay yêu cầu mạng 4xx/5xx mới trong phần log đã rà soát; analytics trả 200. |
| Kích thước bản dựng | Phân tích `dist/public/assets` | Bundle JavaScript chính 2.13 MB (khoảng 542 KB gzip theo build); CSS 177 KB. Cần phân tách tải Babylon/3D và xem xét tải chậm cho kết nối điện thoại yếu. |
| Khả năng bảo trì | Kích thước mã nguồn | `GameCanvas.tsx` khoảng 86 KB và `index.css` khoảng 100 KB, tập trung nhiều trách nhiệm; tăng rủi ro hồi quy khi sửa tính năng nhỏ. |
| Trợ năng chuyển động/tiêu điểm | Quét CSS | Có nhiều quy tắc `:focus-visible` và ít nhất một quy tắc giảm chuyển động. Tuy vậy, vài vùng chạm cốt lõi vẫn dưới kích thước phù hợp. |
| Khôi phục phiên học | Rà soát state phiên và localStorage | Không có lưu phiên đang làm (điểm, câu hiện tại, thời gian, bảng đã chọn) vào localStorage. Tải lại/đóng tab sẽ làm mất tiến độ chưa tổng kết, dù đã có hộp xác nhận chống bấm nhầm. |
| Thời gian lượt học | Rà soát timer dùng `Date.now() - sessionStartedAt` | Đồng hồ tiếp tục tính cả khi học sinh đổi tab hoặc để ứng dụng ở nền; tổng thời gian không phản ánh chính xác thời gian học chủ động. |
| Tính chất bài kiểm tra | Rà soát `continueMission()` | Trả lời sai trong Bài kiểm tra chỉ mở Thử lại, không chuyển câu; học sinh có thể làm lại đến đúng và vẫn đạt 8/8. Bài kiểm tra hiện đo khả năng kiên trì hơn là đánh giá một lần. |
| Đổi cấp độ trong bài kiểm tra | Rà soát `selectDifficulty()` | Có thể đổi cấp độ ngay trong lượt kiểm tra; tiến độ 8 câu được đặt lại nhưng điểm phiên không đặt lại. Cần xác nhận hoặc khóa cấp độ để kết quả dễ hiểu và công bằng. |
| Phần thưởng và điểm | Rà soát `session.ts` | Đạt yêu cầu cốt lõi: có đúng 100 cấp, ngưỡng tăng 10 điểm/cấp và hàm phần thưởng phụ thuộc minh bạch vào điểm phiên. |
| WebGL/Babylon và dự phòng | Mở màn làm bài không có `nowebgl`, kiểm tra console | Đạt trong môi trường rà soát: canvas Babylon xuất hiện, không có lỗi console. Chế độ dự phòng 2D cũng đã xuất hiện ổn định trong ảnh kiểm tra trước đó. |
