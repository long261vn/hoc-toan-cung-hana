/**
 * Session rules for the child-friendly reward loop. Rewards are derived from
 * the current round score, so a round always remains transparent and fair.
 */

export type PracticeFormat = "standard" | "missing" | "mixed";

export const practiceFormatMeta: Record<PracticeFormat, { label: string; shortLabel: string }> = {
  standard: { label: "Bài bình thường", shortLabel: "Bình thường" },
  missing: { label: "Tìm thành phần", shortLabel: "Tìm thành phần" },
  mixed: { label: "Cả hai", shortLabel: "Cả hai" },
};

export interface SessionReward {
  id: string;
  level: number;
  label: string;
  detail: string;
  threshold: number;
  symbol: string;
}

const rewardNames = [
  "Thẻ Khởi Động", "Nhãn dán Sao Nhỏ", "Kính Ngắm Vũ Trụ", "Huy hiệu Nhà Thám Hiểm", "La Bàn Sao",
  "Mũ Phi Hành Gia", "Cúp Phi Công Nhí", "Cờ Sao Sáng", "Vé Bay Thiên Hà", "Huy hiệu Tăng Tốc",
  "Sổ Tay Tính Nhẩm", "Ống Nhòm Quỹ Đạo", "Huy chương Bền Bỉ", "Hành Tinh Bạn Bè", "Ngôi Sao Khéo Léo",
  "Radar Toán Học", "Huy hiệu Tia Chớp", "Huy chương Ánh Sao", "Mũ Trưởng Nhóm", "Hành Tinh Lấp Lánh",
  "La Bàn Thông Thái", "Giấy Khen Tự Tin", "Tên Lửa Dũng Cảm", "Huy hiệu Siêu Nhẩm", "Bản Đồ Ngân Hà",
  "Cúp Sao Băng", "Khiên Chinh Phục", "Vương Miện Quỹ Đạo", "Huy chương Thiên Hà", "Cúp Thuyền Trưởng Nhí",
  "Hạt Sao May Mắn", "Hộp Bút Tinh Tú", "Đèn Hiệu Sao", "Bộ Đàm Vũ Trụ", "Huy hiệu Siêng Năng",
  "Mặt Nạ Sao Chổi", "Hành Tinh Kẹo Ngọt", "Sổ Tay Bí Mật", "Ống Nghe Thiên Hà", "Cúp Mây Vàng",
  "Ngôi Sao Vững Vàng", "Tên Lửa Nhanh Nhẹn", "La Bàn Dũng Sĩ", "Huy chương Tinh Mắt", "Hành Tinh Rực Rỡ",
  "Huy hiệu Sáng Tạo", "Mũ Bảo Hộ Sao", "Vé Thăm Sao Hỏa", "Hộp Nhạc Ngân Hà", "Cúp Vươn Xa",
  "Sao Băng Lém Lỉnh", "Kính Thần Kỳ", "Bản Đồ Bí Ẩn", "Tín Hiệu Vàng", "Huy hiệu Nỗ Lực",
  "Tàu Con Thoi Nhỏ", "Huy chương Can Đảm", "Hành Tinh Xanh Biếc", "Cờ Đội Hana", "Cúp Ngôi Sao Ấm Áp",
  "La Bàn Kiên Trì", "Ống Nhòm Sắc Sảo", "Tên Lửa Chăm Chỉ", "Huy hiệu Trí Nhớ", "Sao Nhỏ Thông Minh",
  "Mặt Trăng Nụ Cười", "Sổ Tay Nhà Toán Học", "Giày Bay Quỹ Đạo", "Huy chương Tự Hào", "Cúp Bạn Nhỏ Xuất Sắc",
  "Sao Kim Dũng Cảm", "Chuông Gió Vũ Trụ", "Khiên Ánh Sáng", "Hành Tinh Mơ Mộng", "Huy hiệu Tỏa Sáng",
  "Tên Lửa Vượt Gió", "Mũ Chỉ Huy Nhỏ", "Bản Đồ Kho Báu", "Cúp Phép Tính Hay", "Ngôi Sao Siêu Tốc",
  "Huy chương Nhà Phát Minh", "La Bàn Sao Bắc Đẩu", "Kính Quan Sát Tinh Tường", "Hành Tinh Kỳ Diệu", "Huy hiệu Bứt Phá",
  "Tàu Thám Hiểm Dũng Mãnh", "Cờ Chinh Phục Vàng", "Cúp Bầu Trời Sao", "Vương Miện Sao Sáng", "Huy chương Thiên Tài Nhí",
  "Sao Băng Vinh Quang", "Hộp Quà Ngân Hà", "Khiên Thuyền Trưởng", "Tên Lửa Ước Mơ", "Cúp Chinh Phục Tối Cao",
  "Huy hiệu Huyền Thoại Nhí", "Hành Tinh Danh Dự", "Vương Miện Thiên Hà", "Huy hiệu 99 Chòm Sao", "Cúp Thuyền Trưởng Hana",
] as const;

const rewardSymbols = ["✦", "★", "◉", "✧", "◒", "♛", "⚑", "✷", "✹", "✎", "◌", "❖", "◍", "◈", "ϟ", "✺", "◎", "✪", "➤", "✣", "⌁", "☄", "⬟", "♕", "✵"] as const;

function rewardDetail(level: number) {
  if (level === 1) return "Bạn đã khởi động chuyến học thật tốt.";
  if (level === 100) return "Bạn đã chinh phục trọn bộ 100 cấp phần thưởng cùng Hana!";
  if (level % 10 === 0) return `Bạn đã chạm cột mốc ${level * 10} điểm thật ấn tượng.`;
  return "Bạn đang tiến thêm một bước trên chuyến bay toán học.";
}

export const sessionRewards: SessionReward[] = rewardNames.map((label, index) => {
  const level = index + 1;
  return {
    id: `reward-${level}`,
    level,
    label,
    detail: rewardDetail(level),
    threshold: level * 10,
    symbol: rewardSymbols[index % rewardSymbols.length],
  };
});

export function rewardsForPoints(points: number) {
  return sessionRewards.filter((reward) => points >= reward.threshold);
}

export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
