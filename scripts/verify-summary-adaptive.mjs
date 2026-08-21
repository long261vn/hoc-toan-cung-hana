const debugPort = process.env.CDP_PORT ?? "9222";
const baseUrl = "http://localhost:3000";
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then(response => response.json());
const page = targets.find(target => target.type === "page" && target.url.includes("localhost:3000")) ?? targets.find(target => target.type === "page");
if (!page?.webSocketDebuggerUrl) throw new Error("Không tìm thấy Chromium để kiểm thử tổng kết thích ứng.");
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
const evaluate = async expression => (await command("Runtime.evaluate", { expression, returnByValue: true })).result?.value;
const waitFor = async selector => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)) return;
    await sleep(100);
  }
  throw new Error(`Không tìm thấy ${selector}`);
};

try {
  await command("Page.navigate", { url: `${baseUrl}/?summary&lang=vi&nowebgl` });
  await waitFor(".summary-screen");
  const strong = await evaluate(`document.querySelector(".summary-screen")?.textContent?.replace(/\\s+/g, " ").trim()`);
  if (!strong.includes("rất đáng khen!") || !strong.includes("10/12")) {
    throw new Error(`Tổng kết kết quả tốt không dùng lời nhắn phù hợp: ${strong}`);
  }
  await command("Page.navigate", { url: `${baseUrl}/?summarylow&lang=vi&nowebgl` });
  await waitFor(".summary-screen");
  const practice = await evaluate(`document.querySelector(".summary-screen")?.textContent?.replace(/\\s+/g, " ").trim()`);
  if (!practice.includes("cùng luyện thêm để tiến bộ nhé!") || !practice.includes("2/10") || practice.includes("rất đáng khen!")) {
    throw new Error(`Tổng kết nhiều lỗi không dùng lời nhắn luyện tập phù hợp: ${practice}`);
  }
  const avatar = await evaluate(`Boolean(document.querySelector(".summary-player-identity .player-avatar"))`);
  if (!avatar) throw new Error("Tổng kết không hiển thị avatar người chơi.");
  await command("Page.navigate", { url: `${baseUrl}/?testsummary&lang=vi&nowebgl` });
  await waitFor(".summary-screen");
  const timed = await evaluate(`document.querySelector(".summary-screen")?.textContent?.replace(/\s+/g, " ").trim()`);
  const playerIdentity = await evaluate(`(() => {
    const summary = document.querySelector(".summary-screen");
    const identity = summary?.querySelector(".summary-heading-player .summary-player-identity strong")?.textContent?.trim();
    const intro = summary?.querySelector(".summary-intro")?.textContent ?? "";
    const nameCount = (summary?.innerText.match(/Minh Anh/g) ?? []).length;
    return { identity, introIncludesName: intro.includes("Minh Anh"), nameCount };
  })()`);
  if (!timed.includes("HẾT GIỜ RỒI") || !timed.includes("Bài kiểm tra của") || !timed.includes("Thời gian: 5:00") || !timed.includes("Cấp độ: Làm quen") || playerIdentity?.identity !== "Minh Anh" || playerIdentity?.introIncludesName || playerIdentity?.nameCount !== 1) {
    throw new Error(`Tổng kết bài kiểm tra chưa hiển thị đủ ngữ cảnh: ${timed}`);
  }
  console.log(JSON.stringify({ strong, practice, timed, avatar, playerIdentity, status: "adaptive and timed summary copy with one player identity are valid" }));
} finally {
  socket.close();
}
