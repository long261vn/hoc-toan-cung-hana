# Việc cần làm — Robot Hana hướng dẫn học tập

## Chọn dạng bài và quà thưởng mới

- [ ] Rà soát luồng vào bốn phép tính và xác định tất cả nhãn, biến, hiệu ứng Tinh thể cũ.
- [ ] Tạo màn chọn Dạng Bài trước câu hỏi, mặc định Bình thường, cho Cộng, Trừ, Nhân, Chia.
- [ ] Loại bỏ hoàn toàn Tinh thể cũ và thay bằng điểm, huy hiệu cùng quà thưởng trực quan.
- [ ] Kiểm tra tính điểm, mốc mở quà, kết thúc lượt và tải ảnh kỷ niệm; sửa lỗi nếu có.
- [ ] Kiểm thử giao diện mới trên máy tính, điện thoại, lưu checkpoint và bàn giao.

## Cập nhật hồ sơ người chơi và phần thưởng mở rộng

- [x] Bỏ nhãn MẶC ĐỊNH khỏi thẻ Bài bình thường và đổi tên menu thành Học Bảng Nhân và Chia.
- [x] Thêm bước nhập tên trước khi bắt đầu, lưu tên trong lượt học và đưa tên vào lời dẫn của Robot Hana cùng màn tổng kết.
- [x] Thiết kế 30 mốc phần thưởng theo điểm, hiển thị tiến độ dễ hiểu và đưa toàn bộ phần thưởng đã nhận vào ảnh kỷ niệm.
- [x] Áp dụng +10 điểm cho câu đúng, trừ 2 điểm cho câu sai nhưng không để tổng điểm âm.
- [x] Ngăn trùng lặp câu hỏi trong năm câu gần nhất cho mọi dạng luyện và bảng nhân–chia.
- [x] Cho phép đổi nhiệm vụ trong cùng lượt chơi mà vẫn giữ điểm, số đúng/sai và thời gian.
- [x] Kiểm thử luồng mới trên máy tính, điện thoại, dựng bản phát hành, lưu checkpoint và bàn giao.

## Cập nhật Hướng dẫn và điều khiển lượt chơi

- [x] Làm mới nội dung Hướng dẫn ở màn hình chờ theo luồng nhập tên, chọn dạng bài, đổi nhiệm vụ và hệ thống điểm–phần thưởng hiện tại.
- [x] Đổi nhãn Điểm Lượt thành Điểm hiện tại và tạo bảng xem tiến độ không làm kết thúc lượt.
- [x] Thêm nút Chơi tiếp trong bảng điểm, đồng thời đặt nút Kết thúc lượt cạnh Đổi nhiệm vụ ở màn chơi.
- [x] Kiểm thử trên máy tính và điện thoại, dựng bản phát hành, lưu checkpoint và bàn giao.

## Rà soát trải nghiệm lớp 3 và phần thưởng 100 cấp

- [x] Kiểm tra màn hình chờ, hồ sơ, menu, chọn dạng bài, màn chơi, bảng điểm, hướng dẫn và tổng kết trên máy tính lẫn điện thoại để tìm chữ chật, khó đọc hoặc nút chưa đủ nổi bật.
- [x] Mở rộng bộ phần thưởng từ 30 lên 100 cấp, giữ mốc điểm rõ ràng và tạo hệ tên gọi hấp dẫn cho học sinh lớp 3.
- [x] Tối giản màn tổng kết: chỉ nhấn mạnh phần thưởng cao nhất người chơi đã mở, không liệt kê toàn bộ phần thưởng.
- [x] Cập nhật Hướng dẫn, bảng Điểm hiện tại và ảnh kỷ niệm theo 100 cấp phần thưởng.
- [x] Chơi thử toàn bộ luồng như học sinh lớp 3, ghi nhận và sửa các lỗi thao tác, trạng thái và bố cục.
- [x] Kiểm tra lại trên máy tính/điện thoại, dựng bản phát hành, lưu checkpoint và bàn giao.

