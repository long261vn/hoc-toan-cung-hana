import { readdir } from "node:fs/promises";
import path from "node:path";

const debugPort = process.env.CDP_PORT ?? "9222";
const previewUrl = "http://localhost:3000/?profile&nowebgl";
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const screenshotDirectory = "/home/ubuntu/screenshots";
const screenshot = (await readdir(screenshotDirectory))
  .filter(name => name.endsWith(".png"))
  .sort()
  .at(-1);

if (!screenshot) throw new Error("Không tìm thấy ảnh PNG để kiểm thử avatar.");

const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then(response => response.json());
const target = targets.find(item => item.type === "page");
if (!target?.webSocketDebuggerUrl) throw new Error("Không tìm thấy tab Chromium để kiểm thử avatar.");
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});
let commandId = 0;
const pending = new Map();
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
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
const evaluate = async expression => (await command("Runtime.evaluate", { expression, returnByValue: true })).result?.value;
const waitFor = async selector => {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)) return;
    await sleep(125);
  }
  throw new Error(`Không tìm thấy ${selector}.`);
};

try {
  await command("Page.navigate", { url: previewUrl });
  await waitFor(".profile-avatar-chooser");
  const hasStoredPhoto = await evaluate(`Boolean(document.querySelector(".avatar-photo-option.is-selected img.player-avatar-photo"))`);
  if (hasStoredPhoto) {
    await evaluate(`document.querySelector(".avatar-option-grid button")?.click()`);
  }
  await waitFor(".avatar-photo-option input");
  const document = await command("DOM.getDocument", { depth: 1 });
  const node = await command("DOM.querySelector", {
    nodeId: document.root.nodeId,
    selector: ".avatar-photo-option input",
  });
  if (!node.nodeId) throw new Error("Không tìm thấy input tải avatar.");
  await command("DOM.setFileInputFiles", {
    nodeId: node.nodeId,
    files: [path.join(screenshotDirectory, screenshot)],
  });
  await waitFor(".avatar-photo-option.is-selected img.player-avatar-photo");
  const result = await evaluate(`(() => {
    const image = document.querySelector(".avatar-photo-option.is-selected img.player-avatar-photo");
    return { src: image?.getAttribute("src") ?? "", error: document.querySelector(".avatar-upload-error")?.textContent?.trim() ?? "" };
  })()`);
  if (!/^\/manus-storage\/hana-avatars\/.+\.jpg$/i.test(result.src) || result.error) {
    throw new Error(`Avatar ảnh chưa được lưu/hiển thị đúng: ${JSON.stringify(result)}`);
  }
  const storedBeforeReload = await evaluate(`localStorage.getItem("hana-player-avatar-photo-v1") ?? ""`);
  await command("Page.reload");
  await sleep(700);
  await waitFor(".avatar-photo-option.is-selected img.player-avatar-photo");
  const restored = await evaluate(`({ src: document.querySelector(".avatar-photo-option.is-selected img.player-avatar-photo")?.getAttribute("src") ?? "", stored: localStorage.getItem("hana-player-avatar-photo-v1") ?? "", selected: document.querySelector(".avatar-photo-option")?.className ?? "" })`);
  if (restored.src !== result.src) throw new Error(`Avatar ảnh không được giữ sau tải lại: ${JSON.stringify({ result, storedBeforeReload, restored })}`);
  await evaluate(`document.querySelector(".avatar-option-grid button")?.click()`);
  await waitFor(".avatar-option-grid button.is-selected");
  const switchedBack = await evaluate(`({ photo: localStorage.getItem("hana-player-avatar-photo-v1"), selected: document.querySelector(".avatar-option-grid button.is-selected")?.getAttribute("aria-checked") ?? "", photoVisible: Boolean(document.querySelector(".avatar-photo-option.is-selected img.player-avatar-photo")) })`);
  if (switchedBack.photo || switchedBack.selected !== "true" || switchedBack.photoVisible) throw new Error(`Không thể đổi về avatar có sẵn: ${JSON.stringify(switchedBack)}`);
  await command("Page.reload");
  await sleep(700);
  await waitFor(".avatar-photo-option input");
  const reloadedDocument = await command("DOM.getDocument", { depth: 1 });
  const reloadedNode = await command("DOM.querySelector", {
    nodeId: reloadedDocument.root.nodeId,
    selector: ".avatar-photo-option input",
  });
  await command("DOM.setFileInputFiles", {
    nodeId: reloadedNode.nodeId,
    files: [path.join(screenshotDirectory, screenshot)],
  });
  await waitFor(".avatar-photo-option.is-selected img.player-avatar-photo");
  const selectedAgain = await evaluate(`document.querySelector(".avatar-photo-option.is-selected img.player-avatar-photo")?.getAttribute("src") ?? ""`);
  if (!/^\/manus-storage\/hana-avatars\/.+\.jpg$/i.test(selectedAgain)) throw new Error(`Không thể chọn lại avatar ảnh: ${selectedAgain}`);
  console.log(JSON.stringify({ result, restored, selectedAgain, status: "custom avatar upload, reload and switching valid" }));
} finally {
  socket.close();
}
