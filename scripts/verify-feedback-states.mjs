const debugPort = process.env.CDP_PORT ?? "9222";
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then(response => response.json());
const page = targets.find(target => target.type === "page");

if (!page?.webSocketDebuggerUrl) {
  throw new Error("Không tìm thấy tab để kiểm thử phản hồi đáp án.");
}

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let messageId = 0;
const pending = new Map();
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  const handler = pending.get(message.id);
  if (!handler) return;
  pending.delete(message.id);
  message.error ? handler.reject(new Error(message.error.message)) : handler.resolve(message.result);
});

const command = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++messageId;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => (await command("Runtime.evaluate", { expression, returnByValue: true })).result?.value;
const waitFor = async selector => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)) return;
    await sleep(100);
  }
  throw new Error(`Không tìm thấy ${selector}`);
};

try {
  await command("Page.navigate", { url: "http://localhost:3000/?hanaguide&operation=multiply&difficulty=easy&lang=vi&nowebgl" });
  await waitFor(".hana-learning-card");

  const hanaContext = await evaluate(`(() => ({
    label: document.querySelector(".hana-chosen-answer small")?.textContent?.trim(),
    value: document.querySelector(".hana-chosen-answer b")?.textContent?.trim(),
    hasErrorCard: Boolean(document.querySelector(".hana-chosen-answer"))
  }))()`);
  if (!hanaContext.hasErrorCard || hanaContext.label !== "Bạn đã chọn" || !hanaContext.value) {
    throw new Error(`Thẻ đáp án đã chọn trong Hana chưa rõ ràng: ${JSON.stringify(hanaContext)}`);
  }

  await evaluate(`document.querySelector(".hana-retry-now")?.click()`);
  await waitFor(".answer-button");
  const answerState = await evaluate(`(() => {
    const expression = document.querySelector(".math-expression")?.textContent?.trim() ?? "";
    const [, left, right] = expression.match(/(\\d+) × (\\d+)/) ?? [];
    const answer = Number(left) * Number(right);
    const options = [...document.querySelectorAll(".answer-button")].map(button => ({
      element: button,
      value: Number(button.querySelector("strong")?.textContent?.trim())
    }));
    const wrong = options.find(option => option.value !== answer);
    const correct = options.find(option => option.value === answer);
    wrong?.element.click();
    return { expression, answer, wrong: wrong?.value, correct: correct?.value };
  })()`);
  await waitFor(".feedback-banner.is-wrong");
  const wrongFeedback = await evaluate(`(() => ({
    text: document.querySelector(".feedback-banner.is-wrong")?.textContent?.replace(/\\s+/g, " ").trim(),
    actionCount: document.querySelectorAll(".wrong-feedback-actions button").length,
    display: getComputedStyle(document.querySelector(".wrong-feedback-actions")).display,
    selectedWrong: Boolean(document.querySelector(".answer-button.is-wrong"))
  }))()`);
  if (
    !wrongFeedback.text?.includes("Chưa đúng") ||
    !wrongFeedback.text?.includes("−2 điểm") ||
    wrongFeedback.actionCount !== 2 ||
    wrongFeedback.display !== "flex" ||
    !wrongFeedback.selectedWrong
  ) {
    throw new Error(`Phản hồi sai không đạt phân cấp gọn và rõ: ${JSON.stringify(wrongFeedback)}`);
  }

  await evaluate(`document.querySelector(".feedback-action.is-retry")?.click()`);
  await waitFor(".answer-button");
  await evaluate(`(() => {
    const expected = ${JSON.stringify(answerState.correct)};
    [...document.querySelectorAll(".answer-button")]
      .find(button => Number(button.querySelector("strong")?.textContent?.trim()) === expected)
      ?.click();
  })()`);
  await waitFor(".feedback-banner.is-correct");
  const correctFeedback = await evaluate(`document.querySelector(".feedback-banner.is-correct")?.textContent?.replace(/\\s+/g, " ").trim()`);
  if (!correctFeedback?.includes("Đúng rồi") || !correctFeedback.includes("+10 điểm")) {
    throw new Error(`Phản hồi đúng bị ảnh hưởng sau khi sửa banner: ${JSON.stringify(correctFeedback)}`);
  }

  console.log(JSON.stringify({
    status: "Đã xác nhận phản hồi đúng/sai và thẻ đáp án đã chọn của Hana",
    expression: answerState.expression,
    wrongChoice: answerState.wrong,
    correctChoice: answerState.correct,
  }));
} finally {
  socket.close();
}
