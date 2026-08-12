// Every LLM provider implements this one method:
//
//   chat({ messages, tools }) => Promise<{ content?: string, toolCalls?: Array<{ id?, name, arguments }> }>
//
// - `messages` is the OpenAI-style transcript: { role: "system"|"user"|"assistant"|"tool", content, ... }
// - `tools` is the OpenAI function-calling tool list (server/agent/tools.js).
// - Return `content` for a plain reply, or `toolCalls` to ask the runtime to
//   execute one or more tools and call `chat` again with the results appended.
//
// Swapping providers is just changing LLM_PROVIDER (see providers/index.js) —
// the runtime and tool set never change.
export function assertProvider(provider) {
  if (typeof provider?.chat !== "function") {
    throw new Error(`LLM provider "${provider?.name}" must implement chat({ messages, tools })`);
  }
  return provider;
}
