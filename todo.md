# Việc cần làm — Robot Hana hướng dẫn học tập

## Avatar riêng tư và tổng kết thích ứng

- [x] Thiết kế lại lưu trữ/hiển thị ảnh avatar để mỗi tệp mang phạm vi riêng theo người dùng hoặc phiên; không người chơi nào có thể xem ảnh riêng của người khác khi ứng dụng được public.
- [x] Đổi nhãn “Xem gợi ý Hana” thành “Xem gợi ý” và tăng phần nhắc kiểm tra kết quả bằng phương pháp phù hợp trong gợi ý.
- [x] Chuẩn hóa quy tắc typography/ngắt dòng để tiêu đề, lời nhắc và nội dung phản hồi không xuất hiện dòng chỉ còn một từ rời rạc.
- [x] Thiết kế lại toàn bộ màn tổng kết với phân cấp đồng bộ, khoảng cách tiêu đề hợp lý, lời chúc thay đổi theo điểm/số lỗi và avatar người chơi hiển thị tin cậy.
- [x] Kiểm thử đa người dùng/avatar riêng tư, VIE/ENG, tổng kết/ảnh kỷ niệm, desktop/mobile, TypeScript, hồi quy và production build; lưu checkpoint.
- [x] Áp dụng quy tắc chống dòng lẻ cho feedback banner, gợi ý Hana, hướng dẫn hồ sơ và các heading/action copy ngoài màn tổng kết.
- [x] Bổ sung kiểm tra trực quan desktop/mobile cho ngắt dòng ở các vùng chữ quan trọng trước khi bàn giao.
- [x] Rà soát và áp dụng chống dòng lẻ cho heading/nút/prompt quan trọng ở màn chào mừng, menu, hoạt động, thiết lập bài kiểm tra và bảng học.
- [x] Xác nhận trực quan có hệ thống desktop/mobile rằng vùng chữ trọng yếu không còn xuất hiện dòng chỉ một từ lẻ.
- [x] Chụp và rà soát desktop 1280px cho welcome, profile, start mode, activities, format, test setup, game, Hana dialog và summary sau batch typography cuối.
- [x] Bổ sung kiểm tra tự động cho sự hiện diện của quy tắc `text-wrap` tại các vùng chữ trọng yếu, rồi chạy lại build trước checkpoint.
- [x] Rà soát desktop/mobile cho Hướng dẫn, bảng Điểm hiện tại, xác nhận kết thúc/về đầu và tổng kết bài kiểm tra; chỉ hoàn tất khi heading/prompt/action không có dòng lẻ.
- [x] Bổ sung hồi quy typography cho các overlay giàu chữ còn lại và tinh chỉnh riêng nếu phát hiện ngắt dòng chưa tự nhiên.
- [x] Thêm hồi quy đo line box thực tế, phát hiện dòng cuối chỉ một từ cho heading/prompt/action quan trọng ở các overlay desktop/mobile.
- [x] Bổ sung hồi quy render orphan-line cho welcome, profile, start mode, activities, format, test setup, game và summary ở cả desktop/mobile.
- [x] Ghi nhận kết quả pass/fail theo từng màn chính cho heading, prompt và action copy trước khi xác nhận typography toàn app.
- [x] Lưu checkpoint mới cho batch avatar riêng tư, tổng kết thích ứng và hồi quy typography; ghi lại mã checkpoint để đối chiếu bàn giao (775d6259).

## Hoàn thiện bảng học và phản hồi desktop

- [x] Chuẩn hóa kích thước nhóm nút chọn bài tập và chừa khoảng hở rõ ràng giữa nút Điểm hiện tại với vùng nội dung bên dưới.
- [x] Thiết kế lại nền bảng bài tập để giữ họa tiết tròn ở các góc, không bị che bởi bo tròn hoặc lớp nội dung.
- [x] Rút gọn phản hồi đáp án sai thành trạng thái ngang, gọn; tránh câu dài làm giãn chiều cao màn hình.
- [x] Làm nổi bật đáp án sai học sinh đã chọn trong cửa sổ Hana bằng thẻ có màu, nhãn rõ và phân cấp thị giác tốt.
- [x] Thiết kế lại vùng kết quả sau trả lời để cân đối, dễ quét và nhất quán trên desktop/mobile; kiểm thử đầy đủ và lưu checkpoint.
- [x] Chuẩn hóa năm thẻ nhiệm vụ trong màn Luyện tập để chiều cao và cấu trúc nhất quán, không tạo cảm giác nút to nhỏ tùy nội dung.
- [x] Kiểm tra lại trực quan desktop/mobile màn Luyện tập sau khi chuẩn hóa thẻ, chỉ hoàn tất khi nhịp bố cục cân bằng.
- [x] Chạy hồi quy đầy đủ sau batch giao diện desktop cuối: TypeScript, build, phản hồi đúng/sai, gợi ý Hana và song ngữ.
- [x] Xác nhận riêng trạng thái kết quả đúng/sai trên desktop/mobile rồi lưu checkpoint cho đợt hoàn thiện bảng học/phản hồi.
- [x] Mở rộng hồi quy phản hồi để đặt viewport desktop và mobile, xác nhận banner đúng/sai cùng thẻ đáp án Hana ở cả hai kích thước.

