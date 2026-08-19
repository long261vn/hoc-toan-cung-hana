const debugPort = process.env.CDP_PORT ?? "9243";
const url = "http://localhost:3000/?nowebgl";
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((response) => response.json());
const page = targets.find((target) => target.type === "page");
if (!page?.webSocketDebuggerUrl) throw new Error("Không tìm thấy Chromium để kiểm thử Bài kiểm tra.");
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let nextId = 0;
const waiting = new Map();
socket.addEventListener("message", ({ data }) => { const message = JSON.parse(data); const pending = waiting.get(message.id); if (!pending) return; waiting.delete(message.id); message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result); });
const command = (method, params = {}) => new Promise((resolve, reject) => { const id = ++nextId; waiting.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
const evaluate = async (expression) => (await command("Runtime.evaluate", { expression, returnByValue: true })).result?.value;
const waitFor = async (selector) => { for (let attempt = 0; attempt < 50; attempt += 1) { if (await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)) return; await sleep(100); } throw new Error(`Không tìm thấy ${selector}`); };

try {
  await command("Page.navigate", { url }); await waitFor(".welcome-primary");
  await evaluate(`localStorage.removeItem("hana-active-session-v1")`);
  await evaluate(`document.querySelector(".welcome-primary")?.click()`); await waitFor(".profile-name-field input");
  await evaluate(`(() => { const input = document.querySelector(".profile-name-field input"); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; setter.call(input, "Minh"); input.dispatchEvent(new Event("input", { bubbles: true })); })()`);
  await evaluate(`document.querySelector(".profile-continue")?.click()`); await waitFor(".activity-card");
  await evaluate(`document.querySelectorAll(".activity-card")[5]?.click()`); await waitFor(".math-expression");
  const first = await evaluate(`(() => ({ expression: document.querySelector(".math-expression")?.textContent?.trim(), counter: document.querySelector("[data-current-score] strong")?.textContent, answer: (() => { const [left] = (document.querySelector(".math-expression")?.textContent ?? "").split("="); return Function('"use strict"; return (' + left.replace("×", "*").replace("÷", "/").replace("−", "-") + ");")(); })() }))()`);
  await evaluate(`Array.from(document.querySelectorAll(".answer-button")).find((button) => Number(button.querySelector("strong")?.textContent) !== ${first.answer})?.click()`); await waitFor(".feedback-action.is-retry");
  const wrongFeedback = await evaluate(`({ label: document.querySelector(".feedback-action")?.textContent?.trim(), levelsLocked: Array.from(document.querySelectorAll(".level-switch button")).every((button) => button.disabled) })`);
  if (!wrongFeedback.label?.includes("Câu tiếp") || !wrongFeedback.levelsLocked) throw new Error(`Bài kiểm tra chưa khóa cấp độ/chuyển câu đúng: ${JSON.stringify(wrongFeedback)}`);
  await evaluate(`document.querySelector(".feedback-action")?.click()`); await waitFor(".math-expression");
  const second = await evaluate(`({ expression: document.querySelector(".math-expression")?.textContent?.trim(), counter: document.querySelector("[data-current-score] strong")?.textContent })`);
  if (second.expression === first.expression || second.counter !== "2/8") throw new Error(`Bài kiểm tra không chuyển câu đúng sau đáp án sai: ${JSON.stringify({ first, second })}`);
  console.log(JSON.stringify({ first, wrongFeedback, second, status: "test assessment flow valid" }));
} finally { socket.close(); }
