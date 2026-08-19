const debugPort = process.env.CDP_PORT ?? "9222";
const previewUrl = "http://localhost:3000/";
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((response) => response.json());
const target = targets.find((item) => item.type === "page");
if (!target?.webSocketDebuggerUrl) throw new Error("Không tìm thấy tab Chromium để kiểm thử ngôn ngữ.");

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let commandId = 0;
const pending = new Map();
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (!message.id) return;
  const request = pending.get(message.id);
  if (!request) return;
  pending.delete(message.id);
  message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result);
});
const command = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++commandId;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});

try {
  await command("Page.enable");
  await command("Page.navigate", { url: previewUrl });
  await sleep(1400);
  await command("Runtime.evaluate", { expression: `localStorage.removeItem("hana-language")` });
  await command("Page.reload", { ignoreCache: true });
  await sleep(1000);
  const vietnamese = await command("Runtime.evaluate", { returnByValue: true, expression: `document.querySelector(".welcome-primary")?.textContent?.trim()` });
  await command("Runtime.evaluate", { expression: `document.querySelector(".language-toggle")?.click()` });
  await sleep(450);
  const english = await command("Runtime.evaluate", { returnByValue: true, expression: `document.querySelector(".welcome-primary")?.textContent?.trim()` });
  await command("Runtime.evaluate", { expression: `document.querySelector(".language-toggle")?.click()` });
  await sleep(450);
  const restored = await command("Runtime.evaluate", { returnByValue: true, expression: `document.querySelector(".welcome-primary")?.textContent?.trim()` });
  const report = { vietnamese: vietnamese.result?.value, english: english.result?.value, restored: restored.result?.value };
  if (report.vietnamese !== "Bắt đầu" || report.english !== "Start" || report.restored !== "Bắt đầu") throw new Error(`Đổi ngôn ngữ chưa đúng: ${JSON.stringify(report)}`);
  console.log(JSON.stringify(report));
} finally {
  socket.close();
}
