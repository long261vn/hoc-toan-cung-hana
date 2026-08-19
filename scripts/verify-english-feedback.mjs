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

try {
  await command("Page.enable");
  await command("Page.navigate", { url: previewUrl });
  await sleep(800);
  await evaluate(`document.querySelector(".welcome-primary")?.click()`);
  await sleep(180);
  await evaluate(`(() => { const input = document.querySelector(".profile-name-field input"); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; setter.call(input, "Linh"); input.dispatchEvent(new Event("input", { bubbles: true })); })()`);
  await sleep(100);
  await evaluate(`document.querySelector(".profile-continue")?.click()`);
  await sleep(240);
  await evaluate(`Array.from(document.querySelectorAll(".activity-card")).find((card) => card.textContent.includes("Addition"))?.click()`);
  await sleep(220);
  await evaluate(`document.querySelector(".format-option")?.click()`);
  await sleep(260);
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
  const hintFeedback = await evaluate(`document.querySelector(".feedback-banner")?.textContent?.replace(/\\s+/g, " ").trim()`);
  if (!hintFeedback?.includes("Robot Hana's hint for Linh:") || !hintFeedback.includes("That is okay. This try loses 2 points.") || /Robot Hana gợi ý|Chưa sao đâu|điểm|Thử lại/.test(hintFeedback)) throw new Error(`Gợi ý Robot Hana chưa được dịch English hoàn toàn: ${hintFeedback}`);
  console.log(JSON.stringify({ result, feedback, wrongResult, hintFeedback, status: "english feedback and hint valid" }));
} finally { socket.close(); }
