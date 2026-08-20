const debugPort = process.env.CDP_PORT ?? "9229";
const url = "http://localhost:3000/?nowebgl&lang=vi";
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((response) => response.json());
const page = targets.find((target) => target.type === "page");
if (!page?.webSocketDebuggerUrl) throw new Error("Không tìm thấy Chromium để kiểm thử điều khiển nhiệm vụ.");
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let nextId = 0;
const waiting = new Map();
socket.addEventListener("message", ({ data }) => { const message = JSON.parse(data); const pending = waiting.get(message.id); if (!pending) return; waiting.delete(message.id); message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result); });
const command = (method, params = {}) => new Promise((resolve, reject) => { const id = ++nextId; waiting.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
const evaluate = async (expression) => (await command("Runtime.evaluate", { expression, returnByValue: true })).result?.value;
const waitFor = async (selector) => { for (let retry = 0; retry < 30; retry += 1) { if (await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)) return; await sleep(100); } throw new Error(`Không tìm thấy ${selector}`); };
const openPractice = async () => {
  await command("Page.navigate", { url }); await waitFor(".welcome-primary");
  await evaluate(`document.querySelector(".welcome-primary")?.click()`); await waitFor(".profile-name-field input");
  await evaluate(`(() => { const input = document.querySelector(".profile-name-field input"); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; setter.call(input, "Minh"); input.dispatchEvent(new Event("input", { bubbles: true })); })()`);
  await evaluate(`document.querySelector(".profile-continue")?.click()`); await waitFor(".start-mode-card.is-practice");
  await evaluate(`document.querySelector(".start-mode-card.is-practice")?.click()`); await waitFor(".activity-card");
  await evaluate(`document.querySelector(".activity-card")?.click()`); await waitFor(".format-option");
  await evaluate(`document.querySelector(".format-option")?.click()`); await waitFor(".session-bottom-actions");
};
try {
  await openPractice();
  const visible = await evaluate(`({
    change: document.querySelector(".session-change-mission")?.textContent?.trim(),
    end: document.querySelector(".session-end-button")?.textContent?.trim(),
    endCount: document.querySelectorAll(".session-end-button").length,
    oldTopEndCount: document.querySelectorAll(".mission-end-button, .end-session-footer, .mobile-end-session").length
  })`);
  if (!visible.change?.includes("Đổi nhiệm vụ") || !visible.end?.includes("Kết thúc lượt")) throw new Error(`Thiếu nhãn điều khiển điện thoại: ${JSON.stringify(visible)}`);
  if (visible.endCount !== 1 || visible.oldTopEndCount !== 0) throw new Error(`Điều khiển kết thúc lượt bị trùng hoặc còn ở vị trí cũ: ${JSON.stringify(visible)}`);
  await evaluate(`document.querySelector(".session-change-mission")?.click()`); await waitFor(".activity-card");
  await openPractice();
  await evaluate(`document.querySelector(".session-end-button")?.click()`); await waitFor(".end-session-confirm-card");
  const summaryBeforeConfirm = await evaluate(`Boolean(document.querySelector(".summary-screen"))`);
  if (summaryBeforeConfirm) throw new Error("Kết thúc lượt đã mở tổng kết mà chưa cần xác nhận.");
  await evaluate(`document.querySelector(".end-session-confirm-action")?.click()`); await waitFor(".summary-screen");
  console.log(JSON.stringify({ visible, status: "single mobile mission action bar valid" }));
} finally { socket.close(); }
