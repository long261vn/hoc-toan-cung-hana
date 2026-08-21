import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const validationDirectory = resolve("/tmp", `hana-quiz-validation-${process.pid}`);
const bundledQuiz = resolve(validationDirectory, "quiz.js");
if (existsSync(validationDirectory)) rmSync(validationDirectory, { recursive: true, force: true });
mkdirSync(validationDirectory, { recursive: true });
try {
  execFileSync(resolve(projectRoot, "node_modules/.bin/esbuild"), [
    resolve(projectRoot, "client/src/game/quiz.ts"),
    "--bundle",
    "--platform=node",
    "--format=esm",
    `--outfile=${bundledQuiz}`,
  ], { stdio: "ignore" });
  const quiz = await import(`${pathToFileURL(bundledQuiz).href}?v=${Date.now()}`);
  globalThis.__hanaQuizModule = quiz;
} finally {
  rmSync(validationDirectory, { recursive: true, force: true });
}
const quiz = globalThis.__hanaQuizModule;
const operations = ["add", "subtract", "multiply", "divide"];
const difficulties = ["easy", "medium", "challenge"];
const tableKinds = ["multiply", "divide", "mixed"];

const calculate = (expression) => {
  const normalized = expression.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/\s*=\s*\?$/, "");
  return Function(`"use strict"; return (${normalized});`)();
};

const validate = (question, difficulty = null) => {
  if (!quiz.isQuestionConsistent(question)) throw new Error(`Lớp bảo vệ nhất quán từ chối câu hỏi: ${question.expression}`);
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
  if (question.hintSteps.length < 3 || question.hintSteps.length > 4 || question.hintSteps.some(step => !step.trim())) {
    throw new Error(`Gợi ý Hana cần từ ba đến bốn bước có nội dung: ${question.expression}`);
  }
  if (question.hintSteps.some(step => /bài mẫu|worked example/i.test(step))) {
    throw new Error(`Gợi ý Hana không được có bài mẫu lộ đáp án: ${question.expression}`);
  }
  if (question.kind === "missing") {
    const requiredPhrase = {
      add: "Muốn tìm số hạng",
      subtract: question.expression.startsWith("?") ? "Muốn tìm số bị trừ" : "Muốn tìm số trừ",
      multiply: "Muốn tìm thừa số",
      divide: question.expression.startsWith("?") ? "Muốn tìm số bị chia" : "Muốn tìm số chia",
    }[question.operation];
    if (!question.hintSteps.some(step => step.includes(requiredPhrase))) {
      throw new Error(`Gợi ý tìm thành phần chưa nêu đúng quan hệ phép tính: ${question.expression}`);
    }
  }
  if (question.kind === "standard" && difficulty) {
    const steps = question.hintSteps.join(" ");
    if (
      question.operation === "multiply" &&
      difficulty !== "challenge" &&
      (!/nghĩa là lấy/.test(steps) || !/Hãy cộng/.test(steps) || !/kiểm tra lại tích/.test(steps))
    ) {
      throw new Error(`Phép nhân cơ bản cần giải thích nhóm bằng nhau, cộng lặp và bước kiểm tra: ${question.expression}`);
    }
    if (
      question.operation === "multiply" &&
      difficulty === "challenge" &&
      (question.hintSteps.length !== 4 || !steps.includes("Đặt tính") || !steps.includes("hàng đơn vị") || !steps.includes("các hàng còn lại") || !steps.includes("Kiểm tra") || Number(question.expression.split(" ")[0]) < 100)
    ) {
      throw new Error(`Phép nhân khó cần dùng đặt tính với số lớn: ${question.expression}`);
    }
    if (
      question.operation === "add" &&
      difficulty === "challenge" &&
      (!steps.includes("hàng nghìn") || !steps.includes("nhớ 1"))
    ) {
      throw new Error(`Phép cộng khó cần hướng dẫn theo cột có nhớ: ${question.expression}`);
    }
    if (
      question.operation === "subtract" &&
      difficulty === "challenge" &&
      (!steps.includes("Đặt các chữ số") || !steps.includes("đổi 1 ở hàng bên trái"))
    ) {
      throw new Error(`Phép trừ khó cần hướng dẫn đổi chục/trăm theo cột: ${question.expression}`);
    }
    if (
      question.operation === "divide" &&
      difficulty === "challenge" &&
      (!steps.includes("Đặt tính") || !steps.includes("Chia từ hàng lớn nhất") || !steps.includes("Kiểm tra"))
    ) {
      throw new Error(`Phép chia khó cần hướng dẫn đặt tính và kiểm tra: ${question.expression}`);
    }
  }
};

let checks = 0;
for (const operation of operations) {
  for (const difficulty of difficulties) {
    for (let index = 0; index < 1000; index += 1) {
      validate(quiz.generateQuestion(operation, difficulty), difficulty);
      validate(quiz.generateMissingComponentQuestion(operation, difficulty), difficulty);
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