## Rà soát thiết kế mobile chuyên sâu

- [x] Đánh giá nghiêm ngặt màn chào mừng, hồ sơ/avatar, bảng làm bài, tổng kết và ảnh kỷ niệm ở kích thước điện thoại; lập danh sách cải thiện theo mức ưu tiên.

## Gợi ý thực tế, huy hiệu rõ ràng và giao diện luyện tập chuyên nghiệp

- [x] Đối chiếu cách diễn giải phép nhân–chia cơ bản của sách giáo khoa Việt Nam; viết lại gợi ý theo hướng “số phần tử mỗi nhóm × số nhóm”, dùng ngữ cảnh quen thuộc và đa dạng mà không lộ đáp án.
- [x] Phân biệt rõ huy hiệu đã đạt và huy hiệu còn khóa bằng trạng thái mờ, biểu tượng khóa, độ tương phản và thông tin tiến độ dễ hiểu.
- [x] Thiết kế lại khu vực avatar: bốn lựa chọn minh họa đa dạng đặt ở hàng riêng, còn ảnh cá nhân là hành động tải lên tách biệt, rõ ràng và chuyên nghiệp.
- [x] Rà soát và tinh chỉnh các bảng tính/câu hỏi thành hệ bố cục gọn, dễ đọc, có khoảng cách chuẩn và phân biệt rõ thành phần có thể bấm.
- [x] Kiểm thử toàn diện VIE/ENG, nội dung toán, huy hiệu, avatar, desktop/mobile, TypeScript, hồi quy và production build; lưu checkpoint.

## Gợi ý phép nhân và bố cục rõ ràng toàn diện

- [x] Viết lại gợi ý phép nhân để giải thích ý nghĩa, quy trình làm và cách kiểm tra; cho phép nhiều bước hơn ở bài số lớn hoặc dạng khó.
- [x] Bỏ các chi tiết Hana trùng lặp trong bảng làm bài, chỉ giữ một lời dẫn ngắn đúng ngữ cảnh.
- [x] Thiết kế lại bộ chọn avatar theo ô tròn đồng nhất, loại bỏ khung chữ nhật thừa quanh lựa chọn ảnh cá nhân.
- [x] Điều chỉnh nền hành tinh/ký hiệu theo vùng an toàn để không đè lên bảng bài tập, hộp thoại hoặc tổng kết ở mọi kích thước.
- [x] Chuẩn hóa font và khoảng cách lời chúc tổng kết, đặc biệt nhãn Lượt học của và lời khen, để dễ đọc và cân đối.
- [x] Rà soát toàn diện desktop/mobile, VIE/ENG, gợi ý phép nhân, tổng kết, TypeScript, build và lưu checkpoint.
- [x] Cập nhật hồi quy avatar ảnh cá nhân theo ô tròn mới, kiểm tra tải lên, tải lại và đổi về avatar có sẵn.
- [x] Mở rộng hồi quy cửa sổ Hana để xác nhận phép nhân Thám hiểm hiển thị đủ bốn bước đặt tính mà không lộ đáp án.

## Trợ giúp Hana tự chọn và avatar ảnh cá nhân

- [x] Đổi phản hồi sai thành lựa chọn Thử lại ngay hoặc Xem gợi ý Hana; không tự động bắt học sinh đi qua từng bước.
- [x] Thiết kế lại ngân hàng gợi ý theo phép tính, dạng thường/tìm thành phần và độ khó; ưu tiên chiến lược phù hợp Toán lớp 3 GDPT 2018 thay vì một khuôn mẫu chung.
- [x] Bổ sung avatar ảnh cá nhân với giới hạn định dạng/kích thước, xem trước, cắt khung tròn và giữ nguyên bốn avatar có sẵn.
- [x] Kiểm thử VIE/ENG, thao tác sai–thử lại–xem gợi ý, các mức toán, lưu/đổi avatar, TypeScript, build và lưu checkpoint.
- [x] Hồi quy avatar ảnh cá nhân qua tải lại trang, đổi qua avatar có sẵn rồi chọn lại ảnh; sau đó lưu checkpoint cuối.

## QA nghiêm ngặt toàn diện

- [x] Kiểm thử tự động toàn bộ luồng câu hỏi, đáp án, bảng nhân/chia, bài kiểm tra, lưu phiên, ảnh kỷ niệm, VIE/ENG và xác nhận điều hướng.
- [x] Kiểm tra giao diện desktop/điện thoại, các lớp phủ, khả năng đọc, nút thao tác, WebGL dự phòng và âm thanh/điều khiển âm thanh.
- [x] Khắc phục và kiểm thử lại: chờ lưu ảnh kỷ niệm có giới hạn thời gian, điều khiển âm thanh/đổi ngôn ngữ trong Cài đặt, khung 320×568 và các hồi quy dùng selector đã bị thay thế.
- [x] Khắc phục cảnh báo trợ năng AlertDialog để mọi hộp thoại xác nhận có liên kết mô tả hợp lệ, không phát sinh warning trong console.
- [x] Lập báo cáo có bằng chứng, khắc phục mọi lỗi xác minh được, rồi chạy hồi quy TypeScript, production build và các kiểm thử liên quan.