## Khắc phục lỗi WebGL

- [x] Rà soát luồng khởi tạo Babylon để xác định điểm phát sinh lỗi WebGL not supported.
- [x] Kiểm tra khả năng WebGL trước khi tạo Babylon Engine và hiển thị nền 2D dự phòng khi không hỗ trợ.
- [x] Bảo vệ luồng lỗi khởi tạo để giao diện trò chơi không bị hỏng nếu Babylon thất bại ngoài dự kiến.
- [x] Kiểm thử khởi động, dựng bản phát hành, lưu checkpoint và bàn giao bản sửa lỗi.

## Sửa lưu ảnh kỷ niệm

- [x] Rà soát hàm tạo canvas, mã hóa PNG và thao tác tải tệp của ảnh kỷ niệm.
- [x] Sửa cơ chế xuất ảnh để hoạt động ổn định khi WebGL có hoặc không khả dụng.
- [x] Kiểm thử ảnh tổng kết ở các mốc phần thưởng và trên màn hình máy tính/điện thoại.
- [x] Dựng bản phát hành, lưu checkpoint và bàn giao bản sửa lỗi.

## Hoàn thiện đồ họa ảnh kỷ niệm

- [x] Rà soát ảnh PNG hiện tại và xác định các thành phần đồ họa thiếu: Robot Hana, hành tinh, quỹ đạo, huy hiệu và khung thẻ.
- [x] Vẽ lại thẻ kỷ niệm bằng Canvas với Robot Hana, hành tinh, quỹ đạo, huy hiệu phần thưởng cao nhất và bố cục dễ đọc.
- [x] Sửa nội dung tiêu đề để tên người chơi luôn hiển thị đúng trong ảnh tải xuống.
- [x] Tạo ảnh PNG thực tế, kiểm tra trực quan và xác nhận tải tệp trước khi lưu checkpoint.

## Xuất ảnh giống màn tổng kết

- [x] Rà soát cây giao diện tổng kết, nền WebGL/2D và các yếu tố CSS cần xuất cùng ảnh kỷ niệm.
- [x] Tích hợp cơ chế chụp thành phần tổng kết để PNG phản ánh đúng bố cục đang hiển thị, với phương án dự phòng khi không thể chụp canvas WebGL.
- [x] Kiểm thử PNG đầu ra so với màn tổng kết trên máy tính và điện thoại, bao gồm tên người chơi, số liệu và phần thưởng.
- [x] Dựng bản phát hành, lưu checkpoint và bàn giao bản sửa lỗi.

## Chuyển đổi Tiếng Việt và English

- [x] Rà soát chuỗi giao diện, nội dung bài tập, lời dẫn Hana, phần thưởng và ảnh kỷ niệm cần hỗ trợ song ngữ.
- [x] Tạo trạng thái ngôn ngữ, bộ từ điển và nút Việt/EN có thể sử dụng tại mọi màn hình.
- [x] Dịch nhất quán các màn chào mừng, hồ sơ, menu, chọn dạng bài, màn chơi, bảng điểm, hướng dẫn, tổng kết và phản hồi học tập.
- [x] Kiểm thử đổi ngôn ngữ khi đang ở từng màn và trong lúc làm bài trên máy tính/điện thoại.
- [x] Dựng bản phát hành, lưu checkpoint và bàn giao phiên bản song ngữ.

## Di chuyển nút ngôn ngữ

- [x] Chuyển nút Việt/EN từ góc dưới phải lên vùng phía trên, không che điều khiển quan trọng.
- [x] Kiểm tra khoảng cách với logo, nút Hướng dẫn và thanh điều khiển trên màn hình máy tính/điện thoại.
- [x] Dựng bản phát hành, lưu checkpoint và bàn giao cập nhật vị trí nút.

## Làm mới thanh đầu và nút ngôn ngữ

