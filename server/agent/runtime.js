import { getProvider } from "./providers/index.js";
import { toolDefinitions, toolExecutors } from "./tools.js";
import { logger } from "../lib/logger.js";

const SYSTEM_PROMPT = `You are the Meal Prep Planner assistant. You can create, edit, delete, and view
meal plans and grocery lists, and update the user's profile, using the provided tools.
Never call delete_meal_plan or delete_grocery_list with confirmed=true unless the user has
explicitly confirmed the deletion earlier in this conversation — ask first.`;

const MAX_TOOL_ITERATIONS = 4;

// The whole point of running this inside a worker thread (see worker.js) is
// that a slow/hung LLM call or a buggy tool can never block the main
// process — so this function is free to loop and call out to the network
// without the rest of the app worrying about it.
export async function runAgent(userId, userMessage) {
  const provider = getProvider();
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage }
  ];

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
    const result = await provider.chat({ messages, tools: toolDefinitions });

    if (!result.toolCalls?.length) {
      return result.content ?? "";
    }

    messages.push({ role: "assistant", tool_calls: result.toolCalls, content: null });

    for (const call of result.toolCalls) {
      const executor = toolExecutors[call.name];
      let output;
      try {
        output = executor ? executor(userId, call.arguments ?? {}) : { error: `Unknown tool "${call.name}"` };
      } catch (error) {
        logger.error("agent tool failed", { userId, tool: call.name, error: error.message });
        output = { error: error.message };
      }
      messages.push({ role: "tool", tool_call_id: call.id, name: call.name, content: JSON.stringify(output) });
    }
  }

  return "I ran into trouble completing that action — please try rephrasing it.";
}
