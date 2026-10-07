import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import * as fflate from "fflate";

const source = fs.readFileSync("src/features/learning-experience/mind-map-import.ts", "utf8");
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const compiledModule = { exports: {} };
new Function("module", "exports", "require", code)(compiledModule, compiledModule.exports, (name) => {
  if (name === "fflate") return fflate;
  throw new Error(`Unexpected import ${name}`);
});

const { parseMindMapFile, mindMapNodeCount } = compiledModule.exports;

const markdown = new File([
  "# 第一章\n## 第一节\n- 知识点 A\n- 知识点 B\n## 第二节\n",
], "chapter.md", { type: "text/markdown" });
const parsedMarkdown = await parseMindMapFile(markdown);
assert.equal(parsedMarkdown.format, "md");
assert.equal(parsedMarkdown.tree.title, "第一章");
assert.equal(parsedMarkdown.tree.children[0].title, "第一节");
assert.equal(mindMapNodeCount(parsedMarkdown.tree), 5);

const xmindContent = JSON.stringify([{ rootTopic: { title: "Root", children: { attached: [{ title: "Branch" }] } } }]);
const xmind = new File([fflate.zipSync({ "content.json": fflate.strToU8(xmindContent) })], "chapter.xmind");
const parsedXmind = await parseMindMapFile(xmind);
assert.equal(parsedXmind.format, "xmind");
assert.equal(parsedXmind.tree.title, "Root");
assert.equal(parsedXmind.tree.children[0].title, "Branch");

await assert.rejects(() => parseMindMapFile(new File(["text"], "chapter.txt")), /UNSUPPORTED_FORMAT/);
console.log("Mind-map Markdown and XMind parsing, tree preservation and format rejection: passed");
