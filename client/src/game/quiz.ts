/**
 * Design philosophy: clear, encouraging Grade 3 mathematics delivered as short
 * space missions. This module is deliberately framework- and renderer-agnostic.
 */

export type Operation = "add" | "subtract" | "multiply" | "divide";
export type Difficulty = "easy" | "medium" | "challenge";
export type ExerciseMode = "journey" | "practice" | "test";

export interface QuizQuestion {
  id: string;
  operation: Operation;
  expression: string;
  answer: number;
  options: number[];
  hint: string;
  mission: string;
}

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const shuffle = <T,>(items: T[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const target = rand(0, i);
    [copy[i], copy[target]] = [copy[target], copy[i]];
  }
  return copy;
};

function choices(answer: number, span: number) {
  const values = new Set<number>([answer]);
  const nudges = [-2, -1, 1, 2, -3, 3, -5, 5, -10, 10];
  for (const nudge of shuffle(nudges)) {
    const candidate = Math.max(0, answer + nudge * Math.max(1, Math.ceil(span / 5)));
    values.add(candidate);
    if (values.size === 4) break;
  }
  while (values.size < 4) values.add(answer + rand(1, span + 5));
  return shuffle(Array.from(values));
}

export function generateQuestion(
  operation: Operation,
  difficulty: Difficulty,
): QuizQuestion {
  let a = 0;
  let b = 0;
  let answer = 0;
  let expression = "";
  let hint = "";
  let mission = "";
  let span = 8;

  if (operation === "add") {
    if (difficulty === "easy") {
      a = rand(3, 18);
      b = rand(2, 18);
      hint = "Con có thể đếm thêm từng bước từ số lớn hơn.";
      mission = "Nạp năng lượng bằng phép cộng nhỏ.";
      span = 5;
    } else if (difficulty === "medium") {
      a = rand(120, 620);
      b = rand(35, 270);
      hint = "Đặt tính thẳng cột rồi cộng từ hàng đơn vị.";
      mission = "Gộp hai kho năng lượng lại với nhau.";
      span = 35;
    } else {
      a = rand(420, 780);
      b = rand(110, 210);
      hint = "Hãy nhớ cộng từng hàng và nhớ nếu cần.";
      mission = "Nạp năng lượng cho chuyến bay xa.";
      span = 50;
    }
    answer = a + b;
    expression = `${a} + ${b} = ?`;
  }

  if (operation === "subtract") {
    if (difficulty === "easy") {
      a = rand(12, 30);
      b = rand(2, a - 1);
      hint = "Con có thể đếm lùi từ số đầu tiên.";
      mission = "Gỡ bớt đá vũ trụ khỏi đường bay.";
      span = 5;
    } else if (difficulty === "medium") {
      a = rand(260, 890);
      b = rand(35, Math.min(350, a - 20));
      hint = "Đặt tính thẳng cột rồi trừ từ hàng đơn vị.";
      mission = "Tìm phần năng lượng còn lại.";
      span = 35;
    } else {
      a = rand(650, 990);
      b = rand(120, 540);
      hint = "Nếu không đủ để trừ, con nhớ mượn một chục hoặc một trăm nhé.";
      mission = "Mở lối đi qua vành đai thiên thạch.";
      span = 45;
    }
    answer = a - b;
    expression = `${a} − ${b} = ?`;
  }

  if (operation === "multiply") {
    if (difficulty === "easy") {
      a = rand(2, 5);
      b = rand(2, 10);
      hint = `Nhớ lại bảng nhân ${a} nhé.`;
      mission = "Kích hoạt bảng nhân năng lượng.";
      span = 4;
    } else if (difficulty === "medium") {
      a = rand(2, 9);
      b = rand(3, 9);
      hint = "Có thể cộng lặp lại hoặc dùng bảng nhân.";
      mission = "Xếp các tinh thể thành những nhóm bằng nhau.";
      span = 7;
    } else {
      a = rand(12, 89);
      b = rand(2, 9);
      hint = "Hãy nhân lần lượt với hàng đơn vị rồi hàng chục.";
      mission = "Nhân công suất động cơ phi thuyền.";
      span = 15;
    }
    answer = a * b;
    expression = `${a} × ${b} = ?`;
  }

  if (operation === "divide") {
    if (difficulty === "easy") {
      b = rand(2, 5);
      answer = rand(2, 10);
      a = b * answer;
      hint = `Hãy nghĩ: ${b} nhân mấy thì được ${a}?`;
      mission = "Chia tinh thể đều cho các bạn robot.";
      span = 4;
    } else if (difficulty === "medium") {
      b = rand(2, 9);
      answer = rand(3, 9);
      a = b * answer;
      hint = `Dùng bảng nhân ${b} để tìm kết quả chia.`;
      mission = "Chia đều nhiên liệu cho các trạm sao.";
      span = 5;
    } else {
      b = rand(2, 9);
      answer = rand(12, 36);
      a = b * answer;
      hint = "Đổi phép chia thành phép nhân để kiểm tra đáp án.";
      mission = "Phân phối năng lượng cho cả hạm đội.";
      span = 10;
    }
    expression = `${a} ÷ ${b} = ?`;
  }

  return {
    id: `${operation}-${difficulty}-${Date.now()}-${Math.random()}`,
    operation,
    expression,
    answer,
    options: choices(answer, span),
    hint,
    mission,
  };
}
