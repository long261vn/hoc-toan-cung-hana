const debugPort = process.env.CDP_PORT ?? "9222";
const previewUrl = "http://localhost:3000/?nowebgl";
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then(response => response.json());
const target = targets.find(item => item.type === "page");
if (!target?.webSocketDebuggerUrl) throw new Error("Không tìm thấy tab Chromium để kiểm thử ngôn ngữ.");
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let commandId = 0;
const pending = new Map();
socket.addEventListener("message", ({ data }) => { const message = JSON.parse(data); const request = pending.get(message.id); if (!request) return; pending.delete(message.id); message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result); });
const command = (method, params = {}) => new Promise((resolve, reject) => { const id = ++commandId; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
const evaluate = async expression => (await command("Runtime.evaluate", { expression, returnByValue: true })).result?.value;
const waitFor = async selector => { for (let attempt = 0; attempt < 40; attempt += 1) { if (await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)) return; await sleep(100); } throw new Error(`Không tìm thấy ${selector}`); };
const toggleFromSettings = async expectedRowText => {
  await evaluate(`document.querySelector(".app-settings-trigger")?.click()`);
  await waitFor("button.app-settings-row");
  const clicked = await evaluate(`(() => { const button = Array.from(document.querySelectorAll("button.app-settings-row")).find(button => button.textContent?.includes(${JSON.stringify(expectedRowText)})); if (!button) return false; button.click(); return true; })()`);
  if (clicked === false) throw new Error(`Không tìm thấy mục ${expectedRowText} trong Cài đặt.`);
  await sleep(300);
};
try {
  await command("Page.enable");
  await command("Page.addScriptToEvaluateOnNewDocument", { source: `localStorage.removeItem("hana-language")` });
  await command("Page.navigate", { url: previewUrl });
  await waitFor(".welcome-primary");
  const vietnamese = await evaluate(`({ label: document.querySelector(".welcome-primary")?.textContent?.trim(), lang: document.documentElement.lang })`);
  await toggleFromSettings("Ngôn ngữ");
  const english = await evaluate(`({ label: document.querySelector(".welcome-primary")?.textContent?.trim(), lang: document.documentElement.lang, stored: localStorage.getItem("hana-language") })`);
  await toggleFromSettings("Language");
  const restored = await evaluate(`({ label: document.querySelector(".welcome-primary")?.textContent?.trim(), lang: document.documentElement.lang, stored: localStorage.getItem("hana-language") })`);
  if (vietnamese.label !== "Bắt đầu" || vietnamese.lang !== "vi" || english.label !== "Start" || english.lang !== "en" || english.stored !== "en" || restored.label !== "Bắt đầu" || restored.lang !== "vi" || restored.stored !== "vi") throw new Error(`Đổi ngôn ngữ trong Cài đặt chưa đúng: ${JSON.stringify({ vietnamese, english, restored })}`);
  console.log(JSON.stringify({ vietnamese, english, restored, status: "settings language toggle valid" }));
} finally { socket.close(); }
