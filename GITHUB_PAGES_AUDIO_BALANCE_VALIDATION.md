# Xác minh cân bằng âm thanh GitHub Pages

Workflow GitHub Pages `32558057245` triển khai thành công phiên bản cân bằng âm thanh mới.

Trên bản công khai, cài đặt lưu trữ đã được nâng từ phiên bản `2` lên `3`: `hana-music-volume` là `18`, `hana-effects-volume` là `70`. Điều này xác nhận người dùng còn ở mức mặc định cũ 50/50 nhận được nhạc nền êm hơn và hiệu ứng rõ hơn. Các mức âm riêng vẫn có thể điều chỉnh trong Cài đặt.

Nút **Nghe thử hiệu ứng** đã xuất hiện trong Cài đặt trên GitHub Pages. Sau khi bấm, trạng thái runtime là `hanaLastEffect: correct`, `hanaEffectState: playing`, âm thanh tổng đang bật và mức hiệu ứng là `70`; không có lỗi console. Điều này xác nhận thao tác Cài đặt đã kích hoạt thành công bộ tạo Web Audio của game.