## Wordmark bảng bài tập và chuẩn gợi ý Hana

- [x] Bỏ wordmark Học Toán Cùng Hana dư trong bảng bài tập, giữ logo cố định làm nhận diện chính.
- [x] Rà soát toàn bộ gợi ý Cộng, Trừ, Nhân, Chia, tìm thành phần và bảng nhân/chia theo phương pháp phù hợp Toán lớp 3 GDPT 2018.
- [x] Chỉnh các gợi ý chưa phù hợp, bổ sung kiểm thử nội dung VIE/ENG, TypeScript, production build và lưu checkpoint.

## Nút điểm và gợi ý Hana không minh họa

- [x] Làm Điểm hiện tại thành nút dễ nhận biết và rõ thao tác bấm mở tiến độ.
- [x] Khi chọn sai, bỏ hoàn toàn hình minh họa khỏi cửa sổ Hana; chỉ giữ ba bước gợi ý bằng chữ, không bài mẫu và không lộ đáp án.
- [x] Củng cố cụm nhiệm vụ bằng wordmark, Robot Hana và màu/ký hiệu phép tính nhất quán mà không làm che bài toán.
- [x] Kiểm thử VIE/ENG, bốn phép tính, màn hình điện thoại, TypeScript, production build và lưu checkpoint.

## Hành trình gọn và minh họa Hana theo câu

- [x] Di chuyển Loại bài tập và Mức độ khó xuống dưới dải Hành trình trong màn Cộng, Trừ, Nhân và Chia.
- [x] Rút gọn dải hiển thị đang học thành Điểm hiện tại và Cấp hành trình; giữ chi tiết huy hiệu trong bảng điểm khi bấm.
- [x] Tạo minh họa Hana dựa trên chính các số, phép tính và dạng bài của câu đang làm sai.
- [x] Kiểm thử VIE/ENG, nhiều dạng bài, điện thoại/desktop, TypeScript, production build và lưu checkpoint.

## Bộ chọn dạng bài và mức độ cố định

- [x] Bỏ hoàn toàn menu dạng bài sổ xuống trong màn Cộng, Trừ, Nhân và Chia.
- [x] Đặt Loại bài tập và Mức độ khó thành hai nhóm nút luôn hiện ở đầu buồng lái, có nhãn rõ ràng và không che nội dung.
- [x] Kiểm thử đổi dạng bài/độ khó, VIE/ENG, điện thoại/desktop, TypeScript, production build và lưu checkpoint.

## Triển khai cải tiến hành trình, luồng học và gợi ý Hana

- [x] Chuẩn hóa nhãn và tiến độ Cấp hành trình 1–100 với bốn huy hiệu Cấp 20/60/80/100 trên dải nhiệm vụ, bảng điểm, tổng kết và Hướng dẫn.
- [x] Rút ngắn lối vào Cộng/Trừ/Nhân/Chia bằng bài bình thường mặc định; thêm bộ đổi dạng bài ngay trong màn học.
- [x] Tạo cửa sổ Hana ba bước sau đáp án sai, có minh họa trực quan, bài mẫu, thử lại câu gốc và cơ chế tạm dừng bài kiểm tra công bằng.
- [x] Kiểm thử sâu câu hỏi–đáp án, điểm, mốc huy hiệu, bảng nhân–chia, timed test, lưu phiên, VIE/ENG, điện thoại/desktop và ảnh kỷ niệm.
- [x] Chạy TypeScript, production build, hồi quy tự động và lưu checkpoint.

## Kế hoạch cải tiến ưu tiên

- [x] Lập phương án làm rõ Cấp hành trình 1–100 và bốn huy hiệu chủ đề, tránh nhầm lẫn cho học sinh.
- [x] Lập phương án rút ngắn đường vào bài học mà vẫn giữ lựa chọn dạng bài khi cần.
- [x] Thiết kế luồng cửa sổ Hana hướng dẫn trực quan sau đáp án sai, gồm bước làm và ví dụ/hình minh họa theo phép tính.
- [x] Xác định tiêu chí bắt buộc không chồng lấn, không cuộn tìm thao tác chính trên màn hình điện thoại.

## Đánh giá trải nghiệm theo ba góc nhìn

- [x] Trải nghiệm các luồng chính với góc nhìn học sinh mới dùng, học sinh đã quen làm bài và phụ huynh quan sát.
- [x] Chấm điểm nội dung, đồ họa và độ hấp dẫn theo thang 10; nêu rõ bằng chứng quan sát cho từng điểm số.
- [x] Tổng hợp khuyết điểm và đề xuất cải thiện theo ưu tiên tác động tới trải nghiệm học sinh.

## Âm thanh đầu phiên và bảng nhân–chia trên điện thoại

