const debugPort = process.env.CDP_PORT ?? "9222";
const baseUrl = "http://localhost:3000";
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then(response => response.json());
const page = targets.find(target => target.type === "page" && target.url.includes("localhost:3000")) ?? targets.find(target => target.type === "page");
if (!page?.webSocketDebuggerUrl) throw new Error("Không tìm thấy Chromium để kiểm thử huy hiệu theo lượt.");

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
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)) return;
    await sleep(100);
  }
  throw new Error(`Không tìm thấy ${selector}`);
};
const navigate = async path => {
  await command("Page.navigate", { url: `${baseUrl}${path}` });
  await waitFor(".summary-screen");
};
const readBadges = () => evaluate(`(() => ({
  counter: document.querySelector(".theme-badge-heading strong")?.textContent?.trim(),
  collected: document.querySelectorAll(".theme-badge-item.is-collected").length,
  locked: document.querySelectorAll(".theme-badge-item.is-locked").length,
  points: document.querySelector(".summary-stats div strong")?.textContent?.trim(),
}))()`);
const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)})?.click()`);

try {
  await navigate("/?summaryzero&nowebgl");
  const zero = await readBadges();
  if (zero.counter !== "0/4" || zero.collected !== 0 || zero.locked !== 4 || zero.points !== "0") {
    throw new Error(`Lượt 0 điểm đang hiển thị huy hiệu không đúng: ${JSON.stringify(zero)}`);
  }

  await navigate("/?maxrewards&nowebgl");
  const rewarded = await readBadges();
  if (rewarded.counter !== "4/4" || rewarded.collected !== 4 || rewarded.locked !== 0 || rewarded.points !== "1000") {
    throw new Error(`Lượt đạt huy hiệu đang hiển thị không đúng: ${JSON.stringify(rewarded)}`);
  }

  await click(".summary-again");
  await waitFor(".start-mode-card.is-practice");
  await click(".start-mode-card.is-practice");
  await waitFor(".activity-card.add");
  await click(".activity-card.add");
  await waitFor(".game-shell");
  const reset = await evaluate(`(() => ({
    pointText: document.querySelector(".current-score-button strong")?.textContent?.trim(),
    scoreText: document.querySelector(".current-score-button")?.textContent?.replace(/\s+/g, " ").trim(),
  }))()`);
  if (reset.pointText !== "0") {
    throw new Error(`Lượt mới chưa đặt lại điểm sau tổng kết: ${JSON.stringify(reset)}`);
  }

  await click(".current-score-button");
  await waitFor(".score-card");
  const currentPointsBadges = await evaluate(`(() => ({
    counter: document.querySelector(".score-badge-board > div strong")?.textContent?.trim(),
    earned: document.querySelectorAll(".score-badge-list .is-earned").length,
    locked: document.querySelectorAll(".score-badge-list .is-locked").length,
  }))()`);
  if (currentPointsBadges.counter !== "0/4" || currentPointsBadges.earned !== 0 || currentPointsBadges.locked !== 4) {
    throw new Error(`Điểm hiện tại đang kế thừa huy hiệu của lượt trước: ${JSON.stringify(currentPointsBadges)}`);
  }

  console.log(JSON.stringify({ zero, rewarded, reset, currentPointsBadges, status: "session badges and new-session reset are valid" }));
} finally {
  socket.close();
}
