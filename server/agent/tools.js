import * as mealPlans from "../services/mealPlans.js";
import * as groceryLists from "../services/groceryLists.js";
import * as profile from "../services/profile.js";

// Tool schemas follow the OpenAI function-calling shape, which is also what
// every OpenAI-compatible gateway (Groq, Together, OpenRouter, local
// Ollama/vLLM, etc.) expects — so any provider that speaks that protocol can
// drive these same tools untouched.
export const toolDefinitions = [
  {
    type: "function",
    function: {
      name: "list_meal_plans",
      description: "List the user's meal plans.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "create_meal_plan",
      description: "Create a new meal plan with one or more meals.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          date: { type: "string", description: "ISO date, e.g. 2026-08-10" },
          meals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                cuisine: { type: "string" },
                servings: { type: "number" },
                ingredients: { type: "array", items: { type: "string" } },
                recipe: { type: "array", items: { type: "string" } }
              },
              required: ["name"]
            }
          }
        },
        required: ["name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "edit_meal_plan",
      description: "Edit an existing meal plan's name, date, or meals.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          date: { type: "string" },
          meals: { type: "array", items: { type: "object" } }
        },
        required: ["id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_meal_plan",
      description:
        "Delete a meal plan. Only pass confirmed=true after the user has explicitly confirmed the deletion in this conversation.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string" },
          confirmed: { type: "boolean" }
        },
        required: ["id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "list_grocery_lists",
      description: "List the user's grocery lists and their items.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "create_grocery_list",
      description: "Create a new grocery list.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          source: { type: "string", enum: ["Manual", "PDF", "Image", "Text"] }
        },
        required: ["name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "edit_grocery_list",
      description: "Rename a grocery list or change its source.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          source: { type: "string" }
        },
        required: ["id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_grocery_list",
      description:
        "Delete a grocery list. Only pass confirmed=true after the user has explicitly confirmed the deletion in this conversation.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string" },
          confirmed: { type: "boolean" }
        },
        required: ["id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_profile",
      description: "Update the user's profile (diet preferences, cuisines, proteins, lifestyle, etc.).",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "string" },
          gender: { type: "string" },
          lifestyle: { type: "string", enum: ["Active", "Sedentary", "Semi active"] },
          allergies: { type: "string" },
          cuisines: { type: "string" },
          proteins: { type: "string" },
          dietType: { type: "string" }
        }
      }
    }
  }
];

export const toolExecutors = {
  list_meal_plans: (userId) => mealPlans.listMealPlans(userId),
  create_meal_plan: (userId, args) => mealPlans.createMealPlan(userId, args, "agent"),
  edit_meal_plan: (userId, { id, ...updates }) => mealPlans.updateMealPlan(userId, id, updates),
  delete_meal_plan: (userId, { id, confirmed }) => {
    if (!confirmed) return { needsConfirmation: true, message: "Ask the user to confirm before deleting." };
    return { deleted: mealPlans.deleteMealPlan(userId, id) };
  },

  list_grocery_lists: (userId) => groceryLists.listGroceryLists(userId),
  create_grocery_list: (userId, args) => groceryLists.createGroceryList(userId, args),
  edit_grocery_list: (userId, { id, ...updates }) => groceryLists.updateGroceryList(userId, id, updates),
  delete_grocery_list: (userId, { id, confirmed }) => {
    if (!confirmed) return { needsConfirmation: true, message: "Ask the user to confirm before deleting." };
    return { deleted: groceryLists.deleteGroceryList(userId, id) };
  },

  update_profile: (userId, args) => {
    const current = profile.getProfile(userId).profile;
    return profile.saveProfile(userId, { ...current, ...args });
  }
};
