import { strFromU8, unzipSync } from "fflate";
import type { ImportedMindMapNode } from "@/domain/beta";

export type MindMapFormat = "xmind" | "md" | "opml";

const node = (title: string, path: string, children: ImportedMindMapNode[] = []): ImportedMindMapNode => ({ id: `mind-node-${path}`, title: title.trim(), children });

function xmindTopic(topic: Record<string, unknown>, path: string): ImportedMindMapNode {
  const attached = (topic.children as { attached?: Record<string, unknown>[] } | undefined)?.attached ?? [];
  return node(String(topic.title ?? "Untitled"), path, attached.map((child, index) => xmindTopic(child, `${path}-${index}`)));
}

function parseMarkdown(text: string, fallback: string) {
  const root = node(fallback, "root"); const stack: { depth: number; item: ImportedMindMapNode }[] = [{ depth: -1, item: root }];
  for (const [index, raw] of text.split(/\r?\n/).entries()) {
    if (!raw.trim()) continue;
    const heading = raw.match(/^(#{1,6})\s+(.+)$/); const bullet = raw.match(/^(\s*)[-*+]\s+(.+)$/);
    const depth = heading ? heading[1].length - 1 : bullet ? Math.floor(bullet[1].replace(/\t/g, "  ").length / 2) + 1 : 1;
    const title = heading?.[2] ?? bullet?.[2] ?? raw.trim();
    while (stack.at(-1)!.depth >= depth) stack.pop();
    const item = node(title, `${stack.at(-1)!.item.id}-${index}`); stack.at(-1)!.item.children.push(item); stack.push({ depth, item });
  }
  if (root.children.length === 1 && root.children[0].children.length) return root.children[0];
  if (!root.children.length) throw new Error("EMPTY_MIND_MAP"); return root;
}

function parseOpml(text: string, fallback: string) {
  const xml = new DOMParser().parseFromString(text, "application/xml");
  if (xml.querySelector("parsererror")) throw new Error("INVALID_OPML");
  const convert = (element: Element, path: string): ImportedMindMapNode => node(element.getAttribute("text") || element.getAttribute("title") || "Untitled", path, [...element.children].filter((child) => child.tagName.toLowerCase() === "outline").map((child, index) => convert(child, `${path}-${index}`)));
  const outlines = [...xml.querySelectorAll("body > outline")];
  if (!outlines.length) throw new Error("EMPTY_MIND_MAP");
  return outlines.length === 1 ? convert(outlines[0], "root") : node(fallback, "root", outlines.map((item, index) => convert(item, `root-${index}`)));
}

export async function parseMindMapFile(file: File): Promise<{ format: MindMapFormat; tree: ImportedMindMapNode }> {
  const extension = file.name.split(".").pop()?.toLowerCase() as MindMapFormat | undefined;
  if (!extension || !["xmind", "md", "opml"].includes(extension)) throw new Error("UNSUPPORTED_FORMAT");
  if (extension === "md") return { format: extension, tree: parseMarkdown(await file.text(), file.name.replace(/\.md$/i, "")) };
  if (extension === "opml") return { format: extension, tree: parseOpml(await file.text(), file.name.replace(/\.opml$/i, "")) };
  const archive = unzipSync(new Uint8Array(await file.arrayBuffer()));
  const content = archive["content.json"];
  if (content) {
    const sheets = JSON.parse(strFromU8(content)) as { rootTopic?: Record<string, unknown> }[];
    if (!sheets[0]?.rootTopic) throw new Error("INVALID_XMIND");
    return { format: extension, tree: xmindTopic(sheets[0].rootTopic, "root") };
  }
  throw new Error("UNSUPPORTED_XMIND_VERSION");
}

export function mindMapNodeCount(root: ImportedMindMapNode): number { return 1 + root.children.reduce((sum, child) => sum + mindMapNodeCount(child), 0); }
