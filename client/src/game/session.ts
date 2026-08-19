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
  id: "star" | "explorer" | "pilot";
  label: string;
  detail: string;
  threshold: number;
  symbol: string;
}

export const sessionRewards: SessionReward[] = [
  { id: "star", label: "Nhãn dán Sao Nhỏ", detail: "Bạn đã có 2 câu đúng thật nhanh.", threshold: 20, symbol: "★" },
  { id: "explorer", label: "Huy hiệu Nhà Thám Hiểm", detail: "Bạn đã chinh phục 4 câu đúng.", threshold: 40, symbol: "✦" },
  { id: "pilot", label: "Cúp Phi Công Nhí", detail: "Bạn đã hoàn thành 7 câu đúng trong lượt này.", threshold: 70, symbol: "♛" },
];

export function rewardsForPoints(points: number) {
  return sessionRewards.filter((reward) => points >= reward.threshold);
}

export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
