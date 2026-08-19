const quiz = await import("/tmp/hana-quiz-validation/quiz.js");
const operations = ["add", "subtract", "multiply", "divide"];
const difficulties = ["easy", "medium", "challenge"];
const tableKinds = ["multiply", "divide", "mixed"];

const calculate = (expression) => {
  const normalized = expression.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/\s*=\s*\?$/, "");
  return Function(`"use strict"; return (${normalized});`)();
};

const validate = (question) => {
  if (question.options.length !== 4 || new Set(question.options).size !== 4) throw new Error(`Số lựa chọn không hợp lệ: ${question.expression}`);
  if (!question.options.includes(question.answer)) throw new Error(`Thiếu đáp án đúng: ${question.expression} → ${question.answer}`);
  if (!Number.isInteger(question.answer) || question.answer < 0) throw new Error(`Đáp án không hợp lệ: ${question.expression}`);
  if (question.expression.includes("?")) {
    const completed = question.expression.replace("?", String(question.answer));
    const [left, right] = completed.split("=");
    if (calculate(left) !== Number(right.trim())) throw new Error(`Phép tìm thành phần sai: ${question.expression} → ${question.answer}`);
  } else if (calculate(question.expression) !== question.answer) {
    throw new Error(`Phép tính sai: ${question.expression} → ${question.answer}`);
  }
};

let checks = 0;
for (const operation of operations) {
  for (const difficulty of difficulties) {
    for (let index = 0; index < 1000; index += 1) {
      validate(quiz.generateQuestion(operation, difficulty));
      validate(quiz.generateMissingComponentQuestion(operation, difficulty));
      checks += 2;
    }
  }
}
for (const kind of tableKinds) {
  for (let index = 0; index < 2000; index += 1) {
    validate(quiz.generateTableQuestion({ kind, tables: [2, 3, 4, 5, 6, 7, 8, 9] }));
    checks += 1;
  }
}
console.log(JSON.stringify({ checks, result: "all quiz answers valid" }));
