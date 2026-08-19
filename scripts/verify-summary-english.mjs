const debugPort = process.env.CDP_PORT ?? "9264";
const url = "http://localhost:3000/?summary&lang=en&nowebgl";
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((response) => response.json());
const page = targets.find((target) => target.type === "page");
if (!page?.webSocketDebuggerUrl) throw new Error("Không tìm thấy Chromium để kiểm thử màn tổng kết English.");
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let nextId = 0;
const waiting = new Map();
socket.addEventListener("message", ({ data }) => { const message = JSON.parse(data); const pending = waiting.get(message.id); if (!pending) return; waiting.delete(message.id); message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result); });
const command = (method, params = {}) => new Promise((resolve, reject) => { const id = ++nextId; waiting.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
const evaluate = async (expression) => (await command("Runtime.evaluate", { expression, returnByValue: true })).result?.value;
const waitFor = async (selector) => { for (let attempt = 0; attempt < 50; attempt += 1) { if (await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)) return; await sleep(100); } throw new Error(`Không tìm thấy ${selector}`); };

try {
  await command("Page.navigate", { url }); await waitFor(".summary-screen");
  const summary = await evaluate(`document.querySelector(".summary-screen")?.textContent?.replace(/\\s+/g, " ").trim()`);
  const vietnamese = /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i.test(summary) || /Phi Hành|Phép Tính|Điểm|Đúng|Sai|Thời gian|Phần thưởng|Cấp|Chưa mở|Lượt học|thật đáng/i.test(summary);
  if (vietnamese) throw new Error(`Màn tổng kết ENG còn tiếng Việt: ${summary}`);
  for (const expected of ["ROBOT HANA CONGRATULATES", "Points", "Correct", "Incorrect", "Time", "HIGHEST REWARD", "Level", "Save souvenir image", "Start a new session"]) {
    if (!summary.includes(expected)) throw new Error(`Thiếu nhãn English “${expected}”: ${summary}`);
  }
  console.log(JSON.stringify({ summary, status: "summary English complete" }));
} finally { socket.close(); }
