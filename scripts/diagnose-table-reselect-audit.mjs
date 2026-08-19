const debugPort = process.env.CDP_PORT ?? "9240";
const url = "http://localhost:3000/?nowebgl";
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((response) => response.json());
const page = targets.find((target) => target.type === "page");
if (!page?.webSocketDebuggerUrl) throw new Error("Không tìm thấy Chromium để kiểm tra chọn lại bảng.");
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let nextId = 0;
const waiting = new Map();
socket.addEventListener("message", ({ data }) => { const message = JSON.parse(data); const pending = waiting.get(message.id); if (!pending) return; waiting.delete(message.id); message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result); });
const command = (method, params = {}) => new Promise((resolve, reject) => { const id = ++nextId; waiting.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
const evaluate = async (expression) => (await command("Runtime.evaluate", { expression, returnByValue: true })).result?.value;
const waitFor = async (selector) => { for (let retry = 0; retry < 40; retry += 1) { if (await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)) return; await sleep(100); } throw new Error(`Không tìm thấy ${selector}`); };
const clickText = async (selector, text) => evaluate(`Array.from(document.querySelectorAll(${JSON.stringify(selector)})).find((node) => node.textContent?.trim() === ${JSON.stringify(text)})?.click()`);

try {
  await command("Page.navigate", { url }); await waitFor(".welcome-primary");
  await evaluate(`document.querySelector(".welcome-primary")?.click()`); await waitFor(".profile-name-field input");
  await evaluate(`(() => { const input = document.querySelector(".profile-name-field input"); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; setter.call(input, "Minh"); input.dispatchEvent(new Event("input", { bubbles: true })); })()`);
  await evaluate(`document.querySelector(".profile-continue")?.click()`); await waitFor(".activity-card");
  await evaluate(`document.querySelectorAll(".activity-card")[2]?.click()`); await waitFor(".table-number-grid");
  await clickText(".table-number-grid button", "2"); await waitFor(".math-expression");
  const first = await evaluate(`document.querySelector(".math-expression")?.textContent?.trim()`);
  await evaluate(`Array.from(document.querySelectorAll(".table-picker-actions button")).find((node) => node.textContent?.includes("Bỏ Chọn"))?.click()`); await waitFor(".table-empty-state");
  await clickText(".table-number-grid button", "2"); await waitFor(".math-expression");
  const second = await evaluate(`document.querySelector(".math-expression")?.textContent?.trim()`);
  console.log(JSON.stringify({ first, second, regenerated: first !== second }));
} finally { socket.close(); }
