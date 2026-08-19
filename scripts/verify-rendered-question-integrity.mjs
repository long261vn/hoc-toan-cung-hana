const debugPort = process.env.CDP_PORT ?? "9222";
const previewUrl = "http://localhost:3000/?nowebgl";
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((response) => response.json());
const target = targets.find((item) => item.type === "page");
if (!target?.webSocketDebuggerUrl) throw new Error("Không tìm thấy tab Chromium để kiểm thử câu hỏi trên giao diện.");
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let commandId = 0;
const pending = new Map();
socket.addEventListener("message", ({ data }) => { const message = JSON.parse(data); const item = pending.get(message.id); if (!item) return; pending.delete(message.id); message.error ? item.reject(new Error(message.error.message)) : item.resolve(message.result); });
const command = (method, params = {}) => new Promise((resolve, reject) => { const id = ++commandId; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
const evaluate = async (expression) => (await command("Runtime.evaluate", { expression, returnByValue: true })).result?.value;
const waitFor = async (selector, description) => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)) return;
    await sleep(100);
  }
  const state = await evaluate(`({ text: document.querySelector("main")?.textContent?.slice(0, 180), screen: document.querySelector(".activity-screen, .format-screen, .mission-screen, .profile-screen")?.className })`);
  throw new Error(`Chờ quá lâu: ${description}. Trạng thái: ${JSON.stringify(state)}`);
};
const normalize = (text) => text.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
const isValidPair = ({ expression, options }) => {
  if (!expression || options.length !== 4 || new Set(options).size !== 4 || options.some((item) => !Number.isInteger(item) || item < 0)) return false;
  const [left, right] = normalize(expression).split("=").map((part) => part.trim());
  const valid = options.filter((option) => {
    if (left.includes("?")) return Function(`"use strict"; return (${left.replace("?", String(option))}) === (${right});`)();
    return Function(`"use strict"; return (${left}) === (${option});`)();
  });
  return valid.length === 1;
};
const readQuestion = () => evaluate(`({ expression: document.querySelector(".math-expression")?.textContent?.trim() ?? "", options: Array.from(document.querySelectorAll(".answer-button strong")).map((node) => Number(node.textContent.trim())) })`);
const assertQuestion = async (label) => {
  const question = await readQuestion();
  if (!isValidPair(question)) throw new Error(`Câu hỏi/đáp án lệch hoặc sai tại ${label}: ${JSON.stringify(question)}`);
  return question;
};
const correctOptionFor = (question) => {
  const [left, right] = normalize(question.expression).split("=").map((part) => part.trim());
  return question.options.find((option) => Function(`"use strict"; return (${left.includes("?") ? left.replace("?", String(option)) : left}) === (${right.includes("?") ? right.replace("?", String(option)) : right});`)());
};
const answerAndAdvance = async (question, isLast = false) => {
  const correct = correctOptionFor(question);
  if (correct === undefined) throw new Error(`Không tìm được đáp án đúng trên giao diện: ${JSON.stringify(question)}`);
  await evaluate(`Array.from(document.querySelectorAll(".answer-button")).find((button) => Number(button.querySelector("strong")?.textContent) === ${correct})?.click()`);
  await waitFor(".feedback-banner", "phản hồi sau đáp án đúng");
  if (!isLast) {
    await evaluate(`document.querySelector(".feedback-banner button")?.click()`);
    await sleep(100);
    await waitFor(".math-expression", "câu hỏi tiếp theo");
  }
};
const runSequence = async (flow, count, reports) => {
  for (let step = 1; step <= count; step += 1) {
    const question = await assertQuestion(`${flow} · câu ${step}`);
    reports.push({ flow: `${flow} · ${step}`, ...question });
    await answerAndAdvance(question, step === count);
  }
};
const startToMenu = async () => {
  await command("Page.navigate", { url: previewUrl });
  await waitFor(".welcome-primary", "màn chào mừng");
  await evaluate(`document.querySelector(".welcome-primary")?.click()`);
  await waitFor(".profile-name-field input", "màn nhập tên");
  await evaluate(`(() => { const input = document.querySelector(".profile-name-field input"); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; setter.call(input, "Minh Anh"); input.dispatchEvent(new Event("input", { bubbles: true })); })()`);
  await evaluate(`document.querySelector(".profile-continue")?.click()`);
  await waitFor(".activity-card", "menu hoạt động");
};
const chooseActivity = async (index, formatIndex = null) => {
  await evaluate(`document.querySelectorAll(".activity-card")[${index}]?.click()`);
  if (formatIndex !== null) {
    await waitFor(".format-option", "màn chọn dạng bài");
    await evaluate(`document.querySelectorAll(".format-option")[${formatIndex}]?.click()`);
    await waitFor(".math-expression", "câu hỏi phép tính");
  } else {
    await waitFor(".table-practice-panel, .math-expression", "màn luyện bảng hoặc kiểm tra");
  }
};

try {
  await command("Page.enable");
  const reports = [];
  const activities = [
    { label: "Cộng", index: 0 }, { label: "Trừ", index: 1 }, { label: "Nhân", index: 3 }, { label: "Chia", index: 4 },
  ];
  for (const activity of activities) {
    for (const [formatIndex, format] of [[0, "thường"], [1, "tìm thành phần"], [2, "hỗn hợp"]]) {
      await startToMenu();
      await chooseActivity(activity.index, formatIndex);
      await runSequence(`${activity.label} · ${format}`, 8, reports);
    }
  }

  await startToMenu();
  await chooseActivity(2);
  const beforeTables = await evaluate(`Boolean(document.querySelector(".table-empty-state"))`);
  if (!beforeTables) throw new Error("Bảng nhân–chia không yêu cầu chọn bảng trước khi hiện câu hỏi.");
  await evaluate(`Array.from(document.querySelectorAll(".table-number-grid button")).find((button) => button.textContent.trim() === "2")?.click()`);
  await sleep(220);
  await runSequence("Bảng nhân 2", 8, reports);
  for (const [kindIndex, kind] of [[1, "Bảng chia"], [2, "Cả nhân và chia"]]) {
    await evaluate(`document.querySelectorAll(".table-kind-switch button")[${kindIndex}]?.click()`);
    await sleep(120);
    await waitFor(".math-expression", `câu hỏi ${kind}`);
    await runSequence(kind, 8, reports);
  }

  await startToMenu();
  await chooseActivity(5);
  await runSequence("Bài kiểm tra", 8, reports);
  console.log(JSON.stringify({ checkedFlows: reports.length, sample: reports.slice(0, 4), result: "all rendered question-answer pairs valid" }));
} finally { socket.close(); }
