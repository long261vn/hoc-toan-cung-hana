const debugPort = process.env.CDP_PORT ?? "9231";
const url = "http://localhost:3000/?nowebgl";
const sleep = milliseconds =>
  new Promise(resolve => setTimeout(resolve, milliseconds));
const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then(
  response => response.json()
);
const page = targets.find(target => target.type === "page");
if (!page?.webSocketDebuggerUrl)
  throw new Error(
    "Không tìm thấy Chromium để kiểm thử xác nhận kết thúc lượt."
  );

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
  message.error
    ? pending.reject(new Error(message.error.message))
    : pending.resolve(message.result);
});
const command = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++nextId;
    waiting.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async expression =>
  (await command("Runtime.evaluate", { expression, returnByValue: true }))
    .result?.value;
const waitFor = async selector => {
  for (let retry = 0; retry < 40; retry += 1) {
    if (
      await evaluate(
        `Boolean(document.querySelector(${JSON.stringify(selector)}))`
      )
    )
      return;
    await sleep(100);
  }
  throw new Error(`Không tìm thấy ${selector}`);
};
const waitUntilGone = async selector => {
  for (let retry = 0; retry < 40; retry += 1) {
    if (
      !(await evaluate(
        `Boolean(document.querySelector(${JSON.stringify(selector)}))`
      ))
    )
      return;
    await sleep(100);
  }
  throw new Error(`${selector} vẫn chưa đóng`);
};
const openPractice = async () => {
  await command("Page.navigate", { url });
  await waitFor(".welcome-primary");
  await evaluate(`document.querySelector(".welcome-primary")?.click()`);
  await waitFor(".profile-name-field input");
  await evaluate(
    `(() => { const input = document.querySelector(".profile-name-field input"); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; setter.call(input, "Minh"); input.dispatchEvent(new Event("input", { bubbles: true })); })()`
  );
  await evaluate(`document.querySelector(".profile-continue")?.click()`);
  await waitFor(".start-mode-card");
  await evaluate(
    `document.querySelector(".start-mode-card.is-practice")?.click()`
  );
  await waitFor(".activity-card");
  await evaluate(`document.querySelector(".activity-card")?.click()`);
  await waitFor(".format-option");
  await evaluate(`document.querySelector(".format-option")?.click()`);
  await waitFor(".mission-control");
};
const inspectConfirm = async () => {
  const details = await evaluate(`(() => ({
    dialog: document.querySelector(".end-session-confirm-card")?.textContent?.replace(/\\s+/g, " ").trim(),
    summaryVisible: Boolean(document.querySelector(".summary-screen")),
    stats: Array.from(document.querySelectorAll(".end-session-confirm-stats strong")).map((node) => node.textContent)
  }))()`);
  if (
    !details.dialog?.includes("Bạn muốn kết thúc lượt học không?") ||
    !details.dialog.includes("Quay lại học tiếp") ||
    !details.dialog.includes("Kết thúc lượt")
  )
    throw new Error(`Nội dung xác nhận chưa đúng: ${JSON.stringify(details)}`);
  if (details.summaryVisible || details.stats.join(",") !== "0,0,0")
    throw new Error(
      `Hộp thoại không giữ đúng trạng thái phiên học: ${JSON.stringify(details)}`
    );
  return details;
};

try {
  await command("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await openPractice();
  await evaluate(`document.querySelector(".session-end-button")?.click()`);
  await waitFor(".end-session-confirm-card");
  const mobileConfirm = await inspectConfirm();
  await evaluate(
    `document.querySelector(".end-session-confirm-cancel")?.click()`
  );
  await waitUntilGone(".end-session-confirm-card");

  await evaluate(`document.querySelector(".session-end-button")?.click()`);
  await waitFor(".end-session-confirm-card");
  await inspectConfirm();
  await evaluate(
    `document.querySelector(".end-session-confirm-action")?.click()`
  );
  await waitFor(".summary-screen");
  const settingsVisibleOnSummary = await evaluate(
    `Boolean(document.querySelector(".app-settings-dock"))`
  );
  if (settingsVisibleOnSummary)
    throw new Error("Nút Cài đặt vẫn xuất hiện trong màn tổng kết.");

  await openPractice();
  await evaluate(`document.querySelector(".app-home-brand")?.click()`);
  await waitFor(".home-confirm-card");
  const homeConfirm = await evaluate(
    `document.querySelector(".home-confirm-card")?.textContent?.replace(/\\s+/g, " ").trim()`
  );
  if (
    !homeConfirm?.includes("Bạn có chắc muốn bỏ điểm của lượt này không?") ||
    !homeConfirm.includes("Không, học tiếp") ||
    !homeConfirm.includes("Đồng ý, quay về đầu")
  )
    throw new Error(`Xác nhận quay về đầu chưa đúng: ${homeConfirm}`);
  await evaluate(
    `document.querySelector(".home-confirm-actions button:first-child")?.click()`
  );
  await waitUntilGone(".home-confirm-card");
  if (!(await evaluate(`Boolean(document.querySelector(".mission-control"))`)))
    throw new Error("Hủy quay về đầu đã làm mất màn đang học.");

  await evaluate(`document.querySelector(".app-home-brand")?.click()`);
  await waitFor(".home-confirm-card");
  await evaluate(
    `document.querySelector(".home-confirm-actions button:last-child")?.click()`
  );
  await waitFor(".welcome-screen");

  await command("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await openPractice();
  await evaluate(`document.querySelector(".session-end-button")?.click()`);
  await waitFor(".end-session-confirm-card");
  const desktopConfirm = await inspectConfirm();
  await evaluate(
    `document.querySelector(".end-session-confirm-cancel")?.click()`
  );
  await waitUntilGone(".end-session-confirm-card");

  console.log(
    JSON.stringify({
      mobileConfirm,
      desktopConfirm,
      homeConfirm,
      status: "end-session and home confirmation valid",
    })
  );
} finally {
  socket.close();
}
