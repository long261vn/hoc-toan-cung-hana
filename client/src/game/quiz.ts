/**
 * Design philosophy: clear, encouraging Grade 3 mathematics delivered as short
 * space missions. This module is deliberately framework- and renderer-agnostic.
 */

export type Operation = "add" | "subtract" | "multiply" | "divide";
export type Difficulty = "easy" | "medium" | "challenge";
export type ExerciseMode = "journey" | "practice" | "test" | "tables";
export type TablePracticeKind = "multiply" | "divide" | "mixed";

export const TIMES_TABLES = [2, 3, 4, 5, 6, 7, 8, 9] as const;

export interface TablePracticeSettings {
  kind: TablePracticeKind;
  tables: number[];
}

export interface QuizQuestion {
  id: string;
  operation: Operation;
  expression: string;
  answer: number;
  options: number[];
  hint: string;
  hintSteps: string[];
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
  let hintSteps: string[] = [];
  let mission = "";
  let span = 8;

  if (operation === "add") {
    if (difficulty === "easy") {
      a = rand(3, 18);
      b = rand(2, 18);
      hint = "Bạn hãy đếm thêm từng bước từ số lớn hơn.";
      const largerAddend = Math.max(a, b);
      const smallerAddend = Math.min(a, b);
      hintSteps = [`Bắt đầu từ ${largerAddend}.`, `Đếm thêm ${smallerAddend} bước: mỗi bước tăng thêm 1.`, "Chọn số cuối cùng bạn đếm được."];
      mission = "Nạp năng lượng bằng phép cộng nhỏ.";
      span = 5;
    } else if (difficulty === "medium") {
      a = rand(120, 620);
      b = rand(35, 270);
      hint = "Bạn hãy đặt tính thẳng cột rồi cộng từ hàng đơn vị.";
      hintSteps = [`Viết ${a} và ${b} thẳng cột theo từng hàng.`, "Cộng từ hàng đơn vị, rồi đến hàng chục và hàng trăm.", "Nếu tổng một hàng từ 10 trở lên, nhớ 1 sang hàng kế tiếp."];
      mission = "Gộp hai kho năng lượng lại với nhau.";
      span = 35;
    } else {
      a = rand(420, 780);
      b = rand(110, 210);
      hint = "Bạn hãy cộng từng hàng và nhớ nếu cần.";
      hintSteps = ["Đặt các chữ số cùng hàng thẳng cột.", "Cộng lần lượt từ phải sang trái.", "Nếu một hàng được từ 10 trở lên, viết hàng đơn vị và nhớ 1 sang hàng bên trái."];
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
      hint = "Bạn hãy đếm lùi từ số đầu tiên.";
      hintSteps = [`Bắt đầu từ ${a}.`, `Đếm lùi ${b} bước, mỗi bước giảm 1.`, "Chọn số cuối cùng bạn đếm được."];
      mission = "Gỡ bớt đá vũ trụ khỏi đường bay.";
      span = 5;
    } else if (difficulty === "medium") {
      a = rand(260, 890);
      b = rand(35, Math.min(350, a - 20));
      hint = "Bạn hãy đặt tính thẳng cột rồi trừ từ hàng đơn vị.";
      hintSteps = [`Viết ${a} và ${b} thẳng cột theo từng hàng.`, "Trừ từ hàng đơn vị, rồi đến hàng chục và hàng trăm.", "Nếu không đủ để trừ ở một hàng, bạn đổi 1 chục của hàng liền trước."];
      mission = "Tìm phần năng lượng còn lại.";
      span = 35;
    } else {
      a = rand(650, 990);
      b = rand(120, 540);
      hint = "Nếu không đủ để trừ, bạn hãy đổi 1 chục hoặc 1 trăm nhé.";
      hintSteps = ["Đặt các chữ số cùng hàng thẳng cột.", "Trừ từ phải sang trái.", "Nếu không đủ để trừ, đổi 1 chục hoặc 1 trăm từ hàng bên trái rồi tiếp tục tính."];
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
      hint = `Bạn hãy nhớ lại bảng nhân ${a} nhé.`;
      hintSteps = [`Có ${b} nhóm bằng nhau, mỗi nhóm có ${a}.`, `Bạn có thể cộng ${a} lặp lại ${b} lần.`, `Hoặc dùng bảng nhân ${a} để tìm kết quả.`];
      mission = "Kích hoạt bảng nhân năng lượng.";
      span = 4;
    } else if (difficulty === "medium") {
      a = rand(2, 9);
      b = rand(3, 9);
      hint = "Bạn có thể cộng lặp lại hoặc dùng bảng nhân.";
      hintSteps = [`Xem ${a} × ${b} là ${b} nhóm, mỗi nhóm có ${a}.`, `Cộng ${a} lặp lại ${b} lần nếu bạn chưa nhớ bảng nhân.`, "Sau đó chọn kết quả vừa tìm được."];
      mission = "Xếp các tinh thể thành những nhóm bằng nhau.";
      span = 7;
    } else {
      a = rand(12, 89);
      b = rand(2, 9);
      hint = "Bạn hãy nhân lần lượt với hàng đơn vị rồi hàng chục.";
      hintSteps = [`Đặt tính ${a} × ${b}.`, `Nhân ${b} lần lượt với từng hàng của ${a}, từ phải sang trái.`, "Nếu tích ở một hàng từ 10 trở lên, viết hàng đơn vị và nhớ sang hàng tiếp theo."];
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
      hint = `Bạn hãy nghĩ: ${b} nhân mấy thì được ${a}?`;
      hintSteps = [`Đổi ${a} ÷ ${b} thành phép nhân ${b} × ? = ${a}.`, `Dùng bảng nhân ${b} để tìm số còn thiếu.`, "Số còn thiếu chính là kết quả phép chia."];
      mission = "Chia tinh thể đều cho các bạn robot.";
      span = 4;
    } else if (difficulty === "medium") {
      b = rand(2, 9);
      answer = rand(3, 9);
      a = b * answer;
      hint = `Bạn hãy dùng bảng nhân ${b} để tìm kết quả chia.`;
      hintSteps = [`Đổi ${a} ÷ ${b} thành ${b} × ? = ${a}.`, `Đọc lần lượt bảng nhân ${b} để tìm tích ${a}.`, "Số điền vào dấu hỏi là thương của phép chia."];
      mission = "Chia đều nhiên liệu cho các trạm sao.";
      span = 5;
    } else {
      b = rand(2, 9);
      answer = rand(12, 36);
      a = b * answer;
      hint = "Bạn hãy đổi phép chia thành phép nhân để kiểm tra đáp án.";
      hintSteps = [`Tìm thương bằng cách nghĩ ${b} × ? = ${a}.`, `Dùng bảng nhân ${b} để tìm số còn thiếu.`, "Lấy thương nhân với số chia để kiểm tra lại số bị chia."];
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
    hintSteps,
    mission,
  };
}

/** Create a table-only mission. Tables are always 2–9 and factors are 1–10. */
export function generateTableQuestion(settings: TablePracticeSettings): QuizQuestion {
  const usableTables = settings.tables.filter((table) => TIMES_TABLES.includes(table as (typeof TIMES_TABLES)[number]));
  const selectedTables = usableTables.length > 0 ? usableTables : [2];
  const table = selectedTables[rand(0, selectedTables.length - 1)];
  const factor = rand(1, 10);
  const isDivision = settings.kind === "mixed" ? Math.random() >= 0.5 : settings.kind === "divide";
  const operation: Operation = isDivision ? "divide" : "multiply";
  const product = table * factor;
  const answer = isDivision ? factor : product;
  const expression = isDivision ? `${product} ÷ ${table} = ?` : `${table} × ${factor} = ?`;
  const kindLabel = isDivision ? "chia" : "nhân";

  return {
    id: `table-${settings.kind}-${table}-${Date.now()}-${Math.random()}`,
    operation,
    expression,
    answer,
    options: choices(answer, 6),
    hint: isDivision
      ? `Bạn hãy đổi phép chia thành phép nhân: ${table} × ? = ${product}.`
      : `Bạn đang luyện bảng nhân ${table}. Hãy đếm ${table} thêm ${factor} lần nhé.`,
    hintSteps: isDivision
      ? [`Đổi ${product} ÷ ${table} thành ${table} × ? = ${product}.`, `Dùng bảng nhân ${table} để tìm số còn thiếu.`, "Số còn thiếu là kết quả phép chia."]
      : [`Có ${factor} nhóm bằng nhau, mỗi nhóm có ${table}.`, `Bạn có thể cộng ${table} lặp lại ${factor} lần.`, `Hoặc dùng bảng nhân ${table} để tìm kết quả.`],
    mission: `Khởi động bảng ${kindLabel} ${table}.`,
  };
}
