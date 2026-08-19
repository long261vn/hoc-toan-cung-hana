import { generateMissingComponentQuestion } from "../client/src/game/quiz.ts";

const operations = ["add", "subtract", "multiply", "divide"];
const difficulties = ["easy", "medium", "challenge"];

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}

function verifyExpression(question) {
  const normalized = question.expression.replace(/\s/g, "");
  const [left, right] = normalized.split("=");
  const answer = question.answer;

  if (question.operation === "add") {
    const [a, b] = left.split("+");
    ensure((a === "?" ? answer + Number(b) : Number(a) + answer) === Number(right), `${question.expression} has an invalid answer`);
  }
  if (question.operation === "subtract") {
    const [a, b] = left.split("−");
    ensure((a === "?" ? answer - Number(b) : Number(a) - answer) === Number(right), `${question.expression} has an invalid answer`);
  }
  if (question.operation === "multiply") {
    const [a, b] = left.split("×");
    ensure((a === "?" ? answer * Number(b) : Number(a) * answer) === Number(right), `${question.expression} has an invalid answer`);
  }
  if (question.operation === "divide") {
    const [a, b] = left.split("÷");
    ensure((a === "?" ? answer / Number(b) : Number(a) / answer) === Number(right), `${question.expression} has an invalid answer`);
    ensure(answer > 0, `${question.expression} generated a non-positive divisor or dividend`);
  }
}

let count = 0;
for (const operation of operations) {
  for (const difficulty of difficulties) {
    for (let index = 0; index < 250; index += 1) {
      const question = generateMissingComponentQuestion(operation, difficulty);
      ensure(question.kind === "missing", "Question kind must be missing");
      ensure(question.options.length === 4, `${question.expression} must have four options`);
      ensure(new Set(question.options).size === 4, `${question.expression} has duplicate options`);
      ensure(question.options.includes(question.answer), `${question.expression} is missing its correct answer`);
      ensure(question.options.every((option) => Number.isInteger(option) && option >= 1), `${question.expression} has an invalid option`);
      verifyExpression(question);
      count += 1;
    }
  }
}

console.log(`Verified ${count} missing-component questions across all operations and difficulty levels.`);
