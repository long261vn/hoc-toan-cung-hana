const debugPort = process.env.CDP_PORT ?? "9222";
const previewUrl = "http://localhost:3000/?lang=en";
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((response) => response.json());
const target = targets.find((item) => item.type === "page");
if (!target?.webSocketDebuggerUrl) throw new Error("Không tìm thấy tab Chromium để kiểm thử phản hồi English.");
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let commandId = 0;
const pending = new Map();
socket.addEventListener("message", ({ data }) => { const message = JSON.parse(data); const request = pending.get(message.id); if (!request) return; pending.delete(message.id); message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result); });
const command = (method, params = {}) => new Promise((resolve, reject) => { const id = ++commandId; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
const evaluate = async (expression) => (await command("Runtime.evaluate", { expression, returnByValue: true })).result?.value;
const waitFor = async (selector, label = selector) => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)) return;
    await sleep(100);
  }
  throw new Error(`Không tìm thấy ${label}.`);
};

try {
  await command("Page.enable");
  await evaluate(`localStorage.removeItem("hana-active-session-v1")`);
  await command("Page.navigate", { url: previewUrl });
  await waitFor(".welcome-primary", "nút Start");
  await evaluate(`document.querySelector(".welcome-primary")?.click()`);
  await waitFor(".profile-name-field input", "ô nhập tên");
  await evaluate(`(() => { const input = document.querySelector(".profile-name-field input"); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; setter.call(input, "Linh"); input.dispatchEvent(new Event("input", { bubbles: true })); })()`);
  await evaluate(`document.querySelector(".profile-continue")?.click()`);
  await waitFor(".start-mode-card.is-practice", "lựa chọn Practice");
  await evaluate(`document.querySelector(".start-mode-card.is-practice")?.click()`);
  await waitFor(".activity-card", "menu hoạt động");
  await evaluate(`Array.from(document.querySelectorAll(".activity-card")).find((card) => card.textContent.includes("Addition"))?.click()`);
  await waitFor(".math-expression", "câu hỏi English");
  const result = await evaluate(`(() => {
    const expression = document.querySelector(".math-expression")?.textContent ?? "";
    const [left] = expression.split("=");
    const answer = Function('"use strict"; return (' + left.replace("×", "*").replace("÷", "/").replace("−", "-") + ');')();
    const button = Array.from(document.querySelectorAll(".answer-button")).find((item) => Number(item.querySelector("strong")?.textContent) === answer);
    button?.click();
    return { expression, answer, answerFound: Boolean(button) };
  })()`);
  if (!result.answerFound) throw new Error(`Không tìm thấy đáp án đúng trong English mode: ${JSON.stringify(result)}`);
  await sleep(180);
  const feedback = await evaluate(`document.querySelector(".feedback-banner")?.textContent?.replace(/\\s+/g, " ").trim()`);
  if (!feedback?.includes("Correct, Linh! +10 points") || /Đúng rồi|điểm|Nhiệm vụ tiếp/.test(feedback)) throw new Error(`Robot Hana chưa phản hồi English hoàn toàn: ${feedback}`);
  await evaluate(`document.querySelector(".feedback-banner button")?.click()`);
  await sleep(180);
  const wrongResult = await evaluate(`(() => {
    const expression = document.querySelector(".math-expression")?.textContent ?? "";
    const [left] = expression.split("=");
    const answer = Function('"use strict"; return (' + left.replace("×", "*").replace("÷", "/").replace("−", "-") + ');')();
    const button = Array.from(document.querySelectorAll(".answer-button")).find((item) => Number(item.querySelector("strong")?.textContent) !== answer);
    button?.click();
    return { expression, answer, wrongAnswerFound: Boolean(button) };
  })()`);
  if (!wrongResult.wrongAnswerFound) throw new Error(`Không tìm thấy đáp án sai để kiểm thử gợi ý: ${JSON.stringify(wrongResult)}`);
  await sleep(180);
  const helpChoice = await evaluate(`({ guideOpen: Boolean(document.querySelector(".hana-learning-card")), retry: document.querySelector(".feedback-action.is-retry")?.textContent?.trim() ?? "", help: document.querySelector(".feedback-action.is-hana-help")?.textContent?.trim() ?? "" })`);
  if (helpChoice.guideOpen || !helpChoice.retry.includes("Try again now") || !helpChoice.help.includes("See hint")) throw new Error(`Phản hồi sai English chưa cho phép lựa chọn: ${JSON.stringify(helpChoice)}`);
  await evaluate(`document.querySelector(".feedback-action.is-hana-help")?.click()`);
  await waitFor(".hana-learning-card", "cửa sổ Hana English");
  const hanaGuide = await evaluate(`document.querySelector(".hana-learning-card")?.textContent?.replace(/\\s+/g, " ").trim()`);
  if (!hanaGuide?.includes("Let’s work it out, Linh!") || !hanaGuide.includes("Step 1 of") || !hanaGuide.includes("Next step") || /Robot Hana cùng bạn|Bước tiếp|Thử lại câu này|Bạn đã chọn/.test(hanaGuide)) throw new Error(`Cửa sổ Hana chưa dùng English math đúng chuẩn: ${hanaGuide}`);
  for (let index = 0; index < 5; index += 1) {
    const hasNext = await evaluate(`document.querySelector(".hana-primary-action")?.textContent?.includes("Next step")`);
    if (!hasNext) break;
    await evaluate(`document.querySelector(".hana-primary-action")?.click()`);
    await sleep(60);
  }
  const checkReminder = await evaluate(`document.querySelector(".hana-learning-check-note")?.textContent?.replace(/\\s+/g, " ").trim() ?? ""`);
  if (!checkReminder.includes("check with the inverse operation") || !checkReminder.includes("multiplication/division table")) throw new Error(`Gợi ý Hana chưa nhắc cách kiểm tra kết quả: ${checkReminder}`);
  const retryLabel = await evaluate(`document.querySelector(".hana-primary-action")?.textContent?.replace(/\\s+/g, " ").trim()`);
  if (!retryLabel?.includes("Try this question again")) throw new Error(`Cửa sổ Hana không đến được bước thử lại: ${retryLabel}`);
  await evaluate(`document.querySelector(".hana-primary-action")?.click()`);
  await sleep(100);
  const retryReady = await evaluate(`!document.querySelector(".hana-learning-card") && document.querySelectorAll(".answer-button").length === 4`);
  if (!retryReady) throw new Error("Câu hỏi không mở lại sau hướng dẫn Hana.");
  console.log(JSON.stringify({ result, feedback, wrongResult, helpChoice, hanaGuide, checkReminder, retryLabel, status: "english feedback and Hana guide valid" }));
} finally { socket.close(); }