- [x] Kiểm tra khởi tạo nhạc nền, trạng thái âm lượng và thao tác đầu tiên để học sinh nhận biết âm thanh đã sẵn sàng.
- [x] Thu gọn màn Học Bảng Nhân và Bảng Chia trên điện thoại để hai nút hành động cuối hiển thị trong vùng nhìn thấy.
- [x] Kiểm thử âm thanh, giao diện bảng nhân–chia ở điện thoại, TypeScript, production build và lưu checkpoint.

## Rà soát chồng lấn toàn giao diện

- [x] Kiểm tra màn chào mừng, hồ sơ, chọn Luyện tập/Bài kiểm tra, menu nhiệm vụ và chọn dạng bài trên desktop lẫn điện thoại.
- [x] Sửa riêng luồng Luyện Tập → chọn nhiệm vụ để nút Trở về, logo cố định, hành tinh và thẻ lựa chọn luôn có vùng an toàn độc lập.
- [x] Rà soát bảng nhân–chia, bài kiểm tra, màn làm bài, tổng kết và toàn bộ cửa sổ phủ để không có chữ, nút hoặc hình ảnh chồng lấn.
- [x] Kiểm thử trực quan các màn chính ở desktop/mobile, TypeScript, production build và lưu checkpoint.

## Vùng an toàn cửa sổ và hệ điểm–huy hiệu

- [x] Thiết lập vùng an toàn chung phía trên cho Hướng dẫn, bảng điểm, xác nhận kết thúc, xác nhận về trang đầu và lớp mở khóa hành tinh; không cửa sổ nào được che logo hoặc Cài đặt.
- [x] Loại bỏ thông báo/phần thưởng xuất hiện sau từng câu đúng; giữ điểm cơ bản +10/−2, thanh điểm và các mốc huy hiệu Cấp 20/60/80/100.
- [x] Rà soát và viết lại Hướng dẫn, bảng điểm, tổng kết cùng các thông điệp liên quan để phản ánh logic điểm–huy hiệu mới nhất quán.
- [x] Kiểm thử mobile/desktop, luồng làm đúng–sai, mở huy hiệu, TypeScript, production build và lưu checkpoint.

## Chọn dạng bài và quà thưởng mới

- [x] Rà soát luồng vào bốn phép tính và xác định tất cả nhãn, biến, hiệu ứng Tinh thể cũ.
- [x] Tạo màn chọn Dạng Bài trước câu hỏi, mặc định Bình thường, cho Cộng, Trừ, Nhân, Chia.
- [x] Loại bỏ hoàn toàn Tinh thể cũ và thay bằng điểm, huy hiệu cùng quà thưởng trực quan.
- [x] Kiểm tra tính điểm, mốc mở quà, kết thúc lượt và tải ảnh kỷ niệm; sửa lỗi nếu có.
- [x] Kiểm thử giao diện mới trên máy tính, điện thoại, lưu checkpoint và bàn giao.

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

- [x] Dịch toàn bộ phản hồi đúng/sai, gợi ý và nút hành động của Robot Hana sang English theo ngôn ngữ đang dùng.
- [x] Điều chỉnh Bảng Nhân và Chia để chỉ sinh câu hỏi sau khi người chơi đã chọn ít nhất một bảng.
- [x] Bảo đảm mỗi thay đổi bảng hoặc kiểu luyện sinh một câu hỏi mới với bộ đáp án mới.
- [x] Kiểm tra tự động số lượng lớn câu hỏi cộng, trừ, nhân, chia và bảng nhân–chia để xác minh đáp án đúng luôn nằm trong lựa chọn.
- [x] Kiểm thử trực quan luồng chọn bảng, đổi bảng, trả lời đúng/sai trên desktop/mobile; dựng bản phát hành và lưu checkpoint.

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

## Nhận diện phép Nhân và kết thúc lượt

- [x] Thay biểu tượng phép Nhân trong menu bằng hình dễ phân biệt với dấu nhân.
- [x] Thêm nút Kết thúc lượt nổi bật ở cuối khu vực câu hỏi/đáp án và giữ luồng tổng kết hiện có.
- [x] Kiểm tra bố cục desktop/mobile, TypeScript và build trước khi lưu checkpoint.

## Sửa biểu tượng và vị trí bảng làm bài

- [x] Khôi phục biểu tượng cũ của Cộng, Trừ, Nhân, Chia và bỏ phần nền hình học bên dưới.
- [x] Căn bảng làm bài vào giữa màn hình và nâng lên cao hơn trên desktop/mobile.
- [x] Kiểm tra trực quan, TypeScript và build trước khi lưu checkpoint.

## Tự thu gọn thanh menu khi làm bài

- [x] Tự thu gọn thanh menu trên cùng khi học sinh bắt đầu tương tác với câu hỏi.
- [x] Thêm nút nhỏ dễ thấy để mở lại thanh menu và giữ truy cập đến điểm, đổi nhiệm vụ, kết thúc lượt.
- [x] Kiểm tra luồng trả lời, desktop/mobile, TypeScript và build trước khi lưu checkpoint.

