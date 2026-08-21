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

const EQUAL_GROUP_STORIES = [
  { containers: "bao kẹo", container: "bao", item: "cục kẹo" },
  { containers: "hộp bút màu", container: "hộp", item: "bút màu" },
  { containers: "bình hoa", container: "bình", item: "bông hoa" },
  { containers: "kệ sách", container: "kệ", item: "quyển sách" },
  { containers: "khay bánh", container: "khay", item: "chiếc bánh" },
] as const;

function equalGroupStory() {
  return EQUAL_GROUP_STORIES[rand(0, EQUAL_GROUP_STORIES.length - 1)];
}

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
      difficulty === "easy"
        ? `${total} − ${knownAddend} = ?`
        : `Đặt tính ${total} − ${knownAddend} theo cột, rồi tìm số hạng chưa biết.`,
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
          difficulty === "easy"
            ? `${difference} + ${subtrahend} = ?`
            : `Đặt tính ${difference} + ${subtrahend} theo cột, rồi tìm số bị trừ chưa biết.`,
        ]
      : [
          `Số bị trừ là ${minuend}; hiệu là ${difference}.`,
          "Muốn tìm số trừ, lấy số bị trừ trừ hiệu.",
          difficulty === "easy"
            ? `${minuend} − ${difference} = ?`
            : `Đặt tính ${minuend} − ${difference} theo cột, rồi tìm số trừ chưa biết.`,
        ];
    span = difficulty === "easy" ? 5 : 25;
  }

  if (operation === "multiply") {
    const knownFactor = rand(2, 9);
    const otherFactor =
      difficulty === "easy" ? rand(2, 5) : difficulty === "medium" ? rand(2, 10) : rand(12, 36);
    const product = knownFactor * otherFactor;
    answer = otherFactor;
    expression =
      Math.random() < 0.5
        ? `? × ${knownFactor} = ${product}`
        : `${knownFactor} × ? = ${product}`;
    component = "thừa số";
    hint = "Bạn hãy tìm thừa số chưa biết.";
    hintSteps =
      difficulty === "challenge"
        ? [
            `Tích là ${product}; thừa số đã biết là ${knownFactor}.`,
            "Muốn tìm thừa số, lấy tích chia thừa số đã biết.",
            `Đặt tính ${product} ÷ ${knownFactor}; chia lần lượt từ hàng lớn nhất bên trái.`,
            `Kiểm tra: lấy số vừa tìm được nhân ${knownFactor}; tích phải bằng ${product}.`,
          ]
        : [
            `Tích là ${product}; thừa số đã biết là ${knownFactor}.`,
            "Muốn tìm thừa số, lấy tích chia thừa số đã biết.",
            `${product} ÷ ${knownFactor} = ?`,
          ];
    span = difficulty === "challenge" ? 12 : 5;
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
      a = rand(1250, 7800);
      b = rand(220, 1800);
      hint = "Bạn hãy đặt tính rồi cộng từng hàng, nhớ khi cần.";
      hintSteps = [
        "Đặt các chữ số cùng hàng thẳng cột.",
        "Cộng từ hàng đơn vị sang hàng chục, hàng trăm rồi hàng nghìn.",
        "Nếu tổng ở một hàng từ 10 trở lên, viết chữ số ở hàng đó và nhớ 1 sang hàng bên trái.",
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
      a = rand(1800, 9000);
      b = rand(240, Math.min(4200, a - 120));
      hint = "Bạn hãy đặt tính rồi đổi một chục hoặc một trăm khi hàng đó không đủ để trừ.";
      hintSteps = [
        "Đặt các chữ số cùng hàng thẳng cột.",
        "Trừ từ hàng đơn vị sang trái, lần lượt đến các hàng lớn hơn.",
        "Nếu một hàng không đủ để trừ, đổi 1 ở hàng bên trái: 1 chục thành 10 đơn vị hoặc 1 trăm thành 10 chục.",
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
      const story = equalGroupStory();
      hint = "Hãy hiểu mỗi nhóm có bao nhiêu phần tử trước, rồi dùng bảng nhân để kiểm tra.";
      hintSteps = [
        `Hãy tưởng tượng có ${b} ${story.containers} bằng nhau, mỗi ${story.container} có ${a} ${story.item}.`,
        `Vậy ${a} × ${b} là lấy ${a} lặp lại ${b} lần. Hãy cộng ${a} thêm ${b - 1} lần.`,
        `Dùng bảng nhân ${a} để kiểm tra lại tích bạn vừa tìm.`,
      ];
      mission = "Khởi động bảng nhân quen thuộc.";
      span = 4;
    } else if (difficulty === "medium") {
      a = rand(2, 9);
      b = rand(3, 9);
      const story = equalGroupStory();
      hint = "Hãy hiểu phép nhân là các nhóm bằng nhau, rồi dùng bảng nhân để kiểm tra.";
      hintSteps = [
        `Hãy tưởng tượng có ${b} ${story.containers} bằng nhau, mỗi ${story.container} có ${a} ${story.item}.`,
        `Vậy ${a} × ${b} là lấy ${a} lặp lại ${b} lần. Hãy cộng ${a} thêm ${b - 1} lần.`,
        `Dùng bảng nhân ${a} để kiểm tra lại tích bạn vừa tìm.`,
      ];
      mission = "Xếp các nhóm bằng nhau để nhân.";
      span = 7;
    } else {
      a = rand(120, 980);
      b = rand(2, 9);
      hint = "Hãy đặt tính và nhân từng hàng để không bỏ sót số nhớ.";
      hintSteps = [
        `Đặt tính ${a} × ${b}; viết ${b} thẳng cột với hàng đơn vị của ${a}.`,
        `Nhân ${b} với hàng đơn vị của ${a}; ghi chữ số đơn vị và nhớ nếu tích có hai chữ số.`,
        `Tiếp tục nhân ${b} với các hàng còn lại của ${a}; cộng số nhớ vào đúng hàng.`,
        "Kiểm tra lại các hàng đã nhân và số nhớ trước khi chọn đáp án.",
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
      const story = equalGroupStory();
      hint = "Hãy hình dung chia đều đồ vật vào các nhóm trước, rồi dùng phép nhân để kiểm tra.";
      hintSteps = [
        `Hãy tưởng tượng ${a} ${story.item} được chia đều vào ${b} ${story.containers}.`,
        `Mỗi ${story.container} có mấy ${story.item}? Hãy tìm số còn thiếu trong ? × ${b} = ${a}.`,
        `Dùng bảng nhân ${b} để kiểm tra số phần trong mỗi ${story.container}.`,
      ];
      mission = "Chia đều các nhóm số.";
      span = 4;
    } else if (difficulty === "medium") {
      b = rand(2, 9);
      answer = rand(3, 9);
      a = b * answer;
      const story = equalGroupStory();
      hint = "Hãy chia đều theo nhóm trước, rồi dùng bảng nhân để kiểm tra.";
      hintSteps = [
        `Hãy tưởng tượng ${a} ${story.item} được chia đều vào ${b} ${story.containers}.`,
        `Mỗi ${story.container} có mấy ${story.item}? Hãy tìm số còn thiếu trong ? × ${b} = ${a}.`,
        `Dùng bảng nhân ${b} để kiểm tra số phần trong mỗi ${story.container}.`,
      ];
      mission = "Chia đều nhiên liệu cho các trạm sao.";
      span = 5;
    } else {
      b = rand(2, 9);
      answer = rand(12, 36);
      a = b * answer;
      const digits = String(a).split("").map(Number);
      const firstChunk = digits[0] < b ? Number(digits.slice(0, 2).join("")) : digits[0];
      const firstChunkInstruction = digits[0] < b
        ? `Vì ${digits[0]} bé hơn ${b}, ghép ${digits[0]} với chữ số kế tiếp thành ${firstChunk}. Chia ${firstChunk} cho ${b} để tìm chữ số đầu của thương.`
        : `Bắt đầu từ ${digits[0]}. Chia ${digits[0]} cho ${b} để tìm chữ số đầu của thương.`;
      hint = "Bạn hãy đặt tính chia theo từng hàng rồi dùng phép nhân để kiểm tra.";
      hintSteps = [
        `Đặt tính ${a} ÷ ${b}.`,
        firstChunkInstruction,
        `Nhân chữ số thương vừa tìm với ${b}, đặt kết quả thẳng cột rồi trừ. Hạ chữ số tiếp theo xuống và làm tương tự đến hết số bị chia.`,
        `Kiểm tra: lấy thương bạn vừa tìm nhân ${b}; tích phải trở lại ${a}.`,
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
  const story = equalGroupStory();
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
      ? "Hãy hình dung chia đều đồ vật vào các nhóm trước, rồi dùng phép nhân để kiểm tra."
      : "Hãy hiểu số nhóm và số phần tử trong mỗi nhóm trước, rồi kiểm tra bằng bảng nhân.",
    hintSteps: isDivision
      ? [
          `Hãy tưởng tượng ${product} ${story.item} được chia đều vào ${table} ${story.containers}.`,
          `Mỗi ${story.container} có mấy ${story.item}? Hãy tìm số còn thiếu trong ? × ${table} = ${product}.`,
          `Dùng bảng nhân ${table} để kiểm tra số phần trong mỗi ${story.container}.`,
        ]
      : [
          `Hãy tưởng tượng có ${factor} ${story.containers} bằng nhau, mỗi ${story.container} có ${table} ${story.item}.`,
          `Vậy ${table} × ${factor} là lấy ${table} lặp lại ${factor} lần. Hãy cộng ${table} thêm ${factor - 1} lần.`,
          `Dùng bảng nhân ${table} để kiểm tra lại tích bạn vừa tìm.`,
        ],
    mission: `Khởi động bảng ${kindLabel} ${table}.`,
  };
}
