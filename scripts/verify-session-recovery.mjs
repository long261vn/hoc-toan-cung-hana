const debugPort = process.env.CDP_PORT ?? "9242";
const url = "http://localhost:3000/?nowebgl";
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((response) => response.json());
const page = targets.find((target) => target.type === "page");
if (!page?.webSocketDebuggerUrl) throw new Error("Không tìm thấy Chromium để kiểm thử khôi phục lượt học.");
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
  await evaluate(`document.querySelector(".activity-card")?.click()`); await waitFor(".format-option");
  await evaluate(`document.querySelector(".format-option")?.click()`); await waitFor(".math-expression");
  const before = await evaluate(`(() => { const expression = document.querySelector(".math-expression")?.textContent?.trim(); const [left] = expression.split("="); const answer = Function('"use strict"; return (' + left.replace("×", "*").replace("÷", "/").replace("−", "-") + ");")(); return { expression, answer }; })()`);
  await evaluate(`Array.from(document.querySelectorAll(".answer-button")).find((button) => Number(button.querySelector("strong")?.textContent) === ${before.answer})?.click()`);
  await sleep(450);
  await command("Page.reload"); await waitFor(".resume-session-card");
  const saved = await evaluate(`({ dialog: document.querySelector(".resume-session-card")?.textContent?.replace(/\\s+/g, " ").trim(), score: document.querySelector(".resume-session-stats strong")?.textContent })`);
  if (!saved.dialog?.includes("Lượt học trước của bạn vẫn ở đây!") || saved.score !== "10") throw new Error(`Không khôi phục đúng bản nháp: ${JSON.stringify(saved)}`);
  await evaluate(`document.querySelector(".resume-session-continue")?.click()`); await waitFor(".math-expression");
  const restored = await evaluate(`({ expression: document.querySelector(".math-expression")?.textContent?.trim(), score: document.querySelector("[data-current-score] strong")?.textContent })`);
  if (restored.expression !== before.expression || restored.score !== "10") throw new Error(`Nội dung khôi phục không đúng: ${JSON.stringify({ before, restored })}`);
  console.log(JSON.stringify({ before, saved, restored, status: "session recovery valid" }));
} finally { socket.close(); }