## Sửa đồng bộ điểm và thanh điều khiển

- [x] Tái hiện điểm hiện tại không cập nhật và xác định hai vị trí hiển thị bị trùng.
- [x] Chỉ giữ một hiển thị điểm hiện tại, bảo đảm cập nhật ngay sau đáp án đúng/sai.
- [x] Bỏ ký hiệu thừa cạnh điều khiển đổi ngôn ngữ và kiểm tra bố cục thanh trên.
- [x] Kiểm thử hành trình trả lời, TypeScript, build và giao diện desktop/mobile trước khi lưu checkpoint.

## Điều khiển nhiệm vụ trên điện thoại

- [x] Đặt Đổi nhiệm vụ và Kết thúc lượt ở vùng điều khiển dễ thấy, dễ chạm trên điện thoại.
- [x] Giữ các điều khiển này khả dụng khi thanh menu trên cùng tự thu gọn.
- [x] Kiểm tra luồng đổi nhiệm vụ/kết thúc lượt, bố cục desktop/mobile, TypeScript và build trước khi lưu checkpoint.

## Xác nhận kết thúc lượt

- [x] Hiển thị hộp thoại xác nhận thân thiện trước khi kết thúc lượt ở mọi vị trí điều khiển.
- [x] Hiển thị nhanh điểm, số câu đúng và số câu sai hiện tại; dịch đầy đủ Tiếng Việt/English.
- [x] Cho phép quay lại học tiếp hoặc xác nhận kết thúc, sau đó kiểm tra desktop/mobile, TypeScript và build.

## Tập trung vào bảng tính

- [x] Bỏ nút Kết thúc lượt trùng lặp, chỉ giữ một cụm điều khiển nhiệm vụ ở phía dưới bảng làm bài.
- [x] Chuyển Đổi nhiệm vụ và Kết thúc lượt xuống cuối bảng, đảm bảo vẫn dễ chạm trên điện thoại.
- [x] Thu gọn phần đầu màn, giảm vai trò Robot Hana khi đang làm bài và đưa bảng tính lên cao hơn.
- [x] Kiểm tra trực quan desktop/mobile, thao tác kết thúc lượt, TypeScript và build trước khi lưu checkpoint.

## Sửa trạng thái chọn bảng nhân và chia

- [x] Tái hiện nhãn “Chưa chọn bảng” không đổi sau khi học sinh chọn bảng.
- [x] Đồng bộ nhãn trạng thái và câu hỏi với danh sách bảng nhân/chia đã chọn.
- [x] Kiểm thử chọn một, nhiều, tất cả và bỏ chọn bảng trên desktop/mobile; chạy TypeScript và build.

## Rà soát nghiêm ngặt trước phát hành

- [x] Đối chiếu luồng học, chuyển màn, tính điểm, phần thưởng, ngôn ngữ, âm thanh và lưu ảnh với yêu cầu sản phẩm.
- [x] Kiểm tra tính hợp lệ câu hỏi/đáp án, tình huống biên và trạng thái thay đổi nhiệm vụ/bảng nhân–chia.
- [x] Rà soát desktop/mobile, trợ năng bàn phím, văn bản, vùng chạm, hiệu năng tải và lỗi console.
- [x] Tổng hợp các lỗi cùng cơ hội cải thiện theo mức độ ưu tiên và bằng chứng kiểm thử.

## Hoàn thiện sau rà soát

- [x] Làm mới câu hỏi khi bỏ chọn rồi chọn lại cùng bảng; đồng bộ lời dẫn với bảng/chế độ đang chọn.
- [x] Sửa phản hồi thành công khi lưu ảnh kỷ niệm và loại bỏ nguy cơ bộ dịch ghi đè văn bản động.
- [x] Làm rõ Bài kiểm tra: khóa cấp độ, xử lý đáp án sai công bằng và giữ ý nghĩa điểm kiểm tra.
- [x] Lưu/khôi phục lượt học, chỉ tính thời gian học chủ động và tăng vùng chạm bảng nhân–chia trên mobile.
- [x] Hoàn thiện tham số ngôn ngữ deep link, cập nhật kiểm thử không phụ thuộc thứ tự và tách tải Babylon để giảm tải đầu trang.
- [x] Kiểm thử đầy đủ câu hỏi, trạng thái, song ngữ, ảnh kỷ niệm, desktop/mobile, TypeScript và build trước khi lưu checkpoint.

## Hoàn thiện bản English

- [x] Kiểm kê nội dung tiếng Việt còn lẫn vào khi chọn ENG: hướng dẫn, wordmark, ví dụ, bảng nhân–chia và lời Hana.
- [x] Dịch tự nhiên toàn bộ văn bản English, bao gồm “tables”, hướng dẫn chọn bảng và các gợi ý khi trả lời sai.
- [x] Kiểm thử English trên màn chào mừng, Hướng dẫn, bảng nhân–chia và phản hồi đáp án sai; chạy TypeScript và build.

## Hoàn thiện màn tổng kết English

