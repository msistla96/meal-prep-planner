// Default provider: zero setup, no API key, deterministic. This is what the
// app runs on out of the box, and what backs the LLM_PROVIDER=mock (default)
// setting. Swap LLM_PROVIDER=openai-compatible to use a real model instead.
function lastUserMessage(messages) {
  return [...messages].reverse().find((message) => message.role === "user");
}

export const mockProvider = {
  name: "mock",
  async chat({ messages }) {
    const last = messages[messages.length - 1];

    if (last.role === "tool") {
      return { content: "I drafted a meal plan using your proteins, cuisines, and current groceries." };
    }

    const content = (lastUserMessage(messages)?.content ?? "").toLowerCase();

    if (content.includes("create") && content.includes("meal")) {
      return {
        toolCalls: [
          {
            id: "call_1",
            name: "create_meal_plan",
            arguments: {
              name: "Agent generated plan",
              meals: [
                {
                  name: "Paneer rice bowl",
                  cuisine: "Indian",
                  servings: 2,
                  ingredients: ["Paneer", "Rice", "Spinach"],
                  recipe: ["Cook rice", "Sear paneer", "Assemble with greens"]
                }
              ]
            }
          }
        ]
      };
    }

    if (content.includes("grocery")) {
      return {
        content: "Your grocery list has spinach and yogurt expiring soon. Add vegetables for two more dinners."
      };
    }

    return { content: "I can help with meal plans, grocery lists, or profile changes." };
  }
};
