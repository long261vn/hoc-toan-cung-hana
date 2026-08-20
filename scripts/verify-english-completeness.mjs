const debugPort = process.env.CDP_PORT ?? "9263";
const baseUrl = "http://localhost:3000/?nowebgl&lang=en";
const sleep = milliseconds =>
  new Promise(resolve => setTimeout(resolve, milliseconds));
const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then(
  response => response.json()
);
const page = targets.find(target => target.type === "page");
if (!page?.webSocketDebuggerUrl)
  throw new Error("Không tìm thấy Chromium để kiểm thử English.");
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
  for (let attempt = 0; attempt < 60; attempt += 1) {
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
const noVietnamese = (text, scope) => {
  if (
    /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i.test(
      text
    ) ||
    /Hướng dẫn|Phi Hành|Phép Tính|Bạn có thể|Bảng Nhân|Chọn Tất Cả|Ví dụ|Chưa sao|gợi ý/i.test(
      text
    )
  )
    throw new Error(`${scope} còn tiếng Việt: ${text}`);
};

try {
  await command("Page.navigate", { url: baseUrl });
  await waitFor(".welcome-primary");
  const welcome = await evaluate(
    `document.querySelector(".welcome-screen")?.textContent?.replace(/\\s+/g, " ").trim()`
  );
  const wordmark = await evaluate(
    `document.querySelector(".welcome-screen .mini-brand [data-brand-wordmark]")?.innerHTML`
  );
  noVietnamese(welcome, "Màn chào mừng");
  if (
    !wordmark?.includes("Learn Math") ||
    !wordmark?.includes("with Hana") ||
    !welcome.includes("Guide")
  )
    throw new Error(
      `Wordmark/Hướng dẫn English chưa đúng: ${JSON.stringify({ wordmark, welcome })}`
    );
  await evaluate(`document.querySelector(".welcome-help")?.click()`);
  await waitFor(".guide-card");
  const guide = await evaluate(
    `document.querySelector(".guide-card")?.textContent?.replace(/\\s+/g, " ").trim()`
  );
  noVietnamese(guide, "Hướng dẫn");
  if (
    !guide.includes("Choose one table") &&
    !guide.includes("Multiplication & Division Tables")
  )
    throw new Error(`Hướng dẫn English thiếu phần bảng nhân–chia: ${guide}`);
  await evaluate(`document.querySelector(".guide-close")?.click()`);
  await evaluate(`document.querySelector(".welcome-primary")?.click()`);
  await waitFor(".profile-name-field input");
  const profile = await evaluate(
    `({ title: document.querySelector(".profile-screen")?.textContent?.replace(/\\s+/g, " ").trim(), placeholder: document.querySelector(".profile-name-field input")?.getAttribute("placeholder") })`
  );
  noVietnamese(profile.title, "Màn tên người chơi");
  if (profile.placeholder !== "Example: Alex")
    throw new Error(`Ví dụ tên English chưa đúng: ${JSON.stringify(profile)}`);
  await evaluate(
    `(() => { const input = document.querySelector(".profile-name-field input"); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; setter.call(input, "Alex"); input.dispatchEvent(new Event("input", { bubbles: true })); })()`
  );
  await evaluate(`document.querySelector(".profile-continue")?.click()`);
  await waitFor(".start-mode-card");
  const startMode = await evaluate(
    `document.querySelector(".start-mode-screen")?.textContent?.replace(/\\s+/g, " ").trim()`
  );
  noVietnamese(startMode, "Màn chọn Luyện Tập/Bài Kiểm Tra");
  if (!startMode.includes("Practice") || !startMode.includes("Test"))
    throw new Error(`Màn chọn chế độ ENG chưa đúng: ${startMode}`);
  await evaluate(`document.querySelector(".start-mode-card.is-test")?.click()`);
  await waitFor(".test-setup-panel");
  const testSetup = await evaluate(
    `document.querySelector(".test-setup-screen")?.textContent?.replace(/\\s+/g, " ").trim()`
  );
  noVietnamese(testSetup, "Thiết lập Bài Kiểm Tra");
  if (
    !testSetup.includes("Choose a level") ||
    !testSetup.includes("2 minutes") ||
    !testSetup.includes("Start timed test")
  )
    throw new Error(`Thiết lập kiểm tra ENG chưa đủ: ${testSetup}`);
  await evaluate(`document.querySelector(".test-start-button")?.click()`);
  await waitFor(".mission-control");
  const timedGame = await evaluate(
    `document.querySelector(".mission-control")?.textContent?.replace(/\\s+/g, " ").trim()`
  );
  noVietnamese(timedGame, "Màn làm Bài Kiểm Tra");
  const timedAriaLabels = await evaluate(
    `Array.from(document.querySelectorAll(".game-canvas, .mission-control, .answer-grid")).map((node) => node.getAttribute("aria-label") ?? "").join(" ")`
  );
  noVietnamese(timedAriaLabels, "Nhãn trợ năng Bài Kiểm Tra");
  await evaluate(
    `Date.now = () => window.performance.timeOrigin + performance.now() + 121000`
  );
  await waitFor(".summary-screen");
  const testSummary = await evaluate(
    `document.querySelector(".summary-screen")?.textContent?.replace(/\\s+/g, " ").trim()`
  );
  noVietnamese(testSummary, "Tổng kết Bài Kiểm Tra");
  if (
    !testSummary.includes("TIME IS UP") ||
    !testSummary.includes("Level:") ||
    !testSummary.includes("Time:")
  )
    throw new Error(`Tổng kết kiểm tra ENG chưa đủ: ${testSummary}`);
  await command("Page.navigate", { url: baseUrl });
  await waitFor(".welcome-primary");
  await evaluate(`document.querySelector(".welcome-primary")?.click()`);
  await waitFor(".profile-name-field input");
  await evaluate(
    `(() => { const input = document.querySelector(".profile-name-field input"); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; setter.call(input, "Alex"); input.dispatchEvent(new Event("input", { bubbles: true })); })()`
  );
  await evaluate(`document.querySelector(".profile-continue")?.click()`);
  await waitFor(".start-mode-card");
  await evaluate(
    `document.querySelector(".start-mode-card.is-practice")?.click()`
  );
  await waitFor(".activity-card");
  const menu = await evaluate(
    `document.querySelector(".activity-screen")?.textContent?.replace(/\\s+/g, " ").trim()`
  );
  noVietnamese(menu, "Menu nhiệm vụ");
  if (!menu.includes("Learn Multiplication & Division Tables"))
    throw new Error(`Tên mục bảng nhân–chia English chưa đủ: ${menu}`);
  await evaluate(`document.querySelector(".activity-screen .language-control")?.click()`);
  await sleep(80);
  const menuVietnamese = await evaluate(
    `document.querySelector(".activity-screen")?.textContent?.replace(/\\s+/g, " ").trim()`
  );
  if (!menuVietnamese.includes("Bạn muốn chinh phục điều gì?"))
    throw new Error(`Menu không đổi đầy đủ sang VIE: ${menuVietnamese}`);
  await evaluate(`document.querySelector(".activity-screen .language-control")?.click()`);
  await sleep(80);
  const menuAfterToggle = await evaluate(
    `document.querySelector(".activity-screen")?.textContent?.replace(/\\s+/g, " ").trim()`
  );
  noVietnamese(menuAfterToggle, "Menu nhiệm vụ sau khi đổi VIE/ENG");
  await command("Page.navigate", {
    url: "http://localhost:3000/?tables=mixed&lang=en&nowebgl",
  });
  await waitFor(".mission-control");
  const tables = await evaluate(
    `document.querySelector(".mission-control")?.textContent?.replace(/\\s+/g, " ").trim()`
  );
  noVietnamese(tables, "Màn bảng nhân–chia");
  if (!tables.includes("Multiplication & Division Tables"))
    throw new Error(`Nhãn tables English chưa đầy đủ: ${tables}`);
  await evaluate(`document.querySelector(".mission-language-control")?.click()`);
  await sleep(80);
  const tablesVietnamese = await evaluate(
    `document.querySelector(".mission-control")?.textContent?.replace(/\\s+/g, " ").trim()`
  );
  if (!tablesVietnamese.includes("BẢNG CỬU CHƯƠNG"))
    throw new Error(`Bảng nhân–chia không đổi đầy đủ sang VIE: ${tablesVietnamese}`);
  await evaluate(`document.querySelector(".mission-language-control")?.click()`);
  await sleep(80);
  const tablesAfterToggle = await evaluate(
    `document.querySelector(".mission-control")?.textContent?.replace(/\\s+/g, " ").trim()`
  );
  noVietnamese(tablesAfterToggle, "Bảng nhân–chia sau khi đổi VIE/ENG");
  const tableAriaLabels = await evaluate(
    `Array.from(document.querySelectorAll(".table-practice-panel, .table-kind-switch, .table-number-grid, .answer-grid")).map((node) => node.getAttribute("aria-label") ?? "").join(" ")`
  );
  noVietnamese(tableAriaLabels, "Nhãn trợ năng bảng nhân–chia");
  await command("Page.navigate", { url: baseUrl });
  await waitFor(".welcome-primary");
  await evaluate(`document.querySelector(".welcome-primary")?.click()`);
  await waitFor(".profile-name-field input");
  await evaluate(
    `(() => { const input = document.querySelector(".profile-name-field input"); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; setter.call(input, "Alex"); input.dispatchEvent(new Event("input", { bubbles: true })); })()`
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
  await waitFor(".math-expression");
  const wrongAnswer = await evaluate(
    `(() => { const [left] = (document.querySelector(".math-expression")?.textContent ?? "").split("="); const answer = Function('"use strict"; return (' + left.replace("×", "*").replace("÷", "/").replace("−", "-") + ");")(); return Array.from(document.querySelectorAll(".answer-button")).map((button) => Number(button.querySelector("strong")?.textContent)).find((value) => value !== answer); })()`
  );
  await evaluate(
    `Array.from(document.querySelectorAll(".answer-button")).find((button) => Number(button.querySelector("strong")?.textContent) === ${wrongAnswer})?.click()`
  );
  await waitFor(".hana-hint-copy");
  const hint = await evaluate(
    `document.querySelector(".hana-hint-copy")?.textContent?.replace(/\\s+/g, " ").trim()`
  );
  noVietnamese(hint, "Gợi ý Robot Hana");
  if (!hint.includes("Robot Hana's hint for Alex"))
    throw new Error(`Gợi ý Hana English chưa đúng: ${hint}`);
  console.log(
    JSON.stringify({
      welcome,
      guide,
      profile,
      startMode,
      testSetup,
      timedGame,
      timedAriaLabels,
      testSummary,
      tables,
      tableAriaLabels,
      hint,
      status: "English content complete",
    })
  );
} finally {
  socket.close();
}
