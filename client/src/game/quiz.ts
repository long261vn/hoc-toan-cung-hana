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
  excludedExpressions?: readonly string[];
}

export interface QuizQuestion {
  id: string;
  operation: Operation;
  kind: "standard" | "missing" | "table";
  expression: string;
  answer: number;
  options: number[];
  hint: string;
  hintSteps: string[];
  mission: string;
}

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const shuffle = <T>(items: T[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const target = rand(0, i);
    [copy[i], copy[target]] = [copy[target], copy[i]];
  }
  return copy;
};

/** A final runtime safeguard: only internally generated, numeric Grade 3 expressions are evaluated. */
export function isQuestionConsistent(question: QuizQuestion) {
  if (
    question.options.length !== 4 ||
    new Set(question.options).size !== 4 ||
    !question.options.includes(question.answer)
  )
    return false;
  if (
    !Number.isInteger(question.answer) ||
    question.answer < 0 ||
    question.options.some(option => !Number.isInteger(option) || option < 0)
  )
    return false;
  const match = question.expression.match(
    /^\s*(\?|\d+)\s*([+−×÷])\s*(\?|\d+)\s*=\s*(\?|\d+)\s*$/
  );
  if (!match) return false;
  const [, firstToken, operator, secondToken, resultToken] = match;
  const resolve = (token: string) =>
    token === "?" ? question.answer : Number(token);
  const first = resolve(firstToken);
  const second = resolve(secondToken);
  const result = resolve(resultToken);
  if (![first, second, result].every(Number.isFinite)) return false;
  if (operator === "+") return first + second === result;
  if (operator === "−") return first - second === result;
  if (operator === "×") return first * second === result;
  return second !== 0 && first / second === result;
}

function choices(answer: number, span: number, minValue = 0) {
  const values = new Set<number>([answer]);
  const nudges = [-2, -1, 1, 2, -3, 3, -5, 5, -10, 10];
  for (const nudge of shuffle(nudges)) {
    const candidate = Math.max(
      minValue,
      answer + nudge * Math.max(1, Math.ceil(span / 5))
    );
    values.add(candidate);
    if (values.size === 4) break;
  }
  while (values.size < 4)
    values.add(Math.max(minValue, answer + rand(1, span + 5)));
  return shuffle(Array.from(values));
}

