// Talks to any OpenAI-compatible chat-completions endpoint — covers OpenAI
// itself plus the gateways most open models (Kimi, Qwen, Gemini, Llama, …)
// are actually served through: Groq, Together, OpenRouter, a local
// Ollama/vLLM instance, etc. Point LLM_BASE_URL/LLM_MODEL/LLM_API_KEY at
// whichever one you want; no code change needed to switch models.
const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const REQUEST_TIMEOUT_MS = 20_000;

export const openAiCompatibleProvider = {
  name: "openai-compatible",
  async chat({ messages, tools }) {
    const baseUrl = process.env.LLM_BASE_URL ?? DEFAULT_BASE_URL;
    const apiKey = process.env.LLM_API_KEY;
    const model = process.env.LLM_MODEL ?? "gpt-4o-mini";
    if (!apiKey) throw new Error("LLM_API_KEY is required for LLM_PROVIDER=openai-compatible");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({ model, messages, tools }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`LLM request failed: ${response.status} ${await response.text()}`);
      }

      const body = await response.json();
      const choice = body.choices?.[0]?.message;
      if (!choice) throw new Error("LLM response had no message");

      if (choice.tool_calls?.length) {
        return {
          toolCalls: choice.tool_calls.map((call) => ({
            id: call.id,
            name: call.function.name,
            arguments: JSON.parse(call.function.arguments || "{}")
          }))
        };
      }

      return { content: choice.content ?? "" };
    } finally {
      clearTimeout(timeout);
    }
  }
};
