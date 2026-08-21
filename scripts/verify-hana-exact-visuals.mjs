const debugPort = process.env.CDP_PORT ?? "9222";
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then(response => response.json());
const page = targets.find(target => target.type === "page");
if (!page?.webSocketDebuggerUrl) throw new Error("Không tìm thấy tab để kiểm thử minh họa Hana.");

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
  for (let attempt = 0; attempt < 35; attempt += 1) {
    if (await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)) return;
    await sleep(100);
  }
  throw new Error(`Không tìm thấy ${selector}`);
};
try {
  const reports = [];
  for (const operation of ["add", "subtract", "multiply", "divide"]) {
    await command("Page.navigate", { url: `http://localhost:3000/?hanaguide&missing=${operation}&lang=vi&nowebgl` });
    await waitFor(".hana-learning-card");
    const initial = await evaluate(`(() => ({ label: document.querySelector(".hana-learning-step > span")?.textContent?.trim(), action: document.querySelector(".hana-primary-action")?.textContent?.replace(/\\s+/g, " ").trim(), hasVisual: Boolean(document.querySelector(".hana-math-visual")), text: document.querySelector(".hana-learning-card")?.textContent?.replace(/\\s+/g, " ").trim() }))()`);
    if (initial.hasVisual || initial.text?.includes("Bài mẫu")) {
      throw new Error(`Cửa sổ Hana ${operation} vẫn chứa hình minh họa hoặc bài mẫu: ${JSON.stringify(initial)}`);
    }
    if (initial.label !== "Bước 1/3" || !initial.action?.includes("Bước tiếp")) {
      throw new Error(`Cửa sổ Hana ${operation} không bắt đầu đúng tại Bước 1/3: ${JSON.stringify(initial)}`);
    }
    for (let step = 0; step < 2; step += 1) {
      await evaluate(`document.querySelector(".hana-primary-action")?.click()`);
      await sleep(55);
    }
    const finalStep = await evaluate(`(() => ({ label: document.querySelector(".hana-learning-step > span")?.textContent?.trim(), action: document.querySelector(".hana-primary-action")?.textContent?.replace(/\\s+/g, " ").trim(), hasVisual: Boolean(document.querySelector(".hana-math-visual")), text: document.querySelector(".hana-learning-card")?.textContent?.replace(/\\s+/g, " ").trim() }))()`);
    if (finalStep.hasVisual || finalStep.text?.includes("Bài mẫu")) {
      throw new Error(`Cửa sổ Hana ${operation} lại hiển thị hình minh họa hoặc bài mẫu ở bước cuối: ${JSON.stringify(finalStep)}`);
    }
    if (finalStep.label !== "Bước 3/3" || !finalStep.action?.includes("Thử lại câu này")) {
      throw new Error(`Cửa sổ Hana ${operation} chưa dừng ở Bước 3/3 để học sinh tự thử lại: ${JSON.stringify(finalStep)}`);
    }
    reports.push({ operation, initialStep: initial.label, finalStep: finalStep.label });
  }
  for (const operation of ["multiply", "divide"]) {
    await command("Page.navigate", { url: `http://localhost:3000/?hanaguide&operation=${operation}&difficulty=easy&lang=vi&nowebgl` });
    await waitFor(".hana-learning-card");
    const contextualSteps = [];
    for (let step = 0; step < 3; step += 1) {
      contextualSteps.push(await evaluate(`(() => ({ equation: document.querySelector(".hana-learning-card")?.textContent?.match(/(\\d+) × (\\d+) = \\?/)?.slice(1), label: document.querySelector(".hana-learning-step > span")?.textContent?.trim(), text: document.querySelector(".hana-learning-step p")?.textContent?.trim() ?? "" }))()`));
      if (step < 2) {
        await evaluate(`document.querySelector(".hana-primary-action")?.click()`);
        await sleep(55);
      }
    }
    if (contextualSteps[0].label !== "Bước 1/3" || contextualSteps[2].label !== "Bước 3/3") {
      throw new Error(`Gợi ý ${operation} cơ bản không có đúng ba bước: ${JSON.stringify(contextualSteps)}`);
    }
    if (operation === "multiply") {
      const [factor, groups] = contextualSteps[0].equation ?? [];
      if (!factor || !groups || !contextualSteps[0].text.includes(`có ${groups}`) || !contextualSteps[0].text.includes(`có ${factor}`) || !contextualSteps[1].text.includes(`lấy ${factor} lặp lại ${groups} lần`) || !contextualSteps[2].text.includes("Dùng bảng nhân")) {
        throw new Error(`Gợi ý nhân cơ bản đảo vai trò số nhóm/số phần tử hoặc thiếu kiểm tra: ${JSON.stringify(contextualSteps)}`);
      }
    } else if (!contextualSteps[0].text.includes("được chia đều") || !contextualSteps[1].text.includes("số còn thiếu") || !contextualSteps[2].text.includes("Dùng bảng nhân")) {
      throw new Error(`Gợi ý chia cơ bản chưa nêu chia đều theo nhóm và kiểm tra: ${JSON.stringify(contextualSteps)}`);
    }
    reports.push({ operation: `${operation}-equal-groups`, initialStep: contextualSteps[0].label, finalStep: contextualSteps[2].label });
  }
  await command("Page.navigate", { url: "http://localhost:3000/?hanaguide&operation=multiply&difficulty=challenge&lang=vi&nowebgl" });
  await waitFor(".hana-learning-card");
  const challengeSteps = [];
  for (let step = 0; step < 4; step += 1) {
    const page = await evaluate(`(() => ({ label: document.querySelector(".hana-learning-step > span")?.textContent?.trim(), action: document.querySelector(".hana-primary-action")?.textContent?.replace(/\\s+/g, " ").trim(), hasVisual: Boolean(document.querySelector(".hana-math-visual")), text: document.querySelector(".hana-learning-step p")?.textContent?.trim() ?? "" }))()`);
    if (page.hasVisual || page.text.includes("Bài mẫu")) {
      throw new Error(`Phép nhân Thám hiểm chứa hình minh họa hoặc bài mẫu: ${JSON.stringify(page)}`);
    }
    challengeSteps.push(page);
    if (step < 3) {
      await evaluate(`document.querySelector(".hana-primary-action")?.click()`);
      await sleep(55);
    }
  }
  const expectedClues = ["Đặt tính", "hàng đơn vị", "các hàng còn lại", "Kiểm tra"];
  if (
    challengeSteps[0].label !== "Bước 1/4" ||
    challengeSteps[3].label !== "Bước 4/4" ||
    !challengeSteps[3].action?.includes("Thử lại câu này") ||
    expectedClues.some((clue, index) => !challengeSteps[index].text.includes(clue))
  ) {
    throw new Error(`Phép nhân Thám hiểm chưa có đủ bốn bước đặt tính đúng thứ tự: ${JSON.stringify(challengeSteps)}`);
  }
  reports.push({ operation: "multiply-challenge", initialStep: challengeSteps[0].label, finalStep: challengeSteps[3].label });
  console.log(JSON.stringify({ reports, status: "Hana guides use three written steps normally and four answer-safe column-method steps for challenging multiplication" }));
} finally {
  socket.close();
}
