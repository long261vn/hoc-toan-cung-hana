import { mkdir, readdir, rm } from "node:fs/promises";

const debugPort = process.env.CDP_PORT ?? "9239";
const downloadPath = "/tmp/hana-souvenir-audit-download";
const previewUrl = "http://localhost:3000/?summary";
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

await rm(downloadPath, { recursive: true, force: true });
await mkdir(downloadPath, { recursive: true });
const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((response) => response.json());
const page = targets.find((target) => target.type === "page");
if (!page?.webSocketDebuggerUrl) throw new Error("Không tìm thấy Chromium để chẩn đoán ảnh kỷ niệm.");

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});
let nextId = 0;
const pending = new Map();
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  const request = pending.get(message.id);
  if (!request) return;
  pending.delete(message.id);
  message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result);
});
const command = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++nextId;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
const inspect = async () => (await command("Runtime.evaluate", {
  returnByValue: true,
  expression: `({
    status: document.querySelector(".image-save-status")?.textContent ?? "",
    disabled: document.querySelector(".save-memory")?.disabled ?? null,
    button: document.querySelector(".save-memory")?.textContent?.trim() ?? ""
  })`,
})).result?.value;

try {
  await command("Page.enable");
  await command("Page.setDownloadBehavior", { behavior: "allow", downloadPath });
  await command("Page.navigate", { url: previewUrl });
  await sleep(1800);
  await command("Runtime.evaluate", { expression: `document.querySelector(".save-memory")?.click()` });
  const samples = [];
  for (const seconds of [3, 8, 15]) {
    await sleep(seconds === 3 ? 3000 : seconds === 8 ? 5000 : 7000);
    samples.push({ seconds, ui: await inspect(), files: await readdir(downloadPath) });
  }
  console.log(JSON.stringify({ samples }));
} finally {
  socket.close();
}
