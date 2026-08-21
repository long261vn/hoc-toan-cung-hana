const debugPort = process.env.CDP_PORT ?? "9222";
const previewUrl = "http://localhost:3000/?score&nowebgl";
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then(response => response.json());
const target = targets.find(item => item.type === "page");
if (!target?.webSocketDebuggerUrl) throw new Error("Không tìm thấy tab Chromium để kiểm thử giao diện nhiệm vụ.");
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let commandId = 0;
const pending = new Map();
socket.addEventListener("message", ({ data }) => { const message = JSON.parse(data); const item = pending.get(message.id); if (!item) return; pending.delete(message.id); message.error ? item.reject(new Error(message.error.message)) : item.resolve(message.result); });
const command = (method, params = {}) => new Promise((resolve, reject) => { const id = ++commandId; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
const evaluate = async expression => (await command("Runtime.evaluate", { expression, returnByValue: true })).result?.value;
const waitFor = async selector => { for (let attempt = 0; attempt < 30; attempt += 1) { if (await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)) return; await sleep(100); } throw new Error(`Không tìm thấy ${selector}`); };
try {
  await command("Page.navigate", { url: previewUrl }); await waitFor(".mission-control");
  const report = await evaluate(`(() => { const score = document.querySelector("[data-current-score]"); const actions = document.querySelector(".session-bottom-actions"); return { legacyHeader: Boolean(document.querySelector(".mission-header")), legacyReveal: Boolean(document.querySelector(".mission-menu-reveal")), scoreCount: document.querySelectorAll("[data-current-score]").length, scoreButton: score?.tagName, scoreLabel: score?.textContent?.replace(/\s+/g, " ").trim(), actionsVisible: Boolean(actions) && actions.getBoundingClientRect().height > 0, hasLanguageGlyph: Boolean(document.querySelector(".language-glyph")) }; })()`);
  if (report.legacyHeader || report.legacyReveal || report.scoreCount !== 1 || report.scoreButton !== "BUTTON" || !report.scoreLabel?.includes("Điểm hiện tại") || !report.actionsVisible || report.hasLanguageGlyph) throw new Error(`Bố cục nhiệm vụ hiện tại chưa gọn hoặc có phần menu cũ: ${JSON.stringify(report)}`);
  console.log(JSON.stringify({ report, status: "current mission layout has no legacy auto-collapse menu" }));
} finally { socket.close(); }
