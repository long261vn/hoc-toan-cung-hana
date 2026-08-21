const debugPort = process.env.CDP_PORT ?? "9222";
const baseUrl = "http://localhost:3000";
const viewports = [
  { name: "desktop", width: 1280, height: 720 },
  { name: "mobile", width: 375, height: 812 },
];
const cases = [
  { name: "welcome", url: "?nowebgl", selector: ".welcome-screen" },
  { name: "profile", url: "?profile&nowebgl", selector: ".profile-screen" },
  { name: "start-mode", url: "?menu&nowebgl", selector: ".start-mode-screen" },
  { name: "activities", url: "?activities&nowebgl", selector: ".activity-screen" },
  { name: "format", url: "?format=add&nowebgl", selector: ".format-screen" },
  { name: "test-setup", url: "?testsetup&nowebgl", selector: ".test-setup-screen" },
  { name: "game", url: "?demo&nowebgl", selector: ".mission-control" },
  { name: "summary", url: "?summary&nowebgl", selector: ".summary-screen" },
  { name: "guide", url: "?guide&nowebgl", selector: ".guide-card" },
  { name: "score", url: "?score&nowebgl", selector: ".score-card" },
  { name: "end-confirm", url: "?endconfirm&nowebgl", selector: ".end-session-confirm-card" },
  { name: "home-confirm", url: "?homeconfirm&nowebgl", selector: ".home-confirm-card" },
  { name: "hana", url: "?hanaguide&operation=multiply&difficulty=challenge&nowebgl", selector: ".hana-learning-card" },
  { name: "timed-summary", url: "?testsummary&nowebgl", selector: ".summary-screen" },
];

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then(response => response.json());
const page = targets.find(target => target.type === "page");
if (!page?.webSocketDebuggerUrl) throw new Error("Không tìm thấy Chromium để kiểm thử typography overlay.");

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
    throw new Error(
      response.exceptionDetails.exception?.description ??
        response.exceptionDetails.text ??
        "Lỗi evaluate khi kiểm thử typography."
    );
  }
  return response.result?.value;
};
const waitFor = async selector => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)) return;
    await sleep(100);
  }
  throw new Error(`Không tìm thấy ${selector}`);
};

try {
  const evidence = [];
  for (const viewport of viewports) {
    await command("Emulation.setDeviceMetricsOverride", {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: viewport.name === "mobile",
    });
    for (const scenario of cases) {
      await command("Page.navigate", { url: `${baseUrl}/${scenario.url}` });
      await waitFor(scenario.selector);
      const overflow = await evaluate(`(() => {
        const root = document.querySelector(${JSON.stringify(scenario.selector)});
        if (!root) return [];
        const textTargets = Array.from(root.querySelectorAll("h1,h2,h3,p,button,small,strong,em"))
          .filter(node => !node.querySelector("h1,h2,h3,p,button,small,strong,em"));
        const hasTextOverflow = element => {
          const boundary = element.getBoundingClientRect();
          const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
          let textNode;
          while ((textNode = walker.nextNode())) {
            const text = textNode.textContent ?? "";
            for (const match of text.matchAll(/\\S+/g)) {
              if (!/[A-Za-zÀ-ỹ0-9]/.test(match[0])) continue;
              const range = document.createRange();
              range.setStart(textNode, match.index);
              range.setEnd(textNode, match.index + match[0].length);
              for (const rect of range.getClientRects()) {
                if (rect.left < boundary.left - 1 || rect.right > boundary.right + 1) return true;
              }
            }
          }
          return false;
        };
        return textTargets
          .filter(node => (node.textContent ?? "").trim() && hasTextOverflow(node))
          .map(node => ({ tag: node.tagName, text: (node.textContent ?? "").replace(/\\s+/g, " ").trim() }));
      })()`);
      if (overflow.length) {
        throw new Error(`${scenario.name} ở ${viewport.name} có chữ tràn ngang: ${JSON.stringify(overflow)}`);
      }

      const orphans = await evaluate(`(() => {
        const root = document.querySelector(${JSON.stringify(scenario.selector)});
        if (!root) return [];
        const textTargets = Array.from(root.querySelectorAll("h1,h2,h3,p,button,small,strong,em"))
          .filter(node => !node.querySelector("h1,h2,h3,p,button,small,strong,em"));
        const linesFor = element => {
          const groups = new Map();
          const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
          let textNode;
          while ((textNode = walker.nextNode())) {
            const text = textNode.textContent ?? "";
            for (const match of text.matchAll(/\\S+/g)) {
              if (!/[A-Za-zÀ-ỹ0-9]/.test(match[0])) continue;
              const range = document.createRange();
              range.setStart(textNode, match.index);
              range.setEnd(textNode, match.index + match[0].length);
              const rect = range.getClientRects()[0];
              if (!rect || !rect.width || !rect.height) continue;
              const key = Math.round(rect.top * 2) / 2;
              groups.set(key, (groups.get(key) ?? 0) + 1);
            }
          }
          return [...groups.entries()].sort((a, b) => a[0] - b[0]).map(([, count]) => count);
        };
        return textTargets
          .map(node => ({
            tag: node.tagName,
            text: (node.textContent ?? "").replace(/\\s+/g, " ").trim(),
            lines: linesFor(node),
          }))
          .filter(node => node.text.split(" ").length > 2 && node.lines.length > 1 && node.lines.at(-1) === 1);
      })()`);
      if (orphans.length) {
        throw new Error(`${scenario.name} ở ${viewport.name} có dòng cuối chỉ một từ: ${JSON.stringify(orphans)}`);
      }
      evidence.push(`${viewport.name}:${scenario.name}`);
    }
  }
  console.log(JSON.stringify({ checked: evidence, status: "overlay typography has no horizontal text overflow or orphan lines" }));
} finally {
  await command("Emulation.clearDeviceMetricsOverride");
  socket.close();
}
