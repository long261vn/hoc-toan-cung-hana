import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const debugPort = process.env.CDP_PORT ?? "9222";
const downloadPath = "/tmp/hana-souvenir-download";
const customAvatarSummaryPath = "/tmp/hana-custom-avatar-summary";
const previewUrl = "http://localhost:3000/?summary";
const customAvatarTest = process.env.CUSTOM_AVATAR_TEST === "1";
const screenshotDirectory = "/home/ubuntu/screenshots";

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const waitFor = async (command, selector) => {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const response = await command("Runtime.evaluate", {
      returnByValue: true,
      expression: `Boolean(document.querySelector(${JSON.stringify(selector)}))`,
    });
    if (response.result?.value) return;
    await sleep(100);
  }
  throw new Error(`Không tìm thấy ${selector}.`);
};

await rm(downloadPath, { recursive: true, force: true });
await mkdir(downloadPath, { recursive: true });
if (customAvatarTest) {
  await rm(customAvatarSummaryPath, { recursive: true, force: true });
  await mkdir(customAvatarSummaryPath, { recursive: true });
}

const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((response) => response.json());
const target = targets.find((item) => item.type === "page" && item.url.includes("localhost:3000")) ?? targets.find((item) => item.type === "page");
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
  if (customAvatarTest) {
    const screenshot = (await readdir(screenshotDirectory))
      .filter((name) => name.endsWith(".png"))
      .sort()
      .at(-1);
    if (!screenshot) throw new Error("Không tìm thấy ảnh PNG để kiểm thử avatar ảnh cá nhân.");
    await command("Page.navigate", { url: "http://localhost:3000/?profile&nowebgl" });
    await waitFor(command, ".avatar-photo-upload input");
    const documentTree = await command("DOM.getDocument", { depth: 1 });
    const input = await command("DOM.querySelector", {
      nodeId: documentTree.root.nodeId,
      selector: ".avatar-photo-upload input",
    });
    if (!input.nodeId) throw new Error("Không tìm thấy input tải avatar ảnh cá nhân.");
    await command("DOM.setFileInputFiles", {
      nodeId: input.nodeId,
      files: [path.join(screenshotDirectory, screenshot)],
    });
    await waitFor(command, ".avatar-photo-upload.has-photo img.player-avatar-photo");
    await command("Page.navigate", { url: previewUrl });
    await waitFor(command, ".summary-screen");
  } else {
    await command("Page.navigate", { url: previewUrl });
    await waitFor(command, ".summary-screen");
  }
  const avatarState = await command("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => ({
      hasPhotoAvatar: Boolean(document.querySelector(".summary-player-identity img.player-avatar-photo")),
      photoLength: document.querySelector(".summary-player-identity img.player-avatar-photo")?.getAttribute("src")?.length ?? 0,
    }))()`,
  });
  if (customAvatarTest && !avatarState.result?.value?.hasPhotoAvatar) {
    throw new Error("Avatar ảnh cá nhân không xuất hiện đúng ở màn tổng kết trước khi tạo PNG.");
  }
  const summaryScreenshots = [];
  if (customAvatarTest) {
    for (const [name, width, height, mobile] of [["mobile", 375, 812, true], ["desktop", 1280, 720, false]]) {
      await command("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
      await sleep(160);
      const viewportAvatar = await command("Runtime.evaluate", {
        returnByValue: true,
        expression: `(() => {
          const image = document.querySelector(".summary-player-identity img.player-avatar-photo");
          const box = image?.getBoundingClientRect();
          return { hasPhotoAvatar: Boolean(image), width: box?.width ?? 0, height: box?.height ?? 0 };
        })()`,
      });
      const state = viewportAvatar.result?.value;
      if (!state?.hasPhotoAvatar || Math.abs(state.width - state.height) > 1) {
        throw new Error(`Avatar ảnh cá nhân không tròn đúng tỷ lệ ở ${name}: ${JSON.stringify(state)}`);
      }
      const capture = await command("Page.captureScreenshot", { format: "png", fromSurface: true });
      const output = path.join(customAvatarSummaryPath, `summary-${name}.png`);
      await writeFile(output, Buffer.from(capture.data, "base64"));
      summaryScreenshots.push({ name, output, avatar: state });
    }
    await command("Emulation.clearDeviceMetricsOverride");
  }
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
  console.log(JSON.stringify({ download: pngFile, status: status.result?.value ?? "", customAvatarTest, avatar: avatarState.result?.value ?? null, summaryScreenshots }));
  if (customAvatarTest) {
    await command("Runtime.evaluate", {
      expression: `sessionStorage.removeItem("hana-session-avatar-photo-v1")`,
    });
  }
} finally {
  socket.close();
}
