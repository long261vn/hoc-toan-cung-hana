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

export const sessionRewards: SessionReward[] = [
  { id: "launch-card", level: 1, label: "Thẻ Khởi Động", detail: "Bạn đã mở đầu chuyến học thật tốt.", threshold: 10, symbol: "✦" },
  { id: "little-star", level: 2, label: "Nhãn dán Sao Nhỏ", detail: "Bạn đã có 2 câu đúng thật nhanh.", threshold: 20, symbol: "★" },
  { id: "space-viewer", level: 3, label: "Kính Ngắm Vũ Trụ", detail: "Bạn quan sát bài toán rất chăm chú.", threshold: 30, symbol: "◉" },
  { id: "explorer", level: 4, label: "Huy hiệu Nhà Thám Hiểm", detail: "Bạn đã chinh phục 4 câu đúng.", threshold: 40, symbol: "✦" },
  { id: "star-compass", level: 5, label: "La Bàn Sao", detail: "Bạn đã tìm đúng hướng tính toán.", threshold: 50, symbol: "✧" },
  { id: "astronaut-helmet", level: 6, label: "Mũ Phi Hành Gia", detail: "Bạn đã sẵn sàng cho nhiệm vụ khó hơn.", threshold: 60, symbol: "◒" },
  { id: "junior-pilot", level: 7, label: "Cúp Phi Công Nhí", detail: "Bạn đã hoàn thành 7 câu đúng trong lượt này.", threshold: 70, symbol: "♛" },
  { id: "bright-flag", level: 8, label: "Cờ Sao Sáng", detail: "Bạn đã cắm cờ ở một mốc mới.", threshold: 80, symbol: "⚑" },
  { id: "galaxy-ticket", level: 9, label: "Vé Bay Thiên Hà", detail: "Bạn đã bay xa bằng những phép tính đúng.", threshold: 90, symbol: "✷" },
  { id: "speed-badge", level: 10, label: "Huy hiệu Tăng Tốc", detail: "Bạn đã đạt 100 điểm trong lượt học.", threshold: 100, symbol: "✹" },
  { id: "mental-notebook", level: 11, label: "Sổ Tay Tính Nhẩm", detail: "Bạn đã tính ngày càng nhanh hơn.", threshold: 110, symbol: "✎" },
  { id: "orbit-scope", level: 12, label: "Ống Nhòm Quỹ Đạo", detail: "Bạn đã nhìn rõ các bước làm bài.", threshold: 120, symbol: "◌" },
  { id: "steady-medal", level: 13, label: "Huy chương Bền Bỉ", detail: "Bạn đã kiên trì qua nhiều nhiệm vụ.", threshold: 130, symbol: "❖" },
  { id: "friend-planet", level: 14, label: "Hành Tinh Bạn Bè", detail: "Hana rất vui vì được học cùng bạn.", threshold: 140, symbol: "◍" },
  { id: "clever-star", level: 15, label: "Ngôi Sao Khéo Léo", detail: "Bạn đã dùng cách tính rất thông minh.", threshold: 150, symbol: "✧" },
  { id: "math-radar", level: 16, label: "Radar Toán Học", detail: "Bạn đã phát hiện đáp án đúng rất nhanh.", threshold: 160, symbol: "◈" },
  { id: "lightning-badge", level: 17, label: "Huy hiệu Tia Chớp", detail: "Bạn đang có tốc độ thật ấn tượng.", threshold: 170, symbol: "ϟ" },
  { id: "starlight-medal", level: 18, label: "Huy chương Ánh Sao", detail: "Bạn làm sáng cả bầu trời bài học.", threshold: 180, symbol: "✺" },
  { id: "team-captain", level: 19, label: "Mũ Trưởng Nhóm", detail: "Bạn đã dẫn dắt lượt học rất tự tin.", threshold: 190, symbol: "◐" },
  { id: "shining-planet", level: 20, label: "Hành Tinh Lấp Lánh", detail: "Bạn đã cán mốc 200 điểm.", threshold: 200, symbol: "✹" },
  { id: "smart-compass", level: 21, label: "La Bàn Thông Thái", detail: "Bạn đã chọn hướng giải bài thật chuẩn.", threshold: 210, symbol: "◎" },
  { id: "confidence-certificate", level: 22, label: "Giấy Khen Tự Tin", detail: "Bạn càng làm càng vững vàng.", threshold: 220, symbol: "✪" },
  { id: "brave-rocket", level: 23, label: "Tên Lửa Dũng Cảm", detail: "Bạn không ngại thử sức với câu mới.", threshold: 230, symbol: "➤" },
  { id: "super-mental", level: 24, label: "Huy hiệu Siêu Nhẩm", detail: "Bạn đã xử lý phép tính cực nhanh.", threshold: 240, symbol: "✣" },
  { id: "galaxy-map", level: 25, label: "Bản Đồ Ngân Hà", detail: "Bạn đã khám phá một chặng dài cùng Hana.", threshold: 250, symbol: "⌁" },
  { id: "meteor-cup", level: 26, label: "Cúp Sao Băng", detail: "Bạn đã tiến lên thật rực rỡ.", threshold: 260, symbol: "☄" },
  { id: "conqueror-shield", level: 27, label: "Khiên Chinh Phục", detail: "Bạn đã vượt qua nhiều thử thách liên tiếp.", threshold: 270, symbol: "⬟" },
  { id: "orbit-crown", level: 28, label: "Vương Miện Quỹ Đạo", detail: "Bạn là ngôi sao nổi bật của lượt học.", threshold: 280, symbol: "♕" },
  { id: "galaxy-medal", level: 29, label: "Huy chương Thiên Hà", detail: "Bạn đã đến gần đích lớn nhất.", threshold: 290, symbol: "✵" },
  { id: "hana-captain", level: 30, label: "Cúp Thuyền Trưởng Hana", detail: "Bạn đã chinh phục trọn bộ 30 mốc phần thưởng.", threshold: 300, symbol: "♛" },
];

export function rewardsForPoints(points: number) {
  return sessionRewards.filter((reward) => points >= reward.threshold);
}

export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
