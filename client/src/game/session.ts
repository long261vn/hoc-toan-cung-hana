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
  id: "star" | "crystal" | "pilot";
  label: string;
  detail: string;
  threshold: number;
  symbol: string;
}

export const sessionRewards: SessionReward[] = [
  { id: "star", label: "Sao Nhỏ", detail: "Bạn đã khởi động chuyến bay rất tốt.", threshold: 20, symbol: "★" },
  { id: "crystal", label: "Tinh thể Cầu Vồng", detail: "Bạn đã nạp đầy năng lượng học tập.", threshold: 50, symbol: "◆" },
  { id: "pilot", label: "Huy hiệu Phi Công Nhí", detail: "Bạn đã hoàn thành một chuyến luyện thật kiên trì.", threshold: 90, symbol: "✦" },
];

export function rewardsForPoints(points: number) {
  return sessionRewards.filter((reward) => points >= reward.threshold);
}

export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
