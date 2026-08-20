const debugPort = process.env.CDP_PORT ?? "9222";
const previewUrl = "http://localhost:3000/?nowebgl";
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((response) => response.json());
const target = targets.find((item) => item.type === "page");
if (!target?.webSocketDebuggerUrl) throw new Error("Không tìm thấy tab Chromium để chẩn đoán âm thanh.");
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let commandId = 0;
const pending = new Map();
socket.addEventListener("message", ({ data }) => { const message = JSON.parse(data); const item = pending.get(message.id); if (!item) return; pending.delete(message.id); message.error ? item.reject(new Error(message.error.message)) : item.resolve(message.result); });
const command = (method, params = {}) => new Promise((resolve, reject) => { const id = ++commandId; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
const evaluate = async (expression) => (await command("Runtime.evaluate", { expression, returnByValue: true })).result?.value;

try {
  await command("Page.enable");
  await command("Page.addScriptToEvaluateOnNewDocument", { source: `(() => { localStorage.clear(); window.__hanaAudioEvents = []; const originalPlay = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function(...args) { const result = originalPlay.apply(this, args); Promise.resolve(result).then(() => window.__hanaAudioEvents.push({ type: "play-resolved", time: performance.now() }), (error) => window.__hanaAudioEvents.push({ type: "play-rejected", name: error?.name, message: error?.message })); return result; }; })()` });
  await command("Page.navigate", { url: previewUrl });
  await sleep(700);
  const bounds = await evaluate(`(() => { const rect = document.querySelector(".welcome-primary")?.getBoundingClientRect(); return rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null; })()`);
  if (!bounds) throw new Error("Không tìm thấy nút Bắt đầu để kích hoạt âm thanh.");
  await command("Input.dispatchMouseEvent", { type: "mousePressed", x: bounds.x, y: bounds.y, button: "left", clickCount: 1 });
  await command("Input.dispatchMouseEvent", { type: "mouseReleased", x: bounds.x, y: bounds.y, button: "left", clickCount: 1 });
  await sleep(1200);
  const diagnostic = await evaluate(`(() => { const music = document.querySelector("audio[data-hana-background-music]"); return { events: window.__hanaAudioEvents, audio: music ? { src: music.currentSrc || music.src, paused: music.paused, currentTime: music.currentTime, readyState: music.readyState, networkState: music.networkState, volume: music.volume, error: music.error ? { code: music.error.code, message: music.error.message } : null, requested: music.dataset.hanaPlaybackRequested } : null }; })()`);
  const settingsBounds = await evaluate(`(() => { const rect = document.querySelector(".app-settings-trigger")?.getBoundingClientRect(); return rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null; })()`);
  if (!settingsBounds) throw new Error("Không tìm thấy nút Cài đặt bánh răng.");
  await command("Input.dispatchMouseEvent", { type: "mousePressed", x: settingsBounds.x, y: settingsBounds.y, button: "left", clickCount: 1 });
  await command("Input.dispatchMouseEvent", { type: "mouseReleased", x: settingsBounds.x, y: settingsBounds.y, button: "left", clickCount: 1 });
  await sleep(150);
  const settingsText = await evaluate(`document.querySelector(".app-settings-panel")?.textContent?.replace(/\\s+/g, " ").trim()`);
  if (!settingsText?.includes("Ngôn ngữ") || !settingsText.includes("Hướng dẫn") || !settingsText.includes("Âm thanh"))
    throw new Error(`Bảng Cài đặt thiếu điều khiển: ${settingsText}`);
  console.log(JSON.stringify(diagnostic));
} finally { socket.close(); }
