const debugPort = process.env.CDP_PORT ?? "9222";
const previewUrl = "http://localhost:3000/?nowebgl&lang=vi";
const sleep = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then(response => response.json());
const page = targets.find(target => target.type === "page");
if (!page?.webSocketDebuggerUrl) throw new Error("Không tìm thấy tab Chromium để kiểm thử nhóm điều khiển học tập.");

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});
let nextId = 0;
const waiting = new Map();
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  const pending = waiting.get(message.id);
  if (!pending) return;
  waiting.delete(message.id);
  message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result);
});
const command = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++nextId;
  waiting.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => (await command("Runtime.evaluate", { expression, returnByValue: true })).result?.value;
const waitFor = async selector => {
  for (let attempt = 0; attempt < 35; attempt += 1) {
    if (await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)) return;
    await sleep(100);
  }
  throw new Error(`Không tìm thấy ${selector}`);
};
const openPractice = async () => {
  await command("Page.navigate", { url: previewUrl });
  await waitFor(".welcome-primary");
  await evaluate(`document.querySelector(".welcome-primary")?.click()`);
  await waitFor(".profile-name-field input");
  await evaluate(`(() => { const input = document.querySelector(".profile-name-field input"); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; setter.call(input, "Minh"); input.dispatchEvent(new Event("input", { bubbles: true })); })()`);
  await evaluate(`document.querySelector(".profile-continue")?.click()`);
  await waitFor(".start-mode-card.is-practice");
  await evaluate(`document.querySelector(".start-mode-card.is-practice")?.click()`);
  await waitFor(".activity-card");
  await evaluate(`document.querySelector(".activity-card")?.click()`);
  await waitFor(".mission-study-controls");
};
const validateVisibleLayout = async (width, height) => {
  const layout = await evaluate(`(() => {
    const selectors = [".mission-study-controls", ".mission-format-options", ".mission-difficulty-options", ".question-panel", ".answer-grid", ".session-bottom-actions"];
    const rect = selector => { const node = document.querySelector(selector); if (!node) return null; const { left, top, right, bottom, width, height } = node.getBoundingClientRect(); return { left, top, right, bottom, width, height }; };
    const controls = Array.from(document.querySelectorAll(".mission-study-controls button")).map(button => { const { left, top, right, bottom } = button.getBoundingClientRect(); return { text: button.textContent.trim(), left, top, right, bottom }; });
    const overlap = controls.some((first, index) => controls.slice(index + 1).some(second => Math.max(first.left, second.left) < Math.min(first.right, second.right) && Math.max(first.top, second.top) < Math.min(first.bottom, second.bottom)));
    return { rects: Object.fromEntries(selectors.map(selector => [selector, rect(selector)])), controls, overlap, viewport: { width: innerWidth, height: innerHeight } };
  })()`);
  if (layout.controls.length !== 6 || layout.overlap) throw new Error(`Nhóm điều khiển bị thiếu hoặc chồng lấn ở ${width}×${height}: ${JSON.stringify(layout)}`);
  for (const [selector, rect] of Object.entries(layout.rects)) {
    if (!rect || rect.width <= 0 || rect.height <= 0 || rect.left < 0 || rect.right > width || rect.top < 0 || rect.bottom > height)
      throw new Error(`Khối ${selector} không vừa khung ${width}×${height}: ${JSON.stringify(rect)}`);
  }
  return layout;
};

try {
  const reports = [];
  for (const [width, height] of [[320, 568], [375, 812], [1280, 720]]) {
    await command("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 760 });
    await openPractice();
    const initialExpression = await evaluate(`document.querySelector(".math-expression")?.textContent?.trim()`);
    await evaluate(`document.querySelectorAll(".mission-format-options button")[1]?.click()`);
    await sleep(80);
    const missingExpression = await evaluate(`document.querySelector(".math-expression")?.textContent?.trim()`);
    if (!missingExpression?.includes("?")) throw new Error(`Dạng Tìm thành phần chưa tạo đúng câu hỏi ở ${width}×${height}: ${missingExpression}`);
    await evaluate(`document.querySelectorAll(".mission-difficulty-options button")[2]?.click()`);
    await sleep(80);
    const challengeActive = await evaluate(`document.querySelectorAll(".mission-difficulty-options button")[2]?.classList.contains("is-active")`);
    if (!challengeActive) throw new Error(`Mức độ Thám hiểm chưa đổi ở ${width}×${height}`);
    reports.push({ width, height, initialExpression, missingExpression, layout: await validateVisibleLayout(width, height) });
  }
  console.log(JSON.stringify({ reports: reports.map(({ width, height, initialExpression, missingExpression }) => ({ width, height, initialExpression, missingExpression })), status: "fixed study controls valid" }));
} finally {
  await command("Emulation.clearDeviceMetricsOverride").catch(() => undefined);
  socket.close();
}
