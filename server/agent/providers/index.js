import { assertProvider } from "./provider.js";
import { mockProvider } from "./mockProvider.js";
import { openAiCompatibleProvider } from "./openAiCompatibleProvider.js";

const providers = {
  mock: mockProvider,
  "openai-compatible": openAiCompatibleProvider
};

export function getProvider() {
  const name = process.env.LLM_PROVIDER ?? "mock";
  const provider = providers[name];
  if (!provider) throw new Error(`Unknown LLM_PROVIDER "${name}". Valid: ${Object.keys(providers).join(", ")}`);
  return assertProvider(provider);
}