- [x] Kiểm kê toàn bộ nhãn, phần thưởng, lời Hana và nút còn tiếng Việt ở màn tổng kết khi chọn ENG.
- [x] Dịch trực tiếp tất cả nội dung tổng kết và bảo vệ chúng khỏi bộ dịch DOM ghi đè trạng thái React.
- [x] Kiểm thử màn tổng kết English, TypeScript và build trước khi lưu checkpoint.

## Tối giản màn tổng kết

- [x] Bỏ nút chuyển đổi ngôn ngữ riêng trên màn tổng kết.
- [x] Kiểm tra bố cục tổng kết trên điện thoại và desktop sau khi loại bỏ điều khiển.

## Sửa khẩu hiệu English

- [x] Thay khẩu hiệu English ở màn chào mừng bằng câu tự nhiên, đúng ý “Cùng Hana ôn toán học”.
- [x] Kiểm tra giao diện màn chào mừng English, TypeScript và build trước khi lưu checkpoint.

## Luồng Luyện Tập và Bài Kiểm Tra theo thời gian

- [x] Sửa khẩu hiệu English thành “Learn Math with Hana”.
- [x] Thêm màn chọn Luyện Tập hoặc Bài Kiểm Tra khi bắt đầu.
- [x] Chuyển Cộng, Trừ, Nhân, Chia và Bảng nhân–chia vào nhánh Luyện Tập.
- [x] Tạo cấu hình Bài Kiểm Tra: thời gian 2/5/10 phút và ba cấp độ.
- [x] Thêm đồng hồ đếm ngược, chuỗi câu hỏi liên tục và kết thúc tự động khi hết giờ.
- [x] Bổ sung tổng kết kiểm tra gồm thời gian/cấp độ đã chọn, số câu đúng/sai và điểm.
- [x] Kiểm thử logic, desktop/mobile, song ngữ, TypeScript và build trước khi lưu checkpoint.

## Rà soát ENG sau luồng Bài Kiểm Tra

- [x] Kiểm kê các chuỗi còn tiếng Việt trong màn chọn nhiệm vụ, cấu hình Bài Kiểm Tra, màn làm bài và tổng kết khi chọn ENG.
- [x] Sửa mọi chuỗi, lời Robot Hana, nhãn đồng hồ và nút hành động để hiển thị English nhất quán.
- [x] Kiểm thử tự động và trực quan ENG trên desktop/mobile, dựng bản phát hành và lưu checkpoint.

## Rà soát toàn diện và hoàn thiện trải nghiệm

- [x] Kiểm tra kỹ thuật: kiểu dữ liệu, trạng thái, luồng điều hướng, lỗi console, hiệu năng và các phần mã dư thừa.
- [x] Rà soát toàn bộ English ở luồng chào mừng, luyện tập, bảng nhân–chia, Bài Kiểm Tra, hướng dẫn, phản hồi Hana và tổng kết.
- [x] Đánh giá đồ họa, độ tương phản, thứ bậc thị giác, kích thước chữ và vùng chạm trên desktop/mobile.
- [x] Chơi thử toàn bộ hành trình theo góc nhìn học sinh lớp 3; ghi nhận điểm gây khó hiểu hoặc cần nhiều thao tác.
- [x] Sửa các vấn đề ưu tiên, kiểm thử hồi quy, dựng sản phẩm và lưu checkpoint bàn giao.

## Đổi nhận diện Học Toán Cùng Hana và tăng khả năng đọc

- [x] Kiểm kê và thay toàn bộ tên “Phi Hành Tinh Phép Tính”/“Math Planet Adventure” ở mã nguồn, tiêu đề, thẻ ảnh kỷ niệm và kiểm thử.
- [x] Áp dụng tên “Học Toán Cùng Hana” khi chọn VIE và “Learn Math with Hana” khi chọn ENG trên mọi màn hình.
- [x] Rà soát cỡ chữ, khoảng cách, độ tương phản và vùng đặt chữ trên nền ở desktop/mobile; tinh chỉnh để học sinh lớp 3 đọc dễ dàng.
- [x] Kiểm thử song ngữ, chụp giao diện, dựng bản phát hành và lưu checkpoint.

## Chuẩn hóa tiêu đề và logo phi thuyền

- [x] Đổi tiêu đề lớn ở màn bắt đầu thành Học Toán Cùng Hana/Learn Math with Hana theo ngôn ngữ đang chọn.
- [x] Bỏ nhãn thương hiệu nhỏ trùng lặp phía trên tiêu đề lớn ở màn bắt đầu.
- [x] Kiểm kê và thay các biến thể biểu tượng cũ để mọi màn dùng cùng logo phi thuyền.
- [x] Kiểm tra desktop/mobile, TypeScript, bản dựng và lưu checkpoint.

## Tinh chỉnh Luyện Tập và đồng bộ ENG/VIE

