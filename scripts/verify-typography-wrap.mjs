import { readFile } from "node:fs/promises";

const [globalCss, collectiblesCss] = await Promise.all([
  readFile(new URL("../client/src/index.css", import.meta.url), "utf8"),
  readFile(new URL("../client/src/components/collectibles.css", import.meta.url), "utf8"),
]);
const css = `${globalCss}\n${collectiblesCss}`;
const requiredRoots = [
  ".welcome-screen",
  ".profile-screen",
  ".start-mode-screen",
  ".activity-screen",
  ".format-screen",
  ".test-setup-screen",
  ".mission-control",
  ".hana-learning-card",
  ".summary-screen",
];

for (const root of requiredRoots) {
  if (!css.includes(root)) throw new Error(`Thiếu phạm vi typography cho ${root}.`);
}
if (!css.includes("text-wrap: balance") || !css.includes("text-wrap: pretty")) {
  throw new Error("Thiếu quy tắc cân bằng hoặc làm đẹp ngắt dòng.");
}
for (const target of [".feedback-banner > div", ".hana-learning-step p", ".profile-screen h2", ".avatar-photo-upload-copy small"]) {
  const start = css.indexOf(target);
  const next = css.indexOf("}", start);
  if (start < 0 || !css.slice(start, next).includes("text-wrap")) {
    throw new Error(`Thiếu text-wrap cho vùng chữ trọng yếu: ${target}.`);
  }
}

console.log(JSON.stringify({ roots: requiredRoots.length, status: "typography wrap rules cover key screens" }));