/** Grade 3 “find the unknown component” questions use ? instead of algebraic notation. */
export function generateMissingComponentQuestion(
  operation: Operation,
  difficulty: Difficulty
): QuizQuestion {
  let expression = "";
  let answer = 0;
  let component = "";
  let hint = "";
  let hintSteps: string[] = [];
  let span = 8;

  if (operation === "add") {
    const total =
      difficulty === "easy"
        ? rand(12, 30)
        : difficulty === "medium"
          ? rand(140, 900)
          : rand(1200, 4500);
    const knownAddend =
      difficulty === "easy"
        ? rand(2, total - 2)
        : rand(Math.floor(total * 0.2), Math.floor(total * 0.7));
    answer = total - knownAddend;
    expression =
      Math.random() < 0.5
        ? `? + ${knownAddend} = ${total}`
        : `${knownAddend} + ? = ${total}`;
    component = "số hạng";
    hint = "Bạn hãy tìm số hạng chưa biết.";
    hintSteps = [
      `Tổng là ${total}; số hạng đã biết là ${knownAddend}.`,
      "Muốn tìm số hạng, lấy tổng trừ số hạng đã biết.",
      `${total} − ${knownAddend} = ?`,
    ];
    span = difficulty === "easy" ? 5 : 25;
  }

  if (operation === "subtract") {
    const subtrahend =
      difficulty === "easy"
        ? rand(2, 18)
        : difficulty === "medium"
          ? rand(20, 280)
          : rand(80, 700);
    const difference =
      difficulty === "easy"
        ? rand(2, 20)
        : difficulty === "medium"
          ? rand(30, 360)
          : rand(120, 900);
    const minuend = subtrahend + difference;
    const findMinuend = Math.random() < 0.5;
    answer = findMinuend ? minuend : subtrahend;
    expression = findMinuend
      ? `? − ${subtrahend} = ${difference}`
      : `${minuend} − ? = ${difference}`;
    component = findMinuend ? "số bị trừ" : "số trừ";
    hint = findMinuend
      ? "Bạn hãy tìm số bị trừ chưa biết."
      : "Bạn hãy tìm số trừ chưa biết.";
    hintSteps = findMinuend
      ? [
          `Hiệu là ${difference}; số trừ là ${subtrahend}.`,
          "Muốn tìm số bị trừ, lấy hiệu cộng số trừ.",
          `${difference} + ${subtrahend} = ?`,
        ]
      : [
          `Số bị trừ là ${minuend}; hiệu là ${difference}.`,
          "Muốn tìm số trừ, lấy số bị trừ trừ hiệu.",
          `${minuend} − ${difference} = ?`,
        ];
    span = difficulty === "easy" ? 5 : 25;
  }

  if (operation === "multiply") {
    const knownFactor = rand(2, 9);
    const otherFactor = difficulty === "easy" ? rand(2, 5) : rand(2, 10);
    const product = knownFactor * otherFactor;
    answer = otherFactor;
    expression =
      Math.random() < 0.5
        ? `? × ${knownFactor} = ${product}`
        : `${knownFactor} × ? = ${product}`;
    component = "thừa số";
    hint = "Bạn hãy tìm thừa số chưa biết.";
    hintSteps = [
      `Tích là ${product}; thừa số đã biết là ${knownFactor}.`,
      "Muốn tìm thừa số, lấy tích chia thừa số đã biết.",
      `${product} ÷ ${knownFactor} = ?`,
    ];
    span = 5;
  }

  if (operation === "divide") {
    const divisor = rand(2, 9);
    const quotient = difficulty === "easy" ? rand(2, 5) : rand(2, 10);
    const dividend = divisor * quotient;
    const findDividend = Math.random() < 0.5;
    answer = findDividend ? dividend : divisor;
    expression = findDividend
      ? `? ÷ ${divisor} = ${quotient}`
      : `${dividend} ÷ ? = ${quotient}`;
    component = findDividend ? "số bị chia" : "số chia";
    hint = findDividend
      ? "Bạn hãy tìm số bị chia chưa biết."
      : "Bạn hãy tìm số chia chưa biết.";
    hintSteps = findDividend
      ? [
          `Thương là ${quotient}; số chia là ${divisor}.`,
          "Muốn tìm số bị chia, lấy thương nhân số chia.",
          `${quotient} × ${divisor} = ?`,
        ]
      : [
          `Số bị chia là ${dividend}; thương là ${quotient}.`,
          "Muốn tìm số chia, lấy số bị chia chia thương.",
          `${dividend} ÷ ${quotient} = ?`,
        ];
    span = 7;
  }

  return {
    id: `missing-${operation}-${difficulty}-${Date.now()}-${Math.random()}`,
    operation,
    kind: "missing",
    expression,
    answer,
    options: choices(answer, span, 1),
    hint,
    hintSteps,
    mission: `Tìm ${component} còn thiếu.`,
  };
}