- [x] Kiểm kê kích thước, khoảng cách và độ ưu tiên của các lựa chọn trong nhánh Luyện Tập trên desktop/mobile.
- [x] Thu gọn các lựa chọn thành thẻ nhiều màu sắc, rõ ràng, đủ vùng chạm nhưng không chiếm quá nhiều không gian.
- [x] Rà soát chuyển VIE/ENG ở từng màn và sửa mọi nhãn, mô tả, aria-label hoặc nội dung động còn không đồng bộ.
- [x] Kiểm thử trực quan, hồi quy English/Vietnamese, TypeScript, build và lưu checkpoint.

## Nhạc nền và Cài đặt chung

- [x] Kiểm tra chính sách phát nhạc nền, trạng thái âm lượng và thời điểm thao tác đầu tiên để tái hiện lỗi không nghe thấy nhạc.
- [x] Sửa luồng kích hoạt nhạc nền để phát ổn định sau thao tác người dùng đầu tiên mà vẫn tôn trọng cài đặt đã lưu.
- [x] Tạo nút Cài đặt bánh răng xuất hiện trên tất cả màn, gom lựa chọn VIE/ENG, Hướng dẫn và Âm thanh.
- [x] Kiểm thử mở/đóng Cài đặt, đổi ngôn ngữ, âm lượng/nhạc và giao diện desktop/mobile; dựng bản phát hành và lưu checkpoint.

## Tối giản bảng bài tập và chống chồng lấn

- [x] Kiểm kê logo/tên ứng dụng và nút quay lại trên từng màn để xác định mọi vị trí có thể chồng lấn.
- [x] Bỏ nhãn thừa trong bảng làm bài, sửa Robot Hana trùng lặp hoặc che chữ và tăng khoảng trắng nội dung.
- [x] Làm rõ nhãn/chỉ dẫn cho chọn bảng nhân–chia và thêm nhãn Cấp độ cho ba mức kiểm tra.
- [x] Kiểm tra trực quan desktop/mobile, TypeScript, build và lưu checkpoint.

## Điều hướng logo và bố cục nút quay lại

- [x] Kiểm kê thành phần logo, các nút Trở về, Cài đặt và cơ chế xóa/làm mới phiên hiện có.
- [x] Biến logo cố định góc trái thành nút về màn đầu với hộp thoại xác nhận hủy điểm/lượt đang làm.
- [x] Canh giữa các nút Trở về trên màn phụ và ẩn Cài đặt ở màn tổng kết.
- [x] Kiểm thử xác nhận đồng ý/hủy, giao diện desktop/mobile, TypeScript, build và lưu checkpoint.

## Xác nhận logo theo ngữ cảnh

- [x] Phân loại màn điền tên, phiên chưa có điểm và phiên có điểm/tiến độ để chọn nội dung xác nhận phù hợp.
- [x] Ở màn điền tên và phiên chưa có điểm, chỉ hỏi có quay về màn đầu; ở phiên có điểm/tiến độ mới cảnh báo bỏ lượt.
- [x] Thiết kế lại hộp thoại với phân cấp màu, biểu tượng và nút lựa chọn dễ hiểu cho học sinh lớp 3.
- [x] Kiểm thử tất cả nhánh logo trên desktop/mobile, TypeScript, build và lưu checkpoint.

## Đánh giá và cải tiến đồ họa toàn diện

- [x] Chơi thử và đánh giá trực quan các màn chào mừng, hồ sơ, lựa chọn, luyện tập, kiểm tra và tổng kết trên desktop/mobile.
- [x] Lập danh sách cải tiến về nhịp bố cục, điểm nhấn màu sắc, độ cân đối, minh họa và trạng thái thao tác cho học sinh lớp 3.
- [x] Áp dụng một lượt thiết kế tổng thể theo danh sách, giữ hệ nhận diện Hana và không làm giảm khả năng đọc.
- [x] Kiểm tra trực quan, TypeScript, build và lưu checkpoint giao diện hoàn thiện.

## Avatar, mở khóa hành tinh và huy hiệu chủ đề

- [x] Thiết kế bộ avatar phi hành gia, bộ huy hiệu chủ đề và các mốc điểm/thành tích phù hợp học sinh lớp 3.
- [x] Thêm chọn avatar ở màn điền tên và lưu lựa chọn trong lượt học/ảnh kỷ niệm.
- [x] Thêm huy hiệu theo chủ đề nhận sau lượt đạt điểm cao và hiển thị rõ ở tổng kết.
- [x] Tạo hiệu ứng mở khóa hành tinh khi đạt thành tích xuất sắc, có hỗ trợ giảm chuyển động.
- [x] Kiểm thử desktop/mobile, luồng phần thưởng, TypeScript, build và lưu checkpoint.

## Tinh gọn giao diện và loại bỏ điều khiển dư thừa

