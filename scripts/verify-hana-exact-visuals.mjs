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
const parseEquation = (expression, answer) => {
  const match = expression.match(/^\s*(\?|\d+)\s*([+−×÷])\s*(\?|\d+)\s*=\s*(\?|\d+)\s*$/);
  if (!match) throw new Error(`Không tách được phép tính: ${expression}`);
  const resolve = token => token === "?" ? answer : Number(token);
  return { first: resolve(match[1]), operator: match[2], second: resolve(match[3]), result: resolve(match[4]), missing: match[1] === "?" ? "first" : match[3] === "?" ? "second" : "result" };
};

try {
  const reports = [];
  for (const operation of ["add", "subtract", "multiply", "divide"]) {
    await command("Page.navigate", { url: `http://localhost:3000/?hanaguide&missing=${operation}&lang=vi&nowebgl` });
    await waitFor(".hana-learning-card");
    const details = await evaluate(`(() => ({ expression: document.querySelector(".hana-learning-context strong")?.textContent?.trim(), answer: Number((document.querySelector(".hana-learning-context span")?.textContent?.match(/(\\d+)$/) ?? [])[1]) }))()`);
    const equation = parseEquation(details.expression, details.answer);
    for (let step = 0; step < 3; step += 1) {
      await evaluate(`document.querySelector(".hana-primary-action")?.click()`);
      await sleep(55);
    }
    const visual = await evaluate(`(() => ({ text: document.querySelector(".hana-math-visual")?.textContent?.replace(/\\s+/g, " ").trim(), groupCount: document.querySelectorAll(".hana-equal-groups .hana-group").length, hidden: document.querySelectorAll(".hana-quantity.is-hidden").length }))()`);
    if (visual.hidden !== 0) throw new Error(`Minh họa ${operation} vẫn che số sau bài mẫu: ${JSON.stringify(visual)}`);
    const numbers = operation === "add"
      ? [equation.result, equation.answer].filter(Number.isFinite)
      : operation === "subtract"
        ? [equation.first, equation.second, equation.result].filter(Number.isFinite)
        : [equation.first, equation.second, equation.result].filter(Number.isFinite);
    if (!numbers.some(number => visual.text.includes(String(number)))) throw new Error(`Minh họa ${operation} không chứa số của câu: ${JSON.stringify({ equation, visual })}`);
    if (operation === "multiply" && visual.groupCount !== (equation.missing === "first" ? equation.second : equation.first)) {
      throw new Error(`Số nhóm nhân không khớp câu ${details.expression}: ${JSON.stringify({ equation, visual })}`);
    }
    reports.push({ operation, expression: details.expression, visual: visual.text, groupCount: visual.groupCount });
  }
  console.log(JSON.stringify({ reports, status: "Hana visuals match each missing-component question" }));
} finally {
  socket.close();
}