export function generateQuestion(
  operation: Operation,
  difficulty: Difficulty
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
      hintSteps = [
        `Bắt đầu từ ${largerAddend}.`,
        `Đếm thêm ${smallerAddend} bước: mỗi bước tăng thêm 1.`,
        "Chọn số cuối cùng bạn đếm được.",
      ];
      mission = "Khởi động với một phép cộng nhỏ.";
      span = 5;
    } else if (difficulty === "medium") {
      a = rand(120, 620);
      b = rand(35, 270);
      hint = "Bạn hãy đặt tính thẳng cột rồi cộng từ hàng đơn vị.";
      hintSteps = [
        `Viết ${a} và ${b} thẳng cột theo từng hàng.`,
        "Cộng từ hàng đơn vị, rồi đến hàng chục và hàng trăm.",
        "Nếu tổng một hàng từ 10 trở lên, nhớ 1 sang hàng kế tiếp.",
      ];
      mission = "Gộp hai nhóm số lại với nhau.";
      span = 35;
    } else {
      a = rand(420, 780);
      b = rand(110, 210);
      hint = "Bạn hãy cộng từng hàng và nhớ nếu cần.";
      hintSteps = [
        "Đặt các chữ số cùng hàng thẳng cột.",
        "Cộng lần lượt từ phải sang trái.",
        "Nếu một hàng được từ 10 trở lên, viết hàng đơn vị và nhớ 1 sang hàng bên trái.",
      ];
      mission = "Hoàn thành phép cộng nhiều chữ số.";
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
      hintSteps = [
        `Bắt đầu từ ${a}.`,
        `Đếm lùi ${b} bước, mỗi bước giảm 1.`,
        "Chọn số cuối cùng bạn đếm được.",
      ];
      mission = "Gỡ bớt đá vũ trụ khỏi đường bay.";
      span = 5;
    } else if (difficulty === "medium") {
      a = rand(260, 890);
      b = rand(35, Math.min(350, a - 20));
      hint = "Bạn hãy đặt tính thẳng cột rồi trừ từ hàng đơn vị.";
      hintSteps = [
        `Viết ${a} và ${b} thẳng cột theo từng hàng.`,
        "Trừ từ hàng đơn vị, rồi đến hàng chục và hàng trăm.",
        "Nếu hàng đơn vị không đủ để trừ, mượn 1 chục ở hàng chục; sau đó tiếp tục trừ.",
      ];
      mission = "Tìm số còn lại sau phép trừ.";
      span = 35;
    } else {
      a = rand(650, 990);
      b = rand(120, 540);
      hint = "Nếu không đủ để trừ, bạn hãy đổi 1 chục hoặc 1 trăm nhé.";
      hintSteps = [
        "Đặt các chữ số cùng hàng thẳng cột.",
        "Trừ từ phải sang trái.",
        "Nếu một hàng không đủ để trừ, mượn 1 ở hàng bên trái; đổi 1 chục thành 10 đơn vị hoặc 1 trăm thành 10 chục rồi tiếp tục.",
      ];
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
      hintSteps = [
        `Có ${b} nhóm bằng nhau, mỗi nhóm có ${a}.`,
        `Bạn có thể cộng ${a} lặp lại ${b} lần.`,
        `Hoặc dùng bảng nhân ${a} để tìm kết quả.`,
      ];
      mission = "Khởi động bảng nhân quen thuộc.";
      span = 4;
    } else if (difficulty === "medium") {
      a = rand(2, 9);
      b = rand(3, 9);
      hint = "Bạn có thể cộng lặp lại hoặc dùng bảng nhân.";
      hintSteps = [
        `Xem ${a} × ${b} là ${b} nhóm, mỗi nhóm có ${a}.`,
        `Cộng ${a} lặp lại ${b} lần nếu bạn chưa nhớ bảng nhân.`,
        "Sau đó chọn kết quả vừa tìm được.",
      ];
      mission = "Xếp các nhóm bằng nhau để nhân.";
      span = 7;
    } else {
      a = rand(12, 89);
      b = rand(2, 9);
      hint = "Bạn hãy nhân lần lượt với hàng đơn vị rồi hàng chục.";
      hintSteps = [
        `Đặt tính ${a} × ${b}.`,
        `Nhân ${b} lần lượt với từng hàng của ${a}, từ phải sang trái.`,
        "Nếu tích ở một hàng từ 10 trở lên, viết hàng đơn vị và nhớ sang hàng tiếp theo.",
      ];
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
      hintSteps = [
        `Đổi ${a} ÷ ${b} thành phép nhân ${b} × ? = ${a}.`,
        `Dùng bảng nhân ${b} để tìm số còn thiếu.`,
        "Số còn thiếu chính là kết quả phép chia.",
      ];
      mission = "Chia đều các nhóm số.";
      span = 4;
    } else if (difficulty === "medium") {
      b = rand(2, 9);
      answer = rand(3, 9);
      a = b * answer;
      hint = `Bạn hãy dùng bảng nhân ${b} để tìm kết quả chia.`;
      hintSteps = [
        `Đổi ${a} ÷ ${b} thành ${b} × ? = ${a}.`,
        `Đọc lần lượt bảng nhân ${b} để tìm tích ${a}.`,
        "Số điền vào dấu hỏi là thương của phép chia.",
      ];
      mission = "Chia đều nhiên liệu cho các trạm sao.";
      span = 5;
    } else {
      b = rand(2, 9);
      answer = rand(12, 36);
      a = b * answer;
      hint = "Bạn hãy dùng phép nhân để tìm thương rồi kiểm tra lại.";
      hintSteps = [
        `Tìm thương bằng cách nghĩ ${b} × ? = ${a}.`,
        `Dùng bảng nhân ${b} hoặc nhân nhẩm để tìm số còn thiếu.`,
        `Kiểm tra: lấy số vừa tìm được nhân ${b}; nếu được ${a} thì đó là thương.`,
      ];
      mission = "Tìm thương của phép chia.";
      span = 10;
    }
    expression = `${a} ÷ ${b} = ?`;
  }

  return {
    id: `${operation}-${difficulty}-${Date.now()}-${Math.random()}`,
    operation,
    kind: "standard",
    expression,
    answer,
    options: choices(answer, span),
    hint,
    hintSteps,
    mission,
  };
}