- [x] Thiết kế lại vùng thanh đầu để logo, Hướng dẫn và điều khiển ngôn ngữ tạo thành một hệ thống thống nhất.
- [x] Thay nút trôi VIE/ENG bằng điều khiển ngôn ngữ tinh gọn ở hàng trên cùng; nhãn phản ánh ngôn ngữ đang hiển thị.
- [x] Kiểm tra bố cục thanh đầu ở chào mừng, màn chơi, tổng kết và điện thoại để không có thành phần chồng lấn.
- [x] Dựng bản phát hành, lưu checkpoint và bàn giao cập nhật giao diện.

## Hoàn thiện nhãn VIE/ENG và bản English

- [x] Sửa điều khiển để Tiếng Việt hiển thị VIE và English hiển thị ENG đúng theo ngôn ngữ đang dùng.
- [x] Rà soát mọi màn, bảng điểm, phần thưởng, hướng dẫn, phản hồi và ảnh kỷ niệm trong English để phát hiện tiếng Việt còn sót.
- [x] Hoàn thiện bản dịch English cho toàn bộ chuỗi còn lại, bao gồm nội dung có tên người chơi và gợi ý Robot Hana.
- [x] Kiểm thử chuyển Việt/English ở toàn bộ hành trình trên desktop/mobile; dựng bản phát hành và lưu checkpoint.

## Hoàn thiện phản hồi Hana và Bảng Nhân–Chia

- [ ] Dịch toàn bộ phản hồi đúng/sai, gợi ý và nút hành động của Robot Hana sang English theo ngôn ngữ đang dùng.
- [ ] Điều chỉnh Bảng Nhân và Chia để chỉ sinh câu hỏi sau khi người chơi đã chọn ít nhất một bảng.
- [ ] Bảo đảm mỗi thay đổi bảng hoặc kiểu luyện sinh một câu hỏi mới với bộ đáp án mới.
- [ ] Kiểm tra tự động số lượng lớn câu hỏi cộng, trừ, nhân, chia và bảng nhân–chia để xác minh đáp án đúng luôn nằm trong lựa chọn.
- [ ] Kiểm thử trực quan luồng chọn bảng, đổi bảng, trả lời đúng/sai trên desktop/mobile; dựng bản phát hành và lưu checkpoint.

## Lượt chơi, điểm và quà thưởng

- [x] Xác định quy tắc điểm, quà thưởng và điều kiện kết thúc lượt chơi.
- [x] Thêm bộ chọn dạng bài bình thường, tìm thành phần và cả hai cho Cộng, Trừ, Nhân, Chia.
- [x] Ghi nhận số câu đúng, sai, thời lượng, điểm và quà theo lượt chơi.
- [x] Tạo màn tổng kết lượt chơi với nút lưu ảnh kỷ niệm.
- [x] Kiểm tra vòng chơi, thống kê, phần thưởng và tải ảnh trên máy tính, điện thoại.
- [x] Lưu checkpoint và bàn giao phiên bản hoàn thiện.

## Hoàn thiện menu và bài tìm thành phần

- [x] Đối chiếu dạng tìm thành phần chưa biết phù hợp Toán lớp 3 cho từng phép tính.
- [x] Đưa Học Bảng Nhân và Chia từ 2 đến 9 lên vị trí thứ 3 trong menu.
- [x] Tích hợp câu hỏi tìm thành phần chưa biết cho Cộng, Trừ, Nhân và Chia.
- [x] Bổ sung gợi ý của Robot Hana theo từng dạng tìm thành phần.
- [x] Rà soát toàn bộ chức năng, đồ họa và giao diện trên máy tính, điện thoại; sửa lỗi phát hiện được.
- [x] Lưu checkpoint và bàn giao phiên bản hoàn thiện.

- [x] Đối chiếu nội dung số và phép tính lớp 3 để xác lập khung gợi ý.
- [x] Viết gợi ý theo từng phép cộng, trừ, nhân, chia với cách xưng hô “bạn”.
- [x] Hiển thị Robot Hana và phần hướng dẫn rõ ràng khi người chơi trả lời sai.
- [x] Kiểm tra gợi ý, phản hồi sai và giao diện trên máy tính, điện thoại.
- [x] Lưu checkpoint và bàn giao phiên bản hoàn thiện.

