import type { AIProvider } from "@/data/contracts/ai-provider";

export function configuredAIProvider(): AIProvider | null {
  const endpoint = process.env.AI_API_URL;
  const key = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;
  if (!endpoint || !key || !model) return null;
  if (!/^https:\/\//i.test(endpoint)) return null;
  return {
    async generateJson(system: string, prompt: string): Promise<unknown> {
      const response = await fetch(endpoint, {
        method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, temperature: 0, response_format: { type: "json_object" },
          messages: [{ role: "system", content: system }, { role: "user", content: prompt }] }),
        cache: "no-store", signal: AbortSignal.timeout(25000),
      });
      if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
      const result: unknown = await response.json();
      const content = (result as { choices?: { message?: { content?: unknown } }[] }).choices?.[0]?.message?.content;
      if (typeof content !== "string") throw new Error("AI provider returned no JSON content");
      return JSON.parse(content);
    },
  };
}
