const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "gemma4:12b";

export interface OllamaStatus {
  available: boolean;
  models: string[];
  currentModel: string;
  error?: string;
}

export async function checkOllamaStatus(requestedModel?: string): Promise<OllamaStatus> {
  const modelToUse = requestedModel || DEFAULT_MODEL;
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) {
      return {
        available: false,
        models: [],
        currentModel: modelToUse,
        error: `Ollama returned status ${res.status}`,
      };
    }
    const data = await res.json();
    const models: string[] = (data.models || []).map((m: { name: string }) => m.name);
    const hasModel = models.some(
      (m) => m === modelToUse || m.startsWith(modelToUse) || modelToUse.startsWith(m.split(":")[0])
    );

    return {
      available: true,
      models,
      currentModel: modelToUse,
      error: hasModel ? undefined : `Model '${modelToUse}' not found. Available: ${models.join(", ") || "none"}`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      available: false,
      models: [],
      currentModel: modelToUse,
      error: `Could not connect to Ollama at ${OLLAMA_URL}: ${msg}`,
    };
  }
}

export interface ChatJSONOptions {
  model?: string;
  temperature?: number;
  fewShots?: Array<{ role: string; content: string }>;
  timeoutMs?: number;
}

export async function chatJSON<T>(
  systemPrompt: string,
  userMessage: string,
  schema?: object,
  options: ChatJSONOptions = {}
): Promise<T> {
  const model = options.model || DEFAULT_MODEL;
  const temperature = options.temperature ?? 0;
  const timeoutMs = options.timeoutMs ?? 120000;

  const messages: Array<{ role: string; content: string }> = [
    { role: "system", content: systemPrompt },
  ];

  if (options.fewShots && options.fewShots.length > 0) {
    messages.push(...options.fewShots);
  }

  messages.push({ role: "user", content: userMessage });

  const payload: Record<string, unknown> = {
    model,
    messages,
    stream: false,
    options: {
      temperature,
    },
  };

  if (schema) {
    payload.format = schema;
  }

  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Ollama chat error (${res.status}): ${errText || res.statusText}`);
  }

  const data = await res.json();
  const rawContent = data.message?.content;

  if (!rawContent || typeof rawContent !== "string") {
    throw new Error("Ollama returned an empty response");
  }

  // Strip possible markdown fences if small models enclose JSON
  let cleaned = rawContent.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(`Failed to parse LLM response as JSON: ${cleaned.slice(0, 200)}...`);
  }
}
