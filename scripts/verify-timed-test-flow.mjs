const debugPort = process.env.CDP_PORT ?? "9265";
const baseUrl = "http://localhost:3000/?nowebgl&lang=vi";
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((response) => response.json());
const page = targets.find((target) => target.type === "page");
if (!page?.webSocketDebuggerUrl) throw new Error("Không tìm thấy Chromium để kiểm thử bài kiểm tra tính giờ.");
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let nextId = 0;
const waiting = new Map();
socket.addEventListener("message", ({ data }) => { const message = JSON.parse(data); const pending = waiting.get(message.id); if (!pending) return; waiting.delete(message.id); message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result); });
const command = (method, params = {}) => new Promise((resolve, reject) => { const id = ++nextId; waiting.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
const evaluate = async (expression) => (await command("Runtime.evaluate", { expression, returnByValue: true })).result?.value;
const waitFor = async (selector) => { for (let attempt = 0; attempt < 70; attempt += 1) { if (await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)) return; await sleep(100); } throw new Error(`Không tìm thấy ${selector}`); };
const inputName = async () => evaluate(`(() => { const input = document.querySelector(".profile-name-field input"); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; setter.call(input, "Minh Anh"); input.dispatchEvent(new Event("input", { bubbles: true })); })()`);

try {
  await command("Page.navigate", { url: baseUrl }); await waitFor(".welcome-primary");
  await evaluate(`document.querySelector(".welcome-primary")?.click()`); await waitFor(".profile-name-field input"); await inputName(); await evaluate(`document.querySelector(".profile-continue")?.click()`); await waitFor(".start-mode-screen");
  const modeLabels = await evaluate(`Array.from(document.querySelectorAll(".start-mode-card strong")).map((node) => node.textContent)`);
  if (JSON.stringify(modeLabels) !== JSON.stringify(["Luyện Tập", "Bài Kiểm Tra"])) throw new Error(`Hai lựa chọn đầu lượt chưa đúng: ${JSON.stringify(modeLabels)}`);
  await evaluate(`document.querySelector(".start-mode-card.is-practice")?.click()`); await waitFor(".activity-grid");
  const activities = await evaluate(`Array.from(document.querySelectorAll(".activity-card strong")).map((node) => node.textContent)`);
  if (activities.length !== 5 || !["Cộng", "Trừ", "Học Bảng Nhân và Chia", "Nhân", "Chia"].every((label) => activities.includes(label))) throw new Error(`Nhánh Luyện Tập chưa có đúng 5 hoạt động: ${JSON.stringify(activities)}`);
  await evaluate(`document.querySelector(".menu-back")?.click()`); await waitFor(".start-mode-screen"); await evaluate(`document.querySelector(".start-mode-card.is-test")?.click()`); await waitFor(".test-setup-screen");
  const setupText = await evaluate(`document.querySelector(".test-setup-screen")?.textContent?.replace(/\\s+/g, " ").trim()`);
  for (const label of ["2 phút", "5 phút", "10 phút", "Làm quen", "Tự tin", "Thám hiểm"]) if (!setupText.includes(label)) throw new Error(`Thiếu cấu hình kiểm tra: ${label}; ${setupText}`);
  await evaluate(`Array.from(document.querySelectorAll(".test-level-options button")).find((button) => button.textContent?.includes("Tự tin"))?.click()`);
  await evaluate(`Array.from(document.querySelectorAll(".test-duration-options button")).find((button) => button.textContent?.includes("2 phút"))?.click()`);
  await evaluate(`document.querySelector(".test-start-button")?.click()`); await waitFor(".mission-control");
  const initialTimer = await evaluate(`document.querySelector(".mission-counter strong")?.textContent`);
  await sleep(1300);
  const laterTimer = await evaluate(`document.querySelector(".mission-counter strong")?.textContent`);
  if (initialTimer !== "2:00" || laterTimer === initialTimer) throw new Error(`Đồng hồ kiểm tra không đếm ngược: ${initialTimer} → ${laterTimer}`);
  const firstExpression = await evaluate(`document.querySelector(".math-expression")?.textContent`);
  await evaluate(`document.querySelector(".answer-button")?.click()`); await waitFor(".feedback-banner"); await evaluate(`document.querySelector(".feedback-action")?.click()`);
  for (let attempt = 0; attempt < 30; attempt += 1) { if (await evaluate(`document.querySelector(".math-expression")?.textContent`) !== firstExpression) break; await sleep(100); }
  const secondExpression = await evaluate(`document.querySelector(".math-expression")?.textContent`);
  if (!secondExpression || secondExpression === firstExpression) throw new Error(`Bài kiểm tra chưa tạo câu mới sau đáp án: ${firstExpression}`);
  const virtualEnd = Date.now() + 125_000;
  await evaluate(`Date.now = () => ${virtualEnd}`); await waitFor(".summary-screen");
  const summary = await evaluate(`document.querySelector(".summary-screen")?.textContent?.replace(/\\s+/g, " ").trim()`);
  for (const label of ["HẾT GIỜ RỒI", "Thời gian: 2:00", "Cấp độ: Tự tin", "Điểm", "Đúng", "Sai"]) if (!summary.includes(label)) throw new Error(`Tổng kết kiểm tra thiếu ${label}: ${summary}`);
  console.log(JSON.stringify({ activities, initialTimer, laterTimer, summary, status: "timed test flow passes" }));
} finally { socket.close(); }