- [x] Loại bỏ toàn bộ trạng thái, nút, kiểu dáng và xử lý ẩn/hiện thanh menu cũ trong màn làm bài.
- [x] Rà soát tất cả màn để lập danh sách thành phần, nhãn, hành động hoặc thông tin bị trùng lặp, không còn tác dụng hay làm phân tán học sinh.
- [x] Giữ lại duy nhất các điều khiển cần thiết cho từng ngữ cảnh; gộp hoặc loại bỏ phần dư thừa mà không ảnh hưởng điểm, đổi nhiệm vụ, kết thúc lượt, cài đặt và điều hướng logo.
- [x] Xóa mã, CSS, tham số xem trước và kiểm thử không còn được sử dụng sau khi dọn dẹp; cập nhật kiểm thử liên quan.
- [x] Kiểm thử các luồng học, desktop/mobile, TypeScript, production build và lưu checkpoint.

## Cập nhật avatar Hệ Mặt Trời và ảnh kỷ niệm

- [x] Thay bốn avatar hiện tại bằng các hành tinh gần gũi trong Hệ Mặt Trời, gồm một lựa chọn Phi hành gia Trái Đất rõ ràng.
- [x] Cập nhật tên, mô tả, tài sản avatar, lưu lựa chọn cũ an toàn và hiển thị nhất quán ở hồ sơ/tổng kết/ảnh kỷ niệm.
- [x] Đổi mọi nhãn “Học Bảng Nhân và Chia” thành “Học Bảng Nhân và Bảng Chia” cùng bản English tương ứng.
- [x] Thiết lập vùng an toàn cho bảng làm bài, không chồng lấn logo góc trái hoặc nút Cài đặt góc phải trên desktop/mobile.
- [x] Thiết kế lại ảnh PNG kỷ niệm để có bố cục giàu hình ảnh, số liệu rõ ràng, avatar, huy hiệu và nền không gian thống nhất với màn tổng kết.
- [x] Kiểm thử lưu ảnh PNG thực tế, các luồng VIE/ENG, desktop/mobile, TypeScript, build và lưu checkpoint.

## Avatar học sinh, huy hiệu cấp điểm và ảnh kỷ niệm cân đối

- [x] Tạo bộ bốn avatar dễ thương gồm hai bé trai và hai bé gái, có phong cách thống nhất với Robot Hana và thân thiện học sinh lớp 3.
- [x] Chuyển đổi an toàn lựa chọn avatar Hệ Mặt Trời đã lưu sang bộ avatar học sinh mới; cập nhật hồ sơ, tổng kết và ảnh kỷ niệm.
- [x] Điều chỉnh bốn huy hiệu chủ đề theo đúng mốc phần thưởng cấp 20, 60, 80 và 100; cập nhật hiệu ứng mở khóa, tổng kết và bộ sưu tập.
- [x] Đổi nhãn bốn hành tinh thành Hành Tinh Phép Cộng, Hành Tinh Phép Trừ, Hành Tinh Phép Nhân và Hành Tinh Phép Chia, gồm cả bản English.
- [x] Thiết kế lại thẻ PNG kỷ niệm để cân đối hơn giữa vùng nhận diện, chân dung, số liệu, phần thưởng và huy hiệu.
- [x] Kiểm thử avatar, mốc điểm, VIE/ENG, hiệu ứng, desktop/mobile, PNG tải thực tế, TypeScript, build và lưu checkpoint.

## Làm lại avatar, Hướng dẫn và rà soát toàn diện

- [x] Thay bộ chọn “bạn đồng hành” thành chọn avatar đại diện người chơi; bỏ tên cố định của avatar và mọi ngôn ngữ khiến avatar bị hiểu là nhân vật khác.
- [x] Thay bốn tài sản avatar lỗi bằng một bộ avatar học sinh ổn định, đồng nhất về phong cách, có phương án dự phòng hiển thị rõ ràng khi ảnh chưa tải.
- [x] Viết lại Hướng dẫn theo luồng hiện tại: tạo hồ sơ, chọn hoạt động/dạng bài, trả lời, điểm thưởng/trừ điểm, 100 cấp phần thưởng, bốn huy hiệu, đổi nhiệm vụ và lưu ảnh kỷ niệm.
- [x] Thực hiện rà soát QA toàn app: liệt kê lỗi, nội dung không nhất quán, thao tác dư thừa, trạng thái biên và mã/CSS mồ côi; sửa các mục có ảnh hưởng thực tế.
- [x] Thực hiện rà soát thiết kế đồ họa toàn app: liệt kê vấn đề về phân cấp, căn chỉnh, tỷ lệ, màu, khoảng trắng, độ tương phản và trạng thái responsive; áp dụng một lượt đổi mới giao diện tổng thể.
- [x] Kiểm thử lại toàn bộ luồng VIE/ENG, desktop/mobile, lưu ảnh PNG, TypeScript, build và lưu checkpoint.

## Tinh chỉnh bố cục avatar và huy hiệu

- [x] Bỏ nền thẻ chữ nhật bao quanh từng avatar; bố trí bốn avatar tròn cân đối, vùng chạm rõ và trạng thái chọn tinh tế.
- [x] Căn lề trái nhất quán các nhãn, tên và mô tả huy hiệu trên màn tổng kết; giảm chi tiết dư thừa để hàng huy hiệu gọn, dễ quét.
- [x] Kiểm thử desktop/mobile, TypeScript, production build và lưu checkpoint.