/** Create a table-only mission. Tables are always 2–9 and factors are 1–10. */
export function generateTableQuestion(
  settings: TablePracticeSettings
): QuizQuestion {
  const usableTables = settings.tables.filter(table =>
    TIMES_TABLES.includes(table as (typeof TIMES_TABLES)[number])
  );
  const selectedTables = usableTables.length > 0 ? usableTables : [2];
  const excludedExpressions = new Set(settings.excludedExpressions ?? []);
  let table = selectedTables[rand(0, selectedTables.length - 1)];
  let factor = rand(1, 10);
  let isDivision =
    settings.kind === "mixed"
      ? Math.random() >= 0.5
      : settings.kind === "divide";
  let previewProduct = table * factor;
  let previewExpression = isDivision
    ? `${previewProduct} ÷ ${table} = ?`
    : `${table} × ${factor} = ?`;
  let attempts = 0;
  while (excludedExpressions.has(previewExpression) && attempts < 40) {
    table = selectedTables[rand(0, selectedTables.length - 1)];
    factor = rand(1, 10);
    isDivision =
      settings.kind === "mixed"
        ? Math.random() >= 0.5
        : settings.kind === "divide";
    previewProduct = table * factor;
    previewExpression = isDivision
      ? `${previewProduct} ÷ ${table} = ?`
      : `${table} × ${factor} = ?`;
    attempts += 1;
  }
  const operation: Operation = isDivision ? "divide" : "multiply";
  const product = table * factor;
  const answer = isDivision ? factor : product;
  const expression = isDivision
    ? `${product} ÷ ${table} = ?`
    : `${table} × ${factor} = ?`;
  const kindLabel = isDivision ? "chia" : "nhân";

  return {
    id: `table-${settings.kind}-${table}-${Date.now()}-${Math.random()}`,
    operation,
    kind: "table",
    expression,
    answer,
    options: choices(answer, 6),
    hint: isDivision
      ? `Bạn hãy đổi phép chia thành phép nhân: ${table} × ? = ${product}.`
      : `Bạn đang luyện bảng nhân ${table}. Hãy đếm ${table} thêm ${factor} lần nhé.`,
    hintSteps: isDivision
      ? [
          `Đổi ${product} ÷ ${table} thành ${table} × ? = ${product}.`,
          `Dùng bảng nhân ${table} để tìm số còn thiếu.`,
          "Số còn thiếu là kết quả phép chia.",
        ]
      : [
          `Có ${factor} nhóm bằng nhau, mỗi nhóm có ${table}.`,
          `Bạn có thể cộng ${table} lặp lại ${factor} lần.`,
          `Hoặc dùng bảng nhân ${table} để tìm kết quả.`,
        ],
    mission: `Khởi động bảng ${kindLabel} ${table}.`,
  };
}
