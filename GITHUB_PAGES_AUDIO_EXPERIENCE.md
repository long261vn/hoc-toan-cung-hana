# Xác minh trải nghiệm âm thanh GitHub Pages

Workflow GitHub Pages `32557213297` đã triển khai thành công bản cải tiến âm thanh.

Khi tải mới trong Chromium, trình duyệt chặn phát nhạc có tiếng tự động: phần tử audio đã nạp xong (`readyState: 4`) nhưng ở trạng thái `paused: true`, `muted: false`, `playbackState: awaiting-gesture`. Đây là chính sách autoplay của trình duyệt, không phải lỗi tệp nhạc hoặc đường dẫn.

Sau thao tác **Bắt đầu** đầu tiên, cùng phần tử audio chuyển thành `paused: false`, `muted: false`, `volume: 0.5`, `playbackState: playing` và không có lỗi media. Game thử autoplay có tiếng trước; nếu bị chặn, nhạc được chuẩn bị để cử chỉ đầu tiên bật ngay. Hiệu ứng tap nhẹ cũng được áp dụng cho button/liên kết chưa có hiệu ứng riêng; các thao tác đúng, sai, khởi động và phần thưởng giữ âm riêng, không bị chồng lặp.
