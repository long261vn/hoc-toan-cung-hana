import { mkdir, readdir, rm } from "node:fs/promises";

const debugPort = process.env.CDP_PORT ?? "9222";
const downloadPath = "/tmp/hana-souvenir-download";
const previewUrl = "http://localhost:3000/?summary";

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

await rm(downloadPath, { recursive: true, force: true });
await mkdir(downloadPath, { recursive: true });

const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((response) => response.json());
const target = targets.find((item) => item.type === "page");
if (!target?.webSocketDebuggerUrl) throw new Error("Không tìm thấy tab Chromium để kiểm thử tải ảnh.");

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
  await command("Page.setDownloadBehavior", { behavior: "allow", downloadPath });
  await command("Page.navigate", { url: previewUrl });
  await sleep(1800);
  await command("Runtime.evaluate", {
    awaitPromise: true,
    expression: `(() => {
      const button = document.querySelector("button.save-memory");
      if (!button) throw new Error("Không tìm thấy nút Lưu ảnh kỷ niệm");
      button.click();
      return true;
    })()`,
  });
  let pngFile;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const files = await readdir(downloadPath);
    pngFile = files.find((file) => file.endsWith(".png"));
    if (pngFile) break;
    await sleep(100);
  }
  const status = await command("Runtime.evaluate", {
    returnByValue: true,
    expression: `document.querySelector(".image-save-status")?.textContent ?? ""`,
  });
  if (!pngFile) throw new Error(`Không thấy tệp PNG được tải xuống. Trạng thái: ${status.result?.value ?? "trống"}`);
  console.log(JSON.stringify({ download: pngFile, status: status.result?.value ?? "" }));
} finally {
  socket.close();
}
