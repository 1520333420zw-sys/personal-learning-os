import type { AIProvider } from "@/data/contracts/ai-provider";

export type AIProviderFailure = "transport" | "http" | "response_json" | "response_shape" | "model_json";

export class AIProviderError extends Error {
  constructor(public readonly kind: AIProviderFailure, public readonly details: { status?: number; providerCode?: string; providerType?: string; parameter?: string; finishReason?: string } = {}) {
    super(`AI provider ${kind} failure`);
  }
}

function safeField(value: unknown): string | undefined {
  return typeof value === "string" && /^[a-zA-Z0-9_.-]{1,100}$/.test(value) ? value : undefined;
}

export function configuredAIProvider(): AIProvider | null {
  const endpoint = process.env.AI_API_URL;
  const key = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;
  if (!endpoint || !key || !model) return null;
  if (!/^https:\/\//i.test(endpoint)) return null;
  return {
    async generateJson(system: string, prompt: string): Promise<unknown> {
      let response: Response;
      try { response = await fetch(endpoint, {
        method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, response_format: { type: "json_object" },
          messages: [{ role: "system", content: system }, { role: "user", content: prompt }] }),
        cache: "no-store", signal: AbortSignal.timeout(25000),
      }); } catch { throw new AIProviderError("transport"); }
      if (!response.ok) {
        let result: unknown;
        try { result = await response.json(); } catch { result = undefined; }
        const error = typeof result === "object" && result !== null && "error" in result ? result.error : undefined;
        const fields = typeof error === "object" && error !== null ? error as Record<string, unknown> : {};
        throw new AIProviderError("http", { status: response.status, providerCode: safeField(fields.code), providerType: safeField(fields.type), parameter: safeField(fields.param) });
      }
      let result: unknown;
      try { result = await response.json(); } catch { throw new AIProviderError("response_json", { status: response.status }); }
      const choices = typeof result === "object" && result !== null && "choices" in result ? result.choices : undefined;
      const first = Array.isArray(choices) ? choices[0] : undefined;
      const content = first?.message?.content;
      if (typeof content !== "string" || !content.trim()) throw new AIProviderError("response_shape", { status: response.status, finishReason: safeField(first?.finish_reason) });
      try { return JSON.parse(content); } catch { throw new AIProviderError("model_json", { status: response.status, finishReason: safeField(first?.finish_reason) }); }
    },
  };
}
