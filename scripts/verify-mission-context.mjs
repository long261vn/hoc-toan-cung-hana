const debugPort = process.env.CDP_PORT ?? "9222";
const baseUrl = "http://localhost:3000";
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then(response => response.json());
const page = targets.find(target => target.type === "page" && target.url.includes("localhost:3000")) ?? targets.find(target => target.type === "page");
if (!page?.webSocketDebuggerUrl) throw new Error("Không tìm thấy Chromium để kiểm thử ngữ cảnh nhiệm vụ.");
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
const evaluate = async expression => {
  const response = await command("Runtime.evaluate", { expression, returnByValue: true });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text ?? "Lỗi evaluate.");
  }
  return response.result?.value;
};
const waitFor = async selector => {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)) return;
    await sleep(100);
  }
  throw new Error(`Không tìm thấy ${selector}.`);
};
const navigate = async query => {
  const localizedQuery = query.includes("?") ? `${query}&lang=vi` : `${query}?lang=vi`;
  await command("Page.navigate", { url: `${baseUrl}/${localizedQuery}` });
  await waitFor(".mission-control");
};
const gameBoardIsMinimal = async name => {
  const result = await evaluate(`(() => {
    const expression = document.querySelector(".question-panel .math-expression")?.textContent?.replace(/\\s+/g, " ").trim() ?? "";
    const obsoleteUiCount = document.querySelectorAll(".mission-flight-rail, .mission-planet-chip, .mission-planet-label, .mission-journey-signal, .mission-orbit-status, .answer-index").length;
    const answers = Array.from(document.querySelectorAll(".answer-button")).map(button => ({
      button: button.textContent?.replace(/\\s+/g, " ").trim() ?? "",
      answer: button.querySelector("strong")?.textContent?.trim() ?? "",
    }));
    return { expression, obsoleteUiCount, answers };
  })()`);
  if (!result.expression || result.obsoleteUiCount !== 0 || result.answers.length !== 4 || result.answers.some(answer => answer.button !== answer.answer)) {
    throw new Error(`${name} chưa tối giản đúng bảng học hoặc đáp án: ${JSON.stringify(result)}`);
  }
  return result;
};

try {
  await command("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });

  await navigate("?demo&nowebgl");
  const multiplication = await gameBoardIsMinimal("Nhiệm vụ Nhân");

  await navigate("?tables=divide&nowebgl");
  const divisionTable = await gameBoardIsMinimal("Bảng Chia");

  await navigate("?tables=mixed&nowebgl");
  const mixedTable = await gameBoardIsMinimal("Bảng Nhân-Chia hỗn hợp");

  await navigate("?demo&nowebgl");
  await evaluate(`document.querySelectorAll(".mission-format-options button")[1]?.click(); document.querySelectorAll(".mission-difficulty-options button")[2]?.click();`);
  await sleep(150);
  const beforeChange = await evaluate(`({ format: document.querySelector(".mission-format-options button.is-active")?.textContent?.trim(), difficulty: document.querySelector(".mission-difficulty-options button.is-active")?.textContent?.trim() })`);
  if (beforeChange.format !== "Tìm thành phần" || beforeChange.difficulty !== "Thám hiểm") {
    throw new Error(`Không thể thiết lập trạng thái trước khi đổi nhiệm vụ: ${JSON.stringify(beforeChange)}`);
  }
  await evaluate(`document.querySelector(".mission-change-button")?.click()`);
  await waitFor(".activity-screen");
  await evaluate(`document.querySelector(".activity-card.divide")?.click()`);
  await waitFor(".mission-control");
  const resetState = await evaluate(`(() => ({
    format: document.querySelector(".mission-format-options button.is-active")?.textContent?.trim(),
    difficulty: document.querySelector(".mission-difficulty-options button.is-active")?.textContent?.trim(),
    expression: document.querySelector(".question-panel .math-expression")?.textContent?.replace(/\\s+/g, " ").trim(),
    obsoleteUiCount: document.querySelectorAll(".mission-flight-rail, .mission-planet-chip, .mission-journey-signal, .mission-orbit-status, .answer-index").length,
  }))()`);
  if (resetState.format !== "Bài bình thường" || resetState.difficulty !== "Làm quen" || resetState.obsoleteUiCount !== 0 || !resetState.expression?.includes("÷")) {
    throw new Error(`Đổi nhiệm vụ chưa đặt lại đúng trạng thái hoặc bảng học còn chi tiết thừa: ${JSON.stringify(resetState)}`);
  }

  await command("Page.navigate", { url: `${baseUrl}/?hanaguide&operation=divide&difficulty=challenge&nowebgl&lang=vi` });
  await waitFor(".hana-learning-card");
  for (let index = 0; index < 3; index += 1) {
    await evaluate(`document.querySelector(".hana-primary-action")?.click()`);
    await sleep(80);
  }
  const guide = await evaluate(`(() => ({
    step: document.querySelector(".hana-learning-step > span")?.textContent?.trim(),
    note: document.querySelector(".hana-learning-check-note")?.textContent?.replace(/\\s+/g, " ").trim() ?? "",
    page: document.querySelector(".hana-learning-step > p")?.textContent?.trim() ?? "",
  }))()`);
  if (guide.step !== "Bước 4/4" || !guide.page.includes("tích phải trở lại") || !guide.note.includes("CÁCH KIỂM TRA") || !guide.note.toLocaleLowerCase("vi").includes("lấy thương") || guide.note.includes("Trước khi chọn lại")) {
    throw new Error(`Gợi ý chia khó hoặc bước tự kiểm tra chưa đúng: ${JSON.stringify(guide)}`);
  }

  console.log(JSON.stringify({ multiplication, divisionTable, mixedTable, resetState, guide, status: "minimal game board stays focused" }));
} finally {
  await command("Emulation.clearDeviceMetricsOverride");
  socket.close();
}