## Âm thanh cho hành trình cùng Hana

- [x] Xác định các thời điểm phát nhạc nền và hiệu ứng âm thanh phù hợp, không gây phân tán cho học sinh lớp 3.
- [x] Tạo nhạc nền không lời êm dịu và các hiệu ứng ngắn cho bắt đầu, chọn đáp án, đúng, sai, mở quà và chuyển nhiệm vụ.
- [x] Tích hợp trình quản lý âm thanh tôn trọng cài đặt của người chơi, tự phát sau thao tác đầu tiên và lưu trạng thái bật/tắt.
- [x] Thêm nút bật/tắt âm thanh dễ nhận biết ở màn hình chính và phản ánh trạng thái hiện tại bằng tiếng Việt/English.
- [x] Kiểm thử âm thanh, thao tác bật/tắt, fallback trình duyệt, TypeScript, build, desktop/mobile rồi lưu checkpoint.

## Cài đặt âm lượng riêng

- [x] Thiết kế bảng cài đặt âm thanh dễ hiểu với hai thanh trượt: nhạc nền và hiệu ứng.
- [x] Áp dụng mức âm lượng riêng vào trình phát nhạc và bộ tạo hiệu ứng Web Audio, đồng thời lưu cài đặt.
- [x] Kiểm thử thao tác thanh trượt, trạng thái bật/tắt, TypeScript, build và bố cục desktop/mobile trước khi lưu checkpoint.

## Khẩn cấp: Chuẩn hóa câu hỏi và đáp án Toán lớp 3

- [x] Tái hiện và ghi nhận lỗi ghép sai biểu thức với lựa chọn ở Cộng, Trừ, Nhân, Chia, Bảng Nhân–Chia và Bài kiểm tra.
- [x] Rà soát cách cập nhật trạng thái React để câu hỏi, đáp án, đáp án đúng và gợi ý luôn thuộc cùng một đối tượng câu hỏi.
- [x] Sửa bộ sinh và luồng chuyển câu hỏi; xác minh dạng bài thường, tìm thành phần chưa biết, bảng nhân, bảng chia, hỗn hợp và bài kiểm tra.
- [x] Chạy kiểm thử tự động quy mô lớn, chơi thử từng hoạt động và dựng bản sản phẩm trước khi lưu checkpoint.

## Điều khiển âm thanh và phản hồi hành động

- [x] Hợp nhất nút bật/tắt âm thanh và mở cài đặt thành một điều khiển duy nhất, dễ chạm trên màn hình chính.
- [x] Đặt mức mặc định mới là 50% cho nhạc nền và hiệu ứng; duy trì lưu lựa chọn riêng sau khi người chơi điều chỉnh.
- [x] Kiểm tra và bảo đảm có hiệu ứng cho thao tác chọn, trả lời đúng và trả lời sai.
- [x] Làm nổi bật rõ ràng nút Nhiệm vụ tiếp và Thử lại sau phản hồi đáp án.
- [x] Kiểm thử điều khiển, âm thanh, giao diện desktop/mobile, TypeScript và build trước khi lưu checkpoint.

## Khẩn cấp: Khắc phục không phát âm thanh

- [x] Tái hiện trên trình duyệt, ghi nhận trạng thái phần tử nhạc, AudioContext và lỗi play/resume sau thao tác Bắt đầu.
- [x] Sửa cơ chế khởi động nhạc nền và hiệu ứng để tương thích chính sách phát âm thanh của trình duyệt.
- [x] Xác minh mức âm lượng cũ 0% được tự khôi phục thành 50%, đồng thời giữ luồng phát nhạc/hiệu ứng gắn với thao tác đầu tiên của người chơi.
- [x] Kiểm tra TypeScript, build và lưu checkpoint sau khi âm thanh đã hoạt động.
